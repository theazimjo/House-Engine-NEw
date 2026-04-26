import type { Node, Edge } from 'reactflow';

// ── Pin Types ────────────────────────────────────────────────────────────────
export type PinType =
  | 'spline'    // Geometric path (green)
  | 'mesh'      // 3D geometry (blue)
  | 'float'     // Numeric value (amber)
  | 'integer'   // Integer value (cyan)
  | 'boolean'   // True/False (purple)
  | 'material'  // Material slot (red)
  | 'transform' // Position/Rotation/Scale (yellow)
  | 'array'     // Collection (white)
  | 'mask'      // Mask (red)
  | 'window'    // Window output (sky)
  | 'floors';   // Floors output (pink)

// ── Node Types ───────────────────────────────────────────────────────────────
export type NodeType =
  // Generators
  | 'foundation'
  | 'primitive_box'
  | 'primitive_cylinder'
  // Structure
  | 'floors'
  | 'roof'
  | 'dome'
  | 'columns'
  | 'stairs'
  | 'plinth'
  | 'railing'
  // Modifiers
  | 'offset_spline'
  | 'transform_spline'
  | 'mirror_spline'
  | 'smooth_spline'
  // Utilities
  | 'math_node'
  | 'merge_mesh'
  | 'scatter_points';


// ── Node Data ─────────────────────────────────────────────────────────────────
export interface NodeData {
  label: string;
  type: NodeType;
  params: Record<string, any>;
  onChange: (id: string, params: Record<string, any>) => void;
  inputs?: PinType[];
  outputs?: PinType[];
  onDelete?: (id: string) => void;
}

// ── Graph Types ───────────────────────────────────────────────────────────────
export interface ViewportProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export type BuildingNode = Node<NodeData>;
export type BuildingEdge = Edge;

// ── Default Params by Node Type ───────────────────────────────────────────────
export const DEFAULT_PARAMS: Record<NodeType, Record<string, any>> = {
  foundation: {
    width: 14,
    depth: 10,
    foundationShape: 'rectangle',
    twistBase: 0,
    twistMid: 0,
    twistTop: 0,
    taper: 1,
    shearX: 0,
    shearY: 0,
    jitter: 0,
  },
  floors: {
    count: 5,
    height: 3.2,
    winWidth: 1.2,
    winHeight: 1.8,
    winSpacing: 2.5,
    doorWidth: 1.8,
    doorHeight: 2.4,
    doorOffset: 0,
    doorSide: 'front',
    showWindow: true,
    windowType: 'modern',
    doorType: 'modern',
    material: 'bricks',
    hasBalcony: true,
    hasRibs: false,
    plinthHeight: 0.8,
  },
  roof: {
    roofType: 'pitched',
    height: 3,
    overhang: 0.5,
    color: '#8e2b2b',
  },
  columns: {
    radius: 0.3,
    height: 4.0,
    spacing: 3.0,
    useCorners: true,
    material: 'concrete',
    arcade: false,
  },
  stairs: {
    count: 4,
    stepHeight: 0.2,
    stepDepth: 0.3,
    width: 2.5,
  },
  plinth: {
    height: 0.8,
    material: 'concrete',
  },
  railing: {
    height: 1.0,
    type: 'glass',
  },
  dome: {
    radius: 6.0,
    segments: 24,
    material: 'marble',
    zOffset: 0,
    color: '#e8dfc8',
  },
  offset_spline: {
    amount: -1.0,
  },
  smooth_spline: {
    tension: 0.5,
    points: 50,
    closed: true,
  },
  transform_spline: {
    x: 0,
    y: 0,
    z: 0,
    scale: 1.0,
    rotation: 0,
  },
  mirror_spline: {
    axis: 'x',
    offset: 0,
  },
  math_node: {
    operation: 'multiply',
    valueA: 1.0,
    valueB: 1.0,
  },
  primitive_box: {
    width: 2,
    height: 2,
    depth: 2,
  },
  primitive_cylinder: {
    radius: 1,
    height: 2,
    radialSegments: 32,
  },
  boolean_subtract: {
    operation: 'subtract',
  },
  merge_mesh: {},
  scatter_points: {
    count: 20,
    seed: 42,
    minScale: 0.8,
    maxScale: 1.2,
  },
};

// ── Node Pin Definitions ──────────────────────────────────────────────────────
export const NODE_PINS: Record<NodeType, { inputs: PinType[]; outputs: PinType[] }> = {
  foundation:       { inputs: [],                          outputs: ['spline'] },
  primitive_box:    { inputs: [],                          outputs: ['mesh'] },
  primitive_cylinder:{ inputs: [],                         outputs: ['mesh'] },
  floors:           { inputs: ['spline'],                   outputs: ['mesh', 'window', 'float'] },
  roof:             { inputs: ['spline', 'float'],          outputs: ['mesh'] },
  columns:          { inputs: ['spline'],                   outputs: ['mesh'] },
  stairs:           { inputs: ['spline'],                   outputs: ['mesh'] },
  plinth:           { inputs: ['spline'],                   outputs: ['mesh'] },
  railing:          { inputs: ['spline'],                   outputs: ['mesh'] },
  dome:             { inputs: ['spline'],                   outputs: ['mesh'] },
  offset_spline:    { inputs: ['spline'],                   outputs: ['spline'] },
  smooth_spline:    { inputs: ['spline'],                   outputs: ['spline'] },
  transform_spline: { inputs: ['spline'],                   outputs: ['spline'] },
  mirror_spline:    { inputs: ['spline'],                   outputs: ['spline'] },
  boolean_subtract: { inputs: ['mesh', 'mesh'],             outputs: ['mesh'] },
  math_node:        { inputs: ['float', 'float'],           outputs: ['float'] },
  merge_mesh:       { inputs: ['mesh', 'mesh'],             outputs: ['mesh'] },
  scatter_points:   { inputs: ['spline'],                   outputs: ['mesh'] },
};

// ── Legacy BuildingParams ─────────────────────────────────────────────────────
export interface BuildingParams {
  width: number;
  depth: number;
  wallThickness: number;
  windowSpacing: number;
  windowSize: [number, number];
  windowHeight: number;
  sillHeight: number;
  roofType: 'flat' | 'pitched' | 'dome';
  foundationShape: 'rectangle' | 'circle' | 'hexagon' | 'L-shape' | 'U-shape' | 'C-shape' | 'X-shape' | 'custom';
  floors: number;
  floorHeight: number;
  twistBase: number;
  twistMid: number;
  twistTop: number;
  taper: number;
  shearX: number;
  shearY: number;
  jitter: number;
  height: number;
  balconyDepth: number;
  columnRadius: number;
  columnSpacing: number;
  stairsWidth: number;
  showBalcony: boolean;
  showColumns: boolean;
  showStairs: boolean;
}
