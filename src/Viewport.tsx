import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralWall } from './engine/ProceduralWall';
import { processGraph } from './engine/graphProcessor';
import type { ViewportProps } from './types';

const BuildingRenderer = ({ nodes, edges }: ViewportProps) => {
  const processedBuilding = useMemo(() => processGraph(nodes, edges), [nodes, edges]);

  return (
    <group>
      {processedBuilding.map((part: any, idx: number) => {
        if (!part) return null;

        const elements = [];
        const {
          spline, floors = 1, floorHeight = 3,
          wallThickness = 0.2,
          style, offset = [0, 0, 0],
          twist, taper = 1, shear, jitter = 0
        } = part;
        const [ox, oy, oz] = offset;
        const isModern = style === 'modern';

        if (part.detailed && spline) {
          for (let f = 0; f < floors; f++) {
            const t = f / Math.max(1, floors - 1);

            // Calculate window settings from part data
            const wSpacing = part.winSpacing || 2.5;
            const wSize: [number, number] = [part.winWidth || 1.2, part.winHeight || 1.8];

            // Calculate twist interpolation
            let currentTwist = 0;
            if (twist) {
              if (t < 0.5) {
                currentTwist = THREE.MathUtils.lerp(twist.base, twist.mid, t * 2);
              } else {
                currentTwist = THREE.MathUtils.lerp(twist.mid, twist.top, (t - 0.5) * 2);
              }
            }
            const rotationRad = (currentTwist * Math.PI) / 180;

            // Calculate taper (scale)
            const currentScale = THREE.MathUtils.lerp(1, taper, t);

            // Calculate shear and jitter
            const shearOffsetX = shear ? shear.x * t : 0;
            const shearOffsetZ = shear ? shear.y * t : 0;
            const jitterX = (Math.random() - 0.5) * jitter;
            const jitterZ = (Math.random() - 0.5) * jitter;

            const floorY = f * floorHeight + oy;

            // Render Corner Pillars to hide seams
            spline.forEach((p: any, pIdx: number) => {
              const rotatePoint = (pt: [number, number]): [number, number] => {
                const s = Math.sin(rotationRad);
                const c = Math.cos(rotationRad);
                const rx = pt[0] * currentScale;
                const rz = pt[1] * currentScale;
                return [rx * c - rz * s, rx * s + rz * c];
              };
              const pRot = rotatePoint(p);
              elements.push(
                <mesh key={`pillar-${idx}-${f}-${pIdx}`} position={[pRot[0] + ox + shearOffsetX + jitterX, floorY + floorHeight / 2, pRot[1] + oz + shearOffsetZ + jitterZ]}>
                  <boxGeometry args={[wallThickness * 1.1, floorHeight, wallThickness * 1.1]} />
                  <meshStandardMaterial color="#ccc" />
                </mesh>
              );
            });

            spline.forEach((p: any, i: number) => {
              const next = spline[(i + 1) % spline.length];

              // Decide if this wall should have a door based on side index
              let shouldHaveDoor = false;
              if (f === 0) {
                const side = part.doorSide || 'front';
                if (side === 'all') shouldHaveDoor = true;
                else if (side === 'front' && i === 0) shouldHaveDoor = true;
                else if (side === 'frontback' && (i === 0 || i === Math.floor(spline.length / 2))) shouldHaveDoor = true;
                else if (side === 'sides' && (i === Math.floor(spline.length / 4) || i === Math.floor(spline.length * 3 / 4))) shouldHaveDoor = true;
              }

              // Rotate and scale points for this floor
              const rotatePoint = (pt: [number, number]): [number, number] => {
                const s = Math.sin(rotationRad);
                const c = Math.cos(rotationRad);
                const rx = pt[0] * currentScale;
                const rz = pt[1] * currentScale;
                return [
                  rx * c - rz * s,
                  rx * s + rz * c
                ];
              };

              const pRot = rotatePoint(p);
              const nextRot = rotatePoint(next);

              const dx = nextRot[0] - pRot[0];
              const dz = nextRot[1] - pRot[1];
              const len = Math.sqrt(dx * dx + dz * dz);
              const angle = Math.atan2(dx, dz);

              elements.push(
                <group
                  key={`wall-${idx}-${f}-${i}`}
                  position={[
                    pRot[0] + dx / 2 + ox + shearOffsetX + jitterX,
                    floorY,
                    pRot[1] + dz / 2 + oz + shearOffsetZ + jitterZ
                  ]}
                  rotation={[0, angle + Math.PI / 2, 0]}
                >
                  <ProceduralWall
                    width={len} height={floorHeight} thickness={wallThickness || 0.25}
                    windowSpacing={wSpacing} windowSize={wSize} sillHeight={0.9}
                    isModern={isModern}
                    hasDoor={shouldHaveDoor}
                    doorWidth={part.doorWidth || 1.8}
                    doorHeight={part.doorHeight || 2.4}
                    doorOffset={part.doorOffset || 0}
                    windowType={part.windowType}
                    doorType={part.doorType}
                    materialType={part.material}
                  />
                </group>
              );
            });
          }
        }

        if (part.roof && spline) {
          const roofY = (part.baseHeight || 0) + oy;
          const { roofType, overhang = 0.5, color = '#8e2b2b', deformation, height = 2 } = part;

          const { twist = { base: 0, mid: 0, top: 0 }, taper = 1 } = deformation || {};
          const t = 1.0;
          const rotationRad = (twist.base + (twist.mid - twist.base) * t + (twist.top - twist.mid) * t) * (Math.PI / 180);
          const currentScale = 1.0 + (taper - 1.0) * t;

          const getTransformedPoint = (p: [number, number], extraScale: number = 1.0) => {
            const s = Math.sin(rotationRad);
            const c = Math.cos(rotationRad);
            const rx = p[0] * currentScale * extraScale;
            const rz = p[1] * currentScale * extraScale;
            const mag = Math.sqrt(rx * rx + rz * rz);
            const dir = mag > 0 ? [rx / mag, rz / mag] : [0, 0];
            const px = rx + dir[0] * overhang;
            const pz = rz + dir[1] * overhang;
            return [
              px * c - pz * s,
              px * s + pz * c
            ];
          };

          const basePoints = spline.map((p: any) => getTransformedPoint(p, 1.0, 1.0));

          let topScaleX = 1.0;
          let topScaleZ = 1.0;
          
          if (roofType === 'hip') {
            topScaleX = 0.05;
            topScaleZ = 0.05;
          } else if (roofType === 'gable' || roofType === 'pitched') {
            topScaleX = 0.01; // Ridge line
            topScaleZ = 1.0; 
          } else if (roofType === 'mansard') {
            topScaleX = 0.6;
            topScaleZ = 0.6;
          }

          const topPoints = spline.map((p: any) => getTransformedPoint(p, topScaleX, topScaleZ));
          const vertices = [];
          const roofH = roofType === 'flat' ? 0.1 : height;

          for (let i = 0; i < basePoints.length; i++) {
            const next = (i + 1) % basePoints.length;

            const p1Base = basePoints[i];
            const p2Base = basePoints[next];

            const p1Top = roofType === 'shed' ? [p1Base[0], p1Base[1]] : topPoints[i];
            const p2Top = roofType === 'shed' ? [p2Base[0], p2Base[1]] : topPoints[next];

            const h1 = (roofType === 'shed') ? (p1Base[0] + 7) * 0.2 : roofH;
            const h2 = (roofType === 'shed') ? (p2Base[0] + 7) * 0.2 : roofH;

            // Triangle 1
            vertices.push(p1Base[0], p1Base[1], 0);
            vertices.push(p2Base[0], p2Base[1], 0);
            vertices.push(p2Top[0], p2Top[1], h2);

            // Triangle 2
            vertices.push(p1Base[0], p1Base[1], 0);
            vertices.push(p2Top[0], p2Top[1], h2);
            vertices.push(p1Top[0], p1Top[1], h1);
          }

          // Top face to close any holes at the peak
          for (let i = 1; i < topPoints.length - 1; i++) {
            const h0 = (roofType === 'shed') ? (topPoints[0][0] + 7) * 0.2 : roofH;
            const hi = (roofType === 'shed') ? (topPoints[i][0] + 7) * 0.2 : roofH;
            const hi1 = (roofType === 'shed') ? (topPoints[i + 1][0] + 7) * 0.2 : roofH;

            vertices.push(topPoints[0][0], topPoints[0][1], h0);
            vertices.push(topPoints[i][0], topPoints[i][1], hi);
            vertices.push(topPoints[i + 1][0], topPoints[i + 1][1], hi1);
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geometry.computeVertexNormals();

          elements.push(
            <mesh
              key={`roof-${idx}`}
              position={[ox, roofY + 0.01, oz]}
              rotation={[-Math.PI / 2, 0, 0]}
              castShadow
              geometry={geometry}
            >
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
            </mesh>
          );
        }

        if (part.type === 'column' && spline) {
          const { columnRadius = 0.2 } = part;
          spline.forEach((p: any, i: number) => {
            elements.push(
              <mesh key={`col-${idx}-${i}`} position={[p[0] + ox, oy + (floors * floorHeight) / 2, p[1] + oz]}>
                <cylinderGeometry args={[columnRadius, columnRadius, floors * floorHeight, 16]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
            );
          });
        }

        if ((part.type === 'full_volume' || part.detailed || part.type === 'foundation_slab' || part.type === 'floor_slab' || part.type === 'interior_partition') && Array.isArray(spline) && spline.length > 0) {
          if (part.type === 'floor_slab') {
            const slabShape = new THREE.Shape();
            slabShape.moveTo(spline[0][0], spline[0][1]);
            spline.slice(1).forEach((p: any) => slabShape.lineTo(p[0], p[1]));
            slabShape.closePath();

            elements.push(
              <mesh key={`slab-${idx}`} position={[ox, oy + part.baseHeight, oz]} rotation={[-Math.PI / 2, 0, 0]}>
                <extrudeGeometry args={[slabShape, { depth: 0.2, bevelEnabled: false }]} />
                <meshStandardMaterial color="#a0a0a0" side={THREE.DoubleSide} />
              </mesh>
            );
            return elements;
          }

          if (part.type === 'interior_partition') {
            const bbox = new THREE.Box2();
            spline.forEach((p: any) => bbox.expandByPoint(new THREE.Vector2(p[0], p[1])));
            const center = bbox.getCenter(new THREE.Vector2());
            const size = bbox.getSize(new THREE.Vector2());

            elements.push(
              <group key={`interior-${idx}`} position={[ox + center.x, oy + part.baseHeight + part.height / 2, oz + center.y]}>
                {/* Longitudinal wall */}
                <mesh><boxGeometry args={[size.x * 0.98, part.height, 0.2]} /><meshStandardMaterial color="#f5e6d3" side={THREE.DoubleSide} /></mesh>
                {/* Transverse wall */}
                <mesh rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[size.y * 0.98, part.height, 0.2]} /><meshStandardMaterial color="#f5e6d3" side={THREE.DoubleSide} /></mesh>
              </group>
            );
            return elements;
          }

          const slabShape = new THREE.Shape();
          slabShape.moveTo(spline[0][0], spline[0][1]);
          spline.slice(1).forEach((p: any) => slabShape.lineTo(p[0], p[1]));

          elements.push(
            <mesh key={`slab-${idx}`} position={[ox, oy, oz]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry args={[slabShape, { depth: 0.1, bevelEnabled: false }]} />
              <meshStandardMaterial color={isModern ? "#fff" : (part.type === 'foundation_slab' ? "#1e1e24" : "#222")} roughness={0.8} />
            </mesh>
          );
        }

        return <React.Fragment key={idx}>{elements}</React.Fragment>;
      })}
    </group>
  );
};

export const Viewport: React.FC<ViewportProps> = ({ nodes, edges }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0c' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={45} far={2000} />
        <OrbitControls makeDefault minDistance={5} maxDistance={1000} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />

        <BuildingRenderer nodes={nodes} edges={edges} />

        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} sectionSize={1} sectionColor="#2a2a30" />
        <Environment preset="city" />
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={10} />
      </Canvas>
    </div>
  );
};
