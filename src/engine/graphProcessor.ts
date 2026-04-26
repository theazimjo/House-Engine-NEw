import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../types';

export const processGraph = (nodes: Node<NodeData>[], edges: Edge[]) => {
  const results = new Map<string, any>();

  const resolveNode = (nodeId: string): any => {
    if (results.has(nodeId)) return results.get(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const inputEdges = edges.filter(e => e.target === nodeId);
    const inputs = inputEdges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      let sourceData = resolveNode(edge.source);
      
      // If the source node outputs an array (multiple pins), we must pick the right one
      if (Array.isArray(sourceData) && sourceNode?.data.outputs) {
        const outputIndex = sourceNode.data.outputs.indexOf(edge.sourceHandle as any);
        if (outputIndex !== -1 && outputIndex < sourceData.length) {
          sourceData = sourceData[outputIndex];
        }
      }

      return {
        handle: edge.targetHandle,
        data: sourceData
      };
    });

    let output: any = null;

    switch (node.data.type) {
      case 'offset_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const amount = node.data.params.amount || 0;
        
        const center = splineData.points.reduce((acc: any, p: any) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
        center[0] /= splineData.points.length;
        center[1] /= splineData.points.length;

        const newPoints = splineData.points.map((p: any) => {
          const dx = p[0] - center[0];
          const dy = p[1] - center[1];
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return p;
          return [p[0] + (dx / len) * amount, p[1] + (dy / len) * amount];
        });
        output = { ...splineData, points: newPoints };
        break;
      }

      case 'transform_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const { x = 0, y = 0, z = 0, scale = 1.0, rotation = 0 } = node.data.params;
        const rad = rotation * (Math.PI / 180);
        
        const newPoints = splineData.points.map((p: any) => {
          const sx = p[0] * scale;
          const sy = p[1] * scale;
          const rx = sx * Math.cos(rad) - sy * Math.sin(rad);
          const ry = sx * Math.sin(rad) + sy * Math.cos(rad);
          return [rx + x, ry + y];
        });

        output = { 
          ...splineData, 
          points: newPoints,
          zOffset: (splineData.zOffset || 0) + z 
        };
        break;
      }

        case 'columns': {
          const splineData = inputs.find(i => i.handle === 'spline')?.data;
          if (!splineData || !Array.isArray(splineData.points)) break;
          const { radius = 0.3, height = 4.0, spacing = 3.0, useCorners = true, material = 'concrete' } = node.data.params;
          const zOffset = splineData.zOffset || 0;
          
          const columnMeshes: any[] = [];
          const pts = splineData.points;
          
          const addColumn = (p: [number, number]) => {
            columnMeshes.push({
              type: 'column',
              position: [p[0], zOffset, p[1]],
              radius,
              height,
              material
            });
          };

          for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length];
            
            if (useCorners) addColumn(p1);

            if (spacing > 0) {
              const dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
              const count = Math.floor(dist / spacing);
              for (let j = 1; j < count; j++) {
                const t = j / count;
                const interP: [number, number] = [
                  p1[0] + (p2[0] - p1[0]) * t,
                  p1[1] + (p2[1] - p1[1]) * t
                ];
                addColumn(interP);
              }
            }
          }
          output = columnMeshes;
          break;
        }

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

        const totalBuildingHeight = count * height;

        if (!splineData) {
          output = { 
            count, height, winWidth, winHeight, winSpacing, 
            doorWidth, doorHeight, doorOffset, doorSide,
            totalHeight: totalBuildingHeight,
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
            windowType: node.data.params.windowType || 'modern',
            doorType: node.data.params.doorType || 'modern',
            material: node.data.params.material || 'bricks',
            hasBalcony: node.data.params.hasBalcony !== undefined ? node.data.params.hasBalcony : true,
            hasRibs: node.data.params.hasRibs || false,
            plinthHeight: node.data.params.plinthHeight || 0,
            twist: splineData.twist,
            taper: splineData.taper,
            shear: splineData.shear,
            jitter: splineData.jitter,
            detailed: true
          };

          const floorSlabs = [];
          const interiorWalls = [];

          for (let i = 0; i < count; i++) {
            const floorY = i * height;
            // Floor slab
            floorSlabs.push({
              ...buildingData,
              type: 'floor_slab',
              baseHeight: floorY,
              detailed: false
            });

            // Simple cross-partition interior walls
            interiorWalls.push({
              ...buildingData,
              type: 'interior_partition',
              baseHeight: floorY,
              detailed: false
            });
          }

          // Top ceiling
          floorSlabs.push({
            ...buildingData,
            type: 'floor_slab',
            baseHeight: totalBuildingHeight,
            detailed: false
          });

          output = [
            // Index 0: Mesh (Blue Pin)
            [
              { ...buildingData, type: 'foundation_slab', detailed: false },
              { ...buildingData, type: 'full_volume', part: 'building' },
              { ...buildingData, type: 'full_volume', part: 'facade' },
              ...floorSlabs,
              ...interiorWalls
            ],
            // Index 1: Window (Light Blue Pin)
            null, 
            // Index 2: Float (Orange Pin) - Height
            totalBuildingHeight
          ];
        }
        break;

      case 'roof':
        const roofSpline = inputs.find(i => i.handle === 'spline')?.data;
        const baseHeight = inputs.find(i => i.handle === 'float')?.data || 0;
        const roofType = inputs.find(i => i.handle === 'param-roofType')?.data || node.data.params.roofType || 'pitched';
        const roofHeight = inputs.find(i => i.handle === 'param-height')?.data || node.data.params.height || 3;
        const roofOverhang = inputs.find(i => i.handle === 'param-overhang')?.data || node.data.params.overhang || 0.5;
        const roofColor = inputs.find(i => i.handle === 'param-color')?.data || node.data.params.color || '#8e2b2b';

        if (!roofSpline) {
          output = { roofType, height: roofHeight, overhang: roofOverhang, color: roofColor, baseHeight };
        } else {
          output = {
            type: 'roof',
            roofType,
            height: roofHeight,
            overhang: roofOverhang,
            color: roofColor,
            baseHeight,
            spline: roofSpline.points,
            deformation: {
              twist: roofSpline.twist,
              taper: roofSpline.taper,
              shear: roofSpline.shear,
              jitter: roofSpline.jitter
            },
            detailed: false,
            roof: true
          };
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

  const allOutputs: any[] = [];
  
  const collectRenderables = (data: any) => {
    if (!data) return;
    if (Array.isArray(data)) {
      data.forEach(item => collectRenderables(item));
    } else if (typeof data === 'object') {
      if (data.type || data.roof) {
        allOutputs.push(data);
      }
    }
  };

  nodes.forEach(node => {
    collectRenderables(resolveNode(node.id));
  });

  return allOutputs;
};
