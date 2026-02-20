/**
 * Unit tests for userUtils.js
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
} from './userUtils';

describe('User Utils - Unit Tests (Pure Logic)', () => {
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
  });
});
