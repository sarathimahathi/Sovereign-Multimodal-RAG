import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  FolderOpen,
  BookOpen,
  History,
  Code2,
  FileText,
  ShieldCheck,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';
import OngcMrplLogo from './OngcMrplLogo';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { applyPresetScenario, logout, currentUser } = useWorkbench();

  const handleNewTask = () => {
    applyPresetScenario('preset-1');
    navigate('/workbench');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? 'bg-sky-600 text-white shadow-md shadow-sky-950/50 translate-x-1'
        : 'text-slate-300 hover:bg-[#182235] hover:text-white hover:translate-x-0.5'
    }`;

  return (
    <aside className="w-64 bg-[#0e1320] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* MRPL / ONGC Logo & Header */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <OngcMrplLogo size="normal" />
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
              MRPL Sovereign AI
            </h1>
            <p className="text-[10px] text-sky-400 font-mono font-medium uppercase tracking-wider">
              On-Premise Workbench
            </p>
          </div>
        </div>

        {/* New Task Action Button */}
        <button
          onClick={handleNewTask}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all duration-200 shadow-lg shadow-sky-950/50 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Task
        </button>

        {/* Navigation Groups */}
        <div className="space-y-5">
          {/* WORKSPACE */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-300/80 uppercase tracking-widest mb-2">
              WORKSPACE
            </p>
            <nav className="space-y-1">
              <NavLink to="/dashboard" className={navClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Dashboard
              </NavLink>
              <NavLink to="/workbench" className={navClass}>
                <Cpu className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                AI Workbench
              </NavLink>
              <NavLink to="/files" className={navClass}>
                <FolderOpen className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Files
              </NavLink>
              <NavLink to="/knowledge" className={navClass}>
                <BookOpen className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Knowledge Base
              </NavLink>
              <NavLink to="/history" className={navClass}>
                <History className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Task History
              </NavLink>
            </nav>
          </div>

          {/* TOOLS */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-300/80 uppercase tracking-widest mb-2">
              TOOLS
            </p>
            <nav className="space-y-1">
              <NavLink to="/tools/code" className={navClass}>
                <Code2 className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Code Sandbox
              </NavLink>
              <NavLink to="/tools/documents" className={navClass}>
                <FileText className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Documents
              </NavLink>
            </nav>
          </div>

          {/* SYSTEM */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-300/80 uppercase tracking-widest mb-2">
              SYSTEM
            </p>
            <nav className="space-y-1">
              <NavLink to="/security" className={navClass}>
                <ShieldCheck className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Security & Status
              </NavLink>
              <NavLink to="/settings" className={navClass}>
                <Settings className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                Settings
              </NavLink>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer User Info & Logout Action */}
      <div className="p-4 border-t border-slate-800 bg-[#090d16] text-xs text-slate-300 space-y-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="font-bold text-white truncate" title={currentUser?.name || 'MRPL User'}>
              {currentUser?.name || 'MRPL User'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || 'operator@mrpl.co.in'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent transition-all cursor-pointer"
            title="Sign Out to Login Page"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-slate-800/80 text-slate-500">
          <span>MRPL Air-Gapped</span>
          <span className="text-emerald-400 font-semibold">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
