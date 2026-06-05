import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navebar.css";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import logoImg from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // --- THEME LOGIC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const height = useTransform(scrollY, [0, 100], [80, 65]);
  
  // Background color fix
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      "rgba(15, 17, 21, 0)", 
      theme === 'dark' ? "rgba(15, 17, 21, 0.95)" : "rgba(255, 255, 255, 0.95)"
    ]
  );

  // --- SCROLL LOGIC ---
  // Isme 'hero-section' add kiya hai top pe jane ke liye
  const handleNav = (id, path) => {
    setOpen(false); 
    if (location.pathname !== path) {
      navigate(path);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 400); 
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <motion.nav 
      className="main-nav"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height, 
        backgroundColor, 
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="nav-container">
        <div className="logo-section">
          {/* Logo par click karne se bhi top par jaye scroll hoke */}
          <div onClick={() => handleNav("top", "/")} className="brand-logo" style={{cursor: 'pointer'}}>
              <img src={logoImg} alt="Prep AI Logo" className="nav-custom-logo" />
              <span style={{ color: 'var(--text-main)' }}>PREP <span className="blue-accent">AI</span></span>
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setOpen(!open)} style={{ color: 'var(--text-main)' }}>
          {open ? "✕" : "☰"}
        </button>

        <ul className={`nav-links ${open ? "show" : ""}`}>
          {/* Home Link ko Scrollable banaya */}
          <li className="custom-li" onClick={() => handleNav("top", "/")} style={{ color: 'var(--text-dim)' }}>Home</li>
          
          <li className="custom-li" onClick={() => handleNav("features-section", "/")} style={{ color: 'var(--text-dim)' }}>Features</li>
          <li className="custom-li" onClick={() => handleNav("how-it-works-section", "/")} style={{ color: 'var(--text-dim)' }}>Methodology</li>
          <li className="custom-li" onClick={() => handleNav("about-section", "/")} style={{ color: 'var(--text-dim)' }}>ABOUT</li>
          
          {/* --- THEME TOGGLE BUTTON (With Animation for visibility) --- */}
          <li className="theme-toggle-li">
            <button onClick={toggleTheme} className="theme-switcher-btn" style={{ border: 'none', background: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? 
                    <FaSun size={20} color="#ffb800" /> : 
                    <FaMoon size={20} color="#6c5ce7" />
                  }
                </motion.div>
              </AnimatePresence>
            </button>
          </li>
        </ul>

        <div className="nav-btns">
          <Link to="/login" className="login-btn-minimal" style={{ color: 'var(--text-main)' }}>Sign In</Link>
          <Link to="/register" className="register-btn-solid">Get Started Free</Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;