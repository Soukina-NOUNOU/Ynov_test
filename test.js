import calculateAge from './module';
/**
 * @function calculateAge
 */

let people20years;
beforeEach(() => {
    let date = new Date();
    people20years = {
        birth: new Date(date.setFullYear(date.getFullYear() - 20))
    };
})

describe('calculateAge Unit Test Suites', () => {
    it('should return  a correct age', () => {
        const loise = {
            birth: new Date('08/19/1993')
        }
        expect(calculateAge(loise)).toBe(32);
    });

    it('should throw a "missing param p" error', () => {
        expect(() => calculateAge()).toThrow("missing param p")
    })

    it('should throws if parameter is not an object', () => {
        expect(() => calculateAge("hello")).toThrow("format is not correct")
    })

    it('should throws if parameter does not have a birth property', () => {
        expect(() => calculateAge({})).toThrow("birth property is missing")
    })

    it('should throws if birth is not a Date or invalide date', () => {
        expect(() => calculateAge({birth: 124578})).toThrow('Not valid birth date')
    })

    it('sould throws if birth is an impossible date', () => {
        expect(() => calculateAge({birth: new Date('31/02/1990')})).toThrow('This date is impossible')
    })

    it('should throws if birth is in the future', () => {
        expect(() => calculateAge({birth: new Date(Date.now() + 100000)})).toThrow('It is impossible to be born in the future')
    })

    it('sould throws if birth is too far in the past', () => {
        expect(() => calculateAge({birth: new Date('01/01/1800')})).toThrow('This date is too far in the past')
    })

    it('sould correctly calculates age regardless of the current date', () => {
        const loise = {
            birth: new Date('08/19/1993')
        }
        const realDateNow = Date.now;
        Date.now = () => new Date('08/19/2020').getTime();
        expect(calculateAge(loise)).toBe(27);
        Date.now = realDateNow;
    })

    it('should return a correct age', () => {
        expect(calculateAge(people20years)).toEqual(20)
    })

    // Test edge cases for leap years and date boundaries
    it('should handle leap year correctly (29 February)', () => {
        const user = {
            birth: new Date('2000-02-29') // Leap year
        }
        expect(calculateAge(user)).toBeGreaterThan(0);
    })

    it('should handle person born on leap day when current year is not leap year', () => {
        const dateNow = Date.now;
        Date.now = () => new Date('2023-03-01').getTime(); // 2023 is not a leap year
        expect(calculateAge({
            birth: new Date('2000-02-29')
        })).toBe(23);
        Date.now = dateNow;
    })

    it('should handle null object property', () => {
        expect(() => calculateAge({birth: null})).toThrow('Not valid birth date');
    })

    it('should handle undefined birth property in object', () => {
        expect(() => calculateAge({birth: undefined})).toThrow('Not valid birth date');
    })


});