'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import { useName } from '@/lib/useName'
import { processImage, isHeic, MAX_RAW_SIZE } from '@/lib/imageProcess'
import type { ChallengeView, ChallengeLeaderboardEntry, ChallengeParticipant, WeeklyChallenge } from '@/types'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'
const TYPE_LABELS: Record<string, string> = { cardio: '🏃 CARDIO', strength: '💪 STRENGTH' }
const TYPE_COLORS: Record<string, string> = { cardio: '#FF4444', strength: '#4488FF' }

function ExerciseProgress({ participant, challenge }: {
  participant: ChallengeParticipant
  challenge: ChallengeView['challenge']
}) {
  if (!challenge) return null
  const reqs = challenge.exerciseRequirements
  const typeCounts = participant.exerciseTypeCounts ?? {}

  if (IS_EXERCISE && reqs && Object.keys(reqs).length > 0) {
    const validTypes = Object.entries(reqs).filter(([type]) => type === 'cardio' || type === 'strength')
    if (validTypes.length === 0) return null
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
        {validTypes.map(([type, required]) => {
          const count = typeCounts[type] ?? 0
          const met = count >= (required as number)
          return (
            <span key={type} style={{ color: met ? '#00CC00' : TYPE_COLORS[type] ?? 'var(--crt-amber)' }}>
              {TYPE_LABELS[type] ?? type.toUpperCase()}: {count}/{required as number} {met && '✓'}
            </span>
          )
        })}
        <span style={{ color: 'var(--amiga-dark-grey)' }}>
          (TOTAL: {participant.exerciseCount})
        </span>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: 'var(--font-pixel)',
      fontSize: '7px',
      color: participant.exerciseCount >= challenge.exerciseMinimum ? '#00CC00' : 'var(--crt-amber)',
    }}>
      EXERCISES: {participant.exerciseCount}/{challenge.exerciseMinimum}
      {participant.exerciseCount >= challenge.exerciseMinimum && ' ✓'}
    </div>
  )
}

function ChallengeRequirementLabel({ challenge }: { challenge: ChallengeView['challenge'] }) {
  if (!challenge) return null
  const reqs = challenge.exerciseRequirements
  if (IS_EXERCISE && reqs && Object.keys(reqs).length > 0) {
    const parts = Object.entries(reqs)
      .filter(([type]) => type === 'cardio' || type === 'strength')
      .map(([type, n]) => `${n} ${TYPE_LABELS[type] ?? type.toUpperCase()}`)
    if (parts.length > 0) return <>{`COMPLETE ALL PHOTO BINGO ITEMS + LOG ${parts.join(' + ')}`}</>
  }
  return <>COMPLETE ALL PHOTO BINGO ITEMS + LOG {challenge.exerciseMinimum}+ EXERCISES</>
}

export default function ChallengePage() {
  const { name } = useName()
  const [view, setView] = useState<ChallengeView | null>(null)
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>([])
  const [allChallenges, setAllChallenges] = useState<WeeklyChallenge[]>([])
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null) // null = current week
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedBingoItem, setSelectedBingoItem] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxLabel, setLightboxLabel] = useState<string>('')

  const fetchChallengeList = useCallback(async () => {
    try {
      const res = await fetch('/api/challenge/admin')
      if (res.ok) setAllChallenges(await res.json())
    } catch { /* silent */ }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const weekParam = selectedWeek ? `?weekKey=${encodeURIComponent(selectedWeek)}` : ''
      const [viewRes, lbRes] = await Promise.all([
        fetch(`/api/challenge${weekParam}`),
        fetch('/api/challenge/leaderboard'),
      ])
      if (viewRes.ok) setView(await viewRes.json())
      if (lbRes.ok) setLeaderboard(await lbRes.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedWeek])

  useEffect(() => {
    fetchChallengeList()
  }, [fetchChallengeList])

  useEffect(() => {
    setLoading(true)
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleUploadClick = (bingoItem: string) => {
    setSelectedBingoItem(bingoItem)
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !selectedBingoItem || !name) return

    const isImage = file.type.startsWith('image/') || isHeic(file)
    if (!isImage) { setError('UNSUPPORTED FILE TYPE.'); return }
    if (file.size > MAX_RAW_SIZE) { setError('FILE TOO LARGE. MAX 25MB.'); return }

    setUploading(selectedBingoItem)
    setError(null)

    try {
      const { blob: processedBlob, filename } = await processImage(file)
      const result = await upload(`challenges/${Date.now()}-${filename}`, processedBlob, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      })

      const res = await fetch('/api/challenge/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: name,
          bingoItem: selectedBingoItem,
          imageUrl: result.url,
          blobPath: result.pathname,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      await fetchData()
    } catch (err: any) {
      setError(err.message || 'UPLOAD FAILED')
    } finally {
      setUploading(null)
      setSelectedBingoItem(null)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!name) return
    try {
      await fetch('/api/challenge/photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photoId, playerName: name }),
      })
      await fetchData()
    } catch { /* silent */ }
  }

  const openLightbox = (url: string, label: string) => {
    setLightboxUrl(url)
    setLightboxLabel(label)
  }

  if (loading) {
    return (
      <Window title="WEEKLY CHALLENGE">
        <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--crt-amber)' }}>
          LOADING<span className="amiga-blink"> ...</span>
        </div>
      </Window>
    )
  }

  const challenge = view?.challenge
  const participants = view?.participants ?? []
  const myParticipant = name ? participants.find(p => p.playerName === name.toLowerCase()) : null
  const isCurrentWeek = selectedWeek === null

  return (
    <div className="stack" style={{ gap: '12px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Week selector */}
      {allChallenges.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          padding: '4px 0',
        }}>
          <button
            onClick={() => setSelectedWeek(null)}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              padding: '4px 8px',
              cursor: 'pointer',
              border: isCurrentWeek ? '2px solid var(--crt-amber)' : '1px solid var(--bevel-shadow)',
              background: isCurrentWeek ? 'var(--amiga-black)' : 'transparent',
              color: isCurrentWeek ? 'var(--crt-amber)' : 'var(--amiga-dark-grey)',
              textTransform: 'uppercase',
            }}
          >
            CURRENT WEEK
          </button>
          {allChallenges.map(ch => (
            <button
              key={ch.weekKey}
              onClick={() => setSelectedWeek(ch.weekKey)}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                padding: '4px 8px',
                cursor: 'pointer',
                border: selectedWeek === ch.weekKey ? '2px solid var(--crt-amber)' : '1px solid var(--bevel-shadow)',
                background: selectedWeek === ch.weekKey ? 'var(--amiga-black)' : 'transparent',
                color: selectedWeek === ch.weekKey ? 'var(--crt-amber)' : 'var(--amiga-dark-grey)',
                textTransform: 'uppercase',
              }}
            >
              {ch.weekKey}
            </button>
          ))}
        </div>
      )}

      {/* Photo lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '16px',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--crt-amber)',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}>
            {lightboxLabel}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt={lightboxLabel}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              border: '3px solid var(--crt-amber)',
            }}
          />
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--amiga-dark-grey)',
            marginTop: '12px',
          }}>
            TAP ANYWHERE TO CLOSE
          </div>
        </div>
      )}

      <Window title={isCurrentWeek ? 'WEEKLY CHALLENGE' : `CHALLENGE — ${selectedWeek}`}>
        {!challenge ? (
          <div style={{ textAlign: 'center', padding: '24px', fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--amiga-dark-grey)' }}>
            {isCurrentWeek ? 'NO CHALLENGE SET FOR THIS WEEK.' : 'NO CHALLENGE WAS SET FOR THIS WEEK.'}
          </div>
        ) : (
          <div className="stack" style={{ gap: '12px' }}>
            {/* Challenge info */}
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)' }}>
              <div style={{ fontSize: '11px', color: 'var(--crt-amber)', marginBottom: '4px' }}>
                {challenge.weekKey}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--amiga-dark-grey)' }}>
                <ChallengeRequirementLabel challenge={challenge} />
              </div>
            </div>

            {error && (
              <div className="amiga-badge" style={{ background: '#AA0000', color: '#FFFFFF', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {/* My bingo grid */}
            {name && (
              <div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: 'var(--crt-amber)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}>
                  YOUR BINGO CARD
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(challenge.bingoItems.length, 4)}, 1fr)`,
                  gap: '8px',
                }}>
                  {challenge.bingoItems.map(item => {
                    const myPhoto = myParticipant?.photos.find(p => p.bingoItem === item)
                    const isUploading = uploading === item
                    return (
                      <div key={item} style={{
                        background: myPhoto ? 'rgba(0, 180, 0, 0.15)' : 'var(--amiga-black)',
                        border: myPhoto ? '2px solid #00AA00' : '2px solid var(--bevel-shadow)',
                        padding: '6px',
                        textAlign: 'center',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '7px',
                          color: myPhoto ? '#00CC00' : 'var(--crt-amber)',
                          wordBreak: 'break-word',
                        }}>
                          {item}
                        </div>
                        {myPhoto ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={myPhoto.imageUrl}
                              alt={item}
                              onClick={() => openLightbox(myPhoto.imageUrl, `${myParticipant?.playerName?.toUpperCase()} — ${item}`)}
                              style={{
                                width: '120px',
                                height: '120px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                borderTop: '1px solid var(--bevel-shadow)',
                                borderLeft: '1px solid var(--bevel-shadow)',
                                borderRight: '1px solid var(--bevel-light)',
                                borderBottom: '1px solid var(--bevel-light)',
                              }}
                            />
                            {isCurrentWeek && (
                              <button
                                onClick={() => handleDeletePhoto(myPhoto.id)}
                                style={{
                                  fontFamily: 'var(--font-pixel)',
                                  fontSize: '6px',
                                  color: '#AA0000',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                                title="Remove photo"
                              >
                                [X]
                              </button>
                            )}
                          </>
                        ) : isCurrentWeek ? (
                          <Button
                            onClick={() => handleUploadClick(item)}
                            disabled={isUploading}
                            style={{ fontSize: '6px', padding: '4px 8px' }}
                          >
                            {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                          </Button>
                        ) : (
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--bevel-shadow)' }}>—</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Exercise progress */}
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                  {myParticipant ? (
                    <ExerciseProgress participant={myParticipant} challenge={challenge} />
                  ) : (
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)' }}>
                      EXERCISES: 0/{challenge.exerciseMinimum}
                    </div>
                  )}
                </div>
                {myParticipant?.isComplete && (
                  <div style={{
                    marginTop: '8px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '11px',
                    color: '#FFD700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
                  }}>
                    CHALLENGE COMPLETE!
                  </div>
                )}
              </div>
            )}

            {!name && (
              <div style={{
                textAlign: 'center',
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: 'var(--amiga-dark-grey)',
                padding: '12px',
              }}>
                SET YOUR NAME IN THE TOP BAR TO PARTICIPATE
              </div>
            )}
          </div>
        )}
      </Window>

      {/* Participants */}
      {challenge && participants.length > 0 && (
        <Window title="PARTICIPANTS">
          <div className="stack" style={{ gap: '12px' }}>
            {participants.map(p => (
              <div key={p.playerName} style={{
                background: p.isComplete ? 'rgba(0, 180, 0, 0.08)' : 'transparent',
                border: p.isComplete ? '1px solid #00AA00' : '1px solid var(--bevel-shadow)',
                padding: '8px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}>
                  <a href={`/player/${encodeURIComponent(p.playerName)}`} style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: p.isComplete ? '#FFD700' : 'var(--crt-amber)',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {p.isComplete && <span style={{ fontSize: '16px', lineHeight: 1 }}>⭐</span>}{p.playerName}
                  </a>
                  <ExerciseProgress participant={p} challenge={challenge} />
                </div>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}>
                  {challenge.bingoItems.map(item => {
                    const photo = p.photos.find(ph => ph.bingoItem === item)
                    return (
                      <div key={item} style={{
                        width: '100px',
                        textAlign: 'center',
                      }}>
                        <div
                          onClick={photo ? () => openLightbox(photo.imageUrl, `${p.playerName.toUpperCase()} — ${item}`) : undefined}
                          style={{
                            width: '100px',
                            height: '100px',
                            background: photo ? 'transparent' : 'var(--amiga-black)',
                            border: photo ? '2px solid #00AA00' : '2px solid var(--bevel-shadow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: photo ? 'pointer' : 'default',
                          }}
                        >
                          {photo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photo.imageUrl}
                              alt={item}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '20px', color: 'var(--bevel-shadow)' }}>?</span>
                          )}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '7px',
                          color: photo ? '#00CC00' : 'var(--amiga-dark-grey)',
                          marginTop: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {item}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Window>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Window title="CHALLENGE LEADERBOARD">
          <div className="stack" style={{ gap: '4px' }}>
            {leaderboard.map((entry, i) => {
              const completedCurrent = participants.find(p => p.playerName === entry.playerName)?.isComplete
              return (
                <div key={entry.playerName} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: completedCurrent ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderBottom: '1px solid var(--bevel-shadow)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: completedCurrent ? '#FFD700' : 'var(--crt-amber)',
                    textTransform: 'uppercase',
                  }}>
                    {completedCurrent && '★ '}{i + 1}. {entry.playerName}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: 'var(--amiga-dark-grey)',
                  }}>
                    {entry.completedChallenges} COMPLETED
                  </div>
                </div>
              )
            })}
          </div>
        </Window>
      )}
    </div>
  )
}
