# Ynov Test - Application React avec API JSONPlaceholder

## Strategy de Tests avec Mocks

### Tests d'API avec Axios Mocking

L'application utilise des mocks pour simuler tous les scénarios d'API :

```javascript
// Mock axios pour les tests
jest.mock('axios');

// Test des différents codes HTTP
test('should handle 400 error (email already exists)', async () => {
  const error400 = new Error('Bad Request');
  error400.response = {
    status: 400,
    data: { message: 'Email already exists' }
  };
  axios.post.mockRejectedValue(error400);
  
  const result = await addUser(newUser);
  
  expect(result.success).toBe(false);
  expect(result.status).toBe(400);
  expect(window.alert).toHaveBeenCalledWith(
    'Cette adresse email est déjà utilisée, veuillez en choisir une autre.'
  );
});
```

### Mocks des Erreurs HTTP Testés

- **200/201 - Succès** : Fonctionnement nominal avec API JSONPlaceholder
- **400 - Erreur Métier** : Email déjà existant avec message spécifique
- **500 - Erreur Serveur** : Gestion du serveur indisponible
- **Erreur Réseau** : Perte de connexion internet

### Tests E2E avec Cypress Intercept

```javascript
// Cypress - Mock des appels API
cy.intercept('POST', 'https://jsonplaceholder.typicode.com/users', {
  statusCode: 400,
  body: { message: 'Email already exists' }
}).as('addUserError400');

// Vérification que l'erreur est bien gérée
cy.wait('@addUserError400');
cy.url().should('include', '/register'); // Pas de redirection
cy.get('#firstName').should('have.value', 'Test'); // Formulaire préservé
```

## Pipeline CI/CD GitHub Actions

### Configuration Automatisée

La pipeline `build_test_react.yml` exécute automatiquement :

```yaml
- name: Install dependencies and run tests
  working-directory: my-app
  env:
    CI: true
  run: |
    npm ci
    npm run build --if-present
    npm test -- --coverage --watchAll=false
    npm run jsdoc
    cp -r docs build/docs

- name: Run Cypress tests (headless)
  uses: cypress-io/github-action@v6
  with:
    build: npm run build
    start: npm start
    working-directory: my-app
    wait-on: 'http://localhost:3000'
    browser: chrome
    spec: cypress/e2e/**/*.cy.js
```

### Étapes de la Pipeline

- ** Build** : Compilation React avec JSONPlaceholder intégré
- ** Tests Jest** : 158 tests unitaires/intégration (100% réussite)
- ** Coverage** : Génération du rapport de couverture (99.5%)
- ** JSDoc** : Documentation automatique du code
- ** Tests E2E** : 8 tests Cypress (navigation + scénarios HTTP)
- ** Déploiement** : GitHub Pages automatique

### Intégration Continue

- ** Tests automatiques** sur chaque push/PR
- ** Parallélisation** des tests Jest et Cypress
- ** Artifacts** de couverture envoyés à Codecov
- ** Screenshots Cypress** en cas d'échec
- ** Déploiement automatique** sur réussite

### URLs de Déploiement

- ** Application** : https://Soukina-NOUNOU.github.io/Ynov_test
- ** Documentation** : https://Soukina-NOUNOU.github.io/Ynov_test/docs/
- ** API** : https://jsonplaceholder.typicode.com (publique)

Pour plus de détails sur la stratégie de tests: [TEST_PLAN.md](/my-app/src/TEST_PLAN.md).