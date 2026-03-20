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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
        const mapped = (response.data.utilisateurs || []).map(user => ({
          id: user[0],
          firstName: user[1],
          lastName: user[2],
          email: user[3],
          birth: user[4],
          city: user[5],
          postalCode: user[6],
        }));
        setUsers(mapped);
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, newUser);
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

  // Function to delete a user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMsg = error.response?.status === 404
        ? 'Utilisateur introuvable.'
        : 'Impossible de supprimer cet utilisateur.';
      alert(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    users,
    addUser,
    deleteUser,
    getUserCount,
    getUserList
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};