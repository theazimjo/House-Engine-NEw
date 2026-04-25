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
  hasDoor?: boolean;
  doorWidth?: number;
  doorHeight?: number;
  doorOffset?: number;
}

export const ProceduralWall: React.FC<ProceduralWallProps> = ({ 
  width, height, thickness, windowSpacing, windowSize, sillHeight, isModern, floorIndex = 0,
  hasDoor = false, doorWidth = 1.8, doorHeight = 2.4, doorOffset = 0
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
      
      // Calculate door bounds if present
      const doorX = doorOffset;
      const doorMin = hasDoor ? doorX - doorWidth / 2 - 0.2 : 9999;
      const doorMax = hasDoor ? doorX + doorWidth / 2 + 0.2 : -9999;

      for (let i = 0; i < wCount; i++) {
        const x = startX + i * windowSpacing;
        
        // Check if this window overlaps with the door
        const winMin = x - w / 2;
        const winMax = x + w / 2;
        const overlapsDoor = hasDoor && winMax > doorMin && winMin < doorMax;

        if (!overlapsDoor) {
          const hole = new THREE.Path();
          hole.moveTo(x - w / 2, sHeight);
          hole.lineTo(x + w / 2, sHeight);
          hole.lineTo(x + w / 2, sHeight + h);
          hole.lineTo(x - w / 2, sHeight + h);
          hole.closePath();
          s.holes.push(hole);
        }
      }

      // Add the door hole separately if it should exist on this wall
      if (hasDoor) {
        const hole = new THREE.Path();
        hole.moveTo(doorX - doorWidth / 2, 0);
        hole.lineTo(doorX + doorWidth / 2, 0);
        hole.lineTo(doorX + doorWidth / 2, doorHeight);
        hole.lineTo(doorX - doorWidth / 2, doorHeight);
        hole.closePath();
        s.holes.push(hole);
      }
    }
    return s;
  }, [width, height, windowSpacing, windowSize, sillHeight, floorIndex, hasDoor, doorWidth, doorHeight, doorOffset]);

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
