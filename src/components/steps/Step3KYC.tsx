import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kycSchema, type KycFormData } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { formatAadhaar } from '@/utils';
import { Card, Field, Input, Toggle, InfoBox, VerifyBadge } from '@/components/common';
import Button from '@/components/common/Button';
import { useVerify } from '@/hooks/useVerify';
import toast from 'react-hot-toast';

interface Step3Props { onNext: () => void; }

const Step3KYC: React.FC<Step3Props> = ({ onNext }) => {
  const { kyc, updateKyc } = useAppStore();
  const panVerifier  = useVerify();
  const aadhVerifier = useVerify();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      ...kyc,
      panVerified:      kyc.panVerified      ?? false,
      aadhaarVerified:  kyc.aadhaarVerified  ?? false,
      aadhaarConsent:   kyc.aadhaarConsent   ?? false,
    },
  });

  const pan            = watch('pan')           ?? '';
  const aadhaar        = watch('aadhaar')       ?? '';
  const panVerified    = watch('panVerified');
  const aadhVerified   = watch('aadhaarVerified');
  const aadhConsent    = watch('aadhaarConsent');

  const handleVerifyPAN = async () => {
    const res = await panVerifier.verify('pan', pan);
    if (res.ok) { setValue('panVerified', true); toast.success(res.message); }
    else toast.error(res.message);
  };

  const handleVerifyAadhaar = async () => {
    const res = await aadhVerifier.verify('aadhaar', aadhaar);
    if (res.ok) { setValue('aadhaarVerified', true); toast.success(res.message); }
    else toast.error(res.message);
  };

  const onSubmit = (data: KycFormData) => {
    updateKyc(data);
    onNext();
  };

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card title="KYC Verification" subtitle="Verify your identity documents per RBI & UIDAI guidelines" icon="🔐">
        <InfoBox type="info" icon="🛡">
          All documents are <strong>AES-256-GCM encrypted</strong>. PAN and Aadhaar are masked and never stored in plaintext.
        </InfoBox>

        {/* PAN */}
        <Field label="PAN Number" required hint="Format: 5 letters · 4 digits · 1 letter (e.g. ABCDE1234F)" error={errors.pan?.message || errors.panVerified?.message}>
          <div className="flex gap-2 items-end">
            <Input
              {...register('pan')}
              placeholder="ABCDE1234F"
              maxLength={10}
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, fontSize: 15 }}
              error={!!errors.pan || !!errors.panVerified}
              className="flex-1"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('pan').onChange(e);
              }}
            />
            <Button
              type="button"
              variant={panVerified ? 'success' : 'outline'}
              size="sm"
              loading={panVerifier.status === 'loading'}
              disabled={panVerified || panVerifier.status === 'loading'}
              onClick={handleVerifyPAN}
              className="flex-shrink-0"
            >
              {panVerified ? '✓ Verified' : 'Verify PAN'}
            </Button>
          </div>
          <VerifyBadge status={panVerified ? 'success' : panVerifier.status} message={panVerifier.message} />
        </Field>

        {/* Aadhaar */}
        <Field label="Aadhaar Number" required hint="12-digit Aadhaar — Verhoeff checksum validated" error={errors.aadhaar?.message || errors.aadhaarVerified?.message}>
          <div className="flex gap-2 items-end">
            <Controller
              name="aadhaar"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ? formatAadhaar(field.value) : ''}
                  onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ''))}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  error={!!errors.aadhaar || !!errors.aadhaarVerified}
                  className="flex-1"
                />
              )}
            />
            <Button
              type="button"
              variant={aadhVerified ? 'success' : 'outline'}
              size="sm"
              loading={aadhVerifier.status === 'loading'}
              disabled={aadhVerified || aadhVerifier.status === 'loading'}
              onClick={handleVerifyAadhaar}
              className="flex-shrink-0"
            >
              {aadhVerified ? '✓ Verified' : 'Verify'}
            </Button>
          </div>
          <VerifyBadge status={aadhVerified ? 'success' : aadhVerifier.status} message={aadhVerifier.message} />
        </Field>

        {/* Aadhaar Consent */}
        <Controller
          name="aadhaarConsent"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={!!field.value}
              onChange={field.onChange}
              label="I consent to Aadhaar-based e-KYC verification per UIDAI Section 57 of the Aadhaar Act, 2016"
            />
          )}
        />
        {errors.aadhaarConsent && <p className="text-[11px] text-danger mt-1">{errors.aadhaarConsent.message}</p>}

        <hr className="border-gray-100 my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Voter ID" hint="Optional">
            <Input {...register('voterId')} placeholder="ABC1234567" maxLength={10}
              onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('voterId').onChange(e); }} />
          </Field>
          <Field label="Passport No." hint="Optional">
            <Input {...register('passportNo')} placeholder="A1234567" maxLength={8}
              onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('passportNo').onChange(e); }} />
          </Field>
        </div>
      </Card>
    </form>
  );
};

export default Step3KYC;
