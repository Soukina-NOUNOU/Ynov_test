import { useState } from "react";
import {
  validatePostalCode,
  validateIdentity,
  validateEmail,
} from "./validator";
import calculateAge from "./module";
import "./RegistrationForm.css";

export default function RegistrationForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({});
  const [showToaster, setShowToaster] = useState(false);

  // Real-time validation for a specific field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "firstName":
      case "lastName":
        const identityError = validateIdentity(value);
        if (identityError) error = identityError.message;
        break;
    }

    return error;
  };

  // Check if the form is valid
  const isFormValid = () => {
    const hasAllFields =
      form.firstName && form.lastName
    const hasNoErrors =
      Object.keys(errors).length === 0 || Object.values(errors).every((error) => !error);
    return hasAllFields && hasNoErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    // Clean up localStorage for the specific field error
    if (error) {
      localStorage.setItem(`error_${name}`, error);
    } else {
      localStorage.removeItem(`error_${name}`);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Full validation on focus out
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (error) {
      localStorage.setItem(`error_${name}`, error);
    } else {
      localStorage.removeItem(`error_${name}`);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate firstname
    const firstNameError = validateIdentity(form.firstName);
    if (firstNameError) {
      newErrors.firstName = firstNameError.message;
      localStorage.setItem("error_firstName", firstNameError.message);
    }

    // Validate lastname
    const lastNameError = validateIdentity(form.lastName);
    if (lastNameError) {
      newErrors.lastName = lastNameError.message;
      localStorage.setItem("error_lastName", lastNameError.message);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Save and display success message
    localStorage.setItem("user", JSON.stringify(form));

    // Display toaster
    setShowToaster(true);

    // Clear the form
    setForm({
      firstName: "",
      lastName: "",
    });
    setErrors({});

    // Clean up localStorage for errors
    Object.keys(form).forEach((key) => {
      localStorage.removeItem(`error_${key}`);
    });

    // Hide the toaster after 3 seconds
    setTimeout(() => {
      setShowToaster(false);
    }, 3000);
  };

  return (
    <>
      {/* Success toaster */}
      {showToaster && (
        <div className="toaster success">
          Utilisateur enregistré avec succès !
        </div>
      )}

      <form
        className="registration-form"
        onSubmit={handleSubmit}
        data-testid="registration-form"
      >
        <h2>Inscription</h2>

        <label htmlFor="firstName">Prénom</label>
        <input
          id="firstName"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.firstName ? "error-input" : ""}
        />
        {errors.firstName && <p className="error">{errors.firstName}</p>}

        <label htmlFor="lastName">Nom</label>
        <input
          id="lastName"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.lastName ? "error-input" : ""}
        />
        {errors.lastName && <p className="error">{errors.lastName}</p>}

        <button
          type="submit"
          disabled={!isFormValid()}
          className={!isFormValid() ? "disabled" : ""}
        >
          S'enregistrer
        </button>
      </form>
    </>
  );
}
