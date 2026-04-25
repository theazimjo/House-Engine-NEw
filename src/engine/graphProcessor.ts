import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../types';

export const processGraph = (nodes: Node<NodeData>[], edges: Edge[]) => {
  const results = new Map<string, any>();

  const resolveNode = (nodeId: string): any => {
    if (results.has(nodeId)) return results.get(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const inputEdges = edges.filter(e => e.target === nodeId);
    const inputs = inputEdges.map(edge => ({
      handle: edge.targetHandle,
      data: resolveNode(edge.source)
    }));

    let output: any = null;

    switch (node.data.type) {
      case 'foundation':
        const getParam = (name: string) => {
          const input = inputs.find(i => i.handle === `param-${name}`);
          return input ? input.data : node.data.params[name];
        };

        const width = getParam('width');
        const depth = getParam('depth');
        const foundationShape = getParam('foundationShape');
        const floors = getParam('floors') || 1;
        const floorHeight = getParam('floorHeight') || 3;
        const totalHeight = getParam('height');
        const twistBase = getParam('twistBase') || 0;
        const twistMid = getParam('twistMid') || 0;
        const twistTop = getParam('twistTop') || 0;
        const taper = getParam('taper') !== undefined ? getParam('taper') : 1;
        const shearX = getParam('shearX') || 0;
        const shearY = getParam('shearY') || 0;
        const jitter = getParam('jitter') || 0;

        const w2 = width / 2;
        const d2 = depth / 2;
        let points: [number, number][] = [];

        switch (foundationShape) {
          case 'circle':
            for (let i = 0; i < 32; i++) {
              const angle = (i / 32) * Math.PI * 2;
              points.push([Math.cos(angle) * w2, Math.sin(angle) * d2]);
            }
            break;
          case 'hexagon':
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              points.push([Math.cos(angle) * w2, Math.sin(angle) * d2]);
            }
            break;
          case 'L-shape':
            const lt = Math.min(width, depth) * 0.4;
            points = [[-w2, d2], [w2, d2], [w2, -d2 + lt], [-w2 + lt, -d2 + lt], [-w2 + lt, -d2], [-w2, -d2]];
            break;
          case 'U-shape':
            const ut = Math.min(width, depth) * 0.3;
            points = [
              [-w2, d2], [w2, d2], [w2, -d2], [w2 - ut, -d2], 
              [w2 - ut, d2 - ut], [-w2 + ut, d2 - ut], [-w2 + ut, -d2], [-w2, -d2]
            ];
            break;
          case 'C-shape':
            const ct = Math.min(width, depth) * 0.3;
            points = [
              [w2, d2], [w2, d2 - ct], [-w2 + ct, d2 - ct], 
              [-w2 + ct, -d2 + ct], [w2, -d2 + ct], [w2, -d2], [-w2, -d2], [-w2, d2]
            ];
            break;
          case 'X-shape':
            const xt = Math.min(width, depth) * 0.25;
            points = [
              [-xt, xt], [xt, xt], [w2, d2], [w2, d2 - xt], [xt, 0], [w2, -d2 + xt], 
              [w2, -d2], [xt, -xt], [-xt, -xt], [-w2, -d2], [-w2, -d2 + xt], [-xt, 0], 
              [-w2, d2 - xt], [-w2, d2]
            ];
            break;
          case 'custom':
            // Default to square if custom but no points provided
            points = [[-w2, d2], [w2, d2], [w2, -d2], [-w2, -d2]];
            break;
          case 'rectangle':
          default:
            points = [[-w2, d2], [w2, d2], [w2, -d2], [-w2, -d2]];
            break;
        }

        const buildingData = { 
          spline: points, 
          floors, 
          floorHeight: totalHeight ? (totalHeight / floors) : floorHeight,
          twist: { base: twistBase, mid: twistMid, top: twistTop },
          taper,
          shear: { x: shearX, y: shearY },
          jitter,
          detailed: true
        };

        output = [
          { ...buildingData, type: 'foundation_slab', detailed: false },
          { ...buildingData, type: 'full_volume', part: 'building' },
          { ...buildingData, type: 'full_volume', part: 'facade' }
        ];
        break;

      case 'extrude':
        const inputData = inputs.find(i => i.handle === 'spline')?.data;
        if (inputData) {
          const points = inputData.spline || inputData;
          const { floors, floorHeight } = node.data.params;
          output = { spline: points, floors, floorHeight, type: 'full_volume', part: 'building' };
        }
        break;

      case 'window':
      case 'scatter':
        let sideInput = inputs.find(i => i.handle === 'mesh' || i.handle === 'window')?.data;
        if (Array.isArray(sideInput)) {
          sideInput = sideInput.find(p => p.part === 'facade') || sideInput[0];
        }
        
        if (sideInput) {
          const params = node.data.params;
          output = { 
            ...sideInput, 
            detailed: true, 
            ...params, 
            style: params.modern ? 'modern' : 'classic' 
          };
        }
        break;

      case 'split':
        const meshData = inputs.find(i => i.handle === 'mesh')?.data;
        if (meshData) {
          output = { ...meshData, parts: ['top', 'sides'] };
        }
        break;

      case 'transform':
        const meshToMove = inputs.find(i => i.handle === 'mesh')?.data;
        if (meshToMove) {
          const { x = 0, y = 0, z = 0 } = node.data.params;
          output = { ...meshToMove, offset: [x, y, z] };
        }
        break;

      case 'output':
        const topInput = inputs.find(i => i.handle === 'mesh')?.data;
        if (topInput) {
          output = { ...topInput, roof: true, ...node.data.params, style: node.data.params.modern ? 'modern' : 'classic' };
        }
        break;

      case 'merge':
        output = inputs.map(i => i.data).filter(Boolean);
        break;
    }

    results.set(nodeId, output);
    return output;
  };

  const rootNodes = nodes.filter(n => 
    !edges.some(e => e.source === n.id)
  );

  const processed = rootNodes.map(root => resolveNode(root.id)).flat();
  return processed.filter(Boolean);
};
