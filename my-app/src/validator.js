/**
 * Validate a French postal code
 * @param {string} postalCode The postal code to validate.
 * @returns {Object|null} An error object if the postal code is invalid, or null if it is valid.
 */
export function validatePostalCode(postalCode) {
    // Check if postal code is a string
    if (typeof postalCode !== "string") {
      return {
        code: "INVALID_POSTAL_CODE",
        message: "Le code postal doit être composé de 5 chiffres exactement.",
      };
    }
    const regex = /^[0-9]{5}$/;
    // Check if postal code is exactly 5 digits
    if (!regex.test(postalCode)) {
      return {
        code: "INVALID_POSTAL_CODE",
        message: "Le code postal doit être composé de 5 chiffres exactement.",
      };
    }
    return null;
}

/**
 * Validate first name and last name
 * @param {string} name The name to validate.
 * @returns {Object|null} An error object if the first name or last name is invalid, or null if they are valid.
 */
export function validateIdentity(name) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return {
        code: "INVALID_IDENTITY",
        message: "Le nom et prénom sont obligatoires et ne peuvent pas être vides.",
      };
    }

    // Simple XSS detection: check for common XSS attack vectors
    const lowerName = name.toLowerCase();
    if (lowerName.includes("<script") || lowerName.includes("</script>") || /<[^>]+>/.test(name)) {
        return {
            code: "XSS_DETECTED",
            message: "Le nom contient des caractères dangereux non autorisés.",
        };
    }

    //Allow letters, spaces, hyphens and apostrophes
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-']+$/;
    if (!regex.test(name)) {
      return {
        code: "INVALID_IDENTITY",
        message: "Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.",
      };
    }

    return null;
}

/**
 * Validate an email address
 * @param {string} email The email address to validate.
 * @returns {Object|null} An error object if the email address is invalid, or null if it is valid.
 */
export function validateEmail(email) {
    // Check if email is a string
    if (typeof email !== "string") {
      return {
        code: "INVALID_EMAIL",
        message: "L'email doit être une adresse email valide.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if email is in a valid format
    if (!emailRegex.test(email)) {
      return {
        code: "INVALID_EMAIL",
        message: "Veuillez saisir une adresse email valide (test@test.com).",
      };
    }

    return null;
}