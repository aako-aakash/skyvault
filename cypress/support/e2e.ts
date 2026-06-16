// Cypress support file
// Add custom commands and global configurations here

import './commands';

// Suppress React's "act" warnings in test output
Cypress.on('uncaught:exception', (_err, _runnable) => {
  // Return false to prevent Cypress from failing on uncaught exceptions
  // from the app (like HMR errors in dev)
  return false;
});
