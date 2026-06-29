// components/UploadDropzone.jsx
import React, { useCallback, useState, useRef } from 'react';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const UploadDropzone = ({ onFileSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver]     = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError]               = useState('');
  const inputRef                        = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))
      return 'Only PDF files are accepted.';
    if (file.size > MAX_SIZE_BYTES)
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleFile = useCallback((file) => {
    setError('');
    const err = validateFile(file);
    if (err) { setError(err); setSelectedFile(null); return; }
    setSelectedFile(file);
    onFileSelected?.(file);
  }, [onFileSelected]);

  const handleDrop       = useCallback((e) => { e.preventDefault(); setIsDragOver(false); if (!disabled) handleFile(e.dataTransfer.files?.[0]); }, [handleFile, disabled]);
  const handleDragOver   = (e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); };
  const handleDragLeave  = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleInputChange = (e) => handleFile(e.target.files?.[0]);
  const handleClick      = () => { if (!disabled) inputRef.current?.click(); };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onFileSelected?.(null);
  };

  const zoneBase  = 'relative rounded-2xl p-12 cursor-pointer border-2 border-dashed transition-all duration-250 outline-none';
  const zoneIdle  = 'border-white/[0.12] bg-dark-800/80 hover:border-white/[0.2] hover:bg-dark-800';
  const zoneDrag  = 'border-fire bg-fire/[0.06] shadow-[0_0_40px_rgba(251,113,60,0.1),inset_0_0_30px_rgba(251,113,60,0.04)] scale-[1.01]';
  const zoneFile  = 'border-brand-green/40 bg-brand-green/[0.03]';
  const zoneDis   = 'opacity-50 cursor-not-allowed';

  return (
    <div>
      <div
        id="pdf-dropzone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload PDF resume"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className={`${zoneBase} ${isDragOver ? zoneDrag : selectedFile ? zoneFile : zoneIdle} ${disabled ? zoneDis : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          id="pdf-file-input"
          disabled={disabled}
        />

        {selectedFile ? (
          /* ── File selected state ── */
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-green/[0.08] border border-brand-green/30 flex items-center justify-center flex-shrink-0 text-2xl">
              📄
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-[#f1f1f3] font-semibold text-sm truncate">{selectedFile.name}</p>
              <p className="text-brand-green text-xs mt-1">
                {(selectedFile.size / 1024).toFixed(0)} KB · PDF ready
              </p>
            </div>
            {!disabled && (
              <button
                onClick={handleRemove}
                id="remove-file-btn"
                title="Remove file"
                className="w-8 h-8 flex items-center justify-center bg-brand-red/[0.1] border border-brand-red/30 text-brand-red rounded-lg text-xs font-bold flex-shrink-0 hover:bg-brand-red/20 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          /* ── Empty / drag state ── */
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-250 text-4xl
              ${isDragOver ? 'bg-fire/15 border-fire/50 scale-110' : 'bg-fire/[0.08] border-fire/20'}`}>
              {isDragOver ? '⬇️' : '📋'}
            </div>
            <p className="text-[#f1f1f3] font-semibold text-base mt-2">
              {isDragOver ? 'Drop your resume here' : 'Drag & drop your resume PDF'}
            </p>
            <p className="text-[#5a5a70] text-sm">or click to browse files</p>
            <div className="flex gap-2 mt-1">
              {['PDF only', `Max ${MAX_SIZE_MB}MB`].map((tag) => (
                <span key={tag} className="bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-0.5 text-xs text-[#5a5a70] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-center gap-2 mt-3 px-4 py-3 bg-brand-red/[0.08] border border-brand-red/20 rounded-xl text-brand-red text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;
