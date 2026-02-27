"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useUsers = exports.UserProvider = void 0;
var _react = _interopRequireWildcard(require("react"));
var _axios = _interopRequireDefault(require("axios"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const UserContext = /*#__PURE__*/(0, _react.createContext)();
const useUsers = () => {
  const context = (0, _react.useContext)(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
exports.useUsers = useUsers;
const UserProvider = _ref => {
  let {
    children
  } = _ref;
  const [users, setUsers] = (0, _react.useState)([]);

  // Load users from API on initial load
  (0, _react.useEffect)(() => {
    const fetchUsers = async () => {
      try {
        const response = await _axios.default.get('https://jsonplaceholder.typicode.com/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error loading users from API:', error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Function to add a new user
  const addUser = async newUser => {
    try {
      const response = await _axios.default.post('https://jsonplaceholder.typicode.com/users', newUser);
      const updatedUsers = [...users, response.data];
      setUsers(updatedUsers);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error saving user to API:', error);

      // Handle error
      if (error.response) {
        var _error$response$data;
        const status = error.response.status;
        const message = ((_error$response$data = error.response.data) === null || _error$response$data === void 0 ? void 0 : _error$response$data.message) || error.message;
        if (status === 400) {
          //Email already exists or other validation error
          const errorMsg = message.includes('email') || message.includes('Email') ? 'Cette adresse email est déjà utilisée, veuillez en choisir une autre.' : 'Données invalides. Veuillez vérifier vos informations.';
          alert(errorMsg);
          return {
            success: false,
            error: errorMsg,
            status: 400
          };
        }
        if (status === 500) {
          // Server error
          const errorMsg = 'Le serveur rencontre actuellement des difficultés. Veuillez réessayer plus tard.';
          alert(errorMsg);
          return {
            success: false,
            error: errorMsg,
            status: 500
          };
        }

        // Other HTTP errors
        const genericError = "Erreur du serveur (".concat(status, "). Veuillez r\xE9essayer.");
        alert(genericError);
        return {
          success: false,
          error: genericError,
          status
        };
      }

      // Network or other errors
      const networkError = 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
      alert(networkError);
      return {
        success: false,
        error: networkError,
        status: 0
      };
    }
  };

  // Function to get the number of users
  const getUserCount = () => users.length;

  // Function to get the list of users
  const getUserList = () => users;
  const value = {
    users,
    addUser,
    getUserCount,
    getUserList
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(UserContext.Provider, {
    value: value,
    children: children
  });
};
exports.UserProvider = UserProvider;