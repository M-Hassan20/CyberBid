import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - CyberBid";
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.user.role) {
        localStorage.setItem("role", data.user.role);
      }
      if (data.user.role === "seller") {
        navigate("/seller/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/live");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
    }
  };
  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Login</h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="text"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className="form-footer">
          <p>
            Don't have an account? <Link to="/register-buyer">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
