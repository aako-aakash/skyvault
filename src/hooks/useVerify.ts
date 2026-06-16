import { useState, useCallback } from 'react';
import type { VerifyStatus } from '@/types';
import { validatePAN, validateAadhaar, sleep } from '@/utils';

interface VerifyResult {
  ok: boolean;
  message: string;
}

interface UseVerifyReturn {
  status: VerifyStatus;
  message: string;
  verify: (type: 'pan' | 'aadhaar', value: string) => Promise<VerifyResult>;
  reset: () => void;
}

// Simulates 1.5s API verification
const simulateVerify = async (type: 'pan' | 'aadhaar', value: string): Promise<VerifyResult> => {
  await sleep(1500);
  if (type === 'pan') {
    const ok = validatePAN(value.toUpperCase());
    return { ok, message: ok ? 'PAN verified successfully' : 'Invalid PAN format. Expected: AAAAA9999A' };
  } else {
    const clean = value.replace(/\s/g, '');
    const ok = validateAadhaar(clean);
    return { ok, message: ok ? 'Aadhaar verified successfully' : 'Invalid Aadhaar number. Please check and retry.' };
  }
};

export const useVerify = (): UseVerifyReturn => {
  const [status, setStatus]   = useState<VerifyStatus>('idle');
  const [message, setMessage] = useState('');

  const verify = useCallback(async (type: 'pan' | 'aadhaar', value: string): Promise<VerifyResult> => {
    if (!value.trim()) {
      const msg = `Please enter your ${type === 'pan' ? 'PAN' : 'Aadhaar'} number`;
      setStatus('error');
      setMessage(msg);
      return { ok: false, message: msg };
    }
    setStatus('loading');
    setMessage('');
    const result = await simulateVerify(type, value);
    setStatus(result.ok ? 'success' : 'error');
    setMessage(result.message);
    return result;
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage('');
  }, []);

  return { status, message, verify, reset };
};
