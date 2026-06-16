import React from 'react';
import { cn } from '@/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-success-light text-green-800 border border-success-border',
  warning: 'bg-warning-light text-yellow-800 border border-warning-border',
  danger:  'bg-danger-light text-red-800 border border-danger-border',
  info:    'bg-brand-50 text-brand-700 border border-brand-200',
  outline: 'bg-white text-gray-700 border border-gray-200',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className, dot }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
      variants[variant],
      className,
    )}
  >
    {dot && (
      <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-gray-500':   variant === 'default',
        'bg-success':    variant === 'success',
        'bg-warning':    variant === 'warning',
        'bg-danger':     variant === 'danger',
        'bg-brand-600':  variant === 'info',
      })} />
    )}
    {children}
  </span>
);

export default Badge;
