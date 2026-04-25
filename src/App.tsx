import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  Panel,
  type Node,
  type Edge,
  type Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';

import { CustomNode } from './CustomNode';
import { Viewport } from './Viewport';
import type { BuildingParams, NodeData } from './types';
import { Box, Play, Download, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const nodeTypes = {
  buildingNode: CustomNode,
};

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'buildingNode',
    data: { 
      label: 'Foundation', 
      type: 'foundation', 
      params: { width: 8, depth: 6, foundationShape: 'rectangle' },
      onChange: () => {} 
    },
    position: { x: 50, y: 150 },
  },
  {
    id: '2',
    type: 'buildingNode',
    data: { 
      label: 'Floor Generator', 
      type: 'extrude', 
      params: { floors: 3, floorHeight: 3.2 },
      onChange: () => {} 
    },
    position: { x: 320, y: 150 },
  },
  {
    id: '3',
    type: 'buildingNode',
    data: { 
      label: 'Facade Pattern', 
      type: 'scatter', 
      params: { windowSpacing: 2.5, sillHeight: 0.9, windowHeight: 1.5, wallThickness: 0.25 },
      onChange: () => {} 
    },
    position: { x: 590, y: 150 },
  },
  {
    id: '5',
    type: 'buildingNode',
    data: { 
      label: 'Roof System', 
      type: 'output', 
      params: { roofType: 'pitched' },
      onChange: () => {} 
    },
    position: { x: 860, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [buildingParams, setBuildingParams] = useState<BuildingParams>({
    width: 8,
    depth: 6,
    floors: 3,
    floorHeight: 3.2,
    wallThickness: 0.25,
    windowSpacing: 2.5,
    windowSize: [1.2, 1.5],
    windowHeight: 1.5,
    sillHeight: 0.9,
    roofType: 'pitched',
    foundationShape: 'rectangle',
  });

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const updateNodeParams = useCallback((id: string, newParams: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              params: newParams,
            },
          };
        }
        return node;
      })
    );

    // Update global building params based on node change
    setBuildingParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, [setNodes]);

  // Inject the onChange handler into nodes
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

  return (
    <div className="app-container">
      <div className="editor-pane">
        <div className="sidebar-overlay">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel" 
            style={{ padding: '15px' }}
          >
            <h1 className="gradient-text" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>House Engine</h1>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Procedural Architecture Generator</p>
          </motion.div>
          
          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="glass-card" style={{ padding: '8px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Box size={18} />
              </button>
              <button className="glass-card" style={{ padding: '8px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#1a1a20" gap={20} />
          <Controls />
          <Panel position="bottom-center">
            <div className="glass-panel toolbar">
              <button className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Play size={16} className="text-green-400" />
                <span>Generate</span>
              </button>
              <button className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Download size={16} />
                <span>Export OBJ</span>
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <div className="preview-pane" style={{ width: '600px' }}>
        <Viewport params={buildingParams} />
        
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
          <div className="glass-panel" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Live Renderer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
