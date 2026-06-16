import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { AppPage } from '@/types';

const NAV_ITEMS: { page: AppPage; label: string; emoji: string }[] = [
  { page: 'apply',      label: 'Apply',      emoji: '🏠' },
  { page: 'calculator', label: 'Calculator', emoji: '🧮' },
  { page: 'dashboard',  label: 'Dashboard',  emoji: '📊' },
];

const Header: React.FC = () => {
  const { page, setPage, ...storeData } = useAppStore();
  const { lastSaved } = useAutoSave({ data: storeData });

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-[100] shadow-[0_1px_3px_rgba(0,0,0,0.07)]">
      {/* Logo */}
      <button
        onClick={() => setPage('apply')}
        className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 rounded"
        aria-label="SkyVault Lending — go to home"
      >
        <div className="w-9 h-9 bg-brand-600 rounded-[9px] flex items-center justify-center text-white font-bold text-[17px] font-heading flex-shrink-0">
          SV
        </div>
        <div>
          <div className="font-heading font-bold text-[17px] text-brand-600 leading-tight">
            SkyVault Lending
          </div>
          <div className="text-[10px] text-gray-500 leading-none">Enterprise Loan Origination Platform</div>
        </div>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Auto-save indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
          <span>{lastSaved ? `Saved ${lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Auto-saving…'}</span>
        </div>

        {/* Nav */}
        <nav className="flex gap-1.5" aria-label="Main navigation">
          {NAV_ITEMS.map(({ page: p, label, emoji }) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={page === p ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                page === p
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </nav>

        {/* Security badges */}
        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-success-light text-green-800 border border-success-border rounded-full text-[11px] font-semibold">
          <Lock size={10} /> AES-256
        </span>
        <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE] rounded-full text-[11px] font-semibold">
          <Shield size={10} /> RBI Compliant
        </span>
      </div>
    </header>
  );
};

export default Header;
