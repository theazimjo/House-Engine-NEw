import React from 'react';
import * as THREE from 'three';

interface ProceduralWallProps {
  width: number;
  height: number;
  thickness: number;
  windowSpacing: number;
  windowSize: [number, number];
  sillHeight: number;
}

export const ProceduralWall: React.FC<ProceduralWallProps> = ({ 
  width, height, thickness, windowSpacing, windowSize, sillHeight 
}) => {
  const shape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();

    // Create window holes
    const windowCount = Math.floor(width / windowSpacing);
    if (windowCount > 0) {
      const startX = -(windowCount - 1) * windowSpacing / 2;

      for (let i = 0; i < windowCount; i++) {
        const hole = new THREE.Path();
        const x = startX + i * windowSpacing;
        const y = sillHeight;
        const w = windowSize[0];
        const h = windowSize[1];
        
        hole.moveTo(x - w / 2, y);
        hole.lineTo(x + w / 2, y);
        hole.lineTo(x + w / 2, y + h);
        hole.lineTo(x - w / 2, y + h);
        hole.closePath();
        s.holes.push(hole);
      }
    }
    return s;
  }, [width, height, windowSpacing, windowSize, sillHeight]);

  return (
    <mesh castShadow receiveShadow>
      <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
      <meshStandardMaterial color="#45454b" roughness={0.7} metalness={0.1} />
    </mesh>
  );
};
