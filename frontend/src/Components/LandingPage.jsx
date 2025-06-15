import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./LandingPage.css";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
    const { darkMode } = useTheme();
    
    useEffect(() => {
        document.title = "CyberBid - Your Auction Platform";
    });

    return (
        <div className={`landing-page ${darkMode ? "dark" : "light"}`}>
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to CyberBid</h1>
                    <p>
                        Unlock the power of online bidding with CyberBid, your ultimate destination for buying and selling unique items through competitive auctions. Whether you're a passionate seller or a savvy buyer, CyberBid offers a secure, intuitive, and feature-rich platform for all.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register/buyer" className="btn">Register as Buyer</Link>
                        <Link to="/register/seller" className="btn">Register as Seller</Link>
                    </div>
                </div>
            </div>

            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="how-columns">
                    <div className={`how-column ${darkMode ? "dark" : "light"}`}>
                        <h3>For Sellers</h3>
                        <ul>
                            <li>Create an account</li>
                            <li>List your items with a starting bid</li>
                            <li>Watch live bids roll in</li>
                            <li>Sell to the highest bidder securely</li>
                        </ul>
                    </div>
                    <div className={`how-column ${darkMode ? "dark" : "light"}`}>
                        <h3>For Buyers</h3>
                        <ul>
                            <li>Browse or search for items</li>
                            <li>Place real-time bids</li>
                            <li>Track your favorite auctions</li>
                            <li>Win and check out easily</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="about-us">
                <h2>About Us</h2>
                <p>
                    At <strong>CyberBid</strong>, we believe in transforming how people buy and sell goods online. Our platform combines cutting-edge technology with a user-friendly interface to bring you a seamless auction experience.
                </p>
                <p>
                    Whether you're selling rare collectibles or bidding on your next big find, CyberBid is built to empower your auction journey with transparency, security, and excitement.
                </p>
            </section>
        </div>
    );
};

export default LandingPage;
