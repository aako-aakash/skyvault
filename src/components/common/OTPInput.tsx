import React, { useRef, useState } from 'react';
import { cn } from '@/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

// Fixed: refs created with fixed-size array, no hooks in loops
const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, disabled }) => {
  const [vals, setVals] = useState<string[]>(Array(6).fill(''));
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...vals];
    next[i] = v;
    setVals(next);
    if (v && i < length - 1) refs[i + 1].current?.focus();
    if (next.slice(0, length).every((x) => x)) {
      onComplete(next.slice(0, length).join(''));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setVals(next);
    refs[Math.min(pasted.length, length - 1)].current?.focus();
    if (pasted.length === length) onComplete(pasted);
  };

  return (
    <div className="flex gap-2 justify-center my-4" role="group" aria-label="OTP input">
      {vals.slice(0, length).map((v, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-12 text-center text-xl font-bold text-brand-600',
            'border-2 border-gray-200 rounded-lg',
            'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 focus:outline-none',
            'transition-all duration-150',
            v && 'border-brand-600 bg-brand-50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
      ))}
    </div>
  );
};

export default OTPInput;
