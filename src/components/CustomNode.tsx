import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '../types';
import { PIN_COLORS } from '../constants/nodeStyles';
import { X } from 'lucide-react';

export const CustomNode = memo(({ data, id }: NodeProps<NodeData>) => {
  const handleParamChange = (name: string, value: any) => {
    data.onChange(id, { ...data.params, [name]: value });
  };

  // Header height is roughly 40px. 
  // We want to space handles below that.
  const getHandleStyle = (index: number, isRight: boolean) => ({
    background: PIN_COLORS[isRight ? (data.outputs?.[index] || 'mesh') : (data.inputs?.[index] || 'mesh')],
    top: `${40 + (index + 1) * 24}px`,
    [isRight ? 'right' : 'left']: '-5px',
  });

  return (
    <>
      <div className={`node-header header-${data.type} custom-drag-handle`}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className="node-id" style={{ fontSize: '0.5rem', opacity: 0.6 }}>NB{id.split('-')[0].toUpperCase()}</span>
          <div className="node-delete-btn" onClick={(e) => {
            e.stopPropagation();
            // We'll use a custom event or a shared context if useReactFlow fails here
            window.dispatchEvent(new CustomEvent('delete-node', { detail: id }));
          }}>
            <X size={12} />
          </div>
        </div>
      </div>

      <div className="node-body">
        {Object.entries(data.params).map(([key, value]) => (
          <div key={key} className="input-group" style={{ position: 'relative' }}>
            {data.type !== 'foundation' && (
              <Handle
                type="target"
                position={Position.Left}
                id={`param-${key}`}
                style={{
                  left: '-17px',
                  top: '50%',
                  background: PIN_COLORS[key === 'floors' ? 'floors' : 'float'],
                  width: '10px',
                  height: '10px',
                  border: '1.5px solid #1a1a1a',
                  borderRadius: '2px'
                }}
              />
            )}

            {data.type !== 'foundation' && (
              <Handle
                type="source"
                position={Position.Right}
                id={key}
                style={{
                  right: '-17px',
                  top: '50%',
                  background: PIN_COLORS[data.type === 'floors' ? 'floors' : 'float'],
                  width: '10px',
                  height: '10px',
                  border: '1.5px solid #1a1a1a',
                  borderRadius: '2px'
                }}
              />
            )}

            {/* Foundation only has outputs on the right */}
            {data.type === 'foundation' && (
              <Handle
                type="source"
                position={Position.Right}
                id={key}
                style={{
                  right: '-17px',
                  top: '50%',
                  background: PIN_COLORS.float,
                  width: '10px',
                  height: '10px',
                  border: '1.5px solid #1a1a1a',
                  borderRadius: '2px'
                }}
              />
            )}
            <label className="input-label">{key}</label>

            {key === 'roofType' || key === 'foundationShape' ? (
              <select
                value={value}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="node-select"
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
                    <option value="circle">Circle</option>
                    <option value="hexagon">Hexagon</option>
                    <option value="L-shape">L-Shape</option>
                    <option value="U-shape">U-Shape</option>
                    <option value="C-shape">C-Shape</option>
                    <option value="X-shape">X-Shape</option>
                    <option value="custom">Custom</option>
                  </>
                )}
              </select>
            ) : (
              <div className="input-with-unit">
                <input
                  type="number"
                  step={key.includes('twist') ? 1 : 0.1}
                  value={value}
                  onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                  className="node-input"
                />
                <span className="unit-label">{
                  key.includes('twist') ? '°' :
                    key === 'floors' ? '' :
                      key === 'taper' ? 'x' :
                        key === 'jitter' ? 'm' : 'm'
                }</span>
              </div>
            )}
          </div>
        ))}

        {/* If no params, add some empty space to prevent handles clumping */}
        {Object.keys(data.params).length === 0 && (
          <div style={{ height: '40px' }} />
        )}
      </div>

      <div className="node-ports-left">
        {/* Input ports removed as requested */}
      </div>

      <div className="node-ports-right">
        {/* Output ports removed as requested */}
      </div>
    </>
  );
});
