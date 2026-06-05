import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import HowItWorks from "./How_it_works"; 
import Features from "./Features"; 
import About from "./About"; 
import Footer from "../Footer"; 
import "./Home.css";
import logoImg from "../../assets/logo.png";

const Home = () => {
  const spotlightRef = useRef(null);
  const scope = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Spotlight/Cursor Glow Logic
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      gsap.to(spotlightRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    // GSAP Entrance Animations
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".hero-tag-neon", { y: -20, opacity: 0, duration: 0.8 })
        .from(".animate-line", { y: 50, opacity: 0, stagger: 0.15, duration: 1, ease: "power4.out" }, "-=0.4")
        .from(".hero-description", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
        .from(".btn-anim", { scale: 0.9, opacity: 0, stagger: 0.2, duration: 0.6, ease: "back.out(1.7)" }, "-=0.5")
        .from(".hero-right-content", { x: 50, opacity: 0, scale: 0.9, duration: 1.2, ease: "expo.out" }, "-=1");
    }, scope);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ctx.revert();
    };
  }, []);

  return (
    <div className="home-root" ref={scope}>
      {/* Background Cursor Glow */}
      <div ref={spotlightRef} className="cursor-glow"></div>

      <section className="hero-section">
        <div className="hero-grid-container">
          
          {/* Left Content */}
          <div className="hero-left">
            <div className="hero-tag-neon">✨ PREP AI INTERACTIVE</div>
            
            <h1 className="hero-heading">
  <div className="animate-line">Don’t Just Prepare.
  </div>
  <div className="animate-line neon-text">Let AI Engineer </div>
  <div className="animate-line">Your Professional Edge</div>
</h1>            
            <p className="hero-description">
            Move beyond static mock tests and boring forms. Step into a high-fidelity conversational grid where Prep AI live-analyzes your expertise, verifies your tech-stack, and synthesizes a bulletproof professional identity in real-time.
            </p>

            <div className="hero-action-group">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="btn-neon-pink btn-anim"
              >
                Get Started Free
              </motion.button>

              <button 
                className="btn-outline-glass btn-anim"
                onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })}
              >
                See Features
              </button>
            </div>

            <div className="user-stats-neon">
              <div className="avatar-pile">
                <div className="pile-circle p1"></div>
                <div className="pile-circle p2"></div>
                <div className="pile-circle p3"></div>
              </div>
              <p><span>●</span> Join 400k+ users today</p>
            </div>
          </div>

          {/* Right Content - Modern Logo Display */}
          <div className="hero-right">
            <div className="hero-right-content">
              <div className="visual-fallback">
                 {/* Decorative Glow Sphere */}
                 <div className="glow-sphere"></div>
                 
                 {/* Floating Tagda Logo */}
                 <motion.img 
                    src={logoImg} 
                    alt="Prep AI Logo" 
                    className="hero-main-logo"
                    initial={{ y: 0 }}
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                 />

                 <div className="floating-card">
                   <h3>AI Intelligence</h3>
                   <p>Powered by Prep AI</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Other Sections */}
      <div className="dark-content-wrap">
        <div id="how-it-works-section"><HowItWorks /></div>
        <div id="features-section"><Features /></div>
        <div id="about-section"><About /></div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;