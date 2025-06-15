import { useState } from "react";
import RegisterBuyer from "./Components/RegisterBuyer";
import RegisterSeller from "./Components/RegisterSeller";
import LoginForm from "./Components/LoginForm";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import LivePage from "./Components/LivePage";
import LandingPage from "./Components/LandingPage";
import AboutPage from "./Components/AboutPage";
import ContactPage from "./Components/ContactPage";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import "./App.css";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import ProfilePage from "./Components/ProfilePage";
import SellerDashboard from "./Components/SellerDashboard";
import AdminDashboard from "./Components/AdminDashboard";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/register/buyer" element={<RegisterBuyer />} />
            <Route path="/register/seller" element={<RegisterSeller />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
