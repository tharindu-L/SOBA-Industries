import "./Footer.css";

import React from "react";
import { assest } from "../../assest/assest";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assest.expo} alt="SOBA Industries Logo" className="footer-logo" />
          
          <p>
            Discover exceptional craftsmanship with SOBA Industries. We are dedicated to bringing your metal design ideas to life with precision, quality, and expert guidance.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <img src={assest.facebook_icon} alt="Facebook" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
