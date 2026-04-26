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
];

