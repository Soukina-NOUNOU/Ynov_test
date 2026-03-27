describe('Tests E2E Navigation Multi-Pages', { tags: '@mocked' }, () => {
  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', "**/users", {
      statusCode: 200,
      body: { utilisateurs: [] }
    }).as('getUsers');
    
    cy.intercept('POST', "**/users", {
      statusCode: 201,
      body: {
        id: 11,
        firstName: 'Marc',
        lastName: 'Dupont',
        email: 'marc.dupont@test.com',
        birth: '1990-05-15',
        city: 'Paris',
        postalCode: '75001'
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
      cy.get('#postalCode').type('75001');
      
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
        // v2.0.0 structure: callback now receives {userData, metadata}
        const requestBody = interception.request.body;
        
        // Verify main structure
        expect(requestBody).to.have.property('userData');
        expect(requestBody).to.have.property('metadata');
        
        // Verify userData content
        expect(requestBody.userData).to.deep.include({
          name: 'Marc Dupont',
          email: 'marc.dupont@test.com',
          address: {
            city: 'Paris',
            zipcode: '75001'
          }
        });
        
        // Verify metadata content
        expect(requestBody.metadata).to.have.property('formVersion', '2.0.0');
        expect(requestBody.metadata).to.have.property('autoSaveEnabled', true);
        expect(requestBody.metadata).to.have.property('submissionTimestamp');
        expect(requestBody.metadata).to.have.property('hasAutoSavedData');
      });

      // 4. Redirection or Navigation to Home
      cy.url().should('match', new RegExp('^' + Cypress.config().baseUrl + '/?$'), { timeout: 4000 });

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
      cy.intercept('GET', "**/users", {
        statusCode: 200,
        body: { utilisateurs: [[1, 'Marc', 'Dupont', 'marc.dupont@test.com', '1990-05-15', 'Paris', '75001']] }
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
      cy.contains('Le code postal doit être composé de 5 chiffres (ex: 75001).').should('be.visible');
      
      // Verify that the submit button remains disabled
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Verify that no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
      
      // Verify no API POST call was made
      cy.get('@addUser.all').should('have.length', 0);

      // 5. Return to Home
      cy.contains('Retour à l\'accueil').click();
      cy.url().should('match', new RegExp('^' + Cypress.config().baseUrl + '/?$'));

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
      cy.intercept('GET', "**/users", {
        statusCode: 200,
        body: { utilisateurs: [[1, 'Test', 'Persistance', 'test.persistance@example.com', '1990-01-01', 'Lyon', '69000']] }
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

  describe('HTTP Error Scenarios', () => {
    beforeEach(() => {
      // Mock successful GET for initial load
      cy.intercept('GET', "**/users", {
        statusCode: 200,
        body: { utilisateurs: [] }
      }).as('getUsers');
    });

    it('should handle 400 error - Email already exists', () => {
      // Mock POST to return 400 error
      cy.intercept('POST', "**/users", {
        statusCode: 400,
        body: {
          message: 'Email already exists'
        }
      }).as('addUserError400');

      cy.visit('/');
      cy.wait('@getUsers');
      
      // Navigate to registration
      cy.contains('S\'inscrire').click();
      
      // Fill form with valid data
      cy.get('#firstName').type('Test');
      cy.get('#lastName').type('User');
      cy.get('#email').type('existing@test.com'); // Email that "already exists"
      cy.get('#birth').type('1990-01-01');
      cy.get('#city').type('Paris');
      cy.get('#postalCode').type('75001');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify API call was made
      cy.wait('@addUserError400');
      
      // Verify error alert was shown (we can't assert on alert directly, but we can verify the request)
      cy.get('@addUserError400.all').should('have.length', 1);
      
      // Verify we stay on the registration page (no redirect)
      cy.url().should('include', '/register');
      
      // Verify no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
      
      // Verify form data is preserved (user can correct the email)
      cy.get('#firstName').should('have.value', 'Test');
      cy.get('#email').should('have.value', 'existing@test.com');
    });

    it('should handle 500 error - Server down', () => {
      // Mock POST to return 500 error
      cy.intercept('POST', "**/users", {
        statusCode: 500,
        body: {
          message: 'Internal Server Error'
        }
      }).as('addUserError500');

      cy.visit('/');
      cy.wait('@getUsers');
      
      // Navigate to registration
      cy.contains('S\'inscrire').click();
      
      // Fill form with valid data
      cy.get('#firstName').type('Server');
      cy.get('#lastName').type('Error');
      cy.get('#email').type('server.error@test.com');
      cy.get('#birth').type('1985-05-15');
      cy.get('#city').type('Lyon');
      cy.get('#postalCode').type('69001');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify API call was made
      cy.wait('@addUserError500');
      
      // Verify error was handled
      cy.get('@addUserError500.all').should('have.length', 1);
      
      // Verify we stay on the registration page (no redirect)
      cy.url().should('include', '/register');
      
      // Verify no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
      
      // Verify form data is preserved (user can retry later)
      cy.get('#firstName').should('have.value', 'Server');
      cy.get('#city').should('have.value', 'Lyon');
    });

    it('should handle network error', () => {
      // Mock POST to simulate network error (no response)
      cy.intercept('POST', "**/users", {
        forceNetworkError: true
      }).as('addUserNetworkError');

      cy.visit('/');
      cy.wait('@getUsers');
      
      // Navigate to registration
      cy.contains('S\'inscrire').click();
      
      // Fill form with valid data
      cy.get('#firstName').type('Network');
      cy.get('#lastName').type('Test');
      cy.get('#email').type('network@test.com');
      cy.get('#birth').type('1992-03-10');
      cy.get('#city').type('Marseille');
      cy.get('#postalCode').type('13001');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify network error was triggered
      cy.wait('@addUserNetworkError');
      
      // Verify we stay on the registration page
      cy.url().should('include', '/register');
      
      // Verify no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
      
      // Verify form data is preserved
      cy.get('#firstName').should('have.value', 'Network');
      cy.get('#email').should('have.value', 'network@test.com');
    });
  });
});