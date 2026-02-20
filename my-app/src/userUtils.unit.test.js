/**
 * Unit tests for functions in userUtils.js
 * (Pure logic - Unit tests)
 */

import {
  addUserToList,
  countUsers,
  filterUsers,
  sortUsersByName,
  userExists,
  formatUserCountText,
  loadUsersFromStorage,
  saveUsersToStorage
} from './utils/userUtils';

describe('User Utils - Unit Tests', () => {
  const mockUsers = [
    { id: 1, name: 'Alice Dupont', email: 'alice@test.com', address: { city: 'Paris' } },
    { id: 2, name: 'Bob Martin', email: 'bob@test.com', address: { city: 'Lyon' } },
    { id: 3, name: 'Caroline Bernard', email: 'caroline@test.com', address: { city: 'Marseille' } }
  ];

  describe('addUserToList', () => {
    test('should add a user to empty list', () => {
      const newUser = { id: 4, name: 'Test User', email: 'test@test.com', address: { city: 'TestCity' } };
      const result = addUserToList(newUser, []);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newUser);
    });

    test('should add a user to existing list', () => {
      const newUser = { id: 4, name: 'David Durand', email: 'david@test.com', address: { city: 'Nice' } };
      const result = addUserToList(newUser, mockUsers);
      
      expect(result).toHaveLength(4);
      expect(result[3]).toEqual(newUser);
    });

    test('should not modify original array', () => {
      const newUser = { id: 4, name: 'Test User', email: 'test@test.com', address: { city: 'TestCity' } };
      const originalUsers = [...mockUsers];
      addUserToList(newUser, mockUsers);
      
      expect(mockUsers).toEqual(originalUsers);
    });
  });

  describe('countUsers', () => {
    test('should return 0 for empty array', () => {
      expect(countUsers([])).toBe(0);
    });

    test('should return correct count for non-empty array', () => {
      expect(countUsers(mockUsers)).toBe(3);
    });

    test('should return 0 for undefined input', () => {
      expect(countUsers()).toBe(0);
    });
  });

  describe('filterUsers', () => {
    test('should return all users for empty search term', () => {
      const result = filterUsers(mockUsers, '');
      expect(result).toEqual(mockUsers);
    });

    test('should filter by name', () => {
      const result = filterUsers(mockUsers, 'Alice');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Dupont');
    });

    test('should filter by last name', () => {
      const result = filterUsers(mockUsers, 'Martin');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob Martin');
    });

    test('should filter by email', () => {
      const result = filterUsers(mockUsers, 'caroline@test.com');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('caroline@test.com');
    });

    test('should filter by city', () => {
      const result = filterUsers(mockUsers, 'Paris');
      expect(result).toHaveLength(1);
      expect(result[0].address.city).toBe('Paris');
    });

    test('should be case insensitive', () => {
      const result = filterUsers(mockUsers, 'ALICE');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Dupont');
    });

    test('should return empty array for no matches', () => {
      const result = filterUsers(mockUsers, 'NonExistent');
      expect(result).toHaveLength(0);
    });

    test('should handle users with missing properties', () => {
      const usersWithMissingProps = [
        { id: 1, name: 'John' }, // missing email, address
        { id: 2, email: 'smith@test.com' }, // missing name, address
        { id: 3, email: 'test@test.com', address: {} }, // missing name, address.city
        { id: 4, name: 'Test', address: { city: 'TestCity' } } // complete user
      ];
      
      const result = filterUsers(usersWithMissingProps, 'John');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
      
      const result2 = filterUsers(usersWithMissingProps, 'TestCity');
      expect(result2).toHaveLength(1);
      expect(result2[0].address.city).toBe('TestCity');
    });

    test('should handle legacy format users (firstName/lastName)', () => {
      const legacyUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', city: 'New York' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', city: 'Los Angeles' }
      ];
      
      const result = filterUsers(legacyUsers, 'John');
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
      
      const result2 = filterUsers(legacyUsers, 'New York');
      expect(result2).toHaveLength(1);
      expect(result2[0].city).toBe('New York');
    });

    test('should handle mixed format users', () => {
      const mixedUsers = [
        { id: 1, name: 'Alice Dupont', email: 'alice@test.com', address: { city: 'Paris' } },
        { id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob@test.com', city: 'Lyon' },
        { id: 3, firstName: '', lastName: '', email: 'empty@test.com' } // empty names
      ];
      
      const result = filterUsers(mixedUsers, 'Alice');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Dupont');
      
      const result2 = filterUsers(mixedUsers, 'Bob');
      expect(result2).toHaveLength(1);
      expect(result2[0].firstName).toBe('Bob');
    });

    test('should handle whitespace-only search terms', () => {
      const result = filterUsers(mockUsers, '   ');
      expect(result).toEqual(mockUsers);
    });

    test('should handle search term with only tabs and newlines', () => {
      const result = filterUsers(mockUsers, '\t\n  ');
      expect(result).toEqual(mockUsers);
    });

    test('should handle users with completely undefined properties', () => {
      const usersWithUndefined = [
        { id: 1 }, // no name, email, address, city properties
        { id: 2, name: null, email: null, address: null, city: null },
        { id: 3, firstName: null, lastName: null }
      ];
      
      const result = filterUsers(usersWithUndefined, 'test');
      expect(result).toEqual([]);
    });

    test('should return empty array for no matches', () => {
      const result = filterUsers(mockUsers, 'xyz');
      expect(result).toHaveLength(0);
    });
  });

  describe('sortUsersByName', () => {
    test('should sort users in ascending order by default', () => {
      const result = sortUsersByName(mockUsers);
      expect(result[0].name).toBe('Alice Dupont');
      expect(result[1].name).toBe('Bob Martin');
      expect(result[2].name).toBe('Caroline Bernard');
    });

    test('should sort users in ascending order explicitly', () => {
      const result = sortUsersByName(mockUsers, 'asc');
      expect(result[0].name).toBe('Alice Dupont');
      expect(result[1].name).toBe('Bob Martin');
      expect(result[2].name).toBe('Caroline Bernard');
    });

    test('should sort users in descending order', () => {
      const result = sortUsersByName(mockUsers, 'desc');
      expect(result[0].name).toBe('Caroline Bernard');
      expect(result[1].name).toBe('Bob Martin');
      expect(result[2].name).toBe('Alice Dupont');
    });

    test('should not modify original array', () => {
      const originalUsers = [...mockUsers];
      sortUsersByName(mockUsers);
      expect(mockUsers).toEqual(originalUsers);
    });

    test('should handle legacy format users (firstName/lastName)', () => {
      const legacyUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        { id: 2, firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' },
        { id: 3, firstName: 'Bob', lastName: 'Brown', email: 'bob@test.com' }
      ];
      
      const result = sortUsersByName(legacyUsers);
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('John');
    });

    test('should handle mixed format users', () => {
      const mixedUsers = [
        { id: 1, name: 'Zoe Miller', email: 'zoe@test.com' },
        { id: 2, firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' },
        { id: 3, firstName: '', lastName: 'Brown', email: 'brown@test.com' },
        { id: 4, firstName: 'John', lastName: '', email: 'john@test.com' }
      ];
      
      const result = sortUsersByName(mixedUsers);
      expect(result[0].firstName).toBe('Alice'); // alice smith
      expect(result[1].lastName).toBe('Brown'); //  brown
      expect(result[2].firstName).toBe('John'); // john 
      expect(result[3].name).toBe('Zoe Miller'); // zoe miller
    });

    test('should handle users with undefined names', () => {
      const usersWithUndefined = [
        { id: 1, firstName: undefined, lastName: undefined, email: 'test1@test.com' },
        { id: 2, name: 'Bob Smith', email: 'test2@test.com' }
      ];
      
      const result = sortUsersByName(usersWithUndefined);
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('test1@test.com'); // empty name comes first
      expect(result[1].name).toBe('Bob Smith');
    });

    test('should handle users with null names', () => {
      const usersWithNullNames = [
        { id: 1, name: null, email: 'test1@test.com' },
        { id: 2, firstName: null, lastName: 'Smith', email: 'test2@test.com' }
      ];
      
      const result = sortUsersByName(usersWithNullNames);
      expect(result).toHaveLength(2);
    });

    test('should handle empty arrays', () => {
      const result = sortUsersByName([]);
      expect(result).toEqual([]);
      
      const resultDesc = sortUsersByName([], 'desc');
      expect(resultDesc).toEqual([]);
    });
  });

  describe('userExists', () => {
    test('should return true if user exists', () => {
      const result = userExists('alice@test.com', mockUsers);
      expect(result).toBe(true);
    });

    test('should return false if user does not exist', () => {
      const result = userExists('nonexistent@test.com', mockUsers);
      expect(result).toBe(false);
    });

    test('should be case insensitive', () => {
      const result = userExists('ALICE@TEST.COM', mockUsers);
      expect(result).toBe(true);
    });

    test('should return false for empty users array', () => {
      const result = userExists('test@test.com', []);
      expect(result).toBe(false);
    });

    test('should handle null/undefined email inputs', () => {
      const result1 = userExists(null, mockUsers);
      expect(result1).toBe(false);
      
      const result2 = userExists(undefined, mockUsers);
      expect(result2).toBe(false);
      
      const result3 = userExists('', mockUsers);
      expect(result3).toBe(false);
    });

    test('should handle users with null/undefined email properties', () => {
      const usersWithNullEmails = [
        { id: 1, name: 'John Doe', email: null },
        { id: 2, name: 'Jane Smith', email: undefined },
        { id: 3, name: 'Bob Brown', email: 'bob@test.com' }
      ];
      
      const result1 = userExists('bob@test.com', usersWithNullEmails);
      expect(result1).toBe(true);
      
      const result2 = userExists('john@test.com', usersWithNullEmails);
      expect(result2).toBe(false);
    });

    test('should handle empty string email', () => {
      const usersWithEmptyEmail = [
        { id: 1, name: 'John Doe', email: '' },
        { id: 2, name: 'Jane Smith', email: 'jane@test.com' }
      ];
      
      const result1 = userExists('', usersWithEmptyEmail);
      expect(result1).toBe(true);
      
      const result2 = userExists('jane@test.com', usersWithEmptyEmail);
      expect(result2).toBe(true);
    });

    test('should handle empty arrays and undefined inputs', () => {
      expect(userExists('test@test.com', [])).toBe(false);
      expect(userExists('test@test.com', undefined)).toBe(false);
      expect(userExists('test@test.com')).toBe(false);
    });
  });

  describe('formatUserCountText', () => {
    test('should return correct text for 0 users', () => {
      expect(formatUserCountText(0)).toBe('Aucun utilisateur inscrit');
    });

    test('should return correct text for 1 user', () => {
      expect(formatUserCountText(1)).toBe('1 utilisateur inscrit');
    });

    test('should return correct text for multiple users', () => {
      expect(formatUserCountText(5)).toBe('5 utilisateurs inscrits');
    });
  });

  describe('loadUsersFromStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('should return empty array when localStorage is empty', () => {
      const result = loadUsersFromStorage();
      expect(result).toEqual([]);
    });

    test('should return empty array when localStorage returns null', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      const result = loadUsersFromStorage();
      expect(result).toEqual([]);
      
      Storage.prototype.getItem.mockRestore();
    });

    test('should return parsed users from localStorage', () => {
      const mockUsers = [
        { firstName: 'Test', lastName: 'User', email: 'test@test.com' }
      ];
      localStorage.setItem('users', JSON.stringify(mockUsers));
      
      const result = loadUsersFromStorage();
      expect(result).toEqual(mockUsers);
    });

    test('should return empty array and log error on invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('users', 'invalid-json');
      
      const result = loadUsersFromStorage();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des utilisateurs:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveUsersToStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    test('should save users to localStorage', () => {
      const mockUsers = [
        { firstName: 'Test', lastName: 'User', email: 'test@test.com' }
      ];
      
      saveUsersToStorage(mockUsers);
      
      const saved = JSON.parse(localStorage.getItem('users'));
      expect(saved).toEqual(mockUsers);
    });

    test('should handle localStorage errors during setItem', () => {
      const originalSetItem = Storage.prototype.setItem;
      const consoleMock = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('LocalStorage quota exceeded');
      });
      
      expect(() => saveUsersToStorage([{ firstName: 'Test', lastName: 'User' }])).not.toThrow();
      expect(consoleMock).toHaveBeenCalledWith('Erreur lors de la sauvegarde des utilisateurs:', expect.any(Error));
      
      Storage.prototype.setItem = originalSetItem;
      consoleMock.mockRestore();
    });

    test('should handle edge cases for formatUserCountText', () => {
      expect(formatUserCountText(2)).toBe('2 utilisateurs inscrits');
      expect(formatUserCountText(100)).toBe('100 utilisateurs inscrits');
      expect(formatUserCountText(-1)).toBe('-1 utilisateurs inscrits'); // edge case
    });
  });
});