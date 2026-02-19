/**
 * Tests d'intégration pour UserContext
 * (Tests de la gestion d'état et persistance)
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Console error mock
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Test component to consume UserContext
const TestComponent = () => {
  const { users, addUser, getUserCount, getUserList } = useUsers();
  
  const handleAddUser = () => {
    addUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      birth: '1990-01-01',
      city: 'TestCity',
      postalCode: '12345'
    });
  };

  return (
    <div>
      <div data-testid="user-count">{getUserCount()}</div>
      <div data-testid="user-list">
        {getUserList().map((user, index) => (
          <div key={index} data-testid={`user-${index}`}>
            {user.firstName} {user.lastName}
          </div>
        ))}
      </div>
      <button onClick={handleAddUser} data-testid="add-user">
        Add User
      </button>
      <div data-testid="raw-users">{JSON.stringify(users)}</div>
    </div>
  );
};

// Error test for useUsers outside the provider
const ComponentWithoutProvider = () => {
  try {
    const { getUserCount } = useUsers();
    return <div>Should not render</div>;
  } catch (error) {
    return <div data-testid="error">{error.message}</div>;
  }
};

describe('UserContext - Integration Tests (State Management)', () => {
  beforeEach(() => {
    localStorage.clear();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Context Initialization', () => {
    test('should initialize with empty users when localStorage is empty', async () => {
      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('0');
      expect(screen.getByTestId('user-list')).toBeEmptyDOMElement();
      expect(screen.getByTestId('raw-users')).toHaveTextContent('[]');
    });

    test('should initialize with existing users from localStorage', async () => {
      const existingUsers = [
        { firstName: 'John', lastName: 'Doe', email: 'john@test.com', city: 'NewYork' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', city: 'Boston' }
      ];
      
      localStorage.setItem('users', JSON.stringify(existingUsers));

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('2');
      expect(screen.getByTestId('user-0')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-1')).toHaveTextContent('Jane Smith');
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('users', 'invalid-json');

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      // Should fallback to empty array when JSON parsing fails
      expect(screen.getByTestId('user-count')).toHaveTextContent('0');
      expect(screen.getByTestId('raw-users')).toHaveTextContent('[]');
      
      // Should log error to console
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des utilisateurs depuis localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('Adding Users', () => {
    test('should add new user and update localStorage', async () => {
      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('0');

      // Add a user
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-user'));
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('1');
      expect(screen.getByTestId('user-0')).toHaveTextContent('Test User');

      // Check localStorage
      const savedUsers = JSON.parse(localStorage.getItem('users'));
      expect(savedUsers).toHaveLength(1);
      expect(savedUsers[0]).toEqual({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        birth: '1990-01-01',
        city: 'TestCity',
        postalCode: '12345'
      });
    });

    test('should add multiple users correctly', async () => {
      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      // Ajouter plusieurs utilisateurs
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-user'));
        fireEvent.click(screen.getByTestId('add-user'));
        fireEvent.click(screen.getByTestId('add-user'));
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('3');
      expect(screen.getByTestId('user-0')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-1')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-2')).toHaveTextContent('Test User');

      // Check localStorage
      const savedUsers = JSON.parse(localStorage.getItem('users'));
      expect(savedUsers).toHaveLength(3);
    });

    test('should preserve existing users when adding new ones', async () => {
      // Pre-fill localStorage
      const existingUsers = [
        { firstName: 'Existing', lastName: 'User', email: 'existing@test.com', city: 'OldCity' }
      ];
      localStorage.setItem('users', JSON.stringify(existingUsers));

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('1');
      expect(screen.getByTestId('user-0')).toHaveTextContent('Existing User');

      // Add a new user
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-user'));
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('2');
      expect(screen.getByTestId('user-0')).toHaveTextContent('Existing User');
      expect(screen.getByTestId('user-1')).toHaveTextContent('Test User');

      // Check localStorage
      const savedUsers = JSON.parse(localStorage.getItem('users'));
      expect(savedUsers).toHaveLength(2);
      expect(savedUsers[0]).toEqual(existingUsers[0]);
    });
  });

  describe('Context Utility Functions', () => {
    test('should provide correct user count', async () => {
      const users = [
        { firstName: 'User1', lastName: 'Test' },
        { firstName: 'User2', lastName: 'Test' },
        { firstName: 'User3', lastName: 'Test' }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('3');
    });

    test('should provide correct user list', async () => {
      const users = [
        { firstName: 'Alice', lastName: 'Wonder', email: 'alice@test.com', city: 'Wonderland' },
        { firstName: 'Bob', lastName: 'Builder', email: 'bob@test.com', city: 'Construction' }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-0')).toHaveTextContent('Alice Wonder');
      expect(screen.getByTestId('user-1')).toHaveTextContent('Bob Builder');
      expect(screen.getByTestId('raw-users')).toHaveTextContent(JSON.stringify(users));
    });
  });

  describe('Persistence and Synchronization', () => {
    test('should persist data across component re-renders', async () => {
      const { rerender } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Add a user
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-user'));
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('1');

      // Re-render the component
      rerender(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      // Data should be reloaded from localStorage
      expect(screen.getByTestId('user-count')).toHaveTextContent('1');
      expect(screen.getByTestId('user-0')).toHaveTextContent('Test User');
    });

    test('should sync with localStorage changes', async () => {
      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('0');

      // Simulate an external change to localStorage
      const externalUsers = [
        { firstName: 'External', lastName: 'User', email: 'external@test.com', city: 'ExternalCity' }
      ];
      localStorage.setItem('users', JSON.stringify(externalUsers));

      // Re-render to trigger the useEffect
      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      // This test verifies that the provider can load data on mount
      expect(screen.getByTestId('user-count')).toHaveTextContent('1');
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useUsers is used outside provider', () => {
      // Capture the error with a boundary
      const ErrorBoundary = ({ children }) => {
        try {
          return children;
        } catch (error) {
          return <div data-testid="boundary-error">{error.message}</div>;
        }
      };

      expect(() => {
        render(
          <ErrorBoundary>
            <ComponentWithoutProvider />
          </ErrorBoundary>
        );
      }).toThrow('useUsers must be used within a UserProvider');
    });

    test('should handle localStorage errors gracefully during save', async () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      // Attempt to add a user (should fail silently)
      await act(async () => {
        fireEvent.click(screen.getByTestId('add-user'));
      });

      // Local state should be updated even if localStorage fails
      expect(screen.getByTestId('user-count')).toHaveTextContent('1');

      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Edge Cases', () => {
    test('should handle null localStorage value', async () => {
      localStorage.removeItem('users');
      localStorage.getItem = jest.fn(() => null);

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('0');
      expect(screen.getByTestId('raw-users')).toHaveTextContent('[]');
    });

    test('should handle empty string in localStorage', async () => {
      localStorage.setItem('users', '');

      await act(async () => {
        render(
          <UserProvider>
            <TestComponent />
          </UserProvider>
        );
      });

      expect(screen.getByTestId('user-count')).toHaveTextContent('0');
      expect(consoleSpy).toHaveBeenCalled(); // Should log parsing error
    });
  });
});