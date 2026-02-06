/**
 * Calculate a person's age in years.
 * 
 * @param {*} p An object representing a person, implemening a birth Date parameter.
 * @returns {number} The age of the p.
 */

export default function calculateAge(p) {
    if(!p) {
        throw new Error("missing param p")
    }

    if(typeof p !== "object") {
        throw new Error("format is not correct")
    }

    if(!p.birth) {
        throw new Error("birth property is missing")
    }

    if(!(p.birth instanceof Date)) {
        throw new Error('Not valid birth date')
    }

    if(isNaN(p.birth.getTime())) {
        throw new Error('This date is impossible')
    }

    if(p.birth.getTime() > Date.now()) {
        throw new Error('It is impossible to be born in the future')
    }

    if(p.birth.getTime() < new Date('01/01/1970').getTime()) {
        throw new Error('This date is too far in the past')
    }

    let dateDiff = new Date(Date.now() - p.birth.getTime())
    let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
    return age;

}