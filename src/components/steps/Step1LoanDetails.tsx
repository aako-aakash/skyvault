import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema, type LoanFormData } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { LOAN_LIMITS, TENURE_OPTIONS, LOAN_PURPOSES, INTEREST_RATES } from '@/constants';
import { formatINR, tenureLabel } from '@/utils';
import { Card, Field, Select, Input } from '@/components/common';
import EMIWidget from '@/components/financial/EMIWidget';
import type { LoanType } from '@/types';

const LOAN_CARDS = [
  { type: 'personal' as LoanType, icon: '💳', title: 'Personal Loan',  desc: 'Quick funds for personal needs' },
  { type: 'home'     as LoanType, icon: '🏠', title: 'Home Loan',      desc: 'Buy, build or renovate your home' },
  { type: 'business' as LoanType, icon: '💼', title: 'Business Loan',  desc: 'Fuel your business ambitions' },
];

interface Step1Props { onNext: () => void; }

const Step1LoanDetails: React.FC<Step1Props> = ({ onNext }) => {
  const { loan, updateLoan } = useAppStore();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: { ...loan, amount: loan.amount ?? 500000 },
  });

  const watchedType   = watch('type');
  const watchedAmount = watch('amount');
  const watchedTenure = watch('tenure');
  const limits = watchedType ? LOAN_LIMITS[watchedType] : LOAN_LIMITS.personal;

  const handlePickType = (type: LoanType) => {
    setValue('type', type);
    const defaultAmounts: Record<LoanType, number> = { personal: 500000, home: 3000000, business: 1500000 };
    setValue('amount', defaultAmounts[type]);
    setValue('tenure', undefined as unknown as number);
    setValue('purpose', '');
  };

  const onSubmit = (data: LoanFormData) => {
    updateLoan(data);
    onNext();
  };

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Loan Type */}
      <Card title="Choose Loan Type" subtitle="Select the product that best matches your requirement" icon="🏦">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-1">
          {LOAN_CARDS.map(({ type, icon, title, desc }) => (
            <button
              key={type}
              type="button"
              onClick={() => handlePickType(type)}
              aria-pressed={watchedType === type}
              className={`relative border-2 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 hover:border-brand-400 hover:-translate-y-px ${
                watchedType === type
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 bg-white hover:bg-blue-50'
              }`}
            >
              {watchedType === type && (
                <span className="absolute top-2 right-2 w-[18px] h-[18px] bg-brand-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center">✓</span>
              )}
              <div className="text-[26px] mb-2">{icon}</div>
              <div className="font-heading font-semibold text-[13px] text-gray-800 mb-1">{title}</div>
              <div className="text-[10px] text-gray-500 leading-tight mb-2">{desc}</div>
              {watchedType && INTEREST_RATES[type] && (
                <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  {INTEREST_RATES[type]}% p.a.
                </span>
              )}
            </button>
          ))}
        </div>
        {errors.type && <p className="text-[11px] text-danger mt-2" role="alert">{errors.type.message}</p>}
      </Card>

      {/* Loan Config */}
      {watchedType && (
        <>
          <Card title="Loan Configuration" subtitle="Set your amount, tenure and purpose" icon="💰">
            {/* Slider */}
            <div className="bg-brand-50 rounded-xl p-4 mb-4">
              <div className="text-center mb-3">
                <p className="font-heading font-bold text-[28px] text-brand-600">{formatINR(watchedAmount || limits.min)}</p>
                <p className="text-[11px] text-gray-500">Loan Amount</p>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                <span>{formatINR(limits.min)}</span><span>{formatINR(limits.max)}</span>
              </div>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min={limits.min} max={limits.max} step={10000}
                    value={field.value || limits.min}
                    onChange={(e) => field.onChange(+e.target.value)}
                    className="w-full"
                    aria-label="Loan amount slider"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Exact Amount" error={errors.amount?.message}>
                <Input
                  type="number" prefix="₹"
                  {...register('amount', { valueAsNumber: true })}
                  min={limits.min} max={limits.max}
                  error={!!errors.amount}
                />
              </Field>
              <div />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Loan Tenure" required error={errors.tenure?.message}>
                <Controller
                  name="tenure"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(+e.target.value)}
                      options={TENURE_OPTIONS[watchedType].map((m) => ({ value: m, label: tenureLabel(m) }))}
                      placeholder="Select Tenure"
                      error={!!errors.tenure}
                    />
                  )}
                />
              </Field>
              <Field label="Loan Purpose" required error={errors.purpose?.message}>
                <Select
                  {...register('purpose')}
                  options={LOAN_PURPOSES[watchedType]}
                  placeholder="Select Purpose"
                  error={!!errors.purpose}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Referral Code" hint="Optional — ₹500 cashback on disbursement">
                <Input {...register('referralCode')} placeholder="Enter referral code" />
              </Field>
              <div />
            </div>
          </Card>

          {/* EMI Widget */}
          {watchedAmount && watchedTenure && (
            <EMIWidget loanType={watchedType} amount={watchedAmount} tenure={watchedTenure} />
          )}
        </>
      )}
    </form>
  );
};

export default Step1LoanDetails;
