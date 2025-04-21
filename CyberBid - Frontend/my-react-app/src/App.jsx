import { useState } from "react";
import RegisterBuyer from "./Components/RegisterBuyer";
import RegisterSeller from "./Components/RegisterSeller";
import LoginForm from "./Components/LoginForm";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import AuctionDetails from "./Components/AuctionDetails";
import LandingPage from "./Components/LandingPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import "./App.css";


function App() {
  return (
    <>
      <Router>
      <Navbar />
        <div className="app-container">
          <Routes>
          <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register_buyer" element={<RegisterBuyer />} />
            <Route path="/register_seller" element={<RegisterSeller />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/auction_details" element={<AuctionDetails />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </>
  );
}

export default App;
