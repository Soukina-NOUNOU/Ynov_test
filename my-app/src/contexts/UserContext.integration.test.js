import { render, waitFor, act } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockUsers = [
  { id: 1, name: 'Leanne Graham' },
  { id: 2, name: 'Ervin Howell' },
];

const TestComponent = () => {
  const { users, getUserCount, getUserList } = useUsers();
  return (
    <div>
      <div data-testid="user-count">{getUserCount()}</div>
      <ul data-testid="user-list">
        {getUserList().map(user => (
          <li key={user.id}>{user.name}</li>
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
    axios.get.mockResolvedValue({ data: mockUsers });

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
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
        expect(axios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
        expect(getByTestId('user-count').textContent).toBe('0');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading users from API:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should add a user', async () => {
    axios.get.mockResolvedValue({ data: [] }); // Start with no users
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
        expect(axios.post).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', newUser);
        expect(getByTestId('user-count').textContent).toBe('1');
    });
  });

  it('should handle error when adding a user', async () => {
    axios.get.mockResolvedValue({ data: mockUsers });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const newUser = { name: 'New User' };
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
        expect(axios.post).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', newUser);
        expect(getByTestId('user-count').textContent).toBe('2'); // Count should not change
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving user to API:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});
