// ─── Loan ────────────────────────────────────────────────────────
export type LoanType = 'personal' | 'home' | 'business';
export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type ResidenceType = 'owned' | 'rented' | 'family' | 'pg' | 'company';
export type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';
export type AppPage = 'apply' | 'dashboard' | 'calculator';

// ─── Step Data ───────────────────────────────────────────────────
export interface LoanData {
  type?: LoanType;
  amount?: number;
  tenure?: number;
  purpose?: string;
  referralCode?: string;
}

export interface PersonalData {
  fullName?: string;
  dob?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  fatherName?: string;
  motherName?: string;
  email?: string;
  mobile?: string;
  altMobile?: string;
  otpVerified?: boolean;
}

export interface KycData {
  pan?: string;
  panVerified?: boolean;
  aadhaar?: string;
  aadhaarVerified?: boolean;
  aadhaarConsent?: boolean;
  voterId?: string;
  passportNo?: string;
}

export interface AddressData {
  currentLine1?: string;
  currentLine2?: string;
  currentPincode?: string;
  currentCity?: string;
  currentState?: string;
  residenceType?: ResidenceType;
  yearsAtAddress?: number;
  prevAddress?: string;
  prevCityState?: string;
  sameAsCurrent?: boolean;
  permanentPincode?: string;
  permanentCity?: string;
  permanentState?: string;
}

export interface EmploymentData {
  type?: EmploymentType;
  // Salaried
  companyName?: string;
  designation?: string;
  monthlyIncome?: number;
  grossSalary?: number;
  deductions?: number;
  experience?: string;
  // Self-employed
  businessName?: string;
  professionType?: string;
  turnover?: number;
  yearsInBusiness?: string;
  // Business owner
  gstNumber?: string;
  businessRegNo?: string;
  businessAddress?: string;
}

export interface CoApplicantData {
  required?: boolean;
  name?: string;
  relationship?: string;
  dob?: string;
  pan?: string;
  panVerified?: boolean;
  income?: number;
  consent?: boolean;
  signature?: string | null;
}

export interface UploadedFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  done: boolean;
  compressed?: string;
  compressedSize?: number;
  preview?: string;
  error?: string;
}

export interface DocumentsData {
  files: UploadedFile[];
  signature?: string | null;
}

// ─── Application State ───────────────────────────────────────────
export interface ApplicationState {
  page: AppPage;
  currentStep: number;
  loan: LoanData;
  personal: PersonalData;
  kyc: KycData;
  address: AddressData;
  employment: EmploymentData;
  coApplicant: CoApplicantData;
  documents: DocumentsData;
}

// ─── Financial ───────────────────────────────────────────────────
export interface EMIResult {
  emi: number;
  totalPayable: number;
  totalInterest: number;
  processingFee: number;
  interestRate: number;
}

export interface PreApprovalResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  eligible: boolean;
  maxEligibleAmount: number;
  color: string;
}

// ─── Dashboard ───────────────────────────────────────────────────
export type AppStatus = 'approved' | 'review' | 'pending' | 'rejected';

export interface ApplicationRecord {
  id: string;
  name: string;
  type: string;
  amount: string;
  status: AppStatus;
  date: string;
  score: number;
}

// ─── Store Actions ───────────────────────────────────────────────
export interface AppStore extends ApplicationState {
  // Actions
  setPage: (page: AppPage) => void;
  setStep: (step: number) => void;
  updateLoan: (data: Partial<LoanData>) => void;
  updatePersonal: (data: Partial<PersonalData>) => void;
  updateKyc: (data: Partial<KycData>) => void;
  updateAddress: (data: Partial<AddressData>) => void;
  updateEmployment: (data: Partial<EmploymentData>) => void;
  updateCoApplicant: (data: Partial<CoApplicantData>) => void;
  updateDocuments: (data: Partial<DocumentsData>) => void;
  resetApplication: () => void;
  loadDraft: () => void;
}
