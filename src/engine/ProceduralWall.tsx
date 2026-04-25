import React from 'react';
import * as THREE from 'three';

interface ProceduralWallProps {
  width: number;
  height: number;
  thickness: number;
  windowSpacing: number;
  windowSize: [number, number];
  sillHeight: number;
  isModern?: boolean;
  floorIndex?: number;
}

export const ProceduralWall: React.FC<ProceduralWallProps> = ({ 
  width, height, thickness, windowSpacing, windowSize, sillHeight, isModern, floorIndex = 0
}) => {
  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();

    const wCount = Math.floor(width / windowSpacing);
    const w = windowSize[0];
    const h = windowSize[1];
    const sHeight = sillHeight;

    if (wCount > 0) {
      const startX = -(wCount - 1) * windowSpacing / 2;
      for (let i = 0; i < wCount; i++) {
        const x = startX + i * windowSpacing;
        const hole = new THREE.Path();
        
        // Door logic for first floor
        const isDoor = floorIndex === 0 && i === Math.floor(wCount / 2);
        const holeWidth = isDoor ? Math.max(1.5, w * 1.2) : w;
        const holeHeight = isDoor ? height * 0.8 : h;
        const holeSill = isDoor ? 0 : sHeight;

        hole.moveTo(x - holeWidth / 2, holeSill);
        hole.lineTo(x + holeWidth / 2, holeSill);
        hole.lineTo(x + holeWidth / 2, holeSill + holeHeight);
        hole.lineTo(x - holeWidth / 2, holeSill + holeHeight);
        hole.closePath();
        s.holes.push(hole);
      }
    }
    return s;
  }, [width, height, windowSpacing, windowSize, sillHeight, floorIndex]);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -thickness/2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshStandardMaterial color={isModern ? "#e2e2e2" : "#f0f0f0"} roughness={0.8} />
      </mesh>
      
      {/* Visual Door/Window Frames */}
      <mesh position={[0, height/2, -thickness/4]}>
        <planeGeometry args={[width * 0.98, height * 0.98]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
