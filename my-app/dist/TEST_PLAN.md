# Plan de Stratégie de Test - Formulaire d'Inscription

## Tests Unitaires (UT) et Tests d'Intégration (IT)

## Stratégie Adoptée

#### Tests Unitaires
- **Isolement total** : Chaque fonction testée indépendamment
- **Couverture exhaustive** : Tous les cas limites et d'erreur
- **Rapidité d'exécution** : Pas de rendu DOM
- **Debugging facilité** : Erreurs facilement localisables

#### Tests d'Intégration
- **Simulation utilisateur réel** : userEvent vs fireEvent
- **Validation du workflow complet** : Saisie => Validation => Soumission
- **Test des interactions** : États partagés, localStorage, DOM
- **Vérification UX** : Toasters, messages d'erreur, états des boutons

### Points Techniques Importants

#### Contournement des Contraintes
- **Bouton désactivé** : Utilisation de `fireEvent.submit` pour tester les erreurs à la soumission
- **Timers** : `jest.useFakeTimers()` pour contrôler le toaster
- **localStorage** : Nettoyage entre tests avec `beforeEach`

## Tests Unitaires (UT)

### `validator.test.js` 
**Rôle :** Tests des fonctions de validations

#### `validatePostalCode()`
- Code postal valide (5 chiffres)
- Code postal invalide (trop court/long)
- Caractères non numériques
- Type incorrect (!string)
- Valeurs null/undefined

#### `validateIdentity()`
- Noms valides (avec accents, tirets, apostrophes)
- Noms avec chiffres
- Caractères spéciaux non autorisés
- Détection XSS (`<script>`, balises HTML)
- Chaînes vides ou espaces uniquement
- Types incorrects (!string)

#### `validateEmail()`
- Emails valides (formats standards)
- Formats invalides (sans @, domaine manquant = validation avec regex)
- Types incorrects (!string)
- Valeurs null/undefined

### 📁 `module.test.js`
**Rôle :** Tests de la fonction de calcul de l'age

#### `calculateAge()`
- Calcul correct de l'age (personnes majeures : +18)
- Age inférieur à 18
- Date future = naissance impossible
- Date trop ancienne avant 1970
- Date invalide/impossible (ex: 31 février)
- Paramètre manquant
- Type incorrect (n'st pas un objet)
- Propriété `birth` manquante
- Valeurs null/undefined pour `birth`
- Gestion des années bissextiles
- Tests avec dates mockées

---

## Tests d'Intégration (IT)

### `App.test.js`
**Rôle :** Tests pour le rendu du composant principal

#### Intégration App / RegistrationForm
- Rendu du titre "Inscription"
- Présence de tous les champs obligatoires
- Présence du bouton de soumission

### `RegistrationForm.test.js`
**Rôle :** Tester l'intégration compléte du flux de l'utilisateur

#### Validation en temps réel
- Affichage des erreurs pertinente lors de la saisie
- Validation au blur (perte de focus)
- Effacer les erreurs lors de correction

#### Gestion d'état du formulaire
- Activation/désactivation du bouton en fonction de la validité des inputs
- Reset complet du formulaire après soumission
- Sauvegarde des données en localStorage

#### Workflow complet de soumission
- Soumission avec données valides
- Afficher le toaster de succès (3 s puis disparition)
- Nettoyer les erreurs du localStorage

#### Gestion des erreurs à la soumission
- Prénom invalide : localStorage error_firstName
- Nom invalide : localStorage error_lastName  
- Email invalide : localStorage error_email
- Date manquante : localStorage error_birth
- Date future : localStorage error_birth
- Code postal invalide : localStorage error_postalCode
- Ville invalide : localStorage error_city

