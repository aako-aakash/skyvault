import React from 'react';
import { cn } from '@/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-3 h-3 border-[2px]', md: 'w-5 h-5 border-[2px]', lg: 'w-8 h-8 border-[3px]' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn(
      'inline-block rounded-full border-current border-t-transparent animate-spin',
      sizes[size],
      className,
    )}
  />
);

export default Spinner;
