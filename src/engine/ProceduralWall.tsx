import React from 'react';
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
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

const DoorModel = ({ w, h, type, depth }: { w: number, h: number, type: string, depth: number }) => {
  const fT = 0.08;
  const dC = type === 'classic' ? "#3e2723" : (type === 'double' ? "#111" : "#222");

  return (
    <group>
      {/* Frame */}
      <mesh position={[0, h/2 - fT/2, 0]}><boxGeometry args={[w + fT*2, fT, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>
      <mesh position={[-w/2 - fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>
      <mesh position={[w/2 + fT/2, 0, 0]}><boxGeometry args={[fT, h, depth]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>

      {/* Door Slab */}
      {type !== 'glass' && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w, h, depth - 0.1]} />
          <meshStandardMaterial color={dC} roughness={0.7} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Modern Details */}
      {type === 'modern' && (
        <group>
          <mesh position={[-w*0.2, 0, 0]} material={materialLib.getMaterial('glass')}>
            <boxGeometry args={[0.1, h*0.8, depth + 0.02]} />
          </mesh>
          <mesh position={[w*0.35, 0, depth/2 + 0.05]}><boxGeometry args={[0.04, h*0.6, 0.08]} /><meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} side={THREE.DoubleSide} /></mesh>
          <mesh position={[w*0.35, 0, -depth/2 - 0.05]}><boxGeometry args={[0.04, h*0.6, 0.08]} /><meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} side={THREE.DoubleSide} /></mesh>
        </group>
      )}

      {/* Glass Storefront Door */}
      {type === 'glass' && (
        <group>
          <mesh position={[0, 0, 0]} material={materialLib.getMaterial('glass')}>
            <boxGeometry args={[w, h, 0.1]} />
          </mesh>
          <mesh position={[0, h/2 - 0.05, 0]}><boxGeometry args={[w, 0.1, 0.15]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
          <mesh position={[0, -h/2 + 0.05, 0]}><boxGeometry args={[w, 0.1, 0.15]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
          <mesh position={[w*0.35, 0, depth/2 - 0.15]}><cylinderGeometry args={[0.02, 0.02, h*0.7, 8]} rotation={[0,0,0]} /><meshStandardMaterial color="#fff" metalness={0.9}/></mesh>
          <mesh position={[w*0.35, 0, -depth/2 + 0.15]}><cylinderGeometry args={[0.02, 0.02, h*0.7, 8]} rotation={[0,0,0]} /><meshStandardMaterial color="#fff" metalness={0.9}/></mesh>
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

  const extrudeArgs = React.useMemo(() => [shape, { depth: thickness, bevelEnabled: false }] as any, [shape, thickness]);

  // Window constants
  const w = windowSize[0];
  const h = windowSize[1];
  const fT = 0.06;
  const glassW = w - fT * 2;
  const glassH = h - fT * 2;
  const fC = windowType === 'modern' ? "#111" : (windowType === 'classic' ? "#f5f5f5" : (windowType === 'industrial' ? "#333" : "#5d4037"));
  const depth = 0.5;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, -thickness/2]} material={wallMaterial}>
        <extrudeGeometry args={extrudeArgs} />
      </mesh>

      <mesh position={[0, height + 0.07, 0]}>
        <boxGeometry args={[width + 0.15, 0.14, thickness + 0.3]} />
        <meshStandardMaterial color="#d8d8dc" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* WINDOW FRAMES & SILLS (Instanced) */}
      {windowPositions.length > 0 && (
        <Instances limit={1000} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={fC} side={THREE.DoubleSide} />
          {windowPositions.map((pos, i) => (
            <group key={`w-${i}`} position={[pos.x, pos.y, 0]}>
              <Instance position={[0, h/2 - fT/2, 0]} scale={[w, fT, depth]} />
              <Instance position={[0, -h/2 + fT/2, 0]} scale={[w, fT, depth]} />
              <Instance position={[-w/2 + fT/2, 0, 0]} scale={[fT, h, depth]} />
              <Instance position={[w/2 - fT/2, 0, 0]} scale={[fT, h, depth]} />
              <Instance position={[0, -h/2, 0]} scale={[w + 0.1, 0.04, depth + 0.15]} />
              
              {windowType === 'classic' && (
                <>
                  <Instance position={[0, 0, 0]} scale={[glassW, 0.03, depth + 0.02]} />
                  <Instance position={[0, 0, 0]} scale={[0.03, glassH, depth + 0.02]} />
                </>
              )}

              {windowType === 'industrial' && (
                <>
                  {Array.from({ length: 3 }).map((_, gi) => (
                    <Instance key={`h-${gi}`} position={[0, -glassH/2 + (gi+1)*glassH/4, 0]} scale={[glassW, 0.03, depth + 0.02]} color="#444" />
                  ))}
                  {Array.from({ length: 2 }).map((_, gi) => (
                    <Instance key={`v-${gi}`} position={[-glassW/2 + (gi+1)*glassW/3, 0, 0]} scale={[0.03, glassH, depth + 0.02]} color="#444" />
                  ))}
                </>
              )}
            </group>
          ))}
        </Instances>
      )}

      {/* WINDOW GLASS (Instanced) */}
      {windowPositions.length > 0 && (
        <Instances limit={100} material={materialLib.getMaterial('glass')}>
          <boxGeometry args={[1, 1, 1]} />
          {windowPositions.map((pos, i) => (
            <group key={`g-${i}`} position={[pos.x, pos.y, 0]}>
              <Instance position={[0, 0, 0]} scale={[glassW, glassH, 0.05]} />
            </group>
          ))}
        </Instances>
      )}

      {/* ARCHED WINDOW TOPS (Instanced) */}
      {windowType === 'arched' && windowPositions.length > 0 && (
        <Instances limit={100}>
          <torusGeometry args={[w/2 - fT/2, fT/2, 8, 32, Math.PI]} />
          <meshStandardMaterial color={fC} side={THREE.DoubleSide} />
          {windowPositions.map((pos, i) => (
            <group key={`a-${i}`} position={[pos.x, pos.y, 0]}>
              <Instance position={[0, h/2 - fT, 0]} />
            </group>
          ))}
        </Instances>
      )}

      {/* BALCONY SOLID PARTS (Instanced) */}
      {hasBalcony && windowPositions.length > 0 && (
        <Instances limit={500} receiveShadow castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#c8c8cc" roughness={0.6} metalness={0.05} />
          {windowPositions.map((pos, i) => {
            if (i % 2 !== 0) return null;
            const bW = w + 0.5;
            const bD = 1.3;
            const rH = 1.05;
            const slabT = 0.12;
            const balCount = Math.max(2, Math.floor((w + 0.4) / 0.4));
            
            return (
              <group key={`b-${i}`} position={[pos.x, pos.y - h/2, -(thickness / 2 + 0.05)]}>
                <Instance position={[0, -slabT/2, -bD/2]} scale={[bW, slabT, bD]} />
                <Instance position={[0, rH, -bD/2]} scale={[bW + 0.06, 0.06, bD + 0.06]} color="#222" />
                {Array.from({ length: balCount }).map((_, bi) => {
                  const bx = -bW/2 + (bi + 0.5) * (bW / balCount);
                  return <Instance key={`bu-${bi}`} position={[bx, rH/2, -bD]} scale={[0.04, rH, 0.04]} color="#444" />;
                })}
              </group>
            );
          })}
        </Instances>
      )}

      {/* BALCONY GLASS (Instanced) */}
      {hasBalcony && windowPositions.length > 0 && (
        <Instances limit={200} material={materialLib.getMaterial('glass')}>
          <boxGeometry args={[1, 1, 1]} />
          {windowPositions.map((pos, i) => {
            if (i % 2 !== 0) return null;
            const bW = w + 0.5;
            const bD = 1.3;
            const rH = 1.05;
            return (
              <group key={`bg-${i}`} position={[pos.x, pos.y - h/2, -(thickness / 2 + 0.05)]}>
                <Instance position={[0, rH/2, -bD]} scale={[bW, rH, 0.04]} />
                <Instance position={[-bW/2, rH/2, -bD/2]} scale={[0.04, rH, bD]} />
                <Instance position={[bW/2, rH/2, -bD/2]} scale={[0.04, rH, bD]} />
              </group>
            );
          })}
        </Instances>
      )}

      {/* VERTICAL RIBS (Instanced) */}
      {hasRibs && windowPositions.length > 1 && (
        <Instances limit={100}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e0e0e4" metalness={0.1} roughness={0.4} />
          {windowPositions.map((pos, i) => {
            if (i === windowPositions.length - 1) return null;
            const nextPos = windowPositions[i + 1];
            const ribX = (pos.x + nextPos.x) / 2;
            return <Instance key={`rib-${i}`} position={[ribX, height / 2, -(thickness / 2 + 0.08)]} scale={[0.18, height, 0.22]} />;
          })}
        </Instances>
      )}

      {/* DOOR */}
      {hasDoor && (
        <group position={[doorPos, doorHeight/2, 0]}>
          <DoorModel w={doorWidth} h={doorHeight} type={doorType} depth={depth} />
        </group>
      )}
    </group>
  );
};
