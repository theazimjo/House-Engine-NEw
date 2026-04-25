import type { Node, Edge } from 'reactflow';
import type { NodeData, PinType } from '../types';

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
        const { width, depth, foundationShape } = node.data.params;
        const w2 = width / 2;
        const d2 = depth / 2;
        if (foundationShape === 'rectangle') {
          output = [[-w2, d2], [w2, d2], [w2, -d2], [-w2, -d2]];
        } else {
          const t = Math.min(width, depth) * 0.4;
          output = [[-w2, d2], [w2, d2], [w2, -d2 + t], [-w2 + t, -d2 + t], [-w2 + t, -d2], [-w2, -d2]];
        }
        break;

      case 'extrude':
        const spline = inputs.find(i => i.handle === 'spline')?.data;
        if (spline) {
          const { floors, floorHeight } = node.data.params;
          output = { spline, floors, floorHeight, type: 'full_volume' };
        }
        break;

      case 'split':
        const meshData = inputs.find(i => i.handle === 'mesh')?.data;
        if (meshData) {
          output = { ...meshData, parts: ['top', 'sides'] };
        }
        break;

      case 'scatter':
        const sideInput = inputs.find(i => i.handle === 'mesh')?.data;
        if (sideInput) {
          output = { ...sideInput, detailed: true, ...node.data.params };
        }
        break;

      case 'output':
        const topInput = inputs.find(i => i.handle === 'mesh')?.data;
        if (topInput) {
          output = { ...topInput, roof: true, ...node.data.params };
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
    n.data.type === 'merge' || 
    (n.data.type === 'output' && !edges.some(e => e.source === n.id))
  );

  const processed = rootNodes.map(root => resolveNode(root.id)).flat();
  return processed.filter(Boolean);
};
