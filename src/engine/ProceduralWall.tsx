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

    const wCount = Math.floor(width / windowSpacing);
    const w = windowSize[0];
    const h = windowSize[1];
    const sHeight = sillHeight;

    if (wCount > 0) {
      const startX = -(wCount - 1) * windowSpacing / 2;
      for (let i = 0; i < wCount; i++) {
        const x = startX + i * windowSpacing;
        const hole = new THREE.Path();
        hole.moveTo(x - w / 2, sHeight);
        hole.lineTo(x + w / 2, sHeight);
        hole.lineTo(x + w / 2, sHeight + h);
        hole.lineTo(x - w / 2, sHeight + h);
        hole.closePath();
        s.holes.push(hole);
      }
    }
    return s;
  }, [width, height, windowSpacing, windowSize, sillHeight]);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -thickness/2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>
      {/* Simple black window frames */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#111" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
