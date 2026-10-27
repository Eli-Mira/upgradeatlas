import { useSyncExternalStore } from 'react'

/**
 * Comparison selection, shared by the catalogue cards, the tray and the
 * compare page. Small external store instead of context so that adding a model
 * re-renders the tray and the affected card only.
 *
 * Capped at four, matching the compare table. Kept in sessionStorage so a
 * refresh does not silently drop the user's selection.
 */

const MAX = 4
const KEY = 'upgradeatlas.compare'
const listeners = new Set()

function read() {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : []
  } catch {
    return []
  }
}

let selection = read()

function emit() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(selection))
  } catch {
    // Storage can be unavailable; the in-memory selection still works.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return selection
}

export function useCompare() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    items,
    has: (partNumber) => items.some((item) => item.partNumber === partNumber),
    isFull: items.length >= MAX,
    max: MAX,
    add(item) {
      if (selection.some((existing) => existing.partNumber === item.partNumber)) return
      if (selection.length >= MAX) return
      selection = [...selection, item]
      emit()
    },
    remove(partNumber) {
      selection = selection.filter((item) => item.partNumber !== partNumber)
      emit()
    },
    toggle(item) {
      if (selection.some((existing) => existing.partNumber === item.partNumber)) {
        selection = selection.filter((existing) => existing.partNumber !== item.partNumber)
      } else if (selection.length < MAX) {
        selection = [...selection, item]
      } else {
        return
      }
      emit()
    },
    clear() {
      selection = []
      emit()
    },
  }
}
