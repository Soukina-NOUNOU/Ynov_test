describe('Tests E2E Navigation Multi-Pages', () => {
  beforeEach(() => {
    // Clean localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('Scénario Nominal - Navigation et ajout utilisateur', () => {
    it('should complete full navigation flow with successful user registration', () => {
      // 1. Navigate to Home Page
      cy.visit('/');
      
      // Verify initial state: "Aucun utilisateur inscrit" and no user list
      cy.contains('Aucun utilisateur inscrit').should('be.visible');
      cy.contains('Liste des utilisateurs inscrits :').should('not.exist');
      
      // Verify that localStorage is empty
      cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('users') || '[]');
        expect(users).to.have.length(0);
      });

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

      // 4. Redirection or Navigation to Home
      cy.url().should('equal', Cypress.config().baseUrl + '/', { timeout: 4000 });

      // 5. Verify "1 user registered" AND the presence of the new user in the list
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Liste des utilisateurs inscrits :').should('be.visible');
      
      // Verify the information of the added user
      cy.contains('Marc Dupont').should('be.visible');
      cy.contains('Email: marc.dupont@test.com').should('be.visible');
      cy.contains('Ville: Paris').should('be.visible');
      
      // Verify that the data is correctly saved in localStorage
      cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('users') || '[]');
        expect(users).to.have.length(1);
        expect(users[0]).to.deep.include({
          firstName: 'Marc',
          lastName: 'Dupont',
          email: 'marc.dupont@test.com',
          city: 'Paris',
          postalCode: '75001'
        });
      });
    });
  });

  describe('Scenario error / Attempt invalid registration', () => {
    it('should handle invalid registration attempt and maintain existing data', () => {
      // Pre-condition: Starting from the previous state (1 registered user)
      // Pre-fill localStorage with an existing user to simulate the state after the first test
      const existingUser = {
        firstName: 'Marc',
        lastName: 'Dupont',
        email: 'marc.dupont@test.com',
        birth: '1990-05-15',
        city: 'Paris',
        postalCode: '75001'
      };
      
      cy.window().then((win) => {
        win.localStorage.setItem('users', JSON.stringify([existingUser]));
      });

      // 1. Navigation to Home to verify the initial state
      cy.visit('/');
      cy.contains('1 utilisateur inscrit').should('be.visible');
      cy.contains('Marc Dupont').should('be.visible');

      // 2. Navigation to the Registration Form
      cy.contains('S\'inscrire').click();
      cy.url().should('include', '/register');
      cy.contains('Inscription').should('be.visible');

      // 3. Attempt invalid registration - Test with already taken email AND empty fields
      
      // Test 1: Empty fields - submit directly
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Test 2: Email already exists + invalid data
      cy.get('#firstName').type('A'); // Too short - error
      cy.get('#lastName').clear(); // Leave empty
      cy.get('#email').type('marc.dupont@test.com'); // Email already exists (even if validation is not implemented for duplicates)
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
      cy.contains('La date de naissance est obligatoire').should('be.visible');
      cy.contains('Le nom contient des caractères dangereux non autorisés.').should('be.visible');
      cy.contains('Le code postal doit être composé de 5 chiffres exactement').should('be.visible');
      
      // Verify that the submit button remains disabled
      cy.get('button[type="submit"]').should('be.disabled');
      
      // Verify that no success toaster appears
      cy.contains('Utilisateur enregistré avec succès !').should('not.exist');

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
      
      // Verify that no additional user has been added
      cy.get('.user-card').should('have.length', 1);
      
      // Verify that localStorage still contains exactly 1 user
      cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('users') || '[]');
        expect(users).to.have.length(1);
        expect(users[0]).to.deep.equal(existingUser);
        
        // Verify that no invalid data has been saved
        expect(users[0].firstName).to.not.equal('A');
        expect(users[0].email).to.equal('marc.dupont@test.com'); // Original email preserved
        expect(users[0].city).to.not.include('<script>');
      });

      // Bonus Test: Verify the persistence of errors in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('error_firstName')).to.equal('Le prénom doit contenir au moins 2 caractères');
        expect(win.localStorage.getItem('error_lastName')).to.equal('Le nom et prénom sont obligatoires et ne peuvent pas être vides.');
        expect(win.localStorage.getItem('error_birth')).to.equal('La date de naissance est obligatoire');
        expect(win.localStorage.getItem('error_city')).to.equal('Le nom contient des caractères dangereux non autorisés.');
        expect(win.localStorage.getItem('error_postalCode')).to.equal('Le code postal doit être composé de 5 chiffres exactement.');
      });
    });
  });

  describe('Navigation and persistence data', () => {
    it('should maintain data consistency across page navigations', () => {
      // Additional test to verify persistence across multiple navigations
      
      // Create a base data
      const user = {
        firstName: 'Test',
        lastName: 'Persistance',
        email: 'test.persistance@example.com',
        birth: '1995-03-10',
        city: 'Lyon',
        postalCode: '69000'
      };
      
      cy.window().then((win) => {
        win.localStorage.setItem('users', JSON.stringify([user]));
      });
      
      // Multiple navigation: Home => Form => Home => Form => Home
      cy.visit('/');
      cy.contains('1 utilisateur inscrit').should('be.visible');
      
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
      
      // Verify that localStorage still contains the same user data
      cy.window().then((win) => {
        const users = JSON.parse(win.localStorage.getItem('users') || '[]');
        expect(users).to.have.length(1);
        expect(users[0]).to.deep.equal(user);
      });
    });
  });
});