import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../types';

export const getBuildingPresets = (updateNodeParams: (id: string, params: any) => void) => {
  const baseData = { onChange: updateNodeParams };

  const panelka: { nodes: Node<NodeData>[]; edges: Edge[] } = {
    nodes: [
      { id: 'p-f1', type: 'buildingNode', position: { x: 0, y: 200 }, data: { ...baseData, label: 'Foundation', type: 'foundation', params: { width: 14, depth: 10, foundationShape: 'rectangle' }, outputs: ['spline'] } },
      { id: 'p-e1', type: 'buildingNode', position: { x: 280, y: 200 }, data: { ...baseData, label: 'Floor Gen', type: 'extrude', params: { floors: 9, floorHeight: 3 }, inputs: ['spline'], outputs: ['mesh'] } },
      { id: 'p-sp', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Split Mesh', type: 'split', params: {}, inputs: ['mesh'], outputs: ['mesh', 'mesh'] } },
      { id: 'p-s1', type: 'buildingNode', position: { x: 820, y: 50 }, data: { ...baseData, label: 'Facade', type: 'scatter', params: { windowSpacing: 2.5 }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 'p-o1', type: 'buildingNode', position: { x: 820, y: 350 }, data: { ...baseData, label: 'Roof', type: 'output', params: { roofType: 'flat' }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 'p-m1', type: 'buildingNode', position: { x: 1100, y: 200 }, data: { ...baseData, label: 'Merge Building', type: 'merge', params: {}, inputs: ['mesh', 'mesh'], outputs: ['mesh'] } },
    ],
    edges: [
      { id: 'pe1', source: 'p-f1', target: 'p-e1', sourceHandle: 'spline-0', targetHandle: 'spline-0' },
      { id: 'pe2', source: 'p-e1', target: 'p-sp', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'pe3', source: 'p-sp', target: 'p-s1', sourceHandle: 'mesh-1', targetHandle: 'mesh-0' },
      { id: 'pe4', source: 'p-sp', target: 'p-o1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'pe5', source: 'p-s1', target: 'p-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'pe6', source: 'p-o1', target: 'p-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-1' },
    ]
  };

  const villa: { nodes: Node<NodeData>[]; edges: Edge[] } = {
    nodes: [
      { id: 'v-f1', type: 'buildingNode', position: { x: 0, y: 200 }, data: { ...baseData, label: 'L-Base', type: 'foundation', params: { width: 14, depth: 12, foundationShape: 'L-shape' }, outputs: ['spline'] } },
      { id: 'v-e1', type: 'buildingNode', position: { x: 280, y: 200 }, data: { ...baseData, label: '2 Floors', type: 'extrude', params: { floors: 2, floorHeight: 3.5 }, inputs: ['spline'], outputs: ['mesh'] } },
      { id: 'v-sp', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Split', type: 'split', params: {}, inputs: ['mesh'], outputs: ['mesh', 'mesh'] } },
      { id: 'v-s1', type: 'buildingNode', position: { x: 820, y: 50 }, data: { ...baseData, label: 'Modern Facade', type: 'scatter', params: { windowSpacing: 3 }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 'v-o1', type: 'buildingNode', position: { x: 820, y: 350 }, data: { ...baseData, label: 'Red Roof', type: 'output', params: { roofType: 'pitched' }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 'v-m1', type: 'buildingNode', position: { x: 1100, y: 200 }, data: { ...baseData, label: 'Merge', type: 'merge', params: {}, inputs: ['mesh', 'mesh'], outputs: ['mesh'] } },
    ],
    edges: [
      { id: 've1', source: 'v-f1', target: 'v-e1', sourceHandle: 'spline-0', targetHandle: 'spline-0' },
      { id: 've2', source: 'v-e1', target: 'v-sp', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 've3', source: 'v-sp', target: 'v-s1', sourceHandle: 'mesh-1', targetHandle: 'mesh-0' },
      { id: 've4', source: 'v-sp', target: 'v-o1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 've5', source: 'v-s1', target: 'v-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 've6', source: 'v-o1', target: 'v-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-1' },
    ]
  };

  const tower: { nodes: Node<NodeData>[]; edges: Edge[] } = {
    nodes: [
      { id: 't-f1', type: 'buildingNode', position: { x: 0, y: 200 }, data: { ...baseData, label: 'Circle Base', type: 'foundation', params: { width: 10, depth: 10, foundationShape: 'circle', hollow: 0.1 }, outputs: ['spline'] } },
      { id: 't-e1', type: 'buildingNode', position: { x: 280, y: 200 }, data: { ...baseData, label: 'Twist 30F', type: 'extrude', params: { floors: 30, twist: 180, taper: 0.5 }, inputs: ['spline'], outputs: ['mesh'] } },
      { id: 't-sp', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Split', type: 'split', params: {}, inputs: ['mesh'], outputs: ['mesh', 'mesh'] } },
      { id: 't-s1', type: 'buildingNode', position: { x: 820, y: 50 }, data: { ...baseData, label: 'Glass Fasad', type: 'scatter', params: { windowSpacing: 1.5 }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 't-o1', type: 'buildingNode', position: { x: 820, y: 350 }, data: { ...baseData, label: 'Dome Top', type: 'output', params: { roofType: 'dome' }, inputs: ['mesh'], outputs: ['mesh'] } },
      { id: 't-m1', type: 'buildingNode', position: { x: 1100, y: 200 }, data: { ...baseData, label: 'Merge', type: 'merge', params: {}, inputs: ['mesh', 'mesh'], outputs: ['mesh'] } },
    ],
    edges: [
      { id: 'te1', source: 't-f1', target: 't-e1', sourceHandle: 'spline-0', targetHandle: 'spline-0' },
      { id: 'te2', source: 't-e1', target: 't-sp', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'te3', source: 't-sp', target: 't-s1', sourceHandle: 'mesh-1', targetHandle: 'mesh-0' },
      { id: 'te4', source: 't-sp', target: 't-o1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'te5', source: 't-s1', target: 't-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-0' },
      { id: 'te6', source: 't-o1', target: 't-m1', sourceHandle: 'mesh-0', targetHandle: 'mesh-1' },
    ]
  };

  return { panelka, villa, tower };
};
