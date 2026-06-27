import { useState, useEffect, useRef } from 'react';

/* ============================================================
   useWarframeAPI — Data fetching hook for warframestat.us
   Handles: caching (in-memory), loading/error states
   ============================================================ */

const BASE = 'https://api.warframestat.us';

// Simple in-memory cache to avoid redundant fetches during session
const cache = {};

// Map our UI categories to API endpoints
export const CATEGORY_MAP = {
  warframes:  { endpoint: '/warframes',  label: 'Warframes',      icon: 'bi-person-fill' },
  primary:    { endpoint: '/weapons',    label: 'Primaria',         icon: 'bi-crosshair' },
  secondary:  { endpoint: '/weapons',    label: 'Secundaria',       icon: 'bi-bullseye' },
  melee:      { endpoint: '/weapons',    label: 'Cuerpo a Cuerpo',  icon: 'bi-slash' },
};

// Weapon category filter
const WEAPON_CATEGORY = {
  primary:   'Primary',
  secondary: 'Secondary',
  melee:     'Melee',
};

export function useWarframeAPI(category) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!category) return;

    const info = CATEGORY_MAP[category];
    if (!info) return;

    const cacheKey = category;

    // Return cached data immediately
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    Promise.all([
      fetch(`${BASE}${info.endpoint}?language=en`, { signal: controller.signal }).then(res => res.ok ? res.json() : []),
      fetch(`${BASE}${info.endpoint}?language=es`, { signal: controller.signal }).then(res => res.ok ? res.json() : []).catch(() => [])
    ])
      .then(([enJson, esJson]) => {
        let enItems = Array.isArray(enJson) ? enJson : [];
        let esItems = Array.isArray(esJson) ? esJson : [];

        const esMap = new Map();
        esItems.forEach(item => esMap.set(item.uniqueName, item));

        let items = enItems.map(enItem => {
          const esItem = esMap.get(enItem.uniqueName) || {};
          return {
            ...enItem,
            description: esItem.description || enItem.description,
          };
        });

        // Filter weapons by category type
        if (category === 'primary' || category === 'secondary' || category === 'melee') {
          items = items.filter(
            item => item.category === WEAPON_CATEGORY[category] && item.imageName
          );
        }

        // Only include items that have an image
        items = items.filter(item => item.imageName);

        // Sort alphabetically
        items.sort((a, b) => a.name.localeCompare(b.name));

        cache[cacheKey] = items;
        setData(items);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('[useWarframeAPI] fetch failed:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [category]);

  return { data, loading, error };
}

// Maps weapon `type` field (from weapon API) → mod `compatName` values
// e.g. a Rifle weapon accepts mods where compatName is "Rifle" or "PRIMARY"
const WEAPON_COMPAT_NAMES = {
  'Rifle':     ['Rifle', 'PRIMARY'],
  'Shotgun':   ['Shotgun', 'PRIMARY'],
  'Sniper Rifle': ['Sniper', 'PRIMARY'],
  'Bow':       ['Rifle', 'PRIMARY'],   // bows use Rifle mods
  'Launcher':  ['Rifle', 'PRIMARY'],
  'Pistol':    ['Pistol', 'SECONDARY'],
  'Thrown':    ['Pistol', 'SECONDARY'],
  'Dual Pistols': ['Pistol', 'SECONDARY'],
};





export function useMods() {
  const [mods, setMods]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (cache['mods']) {
      setMods(cache['mods']);
      return;
    }

    setLoading(true);

    Promise.all([
      fetch(`${BASE}/mods?language=en`).then(res => res.ok ? res.json() : []),
      fetch(`${BASE}/mods?language=es`).then(res => res.ok ? res.json() : []).catch(() => [])
    ])
      .then(([enJson, esJson]) => {
        let enItems = Array.isArray(enJson) ? enJson.filter(m => m.imageName) : [];
        let esItems = Array.isArray(esJson) ? esJson : [];

        const esMap = new Map();
        esItems.forEach(item => esMap.set(item.uniqueName, item));

        let items = enItems.map(enItem => {
          const esItem = esMap.get(enItem.uniqueName) || {};
          return {
            ...enItem,
            description: esItem.description || enItem.description,
            levelStats: esItem.levelStats || enItem.levelStats,
          };
        });
        
        
        // Remove duplicates by name, keeping the one with the highest fusionLimit (max rank)
        // Also clean up <DT_*> tags from levelStats
        const uniqueItemsMap = new Map();
        items.forEach(mod => {
          // Clean text tags like <DT_POISON_COLOR>
          if (mod.levelStats) {
            mod.levelStats = mod.levelStats.map(ls => ({
              ...ls,
              stats: (ls.stats || []).map(stat => stat.replace(/<[^>]+>/g, ''))
            }));
          }

          if (uniqueItemsMap.has(mod.name)) {
            const existing = uniqueItemsMap.get(mod.name);
            if ((mod.fusionLimit ?? 0) > (existing.fusionLimit ?? 0)) {
              uniqueItemsMap.set(mod.name, mod);
            }
          } else {
            uniqueItemsMap.set(mod.name, mod);
          }
        });
        
        items = Array.from(uniqueItemsMap.values());

        cache['mods'] = items;
        setMods(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('[useMods] fetch failed:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { mods, loading, error };
}

/* ---- Filtered mods by category + specific item ---- */
export function useFilteredMods(category, item) {
  const { mods, loading, error } = useMods();

  const filtered = mods.length === 0 ? [] : (() => {
    const itemName     = item?.name ?? '';
    const itemType     = item?.type ?? '';       // e.g. "Rifle", "Shotgun", "Sentinel"

    return mods.filter(mod => {
      const modType   = mod.type ?? '';
      const compatName = (mod.compatName ?? '').toUpperCase();

      // --- Warframes ---
      if (category === 'warframes') {
        if (modType !== 'Warframe Mod') return false;
        // compatName 'WARFRAME' = general WF mod; or matches specific warframe name
        return (
          compatName === 'WARFRAME' ||
          compatName === 'AURA'    ||
          compatName === itemName.toUpperCase() ||
          mod.compatName === itemName            // exact match (case-sensitive)
        );
      }

      // --- Primary weapons ---
      if (category === 'primary') {
        if (modType !== 'Primary Mod') return false;
        // Determine which compat names this weapon accepts
        const extraNames = WEAPON_COMPAT_NAMES[itemType] ?? ['Rifle', 'PRIMARY'];
        const allowed = [
          'PRIMARY',
          'UNIQUE',                                      // unique weapon mods
          itemName.toUpperCase(),                        // weapon-specific augments
          ...extraNames.map(n => n.toUpperCase()),
        ];
        return (
          allowed.includes(compatName) ||
          mod.compatName === itemName
        );
      }

      // --- Secondary weapons ---
      if (category === 'secondary') {
        if (modType !== 'Secondary Mod') return false;
        const extraNames = WEAPON_COMPAT_NAMES[itemType] ?? ['Pistol', 'SECONDARY'];
        const allowed = [
          'SECONDARY',
          'UNIQUE',
          itemName.toUpperCase(),
          ...extraNames.map(n => n.toUpperCase()),
        ];
        return (
          allowed.includes(compatName) ||
          mod.compatName === itemName
        );
      }

      // --- Melee weapons ---
      if (category === 'melee') {
        if (modType !== 'Melee Mod' && modType !== 'Stance Mod') return false;
        
        // Warframestat API returns "Melee" as the type for all melee weapons, 
        // making it impossible to perfectly filter stances by weapon subtype (e.g. Swords vs Polearms)
        // without a huge manual dictionary. So we allow all Stance mods and let the user pick.
        if (modType === 'Stance Mod') return true;

        const allowed = [
          'MELEE',
          'UNIQUE',
          itemName.toUpperCase()
        ];
        
        return (
          allowed.includes(compatName) ||
          mod.compatName === itemName ||
          // Safety fallback for basic melee mods
          (modType === 'Melee Mod' && (compatName === 'MELEE' || !mod.compatName))
        );
      }

      return false;
    });
  })();

  return { mods: filtered, loading, error };
}


/* ---- Image URL helper ---- */
export function getItemImage(imageName) {
  if (!imageName) return null;
  return `https://cdn.warframestat.us/img/${imageName}`;
}

/* ---- Stat calculation engine ---- */
export function calculateStats(item, slots) {
  if (!item) return {};

  const base = {
    health:      item.health      ?? 0,
    shield:      item.shield      ?? 0,
    armor:       item.armor       ?? 0,
    power:       item.power       ?? 0,
    sprintSpeed: item.sprintSpeed ?? 0,
    damage:      item.damage      ?? (item.totalDamage ?? 0),
    criticalChance:     item.criticalChance     ?? 0,
    criticalMultiplier: item.criticalMultiplier ?? 0,
    procChance:         item.procChance         ?? 0,
    fireRate:           item.fireRate           ?? 0,
    accuracy:           item.accuracy           ?? 0,
    magazineSize:       item.magazineSize       ?? 0,
    reloadTime:         item.reloadTime         ?? 0,
  };

  // Base Warframe stats that are modified by percentage
  // Note: For Warframes, Duration, Efficiency, Range, Strength default to 1 (100%)
  const isWarframe = (item.type === 'Warframe');
  if (isWarframe) {
    base.duration = 1;
    base.efficiency = 1;
    base.range = 1;
    base.strength = 1;
  }

  const totals = { ...base };

  // Aggregate mod multipliers
  const bonuses = {};
  slots.forEach(slot => {
    if (!slot || !slot.mod) return;
    const mod = slot.mod;
    const rank = slot.rank ?? mod.fusionLimit ?? 0;
    
    // Get stats for the current rank, fallback to 0 or max if not found
    const levelStat = mod.levelStats?.[rank] || mod.levelStats?.[0];
    
    if (levelStat && levelStat.stats) {
      levelStat.stats.forEach(stat => {
        const key = stat.toLowerCase().trim();
        // Parse percentage bonuses from mod stat strings (e.g. "+55% Ability Duration")
        const match = key.match(/([+-]?\d+(?:\.\d+)?)\s*%/);
        if (match) {
          const val = parseFloat(match[1]) / 100;
          if (key.includes('health'))     bonuses.health     = (bonuses.health     ?? 0) + val;
          if (key.includes('shield'))     bonuses.shield     = (bonuses.shield     ?? 0) + val;
          if (key.includes('armor'))      bonuses.armor      = (bonuses.armor      ?? 0) + val;
          if (key.includes('damage'))     bonuses.damage     = (bonuses.damage     ?? 0) + val;
          if (key.includes('critical chance')) bonuses.criticalChance = (bonuses.criticalChance ?? 0) + val;
          if (key.includes('critical multiplier')) bonuses.criticalMultiplier = (bonuses.criticalMultiplier ?? 0) + val;
          if (key.includes('fire rate') || key.includes('attack speed')) bonuses.fireRate = (bonuses.fireRate ?? 0) + val;
          if (key.includes('reload'))     bonuses.reloadTime = (bonuses.reloadTime ?? 0) + val;
          if (key.includes('magazine'))   bonuses.magazineSize = (bonuses.magazineSize ?? 0) + val;
          
          // Warframe specific
          if (key.includes('duration'))   bonuses.duration   = (bonuses.duration   ?? 0) + val;
          if (key.includes('efficiency')) bonuses.efficiency = (bonuses.efficiency ?? 0) + val;
          if (key.includes('range'))      bonuses.range      = (bonuses.range      ?? 0) + val;
          if (key.includes('strength'))   bonuses.strength   = (bonuses.strength   ?? 0) + val;
        }
      });
    }
  });

  // Apply bonuses
  Object.entries(bonuses).forEach(([key, mult]) => {
    if (totals[key] !== undefined) {
      totals[key] = base[key] * (1 + mult);
    }
  });

  return { base, totals, bonuses };
}
