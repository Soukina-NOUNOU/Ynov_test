import { useState, useEffect } from "react";
import {
  validatePostalCode,
  validateIdentity,
  validateEmail,
} from "./validator";
import calculateAge from "./module";
import "./RegistrationForm.css";

export default function RegistrationForm({ onRegistrationSuccess }) {
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
  const [isAutoSaved, setIsAutoSaved] = useState(false);

  useEffect(() => {
    const savedFormData = localStorage.getItem("registrationForm_draft");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setForm(parsedData);
        setIsAutoSaved(true);
      } catch (error) {
        console.warn("Failed to restore form data from localStorage");
      }
    }
  }, []);

  const autoSaveForm = (formData) => {
    localStorage.setItem("registrationForm_draft", JSON.stringify(formData));
    setIsAutoSaved(true);
    
    setTimeout(() => {
      setIsAutoSaved(false);
    }, 2000);
  };

  const clearAutoSavedData = () => {
    localStorage.removeItem("registrationForm_draft");
    setIsAutoSaved(false);
  };

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
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    autoSaveForm(updatedForm);

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (error) {
      localStorage.setItem(`error_${name}`, error);
    } else {
      localStorage.removeItem(`error_${name}`);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
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

    const firstNameError = validateIdentity(form.firstName);
    if (firstNameError) {
      newErrors.firstName = firstNameError.message;
      localStorage.setItem("error_firstName", firstNameError.message);
    }

    const lastNameError = validateIdentity(form.lastName);
    if (lastNameError) {
      newErrors.lastName = lastNameError.message;
      localStorage.setItem("error_lastName", lastNameError.message);
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      newErrors.email = emailError.message;
      localStorage.setItem("error_email", emailError.message);
    }

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

    const postalCodeError = validatePostalCode(form.postalCode);
    if (postalCodeError) {
      newErrors.postalCode = postalCodeError.message;
      localStorage.setItem("error_postalCode", postalCodeError.message);
    } else {
      localStorage.removeItem("error_postalCode");
    }

    const cityError = validateIdentity(form.city);
    if (cityError) {
      newErrors.city = cityError.message;
      localStorage.setItem("error_city", cityError.message);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newUser = {
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      address: {
        city: form.city,
        zipcode: form.postalCode
      },
      firstName: form.firstName,
      lastName: form.lastName,
      birth: form.birth,
      city: form.city,
      postalCode: form.postalCode
    };
    
    const registrationPayload = {
      userData: newUser,
      metadata: {
        hasAutoSavedData: localStorage.getItem("registrationForm_draft") !== null,
        submissionTimestamp: new Date().toISOString(),
        formVersion: "2.0.0",
        autoSaveEnabled: true
      }
    };
    
    if (onRegistrationSuccess) {
      try {
        const result = await onRegistrationSuccess(registrationPayload);
        
        if (result && result.success !== false) {
          setShowToaster(true);
          
          setTimeout(() => {
            setShowToaster(false);
          }, 3000);
          
          setForm({
            firstName: "",
            lastName: "",
            email: "",
            birth: "",
            city: "",
            postalCode: "",
          });
          setErrors({});
          
          ['error_firstName', 'error_lastName', 'error_email', 'error_birth', 'error_city', 'error_postalCode']
            .forEach(key => localStorage.removeItem(key));
          
          clearAutoSavedData();
        }
      } catch (error) {
        console.error('Unexpected error during registration:', error);
      }
    } else {
      setShowToaster(true);
      
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
      
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        birth: "",
        city: "",
        postalCode: "",
      });
      setErrors({});
      ['error_firstName', 'error_lastName', 'error_email', 'error_birth', 'error_city', 'error_postalCode']
        .forEach(key => localStorage.removeItem(key));
    }
  };

  return (
    <>
      {isAutoSaved && (
        <div className="toaster info" style={{backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9'}}>
          💾 Brouillon sauvegardé automatiquement
        </div>
      )}

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
          maxLength={5}
          pattern="[0-9]{5}"
          placeholder="30000"
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
        
        {/* Clear draft button */}
        {localStorage.getItem("registrationForm_draft") && (
          <button
            type="button"
            onClick={() => {
              clearAutoSavedData();
              setForm({
                firstName: "",
                lastName: "",
                email: "",
                birth: "",
                city: "",
                postalCode: "",
              });
              setErrors({});
            }}
            style={{
              marginTop: "10px",
              backgroundColor: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              padding: "8px 16px",
              fontSize: "14px"
            }}
          >
            🗑️ Vider le brouillon
          </button>
        )}
      </form>
    </>
  );
}
