import { render, waitFor, act, renderHook } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockUsersRaw = [
  [1, 'Leanne', 'Graham', 'leanne@test.com', '1990-01-01', 'Paris', '75001'],
  [2, 'Ervin', 'Howell', 'ervin@test.com', '1985-05-10', 'Lyon', '69001'],
];

const TestComponent = () => {
  const { users, getUserCount, getUserList } = useUsers();
  return (
    <div>
      <div data-testid="user-count">{getUserCount()}</div>
      <ul data-testid="user-list">
        {getUserList().map(user => (
          <li key={user.id}>{user.firstName} {user.lastName}</li>
        ))}
      </ul>
    </div>
  );
};

describe('UserContext Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users on initial load', async () => {
    axios.get.mockResolvedValue({ data: { utilisateurs: mockUsersRaw } });

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users`);
      expect(getByTestId('user-count').textContent).toBe('2');
      expect(getByTestId('user-list').children.length).toBe(2);
    });
  });

  it('should handle error when fetching users', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Network Error'));

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users`);
        expect(getByTestId('user-count').textContent).toBe('0');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading users from API:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should add a user', async () => {
    axios.get.mockResolvedValue({ data: { utilisateurs: [] } }); // Start with no users
    const newUser = { id: 3, name: 'Clementine Bauch' };
    axios.post.mockResolvedValue({ data: newUser });

    let addUserFunc;
    const AddUserTestComponent = () => {
        const { addUser, users } = useUsers();
        addUserFunc = addUser;
        return (
            <div>
                <div data-testid="user-count">{users.length}</div>
            </div>
        );
    };

    const { getByTestId } = render(
        <UserProvider>
            <AddUserTestComponent />
        </UserProvider>
    );

    await waitFor(() => {
        expect(getByTestId('user-count').textContent).toBe('0');
    });

    await act(async () => {
        await addUserFunc(newUser);
    });

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users`, newUser);
        expect(getByTestId('user-count').textContent).toBe('1');
    });
  });

  it('should handle error when adding a user', async () => {
    axios.get.mockResolvedValue({ data: { utilisateurs: mockUsersRaw } });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const newUser = { firstName: 'New', lastName: 'User', email: 'new@test.com' };
    axios.post.mockRejectedValue(new Error('Failed to add user'));

    let addUserFunc;
    const AddUserErrorTestComponent = () => {
        const { addUser, users } = useUsers();
        addUserFunc = addUser;
        return <div data-testid="user-count">{users.length}</div>;
    };

    const { getByTestId } = render(
        <UserProvider>
            <AddUserErrorTestComponent />
        </UserProvider>
    );

    await waitFor(() => {
        expect(getByTestId('user-count').textContent).toBe('2');
    });

    await act(async () => {
        await addUserFunc(newUser);
    });

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users`, newUser);
        expect(getByTestId('user-count').textContent).toBe('2'); // Count should not change
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving user to API:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  // Tests for HTTP error handling
  describe('HTTP Error Handling in addUser', () => {
    const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;
    
    beforeEach(() => {
      // Mock GET to avoid unhandled undefined response when UserProvider mounts
      axios.get.mockResolvedValue({ data: { utilisateurs: [] } });
      // Mock window.alert to avoid issues in tests
      window.alert = jest.fn();
    });

    test('should handle 400 error (email already exists)', async () => {
      const error400 = new Error('Bad Request');
      error400.response = {
        status: 400,
        data: { message: 'Email already exists' }
      };
      axios.post.mockRejectedValue(error400);

      const { result } = renderHook(() => useUsers(), { wrapper });

      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@test.com',
        city: 'Paris',
        postalCode: '75001'
      };

      const response = await act(async () => {
        return await result.current.addUser(newUser);
      });

      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toBe('Cette adresse email est déjà utilisée, veuillez en choisir une autre.');
      expect(window.alert).toHaveBeenCalledWith('Cette adresse email est déjà utilisée, veuillez en choisir une autre.');
      
      // Verify users list wasn't updated
      expect(result.current.users).toEqual([]);
    });

    test('should handle 500 error (server down)', async () => {
      const error500 = new Error('Internal Server Error');
      error500.response = {
        status: 500,
        data: { message: 'Internal Server Error' }
      };
      axios.post.mockRejectedValue(error500);

      const { result } = renderHook(() => useUsers(), { wrapper });

      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        city: 'Lyon',
        postalCode: '69001'
      };

      const response = await act(async () => {
        return await result.current.addUser(newUser);
      });

      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.error).toBe('Le serveur rencontre actuellement des difficultés. Veuillez réessayer plus tard.');
      expect(window.alert).toHaveBeenCalledWith('Le serveur rencontre actuellement des difficultés. Veuillez réessayer plus tard.');
      
      // Verify users list wasn't updated
      expect(result.current.users).toEqual([]);
    });

    test('should handle network error (no response)', async () => {
      const networkError = new Error('Network Error');
      // No response property = network error
      axios.post.mockRejectedValue(networkError);

      const { result } = renderHook(() => useUsers(), { wrapper });

      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        city: 'Marseille',
        postalCode: '13001'
      };

      const response = await act(async () => {
        return await result.current.addUser(newUser);
      });

      expect(response.success).toBe(false);
      expect(response.status).toBe(0);
      expect(response.error).toBe('Impossible de joindre le serveur. Vérifiez votre connexion internet.');
      expect(window.alert).toHaveBeenCalledWith('Impossible de joindre le serveur. Vérifiez votre connexion internet.');
      
      // Verify users list wasn't updated
      expect(result.current.users).toEqual([]);
    });

    test('should handle successful user creation (200/201)', async () => {
      const mockUser = {
        id: 11,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        city: 'Nice',
        postalCode: '06000'
      };
      
      axios.post.mockResolvedValue({ data: mockUser });

      const { result } = renderHook(() => useUsers(), { wrapper });

      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        city: 'Nice',
        postalCode: '06000'
      };

      const response = await act(async () => {
        return await result.current.addUser(newUser);
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(window.alert).not.toHaveBeenCalled();
      
      // Verify user was added to the list
      expect(result.current.users).toEqual([mockUser]);
    });
  });
});
