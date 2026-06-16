import React from 'react';
import type { VerifyStatus } from '@/types';
import Spinner from './Spinner';

interface VerifyBadgeProps {
  status: VerifyStatus;
  message?: string;
}

const VerifyBadge: React.FC<VerifyBadgeProps> = ({ status, message }) => {
  if (status === 'idle') return null;

  const styles = {
    loading: 'bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]',
    success: 'bg-success-light text-green-800 border border-success-border',
    error:   'bg-danger-light text-red-800 border border-danger-border',
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-1 ${styles[status]}`}
    >
      {status === 'loading' && <Spinner size="sm" className="text-current" />}
      {status === 'success' && '✓'}
      {status === 'error'   && '✗'}
      {message || (status === 'loading' ? 'Verifying…' : status === 'success' ? 'Verified' : 'Failed')}
    </span>
  );
};

export default VerifyBadge;
