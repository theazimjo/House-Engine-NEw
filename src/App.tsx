import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
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
import type { NodeData, NodeType, PinType } from './types';
import { Play, Download } from 'lucide-react';



const initialNodes: Node<NodeData>[] = [
  {
    id: 'f-1',
    type: 'buildingNode',
    position: { x: 50, y: 200 },
    data: {
      label: 'Foundation',
      type: 'foundation',
      params: { width: 14, depth: 10, foundationShape: 'rectangle', twistBase: 0, twistMid: 0, twistTop: 0, taper: 1, shearX: 0, shearY: 0, jitter: 0 },
      onChange: () => {},
      inputs: [],
      outputs: ['spline']
    }
  },
  {
    id: 'fl-1',
    type: 'buildingNode',
    position: { x: 400, y: 350 },
    data: {
      label: 'Floors System',
      type: 'floors',
      params: { count: 5, height: 3.2, winWidth: 1.2, winHeight: 1.8, winSpacing: 2.5, doorWidth: 1.8, doorHeight: 2.4, doorOffset: 0, doorSide: 'front', showWindow: true },
      onChange: () => {},
      inputs: ['spline'],
      outputs: ['mesh', 'window', 'float']
    }
  },
  {
    id: 'r-1',
    type: 'buildingNode',
    position: { x: 400, y: 50 },
    data: {
      label: 'Roof System',
      type: 'roof',
      params: { roofType: 'pitched', height: 3, overhang: 0.5, color: '#8e2b2b' },
      onChange: () => {},
      inputs: ['spline', 'float'],
      outputs: ['mesh']
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'f-1', target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e2', source: 'f-1', target: 'r-1', sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e3', source: 'fl-1', target: 'r-1', sourceHandle: 'float', targetHandle: 'float' }
];

export default function App() {
  const nodeTypes = useMemo(() => ({
    buildingNode: CustomNode,
  }), []);
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
    const handleDeleteNode = (e: any) => {
      const nodeId = e.detail;
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    };

    window.addEventListener('delete-node', handleDeleteNode);
    return () => window.removeEventListener('delete-node', handleDeleteNode);
  }, [setNodes, setEdges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.data.type === 'foundation') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: updateNodeParams,
              inputs: [],
              outputs: ['spline'] // Foundation outputs shape
            },
          };
        } else if (node.data.type === 'floors') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: updateNodeParams,
              inputs: ['spline'],
              outputs: ['mesh', 'window', 'float'], // Added 'float' for height
              params: {
                winWidth: 1.2,
                winHeight: 1.8,
                winSpacing: 2.5,
                doorWidth: 1.8,
                doorHeight: 2.4,
                doorOffset: 0,
                doorSide: 'front',
                ...node.data.params,
              }
            },
          };
        } else if (node.data.type === 'roof') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: updateNodeParams,
              inputs: ['spline'],
              outputs: ['mesh'],
              params: {
                roofType: 'pitched',
                height: 3,
                overhang: 0.5,
                color: '#8e2b2b',
                ...node.data.params
              }
            }
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            onChange: updateNodeParams,
          },
        };
      })
    );
  }, [updateNodeParams, setNodes]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (type: NodeType) => {
    const id = `${type}-${Date.now()}`;
    
    let inputs: PinType[] = [];
    let outputs: PinType[] = [];
    let params: any = {};
    let label = '';

    if (type === 'foundation') {
      inputs = [];
      outputs = ['spline'];
      params = { 
        width: 14, depth: 10,
        foundationShape: 'rectangle',
        twistBase: 0, twistMid: 0, twistTop: 0,
        taper: 1, shearX: 0, shearY: 0, jitter: 0
      };
      label = 'Foundation';
    } else if (type === 'floors') {
      inputs = ['spline'];
      outputs = ['mesh', 'window', 'float'];
      params = { 
        count: 5, 
        height: 3.2, 
        winWidth: 1.2, 
        winHeight: 1.8, 
        winSpacing: 2.5,
        doorWidth: 1.8,
        doorHeight: 2.4,
        doorOffset: 0,
        doorSide: 'front',
        showWindow: true 
      };
      label = 'Floors System';
    } else if (type === 'roof') {
      inputs = ['spline', 'float'];
      outputs = ['mesh'];
      params = { 
        roofType: 'pitched', 
        height: 3, 
        overhang: 0.5, 
        color: '#8e2b2b' 
      };
      label = 'Roof System';
    }

    const newNode: Node<NodeData> = {
      id,
      type: 'buildingNode',
      position: { x: 100, y: 100 },
      data: {
        label,
        type,
        params,
        onChange: updateNodeParams,
        inputs,
        outputs,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const isValidConnection = (connection: Connection) => {
    return connection.source !== connection.target;
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
