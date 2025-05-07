import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Voting System
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/about" className="navbar-item">About</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-item">Dashboard</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="navbar-item">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="navbar-item logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 