import React from 'react';
import './Footer.css';
const Footer = () => {
    return (
      <footer className="footer">
        <p>© {new Date().getFullYear()} CyberBid. All rights reserved.</p>
        <p>Built with ❤️ for auction lovers.</p>
      </footer>
    );
  };
  
  export default Footer;
  