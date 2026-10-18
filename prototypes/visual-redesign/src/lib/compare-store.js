import * as React from 'react'

/* Prototype-only compare store — localStorage-backed, shared by Catalog tray
   and Compare dialog. Four-model cap, states the cap before the user hits it.
   Not the production `apps/web/src/lib/compare-store.js` — prototype only. */
const KEY = 'upgradeatlas.compare-v1'
const MAX = 4

function load() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX);
  } catch {
    return [];
  }
}

let store = load();
let listeners = new Set();

function persist() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
  for (const fn of listeners) fn();
}

export function useCompare() {
  const [items, setItems] = React.useState(store);
  React.useEffect(() => {
    const fn = () => setItems(store);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return {
    items,
    max: MAX,
    has: (partNumber) => items.some((i) => i.partNumber === partNumber),
    isFull: items.length >= MAX,
    add: (model) => {
      if (items.some((i) => i.partNumber === model.partNumber) || items.length >= MAX) return;
      store = [...store, model];
      persist();
    },
    remove: (partNumber) => {
      store = store.filter((i) => i.partNumber !== partNumber);
      persist();
    },
    clear: () => {
      store = []
      persist()
    },
  }
}
