import "./Footer.css";

import React from "react";
import { assest } from "../../assest/assest";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assest.expo} alt="FMS Education Logo" className="footer-logo" />
        
          
          <p>
          Discover exceptional craftsmanship with Iron Workshop. We are dedicated to helping you bring your ideas to life with precision, quality, and expert guidance. </p>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <img src={assest.facebook_icon} alt="Facebook" />
            </a>
            <a href="http://www.fiverr.com" target="_blank" rel="noopener noreferrer">
              <img src={assest.twitter_icon} alt="Twitter" />
            </a>
            <a href="linkedin.com/" target="_blank" rel="noopener noreferrer">
              <img src={assest.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Links</h2>
          <ul>
          <li><a href="#home">Home</a></li>
            <li><a href="#destinations">Services</a></li>
            <li><a href="#tours">Contact</a></li>
            <li><a href="#blog">About</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Get in Touch</h2>
          <ul>
            
            <div className="contact">
              <a href="tel:+94717577400" className="contact1">
                <img src={assest.phone} alt="Phone" />
                +94714032456 <br /> +94775734895
              </a>
            </div>
            <div className="contact">
              <a href="mailto:tharindu2002pathmasiri@gmail.com" className="contact">
                <img src={assest.email} alt="Email" />
                SOBAinfo@gmail.com
              </a>
            </div>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">© 2024 SOBA Industries™. All Rights Reserved.</p>
    </div>
  );
};

export default Footer;
