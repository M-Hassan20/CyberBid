import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { getCurrentUser, isAuthenticated, logout } from "../utils/authUtils";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-theme");
  };

  const logo = '../Logo.png';

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []); // Added dependency array to prevent infinite loop

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Determine navbar classes based on authentication state
  const navbarClasses = `navbar ${darkMode ? "dark" : "light"} ${isAuthenticated() ? "authenticated" : ""}`;

  return (
    <nav className={navbarClasses}>
      <div className="navbar-left">
        <div className="logo-space">
          <img src={logo} alt="" />
        </div>
        <div className="site-name">
          <Link to='/' className='home-link'>Cyber Bid</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/live">Live</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <div className="theme-toggle">
          <span>Light</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider round"></span>
          </label>
          <span>Dark</span>
        </div>

        <div className="user-actions">
          {isAuthenticated() ? (
            <>
              <span className="nav-welcome">
                Welcome, {user?.user_name || "User"}
              </span>
              <button className="nav-link-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register_buyer">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Only show profile icon for authenticated users */}
        {isAuthenticated() && (
          <div className="profile-icon">
            {/* Use first letter of username as default icon */}
            <span>{user?.user_name?.charAt(0)?.toUpperCase() || "U"}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;