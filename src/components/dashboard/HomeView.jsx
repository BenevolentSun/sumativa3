import React from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { CATEGORY_MAP } from '../../hooks/useWarframeAPI';

/* ============================================================
   HomeView — Landing page / dashboard overview
   Hero + category quick-select + recent builds summary
   ============================================================ */

const CATEGORY_DESCRIPTIONS = {
  warframes:  'Mods de salud, escudos, armadura, energía y habilidades',
  primary:    'Rifles, escopetas, arcos y rifles de francotirador',
  secondary:  'Pistolas, armas arrojadizas y cañones de mano',
  melee:      'Espadas, bastones, armas de asta y hojas pesadas',
};

const CATEGORY_ICONS = {
  warframes:  '⬡',
  primary:    '✛',
  secondary:  '◎',
  melee:      '⚔',
};

export default function HomeView() {
  const { state, dispatch } = useBuilder();
  const recentBuilds = [...state.builds].reverse().slice(0, 3);

  return (
    <main>

      {/* ——— HERO ——— */}
      <section style={{
        position:   'relative',
        overflow:   'hidden',
        padding:    'var(--space-8) var(--space-4)',
        minHeight:  360,
        display:    'flex',
        alignItems: 'center',
        borderBottom: 'var(--border-1)',
      }}>
        {/* Official Background Image with dark fade */}
        <div style={{
          position:   'absolute',
          inset:      0,
          backgroundImage: `
            linear-gradient(to right, rgba(13,14,21,0.7) 0%, rgba(13,14,21,0) 40%),
            url('https://cdn.akamai.steamstatic.com/steam/apps/230410/page_bg_generated_v6b.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          pointerEvents:  'none',
          zIndex: 0
        }} />

        {/* Background decorative grid */}
        <div style={{
          position:   'absolute',
          inset:      0,
          backgroundImage: `
            linear-gradient(rgba(200,168,75,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,168,75,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents:  'none',
          zIndex: 1
        }} />

        {/* Radial glow */}
        <div style={{
          position:   'absolute',
          top:        '50%',
          left:       '25%',
          transform:  'translate(-50%, -50%)',
          width:      500,
          height:     500,
          borderRadius:'50%',
          background: 'radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 65%)',
          pointerEvents:'none',
        }} />

        <div className="container-fluid px-0" style={{ maxWidth: 1400, position: 'relative', zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              {/* Eyebrow */}
              <div style={{
                display:     'inline-flex',
                alignItems:  'center',
                gap:         8,
                background:  'var(--color-gold-glow)',
                border:      'var(--border-gold)',
                borderRadius:'var(--radius-md)',
                padding:     '4px 12px',
                marginBottom:'var(--space-4)',
              }}>
                <span style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     'var(--fs-xs)',
                  fontWeight:   700,
                  color:        'var(--color-gold)',
                  letterSpacing:'0.12em',
                  textTransform:'uppercase',
                }}>
                  Warframe Build Planner
                </span>
              </div>

              <h1 style={{
                fontFamily:   'var(--font-display)',
                fontWeight:   700,
                fontSize:     'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing:'0.06em',
                textTransform:'uppercase',
                lineHeight:   1.05,
                color:        'var(--color-text)',
                marginBottom: 'var(--space-4)',
              }}>
                Crea la
                <br />
                <span style={{ color: 'var(--color-gold)' }}>Build Perfecta.</span>
              </h1>

              <p style={{
                color:        'var(--color-text-muted)',
                fontSize:     'var(--fs-md)',
                maxWidth:     480,
                lineHeight:   1.7,
                marginBottom: 'var(--space-5)',
              }}>
                Explora el catálogo completo de Warframe, equipa mods, observa cómo tus estadísticas se recalculan en vivo y guarda builds ilimitadas en tu colección personal.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn-wf btn-wf-primary"
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
                  style={{ fontSize: 'var(--fs-md)', padding: 'var(--space-3) var(--space-5)' }}
                >
                  <i className="bi bi-grid-fill me-2" />Comenzar
                </button>
                {state.builds.length > 0 && (
                  <button
                    className="btn-wf btn-wf-energy"
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
                    style={{ fontSize: 'var(--fs-md)', padding: 'var(--space-3) var(--space-5)' }}
                  >
                    <i className="bi bi-collection-fill me-2" />
                    Mis Builds ({state.builds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Hero visual: Warframe Logo & GitHub link */}
            <div className="col-12 col-lg-6 d-none d-lg-flex justify-content-center">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 'var(--space-4)',
                width: '100%',
                maxWidth: '950px',
                marginTop: '-100px', // Pull it UP forcefully but maintain flow
              }}>
                {/* Interactive Logo */}
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <a href="https://www.warframe.com/" target="_blank" rel="noopener noreferrer">
                    <img 
                      src="https://cdn.akamai.steamstatic.com/steam/apps/230410/logo.png" 
                      alt="Warframe Logo" 
                      style={{
                        width: '100%',
                        maxWidth: '950px',
                        filter: 'drop-shadow(0 0 15px rgba(200,168,75,0.6)) brightness(1.2)',
                        transition: 'all 0.5s ease',
                        transformOrigin: 'center',
                        display: 'inline-block',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.filter = 'drop-shadow(0 0 25px rgba(200,168,75,0.9)) brightness(1.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(200,168,75,0.6)) brightness(1.2)';
                      }}
                    />
                  </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* ——— CATEGORIES ——— */}
      <section style={{ padding: 'var(--space-7) var(--space-4)', borderBottom: 'var(--border-1)' }}>
        <div className="container-fluid px-0" style={{ maxWidth: 1400 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--fs-xl)', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-text)', marginBottom: 'var(--space-5)',
          }}>
            Explorar por <span style={{ color: 'var(--color-gold)' }}>Categoría</span>
          </h2>
          <div className="row g-3">
            {Object.entries(CATEGORY_MAP).map(([id, meta]) => (
              <div key={id} className="col-6 col-md-3">
                <button
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: id })}
                  style={{
                    width: '100%',
                    position: 'relative',
                    background: 'linear-gradient(145deg, rgba(30, 32, 41, 0.7) 0%, rgba(15, 16, 21, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
                    padding: 'var(--space-5) var(--space-4)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    minHeight: '170px',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(200, 168, 75, 0.15) 0%, rgba(15, 16, 21, 0.95) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(200, 168, 75, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(200, 168, 75, 0.3)';
                    e.currentTarget.querySelector('.category-icon').style.transform = 'scale(1.2) translateY(-2px)';
                    e.currentTarget.querySelector('.category-icon').style.color = 'var(--color-gold)';
                    e.currentTarget.querySelector('.category-browse').style.letterSpacing = '0.15em';
                    e.currentTarget.querySelector('.category-bg').style.transform = 'scale(1.1) rotate(-10deg)';
                    e.currentTarget.querySelector('.category-bg').style.color = 'rgba(200, 168, 75, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(30, 32, 41, 0.7) 0%, rgba(15, 16, 21, 0.9) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.querySelector('.category-icon').style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.querySelector('.category-icon').style.color = 'rgba(255,255,255,0.2)';
                    e.currentTarget.querySelector('.category-browse').style.letterSpacing = '0.08em';
                    e.currentTarget.querySelector('.category-bg').style.transform = 'scale(1) rotate(0deg)';
                    e.currentTarget.querySelector('.category-bg').style.color = 'rgba(255,255,255,0.02)';
                  }}
                  aria-label={`Explorar ${meta.label}`}
                >
                  {/* Giant watermark icon in the background */}
                  <div className="category-bg" style={{ position: 'absolute', right: '15px', bottom: '10px', fontSize: '100px', color: 'rgba(255,255,255,0.02)', pointerEvents: 'none', transition: 'all 0.5s ease', lineHeight: 1, transformOrigin: 'center' }}>
                    {CATEGORY_ICONS[id]}
                  </div>

                  <span className="category-icon" style={{ fontSize: 28, lineHeight: 1, color: 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', transformOrigin: 'left center' }}>{CATEGORY_ICONS[id]}</span>
                  
                  <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--color-text)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
                      {CATEGORY_DESCRIPTIONS[id]}
                    </div>
                  </div>
                  
                  <div className="category-browse" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-gold)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'all 0.3s ease', marginTop: 'auto' }}>
                    Explorar <i className="bi bi-chevron-double-right" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— RECENT BUILDS ——— */}
      {recentBuilds.length > 0 && (
        <section style={{ padding: 'var(--space-7) var(--space-4)' }}>
          <div className="container-fluid px-0" style={{ maxWidth: 1400 }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'var(--fs-xl)', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--color-text)', margin: 0,
              }}>
                Builds <span style={{ color: 'var(--color-gold)' }}>Recientes</span>
              </h2>
              <button
                className="btn-wf"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
                style={{ fontSize: 'var(--fs-xs)' }}
              >
                Ver Todas <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>

            <div className="row g-3">
              {recentBuilds.map(build => (
                <div key={build.id} className="col-12 col-sm-6 col-md-4">
                  <div
                    className="surface card-lift"
                    style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
                    onClick={() => dispatch({ type: 'LOAD_BUILD_TO_SESSION', payload: { ...build } })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && dispatch({ type: 'LOAD_BUILD_TO_SESSION', payload: { ...build } })}
                    aria-label={`Load build ${build.name}`}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      background: 'var(--color-gold-glow)', border: 'var(--border-gold)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className="bi bi-hexagon-fill" style={{ color: 'var(--color-gold)', fontSize: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--color-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {build.name}
                      </p>
                      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {build.item?.name} · {build.slots.filter(Boolean).length}/8 mods
                      </p>
                    </div>
                    <i className="bi bi-arrow-right" style={{ color: 'var(--color-text-dim)', fontSize: 14 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
