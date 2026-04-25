import React from 'react';
import { motion } from 'framer-motion';
import type { NodeType } from '../types';
import { NODE_HEADER_COLORS } from '../constants/nodeStyles';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const nodeOptions: { type: NodeType; label: string }[] = [
    { type: 'split', label: 'Split Geometry' },
    { type: 'merge', label: 'Merge Mesh' },
    { type: 'transform', label: 'Transform' },
    { type: 'balcony', label: 'Balcony' },
    { type: 'column', label: 'Column' },
    { type: 'stairs', label: 'Stairs' },
  ];

  return (
    <div className="sidebar-overlay">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel" 
        style={{ padding: '15px', width: '220px' }}
      >
        <h1 className="gradient-text" style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: 800 }}>HOUSE ENGINE</h1>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', letterSpacing: '0.1em' }}>PROCEDURAL DESIGN</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Nodes Library</p>
          {nodeOptions.map((opt) => (
            <button 
              key={opt.type}
              onClick={() => onAddNode(opt.type)} 
              className="glass-card" 
              style={{ 
                padding: '10px', 
                color: '#fff', 
                fontSize: '0.7rem', 
                textAlign: 'left', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '10px', height: '10px', background: NODE_HEADER_COLORS[opt.type], borderRadius: '2px' }}></div>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
