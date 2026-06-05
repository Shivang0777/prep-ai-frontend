import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

// 📡 DYNAMIC BASE URL FOR DEPLOYMENT MANAGEMENT

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const Register = () => {
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    const [showSmartPopup, setShowSmartPopup] = useState(false);
    const [existingUser, setExistingUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('userName');
        const token = localStorage.getItem('token');
        if (token && savedUser) {
            setExistingUser(savedUser);
            setTimeout(() => setShowSmartPopup(true), 1500);
        }
    }, []);

    const playAIVoice = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
        window.speechSynthesis.speak(utterance);
    };

    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Systems Online... 🤖 I'm Prep AI. Let's build your professional profile. What's your full name?" }
    ]);
    const [currentStep, setCurrentStep] = useState('name');
    const [inputValue, setInputValue] = useState('');
    const [revealedPassIds, setRevealedPassIds] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const [userData, setUserData] = useState({
        name: '', role: '', experience: '', english: '', focus: '', email: '', password: ''
    });

    useEffect(() => {
        if (!showSmartPopup) {
            const welcomeText = "Welcome to Prep AI. What is your full name?";
            const timer = setTimeout(() => playAIVoice(welcomeText), 1000);
            return () => clearTimeout(timer);
        }
    }, [showSmartPopup]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const addBotMessage = (text) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text }]);
            playAIVoice(text);
        }, 800);
    };

    const submitToBackend = async (finalData) => {
        try {
            // 🔄 DYNAMIC REPLACEMENT 1
            const response = await axios.post(`${API_URL}/api/signup`, finalData);
            localStorage.setItem('userName', finalData.name);
            localStorage.setItem('userEmail', finalData.email);
            if(response.data.token) localStorage.setItem('token', response.data.token);
            
            addBotMessage("All systems synced. Identity Card generated! 🎉");
            setTimeout(() => setIsCompleted(true), 1200);
        } catch (error) {
            addBotMessage("System Overload! ❌ Sync failed.");
        }
    };

    const handleSend = async (val) => {
        const input = (val || inputValue).trim();
        if (!input || isTyping) return;
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        const msgId = Date.now();
        const isPasswordType = currentStep.includes('password') || currentStep === 'otp';
        setMessages(prev => [...prev, { id: msgId, type: 'user', text: input, isPassword: isPasswordType }]);
        setInputValue('');
    
        let updatedData = { ...userData };
    
        if (currentStep === 'name') {
            updatedData.name = input;
            setUserData(updatedData);
            addBotMessage(`Nice to meet you! Choose your Role:`);
            setCurrentStep('role');
        } else if (currentStep === 'role') {
            updatedData.role = input;
            setUserData(updatedData);
            addBotMessage(`Experience Level?`);
            setCurrentStep('experience');
        } else if (currentStep === 'experience') {
            updatedData.experience = input;
            setUserData(updatedData);
            addBotMessage(`English proficiency?`);
            setCurrentStep('english');
        } else if (currentStep === 'english') {
            updatedData.english = input;
            setUserData(updatedData);
            addBotMessage(`Primary Focus Area?`);
            setCurrentStep('focus');
        } else if (currentStep === 'focus') {
            updatedData.focus = input;
            setUserData(updatedData);
            addBotMessage(`Enter your Email:`);
            setCurrentStep('email');
        } else if (currentStep === 'email') {
            if (!emailRegex.test(input)) {
                addBotMessage("That doesn't look like a valid email. Please check '@' and '.' 📧");
                return;
            }
            updatedData.email = input;
            setUserData(updatedData);
    
            // 🔄 DYNAMIC REPLACEMENT 2 (OTP SEND)
            try {
                setIsTyping(true);
                await axios.post(`${API_URL}/api/send-otp`, { email: input });
                addBotMessage(`Security Check: I've sent a 6-digit code to ${input}. Enter it below: 🛡️`);
                setCurrentStep('otp');
            } catch (error) {
                const errorMsg = error.response?.data?.message || "System Overload! OTP send failed.";
                addBotMessage(`❌ ${errorMsg}`);
            } finally {
                setIsTyping(false);
            }
    
        } else if (currentStep === 'otp') {
            // 🔄 DYNAMIC REPLACEMENT 3 (OTP VERIFY)
            try {
                setIsTyping(true);
                await axios.post(`${API_URL}/api/verify-otp`, { 
                    email: userData.email, 
                    otp: input 
                });
                addBotMessage("Identity Verified! ✅ Now, create a strong password.");
                setCurrentStep('password');
            } catch (error) {
                addBotMessage("Invalid or Expired OTP! Please try again. ❌");
            } finally {
                setIsTyping(false);
            }
    
        } 
        else if (currentStep === 'password') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
            if (!passwordRegex.test(input)) {
                addBotMessage("Password is too weak! ❌ It must contain:");
                addBotMessage("• Minimum 8 characters");
                addBotMessage("• One Uppercase & one Lowercase letter");
                addBotMessage("• One Number & one Special character (@$!%*?&)");
                return;
            }
    
            updatedData.password = input;
            setUserData(updatedData);
            
            addBotMessage("Strong password! ✅ Now, please re-type it to confirm:");
            setCurrentStep('confirmPassword');
        } 
        
        else if (currentStep === 'confirmPassword') {
            if (input !== userData.password) {
                addBotMessage("Mismatch! Passwords do not match. ❌");
                addBotMessage("Please enter a new strong password again:");
                
                updatedData.password = '';
                setUserData(updatedData);
                setCurrentStep('password');
            } else {
                addBotMessage("Identity Verified! ✅ Syncing with Prep AI servers... 📡");
                setIsTyping(true);
                submitToBackend(updatedData);
            }
        }
    };

    return (
        <div className="onboarding-full-page">
            <AnimatePresence>
                {showSmartPopup && (
                    <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="smart-identity-card">
                        <div className="smart-card-inner">
                            <div className="user-info">
                                <div className="avatar-circle">{existingUser?.charAt(0)}</div>
                                <div>
                                    <p className="welcome-back">Authorized User Detected</p>
                                    <p className="user-name">Continue as {existingUser}?</p>
                                </div>
                            </div>
                            <div className="smart-actions">
                                <button className="continue-btn" onClick={() => navigate('/dashboard')}>CONTINUE</button>
                                <button className="switch-btn" onClick={() => {
                                    setShowSmartPopup(false);
                                    localStorage.clear();
                                }}>NEW ENTITY</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="onboarding-nav">
                <div className="nav-logo">PREP <span>AI</span></div>
                <button className="nav-login-btn" onClick={() => navigate('/login')}>Already registered? <span>LOGIN</span></button>
            </div>

            <div className={`chat-flow ${showSmartPopup ? 'blur-bg' : ''}`}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} className={`msg-wrapper ${msg.type}`}>
                            <div className="chat-bubble">
                                {msg.isPassword ? (
                                    <div className="pass-reveal">
                                        <span>{revealedPassIds.includes(msg.id) ? msg.text : "••••••••"}</span>
                                        <button onClick={() => setRevealedPassIds(prev => prev.includes(msg.id) ? prev.filter(i => i !== msg.id) : [...prev, msg.id])}>
                                            {revealedPassIds.includes(msg.id) ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                ) : msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && <div className="typing-status" style={{color: 'var(--reg-muted)'}}>Prep AI is analyzing...</div>}
                </AnimatePresence>

                {!isCompleted && (
                    <div className="quick-actions" style={{display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px'}}>
                        {currentStep === 'role' && ['Frontend', 'Backend', 'Fullstack', 'Data Science'].map(opt => <button key={opt} onClick={() => handleSend(opt)} className="opt-chip">{opt}</button>)}
                        {currentStep === 'experience' && ['Fresher', 'Junior', 'Senior', 'Pro'].map(opt => <button key={opt} onClick={() => handleSend(opt)} className="opt-chip">{opt}</button>)}
                        {currentStep === 'english' && ['Beginner', 'Intermediate', 'Fluent'].map(opt => <button key={opt} onClick={() => handleSend(opt)} className="opt-chip">{opt}</button>)}
                        {currentStep === 'focus' && ['Coding', 'HR Rounds', 'Technical'].map(opt => <button key={opt} onClick={() => handleSend(opt)} className="opt-chip">{opt}</button>)}
                    </div>
                )}

                {isCompleted && (
                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="identity-card" style={{background: 'var(--reg-card-grad)', border: '1px solid var(--reg-bot-border)'}}>
                        <div className="card-top" style={{borderBottom: '1px solid var(--reg-bot-border)'}}>
                            <span className="chip">AI Verified Account</span>
                            <h3 style={{color: 'var(--reg-text)'}}>User Identity Card</h3>
                        </div>
                        
                        <div className="card-content">
                            <div className="id-field">
                                <label style={{color: 'var(--reg-muted)'}}>NAME</label>
                                <p style={{color: '#3b82f6'}}>{userData.name}</p>
                            </div>

                            <div className="id-split" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                <div className="id-field">
                                    <label style={{color: 'var(--reg-muted)'}}>ROLE</label>
                                    <p style={{color: 'var(--reg-text)'}}>{userData.role}</p>
                                </div>
                                <div className="id-field">
                                    <label style={{color: 'var(--reg-muted)'}}>LEVEL</label>
                                    <p style={{color: 'var(--reg-text)'}}>{userData.experience}</p>
                                </div>
                            </div>

                            <div className="id-split" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                <div className="id-field">
                                    <label style={{color: 'var(--reg-muted)'}}>FOCUS</label>
                                    <p style={{color: 'var(--reg-text)'}}>{userData.focus}</p>
                                </div>
                                <div className="id-field">
                                    <label style={{color: 'var(--reg-muted)'}}>ENGLISH</label>
                                    <p style={{color: 'var(--reg-text)'}}>{userData.english}</p>
                                </div>
                            </div>

                            <div className="id-field">
                                <label style={{color: 'var(--reg-muted)'}}>SECURE EMAIL</label>
                                <p style={{color: 'var(--reg-text)'}}>{userData.email}</p>
                            </div>
                        </div>

                        <button onClick={() => navigate('/dashboard')} className="launch-btn" style={{marginTop: '20px'}}>
                            Enter Dashboard 🚀
                        </button>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {!isCompleted && (
                <div className="bottom-bar">
                    <div className="input-pill">
                        <input type={currentStep.includes('password') || currentStep === 'otp' ? "password" : "text"} value={inputValue} placeholder="Type a message..." onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                        <button onClick={() => handleSend()}>➜</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;