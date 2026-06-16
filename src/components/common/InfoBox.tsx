import React from 'react';
import { cn } from '@/utils';

type InfoBoxType = 'info' | 'success' | 'warning' | 'danger';

interface InfoBoxProps {
  type?: InfoBoxType;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<InfoBoxType, string> = {
  info:    'bg-brand-50 border border-[#BDD5EE] text-[#1A4A6E]',
  success: 'bg-success-light border border-success-border text-green-800',
  warning: 'bg-warning-light border border-warning-border text-yellow-800',
  danger:  'bg-danger-light border border-danger-border text-red-800',
};

const InfoBox: React.FC<InfoBoxProps> = ({ type = 'info', icon, children, className }) => (
  <div
    role="note"
    className={cn(
      'flex gap-2.5 rounded-lg px-4 py-3 text-[12px] leading-relaxed mb-3',
      styles[type],
      className,
    )}
  >
    {icon && <span className="text-[15px] flex-shrink-0 mt-0.5">{icon}</span>}
    <div className="flex-1">{children}</div>
  </div>
);

export default InfoBox;
