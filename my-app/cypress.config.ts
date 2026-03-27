import { defineConfig } from "cypress";
import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/Ynov_test',
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/*.cy.{js,jsx,ts,tsx}'
    ],
    setupNodeEvents(on, config) {
      cypressGrepPlugin(config);
      return config;
    },
  },
});
