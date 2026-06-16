import React from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, error, className, inputClassName, ...props }, ref) => {
    const base = cn(
      'w-full px-3 py-2.5 text-[13px] text-gray-800 bg-white',
      'border-[1.5px] border-gray-200 rounded-lg',
      'transition-all duration-150',
      'hover:border-gray-300',
      'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/[0.07] focus:outline-none',
      'placeholder:text-gray-400',
      'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
      error && 'border-danger focus:border-danger focus:ring-danger/[0.07]',
      inputClassName,
    );

    if (prefix || suffix) {
      return (
        <div className={cn('flex', className)}>
          {prefix && (
            <span className="inline-flex items-center px-3 py-2.5 bg-gray-50 border-[1.5px] border-r-0 border-gray-200 rounded-l-lg text-[13px] text-gray-600 font-medium whitespace-nowrap">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(base, prefix && 'rounded-l-none border-l-0', suffix && 'rounded-r-none border-r-0', 'flex-1')}
            {...props}
          />
          {suffix && (
            <span className="inline-flex items-center px-3 py-2.5 bg-gray-50 border-[1.5px] border-l-0 border-gray-200 rounded-r-lg text-[12px] font-semibold text-gray-600 whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>
      );
    }

    return <input ref={ref} className={cn(base, className)} {...props} />;
  }
);

Input.displayName = 'Input';
export default Input;
