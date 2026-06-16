import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalSchema, type PersonalFormData } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { calcAge, maxDobDate, minDobDate } from '@/utils';
import { DEMO_OTP } from '@/constants';
import { Card, Field, Input, Select, Toggle, OTPInput, InfoBox } from '@/components/common';
import Button from '@/components/common/Button';
import { sendOTP, verifyOTP } from '@/services/api';
import toast from 'react-hot-toast';

interface Step2Props { onNext: () => void; }

const Step2PersonalInfo: React.FC<Step2Props> = ({ onNext }) => {
  const { personal, updatePersonal } = useAppStore();
  const [otpSent,    setOtpSent]    = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: { ...personal, otpVerified: personal.otpVerified ?? false },
  });

  const watchedDob      = watch('dob');
  const watchedMobile   = watch('mobile');
  const otpVerified     = watch('otpVerified');

  const handleSendOTP = async () => {
    if (!watchedMobile || !/^[6-9]\d{9}$/.test(watchedMobile)) {
      toast.error('Enter valid 10-digit mobile number first');
      return;
    }
    setOtpLoading(true);
    const res = await sendOTP(watchedMobile);
    setOtpLoading(false);
    if (res.success) { setOtpSent(true); toast.success(res.message); }
  };

  const handleVerifyOTP = async (otp: string) => {
    const res = await verifyOTP(watchedMobile, otp);
    if (res.success) {
      setValue('otpVerified', true);
      setOtpSent(false);
      toast.success(res.message);
    } else {
      toast.error(`${res.message} (Demo: ${DEMO_OTP})`);
    }
  };

  const onSubmit = (data: PersonalFormData) => {
    updatePersonal(data);
    onNext();
  };

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card title="Personal Information" subtitle="Your details as per official KYC documents" icon="👤">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Full Name" required error={errors.fullName?.message}>
            <Input {...register('fullName')} placeholder="As per PAN card" error={!!errors.fullName} />
          </Field>
          <Field label="Date of Birth" required error={errors.dob?.message}
            hint={watchedDob ? `Age: ${calcAge(watchedDob)} years` : ''}>
            <Input type="date" {...register('dob')} min={minDobDate(65)} max={maxDobDate(21)} error={!!errors.dob} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Gender" required error={errors.gender?.message}>
            <Controller name="gender" control={control} render={({ field }) => (
              <Select {...field} value={field.value || ''} error={!!errors.gender}
                options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            )} />
          </Field>
          <Field label="Marital Status">
            <Controller name="maritalStatus" control={control} render={({ field }) => (
              <Select {...field} value={field.value || ''}
                options={['Single', 'Married', 'Divorced', 'Widowed'].map((v) => ({ value: v.toLowerCase(), label: v }))} />
            )} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Father's Name">
            <Input {...register('fatherName')} placeholder="Father's full name" />
          </Field>
          <Field label="Mother's Name">
            <Input {...register('motherName')} placeholder="Mother's full name" />
          </Field>
        </div>

        <hr className="border-gray-100 my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Mobile Number" required error={errors.mobile?.message}>
            <Input type="tel" maxLength={10} prefix="+91" placeholder="10-digit mobile"
              {...register('mobile')} error={!!errors.mobile} />
          </Field>
          <Field label="Email Address" required error={errors.email?.message}>
            <Input type="email" placeholder="you@email.com" {...register('email')} error={!!errors.email} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Alternate Mobile" error={errors.altMobile?.message}>
            <Input type="tel" maxLength={10} prefix="+91" {...register('altMobile')} error={!!errors.altMobile} />
          </Field>
          <div className="flex flex-col justify-end">
            {otpVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-light text-green-800 border border-success-border rounded-full text-[11px] font-semibold w-fit">
                ✓ Mobile Verified
              </span>
            ) : (
              <Button type="button" variant="outline" size="sm" loading={otpLoading} onClick={handleSendOTP}>
                Send OTP
              </Button>
            )}
          </div>
        </div>

        {errors.otpVerified && (
          <p className="text-[11px] text-danger mb-2" role="alert">{errors.otpVerified.message}</p>
        )}

        {otpSent && (
          <div>
            <InfoBox type="info" icon="📱">
              OTP sent successfully!{' '}
              <strong className="text-brand-700">Demo OTP: {DEMO_OTP}</strong>
            </InfoBox>
            <OTPInput onComplete={handleVerifyOTP} />
          </div>
        )}
      </Card>
    </form>
  );
};

export default Step2PersonalInfo;
