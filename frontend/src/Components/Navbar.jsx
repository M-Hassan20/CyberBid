import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { getCurrentUser, isAuthenticated, logout } from "../utils/authUtils";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

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

  const navbarClasses = `navbar ${darkMode ? "dark" : "light"} ${
    isAuthenticated() ? "authenticated" : ""
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="navbar-left">
        <div className="logo-space">
          <img src="/Logo.png" alt="logo" className="logo-space" />
        </div>
        <div className="site-name">
          <Link to="/" className="home-link">
            Cyber Bid
          </Link>
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
          {!isAuthenticated() ? (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register/buyer">
                Sign Up
              </Link>
            </>
          ) : null}
        </div>

        {isAuthenticated() && (
          <div className="navbar-profile-container">
            <div className="navbar-profile-icon" onClick={toggleDropdown}>
              <span>{user?.user_name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            {showDropdown && (
              <div className="navbar-dropdown-menu">
                {user?.role === "seller" ? (
                  <Link
                    to="/seller/dashboard"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                ) : user?.role === "admin" ? (
                  <Link to="/admin/dashboard" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="navbar-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                )}
                <button className="navbar-dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
