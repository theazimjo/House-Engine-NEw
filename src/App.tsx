import { useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';

import { CustomNode } from './components/CustomNode';
import { Viewport } from './Viewport';
import { Sidebar } from './components/Sidebar';
import type { NodeData, NodeType } from './types';
import { Play, Download } from 'lucide-react';

const nodeTypes = {
  buildingNode: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: 'foundation-1',
    type: 'buildingNode',
    data: {
      label: 'Foundation',
      type: 'foundation',
      params: { width: 12, depth: 10, foundationShape: 'rectangle' },
      onChange: () => { },
      outputs: ['spline']
    },
    position: { x: 50, y: 200 },
  },
  {
    id: 'extrude-1',
    type: 'buildingNode',
    data: {
      label: 'Extrude',
      type: 'extrude',
      params: { floors: 4, floorHeight: 3.2 },
      onChange: () => { },
      inputs: ['spline'],
      outputs: ['mesh']
    },
    position: { x: 300, y: 200 },
  },
  {
    id: 'split-1',
    type: 'buildingNode',
    data: {
      label: 'Split Geometry',
      type: 'split',
      params: {},
      onChange: () => { },
      inputs: ['mesh'],
      outputs: ['mesh', 'mesh']
    },
    position: { x: 550, y: 200 },
  },
  {
    id: 'facade-1',
    type: 'buildingNode',
    data: {
      label: 'Facade Pattern',
      type: 'scatter',
      params: { windowSpacing: 3, windowHeight: 1.6, wallThickness: 0.3 },
      onChange: () => { },
      inputs: ['mesh'],
      outputs: ['mesh']
    },
    position: { x: 800, y: 100 },
  },
  {
    id: 'roof-1',
    type: 'buildingNode',
    data: {
      label: 'Roof System',
      type: 'output',
      params: { roofType: 'pitched' },
      onChange: () => { },
      inputs: ['mesh'],
      outputs: ['mesh']
    },
    position: { x: 800, y: 350 },
  },
  {
    id: 'merge-1',
    type: 'buildingNode',
    data: {
      label: 'Merge Mesh',
      type: 'merge',
      params: {},
      onChange: () => { },
      inputs: ['mesh', 'mesh'],
      outputs: ['mesh']
    },
    position: { x: 1100, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'foundation-1', target: 'extrude-1', sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e2-3', source: 'extrude-1', target: 'split-1', sourceHandle: 'mesh', targetHandle: 'mesh' },
  { id: 'e3-4', source: 'split-1', target: 'facade-1', sourceHandle: 'mesh', targetHandle: 'mesh' },
  { id: 'e3-5', source: 'split-1', target: 'roof-1', sourceHandle: 'mesh', targetHandle: 'mesh' },
  { id: 'e4-6', source: 'facade-1', target: 'merge-1', sourceHandle: 'mesh', targetHandle: 'mesh' },
  { id: 'e5-6', source: 'roof-1', target: 'merge-1', sourceHandle: 'mesh', targetHandle: 'mesh' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const updateNodeParams = useCallback((nodeId: string, params: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, params } };
        }
        return node;
      })
    );
  }, [setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: updateNodeParams,
        },
      }))
    );
  }, [updateNodeParams, setNodes]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (type: NodeType) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node<NodeData> = {
      id,
      type: 'buildingNode',
      position: { x: 100, y: 100 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
        type,
        params:
          type === 'scatter' ? { windowSpacing: 3, windowHeight: 1.6, wallThickness: 0.3 } :
            type === 'output' ? { roofType: 'pitched' } :
              type === 'foundation' ? { width: 10, depth: 8, foundationShape: 'rectangle' } :
                type === 'extrude' ? { floors: 3, floorHeight: 3.2 } :
                  {},
        onChange: updateNodeParams,
        inputs: type === 'foundation' ? [] : [type === 'extrude' ? 'spline' : 'mesh'],
        outputs: type === 'output' ? [] : [type === 'foundation' ? 'spline' : 'mesh'],
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const isValidConnection = (connection: Connection) => {
    return connection.sourceHandle === connection.targetHandle;
  };

  return (
    <div className="app-container">
      <div className="editor-pane">
        <Sidebar onAddNode={addNode} />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          isValidConnection={isValidConnection}
          fitView
        >
          <Background color="#1a1a20" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      <div className="preview-pane" style={{ width: '600px' }}>
        <Viewport nodes={nodes} edges={edges} />

        <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
          <div className="glass-panel" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="glass-card" style={{ padding: '8px 15px', border: 'none', color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={14} /> COOK GRAPH
            </button>
            <button className="glass-card" style={{ padding: '8px 15px', border: 'none', color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} /> EXPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
