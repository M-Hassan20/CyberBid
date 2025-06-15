import React from "react";
import { useTheme } from "../context/ThemeContext";
import "./AboutPage.css";

const AboutPage = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`about-container ${darkMode ? "dark" : "light"}`}>
      <div className="about-header">
        <h1>About Cyber Bid</h1>
        <p className="subtitle">Where Digital Auctions Meet Innovation</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2025, Cyber Bid emerged from a vision to revolutionize online auctions.
            We identified a gap in the digital marketplace for a secure, transparent, and
            user-friendly platform where buyers and sellers can connect with confidence.
          </p>
          <p>
            What started as a small team of tech enthusiasts has grown into a vibrant
            community of buyers, sellers, and auction aficionados from around the world.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            At Cyber Bid, we're committed to creating a dynamic online marketplace that
            empowers both buyers and sellers. We strive to:
          </p>
          <ul className="mission-list">
            <li>Provide a secure and transparent auction environment</li>
            <li>Connect passionate collectors with unique items</li>
            <li>Support sellers in reaching the right audience</li>
            <li>Innovate continuously to enhance the auction experience</li>
            <li>Build a community around shared interests and fair trade</li>
          </ul>
        </section>

        <section className="about-section two-column">
          <div className="column">
            <h2>For Buyers</h2>
            <p>
              Discover unique items, bid with confidence, and expand your collections.
              Our platform offers:
            </p>
            <ul>
              <li>Verified seller profiles</li>
              <li>Secure payment processing</li>
              <li>Live bidding with real-time updates</li>
              <li>Detailed item descriptions and authenticity guarantees</li>
              <li>User-friendly interface across all devices</li>
            </ul>
          </div>
          <div className="column">
            <h2>For Sellers</h2>
            <p>
              Reach enthusiastic buyers, maximize your item's value, and manage your
              auctions with ease. Sellers benefit from:
            </p>
            <ul>
              <li>Simple listing process with customization options</li>
              <li>Targeted exposure to interested buyers</li>
              <li>Real-time auction analytics</li>
              <li>Secure transaction processing</li>
              <li>Dedicated seller support</li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            Cyber Bid is powered by a diverse team of experts in technology, e-commerce,
            and customer experience. United by our passion for innovation and commitment
            to excellence, we work tirelessly to bring you the best online auction
            experience possible.
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">MH</div>
              <h3>Muhammad Hassan</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">BY</div>
              <h3>Bilal Yousuf</h3>
              <p>Co-Founder &CTO</p>
            </div>
          </div>
        </section>

        <section className="about-section values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Transparency</h3>
              <p>We believe in clear communication and honest business practices.</p>
            </div>
            <div className="value-card">
              <h3>Security</h3>
              <p>Your data and transactions are protected by cutting-edge technology.</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>We continuously improve our platform to meet evolving needs.</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>We foster connections between people with shared interests.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;