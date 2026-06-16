import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { coApplicantSchema } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { coAppRequired, formatINR } from '@/utils';
import { Card, Field, Input, Select, Toggle, InfoBox, VerifyBadge } from '@/components/common';
import Button from '@/components/common/Button';
import SignatureCanvas from '@/components/financial/SignatureCanvas';
import { useVerify } from '@/hooks/useVerify';
import toast from 'react-hot-toast';

type CoAppForm = z.infer<typeof coApplicantSchema>;

interface Step6Props { onNext: () => void; }

const Step6CoApplicant: React.FC<Step6Props> = ({ onNext }) => {
  const { coApplicant, updateCoApplicant, loan } = useAppStore();
  const panVerifier = useVerify();
  const required    = coAppRequired(loan);

  const { register, control, handleSubmit, watch, setValue } = useForm<CoAppForm>({
    resolver: zodResolver(coApplicantSchema),
    defaultValues: {
      name:         coApplicant.name         ?? '',
      relationship: coApplicant.relationship ?? '',
      dob:          coApplicant.dob          ?? '',
      pan:          coApplicant.pan          ?? '',
      panVerified:  coApplicant.panVerified  ?? false,
      income:       coApplicant.income,
      consent:      coApplicant.consent      ?? false,
      signature:    coApplicant.signature    ?? null,
    },
  });

  const pan         = watch('pan') ?? '';
  const panVerified = watch('panVerified');

  const handleVerifyPAN = async () => {
    const res = await panVerifier.verify('pan', pan);
    if (res.ok) { setValue('panVerified', true); toast.success(res.message); }
    else toast.error(res.message);
  };

  const onSubmit = (data: CoAppForm) => {
    updateCoApplicant({
      name:         data.name,
      relationship: data.relationship,
      dob:          data.dob,
      pan:          data.pan,
      panVerified:  data.panVerified,
      income:       data.income,
      consent:      data.consent,
      signature:    data.signature ?? null,
    });
    onNext();
  };

  const relationshipOptions = ['Spouse', 'Parent', 'Sibling', 'Child', 'Business Partner', 'Other'];

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card
        title="Co-Applicant & Guarantor"
        subtitle={required ? 'Required for your loan configuration' : 'Optional — improves approval probability'}
        icon="👥"
      >
        {required && (
          <InfoBox type="info" icon="ℹ️">
            A co-applicant is <strong>mandatory</strong> for{' '}
            {loan.type === 'home'
              ? 'Home Loans'
              : `loans above ${formatINR(loan.type === 'personal' ? 500_000 : 2_000_000)}`}.
          </InfoBox>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label={`Full Name${required ? ' *' : ''}`}>
            <Input {...register('name')} placeholder="Full name as per PAN" />
          </Field>
          <Field label="Relationship">
            <Controller name="relationship" control={control} render={({ field }) => (
              <Select {...field} value={field.value ?? ''} options={relationshipOptions} />
            )} />
          </Field>
        </div>

        <Field label="Co-Applicant PAN" hint="Will be verified instantly" className="mb-4">
          <div className="flex gap-2 items-end">
            <Input
              {...register('pan')}
              placeholder="ABCDE1234F"
              maxLength={10}
              style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}
              className="flex-1"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('pan').onChange(e);
                setValue('panVerified', false);
              }}
            />
            <Button
              type="button"
              variant={panVerified ? 'success' : 'outline'}
              size="sm"
              loading={panVerifier.status === 'loading'}
              disabled={!!panVerified || panVerifier.status === 'loading'}
              onClick={handleVerifyPAN}
              className="flex-shrink-0"
            >
              {panVerified ? '✓ Verified' : 'Verify PAN'}
            </Button>
          </div>
          <VerifyBadge
            status={panVerified ? 'success' : panVerifier.status}
            message={panVerifier.message}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Monthly Income">
            <Input
              type="number"
              prefix="₹"
              placeholder="Monthly income"
              {...register('income', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" {...register('dob')} />
          </Field>
        </div>

        <Controller
          name="consent"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={!!field.value}
              onChange={field.onChange}
              label="Co-applicant has provided consent for KYC verification and data processing"
              className="mb-4"
            />
          )}
        />

        <hr className="border-gray-100 my-4" />
        <p className="font-heading font-semibold text-[14px] mb-3">✍ Co-Applicant Signature</p>
        <SignatureCanvas
          onSave={(sig) => setValue('signature', sig)}
          label="Co-applicant to draw signature here"
          height={130}
        />
      </Card>
    </form>
  );
};

export default Step6CoApplicant;
