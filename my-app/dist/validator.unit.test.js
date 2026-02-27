"use strict";

var _module = _interopRequireDefault(require("./module.js"));
var _validator = require("./validator.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
describe('calculateAge', () => {
  it('should return a valid age for adult', () => {
    const now = new Date();
    const birth = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
    expect((0, _module.default)({
      birth: birth
    })).toBeGreaterThanOrEqual(18);
  });
  it('sould throw error if user is under 18', () => {
    const now = new Date();
    const birth = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
    expect(() => (0, _module.default)({
      birth: birth
    })).toThrow({
      code: 'AGE_TOO_YOUNG',
      message: 'L\'utilisateur doit avoir au moins 18 ans'
    });
  });
  it("should throw error if birth is not a Date", () => {
    expect(() => (0, _module.default)({
      birth: "xxxxxx"
    })).toThrow({
      code: 'INVALID_BIRTH_DATE',
      message: 'Not valid birth date'
    });
  });
  it("should throw error if birthDate is invalid or impossible", () => {
    expect(() => (0, _module.default)({
      birth: new Date('31/02/1990')
    })).toThrow({
      code: 'INVALID_BIRTH_DATE',
      message: 'This date is impossible'
    });
  });
  it("should throw error if birthDate is in the future", () => {
    expect(() => (0, _module.default)({
      birth: new Date(Date.now() + 100000)
    })).toThrow({
      code: 'INVALID_BIRTH_DATE',
      message: 'Il est impossible de renseigner une date de naissance dans le futur'
    });
  });

  // Tests edge cases spécifiques
  it("should handle leap year dates correctly", () => {
    const person = {
      birth: new Date('2000-02-29')
    };
    expect((0, _module.default)(person)).toBeGreaterThan(18);
  });
  it("should throw error for null birth property", () => {
    expect(() => (0, _module.default)({
      birth: null
    })).toThrow({
      code: 'INVALID_BIRTH_DATE',
      message: 'Not valid birth date'
    });
  });
  it("should throw error for undefined birth property", () => {
    expect(() => (0, _module.default)({
      birth: undefined
    })).toThrow({
      code: 'INVALID_BIRTH_DATE',
      message: 'Not valid birth date'
    });
  });
});
describe("validatePostalCode", () => {
  it("soould return null for a valid French postal code", () => {
    expect((0, _validator.validatePostalCode)("34000-1234")).toBeNull();
  });
  it("should return error if postal code is not in correct format", () => {
    expect((0, _validator.validatePostalCode)("3400")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
    expect((0, _validator.validatePostalCode)("340000")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
    expect((0, _validator.validatePostalCode)("34000")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
  });
  it("should return error if postal code contains non-digit characters", () => {
    expect((0, _validator.validatePostalCode)("34A00-1234")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
  });
  it("shoould return error if postal code is not a string", () => {
    expect((0, _validator.validatePostalCode)(12345)).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
    expect((0, _validator.validatePostalCode)(null)).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789)."
    });
  });
});
describe("validateIdentity", () => {
  it("should return null for a valid name", () => {
    expect((0, _validator.validateIdentity)("Jean Dupont")).toBeNull();
    expect((0, _validator.validateIdentity)("Anne-Marie")).toBeNull();
    expect((0, _validator.validateIdentity)("Éloïse")).toBeNull();
  });
  it("should return error if name is too short", () => {
    expect((0, _validator.validateIdentity)("A")).toEqual({
      code: "INVALID_LENGTH",
      message: "Le prénom doit contenir au moins 2 caractères"
    });
    expect((0, _validator.validateIdentity)("")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom et prénom sont obligatoires et ne peuvent pas être vides."
    });
  });
  it("should return error if name contains digits", () => {
    expect((0, _validator.validateIdentity)("Jean2")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes."
    });
  });
  it("should return error if name contains disallowed special characters", () => {
    expect((0, _validator.validateIdentity)("Jean@Dupont")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes."
    });
  });
  it("should return error if name contains potential XSS", () => {
    expect((0, _validator.validateIdentity)("<script>alert('xss')</script>")).toEqual({
      code: "XSS_DETECTED",
      message: "Le nom contient des caractères dangereux non autorisés."
    });
  });
  it("should return error if name is not a string or is empty", () => {
    expect((0, _validator.validateIdentity)(12345)).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom et prénom sont obligatoires et ne peuvent pas être vides."
    });
    expect((0, _validator.validateIdentity)("")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom et prénom sont obligatoires et ne peuvent pas être vides."
    });
    expect((0, _validator.validateIdentity)("   ")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Le nom et prénom sont obligatoires et ne peuvent pas être vides."
    });
  });
  it("should handle various XSS attack vectors", () => {
    expect((0, _validator.validateIdentity)("<img src=x onerror=alert('xss')>")).toEqual({
      code: "XSS_DETECTED",
      message: "Le nom contient des caractères dangereux non autorisés."
    });
    expect((0, _validator.validateIdentity)("<span>not allowed</span>")).toEqual({
      code: "XSS_DETECTED",
      message: "Le nom contient des caractères dangereux non autorisés."
    });
  });
  it("should handle edge case names with accents and special characters", () => {
    expect((0, _validator.validateIdentity)("Jean-Marie García")).toBeNull();
    expect((0, _validator.validateIdentity)("O'Macfly")).toBeNull();
  });
});
describe("validateEmail", () => {
  it("should return null for a valid email", () => {
    expect((0, _validator.validateEmail)("test@example.com")).toBeNull();
    expect((0, _validator.validateEmail)("test.user+test@sub.domain.fr")).toBeNull();
  });
  it("should return error for invalid email formats", () => {
    expect((0, _validator.validateEmail)("invalid-email")).toEqual({
      code: "INVALID_EMAIL",
      message: "Veuillez saisir une adresse email valide (test@test.com)."
    });
    expect((0, _validator.validateEmail)("test@")).toEqual({
      code: "INVALID_EMAIL",
      message: "Veuillez saisir une adresse email valide (test@test.com)."
    });
    expect((0, _validator.validateEmail)("@fakedomaine.com")).toEqual({
      code: "INVALID_EMAIL",
      message: "Veuillez saisir une adresse email valide (test@test.com)."
    });
  });
  it("should return error if email is not a string", () => {
    expect((0, _validator.validateEmail)(12345)).toEqual({
      code: "INVALID_EMAIL",
      message: "L'email doit être une adresse email valide."
    });
    expect((0, _validator.validateEmail)(null)).toEqual({
      code: "INVALID_EMAIL",
      message: "L'email doit être une adresse email valide."
    });
  });
});