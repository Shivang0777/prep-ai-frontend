import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const Login = () => {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(false);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const [existingUser, setExistingUser] = useState(null);
    const [showSmartPrompt, setShowSmartPrompt] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const token = localStorage.getItem('token');
        
        if (savedName && savedEmail) {
            setExistingUser({ name: savedName, email: savedEmail });
            setEmail(savedEmail); 

            if (!token) {
                setTimeout(() => setShowSmartPrompt(true), 1000);
            }
        }
    }, []);

    const handleAuthorize = async (e) => {
        if(e) e.preventDefault();
        setIsScanning(true);
        setErrorMessage('');

        try {
            // 🔄 DYNAMIC REPLACEMENT: localhost hatakar backticks ke sath API_URL bitha diya hai
            const response = await axios.post(`${API_URL}/api/login`, {
                email: email,
                password: pass
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('userEmail', response.data.user.email);
            
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (error) {
            setIsScanning(false);
            const errorText = error.response?.data?.message || "Connection Lost! Check Backend Server.";
            setErrorMessage(errorText);
        }
    };

    const handleSmartContinue = () => {
        const token = localStorage.getItem('token');
        
        if (token) {
            setIsScanning(true);
            setTimeout(() => navigate('/dashboard'), 1000);
        } else {
            setEmail(existingUser.email);
            setShowSmartPrompt(false);
            setTimeout(() => {
                const passInput = document.getElementById('access-key-input');
                if (passInput) {
                    passInput.focus();
                    passInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    };

    return (
        <div className="auth-portal-root">
            <AnimatePresence>
                {showSmartPrompt && !isScanning && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="smart-login-prompt"
                    >
                        <div className="smart-prompt-header">
                            <div className="avatar-mini">{existingUser.name ? existingUser.name.charAt(0) : 'U'}</div>
                            <div className="user-meta">
                                <h4>{existingUser.name}</h4>
                                <p>{existingUser.email}</p>
                            </div>
                            <button className="close-prompt" onClick={() => setShowSmartPrompt(false)}>×</button>
                        </div>
                        <button className="quick-auth-btn" onClick={handleSmartContinue}>
                            CONTINUE AS {existingUser.name ? existingUser.name.split(' ')[0].toUpperCase() : 'USER'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="neural-bg">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="node" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`
                    }} ></div>
                ))}
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={`verification-card ${showSmartPrompt ? 'blur-focus' : ''}`}
            >
                <AnimatePresence>
                    {isScanning && (
                        <motion.div 
                            initial={{ top: "-10%" }}
                            animate={{ top: "110%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="scanner-line"
                        />
                    )}
                </AnimatePresence>

                <div className="card-inner">
                    <div className="portal-header">
                        <div className="status-indicator">
                            <span className={isScanning ? "pulse-red" : "pulse-green"}></span>
                            {isScanning ? "DECRYPTING..." : "SYSTEM READY"}
                        </div>
                        <h1>Identity Verification</h1>
                    </div>

                    {errorMessage && (
                        <div className="error-display">⚠ {errorMessage}</div>
                    )}

                    <form onSubmit={handleAuthorize} className="auth-form">
                        <div className="cyber-input-group">
                            <label>Neural ID</label>
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            {/* 🎯 Border animation line fixed here */}
                            <div className="input-border"></div>
                        </div>

                        <div className="cyber-input-group">
                            <label>Access Key</label>
                            <input 
                                id="access-key-input"
                                type="password" 
                                placeholder="••••••••" 
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                required 
                            />
                            {/* 🎯 Border animation line fixed here */}
                            <div className="input-border"></div>
                        </div>

                        <button type="submit" disabled={isScanning} className={`auth-btn ${isScanning ? "loading" : ""}`}>
                            {isScanning ? "VERIFYING..." : "AUTHORIZE ACCESS ➜"}
                        </button>
                    </form>

                    <div className="portal-footer">
                        New Entity? <span onClick={() => navigate('/register')}>Register Node</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;