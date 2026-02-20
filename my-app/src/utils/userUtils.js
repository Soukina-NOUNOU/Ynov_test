/**
 * Utility functions for user management
 * (Pure logic - Testable with unit tests)
 */

/**
 * Loads the list of users from localStorage
 * @returns {Array} List of users
 */
export const loadUsersFromStorage = () => {
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
export const saveUsersToStorage = (users) => {
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
export const addUserToList = (newUser, existingUsers = []) => {
  return [...existingUsers, newUser];
};

/**
 * Counts the number of users
 * @param {Array} users - List of users
 * @returns {number} Number of users
 */
export const countUsers = (users = []) => {
  return users.length;
};

/**
 * Filters users by criteria
 * @param {Array} users - List of users
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered users
 */
export const filterUsers = (users = [], searchTerm = '') => {
  if (!searchTerm.trim()) return users;
  
  const term = searchTerm.toLowerCase();
  return users.filter(user => {
    // Handle both formats: jsonplaceholder and legacy
    const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`;
    const city = user.address?.city || user.city;
    
    return name?.toLowerCase().includes(term) ||
           user.email?.toLowerCase().includes(term) ||
           city?.toLowerCase().includes(term);
  });
};

/**
 * Sorts users by name
 * @param {Array} users - List of users
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted users
 */
export const sortUsersByName = (users = [], order = 'asc') => {
  return [...users].sort((a, b) => {
    // Handle both jsonplaceholder format (name) and legacy format (firstName lastName)
    const nameA = (a.name || `${a.firstName || ''} ${a.lastName || ''}`).toLowerCase().trim();
    const nameB = (b.name || `${b.firstName || ''} ${b.lastName || ''}`).toLowerCase().trim();
    
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
export const userExists = (email, users = []) => {
  return users.some(user => user.email?.toLowerCase() === email?.toLowerCase());
};

/**
 * Formats the text for the user count display
 * @param {number} count - Number of users
 * @returns {string} Formatted text
 */
export const formatUserCountText = (count) => {
  if (count === 0) {
    return "Aucun utilisateur inscrit";
  } else if (count === 1) {
    return "1 utilisateur inscrit";
  } else {
    return `${count} utilisateurs inscrits`;
  }
};