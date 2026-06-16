import React, { useEffect } from 'react';
import { cn } from '@/utils';

interface ModalProps {
  show: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

const Modal: React.FC<ModalProps> = ({ show, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className={cn(
          'bg-white rounded-2xl p-7 w-full shadow-modal animate-fade-in',
          sizes[size],
        )}
      >
        {title && (
          <h2 id="modal-title" className="font-heading font-bold text-[17px] text-gray-800 mb-2">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
