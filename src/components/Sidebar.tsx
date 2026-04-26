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
      { type: 'primitive_box', label: 'Primitive Box', description: 'Simple 3D box mesh' },
      { type: 'primitive_cylinder', label: 'Primitive Cylinder', description: 'Simple 3D cylinder mesh' },
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
      { type: 'boolean_subtract', label: 'Boolean Subtract', description: 'Subtract Mesh B from Mesh A' },
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
    <div className="absolute top-4 left-4 z-10 w-64">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <h1 className="text-lg font-black tracking-widest text-white mb-0.5">HOUSE/ENGINE</h1>
        <p className="text-[9px] text-white/40 tracking-[0.25em] mb-6 uppercase font-bold">Node Library</p>
        
        <div className="flex flex-col gap-2">
          {NODE_CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex flex-col">
              <button
                onClick={() => toggleCategory(cat.label)}
                className="flex items-center gap-2 py-2 px-1 text-[10px] font-bold text-white/40 tracking-[0.15em] uppercase hover:text-white transition-colors"
              >
                {collapsed[cat.label]
                  ? <ChevronRight size={12} className="opacity-70" />
                  : <ChevronDown size={12} className="opacity-70" />}
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>

              <AnimatePresence initial={false}>
                {!collapsed[cat.label] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-1.5 overflow-hidden pb-3"
                  >
                    {cat.nodes.map((opt) => (
                      <motion.button
                        key={opt.type}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAddNode(opt.type)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg p-2.5 flex items-center gap-3 text-left w-full transition-colors group"
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm"
                          style={{ background: NODE_HEADER_COLORS[opt.type] || '#555' }} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white/90 truncate group-hover:text-white transition-colors">{opt.label}</div>
                          <div className="text-[9px] text-white/40 mt-0.5 truncate">{opt.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 leading-relaxed font-medium">
            <span className="inline-block w-4">💡</span> Drag nodes to canvas<br />
            <span className="inline-block w-4">🔗</span> Connect pins by type<br />
            <span className="inline-block w-4">🗑️</span> Press Del to remove
          </p>
        </div>
      </motion.div>
    </div>
  );
};
