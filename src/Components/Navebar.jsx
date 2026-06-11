import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navebar.css";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // ✨ Active Section Track karne ke liye State
  const [activeSection, setActiveSection] = useState("top");

  // --- THEME LOGIC ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- ✨ SCROLL SPY LOGIC (HIGHLIGHT ON SCROLL) ---
  useEffect(() => {
    // Agar hum home page par nahi hain, toh highlight karne ki zaroorat nahi
    if (location.pathname !== "/") return;

    const sections = ["top", "features-section", "how-it-works-section", "about-section"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -50% 0px", // Jab section screen ke beech mein aayega tab trigger hoga
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Saare sections ko observe karo
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Special check ekdum top ke liye jab scroll position 0 ho
    const handleScrollCheck = () => {
      if (window.scrollY < 100) {
        setActiveSection("top");
      }
    };
    window.addEventListener("scroll", handleScrollCheck);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollCheck);
    };
  }, [location.pathname]);

  const height = useTransform(scrollY, [0, 100], [80, 65]);
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      "rgba(15, 17, 21, 0)", 
      theme === 'dark' ? "rgba(15, 17, 21, 0.95)" : "rgba(255, 255, 255, 0.95)"
    ]
  );

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
          <div onClick={() => handleNav("top", "/")} className="brand-logo" style={{cursor: 'pointer'}}>
              <img src="/logo.png" alt="Prep AI Logo" className="nav-custom-logo" />
              <span className="brand-text" style={{ color: 'var(--text-main)' }}>PREP <span className="blue-accent">AI</span></span>
          </div>
        </div>

        {/* Links Menu with active dynamic classes */}
        <ul className={`nav-links ${open ? "show" : ""}`}>
          <li 
            className={`custom-li ${activeSection === "top" ? "active-link" : ""}`} 
            onClick={() => handleNav("top", "/")}
          >
            Home
          </li>
          <li 
            className={`custom-li ${activeSection === "features-section" ? "active-link" : ""}`} 
            onClick={() => handleNav("features-section", "/")}
          >
            Features
          </li>
          <li 
  className={`custom-li ${activeSection === "pricing-section" ? "active-link" : ""}`} 
  onClick={() => handleNav("pricing-section", "/")}
>
  Pricing
</li>
          <li 
            className={`custom-li ${activeSection === "how-it-works-section" ? "active-link" : ""}`} 
            onClick={() => handleNav("how-it-works-section", "/")}
          >
            Methodology
          </li>
          <li 
            className={`custom-li ${activeSection === "about-section" ? "active-link" : ""}`} 
            onClick={() => handleNav("about-section", "/")}
          >
            ABOUT
          </li>
          
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

        {/* Buttons aur Hamburger Container */}
        <div className="nav-right-side">
          <div className="nav-btns">
            <Link to="/login" className="login-btn-minimal" style={{ color: 'var(--text-main)' }}>Sign In</Link>
            <Link to="/register" className="register-btn-solid">Get Started Free</Link>
          </div>

          <button className="mobile-toggle" onClick={() => setOpen(!open)} style={{ color: 'var(--text-main)' }}>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;