import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../contexts/UserContext';
import RegistrationForm from '../RegistrationForm';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addUser } = useUsers();

  const handleRegistrationSuccess = async (userData) => {
    const result = await addUser(userData);
    
    if (result.success) {
      // Redirect to home page only if registration was successful
      setTimeout(() => {
        navigate('/');
      }, 3000); // Allow time to see the toaster
      return { success: true };
    } else {
      // Error was already displayed by addUser (alert), don't redirect
      return { success: false, error: result.error, status: result.status };
    }
  };

  return (
    <div className="register-page">
      <div className="navigation-header">
        <Link to="/" className="back-link">
          Retour à l'accueil
        </Link>
      </div>
      
      <div className="register-content">
        <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;