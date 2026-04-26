import * as THREE from 'three';

export type MaterialType = 'concrete' | 'bricks' | 'wood' | 'metal';

class MaterialLibrary {
  private cache: Map<string, THREE.MeshStandardMaterial> = new Map();

  getMaterial(type: MaterialType, color: string = '#ffffff'): THREE.MeshStandardMaterial {
    const key = `${type}-${color}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const textures = this.generateTextures(type);
    const material = new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normal,
      roughnessMap: textures.roughness,
      color: new THREE.Color(color),
      roughness: type === 'metal' ? 0.2 : 0.8,
      metalness: type === 'metal' ? 0.9 : 0.05,
      normalScale: new THREE.Vector2(2.0, 2.0)
    });

    this.cache.set(key, material);
    return material;
  }

  private generateTextures(type: MaterialType) {
    const size = 1024; // Increased resolution
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const nCtx = nCanvas.getContext('2d')!;

    // Initialize Normal Map with neutral flat blue
    nCtx.fillStyle = 'rgb(128, 128, 255)';
    nCtx.fillRect(0, 0, size, size);

    if (type === 'bricks') {
      ctx.fillStyle = '#8e2b2b';
      ctx.fillRect(0, 0, size, size);
      
      const rows = 12;
      const cols = 6;
      const rH = size / rows;
      const rW = size / cols;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * rW + (r % 2 === 0 ? 0 : rW / 2);
          
          // Brick Face
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, r * rH + 2, rW - 4, rH - 4);

          // Normal Map: Mortar lines as deep blue (pointing in)
          nCtx.strokeStyle = 'rgb(64, 64, 180)';
          nCtx.lineWidth = 6;
          nCtx.strokeRect(x, r * rH, rW, rH);
          
          // Add some noise to brick face normal
          for(let i=0; i<10; i++) {
            const nx = x + Math.random() * rW;
            const ny = r * rH + Math.random() * rH;
            nCtx.fillStyle = `rgba(140, 140, 255, 0.5)`;
            nCtx.fillRect(nx, ny, 4, 4);
          }
        }
      }
    } else if (type === 'wood') {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < size; i += 4) {
        const h = Math.random() * 20;
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(0, i, size, 2);
        
        // Wood grain in normal map
        nCtx.fillStyle = `rgb(128, 128, ${240 + Math.random() * 15})`;
        nCtx.fillRect(0, i, size, 2);
      }
    } else {
      // Concrete
      ctx.fillStyle = '#999999';
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const s = Math.random() * 2;
        const val = Math.random();
        ctx.fillStyle = `rgba(0,0,0,${val * 0.1})`;
        ctx.fillRect(x, y, s, s);
        
        // Noise in normal map
        nCtx.fillStyle = `rgb(${120 + val * 20}, ${120 + val * 20}, 255)`;
        nCtx.fillRect(x, y, s, s);
      }
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    const normal = new THREE.CanvasTexture(nCanvas);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    
    return { map, normal, roughness: null };
  }
}

export const materialLib = new MaterialLibrary();
