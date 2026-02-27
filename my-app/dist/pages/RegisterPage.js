"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRouterDom = require("react-router-dom");
var _UserContext = require("../contexts/UserContext");
var _RegistrationForm = _interopRequireDefault(require("../RegistrationForm"));
require("./RegisterPage.css");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const RegisterPage = () => {
  const navigate = (0, _reactRouterDom.useNavigate)();
  const {
    addUser
  } = (0, _UserContext.useUsers)();
  const handleRegistrationSuccess = async userData => {
    const result = await addUser(userData);
    if (result.success) {
      // Redirect to home page only if registration was successful
      setTimeout(() => {
        navigate('/');
      }, 3000); // Allow time to see the toaster
      return {
        success: true
      };
    } else {
      // Error was already displayed by addUser (alert), don't redirect
      return {
        success: false,
        error: result.error,
        status: result.status
      };
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "register-page",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "navigation-header",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
        to: "/",
        className: "back-link",
        children: "Retour \xE0 l'accueil"
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "register-content",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_RegistrationForm.default, {
        onRegistrationSuccess: handleRegistrationSuccess
      })
    })]
  });
};
var _default = exports.default = RegisterPage;