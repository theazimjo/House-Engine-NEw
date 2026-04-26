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
  // ── AAA Game/Architecture Nodes ──
  | 'castle_wall'       // Battlements, merlons, crenellations
  | 'tower'             // Round/square tower with conical/crenellated top
  | 'bridge'            // Arch/suspension/cable-stayed bridge deck
  | 'gate_arch'         // Castle gate, triumphal arch
  | 'terrain'           // Ground terrain with height noise
  | 'spire'             // Gothic spire / minaret tip
  | 'buttress'          // Flying buttress pair
  | 'pyramid'           // Stepped/smooth pyramid
  // ── City Generation ──
  | 'road_grid'         // Street grid (asphalt + sidewalks + markings)
  | 'city_block'        // City block: multiple buildings on a plot
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
  // ── AAA Nodes ──
  castle_wall: {
    height: 8.0,
    thickness: 2.0,
    merlonWidth: 1.2,
    merlonHeight: 1.5,
    merlonSpacing: 2.4,
    material: 'worn_stone',
    zOffset: 0,
    hasMachicolations: false,
  },
  tower: {
    radius: 4.0,
    height: 20.0,
    topType: 'crenellated', // 'crenellated' | 'conical' | 'flat' | 'onion'
    material: 'worn_stone',
    zOffset: 0,
    segments: 16,
    wallThickness: 0.8,
    conicalHeight: 5.0,
    conicalColor: '#5a3a2a',
  },
  bridge: {
    span: 40.0,
    width: 8.0,
    deckHeight: 0.6,
    archCount: 3,
    archHeight: 8.0,
    bridgeType: 'arch',   // 'arch' | 'flat' | 'suspension' | 'cable'
    material: 'sandstone',
    deckMaterial: 'concrete',
    pylonHeight: 18.0,
    zOffset: 0,
  },
  gate_arch: {
    width: 6.0,
    height: 8.0,
    thickness: 3.0,
    archType: 'pointed',  // 'round' | 'pointed' | 'flat' | 'triumphal'
    material: 'worn_stone',
    zOffset: 0,
    towerWidth: 4.0,
    towerHeight: 14.0,
  },
  terrain: {
    width: 200,
    depth: 200,
    segments: 40,
    maxHeight: 12.0,
    seed: 42,
    material: 'grass',
  },
  spire: {
    baseRadius: 1.5,
    height: 20.0,
    segments: 8,
    material: 'dark_metal',
    color: '#2a2a3a',
    zOffset: 0,
  },
  buttress: {
    span: 5.0,
    height: 12.0,
    thickness: 0.8,
    material: 'limestone',
    zOffset: 0,
    count: 4,
  },
  pyramid: {
    baseWidth: 30.0,
    baseDepth: 30.0,
    height: 20.0,
    steps: 0,            // 0 = smooth, >0 = stepped like Mayan
    material: 'sandstone',
  },
  // ── City Generation ──
  road_grid: {
    blocksX: 4,          // Number of blocks along X axis
    blocksZ: 4,          // Number of blocks along Z axis
    blockWidth: 40,      // Width of each city block (m)
    blockDepth: 40,      // Depth of each city block (m)
    roadWidth: 10,       // Width of road (m)
    sidewalkWidth: 2.5,  // Sidewalk on each side (m)
    style: 'modern',     // 'modern' | 'western' | 'cyberpunk' | 'medieval'
    addLaneMarkings: true,
    addSidewalks: true,
  },
  city_block: {
    width: 40,           // Block width (m)
    depth: 40,           // Block depth (m)
    style: 'modern',     // 'modern' | 'western' | 'cyberpunk' | 'medieval'
    density: 0.75,       // 0-1: how packed the block is
    minHeight: 8,        // Min building height (m)
    maxHeight: 60,       // Max building height (m)
    minFloors: 2,
    maxFloors: 15,
    seed: 42,
    setbackMin: 1,       // Min distance from plot edge
    setbackMax: 3,       // Max distance from plot edge
    material: 'concrete',
    roofType: 'flat',
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
  foundation:        { inputs: [],                          outputs: ['spline'] },
  primitive_box:     { inputs: [],                          outputs: ['mesh'] },
  primitive_cylinder:{ inputs: [],                          outputs: ['mesh'] },
  floors:            { inputs: ['spline'],                   outputs: ['mesh', 'window', 'float'] },
  roof:              { inputs: ['spline', 'float'],          outputs: ['mesh'] },
  columns:           { inputs: ['spline'],                   outputs: ['mesh'] },
  stairs:            { inputs: ['spline'],                   outputs: ['mesh'] },
  plinth:            { inputs: ['spline'],                   outputs: ['mesh'] },
  railing:           { inputs: ['spline'],                   outputs: ['mesh'] },
  dome:              { inputs: ['spline'],                   outputs: ['mesh'] },
  // ── AAA Nodes ──
  castle_wall:       { inputs: ['spline'],                   outputs: ['mesh'] },
  tower:             { inputs: ['spline'],                   outputs: ['mesh'] },
  bridge:            { inputs: [],                           outputs: ['mesh'] },
  gate_arch:         { inputs: ['spline'],                   outputs: ['mesh'] },
  terrain:           { inputs: [],                           outputs: ['mesh'] },
  spire:             { inputs: ['spline'],                   outputs: ['mesh'] },
  buttress:          { inputs: ['spline'],                   outputs: ['mesh'] },
  pyramid:           { inputs: [],                           outputs: ['mesh'] },
  // ── City Generation ──
  road_grid:         { inputs: [],                           outputs: ['mesh'] },
  city_block:        { inputs: [],                           outputs: ['mesh'] },
  offset_spline:     { inputs: ['spline'],                   outputs: ['spline'] },
  smooth_spline:     { inputs: ['spline'],                   outputs: ['spline'] },
  transform_spline:  { inputs: ['spline'],                   outputs: ['spline'] },
  mirror_spline:     { inputs: ['spline'],                   outputs: ['spline'] },
  boolean_subtract:  { inputs: ['mesh', 'mesh'],             outputs: ['mesh'] },
  math_node:         { inputs: ['float', 'float'],           outputs: ['float'] },
  merge_mesh:        { inputs: ['mesh', 'mesh'],             outputs: ['mesh'] },
  scatter_points:    { inputs: ['spline'],                   outputs: ['mesh'] },
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
