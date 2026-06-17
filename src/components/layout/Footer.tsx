import React from 'react';
import { Linkedin } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center mt-auto" role="contentinfo">
    <p className="text-[12px] text-gray-600 mb-1.5">
      Designed &amp; Developed by{' '}
      <strong className="text-gray-800">Akash Kumar Saw</strong>
      {' '}| skyward Labs
    </p>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <a
        href="https://www.linkedin.com/in/aako-aakash"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[11px] font-medium transition-colors"
        aria-label="Aakash Kumar Saw on LinkedIn"
      >
        <Linkedin size={12} /> LinkedIn Profile
      </a>
      <span className="text-gray-300 text-[11px]">·</span>
      <span className="text-[11px] text-gray-400">© 2026 SkyVault Lending</span>
      <span className="text-gray-300 text-[11px]">·</span>
      <span className="text-[11px] text-gray-400">ISO 27001 Certified</span>
      <span className="text-gray-300 text-[11px]">·</span>
      <span className="text-[11px] text-gray-400">DPDP Act 2023 Compliant</span>
      <span className="text-gray-300 text-[11px]">·</span>
      <span className="text-[11px] text-gray-400">RBI Guidelines Followed</span>
    </div>
  </footer>
);

export default Footer;
