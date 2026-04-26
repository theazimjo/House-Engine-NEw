import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { ProceduralWall } from './engine/ProceduralWall';
import { materialLib } from './engine/MaterialLibrary';
import { processGraph } from './engine/graphProcessor';
import type { ViewportProps } from './types';

// ── Building Renderer ────────────────────────────────────────────────────────
const BuildingRenderer = ({ nodes, edges }: ViewportProps) => {
  const processedBuilding = useMemo(() => processGraph(nodes, edges), [nodes, edges]);

  return (
    <group>
      {processedBuilding.map((part: any, idx: number) => {
        if (!part) return null;

        const elements: React.ReactNode[] = [];
        const {
          spline, floors = 1, floorHeight = 3,
          wallThickness = 0.2,
          style, offset = [0, 0, 0],
          twist, taper = 1, shear, jitter = 0,
          zOffset = 0
        } = part;
        const [ox, oy_orig, oz] = offset;
        const oy = oy_orig + zOffset;
        const isModern = style === 'modern';

        // ── Detailed Floors ──
        if (part.detailed && spline) {
          for (let f = 0; f < floors; f++) {
            const t = f / Math.max(1, floors - 1);
            const wSpacing = part.winSpacing || 2.5;
            const wSize: [number, number] = [part.winWidth || 1.2, part.winHeight || 1.8];

            let currentTwist = 0;
            if (twist) {
              currentTwist = t < 0.5
                ? THREE.MathUtils.lerp(twist.base, twist.mid, t * 2)
                : THREE.MathUtils.lerp(twist.mid, twist.top, (t - 0.5) * 2);
            }
            const rotationRad = (currentTwist * Math.PI) / 180;
            const currentScale = THREE.MathUtils.lerp(1, taper, t);
            const shearOffsetX = shear ? shear.x * t : 0;
            const shearOffsetZ = shear ? shear.y * t : 0;
            const jitterX = (Math.random() - 0.5) * jitter;
            const jitterZ = (Math.random() - 0.5) * jitter;
            const floorY = f * floorHeight + oy;

            const rotatePoint = (pt: [number, number]): [number, number] => {
              const s = Math.sin(rotationRad);
              const c = Math.cos(rotationRad);
              const rx = pt[0] * currentScale;
              const rz = pt[1] * currentScale;
              return [rx * c - rz * s, rx * s + rz * c];
            };

            // Corner pillars
            spline.forEach((p: any, pIdx: number) => {
              const pRot = rotatePoint(p);
              elements.push(
                <mesh
                  key={`pillar-${idx}-${f}-${pIdx}`}
                  position={[pRot[0] + ox + shearOffsetX + jitterX, floorY + floorHeight / 2, pRot[1] + oz + shearOffsetZ + jitterZ]}
                >
                  <boxGeometry args={[wallThickness * 1.1, floorHeight, wallThickness * 1.1]} />
                  <meshStandardMaterial color="#ccc" />
                </mesh>
              );
            });

            // Walls
            spline.forEach((p: any, i: number) => {
              const next = spline[(i + 1) % spline.length];

              let shouldHaveDoor = false;
              if (f === 0) {
                const side = part.doorSide || 'front';
                if (side === 'all') shouldHaveDoor = true;
                else if (side === 'front'     && i === 0) shouldHaveDoor = true;
                else if (side === 'frontback' && (i === 0 || i === Math.floor(spline.length / 2))) shouldHaveDoor = true;
                else if (side === 'sides'     && (i === Math.floor(spline.length / 4) || i === Math.floor(spline.length * 3 / 4))) shouldHaveDoor = true;
              }

              const pRot = rotatePoint(p);
              const nextRot = rotatePoint(next);
              const dx = nextRot[0] - pRot[0];
              const dz = nextRot[1] - pRot[1];
              const len = Math.sqrt(dx * dx + dz * dz);
              const angle = Math.atan2(dx, dz);

              elements.push(
                <group
                  key={`wall-${idx}-${f}-${i}`}
                  position={[pRot[0] + dx / 2 + ox + shearOffsetX + jitterX, floorY, pRot[1] + dz / 2 + oz + shearOffsetZ + jitterZ]}
                  rotation={[0, angle + Math.PI / 2, 0]}
                >
                  <ProceduralWall
                    width={len} height={floorHeight} thickness={wallThickness || 0.25}
                    windowSpacing={wSpacing} windowSize={wSize} sillHeight={0.9}
                    isModern={isModern}
                    hasDoor={shouldHaveDoor}
                    doorWidth={part.doorWidth  || 1.8}
                    doorHeight={part.doorHeight || 2.4}
                    doorOffset={part.doorOffset || 0}
                    windowType={part.windowType}
                    doorType={part.doorType}
                    materialType={part.material}
                    hasBalcony={part.hasBalcony}
                    hasRibs={part.hasRibs}
                    plinthHeight={f === 0 ? part.plinthHeight : 0}
                  />
                </group>
              );
            });
          }
        }

        // ── Roof ──
        if (part.roof && spline) {
          const roofY = (part.baseHeight || 0) + oy;
          const { roofType, overhang = 0.5, color = '#8e2b2b', deformation, height = 2 } = part;
          const { twist: rTwist = { base: 0, mid: 0, top: 0 }, taper: rTaper = 1 } = deformation || {};

          const t = 1.0;
          const rotationRad = (rTwist.base + (rTwist.mid - rTwist.base) * t + (rTwist.top - rTwist.mid) * t) * (Math.PI / 180);
          const currentScale = 1.0 + (rTaper - 1.0) * t;

          const getTP = (p: [number, number], sx = 1.0, sz = 1.0) => {
            const s = Math.sin(rotationRad);
            const c = Math.cos(rotationRad);
            const rx = p[0] * currentScale * sx;
            const rz = p[1] * currentScale * sz;
            const mag = Math.sqrt(rx * rx + rz * rz);
            const dir = mag > 0 ? [rx / mag, rz / mag] : [0, 0];
            const px = rx + dir[0] * overhang;
            const pz = rz + dir[1] * overhang;
            return [px * c - pz * s, px * s + pz * c];
          };

          const basePoints = spline.map((p: any) => getTP(p, 1.0, 1.0));
          let topSX = 1.0, topSZ = 1.0;
          if      (roofType === 'hip')                         { topSX = 0.05; topSZ = 0.05; }
          else if (roofType === 'gable' || roofType === 'pitched') { topSX = 0.01; topSZ = 1.0; }
          else if (roofType === 'mansard')                     { topSX = 0.6;  topSZ = 0.6; }

          const topPoints = spline.map((p: any) => getTP(p, topSX, topSZ));
          const roofH = roofType === 'flat' ? 0.1 : height;
          const vertices: number[] = [];

          for (let i = 0; i < basePoints.length; i++) {
            const next = (i + 1) % basePoints.length;
            const p1B = basePoints[i]; const p2B = basePoints[next];
            const p1T = roofType === 'shed' ? [p1B[0], p1B[1]] : topPoints[i];
            const p2T = roofType === 'shed' ? [p2B[0], p2B[1]] : topPoints[next];
            const h1 = roofType === 'shed' ? (p1B[0] + 7) * 0.2 : roofH;
            const h2 = roofType === 'shed' ? (p2B[0] + 7) * 0.2 : roofH;
            vertices.push(p1B[0], p1B[1], 0, p2B[0], p2B[1], 0, p2T[0], p2T[1], h2);
            vertices.push(p1B[0], p1B[1], 0, p2T[0], p2T[1], h2, p1T[0], p1T[1], h1);
          }
          for (let i = 1; i < topPoints.length - 1; i++) {
            const h0 = roofType === 'shed' ? (topPoints[0][0] + 7) * 0.2 : roofH;
            const hi = roofType === 'shed' ? (topPoints[i][0] + 7) * 0.2 : roofH;
            const hi1 = roofType === 'shed' ? (topPoints[i + 1][0] + 7) * 0.2 : roofH;
            vertices.push(topPoints[0][0], topPoints[0][1], h0, topPoints[i][0], topPoints[i][1], hi, topPoints[i + 1][0], topPoints[i + 1][1], hi1);
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          const uvs: number[] = [];
          for (let i = 0; i < vertices.length; i += 3) uvs.push(vertices[i] * 0.5, vertices[i + 1] * 0.5);
          geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
          geometry.computeVertexNormals();
          const roofMat = materialLib.getMaterial('roof_tiles', color);

          elements.push(
            <mesh key={`roof-${idx}`} position={[ox, roofY + 0.01, oz]} rotation={[-Math.PI / 2, 0, 0]} castShadow geometry={geometry} material={roofMat} />
          );
        }

        // ── Floor Slab ──
        if (part.type === 'floor_slab') {
          const { spline: sl, baseHeight = 0 } = part;
          if (!sl) return null;
          const shape = new THREE.Shape();
          sl.forEach((p: any, i: number) => { i === 0 ? shape.moveTo(p[0], p[1]) : shape.lineTo(p[0], p[1]); });
          shape.closePath();
          return (
            <mesh key={`slab-${idx}`} position={[ox, oy + baseHeight + 0.02, oz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
              <meshStandardMaterial color="#333" roughness={0.7} />
            </mesh>
          );
        }

        // ── Interior Partition ──
        if (part.type === 'interior_partition') {
          const { baseHeight = 0, floorHeight: fh = 3 } = part;
          const bbox = new THREE.Box2();
          spline?.forEach((p: any) => bbox.expandByPoint(new THREE.Vector2(p[0], p[1])));
          const center = bbox.getCenter(new THREE.Vector2());
          const size = bbox.getSize(new THREE.Vector2());
          return (
            <group key={`interior-${idx}`} position={[ox + center.x, oy + baseHeight + fh / 2, oz + center.y]}>
              <mesh><boxGeometry args={[size.x * 0.98, fh, 0.2]} /><meshStandardMaterial color="#f5e6d3" side={THREE.DoubleSide} /></mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[size.y * 0.98, fh, 0.2]} /><meshStandardMaterial color="#f5e6d3" side={THREE.DoubleSide} /></mesh>
            </group>
          );
        }

        // ── Plinth Mesh ──
        if (part.type === 'plinth_mesh') {
          const { spline: ps, height: ph, zOffset: pz = 0 } = part;
          if (!ps || ps.length < 3) return null;
          const pShape = new THREE.Shape();
          pShape.moveTo(ps[0][0], ps[0][1]);
          ps.slice(1).forEach((p: any) => pShape.lineTo(p[0], p[1]));
          pShape.closePath();
          return (
            <mesh key={`plinth-${idx}`} position={[ox || 0, (oy || 0) + pz, oz || 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <extrudeGeometry args={[pShape, { depth: ph, bevelEnabled: false }]} />
              <meshStandardMaterial color="#999" side={THREE.DoubleSide} roughness={0.5} metalness={0.2} />
            </mesh>
          );
        }

        // ── Stairs Step ──
        if (part.type === 'stairs_step') {
          const { position, rotation, args } = part;
          return (
            <mesh key={`stairs-${idx}`} position={[position[0], position[1] + args[1] / 2, position[2]]} rotation={rotation} castShadow receiveShadow>
              <boxGeometry args={args} />
              <meshStandardMaterial color="#666" />
            </mesh>
          );
        }

        // ── Column ──
        if (part.type === 'column') {
          const { position, radius, height, material = 'concrete' } = part;
          const colMat = materialLib.getMaterial(material);
          return (
            <mesh key={`col-${idx}`} position={[position[0], position[1] + height / 2, position[2]]} material={colMat} castShadow>
              <cylinderGeometry args={[radius, radius, height, 16]} />
            </mesh>
          );
        }

        // ── Primitives ──
        if (part.type === 'primitive_box') {
          return (
            <mesh key={`pbox-${idx}`} position={part.position} castShadow receiveShadow>
              <boxGeometry args={part.args} />
              <meshStandardMaterial color="#888" roughness={0.7} />
            </mesh>
          );
        }

        if (part.type === 'primitive_cylinder') {
          return (
            <mesh key={`pcyl-${idx}`} position={part.position} castShadow receiveShadow>
              <cylinderGeometry args={part.args} />
              <meshStandardMaterial color="#888" roughness={0.7} />
            </mesh>
          );
        }

        // ── Boolean Subtract (Fallback just renders Mesh A for now if CSG is too heavy, but we installed three-bvh-csg!) ──
        if (part.type === 'boolean_subtract') {
           // Basic fallback: just render A
           return (
             <group key={`csg-${idx}`}>
               <BuildingRenderer nodes={nodes} edges={edges} customOutputs={part.meshA} />
             </group>
           );
        }

        // ── Scatter Instance (tree / prop placeholder) ──
        if (part.type === 'scatter_instance') {
          const { position, scale = 1, rotation: rot = 0 } = part;
          const h = 2.5 * scale;
          const r = 0.4 * scale;
          return (
            <group key={`scatter-${idx}`} position={[position[0], position[1], position[2]]} rotation={[0, rot, 0]}>
              {/* Trunk */}
              <mesh position={[0, h * 0.3, 0]} castShadow>
                <cylinderGeometry args={[r * 0.25, r * 0.35, h * 0.6, 6]} />
                <meshStandardMaterial color="#5d4037" roughness={0.9} />
              </mesh>
              {/* Canopy */}
              <mesh position={[0, h * 0.75, 0]} castShadow>
                <coneGeometry args={[r * 1.6, h * 0.7, 7]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.85} />
              </mesh>
              <mesh position={[0, h * 0.95, 0]} castShadow>
                <coneGeometry args={[r * 1.1, h * 0.55, 6]} />
                <meshStandardMaterial color="#388e3c" roughness={0.85} />
              </mesh>
            </group>
          );
        }

        // ── Full Volume / Foundation Slab ──
        if ((part.type === 'full_volume' || part.type === 'foundation_slab') && Array.isArray(spline) && spline.length > 0) {
          const slabShape = new THREE.Shape();
          slabShape.moveTo(spline[0][0], spline[0][1]);
          spline.slice(1).forEach((p: any) => slabShape.lineTo(p[0], p[1]));
          elements.push(
            <mesh key={`slab-${idx}`} position={[ox, oy, oz]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry args={[slabShape, { depth: 0.1, bevelEnabled: false }]} />
              <meshStandardMaterial color={isModern ? '#fff' : part.type === 'foundation_slab' ? '#1e1e24' : '#222'} roughness={0.8} />
            </mesh>
          );
        }

        return <React.Fragment key={idx}>{elements}</React.Fragment>;
      })}
    </group>
  );
};

// ── Scene (for export access) ─────────────────────────────────────────────────
interface SceneProps extends ViewportProps {
  onSceneReady: (scene: THREE.Scene) => void;
  customOutputs?: any[];
}

const SceneRenderer = ({ nodes, edges, customOutputs, onSceneReady }: SceneProps) => {
  const meshOutputs = customOutputs || useMemo(() => {
    return processGraph(nodes, edges);
  }, [nodes, edges]);
  const groupRef = useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (groupRef.current) {
      onSceneReady(groupRef.current.parent as THREE.Scene);
    }
  });

  return (
    <group ref={groupRef}>
      <BuildingRenderer nodes={nodes} edges={edges} />
    </group>
  );
};

// ── Viewport ──────────────────────────────────────────────────────────────────
export interface ViewportHandle {
  exportGLTF: () => void;
  exportOBJ: () => void;
}

export const Viewport = forwardRef<ViewportHandle, ViewportProps>(({ nodes, edges }, ref) => {
  const sceneRef = useRef<THREE.Scene | null>(null);

  useImperativeHandle(ref, () => ({
    exportGLTF: () => {
      if (!sceneRef.current) { alert('Scene not ready'); return; }
      const exporter = new GLTFExporter();
      exporter.parse(
        sceneRef.current,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href     = url;
          a.download = 'building.glb';
          a.click();
          URL.revokeObjectURL(url);
        },
        (err) => { console.error('GLTF export error:', err); alert('Export failed — see console'); },
        { binary: true }
      );
    },
    exportOBJ: () => {
      if (!sceneRef.current) { alert('Scene not ready'); return; }
      const exporter = new OBJExporter();
      const result = exporter.parse(sceneRef.current);
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'building.obj';
      a.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0c' }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={45} far={2000} />
        <OrbitControls makeDefault minDistance={5} maxDistance={1000} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />

        <SceneRenderer nodes={nodes} edges={edges} onSceneReady={(s) => { sceneRef.current = s; }} />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>

        <Grid
          args={[100, 100]}
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1a1a2e"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#16213e"
          fadeDistance={80}
          fadeStrength={1}
        />

        <Environment preset="city" />
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={50} blur={2} far={12} />
      </Canvas>
    </div>
  );
});

Viewport.displayName = 'Viewport';
