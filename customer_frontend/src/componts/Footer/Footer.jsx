import "./Footer.css";

import React from "react";
import { assest } from "../../assest/assest";
import { Link } from "react-router-dom";
// Import the same logo used in the navbar
import Navlogo3 from '../Navbar/Navlogo3.png';
// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={Navlogo3} alt="SOBA Industries Logo" className="footer-logo" />
          
          <p>
            Discover exceptional craftsmanship with SOBA Industries. We are dedicated to bringing your metal design ideas to life with precision, quality, and expert guidance.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
        
        <div className="footer-content-center">
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-content-right">
          <h2>Contact Us</h2>
          <div className="contact">
            <img src={assest.location_icon || "https://img.icons8.com/ios-filled/50/ffffff/marker.png"} alt="location" />
            <p>No 43, Castle Street, Kandy</p>
          </div>
          <div className="contact">
            <img src={assest.email_icon || "https://img.icons8.com/ios-filled/50/ffffff/email.png"} alt="email" />
            <p>soba@gmail.com</p>
          </div>
          <div className="contact">
            <img src={assest.phone_icon || "https://img.icons8.com/ios-filled/50/ffffff/phone.png"} alt="phone" />
            <p>+9471 6821170</p>
          </div>
        </div>
      </div>
      
      <hr />
      
      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} SOBA Industries. All rights reserved.</p>
        <div className="footer-terms">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
