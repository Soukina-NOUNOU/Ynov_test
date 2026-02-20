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
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error saving user to API:', error);
      
      // Handle error
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        if (status === 400) {
          //Email already exists or other validation error
          const errorMsg = message.includes('email') || message.includes('Email') 
            ? 'Cette adresse email est déjà utilisée, veuillez en choisir une autre.'
            : 'Données invalides. Veuillez vérifier vos informations.';
          alert(errorMsg);
          return { success: false, error: errorMsg, status: 400 };
        } 
        
        if (status === 500) {
          // Server error
          const errorMsg = 'Le serveur rencontre actuellement des difficultés. Veuillez réessayer plus tard.';
          alert(errorMsg);
          return { success: false, error: errorMsg, status: 500 };
        }
        
        // Other HTTP errors
        const genericError = `Erreur du serveur (${status}). Veuillez réessayer.`;
        alert(genericError);
        return { success: false, error: genericError, status };
      }
      
      // Network or other errors
      const networkError = 'Impossible de joindre le serveur. Vérifiez votre connexion internet.';
      alert(networkError);
      return { success: false, error: networkError, status: 0 };
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