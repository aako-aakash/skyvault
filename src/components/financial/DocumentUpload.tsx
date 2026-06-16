import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import type { UploadedFile } from '@/types';
import { cn } from '@/utils';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/constants';

interface DocumentUploadProps {
  files: UploadedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (uid: string) => void;
  label?: string;
}

const FileIcon: React.FC<{ type: string }> = ({ type }) =>
  type === 'application/pdf'
    ? <FileText size={16} className="text-white" />
    : <Image size={16} className="text-white" />;

const DocumentUpload: React.FC<DocumentUploadProps> = ({ files, onAdd, onRemove, label }) => {
  const onDrop = useCallback((accepted: File[]) => onAdd(accepted), [onAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png':       ['.png'],
      'image/jpeg':      ['.jpg', '.jpeg'],
    },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-brand-600 bg-brand-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-brand-600 hover:bg-brand-50',
        )}
        aria-label="File upload area — drag and drop or click to browse"
      >
        <input {...getInputProps()} aria-hidden="true" />
        <Upload size={28} className={cn('mx-auto mb-2', isDragActive ? 'text-brand-600' : 'text-gray-400')} />
        <p className="font-semibold text-gray-700 text-[13px] mb-1">
          {isDragActive ? 'Drop files here…' : label || 'Drag & drop files here'}
        </p>
        <p className="text-[12px] text-gray-500">
          or click to browse · {ALLOWED_EXTENSIONS.join(', ')} · Max {MAX_FILE_SIZE_MB}MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-3" role="list" aria-label="Uploaded files">
          {files.map((f) => (
            <div
              key={f.uid}
              role="listitem"
              className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center flex-shrink-0">
                <FileIcon type={f.type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-700 truncate">{f.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>{(f.size / 1024).toFixed(0)} KB</span>
                  {f.compressedSize && (
                    <span className="text-success">→ {Math.round(f.compressedSize / 1024)} KB compressed</span>
                  )}
                  {f.done && (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle size={10} /> Uploaded
                    </span>
                  )}
                  {f.error && (
                    <span className="flex items-center gap-1 text-danger">
                      <AlertCircle size={10} /> {f.error}
                    </span>
                  )}
                </div>
                {!f.done && !f.error && (
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => onRemove(f.uid)}
                aria-label={`Remove ${f.name}`}
                className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-danger hover:bg-danger-light transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
