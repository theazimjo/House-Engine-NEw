import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
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
import { StatusBar } from './components/StatusBar';
import { useToast } from './components/Toast';
import type { NodeData, NodeType } from './types';
import { DEFAULT_PARAMS, NODE_PINS } from './types';
import { PIN_COLORS } from './constants/nodeStyles';
import { useUndoRedo } from './hooks/useUndoRedo';
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

// ── Edge Style by Pin Type ───────────────────────────────────────────────────
const getEdgeStyle = (sourceHandle: string | null | undefined) => {
  const pinType = sourceHandle || 'mesh';
  const color = PIN_COLORS[pinType as keyof typeof PIN_COLORS] || '#888';
  return {
    strokeWidth: 2.5,
    stroke: color,
  };
};

// ── Vertex Estimation ────────────────────────────────────────────────────────
const estimateVertices = (nodes: Node<NodeData>[]): number => {
  let total = 0;
  nodes.forEach(n => {
    switch (n.data.type) {
      case 'foundation': total += 8; break;
      case 'floors': total += (n.data.params.count || 5) * 200; break;
      case 'roof': total += 120; break;
      case 'columns': total += 64; break;
      case 'stairs': total += (n.data.params.count || 4) * 24; break;
      case 'plinth': total += 40; break;
      case 'primitive_box': total += 24; break;
      case 'primitive_cylinder': total += 128; break;
      case 'scatter_points': total += (n.data.params.count || 20) * 60; break;
      default: total += 10;
    }
  });
  return total;
};

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projectId = id || null;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const viewportRef = useRef<{ exportGLTF: () => void; exportOBJ: () => void } | null>(null);

  const [projectName, setProjectName] = useState('Untitled Project');

  // ── Undo/Redo ──────────────────────────────────────────────────────────────
  const undoRedo = useUndoRedo<{ nodes: Node<NodeData>[]; edges: Edge[] }>({ nodes: initialNodes, edges: initialEdges });
  const historyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushHistory = useCallback(() => {
    if (historyDebounce.current) clearTimeout(historyDebounce.current);
    historyDebounce.current = setTimeout(() => {
      undoRedo.setState({ nodes, edges });
    }, 300);
  }, [nodes, edges, undoRedo]);

  // Track changes for history
  useEffect(() => { pushHistory(); }, [nodes, edges, pushHistory]);

  // ── Auto-Save ──────────────────────────────────────────────────────────────
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      const projectData = { version: '1.0', nodes, edges };
      localStorage.setItem(`house_engine_project_${projectId}`, JSON.stringify(projectData));
      
      // Update index
      const saved = localStorage.getItem('house_engine_projects');
      const projects = saved ? JSON.parse(saved) : [];
      const existingIndex = projects.findIndex((p: any) => p.id === projectId);
      if (existingIndex >= 0) {
        projects[existingIndex].lastModified = Date.now();
        projects[existingIndex].name = projectName;
        localStorage.setItem('house_engine_projects', JSON.stringify(projects));
      }
      
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 2000);

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [nodes, edges, projectId, projectName]);

  // ── Cook Time Measurement ──────────────────────────────────────────────────
  const [cookTime, setCookTime] = useState(0);

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
      const savedIndex = localStorage.getItem('house_engine_projects');
      if (savedIndex) {
        try {
          const projects = JSON.parse(savedIndex);
          const p = projects.find((x: any) => x.id === projectId);
          if (p && p.name) setProjectName(p.name);
        } catch(e) {}
      }

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
      toast('Node deleted', 'info');
    };
    window.addEventListener('delete-node', handler);
    return () => window.removeEventListener('delete-node', handler);
  }, [setNodes, setEdges, toast]);

  // ── Connect ─────────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({
      ...params,
      style: getEdgeStyle(params.sourceHandle),
      animated: false,
    }, eds)),
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
    toast(`Added ${LABELS[type]}`, 'success');
  }, [setNodes, updateNodeParams, toast]);

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
      name: projectName,
      lastModified: Date.now()
    };
    
    if (existingIndex >= 0) {
      projects[existingIndex] = projMeta;
    } else {
      projects.push(projMeta);
    }
    
    localStorage.setItem('house_engine_projects', JSON.stringify(projects));
    
    toast('Project saved successfully', 'success');
  }, [nodes, edges, projectName, toast]);

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
            toast('Project loaded successfully', 'success');
          }
        } catch {
          toast('Invalid .hengine file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges, updateNodeParams, toast]);

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExportGLTF = useCallback(() => {
    viewportRef.current?.exportGLTF();
    toast('Exporting .GLB file...', 'info');
  }, [toast]);

  const handleExportOBJ = useCallback(() => {
    viewportRef.current?.exportOBJ();
    toast('Exporting .OBJ file...', 'info');
  }, [toast]);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      // Ctrl+Z — Undo
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = undoRedo.undo();
        if (prev) {
          setNodes(attachOnChange(prev.nodes));
          setEdges(prev.edges);
          toast('Undo', 'info', 1500);
        }
      }
      
      // Ctrl+Y or Ctrl+Shift+Z — Redo
      if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        const next = undoRedo.redo();
        if (next) {
          setNodes(attachOnChange(next.nodes));
          setEdges(next.edges);
          toast('Redo', 'info', 1500);
        }
      }
      
      // Ctrl+S — Save
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+D — Duplicate selected nodes
      if (isCtrl && e.key === 'd') {
        e.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          const newNodes = selectedNodes.map(n => ({
            ...n,
            id: `${n.data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            position: { x: n.position.x + 50, y: n.position.y + 50 },
            selected: false,
            data: { ...n.data, onChange: updateNodeParams },
          }));
          setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
          toast(`Duplicated ${selectedNodes.length} node(s)`, 'success');
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoRedo, attachOnChange, setNodes, setEdges, handleSave, nodes, updateNodeParams, toast]);

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

  // ── MiniMap Node Color ─────────────────────────────────────────────────────
  const minimapNodeColor = useCallback((node: Node) => {
    const nd = node.data as NodeData;
    const type = nd?.type;
    const colors: Record<string, string> = {
      foundation: '#c64321', floors: '#1d4ed8', roof: '#7f1d1d',
      columns: '#6d28d9', stairs: '#be185d', plinth: '#064e3b',
      offset_spline: '#0f766e', transform_spline: '#7e22ce',
      mirror_spline: '#0e7490', boolean_subtract: '#b91c1c',
      math_node: '#78350f', merge_mesh: '#1e3a5f',
      scatter_points: '#14532d', primitive_box: '#d97706',
      primitive_cylinder: '#ea580c',
    };
    return colors[type] || '#555';
  }, []);

  // ── Edge Defaults with Color ───────────────────────────────────────────────
  const styledEdges = useMemo(() => {
    return edges.map(e => ({
      ...e,
      style: getEdgeStyle(e.sourceHandle),
      animated: false,
    }));
  }, [edges]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const vertexEstimate = useMemo(() => estimateVertices(nodes), [nodes]);

  return (
    <div className="app-container overflow-hidden">
      <PanelGroup orientation="horizontal">
        {/* ── Node Editor ── */}
        <Panel defaultSize={60} minSize={20} id="editor" className="editor-pane relative">
          <Sidebar onAddNode={addNode} />

          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            defaultEdgeOptions={{
              style: { strokeWidth: 2.5, stroke: 'rgba(255,255,255,0.25)' },
              animated: false,
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Background color="#242428" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={minimapNodeColor}
              maskColor="rgba(0, 0, 0, 0.7)"
              style={{
                background: 'rgba(15, 15, 20, 0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              pannable
              zoomable
            />
          </ReactFlow>

          {/* Status Bar */}
          <StatusBar
            nodeCount={nodes.length}
            edgeCount={edges.length}
            vertexEstimate={vertexEstimate}
            cookTime={cookTime}
            canUndo={undoRedo.canUndo()}
            canRedo={undoRedo.canRedo()}
            autoSaveStatus={autoSaveStatus}
          />
        </Panel>

        {/* ── Resizer ── */}
        <PanelResizeHandle className="w-1.5 bg-[#111] hover:bg-[#ff4400] transition-colors cursor-col-resize z-50 flex items-center justify-center group shadow-[-5px_0_15px_rgba(0,0,0,0.5)]">
          <div className="h-16 w-0.5 bg-white/20 group-hover:bg-white rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* ── 3D Viewport ── */}
        <Panel defaultSize={40} minSize={20} id="viewport" className="preview-pane relative">
          <Viewport nodes={nodes} edges={edges} ref={viewportRef} />

          {/* Bottom Toolbar */}
          <div className="viewport-toolbar w-[90%] max-w-[700px]">
            <div className="glass-panel w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#c64321] text-xs font-bold text-white outline-none px-2 py-1 transition-all w-32 focus:w-48 placeholder:text-white/30"
                placeholder="Project Name"
                title="Rename Project"
              />
              <div className="toolbar-divider hidden sm:block" />
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
