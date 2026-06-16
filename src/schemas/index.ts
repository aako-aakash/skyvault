import { z } from 'zod';
import { calcAge, validatePAN, validateAadhaar, validateMobile, validateEmail, validateGST } from '@/utils';
import { LOAN_LIMITS } from '@/constants';

// ─── Step 1: Loan Details ────────────────────────────────────────
export const loanSchema = z.object({
  type: z.enum(['personal', 'home', 'business'], {
    required_error: 'Please select a loan type',
  }),
  amount: z.number({ required_error: 'Loan amount is required' })
    .positive('Amount must be positive'),
  tenure: z.number({ required_error: 'Please select a tenure' })
    .positive('Tenure must be positive'),
  purpose: z.string().min(1, 'Please select a purpose'),
  referralCode: z.string().optional(),
}).refine((data) => {
  if (!data.type || !data.amount) return true;
  const limits = LOAN_LIMITS[data.type];
  return data.amount >= limits.min && data.amount <= limits.max;
}, {
  message: 'Loan amount is outside the allowed range for this loan type',
  path: ['amount'],
});

// ─── Step 2: Personal Info ───────────────────────────────────────
export const personalSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').max(100),
  dob: z.string().min(1, 'Date of birth is required').refine((dob) => {
    const age = calcAge(dob);
    return age >= 21 && age <= 65;
  }, 'Age must be between 21 and 65 years'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select gender' }),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  email: z.string().min(1, 'Email is required').refine(validateEmail, 'Enter a valid email address'),
  mobile: z.string().min(1, 'Mobile number is required').refine(validateMobile, 'Enter valid 10-digit Indian mobile number'),
  altMobile: z.string().optional(),
  otpVerified: z.boolean(),
}).refine((data) => {
  if (!data.altMobile) return true;
  return data.altMobile !== data.mobile;
}, {
  message: 'Alternate mobile must differ from primary mobile',
  path: ['altMobile'],
}).refine((data) => data.otpVerified, {
  message: 'Please verify your mobile number with OTP',
  path: ['otpVerified'],
});

// ─── Step 3: KYC ─────────────────────────────────────────────────
export const kycSchema = z.object({
  pan: z.string().min(1, 'PAN number is required').refine(validatePAN, 'Invalid PAN. Expected format: AAAAA9999A'),
  panVerified: z.boolean().refine((v) => v, 'Please verify your PAN number'),
  aadhaar: z.string().min(1, 'Aadhaar number is required').refine(validateAadhaar, 'Invalid Aadhaar number'),
  aadhaarVerified: z.boolean().refine((v) => v, 'Please verify your Aadhaar number'),
  aadhaarConsent: z.boolean().refine((v) => v, 'Please provide Aadhaar e-KYC consent'),
  voterId: z.string().optional(),
  passportNo: z.string().optional(),
});

// ─── Step 4: Address ─────────────────────────────────────────────
export const addressSchema = z.object({
  currentLine1: z.string().optional(),
  currentLine2: z.string().optional(),
  currentPincode: z.string().min(6, 'PIN code is required').regex(/^\d{6}$/, 'Enter valid 6-digit PIN code'),
  currentCity: z.string().min(1, 'City is required'),
  currentState: z.string().min(1, 'State is required'),
  residenceType: z.enum(['owned', 'rented', 'family', 'pg', 'company'], {
    required_error: 'Residence type is required',
  }),
  yearsAtAddress: z.number().optional(),
  prevAddress: z.string().optional(),
  prevCityState: z.string().optional(),
  sameAsCurrent: z.boolean().optional(),
  permanentPincode: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
});

// ─── Step 5: Employment ──────────────────────────────────────────
export const employmentSchema = z.object({
  type: z.enum(['salaried', 'self_employed', 'business_owner'], {
    required_error: 'Please select employment type',
  }),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  monthlyIncome: z.number({ required_error: 'Monthly income is required' })
    .min(5_000, 'Minimum income is ₹5,000/month'),
  grossSalary: z.number().optional(),
  deductions: z.number().optional(),
  experience: z.string().optional(),
  businessName: z.string().optional(),
  professionType: z.string().optional(),
  turnover: z.number().optional(),
  yearsInBusiness: z.string().optional(),
  gstNumber: z.string().optional().refine((g) => {
    if (!g || g.length === 0) return true;
    return validateGST(g);
  }, 'Invalid GST number format'),
  businessRegNo: z.string().optional(),
  businessAddress: z.string().optional(),
});

// ─── Step 6: Co-Applicant ────────────────────────────────────────
export const coApplicantSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  dob: z.string().optional(),
  pan: z.string().optional(),
  panVerified: z.boolean().optional(),
  income: z.number().optional(),
  consent: z.boolean().optional(),
  signature: z.string().nullable().optional(),
});

// ─── Step 7: Documents ───────────────────────────────────────────
export const documentsSchema = z.object({
  files: z.array(z.object({
    uid: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    progress: z.number(),
    done: z.boolean(),
  })),
  signature: z.string().nullable().optional(),
});

export type LoanFormData       = z.infer<typeof loanSchema>;
export type PersonalFormData   = z.infer<typeof personalSchema>;
export type KycFormData        = z.infer<typeof kycSchema>;
export type AddressFormData    = z.infer<typeof addressSchema>;
export type EmploymentFormData = z.infer<typeof employmentSchema>;
