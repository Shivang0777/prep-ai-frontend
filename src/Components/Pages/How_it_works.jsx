import React, { useState } from 'react';
import './HowItWorks.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaKeyboard, FaChartPie, FaCogs } from 'react-icons/fa';

const HowItWorks = () => {
    const [selectedStep, setSelectedStep] = useState(0);

    // 🗺️ UPDATED: 4-Step Production Matrix synced to actual app workflow
    const steps = [
        {
            title: "Terminal Onboarding",
            desc: "Chat with Prep AI to securely verify your credentials, lock your target stack, and instantly synthesize your custom professional identity card in real-time.",
            icon: <FaRocket />,
            color: "#3b82f6",
            coreTag: "10.1_AUTH"
        },
        {
            title: "Fluency Engineering",
            desc: "Enter the gamified English Coach to refine core grammar patterns, build active engineering vocabulary, and master real-world speech mechanics via voice challenges.",
            icon: <FaCogs />,
            color: "#8b5cf6",
            coreTag: "22.4_NLP"
        },
        {
            title: "Code Execution",
            desc: "Step into the live JavaScript Sandbox to solve core DSA and algorithmic logical loops with direct browser-driven execution and real-time optimization updates.",
            icon: <FaKeyboard />,
            color: "#10b981",
            coreTag: "40.8_JS_VM"
        },
        {
            title: "Adaptive Evaluation",
            desc: "Face an autonomous AI interviewer that tracks deep technical accuracy and live-calibrates question difficulties dynamically based on how you respond on the fly.",
            icon: <FaChartPie />,
            color: "#ec4899", // Premium Pink accent color for final evaluation step
            coreTag: "50.2_EVAL"
        }
    ];

    return (
        <section className="hiw-section" id="how-it-works-section">
            <div className="hiw-header">
                <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="hiw-tag"
                >
                    OUR PROCESS
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="hiw-main-title"
                >
                    <span>Methodology</span>
                </motion.h1>
            </div>

            <div className="hiw-grid">
                {/* Left: Interactive Tabs */}
                <div className="hiw-tabs-container">
                    <div className="progress-line">
                        <motion.div 
                            className="progress-fill" 
                            animate={{ height: `${((selectedStep + 1) / steps.length) * 100}%` }}
                            style={{ backgroundColor: steps[selectedStep].color }}
                        />
                    </div>

                    <div className="hiw-tabs-list">
                        {steps.map((step, index) => (
                            <div 
                                key={index}
                                className={`hiw-tab ${selectedStep === index ? 'active' : ''}`}
                                onClick={() => setSelectedStep(index)}
                            >
                                <div className="tab-content">
                                    <span className="step-no" style={{ color: selectedStep === index ? step.color : '#4b5563' }}>
                                        0{index + 1}
                                    </span>
                                    <h3>{step.title}</h3>
                                </div>
                                {selectedStep === index && (
                                    <motion.div 
                                        layoutId="tab-highlight"
                                        className="tab-highlight"
                                        style={{ backgroundColor: step.color }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: The 3D Glass Engine */}
                <div className="hiw-visual-engine">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={selectedStep}
                            initial={{ opacity: 0, rotateY: 20, translateZ: -100 }}
                            animate={{ opacity: 1, rotateY: 0, translateZ: 0 }}
                            exit={{ opacity: 0, rotateY: -20, translateZ: -100 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="engine-glass-card"
                        >
                            <div className="card-inner-blur" />
                            
                            <motion.div 
                                className="scanner-line-v2"
                                style={{ background: `linear-gradient(to bottom, transparent, ${steps[selectedStep].color}, transparent)` }}
                                animate={{ top: ["-100%", "200%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="engine-icon-v2" style={{ color: steps[selectedStep].color }}>
                                {steps[selectedStep].icon}
                            </div>
                            <h2>{steps[selectedStep].title}</h2>
                            <p>{steps[selectedStep].desc}</p>

                            <div className="engine-footer">
                                <span className="status-dot" style={{ backgroundColor: steps[selectedStep].color }}></span>
                                System Core: {steps[selectedStep].coreTag}
                            </div>

                            {/* Glow Spheres */}
                            <div className="glow-sphere" style={{ backgroundColor: steps[selectedStep].color }} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;