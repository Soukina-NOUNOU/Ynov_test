/**
 * E2E tests against the real environment (docker compose).
 *
 * Two tags:
 *  @real     → requires ALL containers to be running (react + api + db)
 *  @api-down → requires only React to be running, API container must be stopped
 *
 * CI/CD commands:
 *   npx cypress run --expose grepTags=@real,grepFilterSpecs=true
 *   npx cypress run --expose grepTags=@api-down,grepFilterSpecs=true
 */

// Pre-condition: docker compose up (react + api + db)
describe('Real Environment - Full stack running', { tags: '@real' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should load home page and display user list from real API', () => {
    cy.visit('/');

    cy.contains('utilisateur', { timeout: 8000 }).should('be.visible');
  });

});

// Tests when the API container is stopped
describe('Real Environment - API container down', { tags: '@api-down' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should display empty state when GET /users fails (API unreachable)', () => {
    cy.visit('/');

    cy.contains('Aucun utilisateur inscrit', { timeout: 10000 }).should('be.visible');

    // No React crash – the registration button must remain accessible
    cy.contains("S'inscrire").should('be.visible');
  });

  it('should stay on register page and show error when POST /users fails (API unreachable)', () => {
    cy.visit('/register');

    cy.get('#firstName').clear().type('ApiDown');
    cy.get('#lastName').clear().type('Test');
    cy.get('#email').clear().type('apidown.test@example.com');
    cy.get('#birth').type('1990-01-17');
    cy.get('#city').clear().type('Lyon');
    cy.get('#postalCode').clear().type('13001');

    // Wait for React to finish validating all fields and enable the button
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/register', { timeout: 8000 });

    cy.contains('Utilisateur enregistré avec succès !').should('not.exist');

    cy.get('#firstName').should('have.value', 'ApiDown');
    cy.get('#email').should('have.value', 'apidown.test@example.com');
  });

  it('should allow navigation between pages even when API is down', () => {
    cy.visit('/');

    cy.contains('Aucun utilisateur inscrit', { timeout: 10000 }).should('be.visible');

    cy.contains("S'inscrire").click();
    cy.url().should('include', '/register');
    cy.contains('Inscription').should('be.visible');

    cy.contains("Retour à l'accueil").click();
    cy.url().should('match', new RegExp('^' + Cypress.config().baseUrl + '/?$'));

    cy.contains('Aucun utilisateur inscrit').should('be.visible');
  });
});
