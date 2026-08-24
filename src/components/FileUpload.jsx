import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.png', '.jpg', '.jpeg', '.txt', '.csv', '.py', '.js', '.json'];

export const FileUpload = () => {
  const { handleAddFiles } = useWorkbench();
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndAdd = (files) => {
    setValidationError(null);
    const validFiles = [];
    let invalidCount = 0;

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext) || file.type.startsWith('text/') || file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        invalidCount++;
      }
    });

    if (invalidCount > 0) {
      setValidationError(`Skipped ${invalidCount} unsupported file(s). Allowed: PDF, DOCX, XLSX, PPTX, PNG, JPG, TXT, CSV, CODE.`);
    }

    if (validFiles.length > 0) {
      handleAddFiles(validFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAdd(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAdd(e.target.files);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-500 bg-sky-950/40 scale-[1.01]'
            : 'border-slate-700/80 hover:border-sky-500/50 bg-[#090d16] hover:bg-[#111827]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.txt,.csv,.py,.js,.json"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-[#151d2d] text-sky-400 flex items-center justify-center border border-slate-700">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Drop files here or <span className="text-sky-400 underline">Browse</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              PDF, DOCX, XLSX, PPTX, PNG, JPG, TXT, CSV, CODE
            </p>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
