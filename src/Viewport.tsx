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

        // ── Column (with capital block at top) ──
        if (part.type === 'column') {
          const { position, radius, height, material = 'concrete' } = part;
          const colMat = wireframe
            ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(material);
          const capH = radius * 0.6;
          const capW = radius * 2.8;
          return (
            <group key={`col-${idx}`} castShadow>
              {/* Shaft */}
              <mesh position={[position[0], position[1] + height / 2, position[2]]} material={colMat} castShadow>
                <cylinderGeometry args={[radius * 0.85, radius, height, 16]} />
              </mesh>
              {/* Capital (Abacus) */}
              <mesh position={[position[0], position[1] + height + capH / 2, position[2]]} material={colMat} castShadow>
                <boxGeometry args={[capW, capH, capW]} />
              </mesh>
              {/* Base */}
              <mesh position={[position[0], position[1] + radius * 0.2, position[2]]} material={colMat} castShadow>
                <cylinderGeometry args={[radius * 1.1, radius * 1.15, radius * 0.4, 16]} />
              </mesh>
            </group>
          );
        }

        // ── Arcade Arch ──
        if (part.type === 'arcade_arch') {
          const { p1, p2, zOffset: aZ, height: aH, radius: aR, material: aMat } = part;
          const dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
          const archW = dist - aR * 2.5; // span between capitals
          
          if (archW > 0.5) { // Only draw arch if there's enough space
            const angle = Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
            const midX = (p1[0] + p2[0]) / 2;
            const midZ = (p1[1] + p2[1]) / 2;
            
            const archShape = new THREE.Shape();
            const thickness = Math.min(aR * 2.0, archW / 2);
            const extrudeD = aR * 1.8;
            
            // Draw a 2D arch profile (upside down U shape)
            archShape.moveTo(-archW/2, 0);
            archShape.lineTo(-archW/2, thickness);
            archShape.lineTo(archW/2, thickness);
            archShape.lineTo(archW/2, 0);
            
            // Inner arch curve (semi-circle)
            archShape.absarc(0, 0, archW/2, 0, Math.PI, true);
            archShape.closePath();
            
            const arcMat = wireframe
              ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
              : materialLib.getMaterial(aMat);
              
            return (
              <group key={`arch-${idx}`} position={[midX, aZ + aH + aR * 0.6, midZ]} rotation={[0, -angle, 0]}>
                <mesh position={[0, 0, -extrudeD/2]} material={arcMat} castShadow receiveShadow>
                  <extrudeGeometry args={[archShape, { depth: extrudeD, bevelEnabled: false, curveSegments: 24 }]} />
                </mesh>
              </group>
            );
          }
          return null;
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

        // ── Dome ──
        if (part.type === 'dome_mesh') {
          const { position: dPos, radius: dR = 6, segments: dSeg = 24, material: dMat = 'marble', color: dColor = '#e8dfc8' } = part;
          const domeMat = wireframe
            ? new THREE.MeshStandardMaterial({ color: '#aaa', wireframe: true })
            : materialLib.getMaterial(dMat, dColor);
          return (
            <group key={`dome-${idx}`}>
              {/* Drum (cylindrical base) */}
              <mesh position={[dPos[0], dPos[1] + dR * 0.18, dPos[2]]} material={domeMat} castShadow>
                <cylinderGeometry args={[dR, dR * 1.02, dR * 0.36, dSeg]} />
              </mesh>
              {/* Hemisphere */}
              <mesh position={[dPos[0], dPos[1] + dR * 0.36, dPos[2]]} material={domeMat} castShadow>
                <sphereGeometry args={[dR, dSeg, dSeg, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
              {/* Lantern at apex */}
              <mesh position={[dPos[0], dPos[1] + dR * 1.38, dPos[2]]} castShadow>
                <cylinderGeometry args={[dR * 0.08, dR * 0.1, dR * 0.2, 8]} />
                <meshStandardMaterial color={dColor} roughness={0.5} wireframe={wireframe} />
              </mesh>
            </group>
          );
        }

        // ── Railing ──
        if (part.type === 'railing_mesh') {
          const { spline: rSpline, height: rHeight = 1.0, zOffset: rZ = 0 } = part;
          if (!rSpline || rSpline.length === 0) return null;
          
          const railingElements = [];
          
          // Extrude railing base/top
          const rShape = new THREE.Shape();
          const rThickness = 0.15;
          rShape.moveTo(-rThickness/2, -rThickness/2);
          rShape.lineTo(rThickness/2, -rThickness/2);
          rShape.lineTo(rThickness/2, rThickness/2);
          rShape.lineTo(-rThickness/2, rThickness/2);
          rShape.closePath();
          
          const pathPts = rSpline.map((p: any) => new THREE.Vector3(p[0], 0, p[1]));
          // Close path if start == end or we want it closed (simple logic: check if closed)
          // For balustrades, we just extrude along the curve.
          const curve = new THREE.CatmullRomCurve3(pathPts, false, 'catmullrom', 0.1);
          
          railingElements.push(
            <mesh key="r-base" position={[0, rZ + 0.05, 0]}>
              <extrudeGeometry args={[rShape, { extrudePath: curve, steps: 100, bevelEnabled: false }]} />
              <meshStandardMaterial color="#888" roughness={0.6} />
            </mesh>
          );
          
          railingElements.push(
            <mesh key="r-top" position={[0, rZ + rHeight, 0]}>
              <extrudeGeometry args={[rShape, { extrudePath: curve, steps: 100, bevelEnabled: false }]} />
              <meshStandardMaterial color="#666" roughness={0.5} />
            </mesh>
          );
          
          // Glass panels between
          const glassShape = new THREE.Shape();
          glassShape.moveTo(-0.02, 0);
          glassShape.lineTo(0.02, 0);
          glassShape.lineTo(0.02, rHeight - 0.1);
          glassShape.lineTo(-0.02, rHeight - 0.1);
          glassShape.closePath();
          
          const glassMat = wireframe
            ? new THREE.MeshStandardMaterial({ wireframe: true, color: '#aaddff' })
            : materialLib.getMaterial('glass');

          railingElements.push(
            <mesh key="r-glass" position={[0, rZ + 0.05, 0]} material={glassMat}>
              <extrudeGeometry args={[glassShape, { extrudePath: curve, steps: 100, bevelEnabled: false }]} />
            </mesh>
          );

          return <group key={`railing-${idx}`}>{railingElements}</group>;
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

        // ── Castle Wall Segment ──
        if (part.type === 'castle_wall_segment') {
          const { position: cwPos, rotation: cwRot, length: cwLen, height: cwH, thickness: cwT, material: cwMat } = part;
          const cwMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(cwMat || 'worn_stone');
          return (
            <mesh key={`cw-${idx}`} position={[cwPos[0], cwPos[1] + cwH / 2, cwPos[2]]}
              rotation={cwRot} material={cwMesh} castShadow receiveShadow>
              <boxGeometry args={[cwLen, cwH, cwT]} />
            </mesh>
          );
        }

        // ── Castle Merlon (Crenellation) ──
        if (part.type === 'castle_merlon') {
          const { position: mPos, rotation: mRot, width: mW, height: mH, thickness: mT, material: mMat } = part;
          const mMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(mMat || 'worn_stone');
          return (
            <mesh key={`merlon-${idx}`} position={[mPos[0], mPos[1] + mH / 2, mPos[2]]}
              rotation={mRot} material={mMesh} castShadow>
              <boxGeometry args={[mW, mH, mT]} />
            </mesh>
          );
        }

        // ── Castle Machicolation ──
        if (part.type === 'castle_machicolation') {
          const { position: mcPos, rotation: mcRot, length: mcLen, material: mcMat } = part;
          const mcMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(mcMat || 'worn_stone');
          return (
            <mesh key={`mach-${idx}`} position={[mcPos[0], mcPos[1], mcPos[2]]}
              rotation={mcRot} material={mcMesh} castShadow>
              <boxGeometry args={[mcLen, 0.8, 3.2]} />
            </mesh>
          );
        }

        // ── Tower Mesh ──
        if (part.type === 'tower_mesh') {
          const { position: tPos, radius: tR, height: tH, topType, material: tMat,
            segments: tSeg, conicalHeight: cH, conicalColor: cCol, wallThickness: wT } = part;
          const tMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(tMat || 'worn_stone');
          const cMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : new THREE.MeshStandardMaterial({ color: cCol || '#5a3a2a', roughness: 0.7 });
          const seg = tSeg || 16;
          const merlonH = 1.4, merlonW = 1.0;
          const merlonRing = topType === 'crenellated' ? Array.from({ length: seg }, (_, mi) => {
            const a = (mi / seg) * Math.PI * 2;
            return mi % 2 === 0 ? (
              <mesh key={`tm-${idx}-m${mi}`}
                position={[Math.cos(a) * tR, tH + merlonH / 2, Math.sin(a) * tR]}
                rotation={[0, a, 0]} material={tMesh} castShadow>
                <boxGeometry args={[merlonW, merlonH, wT || 0.8]} />
              </mesh>
            ) : null;
          }) : null;
          return (
            <group key={`tower-${idx}`} position={[tPos[0], tPos[1], tPos[2]]}>
              {/* Shaft */}
              <mesh position={[0, tH / 2, 0]} material={tMesh} castShadow receiveShadow>
                <cylinderGeometry args={[tR, tR * 1.08, tH, seg]} />
              </mesh>
              {/* Top cap */}
              {topType === 'conical' && (
                <mesh position={[0, tH, 0]} castShadow>
                  <coneGeometry args={[tR * 1.1, cH || 5, seg]} />
                  {wireframe ? <meshStandardMaterial wireframe color="#888" /> : <meshStandardMaterial color={cCol || '#5a3a2a'} roughness={0.6} />}
                </mesh>
              )}
              {topType === 'onion' && (
                <mesh position={[0, tH + (cH || 4) * 0.4, 0]} castShadow>
                  <sphereGeometry args={[tR * 1.05, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
                  {wireframe ? <meshStandardMaterial wireframe color="#888" /> : cMesh && <primitive object={cMesh} attach="material" />}
                </mesh>
              )}
              {/* Crenellations */}
              {topType === 'crenellated' && merlonRing}
              {/* Platform ring */}
              <mesh position={[0, tH, 0]} material={tMesh} castShadow>
                <cylinderGeometry args={[tR + 0.5, tR + 0.5, 0.6, seg]} />
              </mesh>
            </group>
          );
        }

        // ── Bridge Deck ──
        if (part.type === 'bridge_deck') {
          const { position: bdPos, span: bdSpan, width: bdW, deckHeight: bdH, material: bdMat } = part;
          const bdMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(bdMat || 'concrete');
          return (
            <group key={`bdeck-${idx}`}>
              {/* Main deck slab */}
              <mesh position={[bdPos[0], bdPos[1] + (bdH || 0.6) / 2, bdPos[2]]} material={bdMesh} castShadow receiveShadow>
                <boxGeometry args={[bdSpan + 2, bdH || 0.6, bdW || 8]} />
              </mesh>
              {/* Parapets */}
              <mesh position={[bdPos[0], bdPos[1] + (bdH || 0.6) + 0.4, bdPos[2] - (bdW || 8) / 2 + 0.3]} material={bdMesh} castShadow>
                <boxGeometry args={[bdSpan + 2, 0.8, 0.5]} />
              </mesh>
              <mesh position={[bdPos[0], bdPos[1] + (bdH || 0.6) + 0.4, bdPos[2] + (bdW || 8) / 2 - 0.3]} material={bdMesh} castShadow>
                <boxGeometry args={[bdSpan + 2, 0.8, 0.5]} />
              </mesh>
            </group>
          );
        }

        // ── Bridge Arch ──
        if (part.type === 'bridge_arch') {
          const { position: baPos, span: baSpan, height: baH, width: baW, material: baMat } = part;
          const baMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(baMat || 'sandstone');
          const archShape = new THREE.Shape();
          const aW2 = (baSpan || 10) / 2;
          const aThick = 1.2;
          archShape.moveTo(-aW2, 0);
          archShape.lineTo(-aW2, aThick);
          archShape.absarc(0, 0, aW2 - aThick / 2, Math.PI, 0, false);
          archShape.lineTo(aW2, 0);
          archShape.absarc(0, 0, aW2, 0, Math.PI, true);
          archShape.closePath();
          return (
            <mesh key={`barch-${idx}`}
              position={[baPos[0], baPos[1] + (baH || 8), baPos[2]]}
              rotation={[-Math.PI / 2, 0, 0]} material={baMesh} castShadow receiveShadow>
              <extrudeGeometry args={[archShape, { depth: baW || 8, bevelEnabled: false, curveSegments: 20 }]} />
            </mesh>
          );
        }

        // ── Bridge Pier ──
        if (part.type === 'bridge_pier') {
          const { position: bpPos, height: bpH, width: bpW, material: bpMat } = part;
          const bpMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(bpMat || 'sandstone');
          return (
            <mesh key={`bpier-${idx}`}
              position={[bpPos[0], bpPos[1] + (bpH || 8) / 2, bpPos[2]]}
              material={bpMesh} castShadow receiveShadow>
              <boxGeometry args={[2.5, bpH || 8, bpW || 8]} />
            </mesh>
          );
        }

        // ── Bridge Pylon (Suspension / Cable) ──
        if (part.type === 'bridge_pylon') {
          const { position: pylPos, height: pylH, width: pylW, material: pylMat, bridgeType: pylBT } = part;
          const pylMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(pylMat || 'concrete');
          const isIShape = pylBT === 'cable';
          return (
            <group key={`pylon-${idx}`}>
              {/* Left leg */}
              <mesh position={[pylPos[0] - (pylW || 8) * 0.25, pylPos[1] + (pylH || 18) / 2, pylPos[2]]}
                material={pylMesh} castShadow>
                <boxGeometry args={[1.5, pylH || 18, 2.0]} />
              </mesh>
              {/* Right leg */}
              <mesh position={[pylPos[0] + (pylW || 8) * 0.25, pylPos[1] + (pylH || 18) / 2, pylPos[2]]}
                material={pylMesh} castShadow>
                <boxGeometry args={[1.5, pylH || 18, 2.0]} />
              </mesh>
              {/* Crossbeam */}
              {isIShape && (
                <mesh position={[pylPos[0], pylPos[1] + (pylH || 18) * 0.6, pylPos[2]]}
                  material={pylMesh} castShadow>
                  <boxGeometry args={[(pylW || 8) * 0.55, 1.2, 1.8]} />
                </mesh>
              )}
              {/* Cap */}
              <mesh position={[pylPos[0], pylPos[1] + (pylH || 18), pylPos[2]]}
                material={pylMesh} castShadow>
                <boxGeometry args={[(pylW || 8) * 0.55, 1.0, 2.5]} />
              </mesh>
            </group>
          );
        }

        // ── Gate Arch Mesh ──
        if (part.type === 'gate_arch_mesh') {
          const { position: gaPos, width: gaW, height: gaH, thickness: gaT,
            archType: gaAT, material: gaMat, towerWidth: gaTW, towerHeight: gaTH } = part;
          const gaMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(gaMat || 'worn_stone');
          const halfW = (gaW || 6) / 2;
          const h = gaH || 8;
          const isPointed = gaAT === 'pointed';
          const archShape = new THREE.Shape();
          archShape.moveTo(-halfW, 0);
          archShape.lineTo(-halfW, h * 0.55);
          if (isPointed) {
            archShape.lineTo(0, h);
            archShape.lineTo(halfW, h * 0.55);
          } else {
            archShape.absarc(0, h * 0.55, halfW, Math.PI, 0, false);
          }
          archShape.lineTo(halfW, 0);
          archShape.lineTo(-halfW, 0);
          const opening = new THREE.Path();
          const innerHalf = halfW - 0.8;
          opening.moveTo(-innerHalf, 0.01);
          opening.lineTo(-innerHalf, h * 0.52);
          if (isPointed) {
            opening.lineTo(0, h - 1.0);
            opening.lineTo(innerHalf, h * 0.52);
          } else {
            opening.absarc(0, h * 0.55, innerHalf, Math.PI, 0, false);
          }
          opening.lineTo(innerHalf, 0.01);
          archShape.holes.push(opening);

          return (
            <group key={`gate-${idx}`} position={[gaPos[0], gaPos[1], gaPos[2]]}>
              {/* Gate arch wall */}
              <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={gaMesh} castShadow receiveShadow>
                <extrudeGeometry args={[archShape, { depth: gaT || 3, bevelEnabled: false, curveSegments: 16 }]} />
              </mesh>
              {/* Left flanking tower */}
              <mesh position={[-(halfW + (gaTW || 4) / 2 + 0.2), (gaTH || 14) / 2, 0]} material={gaMesh} castShadow>
                <boxGeometry args={[gaTW || 4, gaTH || 14, (gaT || 3) + 2]} />
              </mesh>
              {/* Right flanking tower */}
              <mesh position={[(halfW + (gaTW || 4) / 2 + 0.2), (gaTH || 14) / 2, 0]} material={gaMesh} castShadow>
                <boxGeometry args={[gaTW || 4, gaTH || 14, (gaT || 3) + 2]} />
              </mesh>
              {/* Portcullis groove hint */}
              <mesh position={[0, h * 0.4, -(gaT || 3) / 2 - 0.05]} castShadow>
                <boxGeometry args={[gaW || 6, h * 0.8, 0.3]} />
                <meshStandardMaterial color="#111" roughness={1} wireframe={wireframe} />
              </mesh>
            </group>
          );
        }

        // ── Terrain Mesh ──
        if (part.type === 'terrain_mesh') {
          const { width: terW = 200, depth: terD = 200, segments: terSeg = 40, maxHeight: terMH = 12, seed: terSeed = 42 } = part;
          const geo = new THREE.PlaneGeometry(terW, terD, terSeg, terSeg);
          const pos2 = geo.attributes.position;
          const rand2 = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
          for (let vi = 0; vi < pos2.count; vi++) {
            const vx = pos2.getX(vi); const vz = pos2.getY(vi);
            let h2 = 0;
            h2 += rand2(terSeed + vx * 0.1 + vz * 0.17) * terMH * 0.5;
            h2 += rand2(terSeed + vx * 0.3 + vz * 0.41 + 7) * terMH * 0.3;
            h2 += rand2(terSeed + vx * 0.7 + vz * 0.83 + 13) * terMH * 0.2;
            pos2.setZ(vi, h2);
          }
          geo.computeVertexNormals();
          return (
            <mesh key={`terrain-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
              <primitive object={geo} attach="geometry" />
              <meshStandardMaterial color="#3a5a30" roughness={0.95} wireframe={wireframe} />
            </mesh>
          );
        }

        // ── Spire Mesh ──
        if (part.type === 'spire_mesh') {
          const { position: spPos, baseRadius: spR, height: spH, segments: spSeg, color: spCol } = part;
          return (
            <group key={`spire-${idx}`} position={[spPos[0], spPos[1], spPos[2]]}>
              {/* Octagonal base drum */}
              <mesh position={[0, spR * 0.5, 0]} castShadow>
                <cylinderGeometry args={[spR, spR * 1.1, spR * 1.0, spSeg || 8]} />
                <meshStandardMaterial color={spCol || '#2a2a3a'} roughness={0.5} metalness={0.3} wireframe={wireframe} />
              </mesh>
              {/* Main spire cone */}
              <mesh position={[0, spR * 1.0 + spH / 2, 0]} castShadow>
                <coneGeometry args={[spR, spH, spSeg || 8]} />
                <meshStandardMaterial color={spCol || '#2a2a3a'} roughness={0.4} metalness={0.4} wireframe={wireframe} />
              </mesh>
              {/* Tip finial */}
              <mesh position={[0, spR * 1.0 + spH + 0.5, 0]} castShadow>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color="#c8a030" metalness={0.8} roughness={0.2} wireframe={wireframe} />
              </mesh>
            </group>
          );
        }

        // ── Buttress Mesh ──
        if (part.type === 'buttress_mesh') {
          const { position: buPos, rotation: buRot, span: buSpan, height: buH, thickness: buT, material: buMat } = part;
          const buMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#888', wireframe: true })
            : materialLib.getMaterial(buMat || 'limestone');
          const buttShape = new THREE.Shape();
          buttShape.moveTo(0, 0);
          buttShape.lineTo(buSpan || 5, 0);
          buttShape.lineTo(0.5, buH || 12);
          buttShape.closePath();
          return (
            <mesh key={`butt-${idx}`}
              position={[buPos[0], buPos[1], buPos[2]]}
              rotation={buRot ? [buRot[0], buRot[1], buRot[2]] : [0, 0, 0]}
              material={buMesh} castShadow receiveShadow>
              <extrudeGeometry args={[buttShape, { depth: buT || 0.8, bevelEnabled: false }]} />
            </mesh>
          );
        }

        // ── Pyramid Mesh ──
        if (part.type === 'pyramid_mesh') {
          const { position: pyPos, baseWidth: pyW, baseDepth: pyD, height: pyH, steps: pySteps, material: pyMat } = part;
          const pyMesh = wireframe ? new THREE.MeshStandardMaterial({ color: '#c8a030', wireframe: true })
            : materialLib.getMaterial(pyMat || 'sandstone');
          if ((pySteps || 0) > 0) {
            const stepsArr = Array.from({ length: pySteps }, (_, si) => {
              const t = si / pySteps;
              const nt = (si + 1) / pySteps;
              const sw = (pyW || 30) * (1 - t * 0.95);
              const sd = (pyD || 30) * (1 - t * 0.95);
              const sh = (pyH || 20) / pySteps;
              const sy = t * (pyH || 20);
              return (
                <mesh key={`pystep-${si}`} position={[(pyPos || [0,0,0])[0], sy + sh / 2, (pyPos || [0,0,0])[2]]}
                  material={pyMesh} castShadow receiveShadow>
                  <boxGeometry args={[sw, sh, sd]} />
                </mesh>
              );
            });
            return <group key={`pyr-${idx}`}>{stepsArr}</group>;
          }
          // Smooth pyramid via custom geometry
          const pyVerts: number[] = [];
          const bW2 = (pyW || 30) / 2; const bD2 = (pyD || 30) / 2; const pyHeight = pyH || 20;
          const apex = [0, pyHeight, 0];
          const base = [[-bW2,0,-bD2],[bW2,0,-bD2],[bW2,0,bD2],[-bW2,0,bD2]];
          const faces = [[0,1],[1,2],[2,3],[3,0]];
          faces.forEach(([a,b]) => {
            pyVerts.push(...base[a], ...apex, ...base[b]);
          });
          // Base
          pyVerts.push(...base[0], ...base[1], ...base[2]);
          pyVerts.push(...base[0], ...base[2], ...base[3]);
          const pyGeo = new THREE.BufferGeometry();
          pyGeo.setAttribute('position', new THREE.Float32BufferAttribute(pyVerts, 3));
          pyGeo.computeVertexNormals();
          return (
            <mesh key={`pyr-${idx}`} position={[(pyPos||[0,0,0])[0], (pyPos||[0,0,0])[1], (pyPos||[0,0,0])[2]]}
              material={pyMesh} castShadow receiveShadow>
              <primitive object={pyGeo} attach="geometry" />
            </mesh>
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
  const [timeOfDay, setTimeOfDay] = useState<number>(14);
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

  // Time of Day calculations
  const sunAngle = ((timeOfDay - 6) / 14) * Math.PI; // 6am = 0, 20pm = PI
  const sunY = Math.max(-5, Math.sin(sunAngle) * 60);
  const sunX = Math.cos(sunAngle) * -80; // Sun moves from East to West
  const sunZ = 20;
  
  // Dynamic colors based on time
  const isNight = timeOfDay < 6.5 || timeOfDay > 19.5;
  const sunIntensity = isNight ? 0.2 : Math.max(0.1, Math.sin(sunAngle) * 2.5);
  const sunColor = timeOfDay < 8 || timeOfDay > 18 ? '#ffb766' : '#fff5e0';
  const ambientIntensity = isNight ? 0.1 : 0.25;
  const hemiSky = isNight ? '#112' : '#b0d4ff';
  const hemiGround = isNight ? '#000' : '#c8a060';
  const fogColor = isNight ? '#050508' : '#1a1820';

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
        timeOfDay={timeOfDay}
        onSetTimeOfDay={setTimeOfDay}
      />

      <Canvas shadows dpr={[1, 2]}>
        <Stats />
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={45} far={2000} />
        <CameraController preset={cameraPreset} onDone={() => setCameraPreset(null)} />

        {/* ── Dynamic Lighting ── */}
        <ambientLight intensity={ambientIntensity} color="#ffeedd" />
        <hemisphereLight args={[hemiSky, hemiGround, 0.6]} />
        <directionalLight
          position={[sunX, sunY, sunZ]}
          intensity={sunIntensity}
          color={sunColor}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
          shadow-bias={-0.001}
        />
        {/* Fill light — cool blue from opposite side */}
        <directionalLight position={[-30, 20, -20]} intensity={isNight ? 0.1 : 0.5} color="#c8d8ff" />
        {/* Ground-bounce fill */}
        <pointLight position={[0, -2, 0]} intensity={isNight ? 0.05 : 0.3} color="#d4b896" distance={80} />

        {/* Atmospheric fog for depth */}
        <fogExp2 attach="fog" color={fogColor} density={0.004} />

        <SceneRenderer nodes={nodes} edges={edges} wireframe={wireframe} onSceneReady={(s) => { sceneRef.current = s; }} />

        {/* Ground — tiled plaza */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[800, 800, 80, 80]} />
          <meshStandardMaterial color="#1c1c20" roughness={0.95} metalness={0.05} />
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
        <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={80} blur={2.5} far={20} frames={1} resolution={1024} />
      </Canvas>
    </div>
  );
});

Viewport.displayName = 'Viewport';
