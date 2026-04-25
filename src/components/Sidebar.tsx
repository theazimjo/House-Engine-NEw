import React from 'react';
import { motion } from 'framer-motion';
import type { NodeType } from '../types';
import { NODE_HEADER_COLORS } from '../constants/nodeStyles';

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onApplyPreset: (name: 'panelka' | 'villa' | 'tower') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode, onApplyPreset }) => {
  const presets = [
    { name: 'panelka' as const, label: 'Panelka (Standard)', icon: '🏢' },
    { name: 'villa' as const, label: 'Modern Villa', icon: '🏡' },
    { name: 'tower' as const, label: 'Skyscraper', icon: '🏙️' },
  ];
  const nodeOptions: { type: NodeType; label: string }[] = [
    { type: 'foundation', label: 'Foundation' },
    { type: 'extrude', label: 'Floor Generator' },
    { type: 'split', label: 'Split Geometry' },
    { type: 'scatter', label: 'Facade Pattern' },
    { type: 'output', label: 'Roof System' },
    { type: 'merge', label: 'Merge Mesh' },
    { type: 'transform', label: 'Transform' },
    { type: 'balcony', label: 'Balcony' },
    { type: 'column', label: 'Column' },
    { type: 'window', label: 'Window System' },
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Building Presets</p>
          {presets.map((p) => (
            <button 
              key={p.name}
              onClick={() => onApplyPreset(p.name)} 
              className="glass-card" 
              style={{ 
                padding: '12px', 
                color: '#fff', 
                fontSize: '0.75rem', 
                textAlign: 'left', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
              <span style={{ fontWeight: 600 }}>{p.label}</span>
            </button>
          ))}
        </div>

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
