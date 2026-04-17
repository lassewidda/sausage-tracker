'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { upload } from '@vercel/blob/client'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import { useName } from '@/lib/useName'
import { processImage, isHeic, MAX_RAW_SIZE } from '@/lib/imageProcess'
import { ChallengeReveal } from '@/components/challenge/ChallengeReveal'
import type { ChallengeView, ChallengeLeaderboardEntry, GroupLeaderboardEntry, ChallengeParticipant, WeeklyChallenge, TeamProgress } from '@/types'

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
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardEntry[]>([])
  const [allChallenges, setAllChallenges] = useState<WeeklyChallenge[]>([])
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null) // null = current week
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedBingoItem, setSelectedBingoItem] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [lightboxLabel, setLightboxLabel] = useState<string>('')
  const [editingTeamName, setEditingTeamName] = useState(false)
  const [teamNameDraft, setTeamNameDraft] = useState('')
  const [teamNameSaving, setTeamNameSaving] = useState(false)
  const [nextWeekHasChallenge, setNextWeekHasChallenge] = useState(false)
  const [countdown, setCountdown] = useState('')

  // Compute next Monday 00:00 Stockholm time for countdown
  const nextMonday = useMemo(() => {
    const now = new Date()
    const day = now.getDay() // 0=Sun, 1=Mon, ...
    const daysUntilMonday = day === 0 ? 1 : 8 - day
    const target = new Date(now)
    target.setDate(target.getDate() + daysUntilMonday)
    // Set to midnight — we'll compare in Stockholm time
    target.setHours(0, 0, 0, 0)
    return target
  }, [])

  // Get ISO week key for a given date (client-side version of getWeekKey)
  const getWeekKeyForDate = useCallback((date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
    const week1 = new Date(d.getFullYear(), 0, 4)
    const weekNum = Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    ) + 1
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
  }, [])

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
      const viewData = viewRes.ok ? await viewRes.json() : null
      if (viewData) setView(viewData)
      if (lbRes.ok) {
        const lbData = await lbRes.json()
        if (Array.isArray(lbData)) {
          // Backward compat: old shape was just an array
          setLeaderboard(lbData)
          setGroupLeaderboard([])
        } else {
          setLeaderboard(lbData.individual ?? [])
          setGroupLeaderboard(lbData.groups ?? [])
        }
      }
      // Check if next week has a challenge when current week doesn't
      if (!selectedWeek && viewData && !viewData.challenge) {
        try {
          const nextWeekKey = getWeekKeyForDate(nextMonday)
          const nextRes = await fetch(`/api/challenge?weekKey=${encodeURIComponent(nextWeekKey)}`)
          if (nextRes.ok) {
            const nextData = await nextRes.json()
            setNextWeekHasChallenge(!!nextData.challenge)
          }
        } catch { /* silent */ }
      } else {
        setNextWeekHasChallenge(false)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selectedWeek, getWeekKeyForDate, nextMonday])

  useEffect(() => {
    fetchChallengeList()
  }, [fetchChallengeList])

  useEffect(() => {
    setLoading(true)
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown timer for next week's challenge
  useEffect(() => {
    if (!nextWeekHasChallenge) return
    const tick = () => {
      // Target: next Monday 00:00 Stockholm time
      // Get current Stockholm time
      const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' })
      const nowStockholm = new Date(nowStr)
      // Build target Monday in Stockholm
      const now = new Date()
      const day = now.getDay()
      const daysUntil = day === 0 ? 1 : 8 - day
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + daysUntil)
      const targetStr = targetDate.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
      const targetStockholm = new Date(`${targetStr}T00:00:00`)
      const diff = targetStockholm.getTime() - nowStockholm.getTime()
      if (diff <= 0) {
        setCountdown('NOW!')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [nextWeekHasChallenge])

  // Check if current challenge is new (unseen) — only for current week tab
  useEffect(() => {
    if (!view?.challenge || selectedWeek !== null) return
    const weekKey = view.challenge.weekKey
    try {
      const raw = localStorage.getItem('powerup_seen_challenges')
      const seen: string[] = raw ? JSON.parse(raw) : []
      if (!seen.includes(weekKey)) {
        setShowReveal(true)
      }
    } catch {
      // corrupted localStorage — treat as unseen
      setShowReveal(true)
    }
  }, [view?.challenge, selectedWeek])

  const handleRevealDismiss = () => {
    if (view?.challenge) {
      const weekKey = view.challenge.weekKey
      try {
        const raw = localStorage.getItem('powerup_seen_challenges')
        const seen: string[] = raw ? JSON.parse(raw) : []
        if (!seen.includes(weekKey)) {
          seen.push(weekKey)
          localStorage.setItem('powerup_seen_challenges', JSON.stringify(seen))
        }
      } catch {
        localStorage.setItem('powerup_seen_challenges', JSON.stringify([weekKey]))
      }
    }
    setShowReveal(false)
  }

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
  const isGroupMode = challenge?.challengeMode === 'group'
  const myTeam = isGroupMode && challenge?.teams && name
    ? challenge.teams.find(t => t.members.includes(name.toLowerCase()))
    : null
  const myTeamProgress = isGroupMode && view?.teamProgress && myTeam
    ? view.teamProgress.find(tp => tp.team.name === myTeam.name)
    : null

  return (
    <div className="stack" style={{ gap: '12px' }}>
      {showReveal && challenge && (
        <ChallengeReveal challenge={challenge} onDismiss={handleRevealDismiss} />
      )}
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

      <Window title={isCurrentWeek ? "PUCK'S CHALLENGE" : `CHALLENGE — ${selectedWeek}`}>
        {!challenge ? (
          isCurrentWeek && nextWeekHasChallenge ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', fontFamily: 'var(--font-pixel)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/puck.png"
                alt="Puck"
                style={{ width: '80px', height: '80px', imageRendering: 'pixelated', marginBottom: '16px' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--crt-amber)', marginBottom: '8px', letterSpacing: '1px' }}>
                PUCK&apos;S WEEKLY CHALLENGE
              </div>
              <div style={{ fontSize: '8px', color: 'var(--amiga-dark-grey)', marginBottom: '20px' }}>
                A NEW CHALLENGE STARTS IN
              </div>
              <div style={{
                fontSize: '16px',
                color: '#FFD700',
                letterSpacing: '2px',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
              }}>
                {countdown}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--amiga-dark-grey)', marginTop: '16px' }}>
                GET YOUR CAMERA READY 📸
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--amiga-dark-grey)' }}>
              {isCurrentWeek ? 'NO CHALLENGE SET FOR THIS WEEK.' : 'NO CHALLENGE WAS SET FOR THIS WEEK.'}
            </div>
          )
        ) : (
          <div className="stack" style={{ gap: '12px' }}>
            {/* Challenge info */}
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/puck.png"
                alt="Puck"
                style={{ width: '48px', height: '48px', imageRendering: 'pixelated', marginBottom: '8px' }}
              />
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

            {/* Bingo grid: individual or group */}
            {name && !isGroupMode && (
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
                          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--bevel-shadow)' }}>---</span>
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

            {/* Group mode bingo card */}
            {name && isGroupMode && (
              <div>
                {!myTeam ? (
                  <div style={{
                    textAlign: 'center',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: '#AA0000',
                    padding: '16px',
                    border: '2px solid #AA0000',
                  }}>
                    YOU ARE NOT ASSIGNED TO A TEAM
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '8px',
                      color: 'var(--crt-amber)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}>
                      {editingTeamName ? (
                        <>
                          <span>YOUR TEAM&apos;S BINGO CARD —</span>
                          <input
                            type="text"
                            value={teamNameDraft}
                            onChange={e => setTeamNameDraft(e.target.value)}
                            autoFocus
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '8px',
                              textTransform: 'uppercase',
                              background: 'var(--amiga-black)',
                              color: 'var(--crt-amber)',
                              border: '2px solid var(--crt-amber)',
                              padding: '2px 6px',
                              outline: 'none',
                              width: '120px',
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const doSave = async () => {
                                  if (!teamNameDraft.trim() || !name || !challenge) return
                                  setTeamNameSaving(true)
                                  try {
                                    const res = await fetch('/api/challenge/team-name', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        weekKey: challenge.weekKey,
                                        oldName: myTeam.name,
                                        newName: teamNameDraft.trim(),
                                        playerName: name,
                                      }),
                                    })
                                    if (res.ok) {
                                      await fetchData()
                                      setEditingTeamName(false)
                                    }
                                  } catch { /* silent */ }
                                  finally { setTeamNameSaving(false) }
                                }
                                doSave()
                              } else if (e.key === 'Escape') {
                                setEditingTeamName(false)
                              }
                            }}
                          />
                          <button
                            disabled={teamNameSaving}
                            onClick={async () => {
                              if (!teamNameDraft.trim() || !name || !challenge) return
                              setTeamNameSaving(true)
                              try {
                                const res = await fetch('/api/challenge/team-name', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    weekKey: challenge.weekKey,
                                    oldName: myTeam.name,
                                    newName: teamNameDraft.trim(),
                                    playerName: name,
                                  }),
                                })
                                if (res.ok) {
                                  await fetchData()
                                  setEditingTeamName(false)
                                }
                              } catch { /* silent */ }
                              finally { setTeamNameSaving(false) }
                            }}
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: '#00CC00',
                              background: 'none',
                              border: '1px solid #00CC00',
                              cursor: teamNameSaving ? 'default' : 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            {teamNameSaving ? '...' : 'SAVE'}
                          </button>
                          <button
                            onClick={() => setEditingTeamName(false)}
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: '#AA0000',
                              background: 'none',
                              border: '1px solid #AA0000',
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            CANCEL
                          </button>
                        </>
                      ) : (
                        <>
                          YOUR TEAM&apos;S BINGO CARD — {myTeam.name.toUpperCase()}
                          <button
                            onClick={() => {
                              setTeamNameDraft(myTeam.name)
                              setEditingTeamName(true)
                            }}
                            title="Rename team"
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: 'var(--amiga-dark-grey)',
                              background: 'none',
                              border: '1px solid var(--bevel-shadow)',
                              cursor: 'pointer',
                              padding: '1px 4px',
                            }}
                          >
                            {'\u270E'}
                          </button>
                        </>
                      )}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(challenge.bingoItems.length, 4)}, 1fr)`,
                      gap: '8px',
                    }}>
                      {challenge.bingoItems.map(item => {
                        const teamPhoto = myTeamProgress?.photos.find(p => p.bingoItem === item)
                        const isUploading = uploading === item
                        return (
                          <div key={item} style={{
                            background: teamPhoto ? 'rgba(0, 180, 0, 0.15)' : 'var(--amiga-black)',
                            border: teamPhoto ? '2px solid #00AA00' : '2px solid var(--bevel-shadow)',
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
                              color: teamPhoto ? '#00CC00' : 'var(--crt-amber)',
                              wordBreak: 'break-word',
                            }}>
                              {item}
                            </div>
                            {teamPhoto ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={teamPhoto.imageUrl}
                                  alt={item}
                                  onClick={() => openLightbox(teamPhoto.imageUrl, `${teamPhoto.playerName.toUpperCase()} — ${item}`)}
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
                                <div style={{
                                  fontFamily: 'var(--font-pixel)',
                                  fontSize: '6px',
                                  color: 'var(--amiga-dark-grey)',
                                }}>
                                  BY {teamPhoto.playerName.toUpperCase()}
                                </div>
                                {isCurrentWeek && teamPhoto.playerName === name.toLowerCase() && (
                                  <button
                                    onClick={() => handleDeletePhoto(teamPhoto.id)}
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
                              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--bevel-shadow)' }}>---</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Team member exercise progress */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '7px',
                        color: 'var(--crt-amber)',
                        marginBottom: '6px',
                      }}>
                        TEAM MEMBER PROGRESS
                      </div>
                      <div className="stack" style={{ gap: '4px' }}>
                        {myTeam.members.map(memberName => {
                          const mp = participants.find(p => p.playerName === memberName)
                          const reqs = challenge.exerciseRequirements
                          if (IS_EXERCISE && reqs && Object.keys(reqs).length > 0) {
                            const typeCounts = mp?.exerciseTypeCounts ?? {}
                            const validTypes = Object.entries(reqs).filter(([type]) => type === 'cardio' || type === 'strength')
                            const allMet = validTypes.every(([type, required]) => (typeCounts[type] ?? 0) >= (required as number))
                            return (
                              <div key={memberName} style={{
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '7px',
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                color: allMet ? '#00CC00' : 'var(--crt-amber)',
                                padding: '2px 0',
                              }}>
                                <span style={{ minWidth: '80px', textTransform: 'uppercase' }}>{memberName}</span>
                                {validTypes.map(([type, required]) => {
                                  const count = typeCounts[type] ?? 0
                                  const met = count >= (required as number)
                                  return (
                                    <span key={type} style={{ color: met ? '#00CC00' : TYPE_COLORS[type] ?? 'var(--crt-amber)' }}>
                                      {count}/{required as number} {TYPE_LABELS[type] ?? type.toUpperCase()} {met && '\u2713'}
                                    </span>
                                  )
                                })}
                              </div>
                            )
                          }
                          const exerciseCount = mp?.exerciseCount ?? 0
                          const met = exerciseCount >= challenge.exerciseMinimum
                          return (
                            <div key={memberName} style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: met ? '#00CC00' : 'var(--crt-amber)',
                              padding: '2px 0',
                              textTransform: 'uppercase',
                            }}>
                              {memberName}: {exerciseCount}/{challenge.exerciseMinimum} EXERCISES {met && '\u2713'}
                            </div>
                          )
                        })}
                      </div>
                      {(() => {
                        const readyCount = myTeam.members.filter(memberName => {
                          const mp = participants.find(p => p.playerName === memberName)
                          if (!mp) return false
                          const reqs = challenge.exerciseRequirements
                          if (IS_EXERCISE && reqs && Object.keys(reqs).length > 0) {
                            const typeCounts = mp.exerciseTypeCounts ?? {}
                            return Object.entries(reqs)
                              .filter(([type]) => type === 'cardio' || type === 'strength')
                              .every(([type, required]) => (typeCounts[type] ?? 0) >= (required as number))
                          }
                          return mp.exerciseCount >= challenge.exerciseMinimum
                        }).length
                        return (
                          <div style={{
                            marginTop: '6px',
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '8px',
                            color: readyCount === myTeam.members.length ? '#00CC00' : 'var(--crt-amber)',
                            textAlign: 'center',
                          }}>
                            {readyCount}/{myTeam.members.length} MEMBERS READY
                          </div>
                        )
                      })()}
                    </div>

                    {/* Team completion banner */}
                    {myTeamProgress?.isComplete && (
                      <div style={{
                        marginTop: '8px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '11px',
                        color: '#FFD700',
                        textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
                      }}>
                        TEAM CHALLENGE COMPLETE!
                      </div>
                    )}
                  </>
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

      {/* Participants (individual mode) */}
      {challenge && !isGroupMode && participants.length > 0 && (
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
                    {p.isComplete && <span style={{ fontSize: '16px', lineHeight: 1 }}>&#11088;</span>}{p.playerName}
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
                          onClick={photo ? () => openLightbox(photo.imageUrl, `${p.playerName.toUpperCase()} --- ${item}`) : undefined}
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

      {/* Teams (group mode) */}
      {challenge && isGroupMode && view?.teamProgress && view.teamProgress.length > 0 && (
        <Window title="TEAMS">
          <div className="stack" style={{ gap: '12px' }}>
            {view.teamProgress.map(tp => (
              <div key={tp.team.name} style={{
                background: tp.isComplete ? 'rgba(0, 180, 0, 0.08)' : 'transparent',
                border: tp.isComplete ? '1px solid #00AA00' : '1px solid var(--bevel-shadow)',
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
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: tp.isComplete ? '#FFD700' : 'var(--crt-amber)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {tp.isComplete && <span style={{ fontSize: '16px', lineHeight: 1 }}>&#11088;</span>}
                    {tp.team.name}
                  </div>
                  {tp.isComplete && (
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: '#FFD700',
                    }}>
                      COMPLETE
                    </span>
                  )}
                </div>
                {/* Team bingo grid */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '8px',
                }}>
                  {challenge.bingoItems.map(item => {
                    const photo = tp.photos.find(ph => ph.bingoItem === item)
                    return (
                      <div key={item} style={{
                        width: '80px',
                        textAlign: 'center',
                      }}>
                        <div
                          onClick={photo ? () => openLightbox(photo.imageUrl, `${tp.team.name.toUpperCase()} --- ${item}`) : undefined}
                          style={{
                            width: '80px',
                            height: '80px',
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
                            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--bevel-shadow)' }}>?</span>
                          )}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '6px',
                          color: photo ? '#00CC00' : 'var(--amiga-dark-grey)',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {item}
                        </div>
                        {photo && (
                          <div style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '5px',
                            color: 'var(--amiga-dark-grey)',
                          }}>
                            {photo.playerName.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Per-member exercise status */}
                <div className="stack" style={{ gap: '2px' }}>
                  {tp.team.members.map(memberName => {
                    const mp = tp.memberProgress.find(p => p.playerName === memberName)
                    const reqs = challenge.exerciseRequirements
                    if (IS_EXERCISE && reqs && Object.keys(reqs).length > 0) {
                      const typeCounts = mp?.exerciseTypeCounts ?? {}
                      const validTypes = Object.entries(reqs).filter(([type]) => type === 'cardio' || type === 'strength')
                      const allMet = validTypes.every(([type, required]) => (typeCounts[type] ?? 0) >= (required as number))
                      return (
                        <div key={memberName} style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '6px',
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                          color: allMet ? '#00CC00' : 'var(--amiga-dark-grey)',
                        }}>
                          <span style={{ minWidth: '60px', textTransform: 'uppercase' }}>{memberName}</span>
                          {validTypes.map(([type, required]) => {
                            const count = typeCounts[type] ?? 0
                            const met = count >= (required as number)
                            return (
                              <span key={type} style={{ color: met ? '#00CC00' : TYPE_COLORS[type] ?? 'var(--amiga-dark-grey)' }}>
                                {count}/{required as number} {type.toUpperCase()} {met && '\u2713'}
                              </span>
                            )
                          })}
                        </div>
                      )
                    }
                    const exerciseCount = mp?.exerciseCount ?? 0
                    const met = exerciseCount >= challenge.exerciseMinimum
                    return (
                      <div key={memberName} style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: met ? '#00CC00' : 'var(--amiga-dark-grey)',
                        textTransform: 'uppercase',
                      }}>
                        {memberName}: {exerciseCount}/{challenge.exerciseMinimum} {met && '\u2713'}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Window>
      )}

      {/* Individual Leaderboard */}
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
                    {completedCurrent && '\u2605 '}{i + 1}. {entry.playerName}
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

      {/* Group Leaderboard */}
      {groupLeaderboard.length > 0 && (
        <Window title="GROUP CHALLENGE LEADERBOARD">
          <div className="stack" style={{ gap: '4px' }}>
            {groupLeaderboard.map((entry, i) => {
              const isMyTeam = myTeam && entry.teamName === myTeam.name
              const completedCurrent = view?.teamProgress?.find(tp => tp.team.name === entry.teamName)?.isComplete
              return (
                <div key={entry.teamName} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: completedCurrent ? 'rgba(255, 215, 0, 0.1)' : isMyTeam ? 'rgba(0, 85, 170, 0.1)' : 'transparent',
                  borderBottom: '1px solid var(--bevel-shadow)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: completedCurrent ? '#FFD700' : 'var(--crt-amber)',
                    textTransform: 'uppercase',
                  }}>
                    {completedCurrent && '\u2605 '}{i + 1}. {entry.teamName}
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
