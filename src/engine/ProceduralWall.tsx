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
  windowType?: string;
  doorType?: string;
}

const WindowModel = ({ w, h, type }: { w: number, h: number, type: string }) => {
  const fT = 0.06; // frame thickness
  const glassW = w - fT * 2;
  const glassH = h - fT * 2;
  const fC = type === 'modern' ? "#111" : (type === 'classic' ? "#f5f5f5" : "#5d4037");

  return (
    <group>
      {/* 4 Frame segments for hollow look */}
      <mesh position={[0, h/2 - fT/2, 0]}><boxGeometry args={[w, fT, 0.15]} /><meshStandardMaterial color={fC} /></mesh>
      <mesh position={[0, -h/2 + fT/2, 0]}><boxGeometry args={[w, fT, 0.15]} /><meshStandardMaterial color={fC} /></mesh>
      <mesh position={[-w/2 + fT/2, 0, 0]}><boxGeometry args={[fT, h, 0.15]} /><meshStandardMaterial color={fC} /></mesh>
      <mesh position={[w/2 - fT/2, 0, 0]}><boxGeometry args={[fT, h, 0.15]} /><meshStandardMaterial color={fC} /></mesh>
      
      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[glassW, glassH, 0.02]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Styles */}
      {type === 'classic' && (
        <group>
          <mesh><boxGeometry args={[glassW, 0.03, 0.05]} /><meshStandardMaterial color={fC} /></mesh>
          <mesh><boxGeometry args={[0.03, glassH, 0.05]} /><meshStandardMaterial color={fC} /></mesh>
        </group>
      )}

      {type === 'arched' && (
        <group position={[0, h/2 - fT, 0]}>
          <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <torusGeometry args={[w/2 - fT/2, fT/2, 8, 32, Math.PI]} />
            <meshStandardMaterial color={fC} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[w/2 - fT, 32, 0, Math.PI]} />
            <meshStandardMaterial color="#aaddff" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const DoorModel = ({ w, h, type }: { w: number, h: number, type: string }) => {
  const fT = 0.08;
  const dC = type === 'classic' ? "#4e342e" : (type === 'double' ? "#1a1a1a" : "#222");
  
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, h/2 - fT/2, 0]}><boxGeometry args={[w + fT*2, fT, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[-w/2 - fT/2, 0, 0]}><boxGeometry args={[fT, h, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[w/2 + fT/2, 0, 0]}><boxGeometry args={[fT, h, 0.2]} /><meshStandardMaterial color="#333" /></mesh>

      {/* Main Slab */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[w, h, 0.08]} />
        <meshStandardMaterial color={dC} roughness={0.9} />
      </mesh>

      {/* Recessed Panels for Classic */}
      {type === 'classic' && (
        <group position={[0, 0, 0.07]}>
          {[-0.22, 0.22].map(x => [0.4, 0, -0.4].map(y => (
            <mesh key={`${x}-${y}`} position={[x*w, y*h*0.8, 0]}>
              <boxGeometry args={[w*0.35, h*0.25, 0.02]} />
              <meshStandardMaterial color="#3e2723" />
            </mesh>
          )))}
        </group>
      )}

      {/* Double Door Split */}
      {type === 'double' && (
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.02, h, 0.02]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      )}

      {/* Handle */}
      <group position={[type === 'double' ? 0.08 : w*0.4, 0, 0.12]}>
        <mesh><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#d4af37" metalness={1} /></mesh>
        {type === 'double' && <mesh position={[-0.16, 0, 0]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#d4af37" metalness={1} /></mesh>}
      </group>
    </group>
  );
};

export const ProceduralWall: React.FC<ProceduralWallProps> = ({ 
  width, height, thickness, windowSpacing, windowSize, sillHeight, isModern, floorIndex = 0,
  hasDoor = false, doorWidth = 1.8, doorHeight = 2.4, doorOffset = 0,
  windowType = 'modern', doorType = 'modern'
}) => {
  const { shape, windowPositions, doorPos } = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();

    const wCount = Math.floor(width / windowSpacing);
    const w = windowSize[0];
    const h = windowSize[1];
    const winPos = [];

    const doorMin = hasDoor ? doorOffset - doorWidth / 2 - 0.2 : 9999;
    const doorMax = hasDoor ? doorOffset + doorWidth / 2 + 0.2 : -9999;

    if (wCount > 0) {
      const startX = -(wCount - 1) * windowSpacing / 2;
      for (let i = 0; i < wCount; i++) {
        const x = startX + i * windowSpacing;
        if (!(hasDoor && x + w / 2 > doorMin && x - w / 2 < doorMax)) {
          const hole = new THREE.Path();
          hole.moveTo(x - w / 2, sillHeight);
          hole.lineTo(x + w / 2, sillHeight);
          hole.lineTo(x + w / 2, sillHeight + h);
          hole.lineTo(x - w / 2, sillHeight + h);
          hole.closePath();
          s.holes.push(hole);
          winPos.push({ x, y: sillHeight + h/2 });
        }
      }
    }

    if (hasDoor) {
      const hole = new THREE.Path();
      hole.moveTo(doorOffset - doorWidth / 2, 0);
      hole.lineTo(doorOffset + doorWidth / 2, 0);
      hole.lineTo(doorOffset + doorWidth / 2, doorHeight);
      hole.lineTo(doorOffset - doorWidth / 2, doorHeight);
      hole.closePath();
      s.holes.push(hole);
    }

    return { shape: s, windowPositions: winPos, doorPos: doorOffset };
  }, [width, height, windowSpacing, windowSize, sillHeight, hasDoor, doorWidth, doorHeight, doorOffset]);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -thickness/2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshStandardMaterial color={isModern ? "#e2e2e2" : "#f0f0f0"} roughness={0.8} />
      </mesh>
      
      {windowPositions.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, 0]}>
          <WindowModel w={windowSize[0]} h={windowSize[1]} type={windowType} />
        </group>
      ))}

      {hasDoor && (
        <group position={[doorPos, doorHeight/2, 0]}>
          <DoorModel w={doorWidth} h={doorHeight} type={doorType} />
        </group>
      )}
    </group>
  );
};
