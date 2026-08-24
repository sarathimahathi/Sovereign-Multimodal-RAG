import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = "No items found", description = "There are no records matching your request." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400">
        <Inbox className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
