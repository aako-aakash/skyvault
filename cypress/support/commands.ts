/// <reference types="cypress" />

// Custom Cypress commands for SkyVault Lending tests
// Add reusable commands here

declare global {
  namespace Cypress {
    interface Chainable {
      selectLoanType(type: 'personal' | 'home' | 'business'): Chainable<void>;
      fillOTP(otp?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('selectLoanType', (type) => {
  const labels: Record<string, string> = {
    personal: 'Personal Loan',
    home: 'Home Loan',
    business: 'Business Loan',
  };
  cy.contains(labels[type]).click();
});

Cypress.Commands.add('fillOTP', (otp = '123456') => {
  otp.split('').forEach((digit, i) => {
    cy.get('.otp-box').eq(i).type(digit);
  });
});

export {};
