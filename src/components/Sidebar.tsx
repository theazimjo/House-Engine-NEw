import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NodeType } from '../types';
import { NODE_HEADER_COLORS } from '../constants/nodeStyles';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

interface NodeCategory {
  label: string;
  icon: string;
  nodes: { type: NodeType; label: string; description: string }[];
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    label: 'GENERATORS',
    icon: '🏗️',
    nodes: [
      { type: 'foundation', label: 'Foundation', description: 'Building footprint shape' },
    ]
  },
  {
    label: 'STRUCTURE',
    icon: '🏢',
    nodes: [
      { type: 'floors',   label: 'Floors System',     description: 'Multi-floor walls & windows' },
      { type: 'roof',     label: 'Roof System',        description: 'Pitched, hip, flat & more' },
      { type: 'columns',  label: 'Column Generator',   description: 'Structural columns' },
      { type: 'stairs',   label: 'Stairs Generator',   description: 'Entry staircase' },
      { type: 'plinth',   label: 'Plinth Generator',   description: 'Base plinth slab' },
    ]
  },
  {
    label: 'MODIFIERS',
    icon: '⚙️',
    nodes: [
      { type: 'offset_spline',    label: 'Offset Spline',    description: 'Inset / outset a shape' },
      { type: 'transform_spline', label: 'Transform Spline', description: 'Move, scale, rotate shape' },
      { type: 'mirror_spline',    label: 'Mirror Spline',    description: 'Mirror shape on X or Z axis' },
    ]
  },
  {
    label: 'UTILITIES',
    icon: '🔧',
    nodes: [
      { type: 'math_node',      label: 'Math',          description: 'Add, multiply, divide floats' },
      { type: 'merge_mesh',     label: 'Merge Mesh',    description: 'Combine two mesh outputs' },
      { type: 'scatter_points', label: 'Scatter Points', description: 'Place objects on a spline area' },
    ]
  },
];


export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="sidebar-overlay">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel" 
        style={{ padding: '15px', width: '230px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '1.1rem', marginBottom: '2px', fontWeight: 800, letterSpacing: '0.08em' }}>HOUSE ENGINE</h1>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: '18px', letterSpacing: '0.15em' }}>PROCEDURAL ARCHITECTURE</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NODE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <button
                onClick={() => toggleCategory(cat.label)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 4px',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {collapsed[cat.label]
                  ? <ChevronRight size={10} />
                  : <ChevronDown size={10} />}
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>

              <AnimatePresence initial={false}>
                {!collapsed[cat.label] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '6px' }}
                  >
                    {cat.nodes.map((opt) => (
                      <motion.button
                        key={opt.type}
                        whileHover={{ x: 3, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onAddNode(opt.type)}
                        className="glass-card"
                        style={{
                          padding: '8px 10px',
                          color: '#fff',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          border: 'none',
                          width: '100%',
                        }}
                      >
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: NODE_HEADER_COLORS[opt.type] || '#555',
                          borderRadius: '2px',
                          flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{opt.label}</div>
                          <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{opt.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
            💡 Drag nodes to canvas<br />
            🔗 Connect pins by type<br />
            🗑️ Press Del to remove
          </p>
        </div>
      </motion.div>
    </div>
  );
};
