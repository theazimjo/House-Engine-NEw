import type { Node, Edge } from 'reactflow';

export type NodeType = 'foundation';
export type PinType = 'spline' | 'mesh' | 'float' | 'mask' | 'window';

export interface NodeData {
  label: string;
  type: NodeType;
  params: Record<string, any>;
  onChange: (id: string, params: Record<string, any>) => void;
  inputs?: PinType[];
  outputs?: PinType[];
}

export interface ViewportProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

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

export type BuildingNode = Node<NodeData>;
export type BuildingEdge = Edge;
