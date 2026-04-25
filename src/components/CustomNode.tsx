import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '../types';
import { PIN_COLORS } from '../constants/nodeStyles';

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
        <span>{data.label}</span>
        <span className="node-id">NB{id.toUpperCase()}</span>
      </div>
      
      <div className="node-body">
        {Object.entries(data.params).map(([key, value]) => (
          <div key={key} className="input-group">
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
                    <option value="L-shape">L-Shape</option>
                  </>
                )}
              </select>
            ) : (
              <div className="input-with-unit">
                <input
                  type="number"
                  step={0.1}
                  value={value}
                  onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                  className="node-input"
                />
                <span className="unit-label">{typeof value === 'boolean' ? '' : 'm'}</span>
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
            style={getHandleStyle(i, false)}
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
            style={getHandleStyle(i, true)}
          />
        ))}
      </div>
    </>
  );
});
