import * as THREE from 'three';

export type MaterialType =
  | 'concrete' | 'bricks' | 'wood' | 'metal' | 'roof_tiles'
  | 'stone' | 'plaster' | 'marble' | 'glass'
  // ── Architectural ──
  | 'limestone' | 'sandstone' | 'terracotta' | 'copper'
  | 'aged_wood' | 'worn_stone' | 'granite' | 'travertine'
  | 'stucco' | 'dark_metal' | 'bronze' | 'slate'
  // ── RDR2 / Western Game ──
  | 'weathered_wood' | 'mud_brick' | 'tin_roof' | 'rusted_iron'
  | 'painted_wood'  | 'cracked_plaster' | 'red_barn' | 'dry_stone'
  | 'tarpaper' | 'leather'
  // ── Cyberpunk / Sci-Fi ──
  | 'neon_panel' | 'neon_blue' | 'neon_pink' | 'holographic'
  | 'carbon_fiber' | 'circuit_board' | 'chrome' | 'asphalt'
  | 'wet_concrete' | 'rust_panel'
  // ── Nature ──
  | 'grass' | 'mossy_stone' | 'dirt' | 'water';

class MaterialLibrary {
  private cache: Map<string, THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial> = new Map();

  getMaterial(type: MaterialType, color?: string): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
    const resolvedColor = color || this.defaultColor(type);
    const key = `${type}-${resolvedColor}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    if (type === 'glass') {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#aaddff'),
        metalness: 0.9,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      this.cache.set(key, mat);
      return mat;
    }

    const textures = this.generateTextures(type);
    const { roughness, metalness } = this.physicalProps(type);

    const material = new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normal,
      color: new THREE.Color(resolvedColor),
      roughness,
      metalness,
      normalScale: new THREE.Vector2(1.5, 1.5),
      side: THREE.DoubleSide,
    });

    this.cache.set(key, material);
    return material;
  }

  private defaultColor(type: MaterialType): string {
    const colors: Record<MaterialType, string> = {
      concrete:    '#9a9a9a',
      bricks:      '#8e3a2f',
      wood:        '#7a5c3a',
      metal:       '#b0b8c8',
      roof_tiles:  '#5a4040',
      stone:       '#888888',
      plaster:     '#ece8e0',
      marble:      '#f5f3ef',
      glass:       '#aaddff',
      limestone:   '#e8dfc8',
      sandstone:   '#d4a96a',
      terracotta:  '#c1623c',
      copper:      '#b87333',
      aged_wood:   '#5c3d1e',
      worn_stone:  '#7a7068',
      granite:     '#6a6060',
      travertine:  '#d8cdb0',
      stucco:      '#e0d8c8',
      dark_metal:  '#3a3a45',
      bronze:      '#9c7040',
      slate:       '#4a5060',
    };
    return colors[type] || '#cccccc';
  }

  private physicalProps(type: MaterialType) {
    const props: Record<MaterialType, { roughness: number; metalness: number }> = {
      concrete:   { roughness: 0.85, metalness: 0.0 },
      bricks:     { roughness: 0.9,  metalness: 0.0 },
      wood:       { roughness: 0.8,  metalness: 0.0 },
      metal:      { roughness: 0.2,  metalness: 0.9 },
      roof_tiles: { roughness: 0.75, metalness: 0.05 },
      stone:      { roughness: 0.85, metalness: 0.0 },
      plaster:    { roughness: 0.95, metalness: 0.0 },
      marble:     { roughness: 0.15, metalness: 0.05 },
      glass:      { roughness: 0.05, metalness: 0.9 },
      limestone:  { roughness: 0.8,  metalness: 0.0 },
      sandstone:  { roughness: 0.9,  metalness: 0.0 },
      terracotta: { roughness: 0.85, metalness: 0.0 },
      copper:     { roughness: 0.4,  metalness: 0.8 },
      aged_wood:  { roughness: 0.95, metalness: 0.0 },
      worn_stone: { roughness: 0.9,  metalness: 0.0 },
      granite:    { roughness: 0.7,  metalness: 0.05 },
      travertine: { roughness: 0.75, metalness: 0.0 },
      stucco:     { roughness: 0.95, metalness: 0.0 },
      dark_metal: { roughness: 0.3,  metalness: 0.85 },
      bronze:     { roughness: 0.5,  metalness: 0.75 },
      slate:      { roughness: 0.8,  metalness: 0.05 },
    };
    return props[type] || { roughness: 0.8, metalness: 0.0 };
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
    nCtx.fillStyle = 'rgb(128,128,255)';
    nCtx.fillRect(0, 0, size, size);

    switch (type) {
      case 'marble':
      case 'travertine': {
        const base = type === 'marble' ? '#f0ede8' : '#cfc4a8';
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, size, size);
        // Veins
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * size, 0);
          ctx.bezierCurveTo(
            Math.random() * size, size / 3,
            Math.random() * size, size * 2 / 3,
            Math.random() * size, size
          );
          ctx.strokeStyle = `rgba(180,170,155,${0.08 + Math.random() * 0.12})`;
          ctx.lineWidth = 1 + Math.random() * 2;
          ctx.stroke();
          // Normal veins
          nCtx.beginPath();
          nCtx.moveTo(Math.random() * size, 0);
          nCtx.bezierCurveTo(Math.random()*size, size/3, Math.random()*size, size*2/3, Math.random()*size, size);
          nCtx.strokeStyle = 'rgba(100,100,220,0.4)';
          nCtx.lineWidth = 2;
          nCtx.stroke();
        }
        break;
      }

      case 'limestone':
      case 'sandstone': {
        const base = type === 'limestone' ? '#ddd5bc' : '#c9a060';
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, size, size);
        // Block joints
        const bW = size / 5;
        const bH = size / 8;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 6; c++) {
            const x = c * bW + (r % 2 === 0 ? 0 : bW / 2);
            const y = r * bH;
            // Slight color variation
            const v = Math.random() * 20 - 10;
            ctx.fillStyle = `rgba(${v>0?v:0},${v>0?v:0},${v>0?v:0},0.08)`;
            ctx.fillRect(x + 2, y + 2, bW - 4, bH - 4);
            // Mortar
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, bW, bH);
            // Normal
            nCtx.strokeStyle = 'rgb(80,80,200)';
            nCtx.lineWidth = 3;
            nCtx.strokeRect(x, y, bW, bH);
          }
        }
        // Noise
        for (let i = 0; i < 3000; i++) {
          const x = Math.random() * size, y = Math.random() * size;
          ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.04})`;
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'terracotta': {
        ctx.fillStyle = '#b85c38';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * size, y = Math.random() * size;
          const r = Math.floor(160 + Math.random() * 30);
          const g = Math.floor(70 + Math.random() * 20);
          ctx.fillStyle = `rgba(${r},${g},50,0.07)`;
          ctx.fillRect(x, y, 3, 3);
          nCtx.fillStyle = `rgb(${120+Math.random()*20},${120+Math.random()*20},255)`;
          nCtx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'copper': {
        ctx.fillStyle = '#a0622a';
        ctx.fillRect(0, 0, size, size);
        // Patina streaks
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * size, 0);
          ctx.lineTo(Math.random() * size, size);
          ctx.strokeStyle = `rgba(40,120,80,${0.05 + Math.random() * 0.1})`;
          ctx.lineWidth = 2 + Math.random() * 4;
          ctx.stroke();
        }
        break;
      }

      case 'bronze': {
        ctx.fillStyle = '#8c6020';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random()*size, 0);
          ctx.lineTo(Math.random()*size, size);
          ctx.strokeStyle = `rgba(60,40,10,${0.1+Math.random()*0.1})`;
          ctx.lineWidth = 1 + Math.random()*3;
          ctx.stroke();
        }
        break;
      }

      case 'worn_stone':
      case 'granite': {
        const base = type === 'granite' ? '#585050' : '#686058';
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 8000; i++) {
          const x = Math.random() * size, y = Math.random() * size;
          const s = Math.random() * 4;
          const c = Math.floor(Math.random() * 60);
          ctx.fillStyle = `rgba(${c},${c},${c},0.15)`;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
          nCtx.fillStyle = `rgb(${118+Math.random()*20},${118+Math.random()*20},255)`;
          nCtx.beginPath();
          nCtx.arc(x, y, s/2, 0, Math.PI*2);
          nCtx.fill();
        }
        break;
      }

      case 'slate': {
        ctx.fillStyle = '#3c4450';
        ctx.fillRect(0, 0, size, size);
        const layerH = size / 20;
        for (let r = 0; r < 21; r++) {
          const y = r * layerH;
          ctx.strokeStyle = `rgba(0,0,0,${0.2+Math.random()*0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y + Math.random()*4-2); ctx.stroke();
          nCtx.strokeStyle = 'rgb(90,90,210)';
          nCtx.lineWidth = 2;
          nCtx.beginPath(); nCtx.moveTo(0, y); nCtx.lineTo(size, y); nCtx.stroke();
        }
        break;
      }

      case 'stucco': {
        ctx.fillStyle = '#ddd5c0';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 80000; i++) {
          const x = Math.random()*size, y = Math.random()*size;
          const v = Math.random();
          ctx.fillStyle = `rgba(0,0,0,${v*0.03})`;
          ctx.fillRect(x, y, 1, 1);
          nCtx.fillStyle = `rgb(${122+v*12},${122+v*12},255)`;
          nCtx.fillRect(x, y, 1, 1);
        }
        break;
      }

      case 'aged_wood': {
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < size; i += 3) {
          const wave = Math.sin(i * 0.08) * 5;
          ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random()*0.1})`;
          ctx.fillRect(0, i, size, 2);
          // Cracks
          if (Math.random() < 0.05) {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(Math.random()*size, i); ctx.lineTo(Math.random()*size+wave, i+20); ctx.stroke();
          }
          nCtx.fillStyle = `rgb(128,128,${240+Math.random()*15})`;
          nCtx.fillRect(0, i, size, 2);
        }
        break;
      }

      case 'dark_metal': {
        ctx.fillStyle = '#303038';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < size; i += 8) {
          ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random()*0.03})`;
          ctx.fillRect(0, i, size, 1);
          nCtx.fillStyle = `rgb(128,128,${230+Math.random()*25})`;
          nCtx.fillRect(0, i, size, 2);
        }
        break;
      }

      case 'roof_tiles': {
        ctx.fillStyle = '#4a3a3a';
        ctx.fillRect(0, 0, size, size);
        const rows = 16, cols = 8;
        const rH = size/rows, rW = size/cols;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c*rW + (r%2===0 ? 0 : rW/2);
            ctx.fillStyle = `rgb(${65+Math.random()*15},${55+Math.random()*15},${55+Math.random()*15})`;
            ctx.beginPath(); ctx.roundRect(x+2, r*rH+2, rW-4, rH*1.2, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();
            nCtx.fillStyle = 'rgb(128,160,255)';
            nCtx.beginPath(); nCtx.roundRect(x+2, r*rH+2, rW-4, rH*1.2, 8); nCtx.fill();
          }
        }
        break;
      }

      case 'bricks': {
        ctx.fillStyle = '#7a2820';
        ctx.fillRect(0, 0, size, size);
        const rows2 = 12, cols2 = 6;
        const rH2 = size/rows2, rW2 = size/cols2;
        for (let r = 0; r < rows2; r++) {
          for (let c = 0; c < cols2; c++) {
            const x = c*rW2 + (r%2===0?0:rW2/2);
            const rv = Math.floor(Math.random()*20);
            ctx.fillStyle = `rgb(${120+rv},${40+rv/2},${35+rv/2})`;
            ctx.fillRect(x+2, r*rH2+2, rW2-4, rH2-4);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth=1; ctx.strokeRect(x,r*rH2,rW2,rH2);
            nCtx.strokeStyle='rgb(64,64,180)'; nCtx.lineWidth=5; nCtx.strokeRect(x,r*rH2,rW2,rH2);
          }
        }
        break;
      }

      case 'wood': {
        ctx.fillStyle = '#6b4c2a';
        ctx.fillRect(0, 0, size, size);
        for (let i=0; i<size; i+=4) {
          ctx.fillStyle=`rgba(0,0,0,${0.05+Math.random()*0.08})`; ctx.fillRect(0,i,size,2);
          nCtx.fillStyle=`rgb(128,128,${238+Math.random()*17})`; nCtx.fillRect(0,i,size,2);
        }
        break;
      }

      case 'metal': {
        ctx.fillStyle = '#909aaa';
        ctx.fillRect(0, 0, size, size);
        for (let i=0; i<size; i+=6) {
          ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.04})`; ctx.fillRect(0,i,size,1);
          nCtx.fillStyle=`rgb(128,128,${230+Math.random()*25})`; nCtx.fillRect(0,i,size,2);
        }
        break;
      }

      case 'plaster': {
        ctx.fillStyle = '#e5e0d5';
        ctx.fillRect(0,0,size,size);
        for (let i=0; i<60000; i++) {
          const x=Math.random()*size, y=Math.random()*size, v=Math.random();
          ctx.fillStyle=`rgba(0,0,0,${v*0.04})`; ctx.fillRect(x,y,1,1);
          nCtx.fillStyle=`rgb(${120+v*16},${120+v*16},255)`; nCtx.fillRect(x,y,2,2);
        }
        break;
      }

      default: // concrete, stone
      {
        ctx.fillStyle = '#909090';
        ctx.fillRect(0,0,size,size);
        for (let i=0; i<15000; i++) {
          const x=Math.random()*size, y=Math.random()*size, s=Math.random()*2, v=Math.random();
          ctx.fillStyle=`rgba(0,0,0,${v*0.09})`; ctx.fillRect(x,y,s,s);
          nCtx.fillStyle=`rgb(${120+v*20},${120+v*20},255)`; nCtx.fillRect(x,y,s,s);
        }
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
