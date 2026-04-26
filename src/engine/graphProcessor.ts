import type { Node, Edge } from 'reactflow';
import type { NodeData } from '../types';
import * as THREE from 'three';

export const processGraph = (nodes: Node<NodeData>[], edges: Edge[]): any[] => {
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

      case 'plinth': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const { height = 0.8, material = 'concrete' } = node.data.params;
        const zOffset = splineData.zOffset || 0;

        output = [{
          type: 'plinth_mesh',
          spline: splineData.points,
          height,
          zOffset,
          material
        }];
        break;
      }

      case 'stairs': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        // Find if there's a connected plinth height to match
        const { count = 4, stepHeight = 0.2, stepDepth = 0.3, width = 2.5, side = 'front' } = node.data.params;
        const zOffset = splineData.zOffset || 0;

        const shape = splineData.foundationShape || 'rectangle';
        
        const getIndices = () => {
          let front = 2, back = 0;
          if (shape === 'U-shape') { front = 4; back = 0; }
          else if (shape === 'L-shape') { front = 2; back = 0; }
          else if (shape === 'C-shape') { front = 4; back = 0; }
          else if (shape === 'X-shape') { front = 0; back = 7; }
          else if (shape === 'hexagon') { front = 3; back = 0; }
          
          if (side === 'front') return [front];
          if (side === 'back') return [back];
          if (side === 'frontback') return [front, back];
          if (side === 'all') return Array.from({length: splineData.points.length}, (_, i) => i);
          return [front];
        };

        const indices = getIndices();
        const stairParts: any[] = [];

        indices.forEach(idx => {
          const segIdx = idx >= splineData.points.length ? 0 : idx;
          const p1 = splineData.points[segIdx];
          const p2 = splineData.points[(segIdx + 1) % splineData.points.length];
          const midX = (p1[0] + p2[0]) / 2;
          const midZ = (p1[1] + p2[1]) / 2;

          const dx = p2[0] - p1[0];
          const dz = p2[1] - p1[1];
          const angle = Math.atan2(dz, dx);
          const normal = angle + Math.PI / 2;

          for (let i = 0; i < count; i++) {
            const h = (i + 1) * stepHeight;
            const d = (count - i) * stepDepth;
            const distOut = d / 2 + 0.1;

            stairParts.push({
              type: 'stairs_step',
              position: [
                midX + Math.cos(normal) * distOut,
                zOffset,
                midZ + Math.sin(normal) * distOut
              ],
              rotation: [0, -angle, 0],
              args: [width, h, d]
            });
          }
        });
        output = stairParts;
        break;
      }

      case 'columns': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const { radius = 0.3, height = 4.0, spacing = 3.0, useCorners = true, material = 'concrete', zOffset = 0 } = node.data.params;
        const baseZOffset = splineData.zOffset || 0;
        const totalZOffset = baseZOffset + zOffset;

        const columnMeshes: any[] = [];
        const pts = splineData.points;

        const arcade = node.data.params.arcade || false;
        const columnPositions: [number, number][] = [];

        const addColumn = (p: [number, number]) => {
          columnMeshes.push({
            type: 'column',
            position: [p[0], totalZOffset, p[1]],
            radius,
            height,
            material
          });
          columnPositions.push(p);
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
        
        if (arcade && columnPositions.length > 1) {
          for (let i = 0; i < columnPositions.length; i++) {
            const p1 = columnPositions[i];
            const p2 = columnPositions[(i + 1) % columnPositions.length];
            columnMeshes.push({
              type: 'arcade_arch',
              p1,
              p2,
              zOffset: totalZOffset,
              height,
              radius,
              material
            });
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
          const plinthHeight = node.data.params.plinthHeight || 0;

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
            doorSegmentIndex: (() => {
              const shape = splineData.foundationShape || 'rectangle';
              if (doorSide === 'frontback' || doorSide === 'all' || doorSide === 'sides') return undefined;

              if (doorSide === 'back') {
                if (shape === 'X-shape') return 7;
                return 0;
              }
              if (doorSide === 'right') return 1;
              if (doorSide === 'left') {
                if (shape === 'U-shape' || shape === 'C-shape') return 7;
                if (shape === 'L-shape') return 5;
                if (shape === 'X-shape') return 11;
                return 3;
              }
              // front
              if (shape === 'U-shape') return 4;
              if (shape === 'L-shape') return 2;
              if (shape === 'C-shape') return 4;
              if (shape === 'X-shape') return 0;
              if (shape === 'hexagon') return 3;
              return 2;
            })(),
            plinthHeight: 0,
            zOffset: (splineData.zOffset || 0) + plinthHeight,
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
              floorIndex: i,
              detailed: false
            });
          }

          // Top ceiling
          floorSlabs.push({
            ...buildingData,
            type: 'floor_slab',
            baseHeight: totalBuildingHeight,
            floorIndex: count,
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
            totalBuildingHeight + plinthHeight
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
            foundationShape: roofSpline.foundationShape,
            zOffset: roofSpline.zOffset || 0,
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

      case 'foundation': {
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
          foundationShape,
          twist: { base: twistBase, mid: twistMid, top: twistTop },
          taper,
          shear: { x: shearX, y: shearY },
          jitter
        };
        break;
      }

      // ── Primitive Box ────────────────────────────────────────────────────────
      case 'primitive_box': {
        const { width = 2, height = 2, depth = 2 } = node.data.params;
        output = [{ type: 'primitive_box', args: [width, height, depth], position: [0, height / 2, 0] }];
        break;
      }

      // ── Primitive Cylinder ───────────────────────────────────────────────────
      case 'primitive_cylinder': {
        const { radius = 1, height = 2, radialSegments = 32 } = node.data.params;
        output = [{ type: 'primitive_cylinder', args: [radius, radius, height, radialSegments], position: [0, height / 2, 0] }];
        break;
      }

      // ── Dome ───────────────────────────────────────────────────────────
      case 'dome': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        const { radius: domR = 6, segments: domSeg = 24,
                material: domMat = 'marble', zOffset: domZ = 0, color: domColor = '#e8dfc8' } = node.data.params;
        // Compute centroid from spline if connected, otherwise use (0,0)
        let cx = 0, cz = 0;
        const baseZOffset = splineData?.zOffset || 0;
        if (splineData?.points) {
          const pts = splineData.points as [number,number][];
          pts.forEach(p => { cx += p[0]; cz += p[1]; });
          cx /= pts.length; cz /= pts.length;
        }
        output = [{
          type: 'dome_mesh',
          position: [cx, baseZOffset + domZ, cz],
          radius: domR,
          segments: domSeg,
          material: domMat,
          color: domColor,
        }];
        break;
      }

      // ── Boolean Subtract ─────────────────────────────────────────────────────
      case 'boolean_subtract': {
        const meshInputs = inputs.filter(i => i.handle === 'mesh');
        const a = meshInputs[0]?.data;
        const b = meshInputs[1]?.data;
        if (a && b) {
          output = [{ type: 'boolean_subtract', meshA: Array.isArray(a) ? a : [a], meshB: Array.isArray(b) ? b : [b] }];
        } else {
          output = a || b || null;
        }
        break;
      }

      // ── Offset Spline ────────────────────────────────────────────────────────
      case 'offset_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const offset = node.data.params.offset || 0;
        
        const pts = splineData.points;
        const len = pts.length;
        const newPts: [number, number][] = [];
        
        for (let i = 0; i < len; i++) {
          const prev = pts[(i - 1 + len) % len];
          const curr = pts[i];
          const next = pts[(i + 1) % len];
          
          const dx1 = curr[0] - prev[0];
          const dy1 = curr[1] - prev[1];
          const len1 = Math.sqrt(dx1*dx1 + dy1*dy1);
          const nx1 = dy1 / len1;  
          const ny1 = -dx1 / len1;
          
          const dx2 = next[0] - curr[0];
          const dy2 = next[1] - curr[1];
          const len2 = Math.sqrt(dx2*dx2 + dy2*dy2);
          const nx2 = dy2 / len2;
          const ny2 = -dx2 / len2;
          
          let nx = nx1 + nx2;
          let ny = ny1 + ny2;
          const nLen = Math.sqrt(nx*nx + ny*ny);
          
          if (nLen < 0.0001) {
            newPts.push([curr[0] + nx1 * offset, curr[1] + ny1 * offset]);
          } else {
            nx /= nLen;
            ny /= nLen;
            const dot = nx * nx1 + ny * ny1; 
            const length = offset / dot;
            newPts.push([curr[0] + nx * length, curr[1] + ny * length]);
          }
        }
        
        output = { ...splineData, points: newPts, foundationShape: 'custom' };
        break;
      }

      // ── Transform Spline ────────────────────────────────────────────────────
      case 'transform_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const tx = node.data.params.x || 0;
        const tz = node.data.params.z || 0;
        const scale = node.data.params.scale || 1;
        const rotDeg = node.data.params.rotation || 0;
        const rotRad = (rotDeg * Math.PI) / 180;
        const cosR = Math.cos(rotRad), sinR = Math.sin(rotRad);
        const newPts = (splineData.points as [number,number][]).map(p => {
          const sx = p[0] * scale;
          const sz = p[1] * scale;
          return [
            sx * cosR - sz * sinR + tx,
            sx * sinR + sz * cosR + tz,
          ] as [number, number];
        });
        const newZOffset = (splineData.zOffset || 0) + (node.data.params.y || 0);
        output = { ...splineData, points: newPts, zOffset: newZOffset, foundationShape: 'custom' };
        break;
      }
      case 'mirror_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const axis   = node.data.params.axis   || 'x';
        const offset = node.data.params.offset || 0;

        const mirrored = splineData.points.map((p: any) => {
          if (axis === 'x') return [-p[0] + offset * 2, p[1]];
          else              return [p[0], -p[1] + offset * 2];
        });

        const merged = [...splineData.points, ...mirrored.reverse()];
        output = { ...splineData, points: merged, foundationShape: 'custom' };
        break;
      }
      case 'smooth_spline': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const pts = splineData.points as [number, number][];
        
        // Convert to THREE.Vector3 array for SplineCurve or CatmullRomCurve3
        const vecs = pts.map(p => new THREE.Vector3(p[0], 0, p[1]));
        
        const isClosed = node.data.params.closed !== false;
        const tension = node.data.params.tension !== undefined ? node.data.params.tension : 0.5;
        const resolution = node.data.params.points || 50;
        
        const curve = new THREE.CatmullRomCurve3(vecs, isClosed, 'catmullrom', tension);
        const interpolated = curve.getPoints(resolution);
        
        // Remove the last point if closed (since getPoints duplicates the first point at the end)
        if (isClosed && interpolated.length > 1) {
          interpolated.pop();
        }
        
        const newPts = interpolated.map(p => [p.x, p.z] as [number, number]);
        output = { ...splineData, points: newPts, foundationShape: 'custom' };
        break;
      }
      case 'railing': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        
        const height = node.data.params.height || 1.0;
        const type = node.data.params.type || 'glass';
        
        output = [{
          type: 'railing_mesh',
          spline: splineData.points,
          height,
          railingType: type,
          zOffset: splineData.zOffset || 0
        }];
        break;
      }

      // ── Math Node ────────────────────────────────────────────────────────────
      case 'math_node': {
        const aRaw = inputs.find(i => i.handle === 'float')?.data;
        const bRaw = inputs.find(i => i.handle === 'float' && i !== inputs.find(j => j.handle === 'float'))?.data;
        const allFloat = inputs.filter(i => i.handle === 'float');
        const a = (typeof allFloat[0]?.data === 'number' ? allFloat[0].data : node.data.params.valueA) ?? 1;
        const b = (typeof allFloat[1]?.data === 'number' ? allFloat[1].data : node.data.params.valueB) ?? 1;
        const op = node.data.params.operation || 'multiply';

        let result = 0;
        switch (op) {
          case 'add':      result = a + b; break;
          case 'subtract': result = a - b; break;
          case 'multiply': result = a * b; break;
          case 'divide':   result = b !== 0 ? a / b : 0; break;
          case 'max':      result = Math.max(a, b); break;
          case 'min':      result = Math.min(a, b); break;
          case 'power':    result = Math.pow(a, b); break;
          default:         result = a * b;
        }
        output = result;
        break;
      }

      // ── Merge Mesh ───────────────────────────────────────────────────────────
      case 'merge_mesh': {
        // Collect all mesh inputs and flatten them into one array
        const meshInputs = inputs.filter(i => i.handle === 'mesh');
        const all: any[] = [];
        meshInputs.forEach(mi => {
          if (Array.isArray(mi.data)) all.push(...mi.data);
          else if (mi.data) all.push(mi.data);
        });
        output = all.length > 0 ? all : null;
        break;
      }

      case 'scatter_points': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;

        const count    = Math.floor(node.data.params.count    || 20);
        const seed     = node.data.params.seed     || 42;
        const minScale = node.data.params.minScale || 0.8;
        const maxScale = node.data.params.maxScale || 1.2;
        const pts      = splineData.points;

        const minX = Math.min(...pts.map((p: any) => p[0]));
        const maxX = Math.max(...pts.map((p: any) => p[0]));
        const minZ = Math.min(...pts.map((p: any) => p[1]));
        const maxZ = Math.max(...pts.map((p: any) => p[1]));

        const rand = (s: number) => {
          const x = Math.sin(s) * 43758.5453123;
          return x - Math.floor(x);
        };

        const pointInPolygon = (x: number, z: number, polygon: [number, number][]) => {
          let inside = false;
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], zi = polygon[i][1];
            const xj = polygon[j][0], zj = polygon[j][1];
            const intersect = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        };

        const distToSegment = (px: number, pz: number, x1: number, z1: number, x2: number, z2: number) => {
          const C = x2 - x1; const D = z2 - z1;
          const dot = (px - x1) * C + (pz - z1) * D;
          const len_sq = C * C + D * D;
          let param = -1;
          if (len_sq !== 0) param = dot / len_sq;
          let xx, zz;
          if (param < 0) { xx = x1; zz = z1; }
          else if (param > 1) { xx = x2; zz = z2; }
          else { xx = x1 + param * C; zz = z1 + param * D; }
          const dx = px - xx; const dz = pz - zz;
          return Math.sqrt(dx * dx + dz * dz);
        };

        const margin = 20; // Scatter around the building
        const sMinX = minX - margin;
        const sMaxX = maxX + margin;
        const sMinZ = minZ - margin;
        const sMaxZ = maxZ + margin;

        const scattered: any[] = [];
        let attempts = 0;
        let validFound = 0;

        while (validFound < count && attempts < count * 50) {
          const rx = rand(seed + attempts * 3.1)    * (sMaxX - sMinX) + sMinX;
          const rz = rand(seed + attempts * 7.7 + 1) * (sMaxZ - sMinZ) + sMinZ;
          const sc = rand(seed + attempts * 13.3 + 2) * (maxScale - minScale) + minScale;
          const ry = rand(seed + attempts * 5.5 + 3)  * Math.PI * 2;
          
          attempts++;
          
          // 1. Must not be inside the building
          if (pointInPolygon(rx, rz, pts)) continue;
          
          // 2. Must not be too close to the walls (clipping)
          let tooClose = false;
          for (let i = 0; i < pts.length; i++) {
             const next = pts[(i + 1) % pts.length];
             if (distToSegment(rx, rz, pts[i][0], pts[i][1], next[0], next[1]) < 3.0) {
                tooClose = true;
                break;
             }
          }
          if (tooClose) continue;

          scattered.push({
            type: 'scatter_instance',
            position: [rx, splineData.zOffset || 0, rz],
            scale: sc,
            rotation: ry,
          });
          validFound++;
        }
        output = scattered;
        break;
      }

      // ── Castle Wall (Battlements) ─────────────────────────────────────────────
      case 'castle_wall': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const {
          height = 8.0, thickness = 2.0,
          merlonWidth = 1.2, merlonHeight = 1.5, merlonSpacing = 2.4,
          material = 'worn_stone', zOffset = 0, hasMachicolations = false
        } = node.data.params;
        const baseZ = (splineData.zOffset || 0) + zOffset;
        const pts = splineData.points as [number, number][];
        const wallParts: any[] = [];

        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          const dx = p2[0] - p1[0];
          const dz = p2[1] - p1[1];
          const segLen = Math.sqrt(dx * dx + dz * dz);
          const angle = Math.atan2(dz, dx);
          const midX = (p1[0] + p2[0]) / 2;
          const midZ = (p1[1] + p2[1]) / 2;

          // Wall body
          wallParts.push({
            type: 'castle_wall_segment',
            position: [midX, baseZ, midZ],
            rotation: [0, -angle, 0],
            length: segLen,
            height,
            thickness,
            material,
          });

          // Merlons (crenellations) along top
          const merlonGap = merlonWidth + merlonSpacing;
          const merlonCount = Math.floor(segLen / merlonGap);
          for (let m = 0; m < merlonCount; m++) {
            const t = (m + 0.5) / merlonCount;
            const nx = p1[0] + dx * t;
            const nz = p1[1] + dz * t;
            wallParts.push({
              type: 'castle_merlon',
              position: [nx, baseZ + height, nz],
              rotation: [0, -angle, 0],
              width: merlonWidth,
              height: merlonHeight,
              thickness: thickness + 0.2,
              material,
            });
          }

          // Machicolations (corbelled projection at top)
          if (hasMachicolations) {
            wallParts.push({
              type: 'castle_machicolation',
              position: [midX, baseZ + height - 0.4, midZ],
              rotation: [0, -angle, 0],
              length: segLen,
              material,
            });
          }
        }
        output = wallParts;
        break;
      }

      // ── Tower ─────────────────────────────────────────────────────────────────
      case 'tower': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        const {
          radius = 4.0, height = 20.0, topType = 'crenellated',
          material = 'worn_stone', zOffset = 0, segments = 16,
          wallThickness = 0.8, conicalHeight = 5.0, conicalColor = '#5a3a2a'
        } = node.data.params;

        // If spline connected, place tower at each corner point
        let positions: [number, number][] = [[0, 0]];
        const baseZ = (splineData?.zOffset || 0) + zOffset;
        if (splineData?.points) {
          positions = (splineData.points as [number, number][]);
        }

        const towerParts: any[] = [];
        positions.forEach((pos, ti) => {
          towerParts.push({
            type: 'tower_mesh',
            position: [pos[0], baseZ, pos[1]],
            radius,
            height,
            topType,
            material,
            segments,
            wallThickness,
            conicalHeight,
            conicalColor,
            id: ti,
          });
        });
        output = towerParts;
        break;
      }

      // ── Bridge ────────────────────────────────────────────────────────────────
      case 'bridge': {
        const {
          span = 40.0, width = 8.0, deckHeight = 0.6,
          archCount = 3, archHeight = 8.0, bridgeType = 'arch',
          material = 'sandstone', deckMaterial = 'concrete',
          pylonHeight = 18.0, zOffset = 0
        } = node.data.params;

        const parts: any[] = [];
        const spanPerArch = span / archCount;

        // Bridge Deck
        parts.push({
          type: 'bridge_deck',
          position: [0, zOffset + archHeight, 0],
          span,
          width,
          deckHeight,
          material: deckMaterial,
        });

        if (bridgeType === 'arch') {
          // Arch piers and arches
          for (let a = 0; a < archCount; a++) {
            const xOffset = -span / 2 + spanPerArch * a + spanPerArch / 2;
            parts.push({
              type: 'bridge_arch',
              position: [xOffset, zOffset, 0],
              span: spanPerArch,
              height: archHeight,
              width,
              material,
            });
          }
          // Piers at each junction
          for (let p = 1; p < archCount; p++) {
            const px = -span / 2 + spanPerArch * p;
            parts.push({
              type: 'bridge_pier',
              position: [px, zOffset, 0],
              height: archHeight,
              width,
              material,
            });
          }
        } else if (bridgeType === 'suspension' || bridgeType === 'cable') {
          // Pylons
          parts.push({
            type: 'bridge_pylon',
            position: [-span * 0.25, zOffset, 0],
            height: pylonHeight,
            width,
            bridgeType,
            material,
          });
          parts.push({
            type: 'bridge_pylon',
            position: [span * 0.25, zOffset, 0],
            height: pylonHeight,
            width,
            bridgeType,
            material,
          });
          // Deck
          parts.push({
            type: 'bridge_deck',
            position: [0, zOffset + pylonHeight * 0.35, 0],
            span,
            width,
            deckHeight,
            material: deckMaterial,
            bridgeType,
          });
        } else {
          // Flat bridge - just supports
          for (let p = 0; p <= archCount; p++) {
            const px = -span / 2 + (span / archCount) * p;
            parts.push({
              type: 'bridge_pier',
              position: [px, zOffset, 0],
              height: archHeight * 0.6,
              width,
              material,
            });
          }
        }
        output = parts;
        break;
      }

      // ── Gate Arch ────────────────────────────────────────────────────────────
      case 'gate_arch': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        const {
          width: gWidth = 6.0, height: gHeight = 8.0, thickness: gThick = 3.0,
          archType = 'pointed', material = 'worn_stone', zOffset = 0,
          towerWidth = 4.0, towerHeight = 14.0
        } = node.data.params;
        const baseZ = (splineData?.zOffset || 0) + zOffset;

        // Find front-center from spline or use origin
        let cx = 0, cz = 0;
        if (splineData?.points && splineData.points.length >= 2) {
          const pts = splineData.points as [number, number][];
          // Use segment 2 (front face) midpoint
          const idx = Math.floor(pts.length * 0.25);
          const p1 = pts[idx], p2 = pts[(idx + 1) % pts.length];
          cx = (p1[0] + p2[0]) / 2;
          cz = (p1[1] + p2[1]) / 2;
        }

        output = [{
          type: 'gate_arch_mesh',
          position: [cx, baseZ, cz],
          width: gWidth,
          height: gHeight,
          thickness: gThick,
          archType,
          material,
          towerWidth,
          towerHeight,
        }];
        break;
      }

      // ── Terrain ───────────────────────────────────────────────────────────────
      case 'terrain': {
        const {
          width: tW = 200, depth: tD = 200, segments: tSeg = 40,
          maxHeight = 12.0, seed = 42, material = 'grass'
        } = node.data.params;
        output = [{
          type: 'terrain_mesh',
          width: tW,
          depth: tD,
          segments: tSeg,
          maxHeight,
          seed,
          material,
        }];
        break;
      }

      // ── Spire ────────────────────────────────────────────────────────────────
      case 'spire': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        const {
          baseRadius = 1.5, height: sHeight = 20.0, segments: sSeg = 8,
          material = 'dark_metal', color: sColor = '#2a2a3a', zOffset: sZ = 0
        } = node.data.params;
        const baseZOff = (splineData?.zOffset || 0) + sZ;

        // Place spire at centroid of spline, or origin
        let cx = 0, cz = 0;
        if (splineData?.points) {
          const pts = splineData.points as [number, number][];
          pts.forEach(p => { cx += p[0]; cz += p[1]; });
          cx /= pts.length; cz /= pts.length;
        }
        output = [{
          type: 'spire_mesh',
          position: [cx, baseZOff, cz],
          baseRadius,
          height: sHeight,
          segments: sSeg,
          material,
          color: sColor,
        }];
        break;
      }

      // ── Buttress ─────────────────────────────────────────────────────────────
      case 'buttress': {
        const splineData = inputs.find(i => i.handle === 'spline')?.data;
        if (!splineData || !Array.isArray(splineData.points)) break;
        const {
          span: bSpan = 5.0, height: bH = 12.0, thickness: bThick = 0.8,
          material = 'limestone', zOffset: bZ = 0
        } = node.data.params;
        const baseZ = (splineData.zOffset || 0) + bZ;
        const pts = splineData.points as [number, number][];
        const buttressParts: any[] = [];

        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          // Normal direction (outward)
          const dx = p2[0] - p1[0];
          const dz = p2[1] - p1[1];
          const len = Math.sqrt(dx * dx + dz * dz);
          const nx = -dz / len;
          const nz = dx / len;
          const angle = Math.atan2(dz, dx);
          // Midpoint
          const midX = (p1[0] + p2[0]) / 2 + nx * bSpan * 0.5;
          const midZ = (p1[1] + p2[1]) / 2 + nz * bSpan * 0.5;

          buttressParts.push({
            type: 'buttress_mesh',
            position: [midX, baseZ, midZ],
            rotation: [0, -angle, 0],
            span: bSpan,
            height: bH,
            thickness: bThick,
            material,
          });
        }
        output = buttressParts;
        break;
      }

      // ── Pyramid ───────────────────────────────────────────────────────────────
      case 'pyramid': {
        const {
          baseWidth = 30.0, baseDepth = 30.0, height: pyH = 20.0,
          steps = 0, material = 'sandstone'
        } = node.data.params;
        output = [{
          type: 'pyramid_mesh',
          position: [0, 0, 0],
          baseWidth,
          baseDepth,
          height: pyH,
          steps,
          material,
        }];
        break;
      }

      // ── Road Grid ────────────────────────────────────────────────────────────
      case 'road_grid': {
        const {
          blocksX = 4, blocksZ = 4,
          blockWidth = 40, blockDepth = 40,
          roadWidth = 10, sidewalkWidth = 2.5,
          style = 'modern', addLaneMarkings = true, addSidewalks = true,
        } = node.data.params;

        const parts: any[] = [];
        const totalW = blocksX * blockWidth + (blocksX + 1) * roadWidth;
        const totalD = blocksZ * blockDepth + (blocksZ + 1) * roadWidth;
        const cx = totalW / 2;
        const cz = totalD / 2;

        const roadMat = style === 'cyberpunk' ? 'asphalt' : style === 'western' ? 'dirt' : 'asphalt';
        const sidewalkMat = style === 'western' ? 'weathered_wood' : style === 'medieval' ? 'sandstone' : 'wet_concrete';

        // Horizontal road strips (along X)
        for (let rz = 0; rz <= blocksZ; rz++) {
          const zPos = rz * (blockDepth + roadWidth) - cz + roadWidth / 2;
          parts.push({
            type: 'road_segment',
            position: [0, 0, zPos],
            length: totalW,
            width: roadWidth,
            direction: 'x',
            material: roadMat,
            style,
          });
          if (addSidewalks) {
            parts.push({
              type: 'sidewalk_segment',
              position: [0, 0.12, zPos - roadWidth / 2 - sidewalkWidth / 2],
              length: totalW,
              width: sidewalkWidth,
              direction: 'x',
              material: sidewalkMat,
            });
            parts.push({
              type: 'sidewalk_segment',
              position: [0, 0.12, zPos + roadWidth / 2 + sidewalkWidth / 2],
              length: totalW,
              width: sidewalkWidth,
              direction: 'x',
              material: sidewalkMat,
            });
          }
          if (addLaneMarkings && style !== 'western' && style !== 'medieval') {
            parts.push({
              type: 'lane_marking',
              position: [0, 0.01, zPos],
              length: totalW,
              direction: 'x',
            });
          }
        }

        // Vertical road strips (along Z)
        for (let rx = 0; rx <= blocksX; rx++) {
          const xPos = rx * (blockWidth + roadWidth) - cx + roadWidth / 2;
          parts.push({
            type: 'road_segment',
            position: [xPos, 0, 0],
            length: totalD,
            width: roadWidth,
            direction: 'z',
            material: roadMat,
            style,
          });
          if (addSidewalks) {
            parts.push({
              type: 'sidewalk_segment',
              position: [xPos - roadWidth / 2 - sidewalkWidth / 2, 0.12, 0],
              length: totalD,
              width: sidewalkWidth,
              direction: 'z',
              material: sidewalkMat,
            });
            parts.push({
              type: 'sidewalk_segment',
              position: [xPos + roadWidth / 2 + sidewalkWidth / 2, 0.12, 0],
              length: totalD,
              width: sidewalkWidth,
              direction: 'z',
              material: sidewalkMat,
            });
          }
        }

        output = parts;
        break;
      }

      // ── City Block ────────────────────────────────────────────────────────────
      case 'city_block': {
        const {
          width: cbW = 40, depth: cbD = 40,
          style: cbStyle = 'modern',
          density = 0.75,
          minHeight = 8, maxHeight = 60,
          minFloors = 2, maxFloors = 15,
          seed: cbSeed = 42,
          setbackMin = 1, setbackMax = 3,
          material: cbMat = 'concrete',
          roofType: cbRoof = 'flat',
        } = node.data.params;

        // Seeded PRNG
        const rand = (s: number) => {
          const x = Math.sin(s + cbSeed * 9.7) * 43758.5453;
          return x - Math.floor(x);
        };

        // Style-based material palettes
        const palettes: Record<string, string[]> = {
          modern:    ['concrete', 'glass', 'dark_metal', 'metal', 'wet_concrete'],
          cyberpunk: ['wet_concrete', 'rust_panel', 'dark_metal', 'neon_blue', 'neon_pink'],
          western:   ['weathered_wood', 'painted_wood', 'cracked_plaster', 'mud_brick', 'red_barn'],
          medieval:  ['worn_stone', 'limestone', 'sandstone', 'dry_stone', 'granite'],
        };
        const roofPalettes: Record<string, string[]> = {
          modern:    ['flat', 'flat', 'pitched'],
          cyberpunk: ['flat', 'flat', 'flat'],
          western:   ['gable', 'shed', 'gable', 'pitched'],
          medieval:  ['gable', 'pitched', 'gable'],
        };

        const palette = palettes[cbStyle] || palettes.modern;
        const roofPal = roofPalettes[cbStyle] || roofPalettes.modern;

        const parts: any[] = [];
        // Generate building footprints within the block
        // Strategy: divide block into a grid of slots, randomly skip some
        const cols = Math.max(2, Math.round((cbW / 15) * density * 1.5));
        const rows = Math.max(2, Math.round((cbD / 15) * density * 1.5));
        const slotW = cbW / cols;
        const slotD = cbD / rows;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const si = row * cols + col;
            if (rand(si * 3.7) > density) continue; // Skip based on density

            const setback = setbackMin + rand(si * 1.3) * (setbackMax - setbackMin);
            const bW = slotW - setback * 2;
            const bD = slotD - setback * 2;
            if (bW < 4 || bD < 4) continue;

            const floors = minFloors + Math.floor(rand(si * 2.1) * (maxFloors - minFloors + 1));
            const floorH = 3.0 + rand(si * 4.3) * 1.5;
            const bH = Math.min(maxHeight, Math.max(minHeight, floors * floorH));
            const matIdx = Math.floor(rand(si * 5.9) * palette.length);
            const mat = palette[matIdx];
            const roofIdx = Math.floor(rand(si * 7.1) * roofPal.length);
            const rType = roofPal[roofIdx];

            // Position within block (centered at 0,0)
            const px = -cbW / 2 + col * slotW + slotW / 2;
            const pz = -cbD / 2 + row * slotD + slotD / 2;

            // Roof color by style
            const roofColors: Record<string, string> = {
              modern: '#1a1a1a', cyberpunk: '#0a0a0c',
              western: '#3a2010', medieval: '#4a3a2a',
            };
            const roofCol = roofColors[cbStyle] || '#1a1a1a';

            parts.push({
              type: 'city_building',
              position: [px, 0, pz],
              width: bW,
              depth: bD,
              floors,
              floorHeight: floorH,
              totalHeight: bH,
              material: mat,
              roofType: rType,
              roofColor: roofCol,
              style: cbStyle,
              // Neon accents for cyberpunk
              hasNeon: cbStyle === 'cyberpunk' && rand(si * 11.3) > 0.5,
              neonColor: rand(si * 13.7) > 0.5 ? 'neon_blue' : 'neon_pink',
            });
          }
        }

        output = parts;
        break;
      }
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
