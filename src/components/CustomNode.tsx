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

  return (
    <div className="custom-node shadow-xl">
      <div className="node-header flex justify-between items-center px-3 py-2 bg-slate-800 text-white rounded-t-lg">
        <span className="font-bold text-sm uppercase tracking-wider">{data.label}</span>
        <button onClick={() => data.onDelete?.(id)} className="hover:text-red-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="node-content p-3 bg-slate-900/90 backdrop-blur-sm text-slate-200 rounded-b-lg border border-slate-700">
        {Object.entries(data.params).map(([key, value]) => (
          <div key={key} className="input-group mb-3" style={{ position: 'relative' }}>
            <label className="input-label block text-xs text-slate-400 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>

            {/* Select dropdowns for specific keys */}
            {['roofType', 'foundationShape', 'doorSide', 'windowType', 'doorType', 'material'].includes(key) ? (
              <select
                value={value as string}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="node-select w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              >
                {key === 'roofType' ? (
                  <>
                    <option value="flat">Flat</option>
                    <option value="pitched">Pitched</option>
                    <option value="hip">Hip Roof</option>
                    <option value="gable">Gable</option>
                    <option value="mansard">Mansard</option>
                    <option value="shed">Shed</option>
                  </>
                ) : key === 'material' ? (
                  <>
                    <option value="concrete">Concrete</option>
                    <option value="bricks">Bricks</option>
                    <option value="wood">Wood</option>
                    <option value="metal">Metal</option>
                  </>
                ) : key === 'windowType' ? (
                  <>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic Grid</option>
                    <option value="arched">Arched</option>
                  </>
                ) : key === 'doorType' ? (
                  <>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic Panel</option>
                    <option value="double">Double Glass</option>
                  </>
                ) : (
                  <>
                    <option value="front">Front</option>
                    <option value="back">Back</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                  </>
                )}
              </select>
            ) : ['hasBalcony', 'showWindow', 'hasDoor'].includes(key) ? (
              /* Checkbox inputs for boolean keys */
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => handleParamChange(key, e.target.checked)}
                  className="node-checkbox w-5 h-5 cursor-pointer accent-blue-500"
                />
                <span className="ml-2 text-xs text-slate-500">{Boolean(value) ? 'Enabled' : 'Disabled'}</span>
              </div>
            ) : (
              /* Number inputs for everything else */
              <input
                type="number"
                value={value as number}
                onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                className="node-input w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Input Handles */}
      {data.inputs?.map((input, i) => (
        <Handle
          key={`in-${i}`}
          type="target"
          position={Position.Left}
          id={`in-${i}`}
          style={{
            background: PIN_COLORS[input] || '#fff',
            top: `${48 + (i + 1) * 24}px`,
            left: '-6px',
            width: '12px',
            height: '12px',
            border: '2px solid #1e293b'
          }}
        />
      ))}

      {/* Output Handles */}
      {data.outputs?.map((output, i) => (
        <Handle
          key={`out-${i}`}
          type="source"
          position={Position.Right}
          id={`out-${i}`}
          style={{
            background: PIN_COLORS[output] || '#fff',
            top: `${48 + (i + 1) * 24}px`,
            right: '-6px',
            width: '12px',
            height: '12px',
            border: '2px solid #1e293b'
          }}
        />
      ))}
    </div>
  );
});
