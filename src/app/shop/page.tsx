'use client'

import { useState, useEffect, useCallback } from 'react'
import { useName } from '@/lib/useName'
import type { ShopItem } from '@/lib/shopCatalog'
import { ShopItemIcon } from '@/components/shop/ShopItemIcon'
import theme from '@/theme'

type Category = 'merch' | 'card_pack' | 'item'

const CATEGORY_LABELS: Record<Category, string> = {
  merch: 'MERCH',
  card_pack: 'CARD PACKS',
  item: 'ITEMS',
}

const CATEGORY_EMOJIS: Record<Category, string> = {
  merch: '',
  card_pack: '',
  item: '',
}

export default function ShopPage() {
  const { name } = useName()
  const [catalog, setCatalog] = useState<ShopItem[]>([])
  const [balance, setBalance] = useState(0)
  const [activeCategory, setActiveCategory] = useState<Category>('merch')
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchShop = useCallback(() => {
    const url = name
      ? `/api/shop?playerName=${encodeURIComponent(name)}`
      : '/api/shop'
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setCatalog(data.catalog || [])
        setBalance(data.balance || 0)
      })
      .catch(() => {})
  }, [name])

  useEffect(() => { fetchShop() }, [fetchShop])

  const handleBuy = async (slug: string) => {
    if (!name || buyingSlug) return
    setBuyingSlug(slug)
    setMessage(null)

    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, slug }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || 'Purchase failed', type: 'error' })
      } else {
        setBalance(data.balance)
        const rewardText = data.rewards?.length > 0
          ? ` You received: ${data.rewards.join(', ')}`
          : ''
        setMessage({ text: `Purchase complete!${rewardText}`, type: 'success' })
      }
    } catch {
      setMessage({ text: 'Something went wrong', type: 'error' })
    }

    setBuyingSlug(null)
  }

  const filteredItems = catalog.filter(item => item.category === activeCategory)

  return (
    <div className="page-content">
      <div className="amiga-window" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">{theme.strings.shopTitle}</span>
        </div>
        <div className="amiga-window__body">
          {/* Balance */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            marginBottom: '8px',
            background: 'linear-gradient(180deg, #2a1a0a 0%, #1a0a00 100%)',
            border: '2px solid #8B6914',
            borderRadius: '4px',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#AA8833',
                marginBottom: '4px',
              }}>
                YOUR BALANCE
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '14px',
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              }}>
                {balance.toLocaleString()} {theme.strings.currencyCode}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: '#886633',
              textAlign: 'right',
              maxWidth: '160px',
            }}>
              {theme.strings.currencyName}
              <br />
              {theme.strings.currencyTagline}
            </div>
          </div>

          {/* Status message */}
          {message && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: message.type === 'success' ? '#44CC44' : '#FF4444',
              textAlign: 'center',
              padding: '8px',
              background: message.type === 'success' ? '#0a2a0a' : '#2a0a0a',
              border: `1px solid ${message.type === 'success' ? '#44CC44' : '#FF4444'}`,
              borderRadius: '4px',
              marginBottom: '8px',
              overflowWrap: 'anywhere',
            }}>
              {message.text}
            </div>
          )}

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <button
                key={cat}
                className={`amiga-btn${activeCategory === cat ? ' amiga-btn--primary' : ''}`}
                onClick={() => setActiveCategory(cat)}
                style={{ flex: 1, fontSize: '8px' }}
              >
                {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredItems.map(item => (
              <div key={item.slug} style={{
                background: 'linear-gradient(180deg, #1a1a2a 0%, #0a0a1a 100%)',
                border: `2px solid ${item.available ? '#555' : '#333'}`,
                borderRadius: '6px',
                padding: '12px',
                opacity: item.available ? 1 : 0.7,
                display: 'flex',
                gap: '12px',
              }}>
                {/* Icon */}
                <ShopItemIcon slug={item.slug} category={item.category} size={56} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: '#eee',
                    flex: 1,
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: '#FFD700',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px',
                    textShadow: '0 0 6px rgba(255, 215, 0, 0.3)',
                  }}>
                    {item.price.toLocaleString()} {theme.strings.currencyCode}
                  </div>
                </div>

                {/* Description */}
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#aaa',
                  marginBottom: '6px',
                  lineHeight: '1.6',
                }}>
                  {item.description}
                </div>

                {/* Reward info for packs/items */}
                {item.rewardCount && (
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: item.rewardRarity === 'rare' ? '#FF44FF' : item.rewardRarity === 'uncommon' ? '#44AAFF' : '#888',
                    marginBottom: '6px',
                    padding: '3px 6px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '3px',
                    display: 'inline-block',
                  }}>
                    CONTAINS: {item.rewardCount}x {item.rewardRarity?.toUpperCase()}
                    {item.category === 'card_pack' ? ' CARD(S)' : ' ITEM(S)'}
                  </div>
                )}

                {/* Flavor text */}
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: '#666',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.8',
                }}>
                  {item.flavorText}
                </div>

                {/* Buy button */}
                {item.available ? (
                  <button
                    className="amiga-btn amiga-btn--primary"
                    disabled={!name || buyingSlug === item.slug}
                    onClick={() => handleBuy(item.slug)}
                    style={{
                      width: '100%',
                      fontSize: '8px',
                      opacity: !name ? 0.5 : 1,
                    }}
                  >
                    {buyingSlug === item.slug
                      ? 'PURCHASING...'
                      : !name
                        ? 'SET NAME TO BUY'
                        : `BUY FOR ${item.price.toLocaleString()} ${theme.strings.currencyCode}`}
                  </button>
                ) : (
                  <button
                    className="amiga-btn"
                    disabled
                    style={{
                      width: '100%',
                      fontSize: '8px',
                      opacity: 0.5,
                    }}
                  >
                    COMING SOON
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>

          {/* No name warning */}
          {!name && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: '#888',
              textAlign: 'center',
              padding: '16px',
              marginTop: '8px',
            }}>
              SET YOUR PLAYER NAME ON THE HOME PAGE TO USE THE SHOP
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
