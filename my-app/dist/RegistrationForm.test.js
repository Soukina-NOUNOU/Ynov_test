"use strict";

var _react = require("@testing-library/react");
var _userEvent = _interopRequireDefault(require("@testing-library/user-event"));
var _RegistrationForm = _interopRequireDefault(require("./RegistrationForm"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Mock axios
jest.mock('axios');
describe("RegistrationForm / complete integration", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  const fillValidForm = async () => {
    await _userEvent.default.type(_react.screen.getByLabelText("Prénom"), "Jone");
    await _userEvent.default.type(_react.screen.getByLabelText("Nom"), "Doe");
    await _userEvent.default.type(_react.screen.getByLabelText("Email"), "jone@test.com");
    await _userEvent.default.type(_react.screen.getByLabelText("Date de naissance"), "1990-08-19");
    await _userEvent.default.type(_react.screen.getByLabelText("Ville"), "Nîmes");
    await _userEvent.default.type(_react.screen.getByLabelText("Code postal"), "30000-1234");
  };
  test("Should display error for invalid date", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const birth = _react.screen.getByLabelText("Date de naissance");
    await _userEvent.default.type(birth, "2900-01-01"); // future date: calculateAge must throw
    await _userEvent.default.tab();
    expect(_react.screen.getByText("Il est impossible de renseigner une date de naissance dans le futur")).toBeInTheDocument();
  });
  test("Soould affiche une erreur pour un code postal invalide", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const postal = _react.screen.getByLabelText("Code postal");
    await _userEvent.default.type(postal, "abc");
    await _userEvent.default.tab();
    expect(_react.screen.getByText("Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789).")).toBeInTheDocument();
  });
  test("Should the toaster disappears after 3 seconds", async () => {
    jest.useFakeTimers();
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    await fillValidForm();
    await _userEvent.default.click(_react.screen.getByRole("button", {
      name: "S'enregistrer"
    }));
    const toaster = _react.screen.getByText("Utilisateur enregistré avec succès !");
    expect(toaster).toBeInTheDocument();
    (0, _react.act)(() => {
      jest.advanceTimersByTime(3000);
    });
    await (0, _react.waitFor)(() => {
      expect(toaster).not.toBeInTheDocument();
    });
    jest.useRealTimers();
  });
  test("Should save errors to localStorage when submitting with invalid first name", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));

    // Fill the form with an invalid first name
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "123"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "1990-08-19"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_firstName")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });
  test("Should save errors to localStorage when submitting with invalid last name", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "456"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "1990-08-19"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_lastName")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });
  test("Should save errors to localStorage when submitting with invalid email", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "nullnull"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "1990-08-19"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_email")).toBe("Veuillez saisir une adresse email valide (test@test.com).");
  });
  test("Should save errors to localStorage when submitting with missing birthdate", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    // Do not fill in the birthdate
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_birth")).toBe("La date de naissance est obligatoire");
  });
  test("Should save errors to localStorage when submitting with future birthdate", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "2050-10-10"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_birth")).toBe("Il est impossible de renseigner une date de naissance dans le futur");
  });
  test("Should save errors to localStorage when submitting with invalid postal code", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "1990-08-19"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "Nîmes"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "abc"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_postalCode")).toBe("Le code postal doit être composé de 5 chiffres, un tiret, puis 4 chiffres (ex: 12345-6789).");
  });
  test("Should save errors to localStorage when submitting with invalid city", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const form = _react.screen.getByTestId("registration-form");
    _react.fireEvent.change(_react.screen.getByLabelText("Prénom"), {
      target: {
        name: "firstName",
        value: "Jone"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Nom"), {
      target: {
        name: "lastName",
        value: "Doe"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "jone@test.com"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Date de naissance"), {
      target: {
        name: "birth",
        value: "1990-08-19"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Ville"), {
      target: {
        name: "city",
        value: "789"
      }
    });
    _react.fireEvent.change(_react.screen.getByLabelText("Code postal"), {
      target: {
        name: "postalCode",
        value: "30000-1234"
      }
    });
    _react.fireEvent.submit(form);
    expect(localStorage.getItem("error_city")).toBe("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.");
  });
  test("Should display real-time errors", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const firstName = _react.screen.getByLabelText("Prénom");

    // use invalide first name to trigger error
    await _userEvent.default.type(firstName, "123");
    expect(_react.screen.getByText("Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes.")).toBeInTheDocument();
    await _userEvent.default.clear(firstName);
    expect(_react.screen.getByText("Le nom et prénom sont obligatoires et ne peuvent pas être vides.")).toBeInTheDocument();
  });
  test("Should display error on blur if email is invalid", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const email = _react.screen.getByLabelText("Email");
    await _userEvent.default.type(email, "invalid");
    await _userEvent.default.tab(); // blur

    expect(_react.screen.getByText("Veuillez saisir une adresse email valide (test@test.com).")).toBeInTheDocument();
  });
  test("Should disable submit button when form is invalid", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    const button = _react.screen.getByRole("button", {
      name: "S'enregistrer"
    });
    expect(button).toBeDisabled();
    await fillValidForm();
    expect(button).not.toBeDisabled();
  });
  test("Should submit valid form, display toaster, and call API through callback", async () => {
    const mockCallback = jest.fn().mockResolvedValue({
      success: true
    });
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {
      onRegistrationSuccess: mockCallback
    }));
    await fillValidForm();
    await _userEvent.default.click(_react.screen.getByRole("button", {
      name: "S'enregistrer"
    }));

    // Wait for async operation and toaster to appear
    await (0, _react.waitFor)(() => {
      expect(_react.screen.getByText("Utilisateur enregistré avec succès !")).toBeInTheDocument();
    });
    expect(mockCallback).toHaveBeenCalledWith({
      name: "Jone Doe",
      email: "jone@test.com",
      address: {
        city: "Nîmes",
        zipcode: "30000-1234"
      },
      firstName: "Jone",
      lastName: "Doe",
      birth: "1990-08-19",
      city: "Nîmes",
      postalCode: "30000-1234"
    });

    // Wait for form to be cleared after success
    await (0, _react.waitFor)(() => {
      expect(_react.screen.getByLabelText("Prénom").value).toBe("");
    });
  });
  test("Should clear localStorage errors after submit", async () => {
    (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {}));
    await _userEvent.default.type(_react.screen.getByLabelText("Email"), "invalid");
    await _userEvent.default.tab();
    expect(localStorage.getItem("error_email")).toBeTruthy();
    await fillValidForm();
    await _userEvent.default.click(_react.screen.getByRole("button", {
      name: "S'enregistrer"
    }));
    expect(localStorage.getItem("error_email")).toBeNull();
  });
});