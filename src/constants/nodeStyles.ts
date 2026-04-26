import type { PinType } from '../types';

export const PIN_COLORS: Record<PinType, string> = {
  spline: '#4ade80', // Green (Blueprint)
  mesh: '#3b82f6',   // Blue (3D Model)
  float: '#f59e0b',  // Orange (Numbers/Height)
  mask: '#ef4444',   // Red
  window: '#0ea5e9',
  floors: '#ec4899',
};

export const NODE_HEADER_COLORS: Record<string, string> = {
  foundation: '#c64321',
  extrude: '#005682',
  split: '#f97316',
  merge: '#6366f1',
  scatter: '#f2b705',
  output: '#1a1a1a',
  balcony: '#059669',
  column: '#7c3aed',
  stairs: '#db2777',
  transform: '#8b5cf6',
  window: '#0ea5e9',
  floors: '#ec4899', // Pink
  roof: '#8e2b2b',   // Dark Red
};
