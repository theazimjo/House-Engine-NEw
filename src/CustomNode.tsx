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
  const handleParamChange = (name: string, value: any) => {
    data.onChange(id, { ...data.params, [name]: value });
  };

  return (
    <>
      <div className={`node-header header-${data.type} custom-drag-handle`}>
        <span>{data.label}</span>
        <span className="node-id">NB{id}</span>
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
                <span className="unit-label">m</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {data.type !== 'foundation' && (
        <Handle type="target" position={Position.Left} />
      )}
      {data.type !== 'output' && (
        <Handle type="source" position={Position.Right} />
      )}
    </>
  );
});
