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
        const { spline, floors, floorHeight, windowSpacing, windowHeight, wallThickness, style, offset = [0, 0, 0] } = part;
        const [ox, oy, oz] = offset;
        const isModern = style === 'modern';

        if (part.detailed && spline) {
          for (let f = 0; f < floors; f++) {
            const y = f * floorHeight + oy;
            spline.forEach((p: any, i: number) => {
              const next = spline[(i + 1) % spline.length];
              const dx = next[0] - p[0];
              const dz = next[1] - p[1];
              const len = Math.sqrt(dx * dx + dz * dz);
              const angle = Math.atan2(dx, dz);

              elements.push(
                <group key={`wall-${idx}-${f}-${i}`} position={[p[0] + dx/2 + ox, y, p[1] + dz/2 + oz]} rotation={[0, angle + Math.PI/2, 0]}>
                  <ProceduralWall 
                    width={len} height={floorHeight} thickness={wallThickness || 0.25} 
                    windowSpacing={windowSpacing || 3} windowSize={[1.2, windowHeight || 1.6]} sillHeight={0.9} 
                    isModern={isModern}
                  />
                </group>
              );
            });
          }
        }

        if (part.roof && spline) {
          const roofY = floors * floorHeight + oy;
          const { roofType } = part;

          const roofShape = new THREE.Shape();
          roofShape.moveTo(spline[0][0], spline[0][1]);
          spline.slice(1).forEach((p: any) => roofShape.lineTo(p[0], p[1]));

          if (roofType === 'pitched') {
            elements.push(
              <mesh key={`roof-${idx}`} position={[ox, roofY, oz]} rotation={[Math.PI/2, 0, 0]} castShadow>
                {/* Positive bevel with negative offset keeps it aligned but slanted upwards */}
                <extrudeGeometry args={[roofShape, { 
                  depth: 0.1, 
                  bevelEnabled: true, 
                  bevelThickness: 1.2, 
                  bevelSize: 0.6, 
                  bevelOffset: -0.6, 
                  bevelSegments: 1 
                }]} />
                <meshStandardMaterial color="#8e2b2b" roughness={0.4} metalness={0.2} />
              </mesh>
            );
          } else {
             elements.push(
               <mesh key={`roof-flat-${idx}`} position={[ox, roofY, oz]} rotation={[-Math.PI/2, 0, 0]}>
                 <extrudeGeometry args={[roofShape, { depth: 0.15, bevelEnabled: false }]} />
                 <meshStandardMaterial color="#2a2a30" />
               </mesh>
             );
          }
        }

        if (part.type === 'column' && spline) {
           const { columnRadius = 0.2, columnSpacing = 3 } = part;
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
        <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={45} />
        <OrbitControls makeDefault minDistance={5} maxDistance={50} />
        
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
