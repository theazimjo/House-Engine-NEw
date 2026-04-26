import { useCallback, useRef } from 'react';

// ── Undo/Redo History Hook ───────────────────────────────────────────────────
// Stores snapshots of the entire node+edge state for Ctrl+Z / Ctrl+Y support.

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const history = useRef<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const setState = useCallback((newState: T) => {
    const h = history.current;
    history.current = {
      past: [...h.past.slice(-(maxHistory - 1)), h.present],
      present: newState,
      future: [],
    };
  }, [maxHistory]);

  const undo = useCallback((): T | null => {
    const h = history.current;
    if (h.past.length === 0) return null;
    const previous = h.past[h.past.length - 1];
    history.current = {
      past: h.past.slice(0, -1),
      present: previous,
      future: [h.present, ...h.future],
    };
    return previous;
  }, []);

  const redo = useCallback((): T | null => {
    const h = history.current;
    if (h.future.length === 0) return null;
    const next = h.future[0];
    history.current = {
      past: [...h.past, h.present],
      present: next,
      future: h.future.slice(1),
    };
    return next;
  }, []);

  const canUndo = useCallback(() => history.current.past.length > 0, []);
  const canRedo = useCallback(() => history.current.future.length > 0, []);

  const updatePresent = useCallback((state: T) => {
    history.current.present = state;
  }, []);

  return { setState, undo, redo, canUndo, canRedo, updatePresent };
}
