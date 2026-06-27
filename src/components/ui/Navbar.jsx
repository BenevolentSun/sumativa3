import React from 'react';
import { useBuilder } from '../../context/BuilderContext';

/* ============================================================
   Navbar — Top navigation bar with view switcher
   ============================================================ */

export default function Navbar() {
  const { state, dispatch } = useBuilder();
  const { activeView } = state.ui;

  const navItems = [
    { id: 'home',      label: 'Inicio',    icon: 'bi-house-fill' },
    { id: 'selection', label: 'Explorar',  icon: 'bi-grid-fill' },
    { id: 'builder',   label: 'Builder', icon: 'bi-wrench-adjustable', disabled: !state.session.item },
    { id: 'dashboard', label: 'Builds',  icon: 'bi-collection-fill', count: state.builds.length },
  ];

  return (
    <header style={{
      background:    'var(--color-surface)',
      borderBottom:  'var(--border-1)',
      position:      'sticky',
      top:           0,
      zIndex:        100,
      boxShadow:     '0 2px 20px rgba(0,0,0,0.4)',
    }}>
      <div className="container-fluid px-3 px-md-4">
        <div className="d-flex align-items-center justify-content-between" style={{ height: 58 }}>

          {/* Logo */}
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dim))',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="bi bi-hexagon-fill" style={{ color: '#0a0b0f', fontSize: 13 }} />
            </div>
            <span style={{
              fontFamily:   'var(--font-display)',
              fontWeight:   700,
              fontSize:     '1.1rem',
              letterSpacing: '0.12em',
              color:         'var(--color-text)',
              textTransform: 'uppercase',
            }}>
              WF <span style={{ color: 'var(--color-gold)' }}>Builder</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="d-none d-md-flex align-items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && dispatch({ type: 'SET_VIEW', payload: item.id })}
                disabled={item.disabled}
                style={{
                  background:   activeView === item.id ? 'var(--color-gold-glow)' : 'transparent',
                  border:       activeView === item.id ? 'var(--border-gold)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  color:        activeView === item.id ? 'var(--color-gold)' : item.disabled ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
                  cursor:       item.disabled ? 'not-allowed' : 'pointer',
                  padding:      '6px 14px',
                  fontFamily:   'var(--font-display)',
                  fontWeight:   600,
                  fontSize:     '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          6,
                  transition:   'all var(--transition-fast)',
                  position:     'relative',
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: 13 }} />
                {item.label}
                {item.count > 0 && (
                  <span style={{
                    background:  'var(--color-gold)',
                    color:       'var(--color-bg)',
                    borderRadius: 10,
                    fontSize:    9,
                    fontWeight:  700,
                    padding:     '1px 5px',
                    lineHeight:  '14px',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
            {/* Desktop GitHub Link */}
            <a 
              href="https://github.com/Steban117"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: '16px',
                color: 'var(--color-text-dim)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-gold)';
                e.currentTarget.style.borderColor = 'var(--color-gold)';
                e.currentTarget.style.background = 'rgba(200,168,75,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-dim)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <i className="bi bi-github" style={{ fontSize: 14 }} />
              GitHub
            </a>
          </nav>

          {/* Mobile Nav */}
          <nav className="d-flex d-md-none align-items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && dispatch({ type: 'SET_VIEW', payload: item.id })}
                disabled={item.disabled}
                title={item.label}
                style={{
                  background:   activeView === item.id ? 'var(--color-gold-glow)' : 'transparent',
                  border:       activeView === item.id ? 'var(--border-gold)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  color:        activeView === item.id ? 'var(--color-gold)' : item.disabled ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
                  cursor:       item.disabled ? 'not-allowed' : 'pointer',
                  padding:      '7px 10px',
                  fontSize:     16,
                  position:     'relative',
                }}
              >
                <i className={`bi ${item.icon}`} />
                {item.count > 0 && (
                  <span style={{
                    position:    'absolute',
                    top: -3, right: -3,
                    background:  'var(--color-gold)',
                    color:       'var(--color-bg)',
                    borderRadius: 10,
                    fontSize:    8,
                    fontWeight:  700,
                    padding:     '1px 4px',
                    lineHeight:  '12px',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
            {/* Mobile GitHub Link */}
            <a 
              href="https://github.com/Steban117"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: '4px',
                color: 'var(--color-text-dim)',
                padding: '7px 10px',
                fontSize: 16,
              }}
            >
              <i className="bi bi-github" />
            </a>
          </nav>

        </div>
      </div>
    </header>
  );
}
