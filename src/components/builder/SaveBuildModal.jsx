import React, { useState, useEffect } from 'react';
import { useBuilder } from '../../context/BuilderContext';

/* ============================================================
   SaveBuildModal — Dialog to name and persist a build
   Handles both CREATE and UPDATE flows
   ============================================================ */

export default function SaveBuildModal({ onClose }) {
  const { state, dispatch, showToast } = useBuilder();
  const { session } = state;
  const isEditing = !!session.editingBuildId;

  // Pre-fill name if editing
  const existingBuild = isEditing
    ? state.builds.find(b => b.id === session.editingBuildId)
    : null;

  const [name, setName] = useState(existingBuild?.name ?? `${session.item?.name ?? 'My'} Build`);
  const [error, setError] = useState('');

  useEffect(() => {
    // Focus the input on mount
    const t = setTimeout(() => document.getElementById('build-name-input')?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('El nombre de la build no puede estar vacío');
      return;
    }
    if (trimmed.length > 60) {
      setError('El nombre debe tener 60 caracteres o menos');
      return;
    }

    if (isEditing) {
      dispatch({ type: 'UPDATE_BUILD', payload: { id: session.editingBuildId, name: trimmed } });
      showToast('¡Build actualizada!', 'success');
    } else {
      dispatch({ type: 'SAVE_BUILD', payload: { name: trimmed } });
      showToast('¡Build guardada!', 'success');
    }
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  const equippedMods = session.slots.filter(Boolean);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content-wf" style={{ maxWidth: 480 }}>

        {/* Header */}
        <div style={{
          padding:    'var(--space-4) var(--space-5)',
          borderBottom:'var(--border-1)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     'var(--fs-xl)',
            letterSpacing:'0.08em',
            textTransform:'uppercase',
            margin:       0,
          }}>
            {isEditing ? (
              <>Actualizar <span style={{ color: 'var(--color-gold)' }}>Build</span></>
            ) : (
              <>Guardar <span style={{ color: 'var(--color-gold)' }}>Build</span></>
            )}
          </h2>
          <button
            onClick={onClose}
            style={{ background:'none', border:'none', color:'var(--color-text-muted)', cursor:'pointer', fontSize:20 }}
            aria-label="Close dialog"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-5)' }}>

          {/* Build summary */}
          <div style={{
            background:   'var(--color-surface-2)',
            border:       'var(--border-2)',
            borderRadius: 'var(--radius-md)',
            padding:      'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display:      'flex',
            alignItems:   'center',
            gap:          'var(--space-3)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'var(--color-gold-glow)',
              border:     'var(--border-gold)',
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="bi bi-hexagon-fill" style={{ color: 'var(--color-gold)', fontSize: 18 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)', margin: 0, fontSize: 'var(--fs-md)' }}>
                {session.item?.name}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-xs)', margin: 0, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {equippedMods.length} mod{equippedMods.length !== 1 ? 's' : ''} equipado{equippedMods.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Name input */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="build-name-input"
              style={{
                display:      'block',
                fontFamily:   'var(--font-display)',
                fontWeight:   600,
                fontSize:     'var(--fs-xs)',
                textTransform:'uppercase',
                letterSpacing:'0.08em',
                color:        'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Nombre de la Build
            </label>
            <input
              id="build-name-input"
              className="input-wf"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={handleKey}
              maxLength={60}
              placeholder="Ingresa un nombre para esta build…"
              aria-required="true"
              aria-describedby={error ? 'name-error' : undefined}
            />
            <div className="d-flex justify-content-between mt-1">
              {error ? (
                <span id="name-error" style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-stat-red)' }}>
                  <i className="bi bi-exclamation-circle me-1" />{error}
                </span>
              ) : <span />}
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-dim)' }}>
                {name.length}/60
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 justify-content-end">
            <button className="btn-wf" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-wf btn-wf-primary" onClick={handleSave}>
              <i className={`bi ${isEditing ? 'bi-arrow-repeat' : 'bi-floppy-fill'} me-1`} />
              {isEditing ? 'Actualizar Build' : 'Guardar Build'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
