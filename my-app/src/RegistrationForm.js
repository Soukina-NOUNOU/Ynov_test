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
    email: "",
    birth: "",
    city: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showToaster, setShowToaster] = useState(false);

  // Real-time validation for a specific field
  const validateField = (name, value) => {
    let error = null;

    // eslint-disable-next-line default-case
    switch (name) {
      case "firstName":
      case "lastName":
        const identityError = validateIdentity(value);
        if (identityError) error = identityError.message;
        break;
      case "email":
        const emailError = validateEmail(value);
        if (emailError) error = emailError.message;
        break;
      case "birth":
        if (!value) {
          error = "La date de naissance est obligatoire";
        } else {
          try {
            calculateAge({ birth: new Date(value) });
          } catch (err) {
            error = err.message;
          }
        }
        break;
      case "postalCode":
        const postalError = validatePostalCode(value);
        if (postalError) error = postalError.message;
        break;
      case "city":
        const cityError = validateIdentity(value);
        if (cityError) error = cityError.message;
        break;
    }

    return error;
  };

  // Check if the form is valid
  const isFormValid = () => {
    const hasAllFields =
      form.firstName &&
      form.lastName &&
      form.email &&
      form.birth &&
      form.city &&
      form.postalCode;
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

    // Validate email
    const emailError = validateEmail(form.email);
    if (emailError) {
      newErrors.email = emailError.message;
      localStorage.setItem("error_email", emailError.message);
    }

    // Validate birthdate
    if (!form.birth) {
      newErrors.birth = "La date de naissance est obligatoire";
      localStorage.setItem(
        "error_birth",
        "La date de naissance est obligatoire",
      );
    } else {
      try {
        calculateAge({ birth: new Date(form.birth) });
      } catch (err) {
        newErrors.birth = err.message;
        localStorage.setItem("error_birth", err.message);
      }
    }

    // Validate postal code
    const postalCodeError = validatePostalCode(form.postalCode);
    if (postalCodeError) {
      newErrors.postalCode = postalCodeError.message;
      localStorage.setItem("error_postalCode", postalCodeError.message);
    }

    // Validate city
    const cityError = validateIdentity(form.city);
    if (cityError) {
      newErrors.city = cityError.message;
      localStorage.setItem("error_city", cityError.message);
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
      email: "",
      birth: "",
      city: "",
      postalCode: "",
    });
    setErrors({});

    // Clear localStorage errors
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

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? "error-input" : ""}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label htmlFor="birth">Date de naissance</label>
        <input
          id="birth"
          type="date"
          name="birth"
          value={form.birth}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.birth ? "error-input" : ""}
        />
        {errors.birth && <p className="error">{errors.birth}</p>}

        <label htmlFor="city">Ville</label>
        <input
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.city ? "error-input" : ""}
        />
        {errors.city && <p className="error">{errors.city}</p>}

        <label htmlFor="postalCode">Code postal</label>
        <input
          id="postalCode"
          name="postalCode"
          value={form.postalCode}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.postalCode ? "error-input" : ""}
        />
        {errors.postalCode && <p className="error">{errors.postalCode}</p>}

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
