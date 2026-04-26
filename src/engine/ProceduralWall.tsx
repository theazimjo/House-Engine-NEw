import React from 'react';
import * as THREE from 'three';
import { materialLib } from './MaterialLibrary';
import type { MaterialType } from './MaterialLibrary';

interface ProceduralWallProps {
  width: number;
  height: number;
  thickness: number;
  windowSpacing: number;
  windowSize: [number, number];
  sillHeight: number;
  isModern?: boolean;
  hasDoor?: boolean;
  doorWidth?: number;
  doorHeight?: number;
  doorOffset?: number;
  windowType?: string;
  doorType?: string;
  materialType?: MaterialType;
  hasBalcony?: boolean;
  hasRibs?: boolean;
  plinthHeight?: number;
}

const WindowModel = ({ w, h, type }: { w: number, h: number, type: string }) => {
  const fT = 0.06;
  const glassW = w - fT * 2;
  const glassH = h - fT * 2;
  const fC = type === 'modern' ? "#111" : (type === 'classic' ? "#f5f5f5" : "#5d4037");
  const depth = 0.5; // Thicker than wall to show on both sides

  return (
    <group>
      {/* 4 Frame segments */}
      <mesh position={[0, h/2 - fT/2, 0]}><boxGeometry args={[w, fT, depth]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -h/2 + fT/2, 0]}><boxGeometry args={[w, fT, depth]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-w/2 + fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
      <mesh position={[w/2 - fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
      
      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[glassW, glassH, 0.05]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.5} metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Grid for Classic */}
      {type === 'classic' && (
        <group>
          <mesh><boxGeometry args={[glassW, 0.03, depth + 0.02]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
          <mesh><boxGeometry args={[0.03, glassH, depth + 0.02]} /><meshStandardMaterial color={fC} side={THREE.DoubleSide} /></mesh>
        </group>
      )}

      {/* Arched Top */}
      {type === 'arched' && (
        <group position={[0, h/2 - fT, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[w/2 - fT/2, fT/2, 8, 32, Math.PI]} />
            <meshStandardMaterial color={fC} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const DoorModel = ({ w, h, type }: { w: number, h: number, type: string }) => {
  const fT = 0.08;
  const dC = type === 'classic' ? "#3e2723" : (type === 'double' ? "#111" : "#222");
  const depth = 0.5;

  return (
    <group>
      {/* Frame */}
      <mesh position={[0, h/2 - fT/2, 0]}><boxGeometry args={[w + fT*2, fT, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-w/2 - fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>
      <mesh position={[w/2 + fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>

      {/* Door Slab */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, h, depth - 0.1]} />
        <meshStandardMaterial color={dC} roughness={0.7} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Modern Details */}
      {type === 'modern' && (
        <group>
          <mesh position={[-w*0.2, 0, 0]}><boxGeometry args={[0.1, h*0.8, depth + 0.02]} /><meshStandardMaterial color="#aaddff" transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>
          {/* Single elegant handle */}
          <mesh position={[w*0.35, 0, depth/2 + 0.05]}><boxGeometry args={[0.04, h*0.6, 0.08]} /><meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[w*0.35, 0, -depth/2 - 0.05]}><boxGeometry args={[0.04, h*0.6, 0.08]} /><meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} side={THREE.DoubleSide} /></mesh>
        </group>
      )}

      {/* Classic Panels */}
      {type === 'classic' && (
        <group>
          {[-0.22, 0.22].map(x => [0.4, 0, -0.4].map(y => (
             <mesh key={`${x}-${y}`} position={[x*w, y*h*0.8, depth/2 - 0.02]}>
               <boxGeometry args={[w*0.32, h*0.22, 0.05]} /><meshStandardMaterial color="#2d1d1a" side={THREE.DoubleSide} />
             </mesh>
          )))}
          <mesh position={[w*0.35, -0.1, depth/2]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[w*0.35, -0.1, -depth/2]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
        </group>
      )}

      {/* Double Door Handles */}
      {type === 'double' && (
        <group>
          <mesh position={[0.08, 0, depth/2]}><boxGeometry args={[0.03, h*0.3, 0.06]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[-0.08, 0, depth/2]}><boxGeometry args={[0.03, h*0.3, 0.06]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0.08, 0, -depth/2]}><boxGeometry args={[0.03, h*0.3, 0.06]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[-0.08, 0, -depth/2]}><boxGeometry args={[0.03, h*0.3, 0.06]} /><meshStandardMaterial color="#d4af37" metalness={1} side={THREE.DoubleSide} /></mesh>
        </group>
      )}
    </group>
  );
};

const BalconyModel = ({ w, h }: { w: number, h: number }) => {
  // NOTE: local -Z is the OUTWARD direction (wall group has Ry(π) rotation).
  // So all depth offsets use negative Z.
  const depth     = 1.3;
  const railingH  = 1.05;
  const slabT     = 0.12;
  const glassOpacity = 0.45;
  const balusterCount = Math.max(2, Math.floor((w + 0.4) / 0.4));

  return (
    <group position={[0, -h / 2, 0]}>
      {/* ── Base Slab ── */}
      <mesh position={[0, -slabT / 2, -depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.5, slabT, depth]} />
        <meshStandardMaterial color="#c8c8cc" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ── Front Glass Railing Panel ── */}
      <mesh position={[0, railingH / 2, -depth]}>
        <boxGeometry args={[w + 0.5, railingH, 0.04]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={glassOpacity} metalness={0.8} roughness={0.1} />
      </mesh>

      {/* ── Side Glass Panels ── */}
      <mesh position={[-(w + 0.5) / 2, railingH / 2, -depth / 2]}>
        <boxGeometry args={[0.04, railingH, depth]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={glassOpacity} metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[(w + 0.5) / 2, railingH / 2, -depth / 2]}>
        <boxGeometry args={[0.04, railingH, depth]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={glassOpacity} metalness={0.8} roughness={0.1} />
      </mesh>

      {/* ── Top Handrail ── */}
      <mesh position={[0, railingH, -depth / 2]}>
        <boxGeometry args={[w + 0.5 + 0.06, 0.06, depth + 0.06]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ── Vertical Balusters (steel posts) ── */}
      {Array.from({ length: balusterCount }).map((_, i) => {
        const bx = -(w + 0.5) / 2 + (i + 0.5) * ((w + 0.5) / balusterCount);
        return (
          <mesh key={i} position={[bx, railingH / 2, -depth]}>
            <boxGeometry args={[0.04, railingH, 0.04]} />
            <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
};

export const ProceduralWall: React.FC<ProceduralWallProps> = ({ 
  width, height, thickness, windowSpacing, windowSize, sillHeight, isModern,
  hasDoor = false, doorWidth = 1.8, doorHeight = 2.4, doorOffset = 0,
  windowType = 'modern', doorType = 'modern', materialType = 'bricks',
  hasBalcony = false, hasRibs = false, plinthHeight = 0
}) => {
  const wallMaterial = React.useMemo(() => materialLib.getMaterial(materialType, isModern ? "#e2e2e2" : "#f0f0f0"), [materialType, isModern]);

  const { shape, windowPositions, doorPos } = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();

    const wCount = Math.floor((width - 1) / windowSpacing);
    const w = windowSize[0];
    const h = windowSize[1];
    const winPos = [];

    const doorMin = hasDoor ? doorOffset - doorWidth / 2 - 0.4 : 9999;
    const doorMax = hasDoor ? doorOffset + doorWidth / 2 + 0.4 : -9999;

    // Use a fixed startX based on width to ensure alignment
    const startX = -(wCount - 1) * windowSpacing / 2;

    for (let i = 0; i < wCount; i++) {
      const x = startX + i * windowSpacing;
      if (!(hasDoor && x + w / 2 > doorMin && x - w / 2 < doorMax)) {
        const hole = new THREE.Path();
        const y = sillHeight;
        hole.moveTo(x - w / 2, y);
        hole.lineTo(x + w / 2, y);
        hole.lineTo(x + w / 2, y + h);
        hole.lineTo(x - w / 2, y + h);
        hole.closePath();
        s.holes.push(hole);
        winPos.push({ x, y: y + h / 2 });
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
      <mesh castShadow receiveShadow position={[0, 0, -thickness/2]} material={wallMaterial}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
      </mesh>

      {/* Decorative Cornice (Top trim) — on outer face (-Z side) */}
      <mesh position={[0, height + 0.07, 0]}>
        <boxGeometry args={[width + 0.15, 0.14, thickness + 0.3]} />
        <meshStandardMaterial color="#d8d8dc" roughness={0.5} metalness={0.1} />
      </mesh>
      
      {windowPositions.map((pos, i) => (
        <group key={i} position={[pos.x, pos.y, 0]}>
          <WindowModel w={windowSize[0]} h={windowSize[1]} type={windowType} />
          {hasBalcony && i % 2 === 0 && (
            // Place balcony on the OUTER face: local -Z is outward (Ry(π) rotation on wall group)
            <group position={[0, 0, -(thickness / 2 + 0.05)]}>
              <BalconyModel w={windowSize[0]} h={windowSize[1]} />
            </group>
          )}
        </group>
      ))}

      {/* Vertical Ribs (Architectural Fins) — on outer face (-Z) */}
      {hasRibs && windowPositions.length > 1 && windowPositions.map((pos, i) => {
        if (i === windowPositions.length - 1) return null;
        const nextPos = windowPositions[i + 1];
        const ribX = (pos.x + nextPos.x) / 2;
        return (
          <mesh key={`rib-${i}`} position={[ribX, height / 2, -(thickness / 2 + 0.08)]}>
            <boxGeometry args={[0.18, height, 0.22]} />
            <meshStandardMaterial color="#e0e0e4" metalness={0.1} roughness={0.4} />
          </mesh>
        );
      })}

      {hasDoor && (
        <group position={[doorPos, doorHeight/2, 0]}>
          <DoorModel w={doorWidth} h={doorHeight} type={doorType} />
        </group>
      )}
    </group>
  );
};
