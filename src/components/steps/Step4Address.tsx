import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormData } from '@/schemas';
import { useAppStore } from '@/store/useAppStore';
import { INDIA_STATES } from '@/constants';
import { Card, Field, Input, Select, Toggle, InfoBox } from '@/components/common';
import { lookupPinCode } from '@/services/api';
import toast from 'react-hot-toast';

interface Step4Props { onNext: () => void; }

const Step4Address: React.FC<Step4Props> = ({ onNext }) => {
  const { address, updateAddress } = useAppStore();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address,
  });

  const sameAsCurrent   = watch('sameAsCurrent');
  const yearsAtAddress  = watch('yearsAtAddress');
  const currentState    = watch('currentState');
  const permanentState  = watch('permanentState');

  const stateMismatch = !sameAsCurrent && currentState && permanentState && currentState !== permanentState;

  const handlePinLookup = async (pin: string, prefix: 'current' | 'permanent') => {
    if (pin.length !== 6) return;
    const res = await lookupPinCode(pin);
    if (res) {
      if (prefix === 'current') {
        setValue('currentCity', res.city);
        setValue('currentState', res.state);
      } else {
        setValue('permanentCity', res.city);
        setValue('permanentState', res.state);
      }
      toast.success(`📍 ${res.city}, ${res.state} — auto-filled`);
    }
  };

  const onSubmit = (data: AddressFormData) => {
    updateAddress(data);
    onNext();
  };

  const stateOptions = INDIA_STATES.map((s) => ({ value: s, label: s }));
  const residenceOptions = [
    { value: 'owned',   label: 'Owned' },
    { value: 'rented',  label: 'Rented' },
    { value: 'family',  label: 'Family / Parents' },
    { value: 'pg',      label: 'PG / Hostel' },
    { value: 'company', label: 'Company Provided' },
  ];
  const yearsOptions = [
    { value: '0', label: 'Less than 1 year' },
    { value: '1', label: '1 year' },
    { value: '2', label: '2 years' },
    { value: '3', label: '3 years' },
    { value: '5', label: '5 years' },
    { value: '7', label: '7+ years' },
  ];

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Current Address */}
      <Card title="Current Address" subtitle="Your current residential address" icon="📍">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Address Line 1">
            <Input {...register('currentLine1')} placeholder="House/Flat/Block No." />
          </Field>
          <Field label="Address Line 2">
            <Input {...register('currentLine2')} placeholder="Street, Colony, Landmark" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="PIN Code" required error={errors.currentPincode?.message} hint="Try: 400001, 560001, 110001">
            <Input
              {...register('currentPincode')}
              maxLength={6}
              placeholder="6-digit PIN"
              error={!!errors.currentPincode}
              onChange={(e) => {
                register('currentPincode').onChange(e);
                handlePinLookup(e.target.value, 'current');
              }}
            />
          </Field>
          <Field label="City" required error={errors.currentCity?.message}>
            <Input {...register('currentCity')} placeholder="City" error={!!errors.currentCity} />
          </Field>
          <Field label="State" required error={errors.currentState?.message}>
            <Controller name="currentState" control={control} render={({ field }) => (
              <Select {...field} value={field.value || ''} options={stateOptions} error={!!errors.currentState} />
            )} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Residence Type" required error={errors.residenceType?.message}>
            <Controller name="residenceType" control={control} render={({ field }) => (
              <Select {...field} value={field.value || ''} options={residenceOptions} error={!!errors.residenceType} />
            )} />
          </Field>
          <Field label="Years at Current Address">
            <Controller name="yearsAtAddress" control={control} render={({ field }) => (
              <Select {...field} value={field.value != null ? String(field.value) : ''}
                onChange={(e) => field.onChange(+e.target.value)} options={yearsOptions} />
            )} />
          </Field>
        </div>

        {yearsAtAddress === 0 && (
          <div className="mt-4">
            <InfoBox type="warning" icon="📋">
              Since you've been at current address less than 1 year, previous address is required.
            </InfoBox>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Previous Address">
                <Input {...register('prevAddress')} placeholder="Full previous address" />
              </Field>
              <Field label="Previous City, State">
                <Input {...register('prevCityState')} placeholder="Mumbai, Maharashtra" />
              </Field>
            </div>
          </div>
        )}
      </Card>

      {/* Permanent Address */}
      <Card title="Permanent Address" subtitle="Your permanent / registered address for records" icon="🏠">
        <Controller name="sameAsCurrent" control={control} render={({ field }) => (
          <Toggle checked={!!field.value} onChange={field.onChange}
            label="Same as current address" className="mb-4" />
        )} />

        {!sameAsCurrent && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="PIN Code">
              <Input
                {...register('permanentPincode')}
                maxLength={6}
                placeholder="6-digit PIN"
                onChange={(e) => {
                  register('permanentPincode').onChange(e);
                  handlePinLookup(e.target.value, 'permanent');
                }}
              />
            </Field>
            <Field label="City">
              <Input {...register('permanentCity')} placeholder="City" />
            </Field>
            <Field label="State">
              <Controller name="permanentState" control={control} render={({ field }) => (
                <Select {...field} value={field.value || ''} options={stateOptions} />
              )} />
            </Field>
          </div>
        )}

        {stateMismatch && (
          <InfoBox type="warning" icon="⚠️" className="mt-3">
            Current and permanent states differ. Additional address proof may be required.
          </InfoBox>
        )}
      </Card>
    </form>
  );
};

export default Step4Address;
