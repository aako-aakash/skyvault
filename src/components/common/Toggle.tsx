import React from 'react';
import { cn } from '@/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, className, disabled, id }) => (
  <label
    className={cn(
      'flex items-start gap-3 cursor-pointer select-none py-1',
      disabled && 'opacity-50 cursor-not-allowed',
      className,
    )}
    htmlFor={id}
  >
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 mt-0.5 w-10 h-[22px] rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
        checked ? 'bg-brand-600' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white',
          'shadow-sm transition-transform duration-200',
          checked && 'translate-x-[18px]',
        )}
      />
    </button>
    {label && <span className="text-[13px] text-gray-700 leading-relaxed">{label}</span>}
  </label>
);

export default Toggle;
