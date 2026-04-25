import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from './types';
import { Box, Layers, Grid, Save, Layout } from 'lucide-react';

const icons = {
  foundation: Layout,
  extrude: Layers,
  scatter: Grid,
  output: Save,
};

export const CustomNode = memo(({ data, id }: NodeProps<NodeData>) => {
  const Icon = icons[data.type] || Box;

  const handleParamChange = (name: string, value: any) => {
    data.onChange(id, { ...data.params, [name]: value });
  };

  return (
    <div className="react-flow__node-container" style={{ width: '100%' }}>
      <div className="react-flow__node-header" style={{
        borderLeft: `4px solid ${data.type === 'output' ? '#ef4444' : '#4f46e5'}`,
        background: 'rgba(255,255,255,0.02)'
      }}>
        <Icon size={14} style={{ color: data.type === 'output' ? '#ef4444' : '#6366f1' }} />
        <span style={{ fontWeight: 600 }}>{data.label}</span>
      </div>
      <div className="react-flow__node-body">
        {Object.entries(data.params).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {key}
              </label>
              <span style={{ fontSize: '0.65rem', color: '#6366f1' }}>{value}</span>
            </div>

            {key === 'roofType' || key === 'foundationShape' ? (
              <select
                value={value}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="custom-select"
                style={{
                  width: '100%',
                  background: '#0a0a0c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  padding: '4px'
                }}
              >
                {key === 'roofType' ? (
                  <>
                    <option value="flat">Flat</option>
                    <option value="pitched">Pitched</option>
                    <option value="dome">Dome</option>
                  </>
                ) : (
                  <>
                    <option value="rectangle">Rectangle</option>
                    <option value="L-shape">L-Shape</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type="range"
                min={key === 'floors' ? 1 : 0.1}
                max={key === 'width' || key === 'depth' ? 20 : 10}
                step={0.1}
                value={value}
                onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            )}
          </div>
        ))}
      </div>

      {data.type !== 'foundation' && (
        <Handle type="target" position={Position.Left} style={{ background: '#4f46e5' }} />
      )}
      {data.type !== 'output' && (
        <Handle type="source" position={Position.Right} style={{ background: '#4f46e5' }} />
      )}
    </div>
  );
});
