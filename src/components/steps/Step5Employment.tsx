import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employmentSchema, type EmploymentFormData } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { validateGST, formatINR, calcFinancials } from '@/utils';
import { INTEREST_RATES, EMI_INCOME_RATIO_MAX } from '@/constants';
import { Card, Field, Input, Select, InfoBox } from '@/components/common';
import type { EmploymentType } from '@/types';

interface Step5Props { onNext: () => void; }

const TABS: { value: EmploymentType; label: string }[] = [
  { value: 'salaried',       label: '💼 Salaried' },
  { value: 'self_employed',  label: '🏪 Self-Employed' },
  { value: 'business_owner', label: '🏢 Business Owner' },
];

const Step5Employment: React.FC<Step5Props> = ({ onNext }) => {
  const { employment, updateEmployment, loan } = useAppStore();
  const [gstValid, setGstValid] = useState<boolean | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: employment,
  });

  const empType       = watch('type');
  const monthlyIncome = watch('monthlyIncome') ?? 0;

  // EMI ratio check
  const emiInfo = loan.amount && loan.tenure && loan.type
    ? calcFinancials(loan.type, loan.amount, loan.tenure)
    : null;
  const emiRatio   = emiInfo && monthlyIncome ? (emiInfo.emi / monthlyIncome) * 100 : null;
  const eligible   = emiRatio !== null && emiRatio <= EMI_INCOME_RATIO_MAX * 100;

  const onSubmit = (data: EmploymentFormData) => {
    updateEmployment(data);
    onNext();
  };

  const expOptions    = ['< 1 year', '1–2 years', '2–5 years', '5–10 years', '10+ years'];
  const profOptions   = ['Doctor', 'Lawyer', 'CA / CS', 'Architect', 'Consultant', 'Freelancer', 'Trader', 'Other'];
  const bizYrsOptions = ['< 1 year', '1–2 years', '2–5 years', '5–10 years', '10+ years'];

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card title="Employment & Income" subtitle="Your employment profile determines loan eligibility" icon="💼">
        {/* Employment Type Tabs */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
            Employment Type<span className="text-danger ml-0.5">*</span>
          </label>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('type', value)}
                aria-pressed={empType === value}
                className={`flex-1 py-2 px-3 text-[12px] font-semibold transition-colors text-center ${
                  empType === value
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.type && <p className="text-[11px] text-danger mt-1">{errors.type.message}</p>}
        </div>

        {/* ── Salaried ── */}
        {empType === 'salaried' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Company Name">
                <Input {...register('companyName')} placeholder="Employer name" />
              </Field>
              <Field label="Designation">
                <Input {...register('designation')} placeholder="Job title" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Net Monthly Salary" required error={errors.monthlyIncome?.message} hint="Take-home after deductions">
                <Input type="number" prefix="₹" {...register('monthlyIncome', { valueAsNumber: true })} placeholder="Monthly salary" error={!!errors.monthlyIncome} />
              </Field>
              <Field label="Work Experience">
                <Controller name="experience" control={control} render={({ field }) => (
                  <Select {...field} value={field.value || ''} options={expOptions} />
                )} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Gross Salary">
                <Input type="number" prefix="₹" {...register('grossSalary', { valueAsNumber: true })} />
              </Field>
              <Field label="PF / Deductions">
                <Input type="number" prefix="₹" {...register('deductions', { valueAsNumber: true })} />
              </Field>
            </div>
          </>
        )}

        {/* ── Self-Employed ── */}
        {empType === 'self_employed' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Business / Practice Name">
                <Input {...register('businessName')} placeholder="Name of practice" />
              </Field>
              <Field label="Profession Type">
                <Controller name="professionType" control={control} render={({ field }) => (
                  <Select {...field} value={field.value || ''} options={profOptions} />
                )} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Average Monthly Income" required error={errors.monthlyIncome?.message}>
                <Input type="number" prefix="₹" {...register('monthlyIncome', { valueAsNumber: true })} error={!!errors.monthlyIncome} />
              </Field>
              <Field label="Annual Turnover">
                <Input type="number" prefix="₹" {...register('turnover', { valueAsNumber: true })} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Years in Business">
                <Controller name="yearsInBusiness" control={control} render={({ field }) => (
                  <Select {...field} value={field.value || ''} options={bizYrsOptions} />
                )} />
              </Field>
              <div />
            </div>
          </>
        )}

        {/* ── Business Owner ── */}
        {empType === 'business_owner' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="GST Number" error={errors.gstNumber?.message} hint="Format: 22AAAAA0000A1Z5">
                <div>
                  <Input
                    {...register('gstNumber')}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    style={{ textTransform: 'uppercase' }}
                    error={!!errors.gstNumber}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      register('gstNumber').onChange(e);
                      if (e.target.value.length === 15) setGstValid(validateGST(e.target.value));
                      else setGstValid(null);
                    }}
                  />
                  {gstValid !== null && (
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${gstValid ? 'bg-success-light text-green-800 border border-success-border' : 'bg-danger-light text-red-800 border border-danger-border'}`}>
                      {gstValid ? '✓ Valid GST' : '✗ Invalid GST format'}
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Business Reg. No.">
                <Input {...register('businessRegNo')} placeholder="CIN / LLP / MSME No." />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Monthly Income" required error={errors.monthlyIncome?.message}>
                <Input type="number" prefix="₹" {...register('monthlyIncome', { valueAsNumber: true })} error={!!errors.monthlyIncome} />
              </Field>
              <Field label="Business Address">
                <Input {...register('businessAddress')} placeholder="Registered business address" />
              </Field>
            </div>
          </>
        )}

        {!empType && (
          <InfoBox type="info" icon="☝️">Select your employment type above to continue.</InfoBox>
        )}

        {/* EMI / Income ratio */}
        {emiRatio !== null && (
          <InfoBox type={eligible ? 'success' : 'warning'} icon={eligible ? '✅' : '⚠️'} className="mt-4">
            <strong>{eligible ? 'Loan Eligible' : 'EMI Exceeds Recommended Limit'}</strong>
            {' '}— EMI/Income ratio:{' '}
            <strong>{Math.round(emiRatio)}%</strong>
            {' '}(max {EMI_INCOME_RATIO_MAX * 100}%) &nbsp;|&nbsp; EMI: <strong>{formatINR(Math.round(emiInfo!.emi))}</strong>/month
          </InfoBox>
        )}
      </Card>
    </form>
  );
};

export default Step5Employment;
