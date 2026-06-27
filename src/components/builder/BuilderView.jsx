import React, { useState, useMemo } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { getItemImage, useFilteredMods, calculateStats } from '../../hooks/useWarframeAPI';
import ModCard from './ModCard';
import SaveBuildModal from './SaveBuildModal';

/* ============================================================
   BuilderView — Overframe-style 2-panel build interface
   Left: item header + blueprint + stats + mod slots
   Right: inline mod picker with filters + mod grid
   ============================================================ */

const POLARITIES = [
  { value: 'All', label: 'Todas' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Vazarin', label: 'Vazarin' },
  { value: 'Naramon', label: 'Naramon' },
  { value: 'Penjaga', label: 'Penjaga' },
  { value: 'Zenurik', label: 'Zenurik' },
  { value: 'Unairu', label: 'Unairu' },
  { value: 'Umbra', label: 'Umbra' },
];
const RARITIES = [
  { value: 'All', label: 'Todas' },
  { value: 'Common', label: 'Común' },
  { value: 'Uncommon', label: 'Poco Común' },
  { value: 'Rare', label: 'Raro' },
  { value: 'Legendary', label: 'Legendario' }
];
const SORT_OPTIONS = [
  { value: 'name',       label: 'Nombre A-Z' },
  { value: 'drain',      label: 'Costo ↑' },
  { value: 'drain_desc', label: 'Costo ↓' },
];

/* --- Stat definitions --- */
const WARFRAME_STATS = [
  { key: 'health',      label: 'Salud' },
  { key: 'shield',      label: 'Escudo' },
  { key: 'armor',       label: 'Armadura' },
  { key: 'power',       label: 'Energía' },
  { key: 'sprintSpeed', label: 'Velocidad', fmt: v => v?.toFixed(2) },
];

const WEAPON_STATS = [
  { key: 'criticalChance',     label: 'Probabilidad Crítica',    unit: '%', fmt: v => `${(v * 100).toFixed(1)}` },
  { key: 'criticalMultiplier', label: 'Daño Crítico',    unit: 'x', fmt: v => v?.toFixed(1) },
  { key: 'fireRate',           label: 'Cadencia de Fuego' },
  { key: 'magazineSize',       label: 'Cargador' },
  { key: 'accuracy',           label: 'Precisión',           fmt: v => v?.toFixed(1) },
  { key: 'reloadTime',         label: 'Recarga',             unit: 's', fmt: v => v?.toFixed(1) },
  { key: 'procChance',         label: 'Probabilidad de Estado',      unit: '%', fmt: v => `${(v * 100).toFixed(1)}` },
];

/* ---- Mod Slot sub-component (Overframe style) ---- */
function ModSlotOverframe({ index, slot, onOpenPicker, onUnequip, isAuraExilus, onUpdateRank }) {
  const [hovered, setHovered] = useState(false);
  const mod = slot ? slot.mod : null;
  const rank = slot ? slot.rank : 0;
  
  // Empty slot polarity indicator (placeholder logic for now)

  return (
    <div className={`mod-slot-wrapper ${isAuraExilus ? 'slot-small' : ''}`}>
      {/* Top Polarity indicator for the slot */}
      <div className="slot-polarity-indicator">
        <i className="bi bi-dash" />
        <i className="bi bi-caret-down-fill ms-1" style={{ fontSize: '8px' }} />
      </div>

      <div
        className={`mod-slot-of ${mod ? 'equipped' : 'empty'} ${isAuraExilus ? 'is-aura-exilus' : ''}`}
        onClick={() => !mod && onOpenPicker(index)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !mod && onOpenPicker(index)}
        title={mod ? `${mod.name}` : `Slot ${index + 1} — haz clic para añadir mod`}
      >
        {mod ? (
          // Re-use ModCard UI for equipped mod to guarantee exact visual match
          <ModCard 
            mod={mod} 
            onSelect={() => onOpenPicker(index)} 
            alreadyEquipped={false} 
            currentRank={rank}
            onUpdateRank={newRank => onUpdateRank(index, newRank)}
            inSlot={true}
          />
        ) : (
          <div className="slot-empty-wireframe" />
        )}
        
        {mod && hovered && (
          <button
            className="slot-remove-btn"
            onClick={e => { e.stopPropagation(); onUnequip(index); }}
            style={{ display: 'flex' }}
            title={`Remover ${mod.name}`}
          >
            <i className="bi bi-x" />
          </button>
        )}
      </div>
    </div>
  );
}


/* ---- Inline Stats (left panel) ---- */
function InlineStats({ item, slots, category, equippedDrain }) {
  const { base, totals } = useMemo(
    () => calculateStats(item, slots),
    [item, slots]
  );

  const isWarframe  = category === 'warframes' || category === 'companions';
  const statDefs    = isWarframe ? WARFRAME_STATS : WEAPON_STATS;
  const defaultFmt  = v => (typeof v === 'number' ? (v % 1 !== 0 ? v.toFixed(2) : v.toLocaleString()) : v);

  // Damage section for weapons
  const totalDamage = totals.damage ?? base.damage ?? 0;
  const critChance  = totals.criticalChance ?? base.criticalChance ?? 0;
  const critMult    = totals.criticalMultiplier ?? base.criticalMultiplier ?? 0;
  const fireRate    = totals.fireRate ?? base.fireRate ?? 0;
  const avgHit      = totalDamage * (1 + critChance * (critMult - 1));
  const burstDPS    = avgHit * fireRate;
  const sustainedDPS = burstDPS * 0.8; // simplified model

  // Warframe specific abilities
  const duration = totals.duration ?? base.duration ?? 1;
  const efficiency = totals.efficiency ?? base.efficiency ?? 1;
  const range = totals.range ?? base.range ?? 1;
  const strength = totals.strength ?? base.strength ?? 1;

  return (
    <>
      {/* Warframe Ability Stats (if applicable) */}
      {isWarframe && (
        <>
          <div className="stats-list-row">
            <span className="stat-label">Energía</span>
            <span className="stat-value">{totals.power ?? base.power ?? 0}</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Salud</span>
            <span className={`stat-value ${totals.health !== base.health ? 'buffed' : ''}`}>{totals.health ?? base.health ?? 0}</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Escudo</span>
            <span className={`stat-value ${totals.shield !== base.shield ? 'buffed' : ''}`}>{totals.shield ?? base.shield ?? 0}</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Velocidad</span>
            <span className={`stat-value ${totals.sprintSpeed !== base.sprintSpeed ? 'buffed' : ''}`}>{(totals.sprintSpeed ?? base.sprintSpeed ?? 1).toFixed(2)}</span>
          </div>
          
          <br style={{ display: 'block', margin: '4px 0' }} />

          <div className="stats-list-row">
            <span className="stat-label">Duración</span>
            <span className={`stat-value ${duration !== 1 ? (duration > 1 ? 'buffed' : 'nerfed') : ''}`}>{(duration * 100).toFixed(0)}%</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Eficiencia</span>
            <span className={`stat-value ${efficiency !== 1 ? (efficiency > 1 ? 'buffed' : 'nerfed') : ''}`}>{(efficiency * 100).toFixed(0)}%</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Rango</span>
            <span className={`stat-value ${range !== 1 ? (range > 1 ? 'buffed' : 'nerfed') : ''}`}>{(range * 100).toFixed(0)}%</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Fuerza</span>
            <span className={`stat-value ${strength !== 1 ? (strength > 1 ? 'buffed' : 'nerfed') : ''}`}>{(strength * 100).toFixed(0)}%</span>
          </div>
          
          <br style={{ display: 'block', margin: '4px 0' }} />
          
          <div className="stats-list-row">
            <span className="stat-label">Armadura</span>
            <span className={`stat-value ${totals.armor !== base.armor ? 'buffed' : ''}`}>{totals.armor ?? base.armor ?? 0}</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Reducción de Daño</span>
            <span className="stat-value">{(((totals.armor ?? base.armor ?? 0) / ((totals.armor ?? base.armor ?? 0) + 300)) * 100).toFixed(1)}%</span>
          </div>
          <div className="stats-list-row">
            <span className="stat-label">Salud Efectiva</span>
            <span className="stat-value">{((totals.health ?? base.health ?? 0) / (1 - ((totals.armor ?? base.armor ?? 0) / ((totals.armor ?? base.armor ?? 0) + 300))) + (totals.shield ?? base.shield ?? 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </>
      )}

      {/* Main stats */}
      {!isWarframe && (
        <div className="stats-list">
          {statDefs.map(def => {
            const bv = base[def.key];
            const mv = totals[def.key];
            if (!bv && !mv) return null;
            const fmt = def.fmt ?? defaultFmt;
            const display = mv ?? bv;
            const changed = mv != null && bv != null && Math.abs(mv - bv) > 0.01;
            const className = changed ? (mv > bv ? 'buffed' : 'nerfed') : '';

            return (
              <div className="stats-list-row" key={def.key}>
                <span className="stat-label">{def.label}</span>
                <span className={`stat-value ${className}`}>
                  {fmt(display)}{def.unit ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Damage section (weapons only) */}
      {!isWarframe && totalDamage > 0 && (
        <div className="damage-stats">
          <div className="stats-section-title">
            <i className="bi bi-crosshair me-1" style={{ fontSize: 10 }} />
            Daño
          </div>
          {item.damageTypes && Object.entries(item.damageTypes).length > 0 && (
            <>
              {Object.entries(item.damageTypes).map(([type, val]) => val > 0 && (
                <div className="damage-row" key={type}>
                  <span className="damage-label">
                    <i className="bi bi-square-fill me-1" style={{
                      fontSize: 6,
                      color: type === 'impact' ? 'var(--color-energy)' :
                             type === 'puncture' ? 'var(--color-stat-orange)' :
                             type === 'slash' ? 'var(--color-stat-red)' :
                             'var(--color-text-muted)'
                    }} />
                    {type}
                  </span>
                  <span className="damage-value">{val.toFixed(1)}</span>
                </div>
              ))}
            </>
          )}
          <div style={{ marginTop: 6 }}>
            <div className="damage-row">
              <span className="damage-label" style={{ fontWeight: 700 }}>Daño Total</span>
              <span className="damage-value">{totalDamage.toFixed(1)}</span>
            </div>
            <div className="damage-row">
              <span className="damage-label">Golpe Promedio</span>
              <span className="damage-value">{avgHit.toFixed(1)}</span>
            </div>
            <div className="damage-row">
              <span className="damage-label">DPS Ráfaga</span>
              <span className="damage-value">{burstDPS.toFixed(1)}</span>
            </div>
            <div className="damage-row">
              <span className="damage-label">DPS Sostenido</span>
              <span className="damage-value">{sustainedDPS.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---- Inline Mod Picker (right panel) ---- */
function InlineModPicker({ activeSlot, onEquip, equippedNames, category, item }) {
  const { mods, loading, error } = useFilteredMods(category, item);
  const [search,   setSearch]   = useState('');
  const [polarity, setPolarity] = useState('All');
  const [rarity,   setRarity]   = useState('All');
  const [sortBy,   setSortBy]   = useState('name');
  const [expanded, setExpanded] = useState(true);

  const filtered = useMemo(() => {
    let list = [...mods];

    // Strict slot filtering
    if (activeSlot === 0) {
      if (category === 'melee') {
        list = list.filter(m => m.type === 'Stance Mod' || (m.compatName || '').toUpperCase() === 'STANCE');
      } else {
        list = list.filter(m => m.type === 'Aura' || (m.compatName || '').toUpperCase() === 'AURA');
      }
    } else if (activeSlot === 1) {
      list = list.filter(m => m.subtype === 'Exilus' || m.isExilus === true || (m.compatName || '').toUpperCase() === 'EXILUS');
    } else if (activeSlot > 1) {
      list = list.filter(m => !(
        m.type === 'Aura' || (m.compatName || '').toUpperCase() === 'AURA' ||
        m.type === 'Stance Mod' || (m.compatName || '').toUpperCase() === 'STANCE'
      ));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name?.toLowerCase().includes(q));
    }
    if (polarity !== 'All') {
      list = list.filter(m => m.polarity?.toLowerCase() === polarity.toLowerCase());
    }
    if (rarity !== 'All') {
      list = list.filter(m => m.rarity === rarity);
    }
    list.sort((a, b) => {
      if (sortBy === 'name')       return a.name.localeCompare(b.name);
      if (sortBy === 'drain')      return (a.baseDrain ?? a.drain ?? 0) - (b.baseDrain ?? b.drain ?? 0);
      if (sortBy === 'drain_desc') return (b.baseDrain ?? b.drain ?? 0) - (a.baseDrain ?? a.drain ?? 0);
      return 0;
    });
    return list;
  }, [mods, search, polarity, rarity, sortBy, activeSlot, category]);

  return (
    <>
      {/* Filters bar */}
      <div className="mod-filters-bar">
        <div className="mod-filter-group">
          <span className="mod-filter-label">Polaridad</span>
          <select className="mod-filter-select" value={polarity} onChange={e => setPolarity(e.target.value)}>
            {POLARITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="mod-filter-group">
          <span className="mod-filter-label">Tipo</span>
          <select className="mod-filter-select" value="MODS" disabled>
            <option>MODS</option>
          </select>
        </div>
        <div className="mod-filter-group">
          <span className="mod-filter-label">Rareza</span>
          <select className="mod-filter-select" value={rarity} onChange={e => setRarity(e.target.value)}>
            {RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="mod-filter-group">
          <span className="mod-filter-label">Ordenar</span>
          <select className="mod-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 8, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-dim)', fontSize: 10, pointerEvents: 'none',
          }} />
          <input
            className="mod-search-input"
            type="search"
            placeholder="Buscar mods…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Expand Mods toggle */}
      <div className="expand-mods-toggle">
        <button
          className={`toggle-switch ${expanded ? 'active' : ''}`}
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle expand mods"
          style={{ width: 32, height: 16 }}
        />
        <label onClick={() => setExpanded(!expanded)}>Expandir Mods</label>
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-xs)',
          color: 'var(--color-text-dim)',
          fontWeight: 600,
        }}>
          {activeSlot !== null ? `Slot ${activeSlot + 1}` : 'Selecciona un slot'}
          {' · '}
          {filtered.length} mods
        </span>
      </div>

      {/* Mod grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-7)' }}>
            <div className="spinner-border" style={{ color: 'var(--color-accent-blue)', width: 24, height: 24 }} role="status" />
            <p style={{ color: 'var(--color-text-muted)', marginTop: 10, fontSize: 'var(--fs-sm)' }}>Cargando mods…</p>
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--color-stat-red)', textAlign: 'center', padding: 'var(--space-6)' }}>
            <i className="bi bi-exclamation-triangle-fill me-1" />
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-7) 0' }}>
            <i className="bi bi-search" style={{ fontSize: 24, color: 'var(--color-text-dim)', display: 'block', marginBottom: 8 }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>Ningún mod coincide con los filtros</p>
          </div>
        )}

        {!loading && !error && expanded && (
          <div className="mod-grid-of">
            {filtered.map(mod => (
              <ModCard
                key={mod.uniqueName ?? mod.name}
                mod={mod}
                onSelect={onEquip}
                alreadyEquipped={equippedNames.has(mod.name)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}


/* ============================================================
   MAIN BUILDER VIEW
   ============================================================ */
export default function BuilderView() {
  const { state, dispatch, equippedDrain, totalCapacity, showToast } = useBuilder();
  const { item, slots, category, editingBuildId, orokinReactor } = state.session;

  const [pickerSlot,    setPickerSlot]    = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [imgError,      setImgError]      = useState(false);

  const equippedModNames = useMemo(
    () => new Set(slots.filter(Boolean).map(s => s.mod.name)),
    [slots]
  );

  if (!item) {
    return (
      <main style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Ningún objeto seleccionado. Ve a Explorar para elegir uno.</p>
        <button className="btn-wf mt-3" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}>
          <i className="bi bi-grid-fill me-2" />Explorar Objetos
        </button>
      </main>
    );
  }

  const handleUnequip = (index) => {
    const modName = slots[index]?.mod?.name;
    dispatch({ type: 'UNEQUIP_MOD', payload: { slotIndex: index } });
    if (modName) showToast(`${modName} removido`, 'info');
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_BUILD' });
    showToast('Se limpiaron todos los mods', 'info');
  };

  const handleUpdateRank = (index, rank) => {
    dispatch({ type: 'UPDATE_MOD_RANK', payload: { slotIndex: index, rank } });
  };

  const handleEquipFromPicker = (mod) => {
    const isAuraOrStance = mod.type === 'Aura' || (mod.compatName || '').toUpperCase() === 'AURA' || mod.type === 'Stance Mod' || (mod.compatName || '').toUpperCase() === 'STANCE';
    const isExilus = mod.subtype === 'Exilus' || mod.isExilus === true || (mod.compatName || '').toUpperCase() === 'EXILUS';

    let targetSlot = pickerSlot;
    
    // Auto-slotting logic if no specific slot was clicked
    if (targetSlot === null) {
      if (isAuraOrStance) {
        targetSlot = 0;
      } else if (isExilus && slots[1] === null) {
        targetSlot = 1;
      } else {
        targetSlot = slots.findIndex((s, i) => i > 1 && s === null);
      }
    }

    // Strict validation
    if (targetSlot === 0 && !isAuraOrStance) {
      showToast('Solo se pueden colocar mods de Aura o Guardia en este espacio.', 'error');
      return;
    }
    if (targetSlot > 1 && isAuraOrStance) {
      showToast('Los mods de Aura/Guardia deben ir en el espacio superior.', 'error');
      return;
    }

    if (targetSlot === -1) {
      showToast('Todos los espacios están llenos', 'error');
      return;
    }

    dispatch({ type: 'EQUIP_MOD', payload: { slotIndex: targetSlot, mod } });
    showToast(`${mod.name} equipado`, 'success');
    setPickerSlot(null);
  };

  const drainPct = Math.min(100, Math.max(0, (equippedDrain / totalCapacity) * 100));
  const equippedCount = slots.filter(Boolean).length;
  const imgUrl = getItemImage(item.imageName);

  return (
    <main>
      <div className="builder-layout">

        {/* =========== LEFT PANEL =========== */}
        <div className="builder-left">

          {/* Header: "NEW BUILD: ITEM NAME" + Save */}
          <div className="builder-header">
            <h1>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', fontSize: 14, padding: 0,
                  display: 'flex', alignItems: 'center',
                  transition: 'color var(--transition-fast)',
                }}
                title="Volver a la selección"
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent-blue)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <i className="bi bi-arrow-left" />
              </button>
              {editingBuildId ? 'EDITAR' : 'NUEVA'} BUILD:{' '}
              <span className="item-name-accent">{item.name.toUpperCase()}</span>
            </h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn-wf btn-wf-primary"
                onClick={() => setShowSaveModal(true)}
                style={{ padding: '5px 16px', fontSize: 'var(--fs-xs)' }}
              >
                Guardar
              </button>
            </div>
          </div>

          {/* Reaction badges row */}
          <div style={{
            padding: '6px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 13, cursor: 'pointer' }} title="Like">👍 <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>0</span></span>
            <span style={{ fontSize: 13, cursor: 'pointer' }} title="Dislike">👎 <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>0</span></span>
            <span style={{ fontSize: 13, cursor: 'pointer' }} title="Forma">🔵 <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>0</span></span>

            {item.description && (
              <p style={{
                margin: 0, marginLeft: 8,
                fontSize: 'var(--fs-xs)',
                color: 'var(--color-text-dim)',
                fontStyle: 'italic',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {item.description}
              </p>
            )}
          </div>

          {/* Item Rank + Capacity section */}
          <div className="item-rank-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="rank-label">Rango del Objeto</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'var(--fs-xs)', color: 'var(--color-text)',
                background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: '4px',
                border: '1px solid var(--color-border)'
              }}>30</span>
            </div>
            <div className="rank-bar-container">
              <span className="rank-label" style={{ minWidth: 60, textAlign: 'center', fontWeight: 700 }}>
                {totalCapacity - equippedDrain} / {totalCapacity}
              </span>
              <div className="rank-bar-track">
                <div className={`rank-bar-fill ${equippedDrain > totalCapacity ? 'overflow' : 'safe'}`} style={{ width: `${drainPct}%` }} />
              </div>
            </div>
          </div>

          {/* Item stats section */}
          <div className="stats-list">
            {/* Toggle-style rows */}
            <div className="toggle-row">
                <span className="stat-label" style={{
                  fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-display)',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--color-text-muted)'
                }}>Reactor Orokin</span>
              <button 
                className={`toggle-switch ${orokinReactor ? 'active' : ''}`} 
                onClick={() => dispatch({ type: 'TOGGLE_REACTOR', payload: !orokinReactor })}
                title="Activar Reactor Orokin (duplica capacidad)" 
              />
            </div>
            <div className="toggle-row">
              <span className="stat-label" style={{
                fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-display)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--color-text-muted)'
              }}>Aplicar Condicionales</span>
              <button className="toggle-switch" title="Aplicar Condicionales" />
            </div>

            <hr className="divider-gold" style={{ margin: '8px 0' }} />

            <hr className="divider-gold" style={{ margin: '8px 0' }} />
          </div>

          {/* Blueprint / Item image area */}
          <div className="blueprint-area">
            <div className="blueprint-grid" />
            <div className="blueprint-glow" />
            {imgUrl && !imgError ? (
              <img
                src={imgUrl}
                alt={item.name}
                onError={() => setImgError(true)}
              />
            ) : (
              <i className="bi bi-image" style={{
                fontSize: 48, color: 'var(--color-text-dim)', opacity: 0.3,
                position: 'relative', zIndex: 1,
              }} />
            )}
          </div>

          {/* Mod slots grid (4x2) */}
          <div style={{
            padding: '10px 20px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}>
              Config. Mods ({equippedCount}/8)
            </span>
            {equippedCount > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-stat-red)', fontSize: 'var(--fs-xs)',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  transition: 'opacity var(--transition-fast)',
                }}
                title="Limpiar todos los mods"
              >
                <i className="bi bi-trash3-fill me-1" style={{ fontSize: 10 }} />
                Limpiar
              </button>
            )}
          </div>
          <div className="mod-slots-container">
            {/* Top row: Aura/Stance and Exilus */}
            {category !== 'companions' && (
              <div className="mod-slots-top-row">
                {(category === 'warframes' || category === 'melee') && (
                  <ModSlotOverframe
                    key={0}
                    index={0}
                    slot={slots[0]}
                    onOpenPicker={setPickerSlot}
                    onUnequip={handleUnequip}
                    isAuraExilus={true}
                    onUpdateRank={handleUpdateRank}
                  />
                )}
                
                {(category === 'warframes' || category === 'primary' || category === 'secondary') && (
                  <ModSlotOverframe
                    key={1}
                    index={1}
                    slot={slots[1]}
                    onOpenPicker={setPickerSlot}
                    onUnequip={handleUnequip}
                    isAuraExilus={true}
                    onUpdateRank={handleUpdateRank}
                  />
                )}
              </div>
            )}
            
            {/* Bottom grid: 8 standard slots */}
            <div className="mod-slots-grid">
              {slots.slice(2, 10).map((slot, indexOffset) => {
                const i = indexOffset + 2;
                return (
                  <ModSlotOverframe
                    key={i}
                    index={i}
                    slot={slot}
                    onOpenPicker={setPickerSlot}
                    onUnequip={handleUnequip}
                    isAuraExilus={false}
                    onUpdateRank={handleUpdateRank}
                  />
                );
              })}
            </div>
          </div>

          {/* Modded stats (shows deltas from mods) */}
          <div className="stats-list" style={{ marginTop: '20px' }}>
            <InlineStats
              item={item}
              slots={slots}
              category={category}
              equippedDrain={equippedDrain}
            />
          </div>

          {/* Action buttons */}
          <div className="builder-actions">
            <button className="btn-wf btn-wf-primary" onClick={() => setShowSaveModal(true)}>
              <i className={`bi ${editingBuildId ? 'bi-arrow-repeat' : 'bi-floppy-fill'} me-1`} />
              {editingBuildId ? 'Actualizar Build' : 'Guardar Build'}
            </button>
            <button
              className="btn-wf btn-wf-energy"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
            >
              <i className="bi bi-collection-fill me-1" />
              Mis Builds
            </button>
            <button
              className="btn-wf"
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: category })}
            >
              <i className="bi bi-arrow-left-circle me-1" />
              Cambiar Objeto
            </button>
          </div>
        </div>

        {/* =========== RIGHT PANEL =========== */}
        <div className="builder-right">
          <InlineModPicker
            activeSlot={pickerSlot}
            onEquip={handleEquipFromPicker}
            equippedNames={equippedModNames}
            category={category}
            item={item}
          />
        </div>

      </div>

      {/* Save build modal */}
      {showSaveModal && (
        <SaveBuildModal onClose={() => setShowSaveModal(false)} />
      )}
    </main>
  );
}
