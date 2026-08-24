import React from 'react';
import SecurityBadge from './SecurityBadge';
import { useNavigate } from 'react-router-dom';
import { useWorkbench } from '../context/WorkbenchContext';
import { LogOut } from 'lucide-react';

export const Header = ({
  title = "MRPL Sovereign AI Workbench",
  subtitle = "Mangalore Refinery and Petrochemicals Limited — On-Premise Air-Gapped Sandbox"
}) => {
  const navigate = useNavigate();
  const { logout } = useWorkbench();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#0e1320] border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-sky-400/80 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Permanent Security Status Indicator */}
        <SecurityBadge />

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#111827] hover:border-slate-500 hover:bg-[#1f293d] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="Sign out to MRPL Login Page"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
