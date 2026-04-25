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



const initialNodes: Node<NodeData>[] = [];
const initialEdges: Edge[] = [];

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
              inputs: [], // Foundation should have no inputs
              outputs: ['spline', 'mesh', 'window']
            },
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
      outputs = ['spline', 'mesh', 'window'];
      params = { 
        width: 14, depth: 10, floors: 5, floorHeight: 3.2,
        foundationShape: 'rectangle',
        twistBase: 0, twistMid: 0, twistTop: 0,
        taper: 1, shearX: 0, shearY: 0, jitter: 0
      };
      label = 'Foundation';
    } else if (type === 'floors') {
      inputs = [];
      outputs = ['floors'];
      params = { count: 10, height: 3.5, showWindow: true };
      label = 'Floors System';
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
