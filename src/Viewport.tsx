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
          windowSpacing, windowHeight, wallThickness, 
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
                    pRot[0] + dx/2 + ox + shearOffsetX + jitterX, 
                    floorY, 
                    pRot[1] + dz/2 + oz + shearOffsetZ + jitterZ
                  ]} 
                  rotation={[0, angle + Math.PI/2, 0]}
                >
                  <ProceduralWall 
                    width={len} height={floorHeight} thickness={wallThickness || 0.25} 
                    windowSpacing={wSpacing} windowSize={wSize} sillHeight={0.9} 
                    isModern={isModern}
                    floorIndex={f}
                    hasDoor={shouldHaveDoor}
                    doorWidth={part.doorWidth || 1.8}
                    doorHeight={part.doorHeight || 2.4}
                    doorOffset={part.doorOffset || 0}
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

          const basePoints = spline.map((p: any) => getTransformedPoint(p, 1.0));
          
          // For hip roof, the top is a small version of the base
          const topScale = roofType === 'flat' ? 1.0 : (roofType === 'mansard' ? 0.6 : 0.05);
          const topPoints = spline.map((p: any) => getTransformedPoint(p, topScale));
          const roofH = roofType === 'flat' ? 0.1 : height;

          const vertices = [];
          for (let i = 0; i < basePoints.length; i++) {
            const next = (i + 1) % basePoints.length;
            
            // Side face (Quad as two triangles)
            // Triangle 1
            vertices.push(...basePoints[i], 0);
            vertices.push(...basePoints[next], 0);
            vertices.push(...topPoints[next], roofH);
            
            // Triangle 2
            vertices.push(...basePoints[i], 0);
            vertices.push(...topPoints[next], roofH);
            vertices.push(...topPoints[i], roofH);
          }

          // Top face to close any holes at the peak
          for (let i = 1; i < topPoints.length - 1; i++) {
            vertices.push(...topPoints[0], roofH);
            vertices.push(...topPoints[i], roofH);
            vertices.push(...topPoints[i+1], roofH);
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geometry.computeVertexNormals();

          elements.push(
            <mesh 
              key={`roof-${idx}`} 
              position={[ox, roofY + 0.01, oz]} 
              rotation={[-Math.PI/2, 0, 0]} 
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
               <mesh key={`col-${idx}-${i}`} position={[p[0] + ox, oy + (floors * floorHeight)/2, p[1] + oz]}>
                 <cylinderGeometry args={[columnRadius, columnRadius, floors * floorHeight, 16]} />
                 <meshStandardMaterial color="#fff" />
               </mesh>
             );
           });
        }

        if ((part.type === 'full_volume' || part.detailed || part.type === 'foundation_slab') && Array.isArray(spline) && spline.length > 0) {
           const slabShape = new THREE.Shape();
           slabShape.moveTo(spline[0][0], spline[0][1]);
           spline.slice(1).forEach((p: any) => slabShape.lineTo(p[0], p[1]));
           
           elements.push(
             <mesh key={`slab-${idx}`} position={[ox, oy, oz]} rotation={[-Math.PI/2, 0, 0]}>
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
