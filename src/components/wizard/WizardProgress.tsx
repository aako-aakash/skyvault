import React from 'react';
import { STEP_LABELS } from '@/constants';
import { cn } from '@/utils';

interface WizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, onStepClick }) => {
  const pct = (currentStep / 8) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-5 shadow-card">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <h1 className="font-heading font-semibold text-[15px] text-gray-800">
          {STEP_LABELS[currentStep - 1]}
        </h1>
        <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[12px] font-semibold">
          Step {currentStep} / 8
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={8}>
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps row */}
      <div className="flex overflow-x-auto scrollbar-none pb-1">
        {STEP_LABELS.map((label, idx) => {
          const step = idx + 1;
          const done   = step < currentStep;
          const active = step === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center flex-1 min-w-[56px] relative"
            >
              {/* Connector line */}
              {step < 8 && (
                <div className={cn(
                  'absolute top-[12px] left-[55%] right-[-45%] h-[2px] z-0',
                  done ? 'bg-brand-600' : 'bg-gray-200',
                )} />
              )}

              {/* Circle */}
              <button
                onClick={() => done && onStepClick?.(step)}
                disabled={!done}
                aria-label={`${label} — ${done ? 'Completed' : active ? 'Current' : 'Pending'}`}
                className={cn(
                  'w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold',
                  'relative z-10 transition-all duration-200 flex-shrink-0',
                  done   && 'bg-brand-600 text-white cursor-pointer hover:bg-brand-700',
                  active && 'bg-brand-600 text-white ring-4 ring-brand-600/20 cursor-default',
                  !done && !active && 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-default',
                )}
              >
                {done ? '✓' : step}
              </button>

              {/* Label */}
              <span className={cn(
                'text-[9px] mt-1 text-center leading-tight max-w-[60px]',
                (done || active) ? 'text-brand-600 font-semibold' : 'text-gray-400',
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgress;
