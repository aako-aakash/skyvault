import React from 'react';
import { cn } from '@/utils';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: (string | SelectOption)[];
  placeholder?: string;
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder = 'Select', error, className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 text-[13px] text-gray-800 bg-white',
        'border-[1.5px] border-gray-200 rounded-lg',
        'transition-all duration-150',
        'hover:border-gray-300',
        'focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/[0.07] focus:outline-none',
        'disabled:bg-gray-50 disabled:cursor-not-allowed',
        'appearance-none cursor-pointer',
        error && 'border-danger focus:border-danger focus:ring-danger/[0.07]',
        !props.value && 'text-gray-400',
        className,
      )}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const val   = typeof opt === 'string' ? opt : String(opt.value);
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={val} value={val} className="text-gray-800">
            {label}
          </option>
        );
      })}
    </select>
  )
);

Select.displayName = 'Select';
export default Select;
