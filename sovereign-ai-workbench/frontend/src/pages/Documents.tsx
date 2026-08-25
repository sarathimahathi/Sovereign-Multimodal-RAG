import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download, 
  FileCode, 
  Layers, 
  FileSpreadsheet, 
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Search,
  RefreshCw,
  Lock,
  Loader2
} from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument, DocumentItem, API_BASE_URL } from '../services/api';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classification, setClassification] = useState('CONFIDENTIAL - REFINERY OPERATIONS');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDocuments();
      setDocuments(res.items);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadStatusMsg(`Uploading and hashing ${files.length} file(s)...`);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadDocument(files[i], classification);
      }
      setUploadStatusMsg('Upload complete! Files securely hashed with SHA-256.');
      await loadDocuments();
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } catch (err: any) {
      setUploadStatusMsg(`Upload failed: ${err.message || 'Error occurred'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete '${name}' from secure local storage?`)) return;
    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pid':
        return <Layers className="h-5 w-5 text-amber-400" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-rose-400" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-purple-400" />;
      case 'code':
        return <FileCode className="h-5 w-5 text-cyan-400" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Phase 2 Active: Persistent Storage
            </span>
            <span className="text-xs text-slate-400">• On-Premises Local Storage</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Confidential Document Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure on-premise storage for P&ID engineering blueprints, scanned inspection reports, and SOPs with tamper-evident SHA-256 hashing.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          disabled={isLoading || isUploading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-2 w-fit disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Files</span>
        </button>
      </div>

      {/* Upload Dropzone Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Confidentiality Classification:</span>
          </div>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            disabled={isUploading}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="CONFIDENTIAL - REFINERY OPERATIONS">CONFIDENTIAL - REFINERY OPERATIONS</option>
            <option value="RESTRICTED - DEFENSE MANUFACTURING">RESTRICTED - DEFENSE MANUFACTURING</option>
            <option value="SECRET - INTERNAL CORRESPONDENCE">SECRET - INTERNAL CORRESPONDENCE</option>
            <option value="RESTRICTED - BOARD NOTE">RESTRICTED - BOARD NOTE</option>
            <option value="INTERNAL USE ONLY">INTERNAL USE ONLY</option>
          </select>
        </div>

        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isUploading) handleFileUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all bg-slate-900/30 group ${
            isUploading
              ? 'border-indigo-500/50 cursor-not-allowed opacity-75'
              : 'border-slate-700 hover:border-indigo-500/80 cursor-pointer hover:bg-indigo-950/10'
          }`}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
              {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {isUploading ? 'Uploading and computing cryptographic SHA-256 hash...' : 'Click to browse or drag and drop confidential files here'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Supports P&ID drawings, Scanned PDFs, DOCX, XLSX spreadsheets, and Images (Max 50MB)
              </p>
            </div>
          </div>
        </div>

        {uploadStatusMsg && (
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono text-indigo-300 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{uploadStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Document Explorer & Search */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by filename or SHA-256 hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Files: <strong className="text-white">{filteredDocs.length}</strong>
          </span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            {isLoading ? 'Loading documents from database...' : 'No confidential documents uploaded yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/50 uppercase tracking-wider">
                  <th className="p-3.5 pl-6">Document Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">SHA-256 Integrity Hash</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                          {getFileIcon(doc.file_type)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-sm">
                            {doc.original_filename}
                          </p>
                          <span className="text-[10px] font-mono text-slate-500">
                            {doc.metadata_info?.classification || 'CONFIDENTIAL'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{formatBytes(doc.file_size_bytes)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-indigo-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-[200px]">
                        <span className="truncate">{doc.sha256_hash}</span>
                        <button
                          onClick={() => copyToClipboard(doc.sha256_hash)}
                          title="Copy SHA-256 Checksum"
                          className="hover:text-white shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {copiedHash === doc.sha256_hash && (
                        <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                        Indexed
                      </span>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`${API_BASE_URL}/api/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors"
                          title="Download File"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id, doc.original_filename)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
