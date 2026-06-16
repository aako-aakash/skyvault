import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  title?:     string;
  subtitle?:  string;
  icon?:      React.ReactNode;
  children:   React.ReactNode;
  className?: string;
  actions?:   React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  title, subtitle, icon, children, className, actions, noPadding,
}) => (
  <div
    className={cn(
      'bg-white border border-gray-200 rounded-xl shadow-card mb-4',
      !noPadding && 'p-6',
      className,
    )}
  >
    {(title || subtitle || actions) && (
      <div className={cn('flex items-start justify-between gap-3 mb-4', noPadding && 'px-6 pt-6')}>
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-xl leading-none">{icon}</span>}
          <div>
            {title && (
              <h2 className="font-heading font-semibold text-[15px] text-gray-800 leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Card;
