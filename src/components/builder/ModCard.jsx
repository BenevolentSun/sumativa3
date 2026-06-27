import React, { useState } from 'react';
import { getItemImage } from '../../hooks/useWarframeAPI';

/* ============================================================
   ModCard — Overframe-style vertical tile with prominent image
   Shows: mod image, name, top stat preview, type badge
   Rarity-colored border
   ============================================================ */

const RARITY_CLASS = {
  Common:    'rarity-common',
  Uncommon:  'rarity-uncommon',
  Rare:      'rarity-rare',
  Legendary: 'rarity-legendary',
};

export default function ModCard({ mod, onSelect, alreadyEquipped, currentRank, onUpdateRank, inSlot }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getItemImage(mod.imageName);
  const rarity = mod.rarity ?? 'Common';
  const maxRank = mod.fusionLimit ?? 0;
  
  const rank = currentRank !== undefined ? currentRank : maxRank;
  
  let drainVal = (mod.baseDrain ?? 0) + rank;
  const isAura = mod.type === 'Aura' || mod.compatName === 'AURA';
  
  // Format drain
  let drainDisplay = drainVal;
  if (isAura && drainVal < 0) {
    drainDisplay = `↑${Math.abs(drainVal)}`; 
  } else if (isAura && drainVal > 0) {
    drainDisplay = `↑${drainVal}`;
  }

  // Polarity symbols
  const pol = (mod.polarity || '').toLowerCase();
  let polSymbol = 'v';
  if (pol === 'vazarin') polSymbol = 'D';
  else if (pol === 'naramon') polSymbol = '-';
  else if (pol === 'zenurik') polSymbol = '=';
  else if (pol === 'umbra') polSymbol = 'U';
  else if (pol === 'unairu') polSymbol = 'R';
  else if (pol === 'penjaga') polSymbol = 'Y';
  else if (pol === 'madurai') polSymbol = 'V';

  // Stats
  const levelStat = mod.levelStats?.[rank] || mod.levelStats?.[0];
  const allStats = levelStat?.stats ?? [];

  const typeLabel = mod.type ?? mod.compatName ?? 'MOD';
  const stars = Array.from({ length: maxRank }, (_, i) => i + 1);

  return (
    <article
      className={`mod-card-of ${RARITY_CLASS[rarity] ?? ''} ${alreadyEquipped ? 'already-equipped' : ''}`}
      onClick={() => {
        if (!inSlot && !alreadyEquipped) onSelect(mod);
      }}
      role="button"
      tabIndex={alreadyEquipped ? -1 : 0}
      title={alreadyEquipped ? `${mod.name} — already equipped` : inSlot ? mod.name : `Equip ${mod.name}`}
    >
      {/* Decorative top center element */}
      <div className="mod-card-top-deco">
        <span className="deco-dot"></span>
        <span className="deco-dot"></span>
        <span className="deco-dot"></span>
      </div>

      {/* Drain / Polarity Badge at top right */}
      <div className="mod-card-drain-badge">
        <span className="drain-val">{drainDisplay}</span>
        <span className="polarity-icon">{polSymbol}</span>
      </div>

      {/* Top half: Image */}
      <div className="mod-card-img-wrap">
        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={mod.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="mod-card-img-fallback">
            <i className="bi bi-image" />
          </div>
        )}
      </div>

      {/* Bottom half: Info */}
      <div className="mod-card-body">
        <h3 className="mod-card-name">{mod.name}</h3>
        
        {allStats.length > 0 && (
          <div className="mod-card-stats">
            {allStats.map((stat, i) => {
              const isLast = i === allStats.length - 1 && allStats.length > 1;
              // Handle literal \n or \r\n from API
              const formattedStat = stat.split(/\\n|\n/).map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < stat.split(/\\n|\n/).length - 1 && <br />}
                </React.Fragment>
              ));
              return (
                <React.Fragment key={i}>
                  {isLast && <div className="mod-card-set-dots">ooo</div>}
                  <div style={{ wordWrap: 'break-word' }}>{formattedStat}</div>
                </React.Fragment>
              );
            })}
          </div>
        )}
        
        {!inSlot && (
          <div className="mod-card-type-wrap">
            <span className="mod-card-type-badge">{typeLabel.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Rank Stars on bottom edge */}
      {maxRank > 0 && (
        <div className="mod-card-rank-wrapper">
          {inSlot && onUpdateRank && (
            <button 
              className="rank-adjust-btn" 
              onClick={(e) => { e.stopPropagation(); if (rank > 0) onUpdateRank(rank - 1); }}
              title="Restar nivel"
            >
              -
            </button>
          )}
          <div className="mod-card-rank-stars">
            {stars.map(dotRank => (
              <div 
                key={dotRank} 
                className={`rank-star ${dotRank <= rank ? 'filled' : ''} ${inSlot ? 'clickable' : ''}`}
                onClick={(e) => {
                  if (inSlot && onUpdateRank) {
                    e.stopPropagation();
                    onUpdateRank(dotRank === rank ? 0 : dotRank);
                  }
                }}
                title={inSlot ? `Set rank to ${dotRank}` : undefined}
              />
            ))}
          </div>
          {inSlot && onUpdateRank && (
            <button 
              className="rank-adjust-btn" 
              onClick={(e) => { e.stopPropagation(); if (rank < maxRank) onUpdateRank(rank + 1); }}
              title="Sumar nivel"
            >
              +
            </button>
          )}
        </div>
      )}
    </article>
  );
}
