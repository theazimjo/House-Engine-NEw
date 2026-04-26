import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f4ec] text-[#111] font-sans selection:bg-[#c64321] selection:text-white overflow-x-hidden relative">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-[#111]/10 bg-[#f4f4ec]/80 backdrop-blur-sm z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="font-black tracking-tighter text-2xl">HOUSE/ENGINE</div>
        
        <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase opacity-60">
          <a href="#system" className="hover:opacity-100 transition-opacity">System</a>
          <a href="#nodes" className="hover:opacity-100 transition-opacity">Nodes</a>
          <a href="#learn" className="hover:opacity-100 transition-opacity">Learn</a>
        </div>

        <Link 
          to="/hub"
          className="bg-[#c64321] hover:bg-[#a53518] text-white text-[11px] font-bold tracking-[0.1em] px-4 py-2 uppercase transition-colors"
        >
          Open Hub ↗
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto relative z-10" id="system">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-6">
              V0.1 / PROCEDURAL ARCHITECTURE SYSTEM
            </div>
            
            <h1 className="text-[5rem] leading-[0.85] font-black tracking-tighter mb-8 max-w-3xl">
              BUILD BUILDINGS WITH NODES.
            </h1>
            
            <p className="text-lg font-medium opacity-80 max-w-md mb-10 leading-snug">
              A web-native, node-based generator for procedural architecture. 
              No Installs. No Houdini. Just visual graphs, real-time 3D, and clean concrete logic.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                to="/hub"
                className="bg-[#111] hover:bg-[#333] text-white text-xs font-bold tracking-[0.15em] px-8 py-4 uppercase transition-colors flex items-center gap-3"
              >
                Launch Hub <ArrowRight size={14} />
              </Link>
              <a 
                href="#nodes"
                className="border border-[#111]/20 hover:border-[#111] text-[#111] text-xs font-bold tracking-[0.15em] px-8 py-4 uppercase transition-colors flex items-center"
              >
                See Node Set
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <div className="border border-[#111]/20 p-6 bg-[#f4f4ec]/50 backdrop-blur-md">
              <table className="w-full text-xs font-mono">
                <tbody>
                  <tr className="border-b border-[#111]/10">
                    <td className="py-2 opacity-50">SYSTEM</td>
                    <td className="py-2 text-right font-medium">HOUSE ENGINE</td>
                  </tr>
                  <tr className="border-b border-[#111]/10">
                    <td className="py-2 opacity-50">RENDER</td>
                    <td className="py-2 text-right font-medium">THREE.JS / WEBGL</td>
                  </tr>
                  <tr className="border-b border-[#111]/10">
                    <td className="py-2 opacity-50">GRAPH</td>
                    <td className="py-2 text-right font-medium">REACT FLOW</td>
                  </tr>
                  <tr className="border-b border-[#111]/10">
                    <td className="py-2 opacity-50">TARGET</td>
                    <td className="py-2 text-right font-medium">BROWSER</td>
                  </tr>
                  <tr>
                    <td className="py-2 opacity-50">EXPORT</td>
                    <td className="py-2 text-right font-medium">.OBJ / .GLTF</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t border-[#111]/20 text-[10px] font-mono opacity-50">
                Heavy boolean ops scheduled for Rust/WebAssembly migration via Manifold.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Banner */}
      <div className="bg-[#111] text-white py-4 overflow-hidden border-y border-[#111]">
        <div className="flex gap-8 whitespace-nowrap animate-marquee font-black tracking-widest opacity-80 uppercase text-lg">
          <span>■ FOUNDATION</span>
          <span>■ FLOORS</span>
          <span>■ WINDOWS</span>
          <span>■ ROOF</span>
          <span>■ SCATTER</span>
          <span>■ BOOLEAN</span>
          <span>■ EXPORT</span>
          <span>■ FOUNDATION</span>
          <span>■ FLOORS</span>
          <span>■ WINDOWS</span>
          <span>■ ROOF</span>
          <span>■ SCATTER</span>
          <span>■ BOOLEAN</span>
          <span>■ EXPORT</span>
        </div>
      </div>

      {/* Node Set Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[#111]/10" id="nodes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-4">
              02 / NODE SET
            </div>
            <h2 className="text-[3rem] leading-[0.9] font-black tracking-tighter">
              THE BUILDING GRAPH
            </h2>
          </div>
          <div className="text-lg font-medium opacity-80 leading-snug lg:pt-8">
            Each node owns one architectural decision. Connect them, change a number, watch the building rebuild instantly. No code, no scripting — pure visual logic.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border border-[#111]/20">
          {[
            { id: 'N01', color: 'bg-[#c64321]', title: 'FOUNDATION', desc: 'Rectangle, L-shape footprints with width, depth and notch parameters.' },
            { id: 'N02', color: 'bg-[#1d4ed8]', title: 'FLOORS', desc: 'Stack the structure. Set count and per-floor height to scale vertically.' },
            { id: 'N03', color: 'bg-[#d97706]', title: 'WINDOWS', desc: 'Distribute openings across the facade by spacing, size and start floor.' },
            { id: 'N04', color: 'bg-[#111]', title: 'ROOF', desc: 'Flat, pitched or hipped tops with overhang and height control.' }
          ].map((item, i) => (
            <div key={item.id} className={`p-8 ${i !== 3 ? 'border-b md:border-b-0 md:border-r border-[#111]/20' : ''}`}>
              <div className={`${item.color} text-white text-[10px] font-bold px-2 py-1 inline-block mb-6`}>
                {item.id}
              </div>
              <h3 className="text-xl font-black mb-4 uppercase">{item.title}</h3>
              <p className="text-sm font-medium opacity-70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn / Tutorial Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto" id="learn">
        <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-4">
          03 / LEARN
        </div>
        <h2 className="text-[3rem] leading-[0.9] font-black tracking-tighter mb-12">
          HOW IT WORKS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Drop a Foundation', desc: 'Start by defining your building\'s footprint. Choose from Rectangle, L-Shape, C-Shape, or Custom splines.' },
            { step: '2', title: 'Stack the Floors', desc: 'Connect the Foundation to a Floors System node. Adjust the floor count, height, and window placement instantly.' },
            { step: '3', title: 'Cap it with a Roof', desc: 'Pipe the output to a Roof System. Choose between Pitched, Shed, or Hip styles and adjust the overhang.' }
          ].map((t, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm border border-[#111]/10 p-8 hover:bg-white transition-colors">
              <div className="text-[4rem] font-black opacity-10 mb-4 leading-none">{t.step}</div>
              <h3 className="text-lg font-black mb-3">{t.title}</h3>
              <p className="text-sm opacity-70 font-medium leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack / Why Section */}
      <section className="bg-[#e4e4dc] border-y border-[#111]/20 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-4">
              04 / WHY HOUSE ENGINE
            </div>
            <h2 className="text-[4rem] leading-[0.85] font-black tracking-tighter mb-8">
              HOUDINI IS HEAVY.<br/>
              <span className="bg-[#c64321] text-white px-2">A BROWSER IS EVERYWHERE.</span>
            </h2>
            <p className="text-lg font-medium opacity-80 leading-snug">
              Procedural tools shouldn't require a $2000 PC and a degree in visual scripting. House Engine brings the power of procedural generation directly to your web browser. Build, export, and use your assets anywhere.
            </p>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            {[
              { k: 'NODE UI', v: 'React Flow — type-safe graphs, fast iteration.' },
              { k: 'GEOMETRY', v: 'Three.js / R3F — real-time blockout in WebGL.' },
              { k: 'HEAVY MATH', v: 'Rust / CSG — desktop speed in browser.' },
              { k: 'EXPORT', v: '.obj, .gltf for Unity, Unreal, Blender.' }
            ].map((row, i) => (
              <div key={i} className="flex border border-[#111]/20 bg-[#f4f4ec]/80 backdrop-blur-md p-4 text-sm font-mono">
                <div className="w-1/3 opacity-50 font-bold">{row.k}</div>
                <div className="w-2/3">{row.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-32 px-6 text-center border-b border-[#111]/10">
        <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-6">
          05 / TRY IT
        </div>
        <h2 className="text-[4rem] leading-[0.85] font-black tracking-tighter mb-12">
          OPEN THE GRAPH.<br/>MOVE A SLIDER.
        </h2>
        <Link 
          to="/hub"
          className="bg-[#111] hover:bg-[#333] text-white text-xs font-bold tracking-[0.15em] px-10 py-5 uppercase transition-colors inline-flex items-center gap-3"
        >
          Launch Hub <ArrowRight size={14} />
        </Link>
      </footer>

      {/* Bottom Legal */}
      <div className="py-6 px-6 lg:px-12 flex justify-between text-[10px] font-mono font-bold opacity-40 uppercase">
        <div>HOUSE ENGINE © 2026</div>
        <div>PROCEDURAL / ARCHITECTURE / WEB</div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
