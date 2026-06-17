import type { LoanType } from '@/types';

export const STEP_LABELS = [
  'Loan Details', 'Personal Info', 'KYC', 'Address',
  'Employment', 'Co-Applicant', 'Documents', 'Review',
] as const;

export const TOTAL_STEPS = 8;

export const INTEREST_RATES: Record<LoanType, number> = {
  personal: 10.5,
  home: 8.5,
  business: 14,
};

export const LOAN_LIMITS: Record<LoanType, { min: number; max: number }> = {
  personal: { min: 50_000,   max: 10_00_000   },
  home:     { min: 50_000,   max: 1_00_00_000 },
  business: { min: 50_000,   max: 50_00_000   },
};

export const TENURE_OPTIONS: Record<LoanType, number[]> = {
  personal: [12, 18, 24, 36, 48, 60],
  home:     [60, 84, 120, 180, 240, 300, 360],
  business: [12, 18, 24, 36, 48, 60, 72, 84, 96, 120],
};

export const LOAN_PURPOSES: Record<LoanType, string[]> = {
  personal: [
    'Medical Emergency', 'Wedding Expenses', 'Home Renovation',
    'Travel & Vacation', 'Education Fees', 'Debt Consolidation',
    'Consumer Durable', 'Other',
  ],
  home: [
    'Purchase New Property', 'Home Construction', 'Home Renovation',
    'Plot Purchase', 'Balance Transfer', 'Top-up Loan',
  ],
  business: [
    'Working Capital', 'Equipment Purchase', 'Business Expansion',
    'Trade Finance', 'Invoice Discounting', 'GST Funding',
  ],
};

export const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export const PIN_CODE_DB: Record<string, [string, string]> = {
  '400001': ['Mumbai',      'Maharashtra'],
  '110001': ['New Delhi',   'Delhi'],
  '600001': ['Chennai',     'Tamil Nadu'],
  '700001': ['Kolkata',     'West Bengal'],
  '560001': ['Bengaluru',   'Karnataka'],
  '500001': ['Hyderabad',   'Telangana'],
  '411001': ['Pune',        'Maharashtra'],
  '380001': ['Ahmedabad',   'Gujarat'],
  '302001': ['Jaipur',      'Rajasthan'],
  '226001': ['Lucknow',     'Uttar Pradesh'],
  '421301': ['Kalyan',      'Maharashtra'],
  '201301': ['Noida',       'Uttar Pradesh'],
  '122001': ['Gurugram',    'Haryana'],
  '110011': ['New Delhi',   'Delhi'],
  '411028': ['Pune',        'Maharashtra'],
  '462001': ['Bhopal',      'Madhya Pradesh'],
  '248001': ['Dehradun',    'Uttarakhand'],
  '160017': ['Chandigarh',  'Punjab'],
};

export const PROCESSING_FEE_RATE   = 0.02;   // 2%
export const DRAFT_TTL_HOURS       = 72;
export const AUTOSAVE_INTERVAL_MS  = 30_000;
export const DEMO_OTP = '123456';
export const DEMO_AADHAAR = '234123412346'; // Valid Verhoeff checksum
export const MAX_FILE_SIZE_MB      = 5;
export const MAX_FILE_SIZE_BYTES   = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES    = ['application/pdf', 'image/png', 'image/jpeg'];
export const ALLOWED_EXTENSIONS    = ['.pdf', '.png', '.jpg', '.jpeg'];
export const EMI_INCOME_RATIO_MAX  = 0.50;   // 50%
export const DRAFT_STORAGE_KEY     = 'sv_app_draft_v4';

export const EMPLOYMENT_LABELS: Record<string, string> = {
  salaried:       'Salaried',
  self_employed:  'Self-Employed',
  business_owner: 'Business Owner',
};
