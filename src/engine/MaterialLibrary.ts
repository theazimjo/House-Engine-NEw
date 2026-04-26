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

    // ── Special physical materials ──
    if (type === 'glass') {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#aaddff'), metalness: 0.9, roughness: 0.05,
        transmission: 0.9, transparent: true, opacity: 0.65, side: THREE.DoubleSide,
      });
      this.cache.set(key, mat); return mat;
    }
    if (type === 'holographic') {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#44ffee'), metalness: 0.95, roughness: 0.02,
        transmission: 0.6, transparent: true, opacity: 0.75,
        emissive: new THREE.Color('#44ffee'), emissiveIntensity: 0.8,
        side: THREE.DoubleSide,
      });
      this.cache.set(key, mat); return mat;
    }
    if (type === 'water') {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1a3880'), metalness: 0.1, roughness: 0.05,
        transmission: 0.7, transparent: true, opacity: 0.85,
        side: THREE.DoubleSide,
      });
      this.cache.set(key, mat); return mat;
    }
    if (type === 'chrome') {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e0e0f0'), metalness: 1.0, roughness: 0.02,
        envMapIntensity: 2.0, side: THREE.DoubleSide,
      });
      this.cache.set(key, mat); return mat;
    }

    const textures = this.generateTextures(type);
    const props = this.physicalProps(type);
    const { roughness, metalness } = props;

    const material = new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normal,
      color: new THREE.Color(resolvedColor),
      roughness,
      metalness,
      normalScale: new THREE.Vector2(1.5, 1.5),
      side: THREE.DoubleSide,
      ...(props.emissive ? {
        emissive: new THREE.Color(props.emissive),
        emissiveIntensity: props.emissiveIntensity || 1.0,
      } : {}),
    });

    this.cache.set(key, material);
    return material;
  }

  private defaultColor(type: MaterialType): string {
    const colors: Record<MaterialType, string> = {
      // Core
      concrete:       '#9a9a9a',
      bricks:         '#8e3a2f',
      wood:           '#7a5c3a',
      metal:          '#b0b8c8',
      roof_tiles:     '#5a4040',
      stone:          '#888888',
      plaster:        '#ece8e0',
      marble:         '#f5f3ef',
      glass:          '#aaddff',
      // Architectural
      limestone:      '#e8dfc8',
      sandstone:      '#d4a96a',
      terracotta:     '#c1623c',
      copper:         '#b87333',
      aged_wood:      '#5c3d1e',
      worn_stone:     '#7a7068',
      granite:        '#6a6060',
      travertine:     '#d8cdb0',
      stucco:         '#e0d8c8',
      dark_metal:     '#3a3a45',
      bronze:         '#9c7040',
      slate:          '#4a5060',
      // RDR2 / Western
      weathered_wood: '#7a6a58',
      mud_brick:      '#9a7a5a',
      tin_roof:       '#8a8070',
      rusted_iron:    '#7a3a1a',
      painted_wood:   '#c8a878',
      cracked_plaster:'#ddd5c5',
      red_barn:       '#8a2a1a',
      dry_stone:      '#8a8070',
      tarpaper:       '#2a2520',
      leather:        '#7a4a2a',
      // Cyberpunk
      neon_panel:     '#ff4500',
      neon_blue:      '#00aaff',
      neon_pink:      '#ff00aa',
      holographic:    '#88ffee',
      carbon_fiber:   '#1a1a1a',
      circuit_board:  '#1a3a1a',
      chrome:         '#e8e8f0',
      asphalt:        '#1a1a1c',
      wet_concrete:   '#606070',
      rust_panel:     '#6a3a20',
      // Nature
      grass:          '#3a5a30',
      mossy_stone:    '#4a5a40',
      dirt:           '#6a4a30',
      water:          '#2040a0',
    };
    return colors[type] || '#cccccc';
  }

  private physicalProps(type: MaterialType) {
    const props: Record<MaterialType, { roughness: number; metalness: number; emissive?: string; emissiveIntensity?: number }> = {
      // Core
      concrete:       { roughness: 0.85, metalness: 0.0 },
      bricks:         { roughness: 0.9,  metalness: 0.0 },
      wood:           { roughness: 0.8,  metalness: 0.0 },
      metal:          { roughness: 0.2,  metalness: 0.9 },
      roof_tiles:     { roughness: 0.75, metalness: 0.05 },
      stone:          { roughness: 0.85, metalness: 0.0 },
      plaster:        { roughness: 0.95, metalness: 0.0 },
      marble:         { roughness: 0.15, metalness: 0.05 },
      glass:          { roughness: 0.05, metalness: 0.9 },
      // Architectural
      limestone:      { roughness: 0.8,  metalness: 0.0 },
      sandstone:      { roughness: 0.9,  metalness: 0.0 },
      terracotta:     { roughness: 0.85, metalness: 0.0 },
      copper:         { roughness: 0.4,  metalness: 0.8 },
      aged_wood:      { roughness: 0.95, metalness: 0.0 },
      worn_stone:     { roughness: 0.9,  metalness: 0.0 },
      granite:        { roughness: 0.7,  metalness: 0.05 },
      travertine:     { roughness: 0.75, metalness: 0.0 },
      stucco:         { roughness: 0.95, metalness: 0.0 },
      dark_metal:     { roughness: 0.3,  metalness: 0.85 },
      bronze:         { roughness: 0.5,  metalness: 0.75 },
      slate:          { roughness: 0.8,  metalness: 0.05 },
      // RDR2 / Western
      weathered_wood: { roughness: 0.98, metalness: 0.0 },
      mud_brick:      { roughness: 0.97, metalness: 0.0 },
      tin_roof:       { roughness: 0.65, metalness: 0.55 },
      rusted_iron:    { roughness: 0.9,  metalness: 0.4 },
      painted_wood:   { roughness: 0.75, metalness: 0.0 },
      cracked_plaster:{ roughness: 0.97, metalness: 0.0 },
      red_barn:       { roughness: 0.9,  metalness: 0.0 },
      dry_stone:      { roughness: 0.95, metalness: 0.0 },
      tarpaper:       { roughness: 0.99, metalness: 0.0 },
      leather:        { roughness: 0.7,  metalness: 0.0 },
      // Cyberpunk — emissives
      neon_panel:     { roughness: 0.3, metalness: 0.6, emissive: '#ff2200', emissiveIntensity: 2.5 },
      neon_blue:      { roughness: 0.3, metalness: 0.6, emissive: '#0088ff', emissiveIntensity: 3.0 },
      neon_pink:      { roughness: 0.3, metalness: 0.6, emissive: '#ff00cc', emissiveIntensity: 3.0 },
      holographic:    { roughness: 0.05, metalness: 0.9, emissive: '#44ffee', emissiveIntensity: 0.8 },
      carbon_fiber:   { roughness: 0.3, metalness: 0.6 },
      circuit_board:  { roughness: 0.5, metalness: 0.3, emissive: '#00ff44', emissiveIntensity: 0.4 },
      chrome:         { roughness: 0.05, metalness: 1.0 },
      asphalt:        { roughness: 0.98, metalness: 0.0 },
      wet_concrete:   { roughness: 0.5,  metalness: 0.1 },
      rust_panel:     { roughness: 0.9,  metalness: 0.3 },
      // Nature
      grass:          { roughness: 0.95, metalness: 0.0 },
      mossy_stone:    { roughness: 0.9,  metalness: 0.0 },
      dirt:           { roughness: 0.98, metalness: 0.0 },
      water:          { roughness: 0.05, metalness: 0.1 },
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

      // ── RDR2 / Western ────────────────────────────────────────────────────────
      case 'weathered_wood': {
        ctx.fillStyle = '#6a5a48'; ctx.fillRect(0,0,size,size);
        // Horizontal planks with gaps
        const plankH = size/14;
        for (let r=0; r<15; r++) {
          const y = r*plankH;
          const v = Math.random()*30;
          ctx.fillStyle = `rgb(${90+v},${75+v},${58+v})`;
          ctx.fillRect(0, y+1, size, plankH-2);
          // Grain lines
          for (let g=0; g<size; g+=3) {
            ctx.fillStyle=`rgba(0,0,0,${0.04+Math.random()*0.06})`;
            ctx.fillRect(g, y+1, 1, plankH-2);
          }
          // Cracks
          if (Math.random()<0.4) {
            ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(Math.random()*size, y); ctx.lineTo(Math.random()*size, y+plankH); ctx.stroke();
            nCtx.strokeStyle='rgb(80,80,200)'; nCtx.lineWidth=2;
            nCtx.beginPath(); nCtx.moveTo(Math.random()*size, y); nCtx.lineTo(Math.random()*size, y+plankH); nCtx.stroke();
          }
          ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0, y+plankH-1, size, 2);
          nCtx.fillStyle='rgb(80,80,200)'; nCtx.fillRect(0, y+plankH-1, size, 3);
        }
        // Nail spots
        for (let n=0; n<20; n++) {
          ctx.fillStyle='rgba(40,30,20,0.6)';
          ctx.beginPath(); ctx.arc(Math.random()*size, Math.random()*size, 2, 0, Math.PI*2); ctx.fill();
        }
        break;
      }
      case 'mud_brick': {
        ctx.fillStyle = '#8a6a45'; ctx.fillRect(0,0,size,size);
        const bW=size/5, bH=size/7;
        for (let r=0; r<8; r++) for (let c=0; c<6; c++) {
          const x = c*bW + (r%2===0?0:bW/2), y = r*bH;
          const v=Math.random()*25;
          ctx.fillStyle=`rgb(${130+v},${95+v},${60+v/2})`;
          ctx.fillRect(x+2,y+2,bW-4,bH-4);
          // Straw flecks
          for(let s=0;s<5;s++) { ctx.fillStyle='rgba(200,180,100,0.3)'; ctx.fillRect(x+Math.random()*bW, y+Math.random()*bH,3,1); }
          ctx.strokeStyle='rgba(60,40,20,0.3)'; ctx.lineWidth=2; ctx.strokeRect(x,y,bW,bH);
          nCtx.strokeStyle='rgb(80,80,190)'; nCtx.lineWidth=4; nCtx.strokeRect(x,y,bW,bH);
        }
        break;
      }
      case 'tin_roof': {
        ctx.fillStyle = '#787060'; ctx.fillRect(0,0,size,size);
        // Corrugated ridges
        for (let i=0; i<size; i+=12) {
          ctx.fillStyle=`rgba(255,255,255,${0.06+Math.random()*0.04})`; ctx.fillRect(i,0,5,size);
          ctx.fillStyle=`rgba(0,0,0,0.15)`; ctx.fillRect(i+5,0,7,size);
          nCtx.fillStyle=`rgb(180,180,255)`; nCtx.fillRect(i,0,5,size);
          nCtx.fillStyle=`rgb(80,80,200)`; nCtx.fillRect(i+5,0,7,size);
        }
        // Rust streaks
        for(let r=0;r<30;r++) {
          const rx=Math.random()*size, ry=0;
          ctx.strokeStyle=`rgba(120,50,10,${0.1+Math.random()*0.2})`; ctx.lineWidth=2+Math.random()*3;
          ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx+Math.random()*20-10, size); ctx.stroke();
        }
        break;
      }
      case 'rusted_iron': {
        ctx.fillStyle='#6a3010'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<20000;i++) {
          const x=Math.random()*size,y=Math.random()*size,v=Math.random();
          const r=Math.floor(80+v*60),g=Math.floor(30+v*20);
          ctx.fillStyle=`rgba(${r},${g},5,0.15)`; ctx.fillRect(x,y,3,3);
          nCtx.fillStyle=`rgb(${110+v*20},${110+v*20},255)`; nCtx.fillRect(x,y,2,2);
        }
        // Pitting
        for(let p=0;p<80;p++) { ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(Math.random()*size,Math.random()*size,1+Math.random()*2,0,Math.PI*2); ctx.fill(); }
        break;
      }
      case 'painted_wood': {
        ctx.fillStyle='#c09060'; ctx.fillRect(0,0,size,size);
        const pw=size/12;
        for(let r=0;r<13;r++) {
          const y=r*pw, v=Math.random()*15;
          ctx.fillStyle=`rgb(${180+v},${140+v},${90+v/2})`; ctx.fillRect(0,y+1,size,pw-2);
          ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(0,y+pw-1,size,2);
          nCtx.fillStyle='rgb(80,80,200)'; nCtx.fillRect(0,y+pw-1,size,3);
          if(Math.random()<0.2) { ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(Math.random()*size,y+2,Math.random()*30,pw*0.6); }
        }
        break;
      }
      case 'cracked_plaster': {
        ctx.fillStyle='#d8d0c0'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<50000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=`rgba(0,0,0,${v*0.03})`; ctx.fillRect(x,y,1,1); }
        // Cracks
        for(let c=0;c<25;c++) {
          ctx.strokeStyle=`rgba(80,60,40,${0.3+Math.random()*0.3})`; ctx.lineWidth=1;
          ctx.beginPath(); let cx2=Math.random()*size,cy2=Math.random()*size; ctx.moveTo(cx2,cy2);
          for(let s=0;s<8;s++) { cx2+=Math.random()*30-15; cy2+=Math.random()*30-15; ctx.lineTo(cx2,cy2); }
          ctx.stroke();
          nCtx.strokeStyle='rgb(80,80,180)'; nCtx.lineWidth=2; nCtx.stroke();
        }
        break;
      }
      case 'red_barn': {
        ctx.fillStyle='#7a2010'; ctx.fillRect(0,0,size,size);
        const rbW=size/10;
        for(let r=0;r<11;r++) {
          const y=r*rbW, v=Math.random()*20;
          ctx.fillStyle=`rgb(${110+v},${28+v/2},${12+v/3})`; ctx.fillRect(0,y+1,size,rbW-2);
          ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,y+rbW-1,size,2);
          nCtx.fillStyle='rgb(80,80,200)'; nCtx.fillRect(0,y+rbW-1,size,3);
        }
        break;
      }
      case 'dry_stone': {
        ctx.fillStyle='#7a7060'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<6000;i++) {
          const x=Math.random()*size,y=Math.random()*size,s=2+Math.random()*10,v=Math.random()*30;
          ctx.fillStyle=`rgb(${90+v},${85+v},${70+v})`; ctx.fillRect(x,y,s,s*0.6);
          ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=0.5; ctx.strokeRect(x,y,s,s*0.6);
          nCtx.fillStyle=`rgb(${110+v},${110+v},255)`; nCtx.fillRect(x,y,s/2,s*0.3);
        }
        break;
      }
      case 'tarpaper': {
        ctx.fillStyle='#201c18'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<80000;i++) { const x=Math.random()*size,y=Math.random()*size; ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.05})`; ctx.fillRect(x,y,1,1); }
        for(let r=0;r<size;r+=4) { ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.01})`; ctx.fillRect(0,r,size,1); }
        break;
      }
      case 'leather': {
        ctx.fillStyle='#6a3820'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<30000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=`rgba(${v>0.5?20:0},0,0,${v*0.08})`; ctx.fillRect(x,y,2,2); nCtx.fillStyle=`rgb(${115+v*20},${115+v*20},255)`; nCtx.fillRect(x,y,1,1); }
        break;
      }
      // ── Cyberpunk / Sci-Fi ─────────────────────────────────────────────────────
      case 'neon_panel':
      case 'neon_blue':
      case 'neon_pink': {
        const nCol = type==='neon_blue'?'#003366':type==='neon_pink'?'#330022':'#220800';
        ctx.fillStyle=nCol; ctx.fillRect(0,0,size,size);
        // Horizontal LED strips
        for(let r=0;r<size;r+=24) {
          const grd=ctx.createLinearGradient(0,r,0,r+20);
          const c=type==='neon_blue'?'0,140,255':type==='neon_pink'?'255,0,180':'255,60,0';
          grd.addColorStop(0,`rgba(${c},0)`); grd.addColorStop(0.5,`rgba(${c},0.8)`); grd.addColorStop(1,`rgba(${c},0)`);
          ctx.fillStyle=grd; ctx.fillRect(0,r,size,20);
        }
        // Panel lines
        for(let l=0;l<size;l+=8) { ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0,l,size,1); }
        break;
      }
      case 'carbon_fiber': {
        ctx.fillStyle='#111111'; ctx.fillRect(0,0,size,size);
        const cfS=16;
        for(let r=0;r<size/cfS;r++) for(let c=0;c<size/cfS;c++) {
          const x=c*cfS, y=r*cfS;
          const isAlt=(r+c)%2===0;
          ctx.fillStyle=isAlt?'#1e1e1e':'#161616'; ctx.fillRect(x,y,cfS,cfS);
          ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.5;
          ctx.strokeRect(x+0.5,y+0.5,cfS-1,cfS-1);
          nCtx.fillStyle=isAlt?'rgb(140,140,255)':'rgb(110,110,255)'; nCtx.fillRect(x,y,cfS,cfS);
        }
        break;
      }
      case 'circuit_board': {
        ctx.fillStyle='#0a1f0a'; ctx.fillRect(0,0,size,size);
        // PCB traces
        for(let t=0;t<60;t++) {
          ctx.strokeStyle=`rgba(0,${120+Math.random()*60},0,0.5)`; ctx.lineWidth=1+Math.random()*2;
          ctx.beginPath(); let tx=Math.random()*size, ty=Math.random()*size; ctx.moveTo(tx,ty);
          for(let s=0;s<5;s++) { const dir=Math.floor(Math.random()*4); tx+=dir<2?(dir===0?30:-30):0; ty+=dir>=2?(dir===2?30:-30):0; ctx.lineTo(tx,ty); }
          ctx.stroke();
        }
        // Solder pads
        for(let p=0;p<80;p++) { ctx.fillStyle='rgba(200,180,0,0.6)'; ctx.beginPath(); ctx.arc(Math.random()*size,Math.random()*size,3,0,Math.PI*2); ctx.fill(); }
        break;
      }
      case 'asphalt': {
        ctx.fillStyle='#181818'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<40000;i++) {
          const x=Math.random()*size,y=Math.random()*size,v=Math.random();
          ctx.fillStyle=`rgba(${v>0.8?60:30},${v>0.8?60:30},${v>0.8?60:30},${v*0.15})`; ctx.fillRect(x,y,2,2);
          nCtx.fillStyle=`rgb(${115+v*20},${115+v*20},255)`; nCtx.fillRect(x,y,1,1);
        }
        // Cracks
        for(let c=0;c<8;c++) {
          ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=1;
          let ax=Math.random()*size, ay=Math.random()*size; ctx.beginPath(); ctx.moveTo(ax,ay);
          for(let s=0;s<6;s++) { ax+=Math.random()*40-20; ay+=Math.random()*40-20; ctx.lineTo(ax,ay); } ctx.stroke();
        }
        break;
      }
      case 'wet_concrete': {
        ctx.fillStyle='#555565'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<25000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=`rgba(0,0,0,${v*0.07})`; ctx.fillRect(x,y,2,2); nCtx.fillStyle=`rgb(${118+v*18},${118+v*18},255)`; nCtx.fillRect(x,y,1,1); }
        // Puddles / wet spots
        for(let p=0;p<10;p++) { const grd=ctx.createRadialGradient(Math.random()*size,Math.random()*size,5,Math.random()*size,Math.random()*size,30+Math.random()*40); grd.addColorStop(0,'rgba(100,110,130,0.3)'); grd.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=grd; ctx.fillRect(0,0,size,size); }
        break;
      }
      case 'rust_panel': {
        ctx.fillStyle='#5a2810'; ctx.fillRect(0,0,size,size);
        for(let r=0;r<size;r+=20) { ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.03})`; ctx.fillRect(0,r,size,9); ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,r+9,size,11); }
        for(let i=0;i<15000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); const r2=Math.floor(80+v*50),g=Math.floor(20+v*20); ctx.fillStyle=`rgba(${r2},${g},0,0.2)`; ctx.fillRect(x,y,3,3); nCtx.fillStyle=`rgb(${110+v*18},${110+v*18},255)`; nCtx.fillRect(x,y,2,2); }
        break;
      }
      // ── Nature ────────────────────────────────────────────────────────────────
      case 'grass': {
        ctx.fillStyle='#2e4a22'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<50000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=`rgba(${v>0.5?20:0},${v>0.5?30:10},0,0.1)`; ctx.fillRect(x,y,2,3); nCtx.fillStyle=`rgb(${110+v*20},${130+v*20},255)`; nCtx.fillRect(x,y,1,2); }
        break;
      }
      case 'mossy_stone': {
        ctx.fillStyle='#5a5848'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<8000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=v>0.6?`rgba(30,60,10,0.3)`:`rgba(0,0,0,0.1)`; ctx.fillRect(x,y,3,3); nCtx.fillStyle=`rgb(${110+v*20},${110+v*20},255)`; nCtx.fillRect(x,y,2,2); }
        break;
      }
      case 'dirt': {
        ctx.fillStyle='#5a3a20'; ctx.fillRect(0,0,size,size);
        for(let i=0;i<30000;i++) { const x=Math.random()*size,y=Math.random()*size,v=Math.random(); ctx.fillStyle=`rgba(${v>0.5?30:0},${v>0.7?15:0},0,0.12)`; ctx.fillRect(x,y,3,3); nCtx.fillStyle=`rgb(${115+v*18},${115+v*18},255)`; nCtx.fillRect(x,y,2,2); }
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
