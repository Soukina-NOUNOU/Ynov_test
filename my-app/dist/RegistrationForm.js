"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RegistrationForm;
var _react = require("react");
var _validator = require("./validator");
var _module = _interopRequireDefault(require("./module"));
require("./RegistrationForm.css");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function RegistrationForm(_ref) {
  let {
    onRegistrationSuccess
  } = _ref;
  const [form, setForm] = (0, _react.useState)({
    firstName: "",
    lastName: "",
    email: "",
    birth: "",
    city: "",
    postalCode: ""
  });
  const [errors, setErrors] = (0, _react.useState)({});
  const [showToaster, setShowToaster] = (0, _react.useState)(false);
  const [isAutoSaved, setIsAutoSaved] = (0, _react.useState)(false);

  // Auto-save and restore functionality
  (0, _react.useEffect)(() => {
    // Restore form data from localStorage on component mount
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
  const autoSaveForm = formData => {
    localStorage.setItem("registrationForm_draft", JSON.stringify(formData));
    setIsAutoSaved(true);

    // Clear the auto-saved indicator after 2 seconds
    setTimeout(() => {
      setIsAutoSaved(false);
    }, 2000);
  };
  const clearAutoSavedData = () => {
    localStorage.removeItem("registrationForm_draft");
    setIsAutoSaved(false);
  };

  // Real-time validation for a specific field
  const validateField = (name, value) => {
    let error = null;

    // eslint-disable-next-line default-case
    switch (name) {
      case "firstName":
      case "lastName":
        const identityError = (0, _validator.validateIdentity)(value);
        if (identityError) error = identityError.message;
        break;
      case "email":
        const emailError = (0, _validator.validateEmail)(value);
        if (emailError) error = emailError.message;
        break;
      case "birth":
        if (!value) {
          error = "La date de naissance est obligatoire";
        } else {
          try {
            (0, _module.default)({
              birth: new Date(value)
            });
          } catch (err) {
            error = err.message;
          }
        }
        break;
      case "postalCode":
        const postalError = (0, _validator.validatePostalCode)(value);
        if (postalError) error = postalError.message;
        break;
      case "city":
        const cityError = (0, _validator.validateIdentity)(value);
        if (cityError) error = cityError.message;
        break;
    }
    return error;
  };

  // Check if the form is valid
  const isFormValid = () => {
    const hasAllFields = form.firstName && form.lastName && form.email && form.birth && form.city && form.postalCode;
    const hasNoErrors = Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
    return hasAllFields && hasNoErrors;
  };
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    const updatedForm = _objectSpread(_objectSpread({}, form), {}, {
      [name]: value
    });
    setForm(updatedForm);

    // Auto-save the form data
    autoSaveForm(updatedForm);

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => _objectSpread(_objectSpread({}, prev), {}, {
      [name]: error
    }));

    // Clean up localStorage for the specific field error
    if (error) {
      localStorage.setItem("error_".concat(name), error);
    } else {
      localStorage.removeItem("error_".concat(name));
    }
  };
  const handleBlur = e => {
    const {
      name,
      value
    } = e.target;
    // Full validation on focus out
    const error = validateField(name, value);
    setErrors(prev => _objectSpread(_objectSpread({}, prev), {}, {
      [name]: error
    }));
    if (error) {
      localStorage.setItem("error_".concat(name), error);
    } else {
      localStorage.removeItem("error_".concat(name));
    }
  };
  const validateForm = () => {
    const newErrors = {};

    // Validate firstname
    const firstNameError = (0, _validator.validateIdentity)(form.firstName);
    if (firstNameError) {
      newErrors.firstName = firstNameError.message;
      localStorage.setItem("error_firstName", firstNameError.message);
    }

    // Validate lastname
    const lastNameError = (0, _validator.validateIdentity)(form.lastName);
    if (lastNameError) {
      newErrors.lastName = lastNameError.message;
      localStorage.setItem("error_lastName", lastNameError.message);
    }

    // Validate email
    const emailError = (0, _validator.validateEmail)(form.email);
    if (emailError) {
      newErrors.email = emailError.message;
      localStorage.setItem("error_email", emailError.message);
    }

    // Validate birthdate
    if (!form.birth) {
      newErrors.birth = "La date de naissance est obligatoire";
      localStorage.setItem("error_birth", "La date de naissance est obligatoire");
    } else {
      try {
        (0, _module.default)({
          birth: new Date(form.birth)
        });
      } catch (err) {
        newErrors.birth = err.message;
        localStorage.setItem("error_birth", err.message);
      }
    }

    // Validate postal code
    const postalCodeError = (0, _validator.validatePostalCode)(form.postalCode);
    if (postalCodeError) {
      newErrors.postalCode = postalCodeError.message;
      localStorage.setItem("error_postalCode", postalCodeError.message);
    } else {
      // Clear any existing postal code errors when validation passes
      localStorage.removeItem("error_postalCode");
    }

    // Validate city
    const cityError = (0, _validator.validateIdentity)(form.city);
    if (cityError) {
      newErrors.city = cityError.message;
      localStorage.setItem("error_city", cityError.message);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create user object in jsonplaceholder format
    const newUser = {
      name: "".concat(form.firstName, " ").concat(form.lastName),
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

    // Use callback function to send user to API
    if (onRegistrationSuccess) {
      try {
        const result = await onRegistrationSuccess(newUser);

        // Only show success toaster if operation was successful
        if (result && result.success !== false) {
          setShowToaster(true);

          // Hide the toaster after 3 seconds
          setTimeout(() => {
            setShowToaster(false);
          }, 3000);

          // Clear the form only on success
          setForm({
            firstName: "",
            lastName: "",
            email: "",
            birth: "",
            city: "",
            postalCode: ""
          });
          setErrors({});

          // Clear localStorage errors
          ['error_firstName', 'error_lastName', 'error_email', 'error_birth', 'error_city', 'error_postalCode'].forEach(key => localStorage.removeItem(key));

          // Clear auto-saved form data
          clearAutoSavedData();
        }
        // If result.success === false, error was already shown by UserContext alert
      } catch (error) {
        console.error('Unexpected error during registration:', error);
      }
    } else {
      // Fallback behavior if no callback provided
      setShowToaster(true);

      // Hide the toaster after 3 seconds
      setTimeout(() => {
        setShowToaster(false);
      }, 3000);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        birth: "",
        city: "",
        postalCode: ""
      });
      setErrors({});

      // Clear localStorage errors
      ['error_firstName', 'error_lastName', 'error_email', 'error_birth', 'error_city', 'error_postalCode'].forEach(key => localStorage.removeItem(key));
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [isAutoSaved && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "toaster info",
      style: {
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        border: '1px solid #90caf9'
      },
      children: "\uD83D\uDCBE Brouillon sauvegard\xE9 automatiquement"
    }), showToaster && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "toaster success",
      children: "Utilisateur enregistr\xE9 avec succ\xE8s !"
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
      className: "registration-form",
      onSubmit: handleSubmit,
      "data-testid": "registration-form",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: "Inscription"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "firstName",
        children: "Pr\xE9nom"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "firstName",
        name: "firstName",
        value: form.firstName,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.firstName ? "error-input" : ""
      }), errors.firstName && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.firstName
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "lastName",
        children: "Nom"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "lastName",
        name: "lastName",
        value: form.lastName,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.lastName ? "error-input" : ""
      }), errors.lastName && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.lastName
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "email",
        children: "Email"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "email",
        name: "email",
        type: "email",
        value: form.email,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.email ? "error-input" : ""
      }), errors.email && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.email
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "birth",
        children: "Date de naissance"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "birth",
        type: "date",
        name: "birth",
        value: form.birth,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.birth ? "error-input" : ""
      }), errors.birth && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.birth
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "city",
        children: "Ville"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "city",
        name: "city",
        value: form.city,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.city ? "error-input" : ""
      }), errors.city && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.city
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
        htmlFor: "postalCode",
        children: "Code postal"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        id: "postalCode",
        name: "postalCode",
        value: form.postalCode,
        onChange: handleChange,
        onBlur: handleBlur,
        className: errors.postalCode ? "error-input" : ""
      }), errors.postalCode && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "error",
        children: errors.postalCode
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "submit",
        disabled: !isFormValid(),
        className: !isFormValid() ? "disabled" : "",
        children: "S'enregistrer"
      }), localStorage.getItem("registrationForm_draft") && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        onClick: () => {
          clearAutoSavedData();
          setForm({
            firstName: "",
            lastName: "",
            email: "",
            birth: "",
            city: "",
            postalCode: ""
          });
          setErrors({});
        },
        style: {
          marginTop: "10px",
          backgroundColor: "#f5f5f5",
          color: "#666",
          border: "1px solid #ddd",
          padding: "8px 16px",
          fontSize: "14px"
        },
        children: "\uD83D\uDDD1\uFE0F Vider le brouillon"
      })]
    })]
  });
}