"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userExists = exports.sortUsersByName = exports.saveUsersToStorage = exports.loadUsersFromStorage = exports.formatUserCountText = exports.filterUsers = exports.countUsers = exports.addUserToList = void 0;
/**
 * Utility functions for user management
 * (Pure logic - Testable with unit tests)
 */

/**
 * Loads the list of users from localStorage
 * @returns {Array} List of users
 */
const loadUsersFromStorage = () => {
  try {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    return [];
  }
};

/**
 * Saves the list of users to localStorage
 * @param {Array} users - List of users to save
 */
exports.loadUsersFromStorage = loadUsersFromStorage;
const saveUsersToStorage = users => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
  }
};

/**
 * Add a new user to the list of users
 * @param {Object} newUser - New user to add
 * @param {Array} existingUsers - List of existing users
 * @returns {Array} New list of users
 */
exports.saveUsersToStorage = saveUsersToStorage;
const addUserToList = function (newUser) {
  let existingUsers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return [...existingUsers, newUser];
};

/**
 * Counts the number of users
 * @param {Array} users - List of users
 * @returns {number} Number of users
 */
exports.addUserToList = addUserToList;
const countUsers = function () {
  let users = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return users.length;
};

/**
 * Filters users by criteria
 * @param {Array} users - List of users
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered users
 */
exports.countUsers = countUsers;
const filterUsers = function () {
  let users = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let searchTerm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  if (!searchTerm.trim()) return users;
  const term = searchTerm.toLowerCase();
  return users.filter(user => {
    var _user$address, _user$email;
    // Handle both formats: jsonplaceholder and legacy
    const name = user.name || "".concat(user.firstName || '', " ").concat(user.lastName || '');
    const city = ((_user$address = user.address) === null || _user$address === void 0 ? void 0 : _user$address.city) || user.city;
    return (name === null || name === void 0 ? void 0 : name.toLowerCase().includes(term)) || ((_user$email = user.email) === null || _user$email === void 0 ? void 0 : _user$email.toLowerCase().includes(term)) || (city === null || city === void 0 ? void 0 : city.toLowerCase().includes(term));
  });
};

/**
 * Sorts users by name
 * @param {Array} users - List of users
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted users
 */
exports.filterUsers = filterUsers;
const sortUsersByName = function () {
  let users = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'asc';
  return [...users].sort((a, b) => {
    // Handle both jsonplaceholder format (name) and legacy format (firstName lastName)
    const nameA = (a.name || "".concat(a.firstName || '', " ").concat(a.lastName || '')).toLowerCase().trim();
    const nameB = (b.name || "".concat(b.firstName || '', " ").concat(b.lastName || '')).toLowerCase().trim();
    if (order === 'desc') {
      return nameB.localeCompare(nameA);
    }
    return nameA.localeCompare(nameB);
  });
};

/**
 * Checks if a user already exists (by email)
 * @param {string} email - Email to check
 * @param {Array} users - List of existing users
 * @returns {boolean} true if the user already exists
 */
exports.sortUsersByName = sortUsersByName;
const userExists = function (email) {
  let users = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return users.some(user => {
    var _user$email2;
    return ((_user$email2 = user.email) === null || _user$email2 === void 0 ? void 0 : _user$email2.toLowerCase()) === (email === null || email === void 0 ? void 0 : email.toLowerCase());
  });
};

/**
 * Formats the text for the user count display
 * @param {number} count - Number of users
 * @returns {string} Formatted text
 */
exports.userExists = userExists;
const formatUserCountText = count => {
  if (count === 0) {
    return "Aucun utilisateur inscrit";
  } else if (count === 1) {
    return "1 utilisateur inscrit";
  } else {
    return "".concat(count, " utilisateurs inscrits");
  }
};
exports.formatUserCountText = formatUserCountText;