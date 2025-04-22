import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { getCurrentUser, isAuthenticated, logout } from "../utils/authUtils";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-theme");
  };

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const navbarClasses = `navbar ${darkMode ? "dark" : "light"} ${isAuthenticated() ? "authenticated" : ""}`;

  return (
    <nav className={navbarClasses}>
      <div className="navbar-left">
        <div className="logo-space">
          <img src="src/Logo.png" alt="logo" className="logo-space"/>
        </div>
        <div className="site-name">
          <Link to="/" className="home-link">Cyber Bid</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/live">Live</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>

      <div className="navbar-right">
        <div className="theme-toggle">
          <span>Light</span>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider round"></span>
          </label>
          <span>Dark</span>
        </div>

        <div className="user-actions">
          {!isAuthenticated() ? (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register_buyer">Sign Up</Link>
            </>
          ) : null}
        </div>

        {isAuthenticated() && (
          <div className="profile-container">
            <div className="profile-icon" onClick={toggleDropdown}>
              <span>{user?.user_name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>Profile</Link>
                <Link className="dropdown-item" onClick={handleLogout}>Logout</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
