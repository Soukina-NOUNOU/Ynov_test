import { validateAge } from './validator.js';
import { validatePostalCode } from './validator.js';
import { validateIdentity } from './validator.js';
import { validateEmail } from './validator.js';


describe('validateAge', () => {
    it('should return null for a valid adult birth date', () => {
        const now = new Date();
        const birth = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
        expect(validateAge(birth)).toBeNull();
    })

    it('soould return an error object if user is under 18', () => {
        const now = new Date();
        const birth = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
        expect(() => validateAge(birth)).toThrow({
            code : 'AGE_TOO_YOUNG',
            message : 'User must be at least 18 years old'
        })
    })

    it("should return an error object if birth is not a Date", () => {
        expect(() => validateAge("xxxxxx")).toThrow({
            code : 'INVALID_BIRTH_DATE',
            message : 'Not valid birth date'
        })
    })

    it("should return an error object if birthDate is invalid or impossible", () => {
        expect(() => validateAge(new Date('31/02/1990'))).toThrow({
            code : 'INVALID_BIRTH_DATE',
            message : 'This date is impossible'
        })
    })

    it("should return an error object if birthDate is in the future", () => {
        expect(() => validateAge(new Date(Date.now() + 100000))).toThrow({
            code : 'INVALID_BIRTH_DATE',
            message : 'It is impossible to be born in the future'
        })
    })
})


describe("validatePostalCode", () => {
  it("soould return null for a valid French postal code", () => {
    expect(validatePostalCode("34000")).toBeNull();
  });

  it("should return error if postal code is not 5 digits", () => {
    expect(validatePostalCode("3400")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Postal code must be exactly 5 digits.",
    });
    expect(validatePostalCode("340000")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Postal code must be exactly 5 digits.",
    });
  });

  it("should return error if postal code contains non-digit characters", () => {
    expect(validatePostalCode("34A00")).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Postal code must be exactly 5 digits.",
    });
  });

  it("shoould return error if postal code is not a string", () => {
    
    expect(validatePostalCode(12345)).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Postal code must be exactly 5 digits.",
    });

    expect(validatePostalCode(null)).toEqual({
      code: "INVALID_POSTAL_CODE",
      message: "Postal code must be exactly 5 digits.",
    });

  });
});


describe("validateIdentity", () => {

  it("should return null for a valid name", () => {
    expect(validateIdentity("Jean Dupont")).toBeNull();
    expect(validateIdentity("Anne-Marie")).toBeNull();
    expect(validateIdentity("Éloïse")).toBeNull();
  });

  it("should return error if name contains digits", () => {
    expect(validateIdentity("Jean2")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Name must not contain digits or invalid characters.",
    });
  });

  it("should return error if name contains disallowed special characters", () => {
    expect(validateIdentity("Jean@Dupont")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Name must not contain digits or invalid characters.",
    });
  });

  it("should return error if name contains potential XSS", () => {

    expect(validateIdentity("<script>alert('xss')</script>")).toEqual({
      code: "XSS_DETECTED",
      message: "Potential XSS content detected in name.",
    });
  });

  it("should return error if name is not a string or is empty", () => {
    
    expect(validateIdentity(12345)).toEqual({
      code: "INVALID_IDENTITY",
      message: "Name must not contain digits or invalid characters.",
    });

    expect(validateIdentity("")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Name must not contain digits or invalid characters.",
    });

    expect(validateIdentity("   ")).toEqual({
      code: "INVALID_IDENTITY",
      message: "Name must not contain digits or invalid characters.",
    
    });

 });
 
});


describe("validateEmail", () => {

  it("should return null for a valid email", () => {
    expect(validateEmail("test@example.com")).toBeNull();
    expect(validateEmail("test.user+test@sub.domain.fr")).toBeNull();
  });

  it("should return error for invalid email formats", () => {

    expect(validateEmail("invalid-email")).toEqual({
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });

    expect(validateEmail("test@")).toEqual({
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });

    expect(validateEmail("@fakedomaine.com")).toEqual({
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });

  });

  it("should return error if email is not a string", () => {
    expect(validateEmail(12345)).toEqual({
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });
    expect(validateEmail(null)).toEqual({
      code: "INVALID_EMAIL",
      message: "Email must be a valid email address.",
    });
  });

});