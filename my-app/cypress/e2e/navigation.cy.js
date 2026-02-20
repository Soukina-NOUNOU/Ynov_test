describe('Tests E2E Navigation Multi-Pages', () => {
  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', 'https://jsonplaceholder.typicode.com/users', {
      statusCode: 200,
      body: []
    }).as('getUsers');
    
    cy.intercept('POST', 'https://jsonplaceholder.typicode.com/users', {
      statusCode: 201,
      body: {
        id: 11,
        name: 'Marc Dupont',
        email: 'marc.dupont@test.com',
        address: {
          city: 'Paris',
          zipcode: '75001-1234'
        }
      }
    }).as('addUser');
  });

  describe('Nominal scenario - Navigation and user registration', () => {
    it('should complete full navigation flow with successful user registration', () => {
      // 1. Navigate to Home Page
      cy.visit('/');
      
      // Wait for API call to load users
      cy.wait('@getUsers');
      
      // Verify initial state: "Aucun utilisateur inscrit" and no user list
      cy.contains('Aucun utilisateur inscrit').should('be.visible');
      cy.contains('Liste des utilisateurs inscrits :').should('not.exist');

      // 2. Click/Navigation to the Registration Form (/register)
      cy.contains('S\'inscrire').click();
      cy.url().should('include', '/register');
      
      // Verify that we are on the registration form page
      cy.contains('Inscription').should('be.visible');
      cy.contains('Retour à l\'accueil').should('be.visible');

      // 3. Add a new valid user (Success)
      cy.get('#firstName').type('Marc');
      cy.get('#lastName').type('Dupont');
      cy.get('#email').type('marc.dupont@test.com');
      cy.get('#birth').type('1990-05-15');
      cy.get('#city').type('Paris');
      cy.get('#postalCode').type('75001-1234');
      
      // Verify that there are no validation errors
      cy.get('.error').should('not.exist');
      
      // Verify that the submit button is enabled
      cy.get('button[type="submit"]').should('not.be.disabled');
      
      // Submit the form
      cy.get('button[type="submit"]').click();
      
      // Verify the success toaster
      cy.contains('Utilisateur enregistré avec succès !').should('be.visible');
      
      // Verify that the POST API call was made
      cy.wait('@addUser').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: 'Marc Dupont',
          email: 'marc.dupont@test.com',
          address: {
            city: 'Paris',
            zipcode: '75001-1234'
          }
        });
      });

      // 4. Redirection or Navigation to Home
      cy.url().should('equal', Cypress.config().baseUrl + '/', { timeout: 4000 });

      // 5. Verify "1 user registered" AND the presence of the new user in the list
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Liste des utilisateurs inscrits :').should('be.visible');
      
      // Verify the information of the added user
      cy.contains('Marc Dupont').should('be.visible');
      cy.contains('Email: marc.dupont@test.com').should('be.visible');
      cy.contains('Ville: Paris').should('be.visible');
    });
  });

  describe('Scenario error / Attempt invalid registration', () => {
    it('should handle invalid registration attempt and maintain existing data', () => {
      // Pre-condition: Mock API to return existing user
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/users', {
        statusCode: 200,
        body: [{
          id: 1,
          name: 'Marc Dupont', 
          email: 'marc.dupont@test.com',
          address: {
            city: 'Paris',
            zipcode: '75001-1234'
          }
        }]
      }).as('getUsersWithData');
      
      // Mock successful update for existing data (no POST should be called)
      
      // 1. Navigation to Home to verify the initial state
      cy.visit('/');
      cy.wait('@getUsersWithData');
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Marc Dupont').should('be.visible');

      // 2. Navigation to the Registration Form
      cy.contains('S\'inscrire').click();
      cy.url().should('include', '/register');
      cy.contains('Inscription').should('be.visible');

      // 3. Attempt invalid registration - Test with invalid data
      
      // Test 1: Empty fields - submit directly (button should be disabled)
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Test 2: Invalid data across all fields
      cy.get('#firstName').type('A'); // Too short - error
      cy.get('#lastName').clear(); // Leave empty
      cy.get('#email').type('invalid-email'); // Invalid email format  
      cy.get('#birth').clear(); // Leave empty
      cy.get('#city').type('Ville<script>alert("xss")</script>'); // XSS attempt
      cy.get('#postalCode').type('123'); // Invalid postal code
      
      // Trigger validations by leaving the fields (blur)
      cy.get('#firstName').focus().blur();
      cy.get('#lastName').focus().blur();
      cy.get('#email').focus().blur();
      cy.get('#birth').focus().blur();
      cy.get('#city').focus().blur();
      cy.get('#postalCode').focus().blur();

      // 4. Verify the displayed errors
      cy.get('.error').should('have.length.greaterThan', 0);
      cy.contains('Le prénom doit contenir au moins 2 caractères').should('be.visible');
      cy.contains('Le nom et prénom sont obligatoires et ne peuvent pas être vides.').should('be.visible');
      cy.contains('Veuillez saisir une adresse email valide (test@test.com).').should('be.visible');
      cy.contains('La date de naissance est obligatoire').should('be.visible');
      cy.contains('Le nom contient des caractères dangereux non autorisés.').should('be.visible');
      cy.contains('Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789).').should('be.visible');
      
      // Verify that the submit button remains disabled
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Verify that no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
      
      // Verify no API POST call was made
      cy.get('@addUser.all').should('have.length', 0);

      // 5. Return to Home
      cy.contains('Retour à l\'accueil').click();
      cy.url().should('equal', Cypress.config().baseUrl + '/');

      // 6. Verify "Still 1 registered user" and the unchanged list
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Liste des utilisateurs inscrits :').should('be.visible');
      
      // Verify that the original user is still present and unchanged
      cy.contains('Marc Dupont').should('be.visible');
      cy.contains('Email: marc.dupont@test.com').should('be.visible');
      cy.contains('Ville: Paris').should('be.visible');
      
      // Verify that only 1 user card is displayed
      cy.get('.user-card').should('have.length', 1);
    });

  });

  describe('Navigation and persistence data', () => {
    it('should maintain data consistency across page navigations', () => {
      // Setup: Mock API to return test user data
      cy.intercept('GET', 'https://jsonplaceholder.typicode.com/users', {
        statusCode: 200,
        body: [{
          id: 1,
          name: 'Test Persistance', 
          email: 'test.persistance@example.com',
          address: {
            city: 'Lyon',
            zipcode: '69000-5678'
          }
        }]
      }).as('getUsersPersistence');
      
      // Multiple navigation: Home => Form => Home => Form => Home
      cy.visit('/');
      cy.wait('@getUsersPersistence');
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Test Persistance').should('be.visible');
      
      cy.contains('S\'inscrire').click();
      cy.url().should('include', '/register');
      
      cy.contains('Retour à l\'accueil').click();
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Test Persistance').should('be.visible');
      
      cy.contains('S\'inscrire').click();
      cy.url().should('include', '/register');
      
      cy.contains('Retour à l\'accueil').click();
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Test Persistance').should('be.visible');
      
      // Verify API calls were made for each page visit (at least 1 call for initial load)
      cy.get('@getUsersPersistence.all').should('have.length.at.least', 1);
    });
  });
});