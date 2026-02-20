import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Load users from API on initial load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error loading users from API:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  // Function to add a new user
  const addUser = async (newUser) => {
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', newUser);
      const updatedUsers = [...users, response.data];
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving user to API:', error);
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

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};