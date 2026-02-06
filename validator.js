/**
 * Validate a birthdate and return either null or an error object.
 * @param {Date} birth The birth date to validate.
 * @returns {Object|null} An error object if the birthdate is invalid, or null if it is valid.
 */

export function validateAge(birth) {
    // Check if birth is a Date conform
    if(!(birth instanceof Date)) {
        const error = new Error('Not valid birth date');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'Not valid birth date';
        throw error;
    }
    
    // Check if birth is a valid date
    if(isNaN(birth.getTime())) {
        const error = new Error('This date is impossible');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'This date is impossible';
        throw error;
    }

    const now = new Date();
    //Check if birth is in the future
    if(birth > now) {
        const error = new Error('It is impossible to be born in the future');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'It is impossible to be born in the future';
        throw error;
    }

    const differents = new Date(now - birth);
    const age = Math.abs(differents.getUTCFullYear() - 1970);
    // Check if birth is too far in the past
    if(age < 18) {
        const error = new Error('User must be at least 18 years old');
        error.code = 'AGE_TOO_YOUNG';
        error.message = 'User must be at least 18 years old';
        throw error;
    }
    
    // If everything is valid, return null
    return null;
}

/**
 * Validate a French postal code
 * @param {string} postalCode The postal code to validate.
 * @returns {Object|null} An error object if the postal code is invalid, or null if it is valid.
 */
export function validatePostalCode(postalCode) {
    const postalCodeRegex = /^\d{5}$/;
    if(!postalCodeRegex.test(postalCode)) {
        throw new Error('Not valid postal code')
    }
}

/**
 * Validate first name and last name
 * @param {Object} {firstName, lastName} The first and last name.
 * @returns {Object|null} An error object if the first name or last name is invalid, or null if they are valid.
 */
export function validateName({firstName, lastName}) {
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿœŒÆæ\s-]+$/;
    if(!nameRegex.test(firstName)) {
        throw new Error('Not valid first name')
    }
    if(!nameRegex.test(lastName)) {
        throw new Error('Not valid last name')
    }
}

/**
 * Validate an email address
 * @param {string} email The email address to validate.
 * @returns {Object|null} An error object if the email address is invalid, or null if it is valid.
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        throw new Error('Not valid email address')
    }
}