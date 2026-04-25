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
  const {
    width, depth, floors, floorHeight, wallThickness, windowSpacing, windowSize,
    sillHeight, roofType, foundationShape,
    balconyDepth, columnRadius, columnSpacing, stairsWidth,
    showBalcony, showColumns, showStairs
  } = params;

  const buildingContent = useMemo(() => {
    const elements = [];

    // Define wall paths based on shape
    let wallPaths: { start: [number, number], end: [number, number] }[] = [];
    let corners: [number, number][] = [];

    const w2 = width / 2;
    const d2 = depth / 2;

    if (foundationShape === 'rectangle') {
      corners = [[-w2, d2], [w2, d2], [w2, -d2], [-w2, -d2]];
    } else if (foundationShape === 'L-shape') {
      const t = Math.min(width, depth) * 0.4;
      corners = [[-w2, d2], [w2, d2], [w2, -d2 + t], [-w2 + t, -d2 + t], [-w2 + t, -d2], [-w2, -d2]];
    }

    for (let i = 0; i < corners.length; i++) {
      wallPaths.push({ start: corners[i], end: corners[(i + 1) % corners.length] });
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

            {/* Balcony logic */}
            {showBalcony && i > 0 && index === 0 && (
              <group position={[0, 0, wallThickness / 2]}>
                <mesh position={[0, 0, balconyDepth / 2]}>
                  <boxGeometry args={[wallLen, 0.1, balconyDepth]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
                {/* Railing */}
                <mesh position={[0, 0.5, balconyDepth]}>
                  <boxGeometry args={[wallLen, 1, 0.05]} />
                  <meshStandardMaterial color="#111" transparent opacity={0.5} />
                </mesh>
              </group>
            )}
          </group>
        );
      });

      // Floor Slab
      const slabShape = new THREE.Shape();
      slabShape.moveTo(corners[0][0], corners[0][1]);
      for (let k = 1; k < corners.length; k++) {
        slabShape.lineTo(corners[k][0], corners[k][1]);
      }

      elements.push(
        <mesh key={`slab-${i}`} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry args={[slabShape, { depth: 0.1, bevelEnabled: false }]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.8} />
        </mesh>
      );
    }

    // Columns
    if (showColumns) {
      corners.forEach((corner, idx) => {
        elements.push(
          <mesh key={`col-${idx}`} position={[corner[0], (floors * floorHeight) / 2, corner[1]]}>
            <cylinderGeometry args={[columnRadius, columnRadius, floors * floorHeight, 16]} />
            <meshStandardMaterial color="#ccc" roughness={0.2} metalness={0.5} />
          </mesh>
        );
      });
    }

    // Stairs
    if (showStairs) {
      const stepCount = 5;
      const stepH = 0.2;
      const stepD = 0.3;
      for (let s = 0; s < stepCount; s++) {
        elements.push(
          <mesh key={`step-${s}`} position={[0, s * stepH, d2 + (s + 1) * stepD]}>
            <boxGeometry args={[stairsWidth, stepH, stepD]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        );
      }
    }

    // Generate Roof
    const roofY = floors * floorHeight;
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
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width + 0.5, depth + 0.5]} />
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
  }, [width, depth, floors, floorHeight, wallThickness, windowSpacing, windowSize, sillHeight, roofType, foundationShape, balconyDepth, columnRadius, columnSpacing, stairsWidth, showBalcony, showColumns, showStairs]);

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
