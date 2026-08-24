import React from 'react';
import { FileText, Image as ImageIcon, FileCode, Sheet, Trash2, CheckCircle2 } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const FileCard = ({ file }) => {
  const { handleRemoveFile } = useWorkbench();

  const getFileIcon = (name = '', type = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (['py', 'js', 'json', 'ts', 'cpp', 'java'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (['xlsx', 'csv'].includes(ext)) {
      return <Sheet className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-indigo-400 shrink-0" />;
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-slate-800 shadow-xs hover:border-slate-700 transition-all group">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {getFileIcon(file.name, file.type)}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{file.size}</span>
            <span className="text-emerald-400 font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleRemoveFile(file.id)}
        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
        title="Remove file"
        aria-label={`Remove ${file.name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default FileCard;
