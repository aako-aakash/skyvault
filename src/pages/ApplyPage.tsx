import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { coAppRequired, calcPreApproval, formatINR, calcFinancials, saveDraft } from '@/utils';
import WizardProgress from '@/components/wizard/WizardProgress';
import Button from '@/components/common/Button';
import { submitApplication } from '@/services/api';
import toast from 'react-hot-toast';

// Fixed: removed unused generateRefId import

const Step1 = lazy(() => import('@/components/steps/Step1LoanDetails'));
const Step2 = lazy(() => import('@/components/steps/Step2PersonalInfo'));
const Step3 = lazy(() => import('@/components/steps/Step3KYC'));
const Step4 = lazy(() => import('@/components/steps/Step4Address'));
const Step5 = lazy(() => import('@/components/steps/Step5Employment'));
const Step6 = lazy(() => import('@/components/steps/Step6CoApplicant'));
const Step7 = lazy(() => import('@/components/steps/Step7Documents'));
const Step8 = lazy(() => import('@/components/steps/Step8Review'));

const StepFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" aria-label="Loading step" />
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const ApplyPage: React.FC = () => {
  const store = useAppStore();
  const { currentStep, setStep, resetApplication, loan, personal, kyc, employment } = store;
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [refId,       setRefId]       = useState('');
  const [submitError, setSubmitError] = useState('');

  const isCoAppRequired = coAppRequired(loan);
  const approval        = calcPreApproval(store);
  const emiInfo         = loan.amount && loan.tenure && loan.type
    ? calcFinancials(loan.type, loan.amount, loan.tenure) : null;

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!loan.type)    { toast.error('Please select a loan type');   return false; }
      if (!loan.amount)  { toast.error('Please enter loan amount');    return false; }
      if (!loan.tenure)  { toast.error('Please select a tenure');      return false; }
      if (!loan.purpose) { toast.error('Please select a purpose');     return false; }
    }
    if (currentStep === 2) {
      if (!personal.fullName?.trim())                                           { toast.error('Full name is required');                  return false; }
      if (!personal.dob)                                                        { toast.error('Date of birth is required');              return false; }
      if (!personal.gender)                                                     { toast.error('Please select gender');                   return false; }
      if (!personal.mobile || !/^[6-9]\d{9}$/.test(personal.mobile))           { toast.error('Enter valid 10-digit mobile number');     return false; }
      if (!personal.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) { toast.error('Enter valid email address');           return false; }
      if (!personal.otpVerified)                                                { toast.error('Please verify your mobile number');       return false; }
    }
    if (currentStep === 3) {
      if (!kyc.panVerified)     { toast.error('Please verify your PAN number');      return false; }
      if (!kyc.aadhaarVerified) { toast.error('Please verify your Aadhaar number'); return false; }
      if (!kyc.aadhaarConsent)  { toast.error('Please provide Aadhaar consent');    return false; }
    }
    if (currentStep === 5) {
      if (!employment.type)                                                { toast.error('Please select employment type');            return false; }
      if (!employment.monthlyIncome || employment.monthlyIncome < 5000)  { toast.error('Monthly income must be at least ₹5,000');   return false; }
    }
    return true;
  };

  // Triggers the form#step-form inside the current step (Steps 1–7 all have it)
  const triggerStepForm = () => {
    const form = document.getElementById('step-form') as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
  };

  const goNext = () => {
    if (!validateStep()) return;
    saveDraft(store);

    if (currentStep === 8) {
      handleSubmit();
      return;
    }

    // Steps 1–7: trigger their internal form for Zod validation + store update
    // Step 8 has no form — nav bar's Submit button calls handleSubmit directly
    if (currentStep < 8) {
      triggerStepForm();
    }
  };

  const goBack = () => {
    let prev = currentStep - 1;
    if (currentStep === 7 && !isCoAppRequired) prev = 5;
    setStep(Math.max(1, prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called after each step's form successfully validates and calls onNext()
  const advanceStep = () => {
    let next = currentStep + 1;
    if (currentStep === 5 && !isCoAppRequired) next = 7;
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await submitApplication(store);
      if (res.success) {
        setRefId(res.referenceId);
        setSubmitted(true);
        toast.success('Application submitted successfully!');
      } else {
        setSubmitError('Submission failed. Please try again.');
        toast.error('Submission failed.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
      toast.error('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
          🎉
        </div>
        <h2 className="font-heading font-bold text-2xl text-success mb-3">Application Submitted!</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Your loan application has been received and is under review.
          <br /><br />
          <strong className="text-gray-800">Reference ID:</strong>{' '}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-brand-700 font-mono text-sm">{refId}</code>
          <br /><br />
          <strong className="text-gray-800">Pre-Approval Score:</strong>{' '}
          <span className="text-brand-600 font-bold text-xl">{approval.score}</span> / 850
          {emiInfo && (
            <>
              <br />
              <strong className="text-gray-800">Estimated EMI:</strong>{' '}
              <span className="font-bold">{formatINR(Math.round(emiInfo.emi))}</span>/month
            </>
          )}
          <br /><br />
          Our team will contact you within <strong>24 working hours</strong>.
        </p>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => { resetApplication(); setSubmitted(false); setRefId(''); }}
        >
          Start New Application
        </Button>
      </div>
    );
  }

  const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8];
  const StepComponent = STEP_COMPONENTS[currentStep - 1];

  return (
    <div>
      <WizardProgress currentStep={currentStep} onStepClick={setStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Suspense fallback={<StepFallback />}>
            {/* Each step calls onNext() after its own form validates successfully */}
            <StepComponent onNext={advanceStep} />
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {submitError && (
        <p className="text-sm text-danger text-center mt-3" role="alert">{submitError}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-gray-100">
        {currentStep > 1 && (
          <Button variant="secondary" size="md" onClick={goBack} disabled={submitting}>
            ← Back
          </Button>
        )}

        {/* Steps 1–7: Continue (triggers step's internal form) */}
        {currentStep < 8 && (
          <Button variant="primary" size="md" onClick={goNext}>
            Continue →
          </Button>
        )}

        {/* Step 8: Submit (calls API directly, no form) */}
        {currentStep === 8 && (
          <Button
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleSubmit}
            leftIcon={<span>🚀</span>}
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplyPage;
