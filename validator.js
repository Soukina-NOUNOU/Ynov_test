/**
 * Validate a birthdate and return either null or an error object.
 * @param {Date} birth The birth date to validate.
 * @returns {Object|null} An error object if the birthdate is invalid, or null if it is valid.
 */

export function validateAge(birth) {
    if(!(birth instanceof Date)) {
        throw new Error('Not valid birth date')
    }
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