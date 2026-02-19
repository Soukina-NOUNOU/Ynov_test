describe('E2E Test - Registration Form with User Table', () => {

  beforeEach(() => {
    // Clean localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('1st e2e test: Navigation => no users registered => Add new user => one user registered', () => {
    // Navigation to the page
    cy.visit('/');

    // Check that no users are registered (localStorage should be empty or contain an empty array)
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      expect(users).to.have.length(0);
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

    // Navigation to the home page = 1 user registered
    // Check that one user is now registered (data in the array)
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      expect(users).to.have.length(1);
      expect(users[0]).to.deep.equal({
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
    cy.get('#firstName').type('Jeanne');
    cy.get('#lastName').type('Dark');

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

  it('2nd e2e test: Navigation => one user registered => Add new user with error => Still one user registered', () => {
    // Pre-fill localStorage with one registered user
    const existingUser = {
      firstName: 'Jeanne',
      lastName: 'Dark',
      email: 'jeanne.dark@test.com',
      birth: '1990-01-15',
      city: 'Montpellier',
      postalCode: '34000'
    };

    cy.window().then((win) => {
      win.localStorage.setItem('users', JSON.stringify([existingUser]));
    });

    // Navigation to the page
    cy.visit('/');

    // Check that one user is registered (array with 1 element)
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      expect(users).to.have.length(1);
      expect(users[0]).to.deep.equal(existingUser);
    });

    // Navigation to the registration form page (already on the page in this case)
    cy.get('[data-testid="registration-form"]').should('be.visible');
    cy.contains('Inscription').should('be.visible');

    // Attempt to add a new user with errors
    // Fill the form with INVALID data
    cy.get('#firstName').type('123'); // Error: invalid characters
    // Leave lastName empty intentionally (do not fill)
    cy.get('#email').type('email-invalide'); // Error: invalid email format
    // Leave birth empty intentionally (do not fill)
    cy.get('#city').type('Ville<script>alert("xss")</script>'); // Error: XSS
    cy.get('#postalCode').type('123'); // Error: invalid postal code

    // Trigger validation by leaving the fields (blur)
    cy.get('#firstName').focus().blur();
    cy.get('#lastName').focus().blur(); // Blur on empty field to trigger validation
    cy.get('#email').focus().blur();
    cy.get('#birth').focus().blur(); // Blur on empty field to trigger validation
    cy.get('#city').focus().blur();
    cy.get('#postalCode').focus().blur();

    // Check that validation errors are displayed
    cy.get('.error').should('have.length.greaterThan', 0);
    cy.get('.error').should('contain.text', 'Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.');
    cy.get('.error').should('contain.text', 'Veuillez saisir une adresse email valide (test@test.com).');
    cy.get('.error').should('contain.text', 'Le code postal doit être composé de 5 chiffres exactement.');

    // Verify that the submit button is disabled due to errors
    cy.get('button[type="submit"]').should('be.disabled');

    // Navigate to the home page → Still 1 registered user
    // Verify that the original user is still there and no new user has been added
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      // The array should still contain exactly 1 user
      expect(users).to.have.length(1);
      // The original user should still be present
      expect(users[0]).to.deep.equal(existingUser);
      
      // Verify that no invalid data has been saved
      expect(users[0].firstName).to.not.equal('123');
      expect(users[0].email).to.not.equal('email-invalide');
    });

    // Verify that errors are persisted in localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('error_firstName')).to.equal('Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.');
      expect(win.localStorage.getItem('error_email')).to.equal('Veuillez saisir une adresse email valide (test@test.com).');
      expect(win.localStorage.getItem('error_postalCode')).to.equal('Le code postal doit être composé de 5 chiffres exactement.');
    });

    // Verify that no success toaster appears
    cy.get('.toaster.success').should('not.exist');
  });

  it('3rd e2e test: Navigation => one registered user => Add 2nd user successfully => two registered users', () => {
    // Pre-fill localStorage with 1 registered user
    const firstUser = {
      firstName: 'Jeanne',
      lastName: 'Dark',  
      email: 'jeanne.dark@test.com',
      birth: '1990-01-15',
      city: 'Montpellier',
      postalCode: '34000'
    };

    cy.window().then((win) => {
      win.localStorage.setItem('users', JSON.stringify([firstUser]));
    });

    // Navigate to the home page
    cy.visit('/');

    // Verify that 1 user is registered
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      expect(users).to.have.length(1);
    });

    // Add a second valid user
    cy.get('#firstName').type('Selena');
    cy.get('#lastName').type('Gomez');
    cy.get('#email').type('selena.gomez@test.com');
    cy.get('#birth').type('1995-07-25');
    cy.get('#city').type('Toulouse');
    cy.get('#postalCode').type('31000');

    // Verify that there are no errors
    cy.get('.error').should('not.exist');

    // Submit the form
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();

    // Verify the success toaster
    cy.get('.toaster.success').should('be.visible');

    // Verify that there are now 2 users in the array
    cy.window().then((win) => {
      const users = JSON.parse(win.localStorage.getItem('users') || '[]');
      expect(users).to.have.length(2);
      
      // Verify the first user (still present)
      expect(users[0]).to.deep.equal(firstUser);
      
      // Verify the second user (newly added)
      expect(users[1]).to.deep.equal({
        firstName: 'Selena',
        lastName: 'Gomez',
        email: 'selena.gomez@test.com',
        birth: '1995-07-25',
        city: 'Toulouse',
        postalCode: '31000'
      });
    });
  });
});