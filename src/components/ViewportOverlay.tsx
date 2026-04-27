import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Grid3x3, Sun, Moon, Sunrise, Camera,
  ArrowUp, ArrowRight, Box, RotateCcw, Maximize2, PersonStanding
} from 'lucide-react';

interface ViewportOverlayProps {
  onCameraPreset: (preset: string) => void;
  onToggleWireframe: () => void;
  onToggleGrid: () => void;
  onSetEnvironment: (env: string) => void;
  wireframe: boolean;
  gridVisible: boolean;
  currentEnv: string;
  timeOfDay: number;
  onSetTimeOfDay: (time: number) => void;
  isFirstPerson: boolean;
  onToggleFirstPerson: () => void;
}

const CAMERA_PRESETS = [
  { id: 'perspective', label: 'Persp', icon: <Box size={13} /> },
  { id: 'top',         label: 'Top',   icon: <ArrowUp size={13} /> },
  { id: 'front',       label: 'Front', icon: <Maximize2 size={13} /> },
  { id: 'right',       label: 'Right', icon: <ArrowRight size={13} /> },
  { id: 'reset',       label: 'Reset', icon: <RotateCcw size={13} /> },
];

const ENV_PRESETS = [
  { id: 'city',       label: 'City',     icon: <Sunrise size={13} /> },
  { id: 'sunset',     label: 'Sunset',   icon: <Sun size={13} /> },
  { id: 'dawn',       label: 'Dawn',     icon: <Sunrise size={13} /> },
  { id: 'night',      label: 'Night',    icon: <Moon size={13} /> },
  { id: 'studio',     label: 'Studio',   icon: <Camera size={13} /> },
  { id: 'apartment',  label: 'Interior', icon: <Box size={13} /> },
];

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  onCameraPreset, onToggleWireframe, onToggleGrid, onSetEnvironment,
  wireframe, gridVisible, currentEnv, timeOfDay, onSetTimeOfDay,
  isFirstPerson, onToggleFirstPerson
}) => {
  const [showEnvPanel, setShowEnvPanel] = useState(false);

  return (
    <>
      {/* ── Top-Right Camera Presets ── */}
      <div className="viewport-overlay-top-right">
        <div className="viewport-ctrl-group">
          {CAMERA_PRESETS.map(p => (
            <button
              key={p.id}
              className="viewport-ctrl-btn"
              onClick={() => onCameraPreset(p.id)}
              title={p.label}
            >
              {p.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top-Left View Controls ── */}
      <div className="viewport-overlay-top-left">
        <div className="viewport-ctrl-group">
          <button
            className={`viewport-ctrl-btn ${wireframe ? 'viewport-ctrl-btn--active' : ''}`}
            onClick={onToggleWireframe}
            title="Toggle Wireframe"
          >
            <Grid3x3 size={13} />
          </button>
          <button
            className={`viewport-ctrl-btn ${gridVisible ? 'viewport-ctrl-btn--active' : ''}`}
            onClick={onToggleGrid}
            title="Toggle Grid"
          >
            <Eye size={13} />
          </button>
          <button
            className={`viewport-ctrl-btn ${showEnvPanel ? 'viewport-ctrl-btn--active' : ''}`}
            onClick={() => setShowEnvPanel(!showEnvPanel)}
            title="Environment Presets"
          >
            <Sun size={13} />
          </button>
          <div className="w-px h-4 bg-[#111]/20 mx-1"></div>
          <button
            className={`viewport-ctrl-btn ${isFirstPerson ? 'viewport-ctrl-btn--active text-[#c64321]' : ''}`}
            onClick={onToggleFirstPerson}
            title="First Person View (WASD to move, Click to lock mouse)"
          >
            <PersonStanding size={13} />
          </button>
        </div>

        {/* Environment Preset Panel */}
        <AnimatePresence>
          {showEnvPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="viewport-env-panel"
            >
              <div className="viewport-env-label">ENVIRONMENT</div>
              {ENV_PRESETS.map(e => (
                <button
                  key={e.id}
                  className={`viewport-env-btn ${currentEnv === e.id ? 'viewport-env-btn--active' : ''}`}
                  onClick={() => { onSetEnvironment(e.id); setShowEnvPanel(false); }}
                >
                  {e.icon}
                  <span>{e.label}</span>
                </button>
              ))}

              <div className="viewport-env-label" style={{ marginTop: '12px' }}>TIME OF DAY</div>
              <div style={{ padding: '0 8px 8px 8px' }}>
                <input 
                  type="range" 
                  min="6" max="20" step="0.5" 
                  value={timeOfDay} 
                  onChange={(e) => onSetTimeOfDay(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#888', marginTop: '4px' }}>
                  <span>6:00</span>
                  <span>12:00</span>
                  <span>20:00</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
