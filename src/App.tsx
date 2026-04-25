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
import type { NodeData, NodeType } from './types';
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
    
    let inputs: PinType[] = ['mesh'];
    let outputs: PinType[] = ['mesh'];
    let params: any = {};

    switch (type) {
      case 'foundation':
        inputs = [];
        outputs = ['spline'];
        params = { width: 10, depth: 8, foundationShape: 'rectangle' };
        break;
      case 'extrude':
        inputs = ['spline'];
        outputs = ['mesh'];
        params = { floors: 3, floorHeight: 3.2 };
        break;
      case 'split':
        inputs = ['mesh'];
        outputs = ['mesh', 'mesh']; // Top, Sides
        break;
      case 'merge':
        inputs = ['mesh', 'mesh'];
        outputs = ['mesh'];
        break;
      case 'scatter':
        params = { windowSpacing: 3, windowHeight: 1.6, wallThickness: 0.3 };
        break;
      case 'output':
        outputs = [];
        params = { roofType: 'pitched' };
        break;
      case 'transform':
        params = { x: 0, y: 0, z: 0 };
        break;
      case 'balcony':
        params = { balconyDepth: 1.5 };
        break;
      case 'column':
        params = { columnRadius: 0.2, columnSpacing: 3 };
        break;
    }

    const newNode: Node<NodeData> = {
      id,
      type: 'buildingNode',
      position: { x: 100, y: 100 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
        type,
        params,
        onChange: updateNodeParams,
        inputs,
        outputs,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const applyPreset = (name: 'panelka' | 'villa' | 'tower') => {
    let newNodes: Node<NodeData>[] = [];
    let newEdges: Edge[] = [];

    const baseData = { onChange: updateNodeParams };

    if (name === 'panelka') {
      newNodes = [
        { id: 'f1', type: 'buildingNode', position: { x: 50, y: 200 }, data: { ...baseData, label: 'Foundation', type: 'foundation', params: { width: 14, depth: 10, foundationShape: 'rectangle' }, outputs: ['spline'] } },
        { id: 'e1', type: 'buildingNode', position: { x: 300, y: 200 }, data: { ...baseData, label: 'Floor Generator', type: 'extrude', params: { floors: 9, floorHeight: 3 }, inputs: ['spline'], outputs: ['mesh'] } },
        { id: 's1', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Facade Pattern', type: 'scatter', params: { windowSpacing: 2.5, windowHeight: 1.4, wallThickness: 0.3 }, inputs: ['mesh'], outputs: ['mesh'] } },
        { id: 'o1', type: 'buildingNode', position: { x: 800, y: 200 }, data: { ...baseData, label: 'Roof System', type: 'output', params: { roofType: 'flat' }, inputs: ['mesh'], outputs: [] } },
      ];
      newEdges = [
        { id: 'e1-2', source: 'f1', target: 'e1', sourceHandle: 'spline', targetHandle: 'spline' },
        { id: 'e2-3', source: 'e1', target: 's1', sourceHandle: 'mesh', targetHandle: 'mesh' },
        { id: 'e3-4', source: 's1', target: 'o1', sourceHandle: 'mesh', targetHandle: 'mesh' },
      ];
    } else if (name === 'villa') {
       newNodes = [
        { id: 'f1', type: 'buildingNode', position: { x: 50, y: 200 }, data: { ...baseData, label: 'L-Foundation', type: 'foundation', params: { width: 14, depth: 12, foundationShape: 'L-shape' }, outputs: ['spline'] } },
        { id: 'e1', type: 'buildingNode', position: { x: 300, y: 200 }, data: { ...baseData, label: '2 Floors', type: 'extrude', params: { floors: 2, floorHeight: 3.2 }, inputs: ['spline'], outputs: ['mesh'] } },
        { id: 's1', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Facade', type: 'scatter', params: { windowSpacing: 3, windowHeight: 1.8, wallThickness: 0.3 }, inputs: ['mesh'], outputs: ['mesh'] } },
        { id: 'o1', type: 'buildingNode', position: { x: 800, y: 200 }, data: { ...baseData, label: 'Red Roof', type: 'output', params: { roofType: 'pitched' }, inputs: ['mesh'], outputs: [] } },
      ];
      newEdges = [
        { id: 'e1-2', source: 'f1', target: 'e1', sourceHandle: 'spline', targetHandle: 'spline' },
        { id: 'e2-3', source: 'e1', target: 's1', sourceHandle: 'mesh', targetHandle: 'mesh' },
        { id: 'e3-4', source: 's1', target: 'o1', sourceHandle: 'mesh', targetHandle: 'mesh' },
      ];
    }
 else if (name === 'tower') {
      newNodes = [
        { id: 'f1', type: 'buildingNode', position: { x: 50, y: 200 }, data: { ...baseData, label: 'Foundation', type: 'foundation', params: { width: 8, depth: 8, foundationShape: 'rectangle' }, outputs: ['spline'] } },
        { id: 'e1', type: 'buildingNode', position: { x: 300, y: 200 }, data: { ...baseData, label: 'Floor Generator', type: 'extrude', params: { floors: 25, floorHeight: 3.2 }, inputs: ['spline'], outputs: ['mesh'] } },
        { id: 's1', type: 'buildingNode', position: { x: 550, y: 200 }, data: { ...baseData, label: 'Facade Pattern', type: 'scatter', params: { windowSpacing: 1.5, windowHeight: 2.2, wallThickness: 0.5 }, inputs: ['mesh'], outputs: ['mesh'] } },
        { id: 'o1', type: 'buildingNode', position: { x: 800, y: 200 }, data: { ...baseData, label: 'Roof System', type: 'output', params: { roofType: 'dome' }, inputs: ['mesh'], outputs: [] } },
      ];
      newEdges = [
        { id: 'e1-2', source: 'f1', target: 'e1', sourceHandle: 'spline', targetHandle: 'spline' },
        { id: 'e2-3', source: 'e1', target: 's1', sourceHandle: 'mesh', targetHandle: 'mesh' },
        { id: 'e3-4', source: 's1', target: 'o1', sourceHandle: 'mesh', targetHandle: 'mesh' },
      ];
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const isValidConnection = (connection: Connection) => {
    return connection.sourceHandle === connection.targetHandle;
  };

  return (
    <div className="app-container">
      <div className="editor-pane">
        <Sidebar onAddNode={addNode} onApplyPreset={applyPreset} />

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
