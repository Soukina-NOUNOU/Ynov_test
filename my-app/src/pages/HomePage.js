import React from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../contexts/UserContext';
import { formatUserCountText, sortUsersByName } from '../utils/userUtils';
import './HomePage.css';

const HomePage = () => {
  const { getUserCount, getUserList } = useUsers();
  const userCount = getUserCount();
  const userList = getUserList();
  
  // Use logic to sort users by name before rendering
  const sortedUsers = sortUsersByName(userList);
  
  // Use logic to format the user count text
  const countText = formatUserCountText(userCount);

  return (
    <div className="home-page">
      <h1>Bienvenue sur notre plateforme d'inscription</h1>
      
      <div className="user-counter">
        <h2>{countText}</h2>
      </div>

      {userCount > 0 && (
        <div className="user-list">
          <h3>Liste des utilisateurs inscrits :</h3>
          <div className="user-cards">
            {sortedUsers.map((user, index) => (
              <div key={index} className="user-card">
                <h4>{user.firstName} {user.lastName}</h4>
                <p>Email: {user.email}</p>
                <p>Ville: {user.city}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="navigation">
        <Link to="/register" className="register-link">
          S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default HomePage;