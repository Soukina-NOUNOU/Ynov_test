import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../contexts/UserContext';
import RegistrationForm from '../RegistrationForm';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addUser } = useUsers();

  const handleRegistrationSuccess = (userData) => {
    addUser(userData);
    // Redirect to home page after successful registration
    setTimeout(() => {
      navigate('/');
    }, 3000); // Allow time to see the toaster
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