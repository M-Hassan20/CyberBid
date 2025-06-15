import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
const RegisterSeller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    role: "seller",
  });
  useEffect(() => {
    document.title = "Register Seller - CyberBid";
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3000/register/seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      
      if(data.token) {
        localStorage.setItem('token', data.token);
      }
    if(data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    if(data.role) {
        localStorage.setItem('role', data.role);

    }
      navigate('/home');

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Register as a Seller</h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="user_name" placeholder="User Name" value={formData.user_name} onChange={handleChange} required/>
          <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
          <button type="submit">Register</button>
        </form>
        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};
export default RegisterSeller;