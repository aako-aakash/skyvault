import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calcPreApproval, formatINR, calcFinancials, maskPAN, maskAadhaar } from '@/utils';
import { INTEREST_RATES } from '@/constants';
import { Card, InfoBox, ScoreRing } from '@/components/common';
import Button from '@/components/common/Button';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Fixed: Step8 no longer has its own Submit button.
// The submit button is rendered in ApplyPage nav bar for step 8.
// Step8 only shows the review content.

interface Step8Props { onNext: () => void; }

interface RevRowProps { label: string; value: string | undefined; }
const RevRow: React.FC<RevRowProps> = ({ label, value }) => (
  <div>
    <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
    <p className="text-[13px] font-medium text-gray-800">{value || '–'}</p>
  </div>
);

interface RevSectionProps {
  title: string;
  step: number;
  rows: [string, string | undefined][];
  onEdit: (step: number) => void;
}
const RevSection: React.FC<RevSectionProps> = ({ title, step, rows, onEdit }) => (
  <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden">
    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span className="font-semibold text-[13px] text-gray-700">{title}</span>
      <Button variant="secondary" size="sm" onClick={() => onEdit(step)}>✏ Edit</Button>
    </div>
    <div className="px-4 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
      {rows.map(([label, value]) => <RevRow key={label} label={label} value={value} />)}
    </div>
  </div>
);

const Step8Review: React.FC<Step8Props> = () => {
  // onNext not used here — submit is handled by ApplyPage nav bar
  const store = useAppStore();
  const { loan, personal, kyc, address, employment, coApplicant, documents, setStep } = store;

  const approval = calcPreApproval(store);
  const emiInfo  = loan.amount && loan.tenure && loan.type
    ? calcFinancials(loan.type, loan.amount, loan.tenure) : null;

  return (
    <div>
      {/* Summary Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl p-6 text-white mb-4">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-5">
          <div>
            <h2 className="font-heading font-bold text-[20px] mb-1">Pre-Approval Summary</h2>
            <p className="text-[12px] opacity-75">Review all details carefully before final submission</p>
            <div className="flex gap-2 flex-wrap mt-3">
              {kyc.panVerified      && <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-semibold">✓ PAN Verified</span>}
              {kyc.aadhaarVerified  && <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-semibold">✓ Aadhaar Verified</span>}
              {personal.otpVerified && <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-semibold">✓ Mobile Verified</span>}
            </div>
          </div>
          <ScoreRing score={approval.score} size={80} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            ['Monthly EMI',   emiInfo ? formatINR(Math.round(emiInfo.emi)) : '–'],
            ['Total Payable', emiInfo ? formatINR(Math.round(emiInfo.totalPayable)) : '–'],
            ['Interest Rate', loan.type ? `${INTEREST_RATES[loan.type]}% p.a.` : '–'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/12 rounded-lg p-3">
              <p className="text-[10px] opacity-70 mb-1">{label}</p>
              <p className="font-heading font-bold text-[15px]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <RevSection title="🏦 Loan Details" step={1} onEdit={setStep} rows={[
        ['Loan Type',      loan.type ? loan.type.charAt(0).toUpperCase() + loan.type.replace('_', ' ').slice(1) + ' Loan' : ''],
        ['Loan Amount',    loan.amount ? formatINR(loan.amount) : ''],
        ['Tenure',         loan.tenure ? `${loan.tenure} months` : ''],
        ['Purpose',        loan.purpose],
        ['Interest Rate',  loan.type ? `${INTEREST_RATES[loan.type]}% p.a.` : ''],
        ['Processing Fee', emiInfo ? formatINR(Math.round(emiInfo.processingFee)) : ''],
      ]} />

      <RevSection title="👤 Personal Details" step={2} onEdit={setStep} rows={[
        ['Full Name',     personal.fullName],
        ['Date of Birth', personal.dob],
        ['Gender',        personal.gender ? personal.gender.charAt(0).toUpperCase() + personal.gender.slice(1) : ''],
        ['Mobile',        personal.mobile ? `+91-${personal.mobile}` : ''],
        ['Email',         personal.email],
        ['OTP Status',    personal.otpVerified ? '✓ Verified' : '⚠ Pending'],
      ]} />

      <RevSection title="🔐 KYC Details" step={3} onEdit={setStep} rows={[
        ['PAN Number',     maskPAN(kyc.pan ?? '')],
        ['PAN Status',     kyc.panVerified ? '✓ Verified' : '⚠ Pending'],
        ['Aadhaar',        maskAadhaar(kyc.aadhaar ?? '')],
        ['Aadhaar Status', kyc.aadhaarVerified ? '✓ Verified' : '⚠ Pending'],
        ['Voter ID',       kyc.voterId || 'Not provided'],
        ['Passport',       kyc.passportNo || 'Not provided'],
      ]} />

      <RevSection title="📍 Address" step={4} onEdit={setStep} rows={[
        ['City',             address.currentCity],
        ['State',            address.currentState],
        ['PIN Code',         address.currentPincode],
        ['Residence Type',   address.residenceType],
        ['Years at Address', address.yearsAtAddress != null ? `${address.yearsAtAddress} yr(s)` : ''],
        ['Permanent',        address.sameAsCurrent ? 'Same as current' : address.permanentCity ? `${address.permanentCity}, ${address.permanentState}` : ''],
      ]} />

      <RevSection title="💼 Employment" step={5} onEdit={setStep} rows={[
        ['Employment Type',  employment.type ? employment.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''],
        ['Company/Business', employment.companyName || employment.businessName],
        ['Monthly Income',   employment.monthlyIncome ? formatINR(employment.monthlyIncome) : ''],
        ['Experience',       employment.experience || employment.yearsInBusiness],
        ['EMI/Income Ratio', emiInfo && employment.monthlyIncome ? `${Math.round((emiInfo.emi / employment.monthlyIncome) * 100)}%` : ''],
        ['GST No.',          employment.gstNumber || 'N/A'],
      ]} />

      {coApplicant.name && (
        <RevSection title="👥 Co-Applicant" step={6} onEdit={setStep} rows={[
          ['Name',         coApplicant.name],
          ['Relationship', coApplicant.relationship],
          ['PAN Status',   coApplicant.panVerified ? '✓ Verified' : 'Not verified'],
          ['Income',       coApplicant.income ? formatINR(coApplicant.income) : ''],
          ['Consent',      coApplicant.consent ? 'Given' : 'Not provided'],
        ]} />
      )}

      <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
          <span className="font-semibold text-[13px] text-gray-700">📎 Documents & Signature</span>
          <Button variant="secondary" size="sm" onClick={() => setStep(7)}>✏ Edit</Button>
        </div>
        <div className="px-4 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">Documents Uploaded</p>
            <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
              {documents.files.length} file(s)
              {documents.files.length > 0 && documents.files.every(f => f.done) && (
                <CheckCircle size={13} className="text-success" />
              )}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">E-Signature</p>
            <p className={`text-[13px] font-medium flex items-center gap-1.5 ${documents.signature ? 'text-success' : 'text-warning'}`}>
              {documents.signature
                ? <><CheckCircle size={13} /> Captured</>
                : <><AlertTriangle size={13} /> Not captured</>}
            </p>
          </div>
        </div>
      </div>

      <InfoBox type="success" icon="📜">
        <strong>Declaration:</strong> I hereby declare that all information provided is accurate,
        complete, and true to the best of my knowledge. I consent to credit bureau inquiries,
        employment and income verification, and document checks as per RBI guidelines.
        I have read and agree to the{' '}
        <a href="#" className="text-brand-600 underline">Terms &amp; Conditions</a> and{' '}
        <a href="#" className="text-brand-600 underline">Privacy Policy</a>.
      </InfoBox>
    </div>
  );
};

export default Step8Review;
