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
            <label className="input-label">{key}</label>

            {key === 'roofType' || key === 'foundationShape' || key === 'doorSide' ? (
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
                ) : key === 'doorSide' ? (
                  <>
                    <option value="all">All Sides</option>
                    <option value="front">Front Only</option>
                    <option value="frontback">Front & Back</option>
                    <option value="sides">Left & Right</option>
                    <option value="none">None</option>
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
        {data.inputs?.map((type, i) => (
          <Handle
            key={`in-${i}`}
            type="target"
            position={Position.Left}
            id={type}
            style={{
              left: '-8px',
              top: `${20 + i * 24}px`,
              background: PIN_COLORS[type] || PIN_COLORS.float,
              width: '12px',
              height: '12px',
              border: '1px solid #000',
              borderRadius: '2px',
              pointerEvents: 'all'
            }}
          />
        ))}
      </div>

      <div className="node-ports-right">
        {data.outputs?.map((type, i) => (
          <Handle
            key={`out-${i}`}
            type="source"
            position={Position.Right}
            id={type}
            style={{
              right: '-8px',
              top: `${20 + i * 24}px`,
              background: PIN_COLORS[type] || PIN_COLORS.float,
              width: '12px',
              height: '12px',
              border: '1px solid #000',
              borderRadius: '2px',
              pointerEvents: 'all'
            }}
          />
        ))}
      </div>
    </>
  );
});
