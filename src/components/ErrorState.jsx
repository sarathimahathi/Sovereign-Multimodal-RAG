import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = "Unable to complete request.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-rose-50/60 border border-rose-200 rounded-xl shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
        <AlertOctagon className="w-5 h-5" />
      </div>
      <div className="max-w-md">
        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Operation Failed</h4>
        <p className="text-xs text-rose-700 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Action
        </button>
      )}
    </div>
  );
};

export default ErrorState;
