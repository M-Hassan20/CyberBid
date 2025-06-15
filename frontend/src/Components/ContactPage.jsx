import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "./ContactPage.css";

const ContactPage = () => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/contact/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setFormStatus({
        submitted: true,
        error: false,
        message: "Thank you for your message! We'll get back to you soon.",
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setFormStatus({
        submitted: false,
        error: true,
        message: error.message || "Failed to send message. Please try again later.",
      });
    }
  };

  return (
    <div className={`contact-container ${darkMode ? "dark" : "light"}`}>
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="subtitle">We'd love to hear from you</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-section">
            <h2>Get in Touch</h2>
            <p>
              Have questions about Cyber Bid? Want to know more about our services or need
              help with your account? We're here to help!
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <div className="icon">📧</div>
                <div className="details">
                  <h3>Email</h3>
                  <p>k233027@nu.edu.pk</p>
                  <p>For general inquiries: k233038@nu.edu.pk</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="icon">📱</div>
                <div className="details">
                  <h3>Phone</h3>
                  <p>Customer Support: +92 336 1172244</p>
                  <p>Mon-Fri: 9am - 6pm EST</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="icon">📍</div>
                <div className="details">
                  <h3>Office</h3>
                  <p>NH5 FAST University, Karachi</p>
                  <p>Karachi, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            {formStatus.submitted && (
              <div className="form-message success">
                {formStatus.message}
              </div>
            )}
            
            {formStatus.error && (
              <div className="form-message error">
                {formStatus.message}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help you..."
                rows="6"
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How do I create an account?</h3>
            <p>
              You can create an account by clicking the "Sign Up" button in the navigation
              bar and following the registration process. It only takes a minute!
            </p>
          </div>
          <div className="faq-item">
            <h3>How do bidding and payments work?</h3>
            <p>
              When you win an auction, you'll receive a notification. You can then proceed
              to checkout and pay through our secure payment gateway.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I sell items on Cyber Bid?</h3>
            <p>
              Yes! Register as a seller to create listings and start your own auctions.
              Our seller dashboard makes it easy to manage your items.
            </p>
          </div>
          <div className="faq-item">
            <h3>What if I have an issue with a purchase?</h3>
            <p>
              Contact our support team immediately. We have a dispute resolution process 
              to ensure fair outcomes for both buyers and sellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;