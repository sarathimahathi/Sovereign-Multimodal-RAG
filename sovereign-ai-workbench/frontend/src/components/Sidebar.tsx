import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Milestone, 
  ExternalLink, 
  Terminal, 
  Cpu, 
  Database, 
  FileText, 
  Lock, 
  Bot,
  Layers,
  FolderLock,
  MessageSquareCode,
  Eye
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'System Overview', icon: LayoutDashboard },
    { to: '/models', label: 'Local Models & Router', icon: Cpu },
    { to: '/rag', label: 'Hybrid RAG Engine', icon: Layers },
    { to: '/sandbox', label: 'Code Sandbox Jail', icon: Terminal },
    { to: '/multimodal', label: 'Multimodal Intelligence', icon: Eye },
    { to: '/security', label: 'Security & Air-Gap Monitor', icon: Lock },
    { to: '/documents', label: 'Confidential Documents', icon: FolderLock },
    { to: '/sessions', label: 'Workspaces & Sessions', icon: MessageSquareCode },
    { to: '/architecture', label: 'Architecture & Modules', icon: Boxes },
    { to: '/roadmap', label: '12-Phase Roadmap', icon: Milestone },
  ];

  const modules = [
    { name: 'Core API Gateway', phase: 'Phase 1', status: 'ready', icon: Terminal },
    { name: 'PostgreSQL & Storage', phase: 'Phase 2', status: 'ready', icon: Database },
    { name: 'Security & Air-Gap', phase: 'Phase 3', status: 'ready', icon: Lock },
    { name: 'Local Model Engine', phase: 'Phase 4', status: 'ready', icon: Cpu },
    { name: 'Hybrid RAG Engine', phase: 'Phase 5', status: 'ready', icon: Layers },
    { name: 'Isolated Sandbox Jail', phase: 'Phase 6', status: 'ready', icon: Terminal },
    { name: 'Multimodal Processing', phase: 'Phase 7', status: 'ready', icon: Eye },
    { name: 'Autonomous Agent', phase: 'Phase 8', status: 'planned', icon: Bot },
    { name: 'Doc Generation', phase: 'Phase 9', status: 'planned', icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md flex flex-col justify-between p-4 shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Main Navigation */}
        <div>
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Workbench Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Modules & Subsystems */}
        <div>
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Subsystem Status
          </p>
          <div className="space-y-1">
            {modules.map((m) => {
              const Icon = m.icon;
              const isReady = m.status === 'ready';
              return (
                <div
                  key={m.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isReady ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                      isReady
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {m.phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Developer Links */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <a
          href={`${API_BASE_URL}/docs`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span>FastAPI Swagger Docs</span>
          </span>
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`${API_BASE_URL}/api/health`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Raw /api/health JSON</span>
          </span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </aside>
  );
};
