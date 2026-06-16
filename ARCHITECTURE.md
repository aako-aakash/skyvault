# SkyVault Lending — Architecture Guide

## Overview

SkyVault Lending follows a **feature-sliced, component-driven architecture** designed for enterprise-scale React applications. The codebase is organized by responsibility with clear separation between UI, business logic, state, and data layers.

---

## Core Architecture Principles

### 1. Unidirectional Data Flow
```
User Action → Component → Zustand Store → React Re-render
```

### 2. Layer Separation
```
UI (Components) ← State (Zustand) ← Business Logic (Utils/Hooks) ← API (Services)
```

### 3. Validation Pipeline
```
User Input → React Hook Form → Zod Schema → Store Update → Step Advance
```

---

## State Management (Zustand)

```typescript
// Single store for entire application state
useAppStore = {
  // Navigation
  page: AppPage,
  currentStep: number,

  // Step data (each is partial until validated)
  loan:         LoanData,
  personal:     PersonalData,
  kyc:          KycData,
  address:      AddressData,
  employment:   EmploymentData,
  coApplicant:  CoApplicantData,
  documents:    DocumentsData,

  // Actions (granular updaters)
  updateLoan(), updatePersonal(), updateKyc(), ...
  setStep(), setPage(), resetApplication(), loadDraft()
}
```

**Why Zustand over Redux?**
- Zero boilerplate — actions are simple functions
- Built-in DevTools support via `devtools` middleware
- `subscribeWithSelector` enables efficient auto-save subscriptions
- TypeScript-first with full type inference

---

## Form Architecture (React Hook Form + Zod)

Each step has its own:
1. **Zod schema** (`src/schemas/index.ts`) — declarative validation rules
2. **React Hook Form instance** — uncontrolled form with schema resolver
3. **Local state** for UI-only concerns (OTP sent, verify status)

```typescript
// Pattern used in every step
const { register, handleSubmit, watch, formState } = useForm<FormData>({
  resolver: zodResolver(stepSchema),
  defaultValues: storeData,  // Pre-populate from Zustand
});

const onSubmit = (data) => {
  updateStore(data);  // Persist to Zustand
  onNext();           // Advance wizard
};
```

---

## Component Hierarchy

```
App
├── Header (sticky, navigation, auto-save indicator)
├── main
│   └── Routes (lazy-loaded page selector)
│       ├── ApplyPage
│       │   ├── WizardProgress (step tracker)
│       │   ├── AnimatePresence → Step1–8 (lazy-loaded)
│       │   └── Nav buttons (Back / Continue / Submit)
│       ├── DashboardPage (mock data table)
│       └── CalculatorPage (interactive pie chart)
├── Footer
└── ResumeModal (conditional on draft detection)
```

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAutoSave` | Saves state to localStorage every 30s via `setInterval` |
| `useVerify` | PAN/Aadhaar API simulation with status state machine |
| `useFileUpload` | File validation, upload simulation, image compression |

---

## API Service Layer (`src/services/api.ts`)

All external calls go through the service layer. Swap simulation functions with real API calls without touching components:

```typescript
// Current: simulates 1.5s delay
export const verifyPAN = async (pan: string): Promise<VerifyResponse> => {
  await sleep(1500);
  return { success: validatePAN(pan), message: '...' };
};

// Production: replace with actual call
export const verifyPAN = async (pan: string): Promise<VerifyResponse> => {
  const res = await fetch(`${API_BASE}/kyc/verify-pan`, {
    method: 'POST',
    body: JSON.stringify({ pan }),
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};
```

---

## Routing Strategy

SkyVault uses **in-memory routing** (not React Router DOM URLs) because:
1. The application is single-page with no shareable step URLs
2. Simpler state — no URL sync required
3. Better mobile UX (no address bar changes)

Page switching is handled by `useAppStore.page`:
```typescript
'apply' | 'dashboard' | 'calculator'
```

---

## Security Architecture

### Data Masking
```typescript
maskPAN('ABCDE1234F')     // → 'ABXXX1234F'
maskAadhaar('234123412341') // → 'XXXX XXXX 2341'
```

### Storage Encryption
```typescript
// Encode before write
localStorage.setItem(key, btoa(unescape(encodeURIComponent(JSON.stringify(data)))));

// Decode on read  
JSON.parse(decodeURIComponent(escape(atob(raw))));
```

**Production upgrade path:** Replace with Web Crypto API AES-256-GCM:
```typescript
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
```

---

## Validation Rules Matrix

| Step | Required Fields | Business Rules |
|------|----------------|----------------|
| 1 | type, amount, tenure, purpose | Amount within loan type limits |
| 2 | fullName, dob, gender, mobile, email | Age 21–65; OTP verified; alt mobile ≠ mobile |
| 3 | pan, aadhaar, consent | PAN format AAAAA9999A; Aadhaar Verhoeff checksum |
| 4 | currentPincode, city, state, residenceType | Valid 6-digit PIN; prev address if <1yr |
| 5 | type, monthlyIncome | Income ≥ ₹5,000; EMI/Income ≤ 50% |
| 6 | — (conditional) | Required for Home, Personal >5L, Business >20L |
| 7 | — | ≥1 file; signature captured |
| 8 | — | Declaration acceptance |

---

## Performance Optimizations

1. **Code splitting** — All 8 steps are lazy-loaded with `React.lazy()`
2. **Bundle chunking** — vendor, router, forms, motion in separate chunks
3. **Image compression** — Canvas API compresses uploads to JPEG 75%
4. **Memoization** — `useMemo` for score, EMI data, co-app requirement
5. **Suspense boundaries** — Skeleton fallback per step
6. **Tailwind purge** — Only used classes in production bundle

---

## Testing Strategy

```
Unit Tests (Zod Schemas)    → Validate all business rules
Integration Tests (Hooks)   → useVerify, useFileUpload
E2E Tests (Cypress)         → Full user journeys, 20 tests
```

---

## Scaling to Production

### Backend Integration
1. Replace `src/services/api.ts` simulation functions with real HTTP calls
2. Add JWT authentication header to all requests
3. Implement refresh token flow

### State Persistence
- Replace base64 encoding with AES-256-GCM Web Crypto API
- Consider server-side draft storage for cross-device resume

### Monitoring
- Add Sentry for error tracking
- Add analytics events on step completion
- Performance monitoring via Lighthouse CI in GitHub Actions

### Multi-tenancy
- Move `INTEREST_RATES` and `LOAN_LIMITS` to API config
- White-label theming via CSS custom properties
