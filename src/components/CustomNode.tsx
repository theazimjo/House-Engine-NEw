import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '../types';
import { PIN_COLORS, NODE_HEADER_COLORS } from '../constants/nodeStyles';
import { X, GripVertical } from 'lucide-react';

// ── Pin Label Map ─────────────────────────────────────────────────────────────
const PIN_LABELS: Record<string, string> = {
  spline:    'SPLINE',
  mesh:      'MESH',
  float:     'FLOAT',
  integer:   'INT',
  boolean:   'BOOL',
  material:  'MAT',
  transform: 'XFM',
  array:     'ARR',
  mask:      'MASK',
  window:    'WIN',
  floors:    'FLOOR',
};

// ── Select Options ────────────────────────────────────────────────────────────
const SELECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  roofType: [
    { value: 'flat',    label: 'Flat' },
    { value: 'pitched', label: 'Pitched' },
    { value: 'hip',     label: 'Hip' },
    { value: 'gable',   label: 'Gable' },
    { value: 'mansard', label: 'Mansard' },
    { value: 'shed',    label: 'Shed' },
  ],
  foundationShape: [
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle',    label: 'Circle' },
    { value: 'hexagon',   label: 'Hexagon' },
    { value: 'L-shape',   label: 'L-Shape' },
    { value: 'U-shape',   label: 'U-Shape' },
    { value: 'C-shape',   label: 'C-Shape' },
    { value: 'X-shape',   label: 'X-Shape' },
  ],
  doorSide: [
    { value: 'front',     label: 'Front' },
    { value: 'back',      label: 'Back' },
    { value: 'frontback', label: 'Front + Back' },
    { value: 'sides',     label: 'Sides' },
    { value: 'all',       label: 'All Sides' },
  ],
  windowType: [
    { value: 'modern',  label: 'Modern' },
    { value: 'classic', label: 'Classic Grid' },
    { value: 'arched',  label: 'Arched' },
  ],
  doorType: [
    { value: 'modern',  label: 'Modern' },
    { value: 'classic', label: 'Classic Panel' },
    { value: 'double',  label: 'Double Glass' },
  ],
  material: [
    { value: 'concrete',  label: 'Concrete' },
    { value: 'bricks',    label: 'Bricks' },
    { value: 'wood',      label: 'Wood' },
    { value: 'metal',     label: 'Metal' },
  ],
  axis: [
    { value: 'x', label: 'X Axis' },
    { value: 'z', label: 'Z Axis' },
  ],
  operation: [
    { value: 'add',      label: 'Add  (A + B)' },
    { value: 'subtract', label: 'Subtract (A - B)' },
    { value: 'multiply', label: 'Multiply (A × B)' },
    { value: 'divide',   label: 'Divide (A ÷ B)' },
    { value: 'max',      label: 'Max' },
    { value: 'min',      label: 'Min' },
    { value: 'power',    label: 'Power (A ^ B)' },
  ],
};

const BOOLEAN_KEYS = new Set(['hasBalcony', 'showWindow', 'hasDoor', 'hasRibs', 'useCorners']);

// ── CustomNode ────────────────────────────────────────────────────────────────
export const CustomNode = memo(({ data, id }: NodeProps<NodeData>) => {
  const headerColor = NODE_HEADER_COLORS[data.type] ?? '#333';

  const handleParamChange = (name: string, value: any) => {
    data.onChange(id, { ...data.params, [name]: value });
  };

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent('delete-node', { detail: id }));
  };

  return (
    <div className="custom-node">
      {/* ── Header ── */}
      <div
        className="node-header"
        style={{ background: headerColor, borderBottom: `1px solid rgba(0,0,0,0.4)` }}
      >
        <GripVertical size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em' }}>
          {data.label}
        </span>
        <button
          className="node-delete-btn"
          onClick={handleDelete}
          title="Delete node"
        >
          <X size={12} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="node-body">
        {Object.entries(data.params).map(([key, value]) => {
          const isSelect  = key in SELECT_OPTIONS;
          const isBool    = BOOLEAN_KEYS.has(key);
          const isColor   = key === 'color';

          return (
            <div key={key} className="input-group">
              <label className="input-label">{key.replace(/([A-Z])/g, ' $1')}</label>

              {isColor ? (
                <input
                  type="color"
                  value={value as string}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  style={{ width: '36px', height: '20px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                />
              ) : isSelect ? (
                <select
                  value={value as string}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  className="node-select"
                >
                  {SELECT_OPTIONS[key].map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : isBool ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleParamChange(key, e.target.checked)}
                    className="node-checkbox"
                  />
                  <span style={{ fontSize: '0.58rem', color: Boolean(value) ? '#4ade80' : '#555' }}>
                    {Boolean(value) ? 'ON' : 'OFF'}
                  </span>
                </div>
              ) : (
                <input
                  type="number"
                  value={value as number}
                  step={typeof value === 'number' && value < 2 ? 0.1 : 1}
                  onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                  className="node-input"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Input Handles (Left) ── */}
      {data.inputs?.map((pin, i) => (
        <Handle
          key={`in-${pin}-${i}`}
          type="target"
          position={Position.Left}
          id={pin}   // ← ID = pin type name, NOT index
          style={{
            background: PIN_COLORS[pin] ?? '#aaa',
            top: `${52 + i * 22}px`,
            left: '-7px',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            border: '2px solid #111',
          }}
          title={PIN_LABELS[pin] ?? pin}
        />
      ))}

      {/* ── Output Handles (Right) ── */}
      {data.outputs?.map((pin, i) => (
        <Handle
          key={`out-${pin}-${i}`}
          type="source"
          position={Position.Right}
          id={pin}   // ← ID = pin type name, NOT index
          style={{
            background: PIN_COLORS[pin] ?? '#aaa',
            top: `${52 + i * 22}px`,
            right: '-7px',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            border: '2px solid #111',
          }}
          title={PIN_LABELS[pin] ?? pin}
        />
      ))}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
