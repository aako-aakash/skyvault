import { useState, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { UploadedFile } from '@/types';
import { compressImage } from '@/utils';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/constants';

interface UseFileUploadReturn {
  files: UploadedFile[];
  addFiles: (fileList: FileList | File[]) => Promise<void>;
  removeFile: (uid: string) => void;
  clearFiles: () => void;
  setFiles: Dispatch<SetStateAction<UploadedFile[]>>;
}

export const useFileUpload = (initial: UploadedFile[] = []): UseFileUploadReturn => {
  const [files, setFiles] = useState<UploadedFile[]>(initial);

  const simulateUpload = useCallback((uid: string) => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 30;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setFiles((prev) => prev.map((f) => f.uid === uid ? { ...f, progress: 100, done: true } : f));
        return;
      }
      setFiles((prev) => prev.map((f) => f.uid === uid ? { ...f, progress: p } : f));
    }, 350);
  }, []);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    for (const file of arr) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        const uid = 'err-' + Date.now();
        setFiles((prev) => [...prev, {
          uid, name: file.name, size: file.size, type: file.type,
          progress: 0, done: false, error: 'Unsupported format. Use PDF, PNG, or JPG.',
        }]);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const uid = 'err-' + Date.now();
        setFiles((prev) => [...prev, {
          uid, name: file.name, size: file.size, type: file.type,
          progress: 0, done: false, error: `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`,
        }]);
        continue;
      }
      const uid = 'f' + Date.now() + Math.random().toString(36).slice(2);
      setFiles((prev) => [...prev, { uid, name: file.name, size: file.size, type: file.type, progress: 0, done: false }]);
      simulateUpload(uid);
      if (file.type.startsWith('image/')) {
        try {
          const { dataUrl, size } = await compressImage(file);
          setFiles((prev) => prev.map((f) => f.uid === uid ? { ...f, compressed: dataUrl, compressedSize: size } : f));
        } catch { /* silent */ }
      }
    }
  }, [simulateUpload]);

  const removeFile = useCallback((uid: string) => {
    setFiles((prev) => prev.filter((f) => f.uid !== uid));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  return { files, addFiles, removeFile, clearFiles, setFiles };
};
