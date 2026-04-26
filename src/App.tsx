import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './index.css';

import { CustomNode } from './components/CustomNode';
import { Viewport } from './Viewport';
import { Sidebar } from './components/Sidebar';
import type { NodeData, NodeType } from './types';
import { DEFAULT_PARAMS, NODE_PINS } from './types';
import { Play, Download, Save, FolderOpen, ArrowLeft } from 'lucide-react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

// ── Initial Graph ────────────────────────────────────────────────────────────
const makeNodeData = (type: NodeType, label: string): Omit<NodeData, 'onChange'> => ({
  label,
  type,
  params: { ...DEFAULT_PARAMS[type] },
  inputs: NODE_PINS[type].inputs,
  outputs: NODE_PINS[type].outputs,
});

const initialNodes: Node<NodeData>[] = [
  {
    id: 'f-1',
    type: 'buildingNode',
    position: { x: 50, y: 280 },
    data: { ...makeNodeData('foundation', 'Foundation'), onChange: () => {} },
  },
  {
    id: 'fl-1',
    type: 'buildingNode',
    position: { x: 380, y: 350 },
    data: { ...makeNodeData('floors', 'Floors System'), onChange: () => {} },
  },
  {
    id: 'r-1',
    type: 'buildingNode',
    position: { x: 380, y: 50 },
    data: { ...makeNodeData('roof', 'Roof System'), onChange: () => {} },
  },
  {
    id: 'off-1',
    type: 'buildingNode',
    position: { x: 380, y: -200 },
    data: { ...makeNodeData('offset_spline', 'Offset Spline'), onChange: () => {} },
  },
  {
    id: 'pl-1',
    type: 'buildingNode',
    position: { x: 380, y: 750 },
    data: { ...makeNodeData('plinth', 'Plinth Generator'), onChange: () => {} },
  },
  {
    id: 'st-1',
    type: 'buildingNode',
    position: { x: 700, y: 550 },
    data: { ...makeNodeData('stairs', 'Stairs Generator'), onChange: () => {} },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'f-1',  target: 'fl-1', sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e2', source: 'f-1',  target: 'r-1',  sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e3', source: 'fl-1', target: 'r-1',  sourceHandle: 'float',  targetHandle: 'float'  },
  { id: 'e4', source: 'f-1',  target: 'st-1', sourceHandle: 'spline', targetHandle: 'spline' },
  { id: 'e5', source: 'f-1',  target: 'pl-1', sourceHandle: 'spline', targetHandle: 'spline' },
];

import { useParams, useNavigate } from 'react-router-dom';

const nodeTypes = { buildingNode: CustomNode };

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id || null;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const viewportRef = useRef<{ exportGLTF: () => void; exportOBJ: () => void } | null>(null);

  // ── Param Update ────────────────────────────────────────────────────────────
  const updateNodeParams = useCallback((nodeId: string, params: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, params } } : node
      )
    );
  }, [setNodes]);

  // ── Attach onChange to all nodes on mount / update ─────────────────────────
  const attachOnChange = useCallback((nds: Node<NodeData>[]) => {
    return nds.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: updateNodeParams,
        inputs:  NODE_PINS[node.data.type]?.inputs  ?? node.data.inputs,
        outputs: NODE_PINS[node.data.type]?.outputs ?? node.data.outputs,
      },
    }));
  }, [updateNodeParams]);

  useEffect(() => {
    // If we have a projectId, load it
    if (projectId) {
      const saved = localStorage.getItem(`house_engine_project_${projectId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.nodes && parsed.edges) {
            setNodes(attachOnChange(parsed.nodes));
            setEdges(parsed.edges);
          }
        } catch (e) {
          console.error('Failed to load project from local storage');
        }
      }
    } else {
      // New project, use default nodes but attach onChange
      setNodes(attachOnChange(initialNodes));
      setEdges(initialEdges);
    }
  }, [projectId, attachOnChange, setNodes, setEdges]);

  // ── Delete Node ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const nodeId = (e as CustomEvent).detail;
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((ed) => ed.source !== nodeId && ed.target !== nodeId));
    };
    window.addEventListener('delete-node', handler);
    return () => window.removeEventListener('delete-node', handler);
  }, [setNodes, setEdges]);

  // ── Connect ─────────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // ── Add Node ────────────────────────────────────────────────────────────────
  const addNode = useCallback((type: NodeType) => {
    const LABELS: Record<NodeType, string> = {
      foundation:       'Foundation',
      primitive_box:    'Primitive Box',
      primitive_cylinder: 'Primitive Cylinder',
      floors:           'Floors System',
      roof:             'Roof System',
      columns:          'Column Generator',
      stairs:           'Stairs Generator',
      plinth:           'Plinth Generator',
      offset_spline:    'Offset Spline',
      transform_spline: 'Transform Spline',
      mirror_spline:    'Mirror Spline',
      boolean_subtract: 'Boolean Subtract',
      math_node:        'Math',
      merge_mesh:       'Merge Mesh',
      scatter_points:   'Scatter Points',
    };
    const id = `${type}-${Date.now()}`;
    const newNode: Node<NodeData> = {
      id,
      type: 'buildingNode',
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        label:   LABELS[type],
        type,
        params:  { ...DEFAULT_PARAMS[type] },
        inputs:  NODE_PINS[type].inputs,
        outputs: NODE_PINS[type].outputs,
        onChange: updateNodeParams,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, updateNodeParams]);

  // ── Save / Load ─────────────────────────────────────────────────────────────
  const currentProjectId = useRef(projectId || `proj_${Date.now()}`);

  const handleSave = useCallback(() => {
    // 1. Save to local storage
    const projectData = { version: '1.0', nodes, edges };
    localStorage.setItem(`house_engine_project_${currentProjectId.current}`, JSON.stringify(projectData));
    
    // 2. Update projects index
    const saved = localStorage.getItem('house_engine_projects');
    const projects = saved ? JSON.parse(saved) : [];
    const existingIndex = projects.findIndex((p: any) => p.id === currentProjectId.current);
    
    const projMeta = {
      id: currentProjectId.current,
      name: existingIndex >= 0 ? projects[existingIndex].name : `Project ${projects.length + 1}`,
      lastModified: Date.now()
    };
    
    if (existingIndex >= 0) {
      projects[existingIndex] = projMeta;
    } else {
      projects.push(projMeta);
    }
    
    localStorage.setItem('house_engine_projects', JSON.stringify(projects));
    
    // 3. Keep old behavior of downloading file just in case
    const data = JSON.stringify(projectData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projMeta.name.replace(/ /g, '_')}.hengine`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.hengine,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (parsed.nodes && parsed.edges) {
            // Re-attach onChange
            const rehydrated = parsed.nodes.map((n: Node<NodeData>) => ({
              ...n,
              data: {
                ...n.data,
                onChange: updateNodeParams,
                inputs:  NODE_PINS[n.data.type]?.inputs  ?? n.data.inputs,
                outputs: NODE_PINS[n.data.type]?.outputs ?? n.data.outputs,
              },
            }));
            setNodes(rehydrated);
            setEdges(parsed.edges);
          }
        } catch {
          alert('Invalid .hengine file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, updateNodeParams]);

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExportGLTF = useCallback(() => {
    viewportRef.current?.exportGLTF();
  }, []);

  const handleExportOBJ = useCallback(() => {
    viewportRef.current?.exportOBJ();
  }, []);

  // ── Connection Validation ───────────────────────────────────────────────────
  const isValidConnection = useCallback((connection: Connection) => {
    if (connection.source === connection.target) return false;
    // Check pin type compatibility
    const srcNode = nodes.find((n) => n.id === connection.source);
    const tgtNode = nodes.find((n) => n.id === connection.target);
    if (!srcNode || !tgtNode) return false;
    const srcHandle = connection.sourceHandle as string;
    const tgtHandle = connection.targetHandle as string;
    // Types must match
    return srcHandle === tgtHandle;
  }, [nodes]);

  return (
    <div className="app-container overflow-hidden">
      <PanelGroup direction="horizontal">
        {/* ── Node Editor ── */}
        <Panel defaultSize={60} minSize={25} className="editor-pane relative">
          <Sidebar onAddNode={addNode} />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            defaultEdgeOptions={{
              style: { strokeWidth: 2.5, stroke: 'rgba(255,255,255,0.25)' },
              animated: true,
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Background color="#242428" gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </Panel>

        {/* ── Resizer ── */}
        <PanelResizeHandle className="w-1.5 bg-[#111] hover:bg-[#ff4400] transition-colors cursor-col-resize z-50 flex items-center justify-center group shadow-[-5px_0_15px_rgba(0,0,0,0.5)]">
          <div className="h-16 w-0.5 bg-white/20 group-hover:bg-white rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* ── 3D Viewport ── */}
        <Panel defaultSize={40} minSize={25} className="preview-pane relative">
          <Viewport nodes={nodes} edges={edges} ref={viewportRef} />

          {/* Bottom Toolbar */}
          <div className="viewport-toolbar w-[90%] max-w-[650px]">
            <div className="glass-panel w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="toolbar-btn"
                title="Back to Hub"
                onClick={() => navigate('/hub')}
              >
                <ArrowLeft size={13} /> HUB
              </button>
              <div className="toolbar-divider hidden sm:block" />
              <button
                id="btn-cook-graph"
                className="toolbar-btn toolbar-btn--primary"
                title="Cook Graph"
                onClick={() => {/* auto-cook is already reactive */}}
              >
                <Play size={13} /> COOK
              </button>
              <div className="toolbar-divider hidden sm:block" />
              <button
                id="btn-export-gltf"
                className="toolbar-btn"
                title="Export GLTF"
                onClick={handleExportGLTF}
              >
                <Download size={13} /> EXPORT .GLB
              </button>
              <button
                id="btn-export-obj"
                className="toolbar-btn"
                title="Export OBJ"
                onClick={handleExportOBJ}
              >
                <Download size={13} /> EXPORT .OBJ
              </button>
              <button
                id="btn-save-project"
                className="toolbar-btn"
                title="Save Project"
                onClick={handleSave}
              >
                <Save size={13} /> SAVE
              </button>
              <button
                id="btn-load-project"
                className="toolbar-btn"
                title="Load Project"
                onClick={handleLoad}
              >
                <FolderOpen size={13} /> LOAD
              </button>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
