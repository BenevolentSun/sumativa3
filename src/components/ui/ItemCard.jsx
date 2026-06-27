import React, { useState } from 'react';
import { getItemImage } from '../../hooks/useWarframeAPI';

/* ============================================================
   ItemCard — Displays an item (Warframe / Weapon / Companion)
   in the selection grid. Shows image, name, type badge.
   ============================================================ */

const RARITY_COLOR = {
  Common:    'var(--color-text-dim)',
  Uncommon:  'var(--color-stat-green)',
  Rare:      'var(--color-gold)',
  Legendary: '#b84cdb',
};

export default function ItemCard({ item, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getItemImage(item.imageName);

  return (
    <article
      className="surface card-lift"
      onClick={() => onSelect(item)}
      style={{
        cursor:   'pointer',
        overflow: 'hidden',
        padding:  0,
        display:  'flex',
        flexDirection: 'column',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(item)}
      aria-label={`Select ${item.name}`}
    >
      {/* Item image */}
      <div style={{
        position:   'relative',
        background: 'linear-gradient(180deg, #0d0f1a 0%, #070810 100%)',
        height:     140,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow:   'hidden',
        flexShrink: 0,
      }}>
        {/* Subtle radial glow behind image */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(200,168,75,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{
              maxHeight:  '88%',
              maxWidth:   '88%',
              objectFit:  'contain',
              filter:     'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
              transition: 'transform var(--transition-slow)',
              position:   'relative',
              zIndex:     1,
            }}
          />
        ) : (
          <i className="bi bi-image" style={{ fontSize: 32, color: 'var(--color-text-dim)' }} />
        )}

        {/* Mastery rank badge */}
        {item.masteryReq > 0 && (
          <div style={{
            position:   'absolute',
            top:        8,
            left:       8,
            background: 'rgba(0,0,0,0.7)',
            border:     '1px solid var(--color-border-2)',
            borderRadius: 'var(--radius-sm)',
            padding:    '2px 6px',
            fontSize:   'var(--fs-xs)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            color:      'var(--color-gold)',
            display:    'flex',
            alignItems: 'center',
            gap:        3,
            zIndex:     2,
          }}>
            <i className="bi bi-shield-fill" style={{ fontSize: 8 }} />
            MR{item.masteryReq}
          </div>
        )}

        {/* Rarity indicator */}
        {item.rarity && (
          <div style={{
            position:    'absolute',
            top:         8,
            right:       8,
            width:       8,
            height:      8,
            borderRadius:'50%',
            background:  RARITY_COLOR[item.rarity] ?? 'var(--color-text-dim)',
            zIndex:      2,
            boxShadow:   `0 0 6px ${RARITY_COLOR[item.rarity] ?? 'transparent'}`,
          }} />
        )}
      </div>

      {/* Item info */}
      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{
          fontFamily:  'var(--font-display)',
          fontWeight:  700,
          fontSize:    'var(--fs-sm)',
          color:       'var(--color-text)',
          letterSpacing: '0.04em',
          lineHeight:  1.3,
          margin:      0,
        }}>
          {item.name}
        </h3>
        {item.type && (
          <span style={{
            fontSize:    'var(--fs-xs)',
            color:       'var(--color-text-muted)',
            fontFamily:  'var(--font-display)',
            fontWeight:  500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {item.type}
          </span>
        )}
      </div>
    </article>
  );
}
