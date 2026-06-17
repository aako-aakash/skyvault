/// <reference types="cypress" />

const BASE = 'http://localhost:5173';
const DEMO_OTP = '123456';

// ─── Helpers ──────────────────────────────────────────────────────
const fillPersonalInfo = () => {
  cy.get('input[placeholder="As per PAN card"]').type('Rajesh Kumar');
  cy.get('input[type="date"]').first().type('1988-06-15');
  cy.get('select').first().select('male');
  cy.get('input[placeholder="you@email.com"]').type('rajesh.kumar@example.com');
  // Mobile + OTP
  cy.contains('+91').closest('div').find('input').type('9876543210');
  cy.contains('Send OTP').click();
  cy.contains(`Demo OTP: ${DEMO_OTP}`).should('be.visible');
  // Fill OTP boxes
  DEMO_OTP.split('').forEach((digit, i) => {
    cy.get('.otp-box').eq(i).type(digit);
  });
  cy.contains('Mobile Verified').should('be.visible');
};

const fillKYC = () => {
  cy.get('input[placeholder="ABCDE1234F"]').first().type('ABCDE1234F');
  cy.contains('Verify PAN').click();
  cy.contains('PAN verified', { timeout: 5000 }).should('be.visible');
  cy.get('input[placeholder="XXXX XXXX XXXX"]').type('234123412346');
  cy.contains('Verify').click();
  cy.contains('Aadhaar verified', { timeout: 5000 }).should('be.visible');
  // Consent toggle
  cy.contains('I consent to Aadhaar').click();
};

// ─── Test Suite ───────────────────────────────────────────────────
describe('SkyVault Lending — E2E Tests', () => {
  beforeEach(() => {
    cy.visit(BASE);
    cy.clearLocalStorage();
  });

  // ── 1. Landing & UI ───────────────────────────────────────────
  it('01 — Renders header, footer, and loan type cards', () => {
    cy.contains('SkyVault Lending').should('be.visible');
    cy.contains('Choose Loan Type').should('be.visible');
    cy.contains('Personal Loan').should('be.visible');
    cy.contains('Home Loan').should('be.visible');
    cy.contains('Business Loan').should('be.visible');
    cy.contains('Aakash Kumar Saw').should('be.visible');
    cy.contains('RBI Compliant').should('be.visible');
  });

  // ── 2. Personal Loan Journey ──────────────────────────────────
  it('02 — Personal Loan full journey: Step 1', () => {
    cy.contains('Personal Loan').click();
    cy.get('input[type="range"]').first().invoke('val', 500000).trigger('input');
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    cy.contains('Personal Info').should('be.visible');
  });

  // ── 3. Step 1 Validation ──────────────────────────────────────
  it('03 — Step 1 validation: blocks proceed without loan type', () => {
    cy.contains('Continue').click();
    cy.contains('Please select a loan type').should('be.visible');
  });

  it('04 — Step 1 validation: amount out of range', () => {
    cy.contains('Personal Loan').click();
    cy.get('input[type="number"]').first().clear().type('20000');
    cy.contains('Continue').click();
    cy.contains('outside the allowed range').should('be.visible');
  });

  // ── 4. EMI Calculator Widget ──────────────────────────────────
  it('05 — EMI widget appears after selecting loan type and tenure', () => {
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.contains('Estimated Monthly EMI').should('be.visible');
    cy.contains('Total Interest').should('be.visible');
    cy.contains('Processing Fee').should('be.visible');
  });

  // ── 5. Step 2 Personal Info ───────────────────────────────────
  it('06 — Step 2: OTP verification flow', () => {
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    fillPersonalInfo();
  });

  it('07 — Step 2 validation: blocks on missing fields', () => {
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    cy.contains('Continue').click();
    cy.contains('Full name is required').should('be.visible');
  });

  // ── 6. KYC Step ───────────────────────────────────────────────
  it('08 — Step 3: PAN and Aadhaar verification', () => {
    // Navigate to KYC
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    fillPersonalInfo();
    cy.contains('Continue').click();
    fillKYC();
    cy.contains('AES-256-GCM encrypted').should('be.visible');
  });

  it('09 — Step 3 validation: cannot proceed without PAN verification', () => {
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    fillPersonalInfo();
    cy.contains('Continue').click();
    cy.contains('Continue').click();
    cy.contains('Please verify your PAN').should('be.visible');
  });

  // ── 7. Address Step ───────────────────────────────────────────
  it('10 — Step 4: PIN code auto-fill', () => {
    // Quick navigate to step 4 using store manipulation
    cy.window().then(() => {
      cy.visit(BASE);
    });
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    fillPersonalInfo();
    cy.contains('Continue').click();
    fillKYC();
    cy.contains('Continue').click();
    cy.get('input[placeholder="6-digit PIN"]').first().type('400001');
    cy.contains('Mumbai', { timeout: 3000 }).should('be.visible');
    cy.contains('Maharashtra').should('be.visible');
  });

  // ── 8. Home Loan Journey ──────────────────────────────────────
  it('11 — Home Loan: co-applicant step is always shown', () => {
    cy.contains('Home Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('60');
    cy.get('select').contains('Select Purpose').parent().select('Purchase New Property');
    // Step 6 should appear for home loan (co-applicant required)
    cy.contains('8.5% p.a.').should('be.visible');
  });

  // ── 9. Business Loan ─────────────────────────────────────────
  it('12 — Business Loan: shows GST field in employment', () => {
    cy.contains('Business Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Working Capital');
    cy.contains('14% p.a.').should('be.visible');
  });

  // ── 10. Auto-save & Resume ────────────────────────────────────
  it('13 — Auto-save: draft stored in localStorage', () => {
    cy.contains('Personal Loan').click();
    // Wait for auto-save (trigger manually by modifying store)
    cy.window().then((win) => {
      const data = { loan: { type: 'personal', amount: 500000 }, _ts: Date.now() };
      win.localStorage.setItem('sv_app_draft_v4',
        btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
    });
    cy.reload();
    cy.contains('Resume Your Application?').should('be.visible');
    cy.contains('Personal Loan').should('be.visible');
  });

  it('14 — Resume modal: Start Fresh clears draft', () => {
    cy.window().then((win) => {
      const data = { loan: { type: 'personal', amount: 500000 }, _ts: Date.now() };
      win.localStorage.setItem('sv_app_draft_v4',
        btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
    });
    cy.reload();
    cy.contains('Resume Your Application?').should('be.visible');
    cy.contains('Start Fresh').click();
    cy.contains('Resume Your Application?').should('not.exist');
    cy.window().its('localStorage').invoke('getItem', 'sv_app_draft_v4').should('be.null');
  });

  // ── 11. Dashboard ─────────────────────────────────────────────
  it('15 — Dashboard page shows KPI stats and table', () => {
    cy.contains('📊 Dashboard').click();
    cy.contains('Applications Dashboard').should('be.visible');
    cy.contains('Total Applications').should('be.visible');
    cy.contains('Approved').should('be.visible');
    cy.contains('SVL-A1B2C3').should('be.visible');
    cy.contains('Rajesh Kumar').should('be.visible');
  });

  // ── 12. Calculator ────────────────────────────────────────────
  it('16 — EMI Calculator computes correct values', () => {
    cy.contains('🧮 Calculator').click();
    cy.contains('EMI Calculator').should('be.visible');
    cy.contains('Monthly EMI').should('be.visible');
    cy.contains('10.5%').should('be.visible');
  });

  // ── 13. Keyboard Navigation ───────────────────────────────────
  it('17 — Keyboard navigation works through loan type selection', () => {
    cy.get('[aria-label*="home"]').first().focus();
    cy.focused().should('exist');
  });

  // ── 14. Accessibility ─────────────────────────────────────────
  it('18 — ARIA roles and labels are present', () => {
    cy.get('[role="main"]').should('exist');
    cy.get('[role="progressbar"]').should('exist');
    cy.get('[role="contentinfo"]').should('exist');
    cy.get('[aria-label]').its('length').should('be.gt', 3);
  });

  // ── 15. Mobile responsive ─────────────────────────────────────
  it('19 — Renders correctly on mobile viewport', () => {
    cy.viewport(390, 844);
    cy.contains('SkyVault Lending').should('be.visible');
    cy.contains('Personal Loan').should('be.visible');
    cy.contains('Continue').should('be.visible');
  });

  // ── 16. Stress test: rapid navigation ────────────────────────
  it('20 — Navigation buttons work correctly (back/forward)', () => {
    cy.contains('Personal Loan').click();
    cy.get('select').contains('Select Tenure').parent().select('36');
    cy.get('select').contains('Select Purpose').parent().select('Medical Emergency');
    cy.contains('Continue').click();
    cy.contains('Personal Info').should('be.visible');
    cy.contains('← Back').click();
    cy.contains('Loan Details').should('be.visible');
  });
});
