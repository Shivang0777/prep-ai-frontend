import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Preloader.css"; // CSS neeche hai

const words = ["CONCEPT", "CODE", "EXECUTE", "Prep Ai "]; // Ye words change honge

const Preloader = () => {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    // Har word 0.2s ke baad badlega (total time adjust kar sakte ho)
    if (index === words.length - 1) return;

    const timeout = setTimeout(
      () => {
        setIndex(index + 1);
      },
      index === 0 ? 1000 : 150 // Pehla word der tak, baaki tez
    );

    return () => clearTimeout(timeout);
  }, [index]);

  // Animation Variants (Rejouice Style Slide Up)
  const slideUp = {
    initial: { top: 0 },
    exit: { 
      top: "-100vh", 
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 } 
    },
  };

  // Text Animation (Opacity + Y axis)
  const textAnim = {
    initial: { y: 20, opacity: 0 },
    enter: { 
        y: 0, 
        opacity: 1, 
        transition: { duration: 0.5, ease: "easeOut" } // Smooth entry
    },
    exit: { 
        y: -20, 
        opacity: 0,
        transition: { duration: 0.2 } // Fast exit
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="preloader-container"
    >
      {/* TEXT CONTAINER */}
      <div className="text-container">
          <AnimatePresence mode="wait">
            <motion.p
                key={index} // Key change hone par animation trigger hoga
                variants={textAnim}
                initial="initial"
                animate="enter"
                exit="exit"
                className="intro-text"
            >
                {words[index]}
            </motion.p>
          </AnimatePresence>
      </div>

      {/* SVG CURVE (Optional: Rejouice jaisa curve effect dene ke liye) */}
      {/* Simple rakhne ke liye abhi seedha slide up kar rahe hain */}
      
    </motion.div>
  );
};

export default Preloader;