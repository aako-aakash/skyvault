import React from 'react';
import type { LoanType } from '@/types';
import { calcFinancials, formatINR } from '@/utils';

interface EMIWidgetProps {
  loanType: LoanType;
  amount: number;
  tenure: number;
}

const EMIWidget: React.FC<EMIWidgetProps> = ({ loanType, amount, tenure }) => {
  if (!amount || !tenure) return null;
  const { emi, totalInterest, totalPayable, processingFee, interestRate } = calcFinancials(loanType, amount, tenure);

  return (
    <div className="bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl p-5 text-white mb-4">
      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest opacity-75 mb-1">Estimated Monthly EMI</p>
          <p className="font-heading font-bold text-[32px] leading-none">
            {formatINR(Math.round(emi))}
            <span className="text-[14px] opacity-70 font-normal ml-1">/month</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-widest opacity-75 mb-1">Interest Rate</p>
          <p className="font-heading font-bold text-[22px]">{interestRate}%</p>
          <p className="text-[11px] opacity-70">per annum</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          ['Total Interest',  formatINR(Math.round(totalInterest))],
          ['Total Payable',   formatINR(Math.round(totalPayable))],
          ['Processing Fee',  formatINR(Math.round(processingFee))],
        ].map(([label, value]) => (
          <div key={label} className="bg-white/10 rounded-lg p-2.5">
            <p className="text-[10px] opacity-70 mb-1">{label}</p>
            <p className="font-semibold text-[13px]">{value}</p>
          </div>
        ))}
      </div>

      {/* Eligibility meter */}
      <div>
        <div className="flex justify-between text-[11px] opacity-80 mb-1.5">
          <span>Eligibility Meter</span>
          <span>Good Standing</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: '78%', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
};

export default EMIWidget;
