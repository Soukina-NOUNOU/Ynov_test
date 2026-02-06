/**
 * Calculate a person's age in years.
 * 
 * @param {*} p An object representing a person, implemening a birth Date parameter.
 * @returns {number} The age of the p.
 */

function calculateAge(p) {
    let dateDiff = new Date(Date.now() - p.birth.getTime());
    let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
    return age;
}