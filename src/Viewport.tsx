import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { BuildingParams } from './types';

interface ViewportProps {
  params: BuildingParams;
}

const WindowFrame = ({ width, height, thickness }: any) => {
  return (
    <group>
      {/* Glass */}
      <mesh>
        <planeGeometry args={[width - 0.1, height - 0.1]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} roughness={0} metalness={1} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, thickness / 2]}>
        <boxGeometry args={[width, 0.05, thickness + 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0, -thickness / 2]}>
        <boxGeometry args={[width, 0.05, thickness + 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[width / 2, 0, 0]}>
        <boxGeometry args={[0.05, height, thickness + 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-width / 2, 0, 0]}>
        <boxGeometry args={[0.05, height, thickness + 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

const ProceduralWall = ({ width, height, thickness, windowSpacing, windowSize, sillHeight }: any) => {
  const { shape, windows } = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.lineTo(-width / 2, 0);

    const winData = [];
    const [wW, wH] = windowSize;
    const numWindows = Math.floor(width / windowSpacing);
    const startX = -(width / 2) + (width - (numWindows - 1) * windowSpacing) / 2;

    for (let i = 0; i < numWindows; i++) {
      const x = startX + i * windowSpacing;
      const hole = new THREE.Path();
      hole.moveTo(x - wW / 2, sillHeight);
      hole.lineTo(x + wW / 2, sillHeight);
      hole.lineTo(x + wW / 2, sillHeight + wH);
      hole.lineTo(x - wW / 2, sillHeight + wH);
      hole.lineTo(x - wW / 2, sillHeight);
      s.holes.push(hole);
      winData.push({ x, y: sillHeight + wH / 2 });
    }
    return { shape: s, windows: winData };
  }, [width, height, windowSpacing, windowSize, sillHeight]);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -thickness / 2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshStandardMaterial color="#45454b" roughness={0.7} metalness={0.1} />
      </mesh>
      {windows.map((win, i) => (
        <group key={i} position={[win.x, win.y, 0]}>
          <WindowFrame width={windowSize[0]} height={windowSize[1]} thickness={thickness} />
        </group>
      ))}
    </group>
  );
};

const Building = ({ params }: ViewportProps) => {
  const { width, depth, floors, floorHeight, wallThickness, windowSpacing, windowSize, sillHeight, roofType, foundationShape } = params;

  const buildingContent = useMemo(() => {
    const elements = [];
    
    // Define wall paths based on shape
    let wallPaths: { start: [number, number], end: [number, number] }[] = [];
    
    if (foundationShape === 'rectangle') {
      const w2 = width / 2;
      const d2 = depth / 2;
      wallPaths = [
        { start: [-w2, d2], end: [w2, d2] },   // Front
        { start: [w2, d2], end: [w2, -d2] },   // Right
        { start: [w2, -d2], end: [-w2, -d2] }, // Back
        { start: [-w2, -d2], end: [-w2, d2] }, // Left
      ];
    } else if (foundationShape === 'L-shape') {
      const w2 = width / 2;
      const d2 = depth / 2;
      const t = Math.min(width, depth) * 0.4; // Arm thickness
      wallPaths = [
        { start: [-w2, d2], end: [w2, d2] },
        { start: [w2, d2], end: [w2, -d2 + t] },
        { start: [w2, -d2 + t], end: [-w2 + t, -d2 + t] },
        { start: [-w2 + t, -d2 + t], end: [-w2 + t, -d2] },
        { start: [-w2 + t, -d2], end: [-w2, -d2] },
        { start: [-w2, -d2], end: [-w2, d2] },
      ];
    }

    // Generate floors
    for (let i = 0; i < floors; i++) {
      const y = i * floorHeight;
      
      wallPaths.forEach((path, index) => {
        const dx = path.end[0] - path.start[0];
        const dz = path.end[1] - path.start[1];
        const wallLen = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);

        elements.push(
          <group 
            key={`floor-${i}-wall-${index}`} 
            position={[path.start[0] + dx / 2, y, path.start[1] + dz / 2]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            <ProceduralWall 
              width={wallLen} 
              height={floorHeight} 
              thickness={wallThickness} 
              windowSpacing={windowSpacing} 
              windowSize={windowSize} 
              sillHeight={sillHeight} 
            />
          </group>
        );
      });

      // Floor Slab (simplified for now, using a shape extrude for perfect fit)
      const slabShape = new THREE.Shape();
      if (foundationShape === 'rectangle') {
        slabShape.moveTo(-width/2, -depth/2);
        slabShape.lineTo(width/2, -depth/2);
        slabShape.lineTo(width/2, depth/2);
        slabShape.lineTo(-width/2, depth/2);
      } else {
        const w2 = width / 2;
        const d2 = depth / 2;
        const t = Math.min(width, depth) * 0.4;
        slabShape.moveTo(-w2, d2);
        slabShape.lineTo(w2, d2);
        slabShape.lineTo(w2, -d2 + t);
        slabShape.lineTo(-w2 + t, -d2 + t);
        slabShape.lineTo(-w2 + t, -d2);
        slabShape.lineTo(-w2, -d2);
      }

      elements.push(
        <mesh key={`slab-${i}`} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[slabShape, { depth: 0.1, bevelEnabled: false }]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.8} />
        </mesh>
      );
    }

    // Generate Roof
    const roofY = floors * floorHeight;
    // ... (roof logic remains similar but could be adapted for shape)
    if (roofType === 'pitched') {
      elements.push(
        <mesh key="roof" position={[0, roofY + 1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[Math.max(width, depth) * 0.75, 2, 4]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
        </mesh>
      );
    } else if (roofType === 'flat') {
      elements.push(
        <mesh key="roof" position={[0, roofY + 0.05, 0]}>
          <mesh key="roof-slab" rotation={[-Math.PI / 2, 0, 0]}>
             {/* Re-use slab shape logic or similar */}
             <boxGeometry args={[width, 0.1, depth]} /> 
             <meshStandardMaterial color="#2a2a30" />
          </mesh>
        </mesh>
      );
    } else if (roofType === 'dome') {
      elements.push(
        <mesh key="roof" position={[0, roofY, 0]} castShadow>
          <sphereGeometry args={[Math.min(width, depth) / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.5} />
        </mesh>
      );
    }

    return elements;
  }, [width, depth, floors, floorHeight, wallThickness, windowSpacing, windowSize, sillHeight, roofType, foundationShape]);

  return <group>{buildingContent}</group>;
};

export const Viewport: React.FC<ViewportProps> = ({ params }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0c' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <OrbitControls makeDefault />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Building params={params} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          sectionSize={1} 
          sectionThickness={1} 
          sectionColor="#2a2a30"
        />
        
        <Environment preset="apartment" />
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.6} 
          scale={30} 
          blur={2.5} 
          far={10} 
        />
      </Canvas>
    </div>
  );
};
