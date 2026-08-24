import React from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import FileCard from '../components/FileCard';
import { useWorkbench } from '../context/WorkbenchContext';
import { FolderOpen, HardDrive, CheckCircle2, Shield } from 'lucide-react';

export const FilesPage = () => {
  const { uploadedFiles } = useWorkbench();

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Confidential File Repository"
        subtitle="Local File Management & Air-Gapped Ingestion Directory"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top File Summary Banner */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#090d16] text-sky-400 border border-slate-800 text-[11px] font-mono font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" /> On-Premise Storage Node
            </div>
            <h2 className="text-xl font-extrabold text-white">MRPL Workspace Attached Files</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              All documents, engineering schematics, and inspection photographs are encrypted and parsed locally.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Zero Outbound Network Leakage</span>
          </div>
        </div>

        {/* Upload Container */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-sky-400" /> Ingest New Workspace File
          </h3>
          <FileUpload />
        </div>

        {/* Files Directory Grid */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Attached Workspace Files ({uploadedFiles.length})
          </h3>

          {uploadedFiles.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center bg-[#090d16] rounded-xl border border-slate-800">
              No files currently attached to workspace.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FilesPage;
