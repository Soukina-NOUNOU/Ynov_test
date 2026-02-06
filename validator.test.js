import { validateAge } from './validator.js';

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