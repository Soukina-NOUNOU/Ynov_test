describe('Test E2E, Registration form', () => {

  beforeEach(() => {
    // Clean the localStore before each test to ensure a fresh state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('1er test e2e: Navigation => no registered user => Add new user => Register user', () => {
    // Navigation to the home page
    cy.visit('/');

    // Check if localStorage is empty at the start (no user registered)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('user')).to.be.null;
    });

    // Navigation to the registration form page (already on the page in this case)
    cy.get('[data-testid="registration-form"]').should('be.visible');
    cy.contains('Inscription').should('be.visible');

    // Check that the submit button is initially disabled
    cy.get('button[type="submit"]').should('be.disabled');

    // Adding a new user without errors
    // Fill the form with valid data
    cy.get('#firstName').type('Jeanne');
    cy.get('#lastName').type('Dark');
    cy.get('#email').type('jeanne.dark@test.com');
    cy.get('#birth').type('1990-01-15');
    cy.get('#city').type('Montpellier');
    cy.get('#postalCode').type('34000');

    // Check that there are no validation errors
    cy.get('.error').should('not.exist');

    // Check that the submit button is now enabled
    cy.get('button[type="submit"]').should('not.be.disabled');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check that the success toaster is displayed
    cy.get('.toaster.success').should('be.visible');
    cy.get('.toaster.success').should('contain.text', 'Utilisateur enregistré avec succès !');

    // Check that the form is cleared after submission
    cy.get('#firstName').should('have.value', '');
    cy.get('#lastName').should('have.value', '');
    cy.get('#email').should('have.value', '');
    cy.get('#birth').should('have.value', '');
    cy.get('#city').should('have.value', '');
    cy.get('#postalCode').should('have.value', '');

    // Navigation to the home page → One user registered
    // Check that a user is now registered (data in localStorage)
    cy.window().then((win) => {
      const userData = JSON.parse(win.localStorage.getItem('user') || '{}');
      expect(userData).to.deep.equal({
        firstName: 'Jeanne',
        lastName: 'Dark',
        email: 'jeanne.dark@test.com',
        birth: '1990-01-15',
        city: 'Montpellier',
        postalCode: '34000'
      });
    });

    // Check that the toaster disappears after 3 seconds
    cy.get('.toaster.success', { timeout: 4000 }).should('not.exist');
  });

  it('Real-time validation test', () => {
    cy.visit('/');

    // Test real-time validation for the first name
    cy.get('#firstName').type('123'); // Invalid characters
    cy.get('#firstName').blur();
    cy.get('.error').should('contain.text', 'Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.');

    // Correct the first name
    cy.get('#firstName').clear().type('Jean');
    cy.get('#firstName').blur();
    cy.get('#firstName').parent().find('.error').should('not.exist');

    // Test email validation
    cy.get('#email').type('invalid-email');
    cy.get('#email').blur();
    cy.get('.error').should('contain.text', 'Veuillez saisir une adresse email valide (test@test.com).');

    // Correct the email
    cy.get('#email').clear().type('jean@example.com');
    cy.get('#email').blur();
    cy.get('#email').parent().find('.error').should('not.exist');

    // Test postal code validation
    cy.get('#postalCode').type('123'); // Invalid postal code
    cy.get('#postalCode').blur();
    cy.get('.error').should('contain.text', 'Le code postal doit être composé de 5 chiffres exactement.');

    // Correct the postal code
    cy.get('#postalCode').clear().type('34000');
    cy.get('#postalCode').blur();
    cy.get('#postalCode').parent().find('.error').should('not.exist');
  });

  it('Test error persistence in localStorage', () => {
    cy.visit('/');

    // Generate a validation error
    cy.get('#firstName').type('123');
    cy.get('#firstName').blur();

    // Check that the error is saved in localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('error_firstName')).to.equal('Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.');
    });

    // Correct the error
    cy.get('#firstName').clear().type('Jean');
    cy.get('#firstName').blur();

    // Check that the error is removed from localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('error_firstName')).to.be.null;
    });
  });

  it('Test submission with missing fields', () => {
    cy.visit('/');

    // Try to submit the empty form
    cy.get('button[type="submit"]').should('be.disabled');

    // Fill in the form partially
    cy.get('#firstName').type('Jean');
    cy.get('#lastName').type('Dupont');

    // The button should still be disabled
    cy.get('button[type="submit"]').should('be.disabled');

    // Fill in all required fields
    cy.get('#email').type('jeanne.dark@test.com');
    cy.get('#birth').type('1990-01-15');
    cy.get('#city').type('Montpellier');
    cy.get('#postalCode').type('34000');

    // Now the button should be enabled
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});