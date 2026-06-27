import React, { useMemo } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { calculateStats } from '../../hooks/useWarframeAPI';
import StatBar from '../ui/StatBar';

/* ============================================================
   StatsPanel — Real-time stat display for the active build
   Shows base + modded values, drain usage, capacity bar
   NOTE: In Overframe layout, stats are inline in BuilderView.
   This panel is kept for other views or fallback usage.
   ============================================================ */

const WARFRAME_STATS = [
  { key: 'health',      label: 'Health',       color: 'var(--color-stat-red)',   max: 1500 },
  { key: 'shield',      label: 'Shield',       color: 'var(--color-energy)',     max: 1200 },
  { key: 'armor',       label: 'Armor',        color: 'var(--color-stat-orange)',max: 1000 },
  { key: 'power',       label: 'Energy',       color: '#8e44ad',                 max: 400  },
  { key: 'sprintSpeed', label: 'Sprint Speed', color: 'var(--color-stat-green)', max: 2, formatter: v => v?.toFixed(2) },
];

const WEAPON_STATS = [
  { key: 'damage',             label: 'Damage',         color: 'var(--color-stat-red)',   max: 1000 },
  { key: 'criticalChance',     label: 'Crit Chance',    color: 'var(--color-gold)',       max: 1, unit: '%', formatter: v => `${(v * 100).toFixed(1)}` },
  { key: 'criticalMultiplier', label: 'Crit Multiplier',color: 'var(--color-gold)',       max: 6, unit: 'x', formatter: v => v?.toFixed(1) },
  { key: 'procChance',         label: 'Status Chance',  color: '#8e44ad',                max: 1, unit: '%', formatter: v => `${(v * 100).toFixed(1)}` },
  { key: 'fireRate',           label: 'Fire Rate',      color: 'var(--color-energy)',     max: 20 },
  { key: 'magazineSize',       label: 'Magazine',       color: 'var(--color-text-muted)', max: 200 },
  { key: 'reloadTime',         label: 'Reload',         color: 'var(--color-stat-orange)',max: 5, unit: 's', formatter: v => v?.toFixed(1) },
];

export default function StatsPanel() {
  const { state, equippedDrain } = useBuilder();
  const { item, slots, category } = state.session;

  const { base, totals } = useMemo(
    () => calculateStats(item, slots),
    [item, slots]
  );

  const isWarframe    = category === 'warframes';
  const isCompanion   = category === 'companions';
  const statDefs      = (isWarframe || isCompanion) ? WARFRAME_STATS : WEAPON_STATS;

  // Capacity
  const capacity    = 60; // Default mod capacity
  const drainPct    = Math.min(100, (equippedDrain / capacity) * 100);
  const drainClass  = drainPct >= 100 ? 'overflow' : drainPct >= 80 ? 'warning' : 'safe';
  const equippedCount = slots.filter(Boolean).length;

  return (
    <aside
      style={{
        background:   'var(--color-surface)',
        border:       'var(--border-1)',
        borderRadius: 'var(--radius-lg)',
        padding:      'var(--space-4)',
        display:      'flex',
        flexDirection:'column',
        gap:          'var(--space-4)',
      }}
      aria-label="Build statistics"
    >
      {/* Section title */}
      <div>
        <h3 style={{
          fontFamily:   'var(--font-display)',
          fontWeight:   700,
          fontSize:     'var(--fs-md)',
          letterSpacing:'0.1em',
          textTransform:'uppercase',
          color:        'var(--color-text)',
          margin:       0,
          display:      'flex',
          alignItems:   'center',
          gap:          8,
        }}>
          <i className="bi bi-graph-up" style={{ color: 'var(--color-gold)', fontSize: 15 }} />
          Statistics
        </h3>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)', margin: '4px 0 0', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {equippedCount} / 8 mods equipped
        </p>
      </div>

      {/* Capacity / Drain */}
      <div style={{
        background:   'var(--color-surface-2)',
        border:       'var(--border-2)',
        borderRadius: 'var(--radius-md)',
        padding:      'var(--space-3)',
      }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span style={{ fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <i className="bi bi-lightning-charge-fill me-1" style={{ color: 'var(--color-gold)' }} />
            Mod Capacity
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize:   'var(--fs-sm)',
            color:      drainClass === 'overflow' ? 'var(--color-stat-red)' : drainClass === 'warning' ? 'var(--color-stat-orange)' : 'var(--color-stat-green)',
          }}>
            {equippedDrain} / {capacity}
          </span>
        </div>
        <div className="drain-bar">
          <div className={`drain-bar-fill ${drainClass}`} style={{ width: `${drainPct}%` }} />
        </div>
        {drainClass === 'overflow' && (
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-stat-red)', marginTop: 4, margin: '4px 0 0' }}>
            ⚠ Over capacity — remove mods
          </p>
        )}
      </div>

      <hr className="divider-gold" style={{ margin: 0 }} />

      {/* Stats */}
      <div>
        {item ? (
          statDefs.map(def => {
            const bv = base[def.key];
            const mv = totals[def.key];
            if (!bv && !mv) return null;
            return (
              <StatBar
                key={def.key}
                label={def.label}
                baseValue={bv}
                modValue={mv}
                max={def.max}
                unit={def.unit}
                color={def.color}
                formatter={def.formatter}
              />
            );
          })
        ) : (
          <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--fs-sm)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
            Select an item to view stats
          </p>
        )}
      </div>

      {/* Legend */}
      {equippedCount > 0 && (
        <div style={{
          background:   'var(--color-surface-2)',
          border:       'var(--border-2)',
          borderRadius: 'var(--radius-md)',
          padding:      'var(--space-3)',
        }}>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)', margin: 0, lineHeight: 1.7 }}>
            <span style={{ color: 'var(--color-stat-green)', fontWeight: 600 }}>▲ Green</span> = stat buffed by mods
            <br />
            <span style={{ color: 'var(--color-stat-red)', fontWeight: 600 }}>▼ Red</span> = stat reduced by mods
          </p>
        </div>
      )}
    </aside>
  );
}
