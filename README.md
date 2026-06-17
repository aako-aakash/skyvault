# SkyVault Lending — Enterprise Loan Origination Platform

> **Designed & Developed by Aakash Kumar Saw | Skyward Labs**
> [LinkedIn](https://www.linkedin.com/in/aako-aakash)

A production-grade, enterprise-level digital loan origination platform built with React 18, TypeScript, Vite, Tailwind CSS, Zustand, and React Hook Form + Zod.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 📋 Features

### Loan Products
- **Personal Loans** — ₹50,000 to ₹10,00,000 at 10.5% p.a.
- **Home Loans** — ₹50,000 to ₹1,00,00,000 at 8.5% p.a.
- **Business Loans** — ₹50,000 to ₹50,00,000 at 14% p.a.

### 8-Step Application Wizard
| Step | Description |
|------|-------------|
| 1 | Loan Selection & Amount Configuration |
| 2 | Personal Information + OTP Verification |
| 3 | KYC — PAN + Aadhaar Verification (Verhoeff algorithm) |
| 4 | Address — PIN code auto-fill, state mismatch detection |
| 5 | Employment — Salaried / Self-Employed / Business Owner |
| 6 | Co-Applicant & Guarantor (conditional) |
| 7 | Document Upload + E-Signature Canvas |
| 8 | Review & Pre-Approval Summary |

### Financial Engine
- **EMI Formula:** `P × r × (1+r)^n / ((1+r)^n – 1)`
- Live EMI calculation with processing fee breakdown
- Pre-approval score (300–850 range)
- EMI/Income ratio validation (max 50%)
- DOB-based tenure eligibility

### Security
- AES-256 style base64 encryption for localStorage
- PAN masking (`ABXXX1234A` → `ABXXX...`)
- Aadhaar masking (shows only last 4 digits)
- No sensitive data in console logs

### Auto-Save & Resume
- Saves every 30 seconds via `useAutoSave` hook
- 72-hour TTL on draft
- Resume modal on page reload
- Start fresh option

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── common/          # Button, Card, Field, Input, Select, Toggle, Modal, etc.
│   ├── layout/          # Header, Footer
│   ├── wizard/          # WizardProgress
│   ├── financial/       # EMIWidget, DocumentUpload, SignatureCanvas
│   └── steps/           # Step1–Step8 components
├── constants/           # RATES, LIMITS, TENURES, PIN_DB, etc.
├── hooks/               # useAutoSave, useVerify, useFileUpload
├── pages/               # ApplyPage, DashboardPage, CalculatorPage
├── routes/              # Client-side router
├── schemas/             # Zod validation schemas for each step
├── services/            # api.ts — API simulation layer
├── store/               # useAppStore (Zustand)
├── styles/              # globals.css (Tailwind)
├── types/               # TypeScript interfaces
└── utils/               # formatINR, calcEMI, validatePAN, etc.

cypress/
└── e2e/                 # 20 E2E tests
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form 7 + Zod |
| State | Zustand 4 |
| Animation | Framer Motion 11 |
| File Upload | React Dropzone 14 |
| Signature | React Signature Canvas |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Testing | Cypress 13 |
| Linting | ESLint (TypeScript) + Prettier |

---

## 🧪 Testing

```bash
# Open Cypress test runner (interactive)
npm test

# Run all tests headlessly
npm run test:e2e
```

Tests cover:
- Personal / Home / Business loan journeys
- Form validation (all 8 steps)
- OTP verification flow
- PAN / Aadhaar verification
- PIN code auto-fill
- Auto-save & resume modal
- Dashboard page
- EMI Calculator
- Keyboard navigation & accessibility
- Mobile viewport

---

## 🏗 Build & Deploy

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Environment Variables

```env
# .env.local (for production)
VITE_APP_NAME=SkyVault Lending
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENCRYPTION_KEY=your-256-bit-key
```

### Deploy to Vercel

```bash
npx vercel --prod
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to AWS S3 + CloudFront

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 🔒 Security Considerations

- All form data is validated client-side with Zod schemas
- Sensitive fields (PAN, Aadhaar, Income) are masked in review screen
- LocalStorage data is base64-encoded (replace with AES-256-GCM in production)
- No sensitive data logged to console
- HTTPS enforced in production
- CSP headers recommended for production

---

## ♿ Accessibility (WCAG 2.1 AA)

- All interactive elements have `aria-label` or `aria-labelledby`
- Progress bar uses `role="progressbar"` with `aria-valuenow`
- Error messages use `role="alert"` and `aria-live="polite"`
- OTP inputs have per-digit `aria-label`
- Keyboard navigation supported throughout
- Focus management on step transitions
- Color contrast meets AA standard

---

## 📄 License

MIT © 2026 Aakash Kumar Saw | skyward Labs
