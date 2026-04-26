import type { Node, Edge } from 'reactflow';
import type { NodeData, NodeType } from '../types';
import { DEFAULT_PARAMS, NODE_PINS } from '../types';

// ── Helper ───────────────────────────────────────────────────────────────────
const makeNode = (
  id: string,
  type: NodeType,
  label: string,
  x: number,
  y: number,
  overrides?: Record<string, any>
): Node<NodeData> => ({
  id,
  type: 'buildingNode',
  position: { x, y },
  data: {
    label,
    type,
    params: { ...DEFAULT_PARAMS[type], ...overrides },
    inputs: NODE_PINS[type].inputs,
    outputs: NODE_PINS[type].outputs,
    onChange: () => {},
  },
});

// ── Template Interface ───────────────────────────────────────────────────────
export interface BuildingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'custom';
  icon: string;
  preview: string; // emoji or ASCII art
  nodes: Node<NodeData>[];
  edges: Edge[];
}

// ── Templates ────────────────────────────────────────────────────────────────
export const BUILDING_TEMPLATES: BuildingTemplate[] = [
  // ── 1. Modern Apartment ──
  {
    id: 'modern-apartment',
    name: 'Modern Apartment',
    description: '5-story modern residential building with glass balconies and flat roof.',
    category: 'residential',
    icon: '🏢',
    preview: '🏢',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 14, depth: 10, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 5, height: 3.2, winWidth: 1.4, winHeight: 2.0, winSpacing: 2.8,
        doorWidth: 2.0, doorHeight: 2.6, doorSide: 'front',
        windowType: 'modern', doorType: 'modern', material: 'concrete',
        hasBalcony: true, hasRibs: false, plinthHeight: 0.6,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.3, overhang: 0.4, color: '#555555',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.6, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 4, stepHeight: 0.15, stepDepth: 0.35, width: 2.5,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 2. Classic Villa ──
  {
    id: 'classic-villa',
    name: 'Classic Villa',
    description: '2-story brick villa with pitched roof, classic windows, and arched entry.',
    category: 'residential',
    icon: '🏡',
    preview: '🏡',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 18, depth: 12, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 2, height: 3.5, winWidth: 1.0, winHeight: 1.6, winSpacing: 2.2,
        doorWidth: 2.2, doorHeight: 2.8, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'bricks',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.5,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'pitched', height: 4, overhang: 0.8, color: '#8e2b2b',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.5, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 3, stepHeight: 0.18, stepDepth: 0.4, width: 3.0,
      }),
      makeNode('col-1', 'columns', 'Columns', 700, 200, {
        radius: 0.25, height: 7.0, spacing: 5.0, useCorners: true, material: 'concrete',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 3. Office Tower ──
  {
    id: 'office-tower',
    name: 'Office Tower',
    description: '12-story glass office building with tapered silhouette and hip roof.',
    category: 'commercial',
    icon: '🏙️',
    preview: '🏙️',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 16, depth: 16, foundationShape: 'rectangle',
        taper: 0.85, twistBase: 0, twistMid: 0, twistTop: 3,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 12, height: 3.5, winWidth: 1.6, winHeight: 2.2, winSpacing: 2.0,
        doorWidth: 3.0, doorHeight: 3.0, doorSide: 'frontback',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.0,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'hip', height: 2.5, overhang: 0.3, color: '#333333',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 1.0, material: 'metal',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 6, stepHeight: 0.17, stepDepth: 0.3, width: 4.0,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 4. L-Shape House ──
  {
    id: 'l-shape-house',
    name: 'L-Shape House',
    description: 'Modern L-shaped home with arched windows, mansard roof, and landscaping.',
    category: 'residential',
    icon: '🏠',
    preview: '🏠',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 16, depth: 12, foundationShape: 'L-shape',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 2, height: 3.0, winWidth: 1.1, winHeight: 1.7, winSpacing: 2.4,
        doorWidth: 1.8, doorHeight: 2.4, doorSide: 'front',
        windowType: 'arched', doorType: 'modern', material: 'bricks',
        hasBalcony: true, hasRibs: false, plinthHeight: 0.4,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'mansard', height: 3, overhang: 0.6, color: '#4a3728',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.4, material: 'concrete',
      }),
      makeNode('sc-1', 'scatter_points', 'Landscaping', 700, 200, {
        count: 15, seed: 42, minScale: 0.6, maxScale: 1.4,
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 3, stepHeight: 0.14, stepDepth: 0.35, width: 2.0,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'sc-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1', target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 5. Warehouse ──
  {
    id: 'warehouse',
    name: 'Industrial Warehouse',
    description: 'Large single-story industrial building with shed roof and metal cladding.',
    category: 'industrial',
    icon: '🏭',
    preview: '🏭',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 30, depth: 18, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 1, height: 6, winWidth: 2.0, winHeight: 2.5, winSpacing: 5.0,
        doorWidth: 4.0, doorHeight: 4.5, doorSide: 'frontback',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 0.3,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'shed', height: 2, overhang: 0.8, color: '#555555',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.3, material: 'concrete',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 6. Hexagonal Pavilion ──
  {
    id: 'hex-pavilion',
    name: 'Hexagonal Pavilion',
    description: 'Unique hexagonal structure with columns and a hip roof — ideal for parks.',
    category: 'custom',
    icon: '⬡',
    preview: '⬡',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 10, depth: 10, foundationShape: 'hexagon',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 1, height: 4.0, winWidth: 1.5, winHeight: 2.5, winSpacing: 3.0,
        doorWidth: 2.0, doorHeight: 3.0, doorSide: 'front',
        windowType: 'arched', doorType: 'double', material: 'wood',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.3,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'hip', height: 3.5, overhang: 1.0, color: '#5d4037',
      }),
      makeNode('col-1', 'columns', 'Columns', 700, 200, {
        radius: 0.2, height: 4.0, spacing: 4.0, useCorners: true, material: 'wood',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.3, material: 'wood',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 7. U-Shape School ──
  {
    id: 'u-shape-school',
    name: 'U-Shape School',
    description: '3-story U-shaped educational building with courtyard and gable roof.',
    category: 'commercial',
    icon: '🏫',
    preview: '🏫',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 24, depth: 16, foundationShape: 'U-shape',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 3, height: 3.3, winWidth: 1.3, winHeight: 1.8, winSpacing: 2.2,
        doorWidth: 2.5, doorHeight: 2.8, doorSide: 'front',
        windowType: 'classic', doorType: 'double', material: 'bricks',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.5,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'gable', height: 3, overhang: 0.5, color: '#6d4c41',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.5, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 4, stepHeight: 0.17, stepDepth: 0.35, width: 3.5,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1', target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 8. Twisted Skyscraper ──
  {
    id: 'twisted-skyscraper',
    name: 'Twisted Skyscraper',
    description: 'Futuristic 20-story tower with progressive twist deformation and tapered form.',
    category: 'commercial',
    icon: '🗼',
    preview: '🗼',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 14, depth: 14, foundationShape: 'rectangle',
        twistBase: 0, twistMid: 15, twistTop: 45, taper: 0.7,
        shearX: 0.5, shearY: 0,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 20, height: 3.5, winWidth: 1.8, winHeight: 2.4, winSpacing: 2.0,
        doorWidth: 3.0, doorHeight: 3.2, doorSide: 'all',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.2,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.5, overhang: 0.2, color: '#222222',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 1.2, material: 'metal',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },
];
