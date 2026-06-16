/**
 * API Service Layer
 * Simulates real banking API calls with realistic delays and error handling.
 * Replace simulation functions with actual API calls in production.
 */

import { sleep, validatePAN, validateAadhaar } from '@/utils';
import { generateRefId } from '@/utils';
import type { ApplicationState } from '@/types';

export interface VerifyResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface SubmitResponse {
  success: boolean;
  referenceId: string;
  message: string;
  preApprovalScore?: number;
  estimatedEmi?: number;
}

export interface PinCodeResponse {
  city: string;
  state: string;
  postOffice?: string;
}

// ─── PAN Verification ────────────────────────────────────────────
export const verifyPAN = async (pan: string): Promise<VerifyResponse> => {
  await sleep(1500);
  const isValid = validatePAN(pan.toUpperCase());
  if (!isValid) {
    return { success: false, message: 'Invalid PAN number. Expected format: AAAAA9999A' };
  }
  // Determine entity type from 4th character
  const entityMap: Record<string, string> = {
    P: 'Individual', C: 'Company', H: 'HUF', F: 'Firm',
    A: 'AOP', T: 'AOP/BOI', B: 'BOI', L: 'Local Authority',
    J: 'Artificial Juridical Person', G: 'Government',
  };
  const entity = entityMap[pan[3].toUpperCase()] ?? 'Unknown';
  return {
    success: true,
    message: 'PAN verified successfully',
    data: { entity, maskedName: `${pan.slice(0, 2)}XXX${pan.slice(5)}` },
  };
};

// ─── Aadhaar Verification ─────────────────────────────────────────
export const verifyAadhaar = async (aadhaar: string): Promise<VerifyResponse> => {
  await sleep(1500);
  const clean = aadhaar.replace(/\s/g, '');
  const isValid = validateAadhaar(clean);
  return {
    success: isValid,
    message: isValid
      ? 'Aadhaar verified successfully via UIDAI'
      : 'Aadhaar verification failed. Check the 12-digit number.',
    data: isValid ? { masked: `XXXX XXXX ${clean.slice(-4)}` } : undefined,
  };
};

// ─── OTP Service ─────────────────────────────────────────────────
export const sendOTP = async (mobile: string): Promise<VerifyResponse> => {
  await sleep(800);
  return {
    success: true,
    message: `OTP sent to +91-${mobile.slice(0, 3)}XXXXX${mobile.slice(-2)}`,
    data: { expiresIn: 300 }, // 5 min
  };
};

export const verifyOTP = async (mobile: string, otp: string): Promise<VerifyResponse> => {
  await sleep(600);
  const DEMO_OTP = '123456';
  const isValid = otp === DEMO_OTP;
  return {
    success: isValid,
    message: isValid ? 'Mobile number verified successfully' : 'Invalid OTP. Please try again.',
  };
};

// ─── PIN Code Lookup ──────────────────────────────────────────────
import { PIN_CODE_DB } from '@/constants';
export const lookupPinCode = async (pin: string): Promise<PinCodeResponse | null> => {
  await sleep(400);
  const entry = PIN_CODE_DB[pin];
  if (!entry) return null;
  return { city: entry[0], state: entry[1] };
};

// ─── Application Submission ───────────────────────────────────────
export const submitApplication = async (
  _state: Partial<ApplicationState>,
): Promise<SubmitResponse> => {
  await sleep(2000); // Simulate processing
  return {
    success: true,
    referenceId: generateRefId(),
    message: 'Application submitted successfully. Our team will contact you within 24 hours.',
    preApprovalScore: 720,
    estimatedEmi: 0,
  };
};
