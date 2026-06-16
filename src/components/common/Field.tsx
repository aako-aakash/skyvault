// Field.tsx
import React from 'react';
import { cn } from '@/utils';

interface FieldProps {
  label?:     string;
  required?:  boolean;
  hint?:      string;
  error?:     string;
  children:   React.ReactNode;
  className?: string;
  id?:        string;
}

const Field: React.FC<FieldProps> = ({ label, required, hint, error, children, className, id }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    {label && (
      <label
        htmlFor={id}
        className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide"
      >
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-[11px] text-gray-500">{hint}</p>}
    {error && (
      <p className="text-[11px] text-danger" role="alert" aria-live="polite">{error}</p>
    )}
  </div>
);

export default Field;
