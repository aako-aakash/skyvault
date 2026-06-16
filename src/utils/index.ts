import type { LoanType, EMIResult, PreApprovalResult, ApplicationState } from '@/types';
import {
  INTEREST_RATES, PROCESSING_FEE_RATE, LOAN_LIMITS,
  DRAFT_STORAGE_KEY, DRAFT_TTL_HOURS,
} from '@/constants';

// ─── Currency ────────────────────────────────────────────────────
export const formatINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-IN').format(n);

// ─── Date ────────────────────────────────────────────────────────
export const calcAge = (dob: string): number => {
  if (!dob) return 0;
  const d = new Date(dob);
  const n = new Date();
  return n.getFullYear() - d.getFullYear() -
    (n.getMonth() < d.getMonth() ||
      (n.getMonth() === d.getMonth() && n.getDate() < d.getDate()) ? 1 : 0);
};

export const maxDobDate = (minAge: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().split('T')[0];
};

export const minDobDate = (maxAge: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - maxAge);
  return d.toISOString().split('T')[0];
};

// ─── EMI Engine ──────────────────────────────────────────────────
export const calcEMI = (principal: number, annualRate: number, months: number): number => {
  const r = annualRate / (12 * 100);
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

export const calcFinancials = (
  loanType: LoanType,
  amount: number,
  tenure: number,
): EMIResult => {
  const interestRate = INTEREST_RATES[loanType];
  const emi = calcEMI(amount, interestRate, tenure);
  const totalPayable = emi * tenure;
  return {
    emi,
    interestRate,
    totalPayable,
    totalInterest: totalPayable - amount,
    processingFee: amount * PROCESSING_FEE_RATE,
  };
};

export const maxTenureByAge = (dob: string, loanType: LoanType): number => {
  const age = calcAge(dob);
  const yearsLeft = Math.max(0, 60 - age);
  const maxFromAge = yearsLeft * 12;
  const hardLimits: Record<LoanType, number> = { personal: 60, home: 360, business: 120 };
  return Math.min(maxFromAge, hardLimits[loanType]);
};

// ─── Pre-Approval Score ──────────────────────────────────────────
export const calcPreApproval = (
  state: Partial<ApplicationState>,
): PreApprovalResult => {
  let score = 600;
  if (state.kyc?.panVerified)      score += 45;
  if (state.kyc?.aadhaarVerified)  score += 35;
  if (state.personal?.dob) {
    const a = calcAge(state.personal.dob);
    if (a >= 25 && a <= 50) score += 25;
  }
  if (state.personal?.otpVerified) score += 20;
  const inc = state.employment?.monthlyIncome ?? 0;
  if (inc > 100_000) score += 60;
  else if (inc > 50_000) score += 45;
  else if (inc > 25_000) score += 20;
  const files = state.documents?.files ?? [];
  if (files.length >= 3) score += 20;
  if (state.documents?.signature) score += 10;
  if (state.coApplicant?.panVerified) score += 15;

  score = Math.min(850, score);
  const grade = score >= 750 ? 'Excellent' : score >= 680 ? 'Good' : score >= 600 ? 'Fair' : 'Poor';
  const color = score >= 750 ? '#27AE60' : score >= 680 ? '#F39C12' : '#E74C3C';
  const maxEligibleAmount = inc * 60;
  return { score, grade, eligible: score >= 600, maxEligibleAmount, color };
};

// ─── Validators ──────────────────────────────────────────────────
export const validatePAN = (pan: string): boolean =>
  /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

export const validateMobile = (m: string): boolean =>
  /^[6-9]\d{9}$/.test(m);

export const validateEmail = (e: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const validateGST = (g: string): boolean =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(g);

// Verhoeff Algorithm for Aadhaar
export const verhoeff = (num: string): boolean => {
  const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];
  const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  let c = 0;
  const n = num.split('').reverse();
  for (let i = 0; i < n.length; i++) c = d[c][p[i % 8][parseInt(n[i])]];
  return c === 0;
};

export const validateAadhaar = (a: string): boolean => {
  const clean = a.replace(/\s/g, '');
  return /^\d{12}$/.test(clean) && verhoeff(clean);
};

// ─── Masking ─────────────────────────────────────────────────────
export const maskPAN     = (pan: string)     => pan ? `${pan.slice(0, 2)}XXX${pan.slice(5)}` : '–';
export const maskAadhaar = (a: string)       => a   ? `XXXX XXXX ${a.slice(-4)}`              : '–';
export const maskIncome  = (n: number)       => n   ? '₹ XXXXX'                               : '–';

// ─── Formatting ──────────────────────────────────────────────────
export const formatAadhaar = (raw: string): string =>
  raw.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');

export const tenureLabel = (months: number): string =>
  months >= 12
    ? `${months} mo (${Math.floor(months / 12)}yr${months % 12 ? ` ${months % 12}mo` : ''})`
    : `${months} mo`;

// ─── Crypto / Storage ────────────────────────────────────────────
const encode = (data: unknown): string =>
  btoa(unescape(encodeURIComponent(JSON.stringify(data))));

const decode = <T>(raw: string): T =>
  JSON.parse(decodeURIComponent(escape(atob(raw))));

export const saveDraft = (data: unknown): void => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, encode({ ...data as object, _ts: Date.now() }));
  } catch {
    // Storage full or blocked
  }
};

export const loadDraft = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = decode<T & { _ts: number }>(raw);
    const ageHours = (Date.now() - parsed._ts) / 3_600_000;
    if (ageHours > DRAFT_TTL_HOURS) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearDraft = (): void => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
};

// ─── Image Compression ───────────────────────────────────────────
export const compressImage = (
  file: File,
  quality = 0.75,
  maxDim = 1200,
): Promise<{ dataUrl: string; size: number }> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, size: Math.round(dataUrl.length * 0.75) });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });

// ─── Misc ─────────────────────────────────────────────────────────
export const generateRefId = (): string =>
  'SVL-' + Date.now().toString(36).toUpperCase().slice(-8);

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ');

export const coAppRequired = (loan: { type?: string; amount?: number }): boolean =>
  loan.type === 'home' ||
  (loan.type === 'personal'  && (loan.amount ?? 0) > 500_000) ||
  (loan.type === 'business'  && (loan.amount ?? 0) > 2_000_000);

export const getRequiredDocs = (loanType?: string, empType?: string): string[] => {
  const base = [
    'Identity Proof (Aadhaar / PAN / Passport)',
    'Address Proof',
    'Passport-Size Photograph',
  ];
  const income = empType === 'salaried'
    ? ['Last 3 Months Salary Slips', '6 Months Bank Statement', 'Latest Form 16 / ITR']
    : ['2 Years ITR with P&L Statement', '6 Months Bank Statement', 'Business Registration Certificate'];
  const loanDocs = loanType === 'home'
    ? ['Property Documents / Sale Agreement', 'Encumbrance Certificate', 'NOC from Builder']
    : loanType === 'business'
    ? ['GST Returns (Last 3 months)', 'Business Balance Sheet', 'Business Plan'] : [];
  return [...base, ...income, ...loanDocs];
};
