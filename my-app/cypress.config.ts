import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/Ynov_test',
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/*.cy.{js,jsx,ts,tsx}'
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
