import type { Node, Edge } from 'reactflow';

export type NodeType = 'foundation' | 'extrude' | 'scatter' | 'output' | 'balcony' | 'column' | 'stairs';

export interface NodeData {
  label: string;
  type: NodeType;
  params: Record<string, any>;
  onChange: (id: string, params: Record<string, any>) => void;
}

export interface BuildingParams {
  width: number;
  depth: number;
  floors: number;
  floorHeight: number;
  wallThickness: number;
  windowSpacing: number;
  windowSize: [number, number];
  windowHeight: number;
  sillHeight: number;
  roofType: 'flat' | 'pitched' | 'dome';
  foundationShape: 'rectangle' | 'L-shape';
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
