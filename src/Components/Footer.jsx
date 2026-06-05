import React from 'react';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaEnvelope, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    // Yahan apna 10-digit number daal (91 ke saath)
    const phoneNumber = "919876543210"; 

    return (
        <footer className="footer-main">
            <div className="footer-container">
                <div className="footer-top">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <h2 className="footer-logo">Prep AI</h2>
                        <p className="brand-text">Elevating your interview performance with real-time AI insights. Practice smarter, not harder.</p>
                        <div className="social-links">
                            <a href="#" target="_blank" rel="noreferrer"><FaLinkedin /></a>
                            <a href="#" target="_blank" rel="noreferrer"><FaGithub /></a>
                            <a href="#" target="_blank" rel="noreferrer"><FaTwitter /></a>
                            <a href="#" target="_blank" rel="noreferrer"><FaInstagram /></a>
                            
                            {/* CLEAN WHATSAPP LOGIC */}
                            <a 
                                href={`https://wa.me/${phoneNumber}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="wa-icon"
                            >
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#how-it-works-section">How it Works</a></li>
                            <li><a href="#features-section">Features</a></li>
                            <li><a href="/dashboard">Dashboard</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="footer-contact">
                        <h4>Get in Touch</h4>
                        <div className="contact-item">
                            <FaEnvelope className="contact-icon" />
                            <span>support@prepai.com</span>
                        </div>
                        {/* Phone number link ko bhi WhatsApp se connect kar diya */}
                        <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer" className="contact-item-link">
                            <div className="contact-item">
                                <FaPhoneAlt className="contact-icon" />
                                <span>+91 9876543210</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Prep AI. All rights reserved. | Built for the next generation of developers.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;