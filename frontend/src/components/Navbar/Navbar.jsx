import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaInfoCircle, FaBuilding, FaSignInAlt, FaUser } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import images from '../../assets/assets';
import './Navbar.css';

const Navbar = () => {
  const { userRole } = useContext(AuthContext); // Use AuthContext

  const handleLogoClick = () => {
    window.location.href = '/'; // Redirect to home page when logo is clicked
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleLogoClick}>
        <img src={images.logoF} alt="Logo" className="navbar-logo-image" />
        <h1>Apt Hub</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">
            <FaHome className="navbar-icon" />
            Home
          </Link>
        </li>
        <li>
          <Link to="/about">
            <FaInfoCircle className="navbar-icon" />
            About Us
          </Link>
        </li>
        <li>
          <Link to="/properties">
            <FaBuilding className="navbar-icon" />
            Listing
          </Link>
        </li>
      </ul>

      <div className="navbar-login">
        {userRole ? (
          <Link to={userRole === "tenant" ? "/tenant-profile" : "/landlord-profile"} className="dashboard-link">
            <FaUser className="navbar-icon" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className="login-register">
            <FaSignInAlt className="navbar-icon" />
            <span>Login / Register</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
