import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getItemImage, CATEGORY_MAP } from '../../hooks/useWarframeAPI';

/* ============================================================
   DashboardView — Browse, load, and delete saved builds
   ============================================================ */

function ConfirmDeleteModal({ buildName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content-wf" style={{ maxWidth: 400 }}>
        <div style={{ padding: 'var(--space-5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-3)',
            }}>
              <i className="bi bi-trash3-fill" style={{ color: 'var(--color-stat-red)', fontSize: 22 }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-xl)', color: 'var(--color-text)', margin: '0 0 8px' }}>
              ¿Eliminar Build?
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', margin: 0 }}>
              <strong style={{ color: 'var(--color-text)' }}>"{buildName}"</strong> será eliminada permanentemente.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="d-flex gap-3 justify-content-center">
            <button className="btn-wf" onClick={onCancel}>Cancelar</button>
            <button className="btn-wf btn-wf-danger" onClick={onConfirm}>
              <i className="bi bi-trash3-fill me-1" />Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildCard({ build, onLoad, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = getItemImage(build.item?.imageName);
  const equippedMods = (build.slots ?? []).filter(Boolean);
  const catLabel = CATEGORY_MAP[build.category]?.label ?? build.category;
  const updatedDate = new Date(build.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <article className="surface card-lift" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Item image banner */}
      <div style={{
        height: 110,
        background: 'linear-gradient(180deg, #0d0f1a, #070810)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(200,168,75,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {imgUrl && !imgError ? (
          <img
            src={imgUrl}
            alt={build.item?.name}
            onError={() => setImgError(true)}
            style={{ maxHeight: '85%', maxWidth: '75%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))', position: 'relative', zIndex: 1 }}
          />
        ) : (
          <i className="bi bi-hexagon-fill" style={{ fontSize: 38, color: 'var(--color-gold)', opacity: 0.3 }} />
        )}

        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 8, left: 8,
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(0,0,0,0.65)', border: 'var(--border-1)',
          borderRadius: 'var(--radius-sm)', padding: '2px 8px',
          color: 'var(--color-text-muted)',
        }}>
          {catLabel}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 'var(--fs-md)', color: 'var(--color-text)',
          letterSpacing: '0.04em', margin: 0, lineHeight: 1.2,
        }}>
          {build.name}
        </h3>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {build.item?.name}
        </p>

        {/* Mods preview */}
        <div className="d-flex flex-wrap gap-1 mt-1">
          {equippedMods.length > 0 ? (
            equippedMods.slice(0, 4).map((mod, i) => (
              <span key={i} style={{
                fontSize: 9,
                background: 'var(--color-surface-2)',
                border: 'var(--border-2)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 6px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {mod.name}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>Sin mods equipados</span>
          )}
          {equippedMods.length > 4 && (
            <span style={{ fontSize: 9, color: 'var(--color-text-dim)', alignSelf: 'center' }}>
              +{equippedMods.length - 4} más
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2" style={{ borderTop: 'var(--border-1)', paddingTop: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>
            {equippedMods.length}/8 mods · {updatedDate}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex" style={{ borderTop: 'var(--border-1)' }}>
        <button
          className="btn-wf btn-wf-energy"
          onClick={() => onLoad(build)}
          style={{ flex: 1, borderRadius: '0 0 0 var(--radius-lg)', border: 'none', borderRight: 'var(--border-1)', justifyContent: 'center', padding: 'var(--space-2)' }}
        >
          <i className="bi bi-pencil-fill me-1" />Editar
        </button>
        <button
          className="btn-wf btn-wf-danger"
          onClick={() => onDelete(build)}
          style={{ flex: 0, borderRadius: '0 0 var(--radius-lg) 0', border: 'none', padding: 'var(--space-2) var(--space-4)', justifyContent: 'center' }}
          aria-label={`Delete build ${build.name}`}
        >
          <i className="bi bi-trash3-fill" />
        </button>
      </div>
    </article>
  );
}

export default function DashboardView() {
  const { state, dispatch, showToast } = useBuilder();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = state.builds.filter(b => {
    const matchSearch = !search.trim() || b.name.toLowerCase().includes(search.toLowerCase()) || b.item?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'all' || b.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleLoad = (build) => {
    dispatch({
      type:    'LOAD_BUILD_TO_SESSION',
      payload: { ...build },
    });
    showToast(`"${build.name}" cargada`, 'info');
  };

  const handleDeleteConfirm = () => {
    dispatch({ type: 'DELETE_BUILD', payload: { id: deleteTarget.id } });
    showToast(`"${deleteTarget.name}" eliminada`, 'error');
    setDeleteTarget(null);
  };

  const categories = ['all', ...new Set(state.builds.map(b => b.category).filter(Boolean))];

  return (
    <main style={{ padding: 'var(--space-5) var(--space-4)' }}>
      <div className="container-fluid px-0" style={{ maxWidth: 1400 }}>

        {/* Header */}
        <div className="d-flex align-items-start align-items-sm-center justify-content-between flex-column flex-sm-row gap-3 mb-4">
          <section>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--fs-2xl)', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text)', margin: 0,
            }}>
              Mis <span style={{ color: 'var(--color-gold)' }}>Builds</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', margin: 0 }}>
              {state.builds.length} build{state.builds.length !== 1 ? 's' : ''} guardada{state.builds.length !== 1 ? 's' : ''}
            </p>
          </section>
          <button
            className="btn-wf btn-wf-primary"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
          >
            <i className="bi bi-plus-lg me-1" />Nueva Build
          </button>
        </div>

        {/* Filters */}
        {state.builds.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)', fontSize: 12, pointerEvents: 'none' }} />
              <input
                className="input-wf"
                type="search"
                placeholder="Buscar builds…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 28 }}
              />
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  style={{
                    background:    filterCat === cat ? 'var(--color-gold-glow)' : 'var(--color-surface)',
                    border:        filterCat === cat ? 'var(--border-gold)' : 'var(--border-1)',
                    borderRadius:  'var(--radius-md)',
                    color:         filterCat === cat ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    cursor:        'pointer',
                    padding:       '6px 14px',
                    fontFamily:    'var(--font-display)',
                    fontWeight:    600,
                    fontSize:      'var(--fs-xs)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    transition:    'all var(--transition-fast)',
                  }}
                >
                  {cat === 'all' ? 'Todas' : (CATEGORY_MAP[cat]?.label ?? cat)}
                </button>
              ))}
            </div>
          </div>
        )}

        <hr className="divider-gold" style={{ margin: '0 0 var(--space-4)' }} />

        {/* Empty state */}
        {state.builds.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--color-gold-glow)', border: 'var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}>
              <i className="bi bi-collection-fill" style={{ fontSize: 32, color: 'var(--color-gold)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-xl)', color: 'var(--color-text)', marginBottom: 8 }}>
              Aún No Hay Builds
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Selecciona un objeto y configura tus mods para crear tu primera build.
            </p>
            <button
              className="btn-wf btn-wf-primary"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
            >
              <i className="bi bi-plus-lg me-1" />Crear Primera Build
            </button>
          </div>
        )}

        {/* No filtered results */}
        {state.builds.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-7) 0' }}>
            <i className="bi bi-search" style={{ fontSize: 32, color: 'var(--color-text-dim)', display: 'block', marginBottom: 10 }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Ninguna build coincide con tus filtros</p>
          </div>
        )}

        {/* Build grid */}
        {filtered.length > 0 && (
          <div className="row g-3">
            {filtered.map(build => (
              <div key={build.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <BuildCard
                  build={build}
                  onLoad={handleLoad}
                  onDelete={setDeleteTarget}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          buildName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
