import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

/* ============================================================
   BuilderContext — Global state for the Warframe Build Planner
   Handles: active build session, saved builds (CRUD), UI state
   ============================================================ */

const LS_KEY = 'wf_builder_builds_v2';

// --- Initial state shape ---
const initialState = {
  // Current build session
  session: {
    item:     null,       // full item object from API
    category: null,       // 'warframes' | 'primary' | 'secondary' | 'companions'
    slots:    Array(10).fill(null), // 10 slots: 0=Aura/Stance, 1=Exilus, 2-9=Regular
    editingBuildId: null, // if editing an existing build
    orokinReactor: true,  // true = double capacity
  },
  // Persisted builds from localStorage
  builds: [],
  // UI state
  ui: {
    activeView:    'home',      // 'home' | 'selection' | 'builder' | 'dashboard'
    activeCategory: null,
    toast: null,               // { message, type } or null
  },
};

// --- Reducer ---
function reducer(state, action) {
  switch (action.type) {

    // --- Session ---
    case 'SET_ITEM':
      return {
        ...state,
        session: {
          ...initialState.session,
          item:     action.payload.item,
          category: action.payload.category,
        },
        ui: { ...state.ui, activeView: 'builder' },
      };

    case 'EQUIP_MOD': {
      const slots = [...state.session.slots];
      slots[action.payload.slotIndex] = {
        mod: action.payload.mod,
        rank: action.payload.mod.fusionLimit ?? 0 // default to max rank
      };
      return { ...state, session: { ...state.session, slots } };
    }

    case 'UNEQUIP_MOD': {
      const slots = [...state.session.slots];
      slots[action.payload.slotIndex] = null;
      return { ...state, session: { ...state.session, slots } };
    }

    case 'UPDATE_MOD_RANK': {
      const slots = [...state.session.slots];
      const slot = slots[action.payload.slotIndex];
      if (slot) {
        slots[action.payload.slotIndex] = {
          ...slot,
          rank: action.payload.rank
        };
      }
      return { ...state, session: { ...state.session, slots } };
    }

    case 'TOGGLE_REACTOR':
      return {
        ...state,
        session: { ...state.session, orokinReactor: action.payload }
      };

    case 'CLEAR_BUILD':
      return {
        ...state,
        session: {
          ...state.session,
          slots: Array(10).fill(null),
          editingBuildId: null,
        },
      };

    case 'LOAD_BUILD_TO_SESSION':
      // Migrate old array length
      let loadedSlots = action.payload.slots;
      if (loadedSlots.length === 8) {
        loadedSlots = [null, null, ...loadedSlots];
      }
      
      // Migrate old mod objects to { mod, rank } structure
      loadedSlots = loadedSlots.map(slot => {
        if (!slot) return null;
        // If it's already { mod, rank }
        if (slot.mod && slot.rank !== undefined) return slot;
        // Otherwise, it was just the mod object
        return { mod: slot, rank: slot.fusionLimit ?? 0 };
      });
        
      return {
        ...state,
        session: {
          item:           action.payload.item,
          category:       action.payload.category,
          slots:          loadedSlots,
          editingBuildId: action.payload.id,
          orokinReactor:  action.payload.orokinReactor ?? true,
        },
        ui: { ...state.ui, activeView: 'builder' },
      };

    // --- CRUD Builds ---
    case 'SAVE_BUILD': {
      const newBuild = {
        id:        Date.now().toString(),
        name:      action.payload.name,
        item:      state.session.item,
        category:  state.session.category,
        slots:     state.session.slots,
        orokinReactor: state.session.orokinReactor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        builds: [...state.builds, newBuild],
        session: { ...state.session, editingBuildId: newBuild.id },
      };
    }

    case 'UPDATE_BUILD': {
      const updated = state.builds.map(b =>
        b.id === action.payload.id
          ? {
              ...b,
              name:      action.payload.name,
              slots:     state.session.slots,
              orokinReactor: state.session.orokinReactor,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      return { ...state, builds: updated };
    }

    case 'DELETE_BUILD':
      return {
        ...state,
        builds: state.builds.filter(b => b.id !== action.payload.id),
        session: state.session.editingBuildId === action.payload.id
          ? { ...state.session, editingBuildId: null }
          : state.session,
      };

    case 'HYDRATE_BUILDS':
      return { ...state, builds: action.payload };

    // --- UI ---
    case 'SET_VIEW':
      return { ...state, ui: { ...state.ui, activeView: action.payload } };

    case 'SET_CATEGORY':
      return { ...state, ui: { ...state.ui, activeView: 'selection', activeCategory: action.payload } };

    case 'SHOW_TOAST':
      return { ...state, ui: { ...state.ui, toast: { message: action.payload.message, type: action.payload.type } } };

    case 'CLEAR_TOAST':
      return { ...state, ui: { ...state.ui, toast: null } };

    default:
      return state;
  }
}

// --- Context ---
const BuilderContext = createContext(null);

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) dispatch({ type: 'HYDRATE_BUILDS', payload: JSON.parse(raw) });
    } catch (e) {
      console.warn('[BuilderContext] Could not read localStorage:', e);
    }
  }, []);

  // Persist builds to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state.builds));
    } catch (e) {
      console.warn('[BuilderContext] Could not write localStorage:', e);
    }
  }, [state.builds]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!state.ui.toast) return;
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3200);
    return () => clearTimeout(t);
  }, [state.ui.toast]);

  /* ---- Derived helpers ---- */
  const equippedDrain = state.session.slots.reduce((sum, slot, index) => {
    if (!slot || !slot.mod) return sum;
    const { mod, rank } = slot;
    let cost = (mod.baseDrain ?? 0) + rank;
    
    // Auras (Slot 0) often add capacity (negative drain). The API might represent this directly.
    // If it's in the Aura slot and is an Aura mod, it typically adds to capacity.
    if (index === 0 && (mod.type === 'Aura' || mod.compatName === 'AURA')) {
      cost = -Math.abs(cost); // Auras give capacity
    }
    
    return sum + cost;
  }, 0);

  // Base capacity for a Warframe/Weapon is 30. With a reactor/catalyst it's 60.
  const isReactorActive = state.session.orokinReactor;
  const totalCapacity = isReactorActive ? 60 : 30;

  const showToast = useCallback((message, type = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
  }, []);

  return (
    <BuilderContext.Provider value={{ state, dispatch, equippedDrain, totalCapacity, showToast }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
}
