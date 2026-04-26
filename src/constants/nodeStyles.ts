import type { PinType, NodeType } from '../types';

export const PIN_COLORS: Record<PinType, string> = {
  spline:    '#4ade80', // Green  — Geometric path
  mesh:      '#3b82f6', // Blue   — 3D Geometry
  float:     '#f59e0b', // Amber  — Numeric value
  integer:   '#06b6d4', // Cyan   — Integer value
  boolean:   '#a855f7', // Purple — True/False
  material:  '#ef4444', // Red    — Material slot
  transform: '#eab308', // Yellow — Position/Rotation/Scale
  array:     '#f0f0f0', // White  — Collection
  mask:      '#ef4444', // Red
  window:    '#0ea5e9', // Sky blue
  floors:    '#ec4899', // Pink
};

export const NODE_HEADER_COLORS: Record<NodeType | string, string> = {
  // Generators
  foundation:       '#c64321',
  // Structure
  floors:           '#1d4ed8',
  roof:             '#7f1d1d',
  columns:          '#6d28d9',
  stairs:           '#be185d',
  plinth:           '#064e3b',
  // Modifiers
  offset_spline:    '#0f766e',
  transform_spline: '#7e22ce',
  mirror_spline:    '#0e7490',
  // Utilities
  math_node:        '#78350f',
  merge_mesh:       '#1e3a5f',
  scatter_points:   '#14532d',
  // Legacy
  extrude:  '#005682',
  split:    '#f97316',
  merge:    '#6366f1',
  scatter:  '#f2b705',
  output:   '#1a1a1a',
  balcony:  '#059669',
  column:   '#7c3aed',
  transform:'#8b5cf6',
  window:   '#0ea5e9',
};
