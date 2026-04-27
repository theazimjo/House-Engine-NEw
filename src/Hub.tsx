import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Clock, Trash2, Pencil, Check, X, Sparkles, Building2, Factory, Shapes, Gamepad2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from './components/Toast';
import { BUILDING_TEMPLATES, type BuildingTemplate } from './constants/templates';

interface Project {
  id: string;
  name: string;
  lastModified: number;
  data?: any;
}

// ── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  residential: { label: 'Residential', icon: <Building2 size={12} />, color: '#4ade80' },
  commercial:  { label: 'Commercial',  icon: <Sparkles size={12} />,  color: '#3b82f6' },
  industrial:  { label: 'Industrial',  icon: <Factory size={12} />,   color: '#f59e0b' },
  custom:      { label: 'Custom',      icon: <Shapes size={12} />,    color: '#a855f7' },
  game:        { label: 'Game',        icon: <Gamepad2 size={12} />,  color: '#ef4444' },
  interior:    { label: 'Interior',    icon: <Building2 size={12} />, color: '#06b6d4' },
};

export const Hub: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
      localStorage.removeItem(`house_engine_project_${id}`);
      toast('Project deleted', 'info');
    }
  };

  const startRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(currentName);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!editName.trim()) {
      toast('Name cannot be empty', 'warning');
      return;
    }
    const updated = projects.map(p =>
      p.id === id ? { ...p, name: editName.trim() } : p
    );
    setProjects(updated);
    localStorage.setItem('house_engine_projects', JSON.stringify(updated));
    setEditingId(null);
    toast('Project renamed', 'success');
  };

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getProjectStats = (id: string) => {
    try {
      const saved = localStorage.getItem(`house_engine_project_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { nodes: parsed.nodes?.length || 0, edges: parsed.edges?.length || 0 };
      }
    } catch { /* ignore */ }
    return { nodes: 0, edges: 0 };
  };

  // ── Create from Template ───────────────────────────────────────────────────
  const createFromTemplate = (template: BuildingTemplate) => {
    const projId = `proj_${Date.now()}`;
    const projectData = {
      version: '1.0',
      nodes: template.nodes,
      edges: template.edges,
    };

    // Save project data
    localStorage.setItem(`house_engine_project_${projId}`, JSON.stringify(projectData));

    // Update project index
    const saved = localStorage.getItem('house_engine_projects');
    const existingProjects = saved ? JSON.parse(saved) : [];
    existingProjects.push({
      id: projId,
      name: template.name,
      lastModified: Date.now(),
    });
    localStorage.setItem('house_engine_projects', JSON.stringify(existingProjects));

    toast(`Created "${template.name}" from template`, 'success');
    navigate(`/editor/${projId}`);
  };

  // ── Filter templates ───────────────────────────────────────────────────────
  const filteredTemplates = templateFilter === 'all'
    ? BUILDING_TEMPLATES
    : BUILDING_TEMPLATES.filter(t => t.category === templateFilter);

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
            <Link to="/" className="hover:bg-[#111]/5 p-2 rounded-md transition-colors" title="Back to Landing">
              <ArrowLeft size={20} />
            </Link>
            <div className="font-black tracking-tighter text-xl">PROJECT HUB</div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex border border-[#111]/15 rounded-md overflow-hidden text-[10px] font-bold tracking-[0.1em] uppercase">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-[#111] text-white'
                    : 'bg-transparent text-[#111]/60 hover:bg-[#111]/5'
                }`}
              >
                My Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-[#111] text-white'
                    : 'bg-transparent text-[#111]/60 hover:bg-[#111]/5'
                }`}
              >
                Templates ({BUILDING_TEMPLATES.length})
              </button>
            </div>

            <button
              onClick={() => navigate('/editor')}
              className="bg-[#c64321] hover:bg-[#a53518] text-white text-[11px] font-bold tracking-[0.1em] px-4 py-2 uppercase transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> New
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── PROJECTS TAB ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <>
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
                  Create a new project or start from a template.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/editor')}
                    className="bg-[#111] hover:bg-[#333] text-white text-xs font-bold tracking-[0.15em] px-6 py-3 uppercase transition-colors"
                  >
                    Empty Project
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="border border-[#111]/20 hover:border-[#111] text-[#111] text-xs font-bold tracking-[0.15em] px-6 py-3 uppercase transition-colors"
                  >
                    Browse Templates
                  </button>
                </div>
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
                {projects.sort((a, b) => b.lastModified - a.lastModified).map(project => {
                  const stats = getProjectStats(project.id);
                  const isEditing = editingId === project.id;

                  return (
                    <div
                      key={project.id}
                      onClick={() => !isEditing && navigate(`/editor/${project.id}`)}
                      className="border border-[#111]/10 bg-white hover:border-[#111]/40 hover:shadow-lg transition-all h-64 flex flex-col cursor-pointer group relative"
                    >
                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => startRename(project.id, project.name, e)}
                          className="p-2 bg-white/80 backdrop-blur text-[#111] hover:bg-[#111]/10 rounded shadow-sm"
                          title="Rename project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => deleteProject(project.id, e)}
                          className="p-2 bg-white/80 backdrop-blur text-red-500 hover:bg-red-50 rounded shadow-sm"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="flex-1 bg-[#f4f4ec] relative overflow-hidden flex items-center justify-center border-b border-[#111]/5">
                        <div className="opacity-10 font-black text-6xl tracking-tighter">HE</div>
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          <div className="bg-[#111]/70 backdrop-blur text-white text-[9px] font-mono px-2 py-1 rounded">
                            {stats.nodes} nodes
                          </div>
                          <div className="bg-[#111]/70 backdrop-blur text-white text-[9px] font-mono px-2 py-1 rounded">
                            {stats.edges} edges
                          </div>
                        </div>
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                          backgroundImage: 'radial-gradient(#111 2px, transparent 2px)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>

                      {/* Meta */}
                      <div className="p-5">
                        {isEditing ? (
                          <form onSubmit={(e) => confirmRename(project.id, e)} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 text-lg font-bold border-b-2 border-[#c64321] bg-transparent outline-none px-0 py-0"
                              onKeyDown={(e) => { if (e.key === 'Escape') cancelRename(); }}
                            />
                            <button type="submit" className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirm">
                              <Check size={16} />
                            </button>
                            <button type="button" onClick={cancelRename} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Cancel">
                              <X size={16} />
                            </button>
                          </form>
                        ) : (
                          <h3 className="font-bold text-lg mb-1 truncate group-hover:text-[#c64321] transition-colors">
                            {project.name}
                          </h3>
                        )}
                        <div className="flex items-center text-[10px] font-mono opacity-50 uppercase tracking-wider mt-1">
                          <Clock size={12} className="mr-1.5" />
                          {formatDate(project.lastModified)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── TEMPLATES TAB ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'templates' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-[10px] font-mono tracking-widest uppercase opacity-50 mb-2">
                  BUILDING TEMPLATES
                </div>
                <p className="text-sm opacity-60 font-medium">
                  Start with a pre-built architecture graph. Customize everything after creation.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1 border border-[#111]/15 rounded-md overflow-hidden text-[10px] font-bold tracking-[0.08em] uppercase">
                <button
                  onClick={() => setTemplateFilter('all')}
                  className={`px-3 py-1.5 transition-colors ${
                    templateFilter === 'all' ? 'bg-[#111] text-white' : 'hover:bg-[#111]/5'
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setTemplateFilter(key)}
                    className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
                      templateFilter === key ? 'bg-[#111] text-white' : 'hover:bg-[#111]/5'
                    }`}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map(template => {
                const catCfg = CATEGORY_CONFIG[template.category] ?? { label: template.category, icon: null, color: '#888888' };
                return (
                  <div
                    key={template.id}
                    onClick={() => createFromTemplate(template)}
                    className="border border-[#111]/10 bg-white hover:border-[#111]/40 hover:shadow-xl transition-all flex flex-col cursor-pointer group relative overflow-hidden"
                  >
                    {/* Template Visual */}
                    <div className="h-44 bg-[#e8e8e8] relative overflow-hidden flex items-center justify-center border-b border-[#111]/5">
                      <div className="absolute inset-0 z-0 pointer-events-none group-hover:scale-105 transition-transform duration-700">
                        <img 
                          src={`/src/assets/templates/${template.id}.png`} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center text-7xl opacity-60">
                          {template.icon}
                        </div>
                      </div>

                      {/* Category badge */}
                      <div
                        className="absolute top-3 left-3 text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-sm text-white"
                        style={{ background: catCfg.color }}
                      >
                        {catCfg.label}
                      </div>

                      {/* Node count */}
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <div className="bg-[#111]/70 backdrop-blur text-white text-[9px] font-mono px-2 py-1 rounded">
                          {template.nodes.length} nodes
                        </div>
                      </div>

                      {/* Subtle pattern */}
                      <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%)',
                        backgroundSize: '8px 8px'
                      }} />
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-1.5 group-hover:text-[#c64321] transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs opacity-50 leading-relaxed font-medium flex-1">
                        {template.description}
                      </p>

                      {/* Use button */}
                      <div className="mt-4 pt-3 border-t border-[#111]/8">
                        <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#c64321] group-hover:text-[#a53518] transition-colors flex items-center gap-1.5">
                          <Plus size={12} />
                          Use This Template
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
