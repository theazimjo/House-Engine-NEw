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
  category: 'residential' | 'commercial' | 'industrial' | 'custom' | 'game';
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
        width: 32, depth: 16, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 5, height: 3.2, winWidth: 1.6, winHeight: 2.2, winSpacing: 3.2,
        doorWidth: 2.4, doorHeight: 2.6, doorSide: 'front',
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
        width: 20, depth: 14, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 2, height: 3.6, winWidth: 1.2, winHeight: 1.8, winSpacing: 2.5,
        doorWidth: 2.4, doorHeight: 2.8, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'stucco',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.5,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'pitched', height: 4, overhang: 0.8, color: '#7a3a2a',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.5, material: 'sandstone',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 3, stepHeight: 0.18, stepDepth: 0.4, width: 3.0,
      }),
      makeNode('col-1', 'columns', 'Columns', 700, 200, {
        radius: 0.25, height: 7.0, spacing: 5.0, useCorners: true, material: 'travertine',
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
        width: 35, depth: 35, foundationShape: 'rectangle',
        taper: 0.85, twistBase: 0, twistMid: 0, twistTop: 3,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 14, height: 3.8, winWidth: 2.0, winHeight: 2.6, winSpacing: 2.4,
        doorWidth: 4.0, doorHeight: 3.5, doorSide: 'frontback',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.0,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'hip', height: 2.5, overhang: 0.3, color: '#333333',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 1.0, material: 'dark_metal',
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
        width: 22, depth: 16, foundationShape: 'L-shape',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 2, height: 3.2, winWidth: 1.2, winHeight: 1.8, winSpacing: 2.6,
        doorWidth: 2.0, doorHeight: 2.5, doorSide: 'front',
        windowType: 'arched', doorType: 'modern', material: 'bricks',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.4,
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
        width: 60, depth: 40, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 1, height: 8.0, winWidth: 3.0, winHeight: 1.5, winSpacing: 6.0,
        doorWidth: 6.0, doorHeight: 5.0, doorSide: 'frontback',
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
        width: 12, depth: 12, foundationShape: 'hexagon',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 1, height: 4.5, winWidth: 1.8, winHeight: 2.8, winSpacing: 3.5,
        doorWidth: 2.4, doorHeight: 3.0, doorSide: 'front',
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
        width: 50, depth: 30, foundationShape: 'U-shape',
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

  // ── 8. Turning Torso (Malmö) ──
  {
    id: 'turning-torso',
    name: 'Turning Torso (Malmö)',
    description: 'A recreation of the famous Swedish neo-futurist skyscraper twisting exactly 90 degrees.',
    category: 'commercial',
    icon: '🏢',
    preview: '🏢',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 30, depth: 30, foundationShape: 'rectangle',
        twistBase: 0, twistMid: 45, twistTop: 90, taper: 1.0,
        shearX: 0, shearY: 0,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 54, height: 3.5, winWidth: 2.2, winHeight: 2.6, winSpacing: 3.0,
        doorWidth: 4.0, doorHeight: 3.5, doorSide: 'front',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.2,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.5, overhang: 0.0, color: '#f0f0f0',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 1.2, material: 'concrete',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 9. Transamerica Pyramid (San Francisco) ──
  {
    id: 'transamerica-pyramid',
    name: 'Transamerica Pyramid',
    description: 'Iconic San Francisco landmark demonstrating extreme tapering.',
    category: 'commercial',
    icon: '🔺',
    preview: '🔺',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 50, depth: 50, foundationShape: 'rectangle',
        taper: 0.1, twistBase: 0, twistMid: 0, twistTop: 0,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 48, height: 4.0, winWidth: 1.5, winHeight: 2.5, winSpacing: 3.0,
        doorWidth: 5.0, doorHeight: 4.0, doorSide: 'all',
        windowType: 'industrial', doorType: 'modern', material: 'concrete',
        hasBalcony: false, hasRibs: true, plinthHeight: 2.0,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.2, overhang: 0, color: '#dddddd',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 2.0, material: 'concrete',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 10. Leaning Tower of Pisa ──
  {
    id: 'leaning-tower',
    name: 'Leaning Tower of Pisa',
    description: 'Famous Italian bell tower showcasing structural shear deformation and colonnades.',
    category: 'custom',
    icon: '🏛️',
    preview: '🏛️',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 15, depth: 15, foundationShape: 'circle',
        shearX: 0.15, shearY: 0, taper: 1.0,
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 8, height: 4.5, winWidth: 1.2, winHeight: 2.4, winSpacing: 2.0,
        doorWidth: 2.5, doorHeight: 3.0, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'concrete',
        hasBalcony: true, hasRibs: false, plinthHeight: 1.0,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.5, overhang: 1.0, color: '#e0e0e0',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 1.0, material: 'concrete',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 11. X-Shape Medical Center ──
  {
    id: 'x-shape-hospital',
    name: 'X-Shape Medical Center',
    description: 'Massive modern hospital complex with 4 radiating wings forming an X.',
    category: 'commercial',
    icon: '🏥',
    preview: '🏥',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 80, depth: 80, foundationShape: 'X-shape',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 380, 300, {
        count: 5, height: 3.8, winWidth: 2.5, winHeight: 2.0, winSpacing: 4.0,
        doorWidth: 4.0, doorHeight: 3.0, doorSide: 'frontback',
        windowType: 'modern', doorType: 'double', material: 'metal',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.8,
      }),
      makeNode('r-1', 'roof', 'Roof System', 380, 50, {
        roofType: 'flat', height: 0.8, overhang: 0.5, color: '#aaaaaa',
      }),
      makeNode('pl-1', 'plinth', 'Plinth', 380, 600, {
        height: 0.8, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Stairs', 700, 500, {
        count: 5, stepHeight: 0.16, stepDepth: 0.35, width: 6.0, side: 'frontback',
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

  // ── 12. Ancient Pantheon (Greek Doric Temple) ──
  {
    id: 'ancient-pantheon',
    name: 'Ancient Pantheon',
    description: 'Architecturally accurate Greek Doric temple: outer limestone colonnade, inner marble cella, terracotta-tiled gable roof, and grand stepped krepidoma.',
    category: 'custom',
    icon: '🏛️',
    preview: '🏛️',
    nodes: [
      // Stylobate (top step of the krepidoma) — the actual floor rectangle
      // Greek peristyle temple: 6 columns on short end = ~3m spacing * 6 = 18m wide
      // 13 columns on long end = ~3m spacing * 13 = ~39m long (Parthenon ratio)
      makeNode('f-1', 'foundation', 'Stylobate', 50, 250, {
        width: 16, depth: 30, foundationShape: 'rectangle',
      }),
      // ── Krepidoma raised platform
      makeNode('pl-1', 'plinth', 'Krepidoma Platform', 50, 450, {
        height: 1.2, material: 'limestone',
      }),
      // ── Grand front + back stairs
      makeNode('st-1', 'stairs', 'Entry Steps', 50, 600, {
        count: 5, stepHeight: 0.24, stepDepth: 0.42, width: 6.0, side: 'frontback',
      }),
      // ── Outer peristyle colonnade (Doric order)
      // Columns MUST be shorter than cella walls so entablature sits on top
      makeNode('col-1', 'columns', 'Peristyle Colonnade', 380, 250, {
        radius: 0.48, height: 5.8, spacing: 2.7, useCorners: true,
        material: 'limestone', zOffset: 1.2,
      }),
      // ── Cella inset 2m from outer colonnade line
      makeNode('off-1', 'offset_spline', 'Cella Offset', 680, 150, {
        offset: -1.8,
      }),
      // Cella walls taller than columns so pediment can rest on them
      makeNode('fl-1', 'floors', 'Cella Walls', 980, 150, {
        count: 1, height: 6.8,
        winWidth: 0, winHeight: 0, winSpacing: 99,
        doorWidth: 3.5, doorHeight: 4.8, doorSide: 'front',
        windowType: 'classic', doorType: 'classic',
        material: 'marble',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.0,
      }),
      // ── Pediment (gable roof) — terracotta red, classic steep Greek pitch
      makeNode('r-1', 'roof', 'Pediment Roof', 380, 50, {
        roofType: 'gable', height: 4.0, overhang: 0.5, color: '#b84830',
      }),
    ],
    edges: [
      // Colonnade uses outer stylobate spline
      { id: 'e1', source: 'f-1', target: 'col-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      // Roof uses outer stylobate spline
      { id: 'e2', source: 'f-1', target: 'r-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      // Krepidoma (plinth) uses outer spline
      { id: 'e3', source: 'f-1', target: 'pl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      // Stairs use outer spline
      { id: 'e4', source: 'f-1', target: 'st-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      // Cella offset chain
      { id: 'e5', source: 'f-1',  target: 'off-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'off-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
    ],
  },

  // ── 13. Forest Eco-Resort ──
  {
    id: 'forest-resort',
    name: 'Forest Eco-Resort',
    description: 'A U-shape luxury resort demonstrating scattering algorithms for surrounding vegetation and procedural primitives.',
    category: 'residential',
    icon: '🌲',
    preview: '🌲',
    nodes: [
      makeNode('f-1', 'foundation', 'Foundation', 50, 250, {
        width: 30, depth: 30, foundationShape: 'U-shape',
      }),
      makeNode('fl-1', 'floors', 'Floors System', 350, 200, {
        count: 3, height: 3.5, winWidth: 2.0, winHeight: 2.5, winSpacing: 3.0,
        doorWidth: 3.0, doorHeight: 2.5, doorSide: 'frontback',
        windowType: 'modern', doorType: 'double', material: 'wood',
        hasBalcony: true, hasRibs: true, plinthHeight: 0.5,
      }),
      makeNode('r-1', 'roof', 'Roof System', 350, 350, {
        roofType: 'flat', height: 0.5, overhang: 0.8, color: '#333333',
      }),
      makeNode('sc-1', 'scatter_points', 'Forest Generation', 350, 500, {
        count: 150, radius: 45.0, seed: 1234, meshType: 'tree',
      }),
      makeNode('cyl-1', 'primitive_cylinder', 'Water Tower Primitive', 50, 550, {
        radius: 2.5, height: 12.0, radialSegments: 16,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e4', source: 'f-1', target: 'sc-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 14. Gothic Cathedral \u2500\u2500
  {
    id: 'gothic-cathedral',
    name: 'Gothic Cathedral',
    description: 'A soaring Gothic cathedral with tall nave, flanking aisles via offset splines, flying-buttress columns, and steep gable roofs.',
    category: 'custom',
    icon: '\u26ea',
    preview: '\u26ea',
    nodes: [
      // Main nave footprint \u2014 tall and narrow
      makeNode('f-1', 'foundation', 'Nave', 50, 250, {
        width: 16, depth: 50, foundationShape: 'rectangle',
      }),
      // Outer walls + windows (Gothic lancet = arched)
      makeNode('fl-1', 'floors', 'Nave Walls', 380, 300, {
        count: 8, height: 4.5, winWidth: 2.0, winHeight: 4.0, winSpacing: 4.0,
        doorWidth: 5.0, doorHeight: 7.0, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'limestone',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.2,
      }),
      // Steep gable roof over nave
      makeNode('r-1', 'roof', 'Nave Roof', 380, 50, {
        roofType: 'gable', height: 14.0, overhang: 0.3, color: '#5a6070',
      }),
      // Aisle \u2014 outer ring via offset (wider spline = flying buttresses outside)
      makeNode('off-1', 'offset_spline', 'Aisle Offset', 680, 150, {
        offset: 4.5,
      }),
      makeNode('col-1', 'columns', 'Flying Buttresses', 980, 150, {
        radius: 0.4, height: 22.0, spacing: 4.0, useCorners: false,
        material: 'limestone', zOffset: 0,
      }),
      // Grand raised entrance platform
      makeNode('pl-1', 'plinth', 'Foundation Platform', 50, 500, {
        height: 1.2, material: 'limestone',
      }),
      makeNode('st-1', 'stairs', 'Cathedral Steps', 50, 650, {
        count: 5, stepHeight: 0.24, stepDepth: 0.45, width: 8.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',   target: 'fl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',   target: 'r-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1',  target: 'r-1',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-1',   target: 'off-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'off-1', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1',   target: 'pl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-1',   target: 'st-1',  sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 15. Baroque Palace \u2500\u2500
  {
    id: 'baroque-palace',
    name: 'Baroque Palace',
    description: 'A U-shaped royal palace with inner courtyard, ornate colonnades, travertine walls, pitched hip roof, and grand symmetrical entry stairs.',
    category: 'residential',
    icon: '\ud83c\udfdb\ufe0f',
    preview: '\ud83c\udfdb\ufe0f',
    nodes: [
      // U-shape for courtyard layout
      makeNode('f-1', 'foundation', 'Palace Wings', 50, 250, {
        width: 45, depth: 38, foundationShape: 'U-shape',
      }),
      makeNode('fl-1', 'floors', 'Palace Walls', 380, 300, {
        count: 3, height: 5.5, winWidth: 1.8, winHeight: 3.2, winSpacing: 3.5,
        doorWidth: 5.0, doorHeight: 6.0, doorSide: 'front',
        windowType: 'arched', doorType: 'double', material: 'travertine',
        hasBalcony: true, hasRibs: true, plinthHeight: 1.5,
      }),
      makeNode('r-1', 'roof', 'Palace Roof', 380, 50, {
        roofType: 'hip', height: 4.0, overhang: 1.2, color: '#6a4a3a',
      }),
      // Inner courtyard colonnade (offset inward = inside U)
      makeNode('off-1', 'offset_spline', 'Courtyard Edge', 680, 150, {
        offset: -2.5,
      }),
      makeNode('col-1', 'columns', 'Inner Colonnade', 980, 150, {
        radius: 0.4, height: 8.0, spacing: 3.5, useCorners: true,
        material: 'marble', zOffset: 1.5,
      }),
      makeNode('pl-1', 'plinth', 'Stylobate', 50, 500, {
        height: 1.5, material: 'travertine',
      }),
      makeNode('st-1', 'stairs', 'Grand Staircase', 50, 650, {
        count: 7, stepHeight: 0.21, stepDepth: 0.48, width: 10.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',   target: 'fl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',   target: 'r-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1',  target: 'r-1',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-1',   target: 'off-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'off-1', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1',   target: 'pl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-1',   target: 'st-1',  sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 16. Art Deco Skyscraper \u2500\u2500
  {
    id: 'art-deco-tower',
    name: 'Art Deco Skyscraper',
    description: 'A 1930s New York-style Art Deco tower with stepped setbacks (taper), dark metal cladding, and a dramatic sunburst crown.',
    category: 'commercial',
    icon: '\ud83c\udfd9\ufe0f',
    preview: '\ud83c\udfd9\ufe0f',
    nodes: [
      // Wide base tapering to narrow crown \u2014 Art Deco setback silhouette
      makeNode('f-1', 'foundation', 'Tower Base', 50, 250, {
        width: 28, depth: 28, foundationShape: 'rectangle',
        taper: 0.35, twistBase: 0, twistMid: 0, twistTop: 0,
      }),
      makeNode('fl-1', 'floors', 'Tower Skin', 380, 300, {
        count: 32, height: 3.8, winWidth: 1.4, winHeight: 2.6, winSpacing: 2.2,
        doorWidth: 5.0, doorHeight: 4.5, doorSide: 'front',
        windowType: 'modern', doorType: 'glass', material: 'dark_metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 2.0,
      }),
      makeNode('r-1', 'roof', 'Crown', 380, 50, {
        roofType: 'pitched', height: 8.0, overhang: 0.0, color: '#c8a030',
      }),
      makeNode('pl-1', 'plinth', 'Base Podium', 50, 500, {
        height: 2.0, material: 'granite',
      }),
      makeNode('st-1', 'stairs', 'Entry Steps', 50, 650, {
        count: 8, stepHeight: 0.25, stepDepth: 0.4, width: 8.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',  target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',  target: 'r-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-1',  target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1',  target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 17. Brutalist Government Building \u2500\u2500
  {
    id: 'brutalist-gov',
    name: 'Brutalist Government Complex',
    description: 'A Soviet-era C-shaped brutalist complex: exposed board-formed concrete, deep horizontal ribs, flat roof, and monumental stairs.',
    category: 'commercial',
    icon: '\ud83c\udfd7\ufe0f',
    preview: '\ud83c\udfd7\ufe0f',
    nodes: [
      makeNode('f-1', 'foundation', 'C-Wing Layout', 50, 250, {
        width: 50, depth: 40, foundationShape: 'C-shape',
      }),
      makeNode('fl-1', 'floors', 'Brutalist Facade', 380, 300, {
        count: 9, height: 3.6, winWidth: 1.6, winHeight: 1.8, winSpacing: 3.0,
        doorWidth: 4.0, doorHeight: 3.5, doorSide: 'front',
        windowType: 'industrial', doorType: 'modern', material: 'concrete',
        hasBalcony: false, hasRibs: true, plinthHeight: 0.5,
      }),
      makeNode('r-1', 'roof', 'Flat Roof', 380, 50, {
        roofType: 'flat', height: 0.6, overhang: 0.0, color: '#606060',
      }),
      makeNode('pl-1', 'plinth', 'Raised Podium', 50, 500, {
        height: 1.8, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Monumental Stairs', 50, 650, {
        count: 9, stepHeight: 0.2, stepDepth: 0.5, width: 12.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',  target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',  target: 'r-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1', target: 'r-1',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-1',  target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1',  target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 18. Ottoman Mosque \u2500\u2500
  {
    id: 'ottoman-mosque',
    name: 'Ottoman Mosque',
    description: 'An Ottoman-style mosque with a central marble dome, hexagonal courtyard colonnade, sandstone walls, and twin minaret cylinders.',
    category: 'custom',
    icon: '\ud83d\udd4c',
    preview: '\ud83d\udd4c',
    nodes: [
      // Square prayer hall
      makeNode('f-1', 'foundation', 'Prayer Hall', 50, 250, {
        width: 22, depth: 22, foundationShape: 'hexagon',
      }),
      makeNode('fl-1', 'floors', 'Prayer Walls', 380, 300, {
        count: 2, height: 5.0, winWidth: 2.5, winHeight: 4.0, winSpacing: 5.0,
        doorWidth: 4.5, doorHeight: 5.5, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'sandstone',
        hasBalcony: false, hasRibs: false, plinthHeight: 1.0,
      }),
      // Central great dome
      makeNode('dome-1', 'dome', 'Great Dome', 680, 100, {
        radius: 9.0, segments: 32, material: 'travertine', zOffset: 9.5, color: '#d8cdb0',
      }),
      // Outer colonnaded portico (slightly inset)
      makeNode('off-1', 'offset_spline', 'Portico Ring', 680, 350, {
        offset: 2.5,
      }),
      makeNode('col-1', 'columns', 'Portico Colonnade', 980, 350, {
        radius: 0.35, height: 7.5, spacing: 4.0, useCorners: true,
        material: 'marble', zOffset: 1.0,
      }),
      // Minarets as tall thin cylinders (placed manually via primitives)
      makeNode('min-1', 'primitive_cylinder', 'Minaret Left', 50, 550, {
        radius: 0.9, height: 28.0, radialSegments: 12,
      }),
      makeNode('min-2', 'primitive_cylinder', 'Minaret Right', 50, 700, {
        radius: 0.9, height: 28.0, radialSegments: 12,
      }),
      makeNode('pl-1', 'plinth', 'Platform', 380, 550, {
        height: 1.0, material: 'travertine',
      }),
      makeNode('st-1', 'stairs', 'Entry Steps', 380, 700, {
        count: 4, stepHeight: 0.25, stepDepth: 0.42, width: 6.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',   target: 'fl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',   target: 'dome-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'f-1',   target: 'off-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'off-1', target: 'col-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-1',   target: 'pl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1',   target: 'st-1',   sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // \u2500\u2500 19. Japanese Pagoda \u2500\u2500
  {
    id: 'japanese-pagoda',
    name: 'Japanese Pagoda',
    description: 'A 5-tiered Japanese pagoda using stacked transform_spline nodes with diminishing scale, each tier with a hip roof and curved eaves.',
    category: 'custom',
    icon: '\ud83d\uded0',
    preview: '\ud83d\uded0',
    nodes: [
      // Ground floor base
      makeNode('f-1', 'foundation', 'Ground Floor', 50, 250, {
        width: 14, depth: 14, foundationShape: 'rectangle',
      }),
      // Tier 1 \u2014 full size
      makeNode('fl-1', 'floors', 'Tier 1 Walls', 380, 300, {
        count: 1, height: 4.5, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 2.5, doorHeight: 3.5, doorSide: 'all',
        windowType: 'classic', doorType: 'classic', material: 'aged_wood',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.6,
      }),
      makeNode('r-1', 'roof', 'Tier 1 Roof', 380, 50, {
        roofType: 'hip', height: 3.0, overhang: 2.5, color: '#1a1a2e',
      }),
      // Scale down for Tier 2: 75%
      makeNode('xf-2', 'transform_spline', 'Tier 2 Scale', 680, 200, {
        x: 0, y: 5.8, z: 0, scale: 0.75, rotation: 0,
      }),
      makeNode('fl-2', 'floors', 'Tier 2 Walls', 980, 250, {
        count: 1, height: 4.0, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 2.0, doorHeight: 3.0, doorSide: 'all',
        windowType: 'classic', doorType: 'classic', material: 'aged_wood',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.4,
      }),
      makeNode('r-2', 'roof', 'Tier 2 Roof', 980, 50, {
        roofType: 'hip', height: 2.5, overhang: 2.0, color: '#1a1a2e',
      }),
      // Scale down for Tier 3: 56%
      makeNode('xf-3', 'transform_spline', 'Tier 3 Scale', 1280, 200, {
        x: 0, y: 5.3, z: 0, scale: 0.75, rotation: 0,
      }),
      makeNode('fl-3', 'floors', 'Tier 3 Walls', 1580, 250, {
        count: 1, height: 3.5, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'aged_wood',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.3,
      }),
      makeNode('r-3', 'roof', 'Tier 3 Roof', 1580, 50, {
        roofType: 'hip', height: 2.0, overhang: 1.6, color: '#1a1a2e',
      }),
      // Stone base platform
      makeNode('pl-1', 'plinth', 'Stone Base', 50, 500, {
        height: 0.8, material: 'worn_stone',
      }),
      makeNode('st-1', 'stairs', 'Stone Steps', 50, 650, {
        count: 3, stepHeight: 0.26, stepDepth: 0.4, width: 4.0, side: 'all',
      }),
    ],
    edges: [
      // Tier 1 uses base foundation
      { id: 'e1',  source: 'f-1',  target: 'fl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2',  source: 'f-1',  target: 'r-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3',  source: 'fl-1', target: 'r-1',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4',  source: 'f-1',  target: 'pl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5',  source: 'f-1',  target: 'st-1',  sourceHandle: 'spline', targetHandle: 'spline' },
      // Tier 2 chains through transform_spline
      { id: 'e6',  source: 'f-1',  target: 'xf-2',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7',  source: 'xf-2', target: 'fl-2',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e8',  source: 'xf-2', target: 'r-2',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e9',  source: 'fl-2', target: 'r-2',   sourceHandle: 'float',  targetHandle: 'float'  },
      // Tier 3 chains through second transform_spline
      { id: 'e10', source: 'xf-2', target: 'xf-3',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e11', source: 'xf-3', target: 'fl-3',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e12', source: 'xf-3', target: 'r-3',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e13', source: 'fl-3', target: 'r-3',   sourceHandle: 'float',  targetHandle: 'float'  },
    ],
  },

  // \u2500\u2500 20. Zaha Museum (Organic Architecture) \u2500\u2500
  {
    id: 'zaha-museum',
    name: 'Zaha Museum',
    description: 'An organic, fluid museum design featuring sweeping smooth splines, glass curtain walls, and a twisting futuristic roof.',
    category: 'custom',
    icon: '\ud83c\udf00',
    preview: '\ud83c\udf00',
    nodes: [
      makeNode('f-1', 'foundation', 'Organic Base', 50, 250, {
        width: 40, depth: 25, foundationShape: 'C-shape', twistBase: 0, twistMid: 0, twistTop: 0
      }),
      // Smooth the C-Shape into a fluid organic form
      makeNode('sm-1', 'smooth_spline', 'Fluid Curve', 380, 250, {
        tension: 0.65, points: 64, closed: true
      }),
      makeNode('fl-1', 'floors', 'Glass Ribbon', 680, 300, {
        count: 3, height: 4.0, winWidth: 0, winHeight: 0, winSpacing: 10,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'glass', material: 'glass',
        hasBalcony: false, hasRibs: false, plinthHeight: 0,
      }),
      makeNode('r-1', 'roof', 'Sweeping Roof', 680, 50, {
        roofType: 'flat', height: 1.0, overhang: 2.5, color: '#f0f0f5',
      }),
      // Add a modern glass railing around the roof
      makeNode('rl-1', 'railing', 'Roof Balustrade', 980, 50, {
        height: 1.2, type: 'glass'
      })
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'sm-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'sm-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'sm-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' },
      { id: 'e5', source: 'sm-1', target: 'rl-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'fl-1', target: 'rl-1', sourceHandle: 'float', targetHandle: 'float' }, // Railing base is roof height
    ],
  },

  // \u2500\u2500 21. Roman Aqueduct \u2500\u2500
  {
    id: 'roman-aqueduct',
    name: 'Roman Aqueduct',
    description: 'A classical continuous Roman aqueduct utilizing the new column arcade feature to generate beautiful arches.',
    category: 'custom',
    icon: '\ud83c\udfdb\ufe0f',
    preview: '\ud83c\udfdb\ufe0f',
    nodes: [
      // A very long thin strip
      makeNode('f-1', 'foundation', 'Aqueduct Path', 50, 250, {
        width: 100, depth: 3, foundationShape: 'rectangle',
      }),
      // Columns with ARCADE turned ON
      makeNode('col-1', 'columns', 'Arch Arcade', 380, 250, {
        radius: 0.6, height: 8.0, spacing: 6.0, useCorners: true, arcade: true, material: 'sandstone'
      }),
      // Move channel to top of columns
      makeNode('xf-1', 'transform_spline', 'Move to Top', 380, 100, {
        x: 0, y: 8.6, z: 0, scale: 1, rotation: 0
      }),
      // Water channel on top
      makeNode('fl-1', 'floors', 'Water Channel', 680, 50, {
        count: 1, height: 2.0, winWidth: 0, winHeight: 0, winSpacing: 10,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'sandstone',
        hasBalcony: false, hasRibs: false, plinthHeight: 0,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1', target: 'xf-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'xf-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },
  // ── 22. Medieval Castle ──────────────────────────────────────────────────────
  {
    id: 'medieval-castle',
    name: 'Medieval Castle',
    description: 'AAA-grade fortified castle with perimeter walls, corner towers, gatehouse, inner keep, and courtyard. Ready for game use.',
    category: 'custom',
    icon: '🏰',
    preview: '🏰',
    nodes: [
      // Outer perimeter wall spline
      makeNode('f-outer', 'foundation', 'Outer Perimeter', 50, 300, {
        width: 70, depth: 55, foundationShape: 'rectangle',
      }),
      makeNode('cw-1', 'castle_wall', 'Outer Walls', 350, 300, {
        height: 10.0, thickness: 2.5, merlonWidth: 1.3, merlonHeight: 1.8,
        merlonSpacing: 2.0, material: 'worn_stone', hasMachicolations: true,
      }),
      // Corner towers on outer wall
      makeNode('tw-1', 'tower', 'Corner Towers', 350, 100, {
        radius: 5.5, height: 18.0, topType: 'crenellated',
        material: 'worn_stone', segments: 12, wallThickness: 1.0,
      }),
      // Inner keep
      makeNode('f-keep', 'foundation', 'Inner Keep', 700, 300, {
        width: 22, depth: 18, foundationShape: 'rectangle',
      }),
      makeNode('fl-keep', 'floors', 'Keep Walls', 1000, 300, {
        count: 5, height: 4.2, winWidth: 1.0, winHeight: 1.6, winSpacing: 3.5,
        doorWidth: 3.0, doorHeight: 4.0, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'worn_stone',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.8,
      }),
      makeNode('tw-keep', 'tower', 'Keep Tower', 1000, 100, {
        radius: 4.0, height: 30.0, topType: 'crenellated',
        material: 'worn_stone', segments: 12, wallThickness: 1.0,
      }),
      // Main gatehouse
      makeNode('gate-1', 'gate_arch', 'Main Gatehouse', 350, 550, {
        width: 7.0, height: 9.0, thickness: 5.0, archType: 'pointed',
        material: 'worn_stone', towerWidth: 5.0, towerHeight: 16.0,
      }),
      // Ground platform
      makeNode('pl-1', 'plinth', 'Castle Ground', 50, 600, {
        height: 1.2, material: 'worn_stone',
      }),
      makeNode('st-1', 'stairs', 'Entry Steps', 50, 700, {
        count: 5, stepHeight: 0.22, stepDepth: 0.4, width: 5.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-outer', target: 'cw-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-outer', target: 'tw-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'f-outer', target: 'gate-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'f-outer', target: 'pl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-outer', target: 'st-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-keep',  target: 'fl-keep',sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-keep',  target: 'tw-keep',sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 23. Cyberpunk Megablock ──────────────────────────────────────────────────
  {
    id: 'cyberpunk-megablock',
    name: 'Cyberpunk Megablock',
    description: 'Massive Cyberpunk 2077-style arcology block: twisted X-shape skyscraper with neon glass, deep ribs, holographic billboards, and layered urban sprawl.',
    category: 'commercial',
    icon: '🌆',
    preview: '🌆',
    nodes: [
      makeNode('f-1', 'foundation', 'Mega Base', 50, 250, {
        width: 50, depth: 50, foundationShape: 'X-shape',
        taper: 0.7, twistBase: 0, twistMid: 8, twistTop: 18,
      }),
      makeNode('fl-1', 'floors', 'Lower Block', 380, 300, {
        count: 20, height: 4.0, winWidth: 2.5, winHeight: 3.0, winSpacing: 3.0,
        doorWidth: 5.0, doorHeight: 5.0, doorSide: 'all',
        windowType: 'modern', doorType: 'glass', material: 'dark_metal',
        hasBalcony: true, hasRibs: true, plinthHeight: 2.5,
      }),
      makeNode('xf-mid', 'transform_spline', 'Mid Section', 680, 250, {
        x: 0, y: 82, z: 0, scale: 0.75, rotation: 15,
      }),
      makeNode('fl-2', 'floors', 'Upper Spire', 980, 300, {
        count: 15, height: 4.5, winWidth: 2.0, winHeight: 3.0, winSpacing: 2.5,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'glass', material: 'metal',
        hasBalcony: false, hasRibs: true, plinthHeight: 0,
      }),
      makeNode('r-1', 'roof', 'Roof', 980, 50, {
        roofType: 'flat', height: 0.5, overhang: 0, color: '#111111',
      }),
      makeNode('pl-1', 'plinth', 'Mega Podium', 50, 600, {
        height: 2.5, material: 'dark_metal',
      }),
      makeNode('st-1', 'stairs', 'Urban Access', 50, 750, {
        count: 10, stepHeight: 0.25, stepDepth: 0.4, width: 8.0, side: 'all',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',    target: 'fl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',    target: 'pl-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'f-1',    target: 'st-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'f-1',    target: 'xf-mid', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'xf-mid', target: 'fl-2',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'xf-mid', target: 'r-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'fl-2',   target: 'r-1',    sourceHandle: 'float',  targetHandle: 'float'  },
    ],
  },

  // ── 24. Egyptian Pyramid Complex ─────────────────────────────────────────────
  {
    id: 'egyptian-pyramid',
    name: 'Egyptian Pyramid Complex',
    description: 'Great Pyramid of Giza with smooth sandstone sides, flanking smaller pyramids, and a colonnade entry processional.',
    category: 'custom',
    icon: '🔺',
    preview: '🔺',
    nodes: [
      // Great Pyramid
      makeNode('py-1', 'pyramid', 'Great Pyramid', 50, 200, {
        baseWidth: 62, baseDepth: 62, height: 42, steps: 0, material: 'sandstone',
      }),
      // Left smaller pyramid
      makeNode('py-2', 'pyramid', 'Pyramid 2', 50, 400, {
        baseWidth: 38, baseDepth: 38, height: 26, steps: 0, material: 'sandstone',
      }),
      // Right smaller pyramid
      makeNode('py-3', 'pyramid', 'Pyramid 3', 50, 600, {
        baseWidth: 30, baseDepth: 30, height: 20, steps: 0, material: 'sandstone',
      }),
      // Entry colonnade
      makeNode('f-col', 'foundation', 'Processional', 350, 450, {
        width: 8, depth: 60, foundationShape: 'rectangle',
      }),
      makeNode('col-1', 'columns', 'Entry Columns', 650, 450, {
        radius: 0.8, height: 6.0, spacing: 5.0, useCorners: true,
        material: 'sandstone', zOffset: 0,
      }),
      makeNode('pl-1', 'plinth', 'Desert Platform', 350, 650, {
        height: 0.8, material: 'sandstone',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-col', target: 'col-1', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-col', target: 'pl-1',  sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 25. Gothic Fantasy Cathedral ─────────────────────────────────────────────
  {
    id: 'gothic-fantasy-cathedral',
    name: 'Gothic Fantasy Cathedral',
    description: 'AAA fantasy gothic cathedral: tall nave with flying buttresses, 4 corner spires, rose window, grand gate arch, and soaring gable roof.',
    category: 'custom',
    icon: '⛪',
    preview: '⛪',
    nodes: [
      makeNode('f-1', 'foundation', 'Cathedral Nave', 50, 300, {
        width: 22, depth: 60, foundationShape: 'rectangle',
      }),
      makeNode('fl-1', 'floors', 'Nave Walls', 380, 300, {
        count: 10, height: 5.0, winWidth: 2.5, winHeight: 5.0, winSpacing: 4.5,
        doorWidth: 6.0, doorHeight: 9.0, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'limestone',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.5,
      }),
      makeNode('r-1', 'roof', 'Cathedral Roof', 380, 50, {
        roofType: 'gable', height: 18.0, overhang: 0.4, color: '#3a4050',
      }),
      // Flying buttresses
      makeNode('off-butt', 'offset_spline', 'Buttress Ring', 680, 200, { offset: 5.0 }),
      makeNode('butt-1', 'buttress', 'Flying Buttresses', 980, 200, {
        span: 6.0, height: 28.0, thickness: 0.9, material: 'limestone',
      }),
      // Corner spires
      makeNode('sp-1', 'spire', 'Corner Spires', 680, 500, {
        baseRadius: 1.8, height: 30.0, segments: 8,
        material: 'dark_metal', color: '#2a2a35',
      }),
      // Main portal gate
      makeNode('gate-1', 'gate_arch', 'West Portal', 380, 650, {
        width: 7.0, height: 12.0, thickness: 4.0, archType: 'pointed',
        material: 'limestone', towerWidth: 5.0, towerHeight: 20.0,
      }),
      makeNode('pl-1', 'plinth', 'Foundation Base', 50, 600, {
        height: 1.5, material: 'limestone',
      }),
      makeNode('st-1', 'stairs', 'Cathedral Steps', 50, 750, {
        count: 6, stepHeight: 0.22, stepDepth: 0.45, width: 10.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-1',      target: 'fl-1',     sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-1',      target: 'r-1',      sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-1',     target: 'r-1',      sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-1',      target: 'off-butt', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'off-butt', target: 'butt-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-1',      target: 'sp-1',     sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'fl-1',     target: 'sp-1',     sourceHandle: 'float',  targetHandle: 'spline' },
      { id: 'e8', source: 'f-1',      target: 'gate-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e9', source: 'f-1',      target: 'pl-1',     sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e10',source: 'f-1',      target: 'st-1',     sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 26. Roman Colosseum ──────────────────────────────────────────────────────
  {
    id: 'roman-colosseum',
    name: 'Roman Colosseum',
    description: 'Procedural recreation of the Flavian Amphitheatre: elliptical arcade colonnade rings, arched outer walls, and stacked tiers.',
    category: 'custom',
    icon: '🏛️',
    preview: '🏛️',
    nodes: [
      // Outer ellipse (circle approximation)
      makeNode('f-out', 'foundation', 'Outer Ring', 50, 250, {
        width: 80, depth: 60, foundationShape: 'circle',
      }),
      // Smooth for ellipse
      makeNode('sm-1', 'smooth_spline', 'Ellipse Curve', 350, 250, {
        tension: 0.5, points: 64, closed: true,
      }),
      // Outer arcade wall
      makeNode('fl-1', 'floors', 'Outer Arcade Wall', 650, 250, {
        count: 4, height: 5.8, winWidth: 3.5, winHeight: 4.8, winSpacing: 4.6,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'travertine',
        hasBalcony: false, hasRibs: false, plinthHeight: 1.0,
      }),
      // Arcade columns on outer ring
      makeNode('col-out', 'columns', 'Outer Colonnade', 650, 50, {
        radius: 0.5, height: 22.0, spacing: 4.5, useCorners: false,
        material: 'travertine', arcade: true, zOffset: 0,
      }),
      // Inner offset
      makeNode('off-1', 'offset_spline', 'Arena Floor', 350, 500, {
        offset: -16.0,
      }),
      makeNode('pl-arena', 'plinth', 'Arena Floor', 650, 500, {
        height: 0.5, material: 'sandstone',
      }),
      makeNode('pl-base', 'plinth', 'Base Platform', 50, 550, {
        height: 1.0, material: 'concrete',
      }),
      makeNode('st-1', 'stairs', 'Entry Arches', 50, 700, {
        count: 6, stepHeight: 0.2, stepDepth: 0.35, width: 6.0, side: 'all',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-out',  target: 'sm-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'sm-1',   target: 'fl-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'sm-1',   target: 'col-out', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'sm-1',   target: 'off-1',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'off-1',  target: 'pl-arena',sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-out',  target: 'pl-base', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-out',  target: 'st-1',    sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 27. Mayan Temple ─────────────────────────────────────────────────────────
  {
    id: 'mayan-temple',
    name: 'Mayan Temple (El Castillo)',
    description: 'Kukulcán pyramid: 9 stepped platforms, staircase on all four sides, and a crowning temple chamber. Perfect for game environments.',
    category: 'custom',
    icon: '🗿',
    preview: '🗿',
    nodes: [
      // Main stepped pyramid
      makeNode('py-1', 'pyramid', 'Main Pyramid', 50, 200, {
        baseWidth: 55, baseDepth: 55, height: 28, steps: 9, material: 'sandstone',
      }),
      // Top temple
      makeNode('f-top', 'foundation', 'Top Temple', 380, 200, {
        width: 12, depth: 10, foundationShape: 'rectangle',
      }),
      makeNode('fl-top', 'floors', 'Temple Chamber', 680, 200, {
        count: 1, height: 5.5, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 2.5, doorHeight: 3.5, doorSide: 'all',
        windowType: 'classic', doorType: 'classic', material: 'sandstone',
        hasBalcony: false, hasRibs: false, plinthHeight: 0,
      }),
      makeNode('r-top', 'roof', 'Temple Roof', 680, 50, {
        roofType: 'flat', height: 1.2, overhang: 0.3, color: '#b8860b',
      }),
      // Staircase on 4 sides
      makeNode('st-1', 'stairs', 'Grand Staircase', 50, 550, {
        count: 18, stepHeight: 0.16, stepDepth: 0.32, width: 6.0, side: 'all',
      }),
      makeNode('f-base', 'foundation', 'Plaza', 380, 500, {
        width: 80, depth: 80, foundationShape: 'rectangle',
      }),
      makeNode('pl-base', 'plinth', 'Base Platform', 680, 500, {
        height: 0.4, material: 'sandstone',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-top',  target: 'fl-top',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-top',  target: 'r-top',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-top', target: 'r-top',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-base', target: 'st-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-base', target: 'pl-base', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 28. Suspension Bridge ────────────────────────────────────────────────────
  {
    id: 'suspension-bridge',
    name: 'Suspension Bridge',
    description: 'Golden Gate-style suspension bridge with H-frame pylons, catenary cable profile, and detailed concrete deck with parapets.',
    category: 'custom',
    icon: '🌉',
    preview: '🌉',
    nodes: [
      makeNode('br-1', 'bridge', 'Main Span', 50, 250, {
        span: 120.0, width: 12.0, deckHeight: 0.8, archCount: 1,
        bridgeType: 'suspension', pylonHeight: 28.0,
        material: 'concrete', deckMaterial: 'concrete', zOffset: 0,
      }),
    ],
    edges: [],
  },

  // ── 29. Roman Arch Bridge ────────────────────────────────────────────────────
  {
    id: 'roman-arch-bridge',
    name: 'Roman Arch Bridge',
    description: 'A multi-span Roman arch bridge with 5 barrel vaults, sandstone piers, and a flat walking deck — ideal for ancient/historical environments.',
    category: 'custom',
    icon: '🌁',
    preview: '🌁',
    nodes: [
      makeNode('br-1', 'bridge', 'Arch Bridge', 50, 250, {
        span: 90.0, width: 9.0, deckHeight: 0.6, archCount: 5,
        bridgeType: 'arch', archHeight: 9.0,
        material: 'sandstone', deckMaterial: 'sandstone', zOffset: 0,
      }),
    ],
    edges: [],
  },

  // ── 30. Fantasy Dragon Keep ───────────────────────────────────────────────────
  {
    id: 'fantasy-dragon-keep',
    name: 'Fantasy Dragon Keep',
    description: 'Imposing fantasy keep: U-shape inner ward with 6 round towers, outer curtain wall with battlements, two side gate arches, and onion-top central tower.',
    category: 'custom',
    icon: '🐉',
    preview: '🐉',
    nodes: [
      // Outer curtain wall
      makeNode('f-out', 'foundation', 'Curtain Wall', 50, 300, {
        width: 90, depth: 70, foundationShape: 'rectangle',
      }),
      makeNode('cw-out', 'castle_wall', 'Outer Curtain', 380, 300, {
        height: 12.0, thickness: 3.0, merlonWidth: 1.5, merlonHeight: 2.0,
        merlonSpacing: 2.5, material: 'worn_stone', hasMachicolations: true,
      }),
      makeNode('tw-out', 'tower', 'Wall Towers', 380, 100, {
        radius: 6.0, height: 22.0, topType: 'crenellated',
        material: 'worn_stone', segments: 12,
      }),
      // Inner keep (U-shape)
      makeNode('f-inner', 'foundation', 'Inner Ward', 700, 300, {
        width: 40, depth: 35, foundationShape: 'U-shape',
      }),
      makeNode('fl-inner', 'floors', 'Great Hall', 1000, 300, {
        count: 4, height: 5.0, winWidth: 1.2, winHeight: 2.0, winSpacing: 3.0,
        doorWidth: 4.0, doorHeight: 5.5, doorSide: 'front',
        windowType: 'arched', doorType: 'classic', material: 'worn_stone',
        hasBalcony: false, hasRibs: true, plinthHeight: 1.0,
      }),
      // Central throne tower with onion top
      makeNode('tw-central', 'tower', 'Throne Tower', 1000, 50, {
        radius: 7.0, height: 35.0, topType: 'onion',
        material: 'worn_stone', segments: 16,
        conicalHeight: 8.0, conicalColor: '#3a1a0a',
      }),
      // Gate arches
      makeNode('gate-1', 'gate_arch', 'Main Gate', 380, 600, {
        width: 8.0, height: 10.0, thickness: 5.0, archType: 'pointed',
        material: 'worn_stone', towerWidth: 5.0, towerHeight: 18.0,
      }),
      makeNode('pl-1', 'plinth', 'Foundation', 50, 700, {
        height: 1.5, material: 'worn_stone',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-out',   target: 'cw-out',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-out',   target: 'tw-out',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'f-out',   target: 'gate-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e4', source: 'f-out',   target: 'pl-1',      sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-inner', target: 'fl-inner',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-inner', target: 'tw-central',sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },
  // ── 31. RDR2 Western Town ─────────────────────────────────────────────────
  {
    id: 'rdr2-western-town',
    name: 'RDR2 Western Town',
    description: 'Red Dead Redemption 2-style frontier town: saloon, sheriff office, bank, and general store with weathered wood, cracked plaster, and tin roofs.',
    category: 'game',
    icon: '🤠',
    preview: '🤠',
    nodes: [
      // ── Saloon (main large building)
      makeNode('f-sal', 'foundation', 'Saloon', 50, 100, {
        width: 18, depth: 12, foundationShape: 'rectangle',
      }),
      makeNode('fl-sal', 'floors', 'Saloon Walls', 350, 100, {
        count: 2, height: 3.8, winWidth: 1.8, winHeight: 2.2, winSpacing: 3.5,
        doorWidth: 2.8, doorHeight: 3.2, doorSide: 'front',
        windowType: 'classic', doorType: 'double', material: 'weathered_wood',
        hasBalcony: true, hasRibs: false, plinthHeight: 0.5,
      }),
      makeNode('r-sal', 'roof', 'Saloon Facade Roof', 350, 0, {
        roofType: 'flat', height: 0.4, overhang: 1.2, color: '#5a3a1a',
      }),
      makeNode('pl-sal', 'plinth', 'Saloon Base', 350, 300, {
        height: 0.5, material: 'weathered_wood',
      }),
      // ── Sheriff Office
      makeNode('f-sh', 'foundation', 'Sheriff Office', 50, 350, {
        width: 10, depth: 8, foundationShape: 'rectangle',
      }),
      makeNode('fl-sh', 'floors', 'Sheriff Walls', 350, 350, {
        count: 1, height: 3.5, winWidth: 1.2, winHeight: 1.5, winSpacing: 3.0,
        doorWidth: 1.8, doorHeight: 2.4, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'cracked_plaster',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.3,
      }),
      makeNode('r-sh', 'roof', 'Sheriff Roof', 350, 250, {
        roofType: 'gable', height: 2.0, overhang: 0.6, color: '#4a3020',
      }),
      // ── General Store
      makeNode('f-gs', 'foundation', 'General Store', 50, 550, {
        width: 12, depth: 8, foundationShape: 'rectangle',
      }),
      makeNode('fl-gs', 'floors', 'Store Walls', 350, 550, {
        count: 1, height: 4.0, winWidth: 2.0, winHeight: 2.0, winSpacing: 4.0,
        doorWidth: 2.2, doorHeight: 2.8, doorSide: 'front',
        windowType: 'classic', doorType: 'double', material: 'painted_wood',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.4,
      }),
      makeNode('r-gs', 'roof', 'Store Roof', 350, 450, {
        roofType: 'shed', height: 1.5, overhang: 0.8, color: '#3a2810',
      }),
      // ── Scatter trees
      makeNode('sc-1', 'scatter_points', 'Desert Scrub', 700, 400, {
        count: 25, seed: 99, minScale: 0.5, maxScale: 1.0,
      }),
      // ── Stairs
      makeNode('st-sal', 'stairs', 'Saloon Steps', 700, 100, {
        count: 2, stepHeight: 0.2, stepDepth: 0.45, width: 3.0, side: 'front',
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-sal', target: 'fl-sal', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-sal', target: 'r-sal',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-sal',target: 'r-sal',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-sal', target: 'pl-sal', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-sal', target: 'st-sal', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-sh',  target: 'fl-sh',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-sh',  target: 'r-sh',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e8', source: 'fl-sh', target: 'r-sh',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e9', source: 'f-gs',  target: 'fl-gs',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e10',source: 'f-gs',  target: 'r-gs',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e11',source: 'fl-gs', target: 'r-gs',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e12',source: 'f-sal', target: 'sc-1',   sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 32. Cyberpunk Night City Block ────────────────────────────────────────
  {
    id: 'cyberpunk-city-block',
    name: 'Cyberpunk Night City Block',
    description: 'Cyberpunk 2077-style urban block: neon-lit megabuildings, holographic panels, asphalt streets, wet concrete podium, and scattered neon signage.',
    category: 'game',
    icon: '🌃',
    preview: '🌃',
    nodes: [
      // ── Main mega tower
      makeNode('f-main', 'foundation', 'Main Tower Base', 50, 200, {
        width: 30, depth: 25, foundationShape: 'rectangle',
        taper: 0.8, twistBase: 0, twistMid: 5, twistTop: 12,
      }),
      makeNode('fl-main', 'floors', 'Tower Skin', 380, 200, {
        count: 35, height: 4.2, winWidth: 2.8, winHeight: 3.2, winSpacing: 3.2,
        doorWidth: 5.0, doorHeight: 5.0, doorSide: 'all',
        windowType: 'modern', doorType: 'glass', material: 'wet_concrete',
        hasBalcony: true, hasRibs: true, plinthHeight: 3.0,
      }),
      makeNode('r-main', 'roof', 'Tower Roof', 380, 50, {
        roofType: 'flat', height: 0.8, overhang: 0, color: '#0a0a0c',
      }),
      // ── Side building (neon-covered)
      makeNode('f-side', 'foundation', 'Side Block', 50, 500, {
        width: 18, depth: 20, foundationShape: 'rectangle',
      }),
      makeNode('fl-side', 'floors', 'Neon Block', 380, 500, {
        count: 18, height: 3.8, winWidth: 2.0, winHeight: 2.5, winSpacing: 2.8,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'glass', material: 'rust_panel',
        hasBalcony: false, hasRibs: true, plinthHeight: 2.0,
      }),
      makeNode('r-side', 'roof', 'Side Roof', 380, 400, {
        roofType: 'flat', height: 0.4, overhang: 0, color: '#111111',
      }),
      // ── Podium platform (street level)
      makeNode('f-pod', 'foundation', 'Street Podium', 700, 200, {
        width: 80, depth: 60, foundationShape: 'rectangle',
      }),
      makeNode('pl-pod', 'plinth', 'Asphalt Base', 1000, 200, {
        height: 0.3, material: 'asphalt',
      }),
      // ── Neon accent tower (billboard tower)
      makeNode('f-bill', 'foundation', 'Billboard Tower', 50, 750, {
        width: 4, depth: 4, foundationShape: 'rectangle',
      }),
      makeNode('fl-bill', 'floors', 'Billboard Panel', 380, 750, {
        count: 8, height: 5.0, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'modern', material: 'neon_blue',
        hasBalcony: false, hasRibs: false, plinthHeight: 0,
      }),
      // ── Scatter (urban debris/props)
      makeNode('sc-1', 'scatter_points', 'Urban Props', 700, 500, {
        count: 40, seed: 777, minScale: 0.3, maxScale: 0.8,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-main', target: 'fl-main', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-main', target: 'r-main',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-main',target: 'r-main',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-side', target: 'fl-side', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-side', target: 'r-side',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'fl-side',target: 'r-side',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e7', source: 'f-pod',  target: 'pl-pod',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e8', source: 'f-pod',  target: 'sc-1',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e9', source: 'f-bill', target: 'fl-bill', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 33. Wild West Ranch ───────────────────────────────────────────────────
  {
    id: 'wild-west-ranch',
    name: 'Wild West Ranch',
    description: 'RDR2-style ranch: main house, large red barn, stable block, water tower cylinder, stone corral fence ring, and scattered trees.',
    category: 'game',
    icon: '🐎',
    preview: '🐎',
    nodes: [
      // ── Farmhouse
      makeNode('f-house', 'foundation', 'Ranch House', 50, 150, {
        width: 14, depth: 10, foundationShape: 'rectangle',
      }),
      makeNode('fl-house', 'floors', 'House Walls', 350, 150, {
        count: 1, height: 3.6, winWidth: 1.2, winHeight: 1.5, winSpacing: 3.0,
        doorWidth: 1.8, doorHeight: 2.4, doorSide: 'front',
        windowType: 'classic', doorType: 'classic', material: 'painted_wood',
        hasBalcony: true, hasRibs: false, plinthHeight: 0.4,
      }),
      makeNode('r-house', 'roof', 'House Roof', 350, 50, {
        roofType: 'gable', height: 3.0, overhang: 0.7, color: '#3a2010',
      }),
      makeNode('pl-house', 'plinth', 'Porch Base', 350, 350, {
        height: 0.4, material: 'weathered_wood',
      }),
      makeNode('st-house', 'stairs', 'Porch Steps', 700, 150, {
        count: 2, stepHeight: 0.18, stepDepth: 0.4, width: 2.5, side: 'front',
      }),
      // ── Red Barn
      makeNode('f-barn', 'foundation', 'Barn', 50, 450, {
        width: 22, depth: 12, foundationShape: 'rectangle',
      }),
      makeNode('fl-barn', 'floors', 'Barn Walls', 350, 450, {
        count: 1, height: 6.0, winWidth: 1.5, winHeight: 1.2, winSpacing: 5.0,
        doorWidth: 4.0, doorHeight: 4.5, doorSide: 'frontback',
        windowType: 'classic', doorType: 'double', material: 'red_barn',
        hasBalcony: false, hasRibs: false, plinthHeight: 0.3,
      }),
      makeNode('r-barn', 'roof', 'Barn Roof', 350, 350, {
        roofType: 'gable', height: 4.0, overhang: 0.5, color: '#1a0f08',
      }),
      // ── Water Tower
      makeNode('cyl-wt', 'primitive_cylinder', 'Water Tower Tank', 50, 700, {
        radius: 2.2, height: 4.0, radialSegments: 12,
      }),
      // ── Scatter
      makeNode('sc-trees', 'scatter_points', 'Ranch Trees', 700, 450, {
        count: 30, seed: 555, minScale: 0.7, maxScale: 1.5,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-house', target: 'fl-house', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-house', target: 'r-house',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-house',target: 'r-house',  sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-house', target: 'pl-house', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'f-house', target: 'st-house', sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-barn',  target: 'fl-barn',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-barn',  target: 'r-barn',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e8', source: 'fl-barn', target: 'r-barn',   sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e9', source: 'f-house', target: 'sc-trees', sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },

  // ── 34. Cyberpunk Alley (Street Canyon) ──────────────────────────────────
  {
    id: 'cyberpunk-alley',
    name: 'Cyberpunk Alley',
    description: 'Narrow Cyberpunk 2077 street canyon: towering rust-paneled walls, neon pink & blue signage, wet asphalt ground, and overcrowded fire escapes.',
    category: 'game',
    icon: '🌉',
    preview: '🌉',
    nodes: [
      // ── Left wall block
      makeNode('f-left', 'foundation', 'Left Block', 50, 200, {
        width: 15, depth: 40, foundationShape: 'rectangle',
      }),
      makeNode('fl-left', 'floors', 'Left Facade', 380, 200, {
        count: 22, height: 4.0, winWidth: 1.5, winHeight: 2.0, winSpacing: 2.5,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'modern', material: 'rust_panel',
        hasBalcony: true, hasRibs: true, plinthHeight: 1.5,
      }),
      makeNode('r-left', 'roof', 'Left Roof', 380, 80, {
        roofType: 'flat', height: 0.5, overhang: 0, color: '#0a0a0a',
      }),
      // ── Neon accent strips on left
      makeNode('off-left', 'offset_spline', 'Neon Strip Offset', 680, 200, { offset: -0.5 }),
      makeNode('pl-neon-l', 'plinth', 'Neon Strip L', 980, 200, {
        height: 0.4, material: 'neon_pink',
      }),
      // ── Right wall block
      makeNode('f-right', 'foundation', 'Right Block', 50, 550, {
        width: 15, depth: 40, foundationShape: 'rectangle',
      }),
      makeNode('fl-right', 'floors', 'Right Facade', 380, 550, {
        count: 18, height: 4.0, winWidth: 1.5, winHeight: 2.0, winSpacing: 2.5,
        doorWidth: 2.0, doorHeight: 3.0, doorSide: 'front',
        windowType: 'modern', doorType: 'glass', material: 'wet_concrete',
        hasBalcony: true, hasRibs: true, plinthHeight: 1.5,
      }),
      makeNode('r-right', 'roof', 'Right Roof', 380, 430, {
        roofType: 'flat', height: 0.5, overhang: 0, color: '#0a0a0a',
      }),
      // ── Street level (asphalt)
      makeNode('f-street', 'foundation', 'Street Ground', 700, 400, {
        width: 12, depth: 45, foundationShape: 'rectangle',
      }),
      makeNode('pl-street', 'plinth', 'Asphalt Road', 1000, 400, {
        height: 0.15, material: 'asphalt',
      }),
      // ── Neon billboard tower
      makeNode('f-sign', 'foundation', 'Neon Sign', 50, 800, {
        width: 3, depth: 3, foundationShape: 'rectangle',
      }),
      makeNode('fl-sign', 'floors', 'Neon Billboard', 380, 800, {
        count: 5, height: 4.0, winWidth: 0, winHeight: 0, winSpacing: 20,
        doorWidth: 0, doorHeight: 0, doorSide: 'front',
        windowType: 'modern', doorType: 'modern', material: 'neon_blue',
        hasBalcony: false, hasRibs: false, plinthHeight: 0,
      }),
    ],
    edges: [
      { id: 'e1', source: 'f-left',   target: 'fl-left',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e2', source: 'f-left',   target: 'r-left',     sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e3', source: 'fl-left',  target: 'r-left',     sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e4', source: 'f-left',   target: 'off-left',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e5', source: 'off-left', target: 'pl-neon-l',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e6', source: 'f-right',  target: 'fl-right',   sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e7', source: 'f-right',  target: 'r-right',    sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e8', source: 'fl-right', target: 'r-right',    sourceHandle: 'float',  targetHandle: 'float'  },
      { id: 'e9', source: 'f-street', target: 'pl-street',  sourceHandle: 'spline', targetHandle: 'spline' },
      { id: 'e10',source: 'f-sign',   target: 'fl-sign',    sourceHandle: 'spline', targetHandle: 'spline' },
    ],
  },
];
