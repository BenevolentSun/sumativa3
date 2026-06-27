import React from 'react';

/* ============================================================
   StatBar — Shows a named stat with animated fill bar
   Highlights positive/negative changes from mods
   ============================================================ */

export default function StatBar({ label, baseValue, modValue, max, unit = '', color = 'var(--color-energy)', formatter }) {
  const hasBase  = baseValue != null && baseValue !== 0;
  const hasMod   = modValue  != null && modValue  !== 0;
  const display  = hasMod ? modValue : (hasBase ? baseValue : null);
  const changed  = hasMod && hasBase && Math.abs(modValue - baseValue) > 0.01;

  if (display === null || display === 0) return null;

  const pct = max ? Math.min(100, (display / max) * 100) : Math.min(100, (display / 100) * 100);
  const fmt = formatter ?? (v => typeof v === 'number' ? (v % 1 !== 0 ? v.toFixed(2) : v.toLocaleString()) : v);

  const delta    = changed ? modValue - baseValue : 0;
  const positive = delta > 0;

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {label}
        </span>
        <div className="d-flex align-items-center gap-2">
          {changed && (
            <span style={{ fontSize: 'var(--fs-xs)', color: positive ? 'var(--color-stat-green)' : 'var(--color-stat-red)', fontWeight: 600 }}>
              {positive ? '+' : ''}{fmt(delta)}{unit}
            </span>
          )}
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text)', fontWeight: changed ? 600 : 400 }}>
            {fmt(display)}{unit}
          </span>
        </div>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{
            width: `${pct}%`,
            background: changed
              ? (positive ? 'var(--color-stat-green)' : 'var(--color-stat-red)')
              : color,
          }}
        />
      </div>
    </div>
  );
}
