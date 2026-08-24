import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Processing data on local GPU..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-700">{message}</p>
    </div>
  );
};

export default LoadingState;
