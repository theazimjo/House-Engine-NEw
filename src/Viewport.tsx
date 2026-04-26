import React, { useMemo, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid, GizmoHelper, GizmoViewport, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { ProceduralWall } from './engine/ProceduralWall';
import { materialLib } from './engine/MaterialLibrary';
import { processGraph } from './engine/graphProcessor';
import type { ViewportProps } from './types';
import { ViewportOverlay } from './components/ViewportOverlay';

// ── Camera Controller (for presets) ──────────────────────────────────────────
const CameraController = forwardRef<any, { preset: string | null; onDone: () => void }>(
  ({ preset, onDone }, ref) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    React.useImperativeHandle(ref, () => controlsRef.current);

    React.useEffect(() => {
      if (!preset || !controlsRef.current) return;

      const dist = 35;
      const ctrl = controlsRef.current;
      let pos: [number, number, number] = [25, 25, 25];

      switch (preset) {
        case 'top':         pos = [0, dist * 1.5, 0.01]; break;
        case 'front':       pos = [0, dist * 0.4, dist]; break;
        case 'right':       pos = [dist, dist * 0.4, 0]; break;
        case 'reset':
        case 'perspective': pos = [25, 25, 25]; break;
      }

      camera.position.set(...pos);
      ctrl.target.set(0, 8, 0);
      ctrl.update();
      onDone();
    }, [preset, camera, onDone]);

    return <OrbitControls ref={controlsRef} makeDefault minDistance={5} maxDistance={1000} target={[0, 8, 0]} />;
  }
);
CameraController.displayName = 'CameraController';

// ── Building Renderer ────────────────────────────────────────────────────────
export const BuildingRenderer = ({ nodes, edges, wireframe }: ViewportProps & { wireframe?: boolean }) => {
  // Stringify node data (ignoring positions) and edges to prevent re-renders when simply dragging nodes
  const nodesDataStr = useMemo(() => JSON.stringify(nodes.map(n => ({ id: n.id, data: n.data, type: n.type }))), [nodes]);
  const edgesStr = useMemo(() => JSON.stringify(edges.map(e => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }))), [edges]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processedBuilding = useMemo(() => processGraph(nodes, edges), [nodesDataStr, edgesStr]);

  const renderedElements = useMemo(() => {
    return processedBuilding.map((part: any, idx: number) => {
      if (!part) return null;

        const elements: React.ReactNode[] = [];
        const {
          spline, floors = 1, floorHeight = 3,
          wallThickness = 0.2,
          style, offset = [0, 0, 0],
          twist, taper = 1, shear, jitter = 0,
          zOffset = 0
        } = part;
        const [ox, oy_orig, oz] = offset;
        const oy = oy_orig + zOffset;
        const isModern = style === 'modern';

        // ── Detailed Floors ──
        if (part.detailed && spline) {
          for (let f = 0; f < floors; f++) {
            const t = f / Math.max(1, floors - 1);
            const wSpacing = part.winSpacing || 2.5;
            const wSize: [number, number] = [part.winWidth || 1.2, part.winHeight || 1.8];

            let currentTwist = 0;
            if (twist) {
              currentTwist = t < 0.5
                ? THREE.MathUtils.lerp(twist.base, twist.mid, t * 2)
                : THREE.MathUtils.lerp(twist.mid, twist.top, (t - 0.5) * 2);
            }
            const rotationRad = (currentTwist * Math.PI) / 180;
            const currentScale = THREE.MathUtils.lerp(1, taper, t);
            const shearOffsetX = shear ? shear.x * t : 0;
            const shearOffsetZ = shear ? shear.y * t : 0;
            const jitterX = (Math.random() - 0.5) * jitter;
            const jitterZ = (Math.random() - 0.5) * jitter;
            const floorY = f * floorHeight + oy;

            const rotatePoint = (pt: [number, number]): [number, number] => {
              const s = Math.sin(rotationRad);
              const c = Math.cos(rotationRad);
              const rx = pt[0] * currentScale;
              const rz = pt[1] * currentScale;
              return [rx * c - rz * s, rx * s + rz * c];
            };

            // Corner pillars
            spline.forEach((p: any, pIdx: number) => {
              const pRot = rotatePoint(p);
              elements.push(
                <mesh
                  key={`pillar-${idx}-${f}-${pIdx}`}
                  position={[pRot[0] + ox + shearOffsetX + jitterX, floorY + floorHeight / 2, pRot[1] + oz + shearOffsetZ + jitterZ]}
                >
                  <boxGeometry args={[wallThickness * 1.1, floorHeight, wallThickness * 1.1]} />
                  <meshStandardMaterial color="#ccc" wireframe={wireframe} />
                </mesh>
              );
            });

            // Walls
            spline.forEach((p: any, i: number) => {
              const next = spline[(i + 1) % spline.length];

              let shouldHaveDoor = false;
              if (f === 0) {
                if (part.doorSegmentIndex !== undefined) {
                  shouldHaveDoor = i === part.doorSegmentIndex;
                } else {
                  const side = part.doorSide || 'front';
                  if (side === 'all') shouldHaveDoor = true;
                  else if (side === 'front'     && i === 0) shouldHaveDoor = true;
                  else if (side === 'frontback' && (i === 0 || i === Math.floor(spline.length / 2))) shouldHaveDoor = true;
                  else if (side === 'sides'     && (i === Math.floor(spline.length / 4) || i === Math.floor(spline.length * 3 / 4))) shouldHaveDoor = true;
                }
              }

              const pRot = rotatePoint(p);
              const nextRot = rotatePoint(next);
              const dx = nextRot[0] - pRot[0];
              const dz = nextRot[1] - pRot[1];
              const len = Math.sqrt(dx * dx + dz * dz);
              const angle = Math.atan2(dx, dz);

              elements.push(
                <group
                  key={`wall-${idx}-${f}-${i}`}
                  position={[pRot[0] + dx / 2 + ox + shearOffsetX + jitterX, floorY, pRot[1] + dz / 2 + oz + shearOffsetZ + jitterZ]}
                  rotation={[0, angle + Math.PI / 2, 0]}
                >
                  <ProceduralWall
                    width={len} height={floorHeight} thickness={wallThickness || 0.25}
                    windowSpacing={wSpacing} windowSize={wSize} sillHeight={0.9}
                    isModern={isModern}
                    hasDoor={shouldHaveDoor}
                    doorWidth={part.doorWidth  || 1.8}
                    doorHeight={part.doorHeight || 2.4}
                    doorOffset={part.doorOffset || 0}
                    windowType={part.windowType}
                    doorType={part.doorType}
                    materialType={part.material}
                    hasBalcony={part.hasBalcony && f > 0}
                    hasRibs={part.hasRibs}
                    plinthHeight={f === 0 ? part.plinthHeight : 0}
                  />
                </group>
              );
            });
          }
        }

        // ── Roof ──
        if (part.roof && spline) {
          const roofY = (part.baseHeight || 0) + oy;
          const { roofType, overhang = 0.5, color = '#8e2b2b', deformation, height = 2, foundationShape } = part;
          const { twist: rTwist = { base: 0, mid: 0, top: 0 }, taper: rTaper = 1 } = deformation || {};

          const buildCustomRoof = (bRaw: number[][], rRaw: number[][], quads: number[][], tris: number[][], meshIdx: string) => {
            const roofH = roofType === 'flat' ? 0.1 : height;
            const t = 1.0;
            const rotationRad = (rTwist.base + (rTwist.mid - rTwist.base) * t + (rTwist.top - rTwist.mid) * t) * (Math.PI / 180);
            const currentScale = 1.0 + (rTaper - 1.0) * t;

            const applyDef = (p: number[], isBase: boolean) => {
               const scale = isBase ? 1.0 : currentScale;
               const sx = p[0] * scale;
               const sy = p[1] * scale;
               const s = Math.sin(rotationRad);
               const c = Math.cos(rotationRad);
               return [sx * c - sy * s, -(sx * s + sy * c)];
            };

            const bPts = bRaw.map(p => applyDef(p, true));
            const rPts = rRaw.map(p => applyDef(p, false));

            const vertices: number[] = [];
            const pushTri = (p1: number[], p2: number[], p3: number[], h1: number, h2: number, h3: number) => {
               vertices.push(p1[0], p1[1], h1, p2[0], p2[1], h2, p3[0], p3[1], h3);
            };
            const pushQuad = (p1: number[], p2: number[], p3: number[], p4: number[]) => {
               pushTri(p1, p2, p3, 0, 0, roofH);
               pushTri(p1, p3, p4, 0, roofH, roofH);
            };

            quads.forEach(q => pushQuad(bPts[q[0]], bPts[q[1]], rPts[q[2]], rPts[q[3]]));
            tris.forEach(t => pushTri(bPts[t[0]], bPts[t[1]], rPts[t[2]], 0, 0, roofH));

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const uvs: number[] = [];
            for (let i = 0; i < vertices.length; i += 3) uvs.push(vertices[i] * 0.5, vertices[i + 1] * 0.5);
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.computeVertexNormals();
            const roofMat = wireframe ? new THREE.MeshStandardMaterial({ color, wireframe: true }) : materialLib.getMaterial('roof_tiles', color);
            return <mesh key={meshIdx} position={[ox, roofY + 0.01, oz]} rotation={[-Math.PI / 2, 0, 0]} castShadow geometry={geometry} material={roofMat} />;
          };

          if (foundationShape === 'U-shape' && spline.length >= 8) {
            const w2 = spline[1][0]; const d2 = spline[1][1];
            const w2_ut = spline[3][0]; const d2_ut = spline[4][1];
            const ut2 = (w2 - w2_ut) / 2;
            const o = overhang;

            const bPts = [
              [-w2 - o, -d2], [-w2 - o, d2 + o], [w2 + o, d2 + o], [w2 + o, -d2],
              [w2_ut - o, -d2], [w2_ut - o, d2_ut - o], [-w2 + (w2-w2_ut) + o, d2_ut - o], [-w2 + (w2-w2_ut) + o, -d2]
            ];
            const fy = roofType === 'hip' ? -d2 + ut2 : -d2;
            const rPts = [
              [-w2 + ut2, fy], [-w2 + ut2, d2 - ut2], [w2 - ut2, d2 - ut2], [w2 - ut2, fy]
            ];
            const quads = [[0, 1, 1, 0], [1, 2, 2, 1], [2, 3, 3, 2], [4, 5, 2, 3], [5, 6, 1, 2], [6, 7, 0, 1]];
            const tris = [[3, 4, 3], [7, 0, 0]];
            elements.push(buildCustomRoof(bPts, rPts, quads, tris, `roof-${idx}-u`));
          } else if (foundationShape === 'L-shape' && spline.length >= 6) {
            const w2 = spline[1][0]; const d2 = spline[1][1];
            const lt_val = spline[4][0] + w2; 
            const lt2_val = lt_val / 2;
            const d2_lt = spline[3][1];
            const o = overhang;

            const bPts = [
              [-w2 - o, d2 + o], [w2, d2 + o], [w2, d2_lt - o], 
              [-w2 + lt_val + o, d2_lt - o], [-w2 + lt_val + o, -d2], [-w2 - o, -d2]
            ];
            const rPts = [
              [-w2 + lt2_val, d2 - lt2_val], 
              [roofType === 'hip' ? w2 - lt2_val : w2, d2 - lt2_val], 
              [-w2 + lt2_val, roofType === 'hip' ? -d2 + lt2_val : -d2]
            ];
            const quads = [[5, 0, 0, 2], [0, 1, 1, 0], [2, 3, 0, 1], [3, 4, 2, 0]];
            const tris = [[1, 2, 1], [4, 5, 2]];
            elements.push(buildCustomRoof(bPts, rPts, quads, tris, `roof-${idx}-l`));
          } else if (foundationShape === 'C-shape' && spline.length >= 8) {
            const w2 = spline[0][0]; const d2 = spline[0][1];
            const d2_ct = spline[1][1];
            const ct_val = d2 - d2_ct;
            const ct2_val = ct_val / 2;
            const o = overhang;

            const bPts = [
              [w2, d2 + o], [w2, d2_ct - o], [-w2 + ct_val + o, d2_ct - o], [-w2 + ct_val + o, -d2 + ct_val + o],
              [w2, -d2 + ct_val + o], [w2, -d2 - o], [-w2 - o, -d2 - o], [-w2 - o, d2 + o]
            ];
            const rPts = [
              [roofType === 'hip' ? w2 - ct2_val : w2, d2 - ct2_val], 
              [-w2 + ct2_val, d2 - ct2_val], 
              [-w2 + ct2_val, -d2 + ct2_val], 
              [roofType === 'hip' ? w2 - ct2_val : w2, -d2 + ct2_val]
            ];
            const quads = [[1, 2, 1, 0], [2, 3, 2, 1], [3, 4, 3, 2], [5, 6, 2, 3], [6, 7, 1, 2], [7, 0, 0, 1]];
            const tris = [[0, 1, 0], [4, 5, 3]];
            elements.push(buildCustomRoof(bPts, rPts, quads, tris, `roof-${idx}-c`));
          } else {
            // General logic for standard rectangles and polygons
            const buildRoofMesh = (pts: [number, number][], ridgeAxis: 'z' | 'x' | 'center', meshIdx: string) => {
              const cx = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
              const cz = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
              const t = 1.0;
              const rotationRad = (rTwist.base + (rTwist.mid - rTwist.base) * t + (rTwist.top - rTwist.mid) * t) * (Math.PI / 180);
              const currentScale = 1.0 + (rTaper - 1.0) * t;

              const getTP = (p: [number, number], sx: number, sz: number, isBase: boolean) => {
                const localX = p[0] - cx; const localZ = p[1] - cz;
                const scaledX = localX * currentScale * sx; const scaledZ = localZ * currentScale * sz;
                let rox = 0, roz = 0;
                if (isBase && overhang > 0) {
                   const mag = Math.sqrt(localX * localX + localZ * localZ);
                   if (mag > 0) { rox = (localX / mag) * overhang; roz = (localZ / mag) * overhang; }
                }
                const finalX = scaledX + rox; const finalZ = scaledZ + roz;
                const s = Math.sin(rotationRad); const c = Math.cos(rotationRad);
                return [finalX * c - finalZ * s + cx, -(finalX * s + finalZ * c + cz)];
              };

              let topSX = 1.0, topSZ = 1.0;
              if (roofType === 'hip' || ridgeAxis === 'center') { topSX = 0.05; topSZ = 0.05; }
              else if (roofType === 'gable' || roofType === 'pitched') {
                if (ridgeAxis === 'z') { topSX = 0.01; topSZ = 1.0; }
                else { topSX = 1.0; topSZ = 0.01; }
              }
              else if (roofType === 'mansard') { topSX = 0.6; topSZ = 0.6; }

              const basePoints = pts.map(p => getTP(p, 1.0, 1.0, true));
              const topPoints = pts.map(p => getTP(p, topSX, topSZ, false));
              const roofH = roofType === 'flat' ? 0.1 : height;

              const vertices: number[] = [];
              for (let i = 0; i < basePoints.length; i++) {
                const next = (i + 1) % basePoints.length;
                const p1B = basePoints[i]; const p2B = basePoints[next];
                const p1T = roofType === 'shed' ? [p1B[0], p1B[1]] : topPoints[i];
                const p2T = roofType === 'shed' ? [p2B[0], p2B[1]] : topPoints[next];
                const h1 = roofType === 'shed' ? (pts[i][0] + 7) * 0.2 : roofH;
                const h2 = roofType === 'shed' ? (pts[next][0] + 7) * 0.2 : roofH;
                vertices.push(p1B[0], p1B[1], 0, p2B[0], p2B[1], 0, p2T[0], p2T[1], h2);
                vertices.push(p1B[0], p1B[1], 0, p2T[0], p2T[1], h2, p1T[0], p1T[1], h1);
              }
              const contour = topPoints.map(p => new THREE.Vector2(p[0], p[1]));
              let faces: number[][] = [];
              try {
                faces = THREE.ShapeUtils.triangulateShape(contour, []);
              } catch(e) {
                // fallback to fan if it fails
                for(let i=1; i<topPoints.length-1; i++) faces.push([0, i, i+1]);
              }
              for (let i = 0; i < faces.length; i++) {
                const face = faces[i];
                // Three.js triangulateShape returns indices.
                // We must ensure the normals point UP, so winding might need reverse.
                // Earcut usually returns CCW. We want CCW from top down, which is what we need.
                const h0 = roofType === 'shed' ? (pts[face[0]][0] + 7) * 0.2 : roofH;
                const h1 = roofType === 'shed' ? (pts[face[1]][0] + 7) * 0.2 : roofH;
                const h2 = roofType === 'shed' ? (pts[face[2]][0] + 7) * 0.2 : roofH;
                vertices.push(
                  topPoints[face[0]][0], topPoints[face[0]][1], h0,
                  topPoints[face[1]][0], topPoints[face[1]][1], h1,
                  topPoints[face[2]][0], topPoints[face[2]][1], h2
                );
              }

              const geometry = new THREE.BufferGeometry();
              geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
              const uvs: number[] = [];
              for (let i = 0; i < vertices.length; i += 3) uvs.push(vertices[i] * 0.5, vertices[i + 1] * 0.5);
              geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
              geometry.computeVertexNormals();
              const roofMat = wireframe ? new THREE.MeshStandardMaterial({ color, wireframe: true }) : materialLib.getMaterial('roof_tiles', color);
              return <mesh key={meshIdx} position={[ox, roofY + 0.01, oz]} rotation={[-Math.PI / 2, 0, 0]} castShadow geometry={geometry} material={roofMat} />;
            };
            elements.push(buildRoofMesh(spline, foundationShape === 'hexagon' || foundationShape === 'circle' ? 'center' : 'z', `roof-${idx}`));
          }
        }

        // ── Floor Slab ──
        if (part.type === 'floor_slab') {
          const { baseHeight = 0, floorIndex = 0 } = part;
          if (!spline) return null;
          
          const t = floorIndex / Math.max(1, floors - 1);
          let currentTwist = 0;
          if (twist) {
            currentTwist = t < 0.5
              ? THREE.MathUtils.lerp(twist.base, twist.mid, t * 2)
              : THREE.MathUtils.lerp(twist.mid, twist.top, (t - 0.5) * 2);
          }
          const rotationRad = (currentTwist * Math.PI) / 180;
          const currentScale = THREE.MathUtils.lerp(1, taper, t);
          const shearOffsetX = shear ? shear.x * t : 0;
          const shearOffsetZ = shear ? shear.y * t : 0;

          const shape = new THREE.Shape();
          spline.forEach((p: any, i: number) => { 
            const s = Math.sin(rotationRad);
            const c = Math.cos(rotationRad);
            const rx = p[0] * currentScale;
            const rz = p[1] * currentScale;
            const px = rx * c - rz * s;
            const pz = rx * s + rz * c;
            i === 0 ? shape.moveTo(px, -pz) : shape.lineTo(px, -pz); 
          });
          shape.closePath();
          return (
            <mesh key={`slab-${idx}`} position={[ox + shearOffsetX, oy + baseHeight + 0.02, oz + shearOffsetZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
              <meshStandardMaterial color="#333" roughness={0.7} wireframe={wireframe} />
            </mesh>
          );
        }



        // ── Plinth Mesh ──
        if (part.type === 'plinth_mesh') {
          const { spline: ps, height: ph, zOffset: pz = 0 } = part;
          if (!ps || ps.length < 3) return null;
          const pShape = new THREE.Shape();
          pShape.moveTo(ps[0][0], -ps[0][1]);
          ps.slice(1).forEach((p: any) => pShape.lineTo(p[0], -p[1]));
          pShape.closePath();
          return (
            <mesh key={`plinth-${idx}`} position={[ox || 0, (oy || 0) + pz, oz || 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <extrudeGeometry args={[pShape, { depth: ph, bevelEnabled: false }]} />
              <meshStandardMaterial color="#999" side={THREE.DoubleSide} roughness={0.5} metalness={0.2} wireframe={wireframe} />
            </mesh>
          );
        }

        // ── Stairs Step ──
        if (part.type === 'stairs_step') {
          const { position, rotation, args } = part;
          return (
            <mesh key={`stairs-${idx}`} position={[position[0], position[1] + args[1] / 2, position[2]]} rotation={rotation} castShadow receiveShadow>
              <boxGeometry args={args} />
              <meshStandardMaterial color="#666" wireframe={wireframe} />
            </mesh>
          );
        }

        // ── Column ──
        if (part.type === 'column') {
          const { position, radius, height, material = 'concrete' } = part;
          const colMat = wireframe
            ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(material);
          return (
            <mesh key={`col-${idx}`} position={[position[0], position[1] + height / 2, position[2]]} material={colMat} castShadow>
              <cylinderGeometry args={[radius, radius, height, 16]} />
            </mesh>
          );
        }

        // ── Primitives ──
        if (part.type === 'primitive_box') {
          return (
            <mesh key={`pbox-${idx}`} position={part.position} castShadow receiveShadow>
              <boxGeometry args={part.args} />
              <meshStandardMaterial color="#888" roughness={0.7} wireframe={wireframe} />
            </mesh>
          );
        }

        if (part.type === 'primitive_cylinder') {
          return (
            <mesh key={`pcyl-${idx}`} position={part.position} castShadow receiveShadow>
              <cylinderGeometry args={part.args} />
              <meshStandardMaterial color="#888" roughness={0.7} wireframe={wireframe} />
            </mesh>
          );
        }

        // ── Boolean Subtract ──
        if (part.type === 'boolean_subtract') {
           return (
             <group key={`csg-${idx}`}>
               <BuildingRenderer nodes={nodes} edges={edges} wireframe={wireframe} />
             </group>
           );
        }

        // ── Scatter Instance ──
        if (part.type === 'scatter_instance') {
          const { position, scale = 1, rotation: rot = 0 } = part;
          const h = 2.5 * scale;
          const r = 0.4 * scale;
          return (
            <group key={`scatter-${idx}`} position={[position[0], position[1], position[2]]} rotation={[0, rot, 0]}>
              {/* Trunk */}
              <mesh position={[0, h * 0.3, 0]} castShadow>
                <cylinderGeometry args={[r * 0.25, r * 0.35, h * 0.6, 6]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} wireframe={wireframe} />
              </mesh>
              {/* Canopy */}
              <mesh position={[0, h * 0.75, 0]} castShadow>
                <coneGeometry args={[r * 1.6, h * 0.7, 7]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.85} wireframe={wireframe} />
              </mesh>
              <mesh position={[0, h * 0.95, 0]} castShadow>
                <coneGeometry args={[r * 1.1, h * 0.55, 6]} />
                <meshStandardMaterial color="#388e3c" roughness={0.85} wireframe={wireframe} />
              </mesh>
            </group>
          );
        }

        // ── Full Volume / Foundation Slab ──
        if ((part.type === 'full_volume' || part.type === 'foundation_slab') && Array.isArray(spline) && spline.length > 0) {
          const slabShape = new THREE.Shape();
          slabShape.moveTo(spline[0][0], -spline[0][1]);
          spline.slice(1).forEach((p: any) => slabShape.lineTo(p[0], -p[1]));
          elements.push(
            <mesh key={`slab-${idx}`} position={[ox, oy, oz]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry args={[slabShape, { depth: 0.1, bevelEnabled: false }]} />
              <meshStandardMaterial color={isModern ? '#fff' : part.type === 'foundation_slab' ? '#1e1e24' : '#222'} roughness={0.8} wireframe={wireframe} />
            </mesh>
          );
        }

        return <React.Fragment key={idx}>{elements}</React.Fragment>;
    });
  }, [processedBuilding, wireframe]);

  return (
    <group>
      {renderedElements}
    </group>
  );
};

// ── Scene (for export access) ─────────────────────────────────────────────────
interface SceneProps extends ViewportProps {
  onSceneReady: (scene: THREE.Scene) => void;
  wireframe?: boolean;
  customOutputs?: any[];
}

const SceneRenderer = ({ nodes, edges, customOutputs, onSceneReady, wireframe }: SceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (groupRef.current) {
      onSceneReady(groupRef.current.parent as THREE.Scene);
    }
  });

  return (
    <group ref={groupRef}>
      <BuildingRenderer nodes={nodes} edges={edges} wireframe={wireframe} />
    </group>
  );
};

// ── Viewport ──────────────────────────────────────────────────────────────────
export interface ViewportHandle {
  exportGLTF: () => void;
  exportOBJ: () => void;
}

export const Viewport = forwardRef<ViewportHandle, ViewportProps>(({ nodes, edges }, ref) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [envPreset, setEnvPreset] = useState<string>('city');
  const [cameraPreset, setCameraPreset] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    exportGLTF: () => {
      if (!sceneRef.current) { alert('Scene not ready'); return; }
      const exporter = new GLTFExporter();
      exporter.parse(
        sceneRef.current,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = 'building.glb';
          a.click();
          URL.revokeObjectURL(url);
        },
        (err) => { console.error('GLTF export error:', err); alert('Export failed — see console'); },
        { binary: true }
      );
    },
    exportOBJ: () => {
      if (!sceneRef.current) { alert('Scene not ready'); return; }
      const exporter = new OBJExporter();
      const result = exporter.parse(sceneRef.current);
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'building.obj';
      a.click();
      URL.revokeObjectURL(url);
    },
  }));

  const handleCameraPreset = useCallback((preset: string) => {
    setCameraPreset(preset);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0c', position: 'relative' }}>
      {/* Viewport Overlay Controls */}
      <ViewportOverlay
        onCameraPreset={handleCameraPreset}
        onToggleWireframe={() => setWireframe(w => !w)}
        onToggleGrid={() => setGridVisible(g => !g)}
        onSetEnvironment={setEnvPreset}
        wireframe={wireframe}
        gridVisible={gridVisible}
        currentEnv={envPreset}
      />

      <Canvas shadows dpr={[1, 2]}>
        <Stats />
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={45} far={2000} />
        <CameraController preset={cameraPreset} onDone={() => setCameraPreset(null)} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={1} />

        <SceneRenderer nodes={nodes} edges={edges} wireframe={wireframe} onSceneReady={(s) => { sceneRef.current = s; }} />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>

        {gridVisible && (
          <Grid
            args={[100, 100]}
            position={[0, 0, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#1a1a2e"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#16213e"
            fadeDistance={80}
            fadeStrength={1}
          />
        )}

        {/* Gizmo Helper (Axis Widget) */}
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport labelColor="white" axisHeadScale={0.8} />
        </GizmoHelper>

        <Environment preset={envPreset as any} />
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={50} blur={2} far={12} frames={1} resolution={512} />
      </Canvas>
    </div>
  );
});

Viewport.displayName = 'Viewport';
