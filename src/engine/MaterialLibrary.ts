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
      roughness: 1,
      metalness: type === 'metal' ? 0.8 : 0.1,
    });

    this.cache.set(key, material);
    return material;
  }

  private generateTextures(type: MaterialType) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const nCtx = nCanvas.getContext('2d')!;

    if (type === 'bricks') {
      // Base Color
      ctx.fillStyle = '#8e2b2b';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 4;
      
      nCtx.fillStyle = 'rgb(128, 128, 255)'; // Flat normal
      nCtx.fillRect(0, 0, size, size);

      const rows = 8;
      const cols = 4;
      const rH = size / rows;
      const rW = size / cols;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * rW + (r % 2 === 0 ? 0 : rW / 2);
          ctx.strokeRect(x, r * rH, rW, rH);
          // Normal map for mortar (pushed in)
          nCtx.strokeStyle = 'rgb(100, 100, 200)';
          nCtx.strokeRect(x, r * rH, rW, rH);
        }
      }
    } else if (type === 'wood') {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
        ctx.fillRect(0, Math.random() * size, size, 2);
      }
      nCtx.fillStyle = 'rgb(128, 128, 255)';
      nCtx.fillRect(0, 0, size, size);
    } else {
      // Concrete/Default
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const s = Math.random() * 2;
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
        ctx.fillRect(x, y, s, s);
      }
      nCtx.fillStyle = 'rgb(128, 128, 255)';
      nCtx.fillRect(0, 0, size, size);
    }

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2, 2);

    const normal = new THREE.CanvasTexture(nCanvas);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(2, 2);

    return { map, normal, roughness: null };
  }
}

export const materialLib = new MaterialLibrary();
