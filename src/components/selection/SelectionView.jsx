import React, { useState, useMemo } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { useWarframeAPI, CATEGORY_MAP } from '../../hooks/useWarframeAPI';
import ItemCard from '../ui/ItemCard';
import SkeletonGrid from '../ui/SkeletonGrid';

/* ============================================================
   SelectionView — Browse and pick items by category
   ============================================================ */

const CATEGORIES = Object.entries(CATEGORY_MAP).map(([id, meta]) => ({ id, ...meta }));

export default function SelectionView() {
  const { state, dispatch } = useBuilder();
  const [search, setSearch]   = useState('');
  const [activeCategory, setActiveCat] = useState(state.ui.activeCategory ?? 'warframes');

  const { data, loading, error } = useWarframeAPI(activeCategory);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(item =>
      item.name?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleSelectItem = (item) => {
    dispatch({ type: 'SET_ITEM', payload: { item, category: activeCategory } });
  };

  const handleCategoryChange = (catId) => {
    setActiveCat(catId);
    setSearch('');
  };

  return (
    <main style={{ padding: 'var(--space-5) var(--space-4)' }}>
      <div className="container-fluid px-0" style={{ maxWidth: 1400 }}>

        {/* Header */}
        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h1 style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     'var(--fs-2xl)',
            letterSpacing:'0.08em',
            textTransform:'uppercase',
            color:        'var(--color-text)',
            marginBottom: 4,
          }}>
            Seleccionar <span style={{ color: 'var(--color-gold)' }}>Objeto</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            Elige un Warframe, arma o compañero para empezar
          </p>
        </section>

        {/* Category tabs + Search row */}
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4">

          {/* Category pills */}
          <nav className="d-flex gap-2 flex-wrap" role="tablist" aria-label="Item categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  background:    activeCategory === cat.id ? 'var(--color-gold-glow)' : 'var(--color-surface)',
                  border:        activeCategory === cat.id ? 'var(--border-gold)' : 'var(--border-1)',
                  borderRadius:  'var(--radius-md)',
                  color:         activeCategory === cat.id ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  cursor:        'pointer',
                  padding:       '7px 14px',
                  fontFamily:    'var(--font-display)',
                  fontWeight:    600,
                  fontSize:      'var(--fs-sm)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           6,
                  transition:    'all var(--transition-fast)',
                  whiteSpace:    'nowrap',
                }}
              >
                <i className={`bi ${cat.icon}`} style={{ fontSize: 13 }} />
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: 220, flex: '0 0 auto' }}>
            <i className="bi bi-search" style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-dim)', fontSize: 13, pointerEvents: 'none',
            }} />
            <input
              className="input-wf"
              type="search"
              placeholder="Buscar objetos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30 }}
              aria-label="Search items"
            />
          </div>
        </div>

        <hr className="divider-gold" style={{ margin: '0 0 var(--space-4)' }} />

        {/* Count indicator */}
        {!loading && !error && (
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)', marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {filtered.length} {filtered.length === 1 ? 'objeto encontrado' : 'objetos encontrados'}
          </p>
        )}

        {/* Grid content */}
        {loading && <SkeletonGrid count={18} />}

        {error && (
          <div style={{
            background:   'rgba(231,76,60,0.08)',
            border:       '1px solid rgba(231,76,60,0.3)',
            borderRadius: 'var(--radius-lg)',
            padding:      'var(--space-6)',
            textAlign:    'center',
          }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 28, color: 'var(--color-stat-red)', display: 'block', marginBottom: 12 }} />
            <p style={{ color: 'var(--color-stat-red)', marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0 }}>Error cargando objetos</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', marginTop: 6 }}>
              Revisa tu conexión e intenta de nuevo.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <i className="bi bi-search" style={{ fontSize: 36, color: 'var(--color-text-dim)', display: 'block', marginBottom: 12 }} />
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              No se encontraron resultados para "{search}"
            </p>
            <button className="btn-wf mt-3" onClick={() => setSearch('')}>
              Limpiar búsqueda
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="row g-3">
            {filtered.map(item => (
              <div key={item.uniqueName ?? item.name} className="col-6 col-sm-4 col-md-3 col-xl-2">
                <ItemCard item={item} onSelect={handleSelectItem} />
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
