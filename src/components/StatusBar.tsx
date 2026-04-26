import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, GitBranch, Box, Clock, Cpu } from 'lucide-react';

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  vertexEstimate: number;
  cookTime: number;
  canUndo: boolean;
  canRedo: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  nodeCount, edgeCount, vertexEstimate, cookTime, canUndo, canRedo, autoSaveStatus
}) => {
  const formatVertices = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return `${v}`;
  };

  return (
    <div className="status-bar">
      <div className="status-bar-group">
        <div className="status-item" title="Node count">
          <Layers size={11} />
          <span>{nodeCount} nodes</span>
        </div>
        <div className="status-divider" />
        <div className="status-item" title="Edge count">
          <GitBranch size={11} />
          <span>{edgeCount} edges</span>
        </div>
        <div className="status-divider" />
        <div className="status-item" title="Estimated vertex count">
          <Box size={11} />
          <span>~{formatVertices(vertexEstimate)} verts</span>
        </div>
        <div className="status-divider" />
        <div className="status-item" title="Cook time">
          <Clock size={11} />
          <span>{cookTime.toFixed(1)}ms</span>
        </div>
      </div>

      <div className="status-bar-group">
        {/* Undo/Redo indicator */}
        <div className="status-item" style={{ opacity: canUndo || canRedo ? 0.7 : 0.3 }}>
          <Cpu size={11} />
          <span>
            {canUndo ? 'Ctrl+Z' : ''}
            {canUndo && canRedo ? ' / ' : ''}
            {canRedo ? 'Ctrl+Y' : ''}
            {!canUndo && !canRedo ? 'No history' : ''}
          </span>
        </div>
        <div className="status-divider" />
        {/* Auto-save status */}
        <div className="status-item">
          <div
            className="status-dot"
            style={{
              background: autoSaveStatus === 'saved' ? '#4ade80' :
                          autoSaveStatus === 'saving' ? '#f59e0b' : '#555',
            }}
          />
          <span>
            {autoSaveStatus === 'saving' ? 'Saving...' :
             autoSaveStatus === 'saved' ? 'Saved' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  );
};
