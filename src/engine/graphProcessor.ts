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
      case 'floors':
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        const count = inputs.find(i => i.handle === 'param-count')?.data || node.data.params.count;
        const height = inputs.find(i => i.handle === 'param-height')?.data || node.data.params.height;
        const winWidth = inputs.find(i => i.handle === 'param-winWidth')?.data || node.data.params.winWidth || 1.2;
        const winHeight = inputs.find(i => i.handle === 'param-winHeight')?.data || node.data.params.winHeight || 1.8;
        const winSpacing = inputs.find(i => i.handle === 'param-winSpacing')?.data || node.data.params.winSpacing || 2.5;
        
        const doorWidth = inputs.find(i => i.handle === 'param-doorWidth')?.data || node.data.params.doorWidth || 1.8;
        const doorHeight = inputs.find(i => i.handle === 'param-doorHeight')?.data || node.data.params.doorHeight || 2.4;
        const doorOffset = inputs.find(i => i.handle === 'param-doorOffset')?.data || node.data.params.doorOffset || 0;
        const doorSide = inputs.find(i => i.handle === 'param-doorSide')?.data || node.data.params.doorSide || 'front';

        if (!splineData) {
          output = { 
            count, height, winWidth, winHeight, winSpacing, 
            doorWidth, doorHeight, doorOffset, doorSide,
            showWindow: node.data.params.showWindow 
          };
        } else {
          // If we have a spline, we generate the actual building geometry
          const buildingData = {
            spline: splineData.points,
            floors: count,
            floorHeight: height,
            winWidth,
            winHeight,
            winSpacing,
            doorWidth,
            doorHeight,
            doorOffset,
            doorSide,
            twist: splineData.twist,
            taper: splineData.taper,
            shear: splineData.shear,
            jitter: splineData.jitter,
            detailed: true
          };

          output = [
            { ...buildingData, type: 'foundation_slab', detailed: false },
            { ...buildingData, type: 'full_volume', part: 'building' },
            { ...buildingData, type: 'full_volume', part: 'facade' }
          ];
        }
        break;

      case 'foundation':
        const getParam = (name: string) => {
          const input = inputs.find(i => i.handle === `param-${name}`);
          return input ? input.data : node.data.params[name];
        };

        const width = getParam('width');
        const depth = getParam('depth');
        const foundationShape = getParam('foundationShape');
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
          case 'rectangle':
          default:
            points = [[-w2, d2], [w2, d2], [w2, -d2], [-w2, -d2]];
            break;
        }

        // Return a shape package (spline) instead of meshes
        output = {
          points,
          twist: { base: twistBase, mid: twistMid, top: twistTop },
          taper,
          shear: { x: shearX, y: shearY },
          jitter
        };
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
