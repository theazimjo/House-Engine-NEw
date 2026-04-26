import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  lastModified: number;
  data?: any; // The node graph JSON
}

export const Hub: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load projects from localStorage
    const saved = localStorage.getItem('house_engine_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('house_engine_projects', JSON.stringify(updated));
      // Also remove the actual project data
      localStorage.removeItem(`house_engine_project_${id}`);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f4ec] text-[#111] font-sans selection:bg-[#c64321] selection:text-white">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}
      />

      {/* Header */}
      <header className="border-b border-[#111]/10 bg-[#f4f4ec]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/"
              className="hover:bg-[#111]/5 p-2 rounded-md transition-colors"
              title="Back to Landing"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="font-black tracking-tighter text-xl">PROJECT HUB</div>
          </div>
          
          <button 
            onClick={() => navigate('/editor')}
            className="bg-[#c64321] hover:bg-[#a53518] text-white text-[11px] font-bold tracking-[0.1em] px-4 py-2 uppercase transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-8">
          RECENT PROJECTS
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-[#111]/20 rounded-lg p-12 text-center bg-white/30 backdrop-blur-sm">
            <div className="w-16 h-16 bg-[#111]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="opacity-50" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-sm opacity-60 mb-6 font-medium max-w-sm mx-auto">
              Create your first procedural architecture graph to see it appear here.
            </p>
            <button 
              onClick={() => navigate('/editor')}
              className="bg-[#111] hover:bg-[#333] text-white text-xs font-bold tracking-[0.15em] px-6 py-3 uppercase transition-colors inline-block"
            >
              Start Building
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Card */}
            <div 
              onClick={() => navigate('/editor')}
              className="border border-dashed border-[#111]/30 bg-white/20 hover:bg-white/60 transition-colors h-64 flex flex-col items-center justify-center cursor-pointer group backdrop-blur-sm"
            >
              <div className="w-12 h-12 bg-[#111] text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <div className="font-bold uppercase tracking-widest text-xs">New Project</div>
            </div>

            {/* Project Cards */}
            {projects.sort((a, b) => b.lastModified - a.lastModified).map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="border border-[#111]/10 bg-white hover:border-[#111]/40 hover:shadow-lg transition-all h-64 flex flex-col cursor-pointer group relative"
              >
                {/* Delete button (shows on hover) */}
                <button 
                  onClick={(e) => deleteProject(project.id, e)}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>

                {/* Thumbnail placeholder */}
                <div className="flex-1 bg-[#f4f4ec] relative overflow-hidden flex items-center justify-center border-b border-[#111]/5">
                  <div className="opacity-10 font-black text-6xl tracking-tighter">HE</div>
                  
                  {/* Subtle node pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#111 2px, transparent 2px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Meta */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-[#c64321] transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center text-[10px] font-mono opacity-50 uppercase tracking-wider">
                    <Clock size={12} className="mr-1.5" />
                    {formatDate(project.lastModified)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
