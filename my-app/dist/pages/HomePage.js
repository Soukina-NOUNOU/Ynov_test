"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactRouterDom = require("react-router-dom");
var _UserContext = require("../contexts/UserContext");
var _userUtils = require("../utils/userUtils");
require("./HomePage.css");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const HomePage = () => {
  const {
    getUserCount,
    getUserList
  } = (0, _UserContext.useUsers)();
  const userCount = getUserCount();
  const userList = getUserList();

  // Use logic to sort users by name before rendering
  const sortedUsers = (0, _userUtils.sortUsersByName)(userList);

  // Use logic to format the user count text
  const countText = (0, _userUtils.formatUserCountText)(userCount);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "home-page",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
      children: "Bienvenue sur notre plateforme d'inscription"
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "user-counter",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: countText
      })
    }), userCount > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "user-list",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h3", {
        children: "Liste des utilisateurs inscrits :"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "user-cards",
        children: sortedUsers.map((user, index) => {
          var _user$address;
          return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "user-card",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h4", {
              children: user.name
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
              children: ["Email: ", user.email]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
              children: ["Ville: ", (_user$address = user.address) === null || _user$address === void 0 ? void 0 : _user$address.city]
            })]
          }, index);
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "navigation",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactRouterDom.Link, {
        to: "/register",
        className: "register-link",
        children: "S'inscrire"
      })
    })]
  });
};
var _default = exports.default = HomePage;