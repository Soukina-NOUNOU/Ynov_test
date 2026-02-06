/**
 * Calculate a person's age in years.
 * 
 * @param {*} p An object representing a person, implemening a birth Date parameter.
 * @returns {number} The age of the p.
 */

export default function calculateAge(p) {
    if(!p) {
        const error = new Error("missing param p");
        error.code = 'MISSING_PARAM';
        throw error;
    }

    if(typeof p !== "object") {
        const error = new Error("format is not correct");
        error.code = 'INVALID_FORMAT';
        throw error;
    }

    if(!p.birth) {
        const error = new Error("birth property is missing");
        error.code = 'MISSING_BIRTH_PROPERTY';
        throw error;
    }

    if(!(p.birth instanceof Date)) {
        const error = new Error('Not valid birth date');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'Not valid birth date';
        throw error;
    }

    if(isNaN(p.birth.getTime())) {
        const error = new Error('This date is impossible');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'This date is impossible';
        throw error;
    }

    if(p.birth.getTime() > Date.now()) {
        const error = new Error('It is impossible to be born in the future');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'It is impossible to be born in the future';
        throw error;
    }

    if(p.birth.getTime() < new Date('01/01/1970').getTime()) {
        const error = new Error('This date is too far in the past');
        error.code = 'INVALID_BIRTH_DATE';
        error.message = 'This date is too far in the past';
        throw error;
    }

    let dateDiff = new Date(Date.now() - p.birth.getTime())
    let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
    
    // Ajouter la vérification d'âge minimum si nécessaire
    if(age < 18) {
        const error = new Error('User must be at least 18 years old');
        error.code = 'AGE_TOO_YOUNG';
        error.message = 'User must be at least 18 years old';
        throw error;
    }
    
    return age;
}