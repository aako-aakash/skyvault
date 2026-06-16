import React, { useState, useMemo } from 'react';
import { Card, Field, Select } from '@/components/common';
import { LOAN_LIMITS, TENURE_OPTIONS, INTEREST_RATES } from '@/constants';
import { calcFinancials, formatINR, tenureLabel } from '@/utils';
import type { LoanType } from '@/types';

const CalculatorPage: React.FC = () => {
  const [loanType, setLoanType] = useState<LoanType>('personal');
  const [amount,   setAmount]   = useState(500_000);
  const [tenure,   setTenure]   = useState(36);

  const limits  = LOAN_LIMITS[loanType];
  const results = useMemo(() => calcFinancials(loanType, amount, tenure), [loanType, amount, tenure]);

  // Pie chart data
  const pieData = [
    { label: 'Principal',       value: amount,                  color: '#1F4E79' },
    { label: 'Interest',        value: results.totalInterest,   color: '#2980B9' },
    { label: 'Processing Fee',  value: results.processingFee,   color: '#85C1E9' },
  ];
  const totalPie = pieData.reduce((s, x) => s + x.value, 0);

  const slices = useMemo(() => {
    let cum = 0;
    return pieData.map((d) => {
      const start = cum;
      const angle = (d.value / totalPie) * 360;
      cum += angle;
      const toRad  = (a: number) => (a - 90) * Math.PI / 180;
      const x1 = 50 + 40 * Math.cos(toRad(start));
      const y1 = 50 + 40 * Math.sin(toRad(start));
      const x2 = 50 + 40 * Math.cos(toRad(start + angle));
      const y2 = 50 + 40 * Math.sin(toRad(start + angle));
      const large = angle > 180 ? 1 : 0;
      return { ...d, path: `M50,50 L${x1},${y1} A40,40 0 ${large},1 ${x2},${y2} Z` };
    });
  }, [pieData, totalPie]);

  const handleTypeChange = (type: LoanType) => {
    setLoanType(type);
    setAmount(LOAN_LIMITS[type].min);
    setTenure(TENURE_OPTIONS[type][2] ?? TENURE_OPTIONS[type][0]);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="font-heading font-bold text-xl text-gray-800">EMI Calculator</h1>
        <p className="text-sm text-gray-500 mt-1">Calculate your monthly instalments and total cost of borrowing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input */}
        <div>
          <Card title="Loan Parameters" icon="⚙">
            <Field label="Loan Type" className="mb-4">
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {(['personal', 'home', 'business'] as LoanType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    aria-pressed={loanType === t}
                    className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${
                      loanType === t ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </Field>

            <div className="bg-brand-50 rounded-xl p-4 mb-4">
              <div className="text-center mb-3">
                <p className="font-heading font-bold text-[28px] text-brand-600">{formatINR(amount)}</p>
                <p className="text-[11px] text-gray-500">Loan Amount</p>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                <span>{formatINR(limits.min)}</span>
                <span>{formatINR(limits.max)}</span>
              </div>
              <input
                type="range"
                min={limits.min} max={limits.max} step={10000}
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                className="w-full"
                aria-label="Loan amount"
              />
            </div>

            <Field label="Tenure">
              <Select
                value={String(tenure)}
                onChange={(e) => setTenure(+e.target.value)}
                options={TENURE_OPTIONS[loanType].map((m) => ({ value: m, label: tenureLabel(m) }))}
              />
            </Field>
          </Card>
        </div>

        {/* Right: Results */}
        <div>
          <Card title="Result" icon="📊">
            <div className="text-center mb-5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Monthly EMI</p>
              <p className="font-heading font-bold text-[36px] text-brand-600">
                {formatINR(Math.round(results.emi))}
              </p>
              <p className="text-[12px] text-gray-500">
                {INTEREST_RATES[loanType]}% p.a. · {tenure} months
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Principal',       formatINR(amount)],
                ['Total Interest',  formatINR(Math.round(results.totalInterest))],
                ['Total Payable',   formatINR(Math.round(results.totalPayable))],
                ['Processing Fee',  formatINR(Math.round(results.processingFee))],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-[13px] text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Pie chart */}
            <div className="flex flex-col items-center">
              <svg
                width={140} height={140}
                viewBox="0 0 100 100"
                aria-label="Loan cost breakdown pie chart"
                role="img"
              >
                {slices.map((s, i) => (
                  <path key={i} d={s.path} fill={s.color} />
                ))}
                <circle cx={50} cy={50} r={22} fill="white" />
              </svg>
              <div className="flex gap-4 flex-wrap justify-center mt-3">
                {pieData.map((d) => (
                  <div key={d.label} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
