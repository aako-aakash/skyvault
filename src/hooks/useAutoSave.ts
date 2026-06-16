import { useEffect, useRef, useCallback, useState } from 'react';
import { saveDraft } from '@/utils';
import { AUTOSAVE_INTERVAL_MS } from '@/constants';

interface UseAutoSaveOptions {
  data: unknown;
  interval?: number;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  saveNow: () => void;
}

export const useAutoSave = ({
  data,
  interval = AUTOSAVE_INTERVAL_MS,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doSave = useCallback(() => {
    setIsSaving(true);
    try {
      saveDraft(data);
      setLastSaved(new Date());
    } catch {
      // Silently fail
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  const saveNow = useCallback(() => doSave(), [doSave]);

  useEffect(() => {
    timerRef.current = setInterval(doSave, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [doSave, interval]);

  return { lastSaved, isSaving, saveNow };
};
