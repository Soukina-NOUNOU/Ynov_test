"use strict";

var _react = require("@testing-library/react");
var _UserContext = require("./UserContext");
var _axios = _interopRequireDefault(require("axios"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Mock axios
jest.mock('axios');
const mockUsers = [{
  id: 1,
  name: 'Leanne Graham'
}, {
  id: 2,
  name: 'Ervin Howell'
}];
const TestComponent = () => {
  const {
    users,
    getUserCount,
    getUserList
  } = (0, _UserContext.useUsers)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      "data-testid": "user-count",
      children: getUserCount()
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      "data-testid": "user-list",
      children: getUserList().map(user => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        children: user.name
      }, user.id))
    })]
  });
};
describe('UserContext Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should fetch users on initial load', async () => {
    _axios.default.get.mockResolvedValue({
      data: mockUsers
    });
    const {
      getByTestId
    } = (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_UserContext.UserProvider, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(TestComponent, {})
    }));
    await (0, _react.waitFor)(() => {
      expect(_axios.default.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
      expect(getByTestId('user-count').textContent).toBe('2');
      expect(getByTestId('user-list').children.length).toBe(2);
    });
  });
  it('should handle error when fetching users', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    _axios.default.get.mockRejectedValue(new Error('Network Error'));
    const {
      getByTestId
    } = (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_UserContext.UserProvider, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(TestComponent, {})
    }));
    await (0, _react.waitFor)(() => {
      expect(_axios.default.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
      expect(getByTestId('user-count').textContent).toBe('0');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading users from API:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });
  it('should add a user', async () => {
    _axios.default.get.mockResolvedValue({
      data: []
    }); // Start with no users
    const newUser = {
      id: 3,
      name: 'Clementine Bauch'
    };
    _axios.default.post.mockResolvedValue({
      data: newUser
    });
    let addUserFunc;
    const AddUserTestComponent = () => {
      const {
        addUser,
        users
      } = (0, _UserContext.useUsers)();
      addUserFunc = addUser;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          "data-testid": "user-count",
          children: users.length
        })
      });
    };
    const {
      getByTestId
    } = (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_UserContext.UserProvider, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(AddUserTestComponent, {})
    }));
    await (0, _react.waitFor)(() => {
      expect(getByTestId('user-count').textContent).toBe('0');
    });
    await (0, _react.act)(async () => {
      await addUserFunc(newUser);
    });
    await (0, _react.waitFor)(() => {
      expect(_axios.default.post).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', newUser);
      expect(getByTestId('user-count').textContent).toBe('1');
    });
  });
  it('should handle error when adding a user', async () => {
    _axios.default.get.mockResolvedValue({
      data: mockUsers
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const newUser = {
      name: 'New User'
    };
    _axios.default.post.mockRejectedValue(new Error('Failed to add user'));
    let addUserFunc;
    const AddUserErrorTestComponent = () => {
      const {
        addUser,
        users
      } = (0, _UserContext.useUsers)();
      addUserFunc = addUser;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        "data-testid": "user-count",
        children: users.length
      });
    };
    const {
      getByTestId
    } = (0, _react.render)(/*#__PURE__*/(0, _jsxRuntime.jsx)(_UserContext.UserProvider, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(AddUserErrorTestComponent, {})
    }));
    await (0, _react.waitFor)(() => {
      expect(getByTestId('user-count').textContent).toBe('2');
    });
    await (0, _react.act)(async () => {
      await addUserFunc(newUser);
    });
    await (0, _react.waitFor)(() => {
      expect(_axios.default.post).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users', newUser);
      expect(getByTestId('user-count').textContent).toBe('2'); // Count should not change
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving user to API:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  // Tests for HTTP error handling
  describe('HTTP Error Handling in addUser', () => {
    const wrapper = _ref => {
      let {
        children
      } = _ref;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_UserContext.UserProvider, {
        children: children
      });
    };
    beforeEach(() => {
      // Mock window.alert to avoid issues in tests
      window.alert = jest.fn();
    });
    test('should handle 400 error (email already exists)', async () => {
      const error400 = new Error('Bad Request');
      error400.response = {
        status: 400,
        data: {
          message: 'Email already exists'
        }
      };
      _axios.default.post.mockRejectedValue(error400);
      const {
        result
      } = (0, _react.renderHook)(() => (0, _UserContext.useUsers)(), {
        wrapper
      });
      const newUser = {
        name: 'Test User',
        email: 'existing@test.com',
        address: {
          city: 'Paris',
          zipcode: '75001-1234'
        }
      };
      const response = await (0, _react.act)(async () => {
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
        data: {
          message: 'Internal Server Error'
        }
      };
      _axios.default.post.mockRejectedValue(error500);
      const {
        result
      } = (0, _react.renderHook)(() => (0, _UserContext.useUsers)(), {
        wrapper
      });
      const newUser = {
        name: 'Test User',
        email: 'test@test.com',
        address: {
          city: 'Lyon',
          zipcode: '69001-5678'
        }
      };
      const response = await (0, _react.act)(async () => {
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
      _axios.default.post.mockRejectedValue(networkError);
      const {
        result
      } = (0, _react.renderHook)(() => (0, _UserContext.useUsers)(), {
        wrapper
      });
      const newUser = {
        name: 'Test User',
        email: 'test@test.com',
        address: {
          city: 'Marseille',
          zipcode: '13001-9876'
        }
      };
      const response = await (0, _react.act)(async () => {
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
        name: 'Test User',
        email: 'test@test.com',
        address: {
          city: 'Nice',
          zipcode: '06000-1111'
        }
      };
      _axios.default.post.mockResolvedValue({
        data: mockUser
      });
      const {
        result
      } = (0, _react.renderHook)(() => (0, _UserContext.useUsers)(), {
        wrapper
      });
      const newUser = {
        name: 'Test User',
        email: 'test@test.com',
        address: {
          city: 'Nice',
          zipcode: '06000-1111'
        }
      };
      const response = await (0, _react.act)(async () => {
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