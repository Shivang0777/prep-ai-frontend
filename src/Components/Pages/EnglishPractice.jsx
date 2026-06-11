import React, { useState, useEffect, useRef } from 'react';
import './EnglishPrep.css';
import { 
    FaBook, FaTools, FaFire, 
    FaArrowRight, FaLayerGroup, FaRegBell,
    FaVolumeUp, FaCode, FaTerminal, 
    FaServer, FaUser, FaDatabase, FaMobileAlt, 
    FaMicrophone, FaStop, FaMagic, 
    FaTimesCircle, FaCommentDots, FaStar, FaBolt,
    FaGlobe, FaLock, FaKey, FaCheck, 
    FaPen, FaCheckCircle, FaBriefcase, FaCompressAlt, FaLanguage,
    FaLightbulb, FaGlasses, FaBrain, FaExclamationTriangle ,
    FaCamera, FaVideo, FaVideoSlash, FaPlay, FaStopCircle, 
    FaChartPie,  FaUserTie,FaSync,FaChevronRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// --- RIGHT PANEL (STATS) ---
// 🔥 Simple Stats Panel Component with Gradient Text and Icons
const StatsPanel = ({ streak = 0, totalXP = 0, level = 1, accuracy = 0 }) => (
    <div className="stats-panel" style={{ width: '300px', minWidth: '300px' }}>
        <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 25, color: 'white', fontWeight: 600 }}>Your Dashboard</h3>
            
            {/* Streak Card */}
            <div className="stat-box">
                <div className="stat-header">Weekly Streak</div>
                <div className="stat-value" style={{ background: 'linear-gradient(to right, #f87171, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {streak} Days <FaFire color="#f87171" style={{ marginLeft: 5, fontSize: '1.5rem', verticalAlign: 'middle' }} />
                </div>
                <div className="stat-sub" style={{ color: '#f87171' }}>Keep the flame alive!</div>
            </div>

            {/* XP Card - Fixed toLocaleString Error */}
            <div className="stat-box">
                <div className="stat-header">Total XP</div>
                <div className="stat-value" style={{ background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {typeof totalXP === 'number' ? totalXP.toLocaleString() : totalXP} XP
                </div>
                <div className="stat-sub" style={{ color: '#60a5fa' }}>Level {level} Architect</div>
            </div>

            {/* Accuracy Card */}
            <div className="stat-box">
                <div className="stat-header">Accuracy Rate</div>
                <div className="stat-value" style={{ background: 'linear-gradient(to right, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {accuracy}%
                </div>
                <div className="stat-sub" style={{ color: '#4ade80' }}>Top 10% in batch</div>
            </div>
        </div>

        <div>
            <h3 style={{ fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, fontWeight: 700 }}>Recent Log</h3>
            <div className="activity-item">
                <span>Speaking Task</span> 
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{accuracy >= 80 ? '100' : '0'} XP</span>
            </div>
            <div className="activity-item"><span>Daily Bonus</span> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+10 XP</span></div>
        </div>
    </div>
);

// --- MODULE 1: READING (NASA VERSION 🚀) ---

const ReadModule = () => {
    // --- 🚀 AI & NAVIGATION ---
    const [questions, setQuestions] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [category, setCategory] = useState("System Design & Tech");

    // --- 🏆 GAMIFICATION STATES ---
    const [totalXP, setTotalXP] = useState(() => Number(localStorage.getItem('userXP')) || 0);
    const [streak, setStreak] = useState(() => Number(localStorage.getItem('userStreak')) || 0);
    const [showXpAnim, setShowXpAnim] = useState(false);

    // --- 🎙️ CORE STATES ---
    const [recording, setRecording] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [userTranscript, setUserTranscript] = useState(""); 
    const [accuracy, setAccuracy] = useState(0); 
    const [wpm, setWpm] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null); 
    const [speed, setSpeed] = useState(1.0); 

    // --- 🧠 REFS ---
    const startTimeRef = useRef(null); 
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null); 
    const audioChunksRef = useRef([]);

    // --- 🔄 FETCH QUESTIONS ---
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fetchSpeakingTasks = async (selectedCat = category) => {
        setLoadingQuestions(true);
        try {
            // 🔄 DYNAMIC REPLACEMENT: localhost hatakar API_URL bitha diya backticks mein
            const res = await fetch(`${API_URL}/api/coach/generate-questions?category=${selectedCat}`);
            const data = await res.json();
            if (data.questions) {
                const formatted = data.questions.map((q, i) => ({
                    id: i + 1, topic: selectedCat.toUpperCase(), level: i % 2 === 0 ? 'HARD' : 'MEDIUM', xp: 100, text: q
                }));
                setQuestions(formatted);
                setCurrentIndex(0);
                resetState();
            }
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoadingQuestions(false); }
    };

    // --- 🔥 STREAK LOGIC ---
    useEffect(() => {
        const lastDate = localStorage.getItem('lastPracticeDate');
        const today = new Date().toDateString();
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDate === yesterday.toDateString()) {
                setStreak(prev => {
                    const s = prev + 1;
                    localStorage.setItem('userStreak', s);
                    return s;
                });
            } else if (!lastDate) {
                setStreak(1);
                localStorage.setItem('userStreak', 1);
            } else {
                setStreak(1);
                localStorage.setItem('userStreak', 1);
            }
            localStorage.setItem('lastPracticeDate', today);
        }
    }, []);

    // --- 🎙️ SPEECH ENGINE ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interimTranscript += event.results[i][0].transcript;
                }
                setUserTranscript(interimTranscript);

                if (questions.length > 0 && questions[currentIndex]) {
                    const target = questions[currentIndex].text.toLowerCase().replace(/[.,!]/g, "");
                    const spoken = interimTranscript.toLowerCase();
                    const targetWords = target.split(/\s+/);
                    const spokenWords = spoken.split(/\s+/);
                    
                    let matches = 0;
                    targetWords.forEach(word => {
                        if (spokenWords.includes(word)) matches++;
                    });

                    setAccuracy(Math.floor((matches / targetWords.length) * 100));

                    if (startTimeRef.current) {
                        const wordCount = spokenWords.length;
                        const minutes = (Date.now() - startTimeRef.current) / 1000 / 60;
                        setWpm(Math.round(wordCount / Math.max(minutes, 0.01)));
                    }
                }
            };
        }
        if (questions.length === 0) fetchSpeakingTasks();
    }, [questions, currentIndex]);

    const speakSingleWord = (word) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word.replace(/[.,!]/g, ""));
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    };

    const handleSpeakAll = () => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(questions[currentIndex].text);
        u.rate = speed;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
    };

    const toggleRecording = async () => {
        if (recording) {
            setRecording(false);
            recognitionRef.current.stop();
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        } else {
            resetState();
            startTimeRef.current = Date.now();
            recognitionRef.current.start();
            setRecording(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    setAudioUrl(URL.createObjectURL(blob));
                };
                mediaRecorderRef.current.start();
            } catch (err) { console.error("Mic Error:", err); }
        }
    };

    const handleNextAndSave = () => {
        let earnedXP = 0;
        let showWarning = false;
    
        if (accuracy >= 80) {
            earnedXP = 100;
        } else if (accuracy >= 50) {
            earnedXP = 20; 
            showWarning = true;
        }
    
        if (showWarning) {
            const proceed = window.confirm(`⚠️ Accuracy is ${accuracy}%. You'll only earn 20 XP. Proceed or try again for 100?`);
            if (!proceed) return;
        }
    
        if (earnedXP > 0) {
            playSuccessSound();
            setShowXpAnim(true);
            setTimeout(() => setShowXpAnim(false), 1500);
            const newXP = totalXP + earnedXP;
            setTotalXP(newXP);
            localStorage.setItem('userXP', newXP.toString());
            window.dispatchEvent(new Event("xpUpdated"));
        }
    
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetState();
        } else {
            fetchSpeakingTasks();
        }
    };

    const resetState = () => {
        setUserTranscript(""); setAccuracy(0); setWpm(0); setAudioUrl(null);
        window.speechSynthesis.cancel();
    };

    const playSuccessSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    };

    const level = Math.floor(totalXP / 1000) + 1;
    const progressInLevel = (totalXP % 1000) / 10;
    const currentData = questions[currentIndex] || { text: "", topic: "AI", xp: 100 };

    return (
        <div className="practice-page-layout" style={{ 
            display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', 
            gap: '20px', padding: '30px', background: 'var(--bg-main)', minHeight: '100vh', width: '100%', 
            boxSizing: 'border-box', overflowX: 'hidden' 
        }}>
            
            <div style={{ flex: '1', maxWidth: '900px', position: 'relative', overflow: 'visible' }}>
                <div className="module-card" style={{ 
                    position: 'relative', overflow: 'visible', width: '100%',
                    background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', padding: '25px'
                }}>
                    
                    {/* 🏆 TOP XP BAR */}
                    <div style={{background:'var(--bg-sidebar)', padding:'20px', borderRadius:'16px', marginBottom: 25, border:'1px solid var(--border)', position: 'relative'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: 10}}>
                            <div style={{color:'var(--accent)', fontWeight:800, fontSize: '1.1rem'}}>🔥 STREAK: {streak} DAYS</div>
                            <div style={{textAlign: 'right'}}>
                                <span style={{color:'#facc15', fontWeight:900, fontSize: '1.2rem'}}>💰 {totalXP} XP</span>
                                <div style={{color:'#4ade80', fontSize: '0.8rem', fontWeight:'bold'}}>RANK: LEVEL {level}</div>
                            </div>
                        </div>
                        
                        <div style={{width: '100%', height: 6, background: 'var(--border)', borderRadius: 10, overflow: 'hidden'}}>
                            <div style={{width: `${progressInLevel}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #4ade80)', boxShadow: '0 0 10px #3b82f6'}} />
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', marginTop: 5}}>
                            <small style={{color: 'var(--text-dim)'}}>LVL {level}</small>
                            <small style={{color: 'var(--text-dim)'}}>{totalXP % 1000} / 1000 XP</small>
                            <small style={{color: 'var(--text-dim)'}}>LVL {level + 1}</small>
                        </div>
                    </div>
    
                    {/* HEADER & CATEGORY */}
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
                        <select value={category} onChange={(e) => { setCategory(e.target.value); fetchSpeakingTasks(e.target.value); }}
                            style={{ background: 'var(--bg-sidebar)', color: 'var(--accent)', border: '1px solid var(--border)', padding: '8px 15px', borderRadius: 10, fontWeight:'bold', cursor:'pointer' }}>
                            <option value="System Design & Tech">💻 Technical</option>
                            <option value="Business Meetings">💼 Business</option>
                            <option value="General Conversation">🏠 General</option>
                        </select>
                        <h2 style={{color: 'var(--accent)', fontSize: '1.5rem'}}>{currentData.topic}</h2>
                    </div>
                    
                    {/* 📝 INTERACTIVE TEXT BOX */}
                    <div style={{ background:'var(--bg-sidebar)', color: 'var(--text-main)', padding:35, borderRadius:20, lineHeight:1.7, fontSize:'1.5rem', borderLeft: '5px solid var(--accent)', minHeight: '150px', marginBottom: 25 }}>
                        {currentData.text.split(" ").map((word, index) => {
                            const clean = word.toLowerCase().replace(/[.,!]/g, "");
                            const isMatched = userTranscript.toLowerCase().includes(clean);
                            return (
                                <span key={index} onClick={() => speakSingleWord(word)}
                                    style={{ color: !userTranscript ? 'var(--text-dim)' : isMatched ? '#4ade80' : '#ef4444', marginRight: '10px', cursor: 'pointer', display: 'inline-block' }}>
                                    {word}
                                </span>
                            );
                        })}
                    </div>
    
                    {/* 📊 LIVE STATS & AUDIO */}
                    <div style={{marginBottom: 25, display: 'flex', gap: 20}}>
                        <div style={{flex: 1, padding: 15, background: 'var(--bg-main)', borderRadius: 12, border: '1px dashed var(--border)'}}>
                            <small style={{color: 'var(--text-dim)'}}>TRANSCRIPT:</small>
                            <p style={{color: 'var(--text-main)', fontStyle:'italic', margin: '10px 0'}}>"{userTranscript || "Ready..."}"</p>
                            {audioUrl && !recording && <audio controls src={audioUrl} style={{width: '100%', height: 30, marginTop: 15}} />}
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap: 10, justifyContent:'center'}}>
                            <div style={{width: '100px', textAlign:'center', border: `1px solid ${accuracy >= 50 ? '#4ade80' : '#f43f5e'}`, borderRadius: 10, padding: '5px', background:'var(--bg-main)'}}>
                                <div style={{color: accuracy >= 50 ? '#4ade80' : '#f43f5e', fontWeight: 800}}>{accuracy}%</div>
                                <small style={{fontSize: '0.6rem', color: 'var(--text-dim)'}}>ACCURACY</small>
                            </div>
                            <div style={{width: '100px', textAlign:'center', border: '1px solid var(--accent)', borderRadius: 10, padding: '5px', background:'var(--bg-main)'}}>
                                <div style={{color: 'var(--accent)', fontWeight: 800}}>{wpm}</div>
                                <small style={{fontSize: '0.6rem', color: 'var(--text-dim)'}}>WPM</small>
                            </div>
                        </div>
                    </div>
    
                    {/* 🕹️ CONTROLS */}
                    <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center'}}>
                        <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                            <button onClick={toggleRecording} style={{padding: '12px 30px', borderRadius: 50, background: recording ? '#ef4444' : 'var(--accent)', color:'white', border:'none', fontWeight:'bold', cursor:'pointer'}}>
                                {recording ? 'Stop' : 'Record'}
                            </button>
                            
                            <div style={{display:'flex', alignItems:'center', background:'var(--bg-main)', borderRadius:'50px', border:'1px solid var(--accent)'}}>
                                <button onClick={handleSpeakAll} style={{background: 'transparent', border: 'none', color: 'var(--accent)', padding: '10px 15px', cursor: 'pointer', fontWeight:'bold'}}>🔈 Listen</button>
                                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{background:'transparent', color:'var(--accent)', border:'none', borderLeft:'1px solid var(--accent)', padding:'0 5px', outline:'none'}}>
                                    <option value="0.8">0.8x</option><option value="1.0">1.0x</option><option value="1.2">1.2x</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style={{display:'flex', gap: 10}}>
                            <button onClick={() => { if(currentIndex > 0) setCurrentIndex(c => c-1); resetState(); }} 
                                style={{background: 'var(--bg-sidebar)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', cursor:'pointer'}}>
                                Prev
                            </button>

                            {/* 🔥 Updated Button for Partial Rewards Logic */}
                            <button 
                                onClick={handleNextAndSave} 
                                disabled={accuracy < 50}
                                style={{
                                    background: accuracy < 50 ? 'var(--border)' : accuracy >= 80 ? 'var(--accent)' : '#f59e0b', 
                                    color: 'white', padding: '12px 30px', borderRadius: 10, border:'none', 
                                    fontWeight:'bold', cursor: accuracy < 50 ? 'not-allowed' : 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                {accuracy < 50 ? `Locked
                                 (${accuracy}%)`
                                  : accuracy >= 80 ? 
                                  'Next & Save +100 XP' : 
                                  'Next & Save +20 XP'
                                  }

                                  
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* --- 🟧 RIGHT SECTION: YOUR DASHBOARD PANEL --- */}
            <div style={{ width: '320px', flexShrink: 0, position: 'sticky', top: '30px' }}>
                <StatsPanel 
                    streak={streak} 
                    totalXP={totalXP} 
                    level={level} 
                    accuracy={accuracy} 
                />
            </div>
        </div>
    );
};



// --- MODULE 2: VOCAB (CLICK WORD TO SPEAK 🔊 + SCENE) ---
// --- MODULE 2: VOCAB (WITH TRADE-OFFS ⚖️) ---
// --- MODULE 2: VOCAB (FINAL ARCHITECT EDITION 🏗️) ---
// --- MODULE 2: VOCAB (ULTIMATE DEV EDITION 💻) ---

// --- MODULE 2: VOCAB (SCALABLE ARCHITECT EDITION 🏗️) ---
const VocabModule = () => {
    const [index, setIndex] = useState(0);
    const [mode, setMode] = useState('tech'); 
    const [showScenario, setShowScenario] = useState(false);
    const [mastered, setMastered] = useState(false);
    const [showCode, setShowCode] = useState(false);

    // 🔥 MASTER DATA: Sirf yahan naye words add karne hain
    const concepts = [
        {
            word: "API", 
            tag: "COMMUNICATION", color: "#3b82f6",
            techDef: "A set of rules allowing different software applications to communicate.",
            simpleDef: "Like a Waiter. You order food, Waiter (API) takes it to Kitchen (Server) and brings food back.",
            question: "How does frontend talk to backend?",
            answer: "I use RESTful **APIs** to fetch data asynchronously.",
            companies: ["Google", "Uber"],
            hack: "API = A Perfect Intermediary (Waiter)",
            pros: ["Security (Hides server logic)", "Scalability"],
            cons: ["Latency (Network hops)", "Complexity"],
            mistake: "Thinking API is a Database. It's NOT storage, it's a bridge.",
            vsTopic: "API vs Webhooks",
            vsDiff: "API asks (Pull). Webhook sends (Push).",
            codeTitle: "JS Fetch Example",
            code: `const res = await fetch('/api/data');\nconst data = await res.json();`,
            
            // 🎨 SMART DIAGRAM SETTINGS
            diagramType: "CLIENT_SERVER", // Template 1 Use karo
            diagramLabels: { left: "Client", middle: "API", right: "Server" }
        },
        {
            word: "LATENCY", 
            tag: "PERFORMANCE", color: "#ef4444",
            techDef: "The delay before a transfer of data begins following an instruction for its transfer.",
            simpleDef: "Imagine ordering pizza. Latency is the time between hanging up the phone and the doorbell ringing.",
            question: "Why is the app slow?",
            answer: "High **LATENCY** in the network. We need a CDN.",
            companies: ["Netflix", "Zoom"],
            hack: "Late-ency = How 'Late' the data is.",
            pros: ["Low Latency = Better UX", "Real-time capability"],
            cons: ["Hard to minimize globally", "Expensive infrastructure"],
            mistake: "Confusing Latency with Bandwidth.",
            vsTopic: "Latency vs Throughput",
            vsDiff: "Latency is Speed. Throughput is Volume.",
            codeTitle: "Measuring Latency",
            code: `const start = Date.now();\nawait fetch('/server');\nconsole.log(Date.now() - start);`,

            // 🎨 SMART DIAGRAM SETTINGS
            diagramType: "FLOW", // Template 2 Use karo
            diagramLabels: { status: "High Delay..." }
        },
        {
            word: "SCALABILITY", 
            tag: "ARCHITECTURE", color: "#10b981",
            techDef: "The capability of a system to handle a growing amount of work by adding resources.",
            simpleDef: "If your shop gets 1000 customers instead of 10, Scalability means quickly adding more counters.",
            question: "Can this handle 1M users?",
            answer: "Yes, I designed it for horizontal **SCALABILITY**.",
            companies: ["Amazon", "Flipkart"],
            hack: "Scale = Size. Ability to resize.",
            pros: ["Handles traffic spikes", "Zero downtime"],
            cons: ["Data consistency issues", "Higher cost"],
            mistake: "Thinking 'Bigger Server' is the only way.",
            vsTopic: "Scalability vs Performance",
            vsDiff: "Performance is for 1 user. Scalability is for 1000.",
            codeTitle: "Node.js Cluster",
            code: `if (cluster.isMaster) {\n  os.cpus().forEach(() => cluster.fork());\n}`,

            // 🎨 SMART DIAGRAM SETTINGS
            diagramType: "CLUSTER", // Template 3 Use karo
            diagramLabels: { top: "Traffic", node: "Node" }
        },
        // 👇 FUTURE MEIN AGAR TUJHE "LOAD BALANCER" ADD KARNA HAI TO BAS YE COPY PASTE KAR:
        {
            word: "LOAD BALANCER", 
            tag: "SYSTEM DESIGN", color: "#8b5cf6",
            techDef: "A device that distributes network or application traffic across a number of servers.",
            simpleDef: "Like a Traffic Cop directing cars to empty lanes.",
            question: "How to handle 10k req/sec?",
            answer: "I use Nginx as a **Load Balancer**.",
            companies: ["Meta", "LinkedIn"],
            hack: "Balance the Load.",
            pros: ["Prevents crash", "High Availability"],
            cons: ["Single point of failure", "Complex Setup"],
            mistake: "Not using Sticky Sessions.",
            vsTopic: "L4 vs L7 LB",
            vsDiff: "L4 is Transport (IP). L7 is Application (URL).",
            codeTitle: "Nginx Config",
            code: `upstream backend {\n server s1.com;\n server s2.com;\n}`,

            // 🎨 LOGIC: Load Balancer bhi "Client-Server" jaisa hi dikhta hai
            diagramType: "CLIENT_SERVER", 
            diagramLabels: { left: "User", middle: "Balancer", right: "Servers" }
        }
    ];

    const current = concepts[index];

    // 🏭 THE DIAGRAM FACTORY (Ye Code 200 words ke liye same rahega)
    const renderDiagram = () => {
        const type = current.diagramType || "DEFAULT"; 
        const labels = current.diagramLabels || {};    
        const iconStyle = { fontSize: '1.5rem', color: 'var(--text-dim)' };
        const arrowStyle = { color: current.color, fontSize: '0.8rem', fontWeight:'bold' };

        // TEMPLATE 1: CLIENT -> MIDDLE -> SERVER
        if (type === "CLIENT_SERVER") {
            return (
                <div style={{display:'flex', alignItems:'center', gap: 15, background:'var(--bg-card)', padding:'15px', borderRadius:'12px', border:'1px dashed var(--border)'}}>
                    <div style={{textAlign:'center'}}><FaUser style={{...iconStyle, color:'#fff'}} /><br/><small>{labels.left}</small></div>
                    <div style={arrowStyle}>➡</div>
                    <div style={{textAlign:'center', border:`1px solid ${current.color}`, padding:'5px', borderRadius:'6px', color:current.color}}>
                        {labels.middle}<br/><FaGlobe/>
                    </div>
                    <div style={arrowStyle}>➡</div>
                    <div style={{textAlign:'center'}}><FaDatabase style={iconStyle} /><br/><small>{labels.right}</small></div>
                </div>
            );
        }

        // TEMPLATE 2: ANIMATED BAR (FLOW)
        if (type === "FLOW") {
            return (
                <div style={{display:'flex', alignItems:'center', gap: 10, background:'var(--bg-card)', padding:'15px', borderRadius:'12px', border:'1px dashed var(--border)'}}>
                    <FaMobileAlt style={{...iconStyle, color:'#fff'}} />
                    <div style={{flex:1, height: 2, background:'var(--border)', position:'relative', minWidth: 60}}>
                        <motion.div 
                            animate={{ left: ['0%', '100%'] }} 
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            style={{width: 8, height: 8, background: current.color, borderRadius:'50%', position:'absolute', top: -3}} 
                        />
                    </div>
                    <FaServer style={iconStyle} />
                    <small style={{color: current.color, fontSize:'0.7rem'}}>{labels.status}</small>
                </div>
            );
        }

        // TEMPLATE 3: 1 TO MANY (CLUSTER)
        if (type === "CLUSTER") {
            return (
                <div style={{display:'flex', alignItems:'center', gap: 15, background:'var(--bg-card)', padding:'15px', borderRadius:'12px', border:'1px dashed var(--border)'}}>
                    <FaUser style={{...iconStyle, color:'#fff'}} />
                    <div style={arrowStyle}>{labels.top || "Traffic"} ➡</div>
                    <div style={{display:'flex', flexDirection:'column', gap: 5}}>
                        {[1, 2, 3].map(n => (
                            <div key={n} style={{border:`1px solid ${current.color}`, padding:'2px', fontSize:'0.6rem', color:current.color, borderRadius:'3px'}}>
                                <FaServer style={{fontSize:'0.6rem'}}/> {labels.node} {n}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const speakWord = () => {
        const utterance = new SpeechSynthesisUtterance(current.word);
        window.speechSynthesis.speak(utterance);
    };

    const handleMastered = () => {
        setMastered(true); 
        setTimeout(() => {
            setMastered(false);
            setShowScenario(false);
            setShowCode(false); 
            setMode('tech');
            setIndex((prev) => (prev + 1) % concepts.length);
        }, 1200);
    };

    return (
        <div className="module-card" style={{ 
            padding: 0, overflow: 'hidden', 
            background: 'linear-gradient(145deg, var(--bg-card), var(--bg-card))', 
            border: '1px solid var(--border)', minHeight: '1050px', display: 'flex', flexDirection: 'column', 
            borderRadius: '16px', position: 'relative'
        }}>
            {/* PROGRESS */}
            <div style={{width:'100%', height: 4, background:'#21262d'}}>
                <motion.div animate={{ width: `${((index + 1) / concepts.length) * 100}%` }} style={{height:'100%', background: current.color, boxShadow: `0 0 10px ${current.color}`}} />
            </div>

            {/* HEADER */}
            <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div style={{ background: `${current.color}20`, border: `1px solid ${current.color}`, padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', color: current.color }}>
                    {current.tag}
                </div>
                <div style={{display:'flex', gap: 5}}>
                    {current.companies.map((co, i) => (
                        <span key={i} style={{fontSize:'0.65rem', background:'var(--border)', color:'var(--text-dim)', padding:'2px 8px', borderRadius:'4px', border:'1px solid #444'}}>{co}</span>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 30px', zIndex: 2 }}>
                {/* WORD */}
                <div style={{marginTop: 5, marginBottom: 15, textAlign: 'center', cursor: 'pointer'}} onClick={speakWord}>
                    <motion.h1 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    style={{ fontSize: '3.5rem',
                     fontWeight: 900,
                      margin: 0,
                      color: current.color,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 15 }}>
                        {current.word} <FaVolumeUp size={25} style={{ opacity: 0.5, color: current.color }} />
                    </motion.h1>
                    <small style={{color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: 1}}>TAP TO PRONOUNCE</small>
                </div>

                {/* MEMORY HACK */}
                <div style={{marginBottom: 20, background:'rgba(255, 193, 7, 0.1)', border:'1px solid #ffc107', padding:'5px 15px', borderRadius:'20px', fontSize:'0.8rem', color:'#ffc107', display:'flex', alignItems:'center', gap: 8}}>
                    <FaLightbulb /> <b>Memory Hack:</b> "{current.hack}"
                </div>

                {/* 📐 DIAGRAM (DYNAMIC) */}
                <div style={{marginBottom: 20, width: '100%', display:'flex', justifyContent:'center'}}>
                    {renderDiagram()}
                </div>

                {/* TOGGLE */}
                <div style={{ background: '#21262d', padding: '4px', borderRadius: '50px', display: 'inline-flex', marginBottom: 20, border: '1px solid var(--border)' }}>
                    <button onClick={() => setMode('tech')} style={{ padding: '8px 20px', borderRadius: '40px', border: 'none', cursor: 'pointer', background: mode === 'tech' ? current.color : 'transparent', color: mode === 'tech' ? '#000' : 'var(--text-dim)', fontWeight: 'bold' }}>Technical</button>
                    <button onClick={() => setMode('simple')} style={{ padding: '8px 20px', borderRadius: '40px', border: 'none', cursor: 'pointer', background: mode === 'simple' ? '#fff' : 'transparent', color: mode === 'simple' ? '#000' : 'var(--text-dim)', fontWeight: 'bold' }}>Simple</button>
                </div>

                {/* DEF */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', minHeight: '80px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign:'center', marginBottom: 20 }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-main)', fontStyle: mode === 'simple' ? 'italic' : 'normal', margin:0 }}>
                        {mode === 'tech' ? current.techDef : `"${current.simpleDef}"`}
                    </p>
                </div>

                {/* 💻 CODE SNIPPET */}
                <div style={{width:'100%', marginBottom: 20}}>
                     <button onClick={() => setShowCode(!showCode)} style={{width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', color:'#58a6ff', padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span><FaCode /> {showCode ? "Hide Implementation" : "View Code Implementation"}</span>
                        <span>{showCode ? "▼" : "▶"}</span>
                     </button>
                     <AnimatePresence>
                        {showCode && (
                            <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} style={{overflow:'hidden', background:'#000', borderRadius:'0 0 8px 8px', border:'1px solid var(--border)', borderTop:'none'}}>
                                <div style={{padding:'5px 10px', background:'#21262d', color:'var(--text-dim)', fontSize:'0.7rem', fontFamily:'monospace'}}>{current.codeTitle}.js</div>
                                <pre style={{margin:0, padding:'15px', color:'#a5d6ff', fontFamily:'monospace', fontSize:'0.8rem', overflowX:'auto'}}>
                                    {current.code}
                                </pre>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>

                {/* ⚔️ VS MODE */}
                <div style={{width:'100%', background:'linear-gradient(90deg, var(--bg-card), var(--bg-card))', border:'1px solid var(--border)', borderRadius:'12px', padding:'12px', marginBottom: 20, position:'relative', overflow:'hidden'}}>
                     <div style={{position:'absolute', right: 0, top: 0, fontSize:'3rem', opacity: 0.1, fontWeight:'900', color:'#fff', lineHeight:1}}>VS</div>
                     <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 5}}>
                        <span style={{fontSize:'1rem'}}>⚔️</span>
                        <span style={{color: '#fff', fontWeight:'bold', fontSize:'0.9rem'}}>{current.vsTopic}</span>
                     </div>
                     <p style={{color:'var(--text-dim)', fontSize:'0.85rem', margin:0, fontStyle:'italic'}}>"{current.vsDiff}"</p>
                </div>

                {/* ⚖️ TRADE-OFFS */}
                <div style={{width:'100%', display:'flex', gap: 10, marginBottom: 20}}>
                    <div style={{flex:1, background: 'rgba(35, 134, 54, 0.1)', borderLeft: '3px solid #238636', padding: '10px', borderRadius: '0 8px 8px 0'}}>
                        <div style={{color:'#238636', fontSize:'0.6rem', fontWeight:'bold', marginBottom:5, textTransform:'uppercase'}}>Pros</div>
                        {current.pros.map((p, i) => <div key={i} style={{fontSize:'0.7rem', color:'var(--text-main)', marginBottom: 2}}>✓ {p}</div>)}
                    </div>
                    <div style={{flex:1, background: 'rgba(218, 54, 51, 0.1)', borderLeft: '3px solid #da3633', padding: '10px', borderRadius: '0 8px 8px 0'}}>
                        <div style={{color:'#da3633', fontSize:'0.6rem', fontWeight:'bold', marginBottom:5, textTransform:'uppercase'}}>Cons</div>
                        {current.cons.map((c, i) => <div key={i} style={{fontSize:'0.7rem', color:'var(--text-main)', marginBottom: 2}}>✖ {c}</div>)}
                    </div>
                </div>

                {/* 🚩 RED FLAG */}
                <div style={{width:'100%', background:'rgba(255, 165, 0, 0.1)', border:'1px dashed orange', padding:'10px', borderRadius:'8px', marginBottom: 20, display:'flex', gap:10, alignItems:'center'}}>
                    <FaExclamationTriangle color="orange" size={20} />
                    <div style={{fontSize:'0.8rem', color:'var(--text-main)'}}>
                        <strong style={{color:'orange', display:'block', fontSize:'0.7rem', textTransform:'uppercase'}}>Common Mistake:</strong>
                        {current.mistake}
                    </div>
                </div>

                {/* SCENARIO */}
                <div style={{width:'100%'}}>
                    {!showScenario ? (
                        <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.15)' }} onClick={() => setShowScenario(true)} style={{ width:'100%', padding:'10px', background:'rgba(59, 130, 246, 0.1)', border:'1px dashed #3b82f6', borderRadius:'12px', color:'#3b82f6', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap: 10 }}>
                            <FaTerminal /> See Interview Example
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'15px', fontSize:'0.9rem'}}>
                            <div style={{marginBottom: 10, display:'flex', gap: 10}}>
                                <div style={{minWidth: 25, height: 25, borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center'}}>👨‍💼</div>
                                <div style={{background:'#21262d', padding:'8px 12px', borderRadius:'0 12px 12px 12px', color:'var(--text-dim)'}}>{current.question}</div>
                            </div>
                            <div style={{display:'flex', gap: 10, justifyContent:'flex-end'}}>
                                <div style={{background: current.color, padding:'8px 12px', borderRadius:'12px 0 12px 12px', color:'#000', fontWeight:'500'}}>
                                    <span dangerouslySetInnerHTML={{ __html: current.answer.replace(current.word, `<b>${current.word}</b>`) }} />
                                </div>
                                <div style={{minWidth: 25, height: 25, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>🧑‍💻</div>
                            </div>
                        </motion.div>
                    )}
                </div>

            </div>

            {/* FOOTER */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, borderTop:'1px solid rgba(255,255,255,0.05)', background:'var(--bg-card)' }}>
                {mastered ? (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#238636', color: 'white', padding: '12px 40px', borderRadius: '30px', fontWeight: 'bold', display: 'flex', gap: 10, alignItems: 'center', fontSize: '1.2rem', boxShadow: '0 0 20px #238636' }}>
                        <FaCheck /> MASTERED!
                    </motion.div>
                ) : (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleMastered} style={{ background: '#e6edf3', color: '#000', border: 'none', padding: '12px 40px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: 10, alignItems: 'center', fontSize: '1rem', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                        I Understood This <FaArrowRight />
                    </motion.button>
                )}
            </div>
        </div>
    );
};
// --- MODULE 3: GRAMMAR ---
// --- MODULE 3: GRAMMAR (COMMUNICATION POLISHER ✨) ---
// --- MODULE 3: GRAMMAR (AI INTERVIEW SIMULATOR 🎙️) ---
// --- MODULE 3: GRAMMAR (AI INTERVIEW SIMULATOR - GRID UI 🎙️) ---
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//      FaUser, FaMicrophone, FaStop, FaCommentDots, 
//     FaStar, FaTimesCircle, FaCheckCircle, FaBolt, FaSync 
// } from 'react-icons/fa';

const GrammarModule = () => {
    // --- 1. CORE STATES ---
    const [activeQ, setActiveQ] = useState(0);
    const [inputText, setInputText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]); 
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    // --- 2. FETCH LOGIC (AI POWERED) ---
    const fetchAIQuestions = async () => {
        setLoadingQuestions(true);
        try {
            // BACKEND SE DATA FETCH KARO
            // 🔄 DYNAMIC REPLACEMENT: Hardcoded localhost hatakar `API_URL` bitha diya hai
            const responseData = await fetch(`${API_URL}/api/coach/generate-questions?category=English Grammar`);
            const data = await responseData.json();
            
            if (data.questions) {
                // AI SE AAYE SAWALON KO TERE PURANE BEAUTIFUL STRUCTURE MEIN FIT KARNA
                const formatted = data.questions.map((q, i) => {
                    const icons = [<FaUser />, <FaBriefcase />, <FaBrain />, <FaStar />, <FaBolt />];
                    const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
                    return {
                        id: i + 1,
                        question: q,
                        title: `Task ${i + 1}`,
                        icon: icons[i % icons.length], 
                        color: colors[i % colors.length],
                        hint: "Avoid basic words. Try using 'Nevertheless', 'Moreover', or 'Subsequently' to sound like a Pro."
                    };
                });
                setQuestions(formatted);
                setActiveQ(0);
                setResult(null);
                setInputText("");
            }
        } catch (err) {
            console.error("AI Fetch Error:", err);
        } finally {
            setLoadingQuestions(false);
        }
    };


    useEffect(() => {
        fetchAIQuestions();
    }, []);

    // --- 3. SPEECH TO TEXT (MIC LOGIC) ---
    const toggleRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported! Use Chrome bro.");
            return;
        }

        if (isRecording) {
            setIsRecording(false); 
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; 
        recognition.interimResults = false;
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    // --- 4. ANALYZE (SENDING TO BACKEND) ---
    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setAnalyzing(true);
        try {
            // 🚀 Yahan badlaav kiya hai: localhost hata kar dynamic ${API_URL} daal diya
            const response = await fetch(`${API_URL}/api/coach/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: questions[activeQ].question,
                    userResponse: inputText
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setResult({
                    score: data.score,
                    feedback: data.feedback,
                    fixed: data.improvedAnswer,
                    original: inputText
                });
            }
        } catch (error) {
            console.error("Analysis Error:", error);
        } finally {
            setAnalyzing(false);
        }
    };

    // SAFE RENDER PROTECTION
    const currentQ = questions[activeQ] || { 
        question: "Loading...", title: "Loading...", color: "#3b82f6", icon: <FaUser />, hint: "Please wait..." 
    };

    if (loadingQuestions && questions.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '500px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 50, height: 50, border: '5px solid var(--border)', borderTop: '5px solid #3b82f6', borderRadius: '50%' }} />
                <p style={{ color: 'var(--text-dim)', marginTop: 20, fontSize: '1.1rem', fontWeight: '500' }}>AI is thinking of fresh challenges...</p>
            </div>
        );
    }

    return (
        /* --- 1. MAIN WRAPPER (module-card) --- */
        <div className="module-card" style={{ 
            padding: 0, overflow: 'hidden', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            minHeight: '900px', display: 'flex', flexDirection: 'column', 
            borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' 
        }}>
            
            {/* --- 2. SCENARIO GRID SELECTOR (TOP AREA) --- */}
            <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>
                    Select Your Grammar Battle
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {questions.map((q, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ scale: 1.03, translateY: -5 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setActiveQ(i); setInputText(""); setResult(null); }}
                            style={{ 
                                background: activeQ === i ? `${q.color}15` : 'var(--bg-main)', 
                                border: `1px solid ${activeQ === i ? q.color : 'var(--border)'}`, 
                                padding: '20px', borderRadius: '16px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
                                boxShadow: activeQ === i ? `0 10px 30px ${q.color}20` : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {activeQ === i && <motion.div layoutId="activeTab" style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', background: q.color, borderRadius: '16px 0 0 16px' }} />}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: activeQ === i ? q.color : 'var(--text-dim)' }}>
                                <div style={{ background: activeQ === i ? q.color : 'var(--border)', color: '#fff', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    {q.icon}
                                </div>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{q.title}</span>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* --- NEW TASKS BUTTON --- */}
                    <motion.div 
                        whileHover={{ scale: 1.05, borderColor: '#238636' }}
                        onClick={fetchAIQuestions}
                        style={{ border: '2px dashed var(--border)', padding: '20px', borderRadius: '16px', cursor: 'pointer', color: '#3fb950', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--accent-glow)' }}
                    >
                        <FaSync style={{ fontSize: '1.2rem' }} className={loadingQuestions ? "spin-animation" : ""} /> 
                        <strong style={{ fontSize: '1rem' }}>New Tasks</strong>
                    </motion.div>
                </div>
            </div>
    
            {/* --- 3. MAIN INTERACTIVE AREA --- */}
            <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
                
                {/* AI COACH PROMPT */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    style={{ background: `linear-gradient(90deg, ${currentQ.color}20, transparent)`, borderLeft: `5px solid ${currentQ.color}`, padding: '25px 35px', borderRadius: '0 20px 20px 0' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: currentQ.color, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                        <FaCommentDots size={18} /> AI Grammar Coach is asking:
                    </div>
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.7rem', lineHeight: 1.5, fontWeight: '700' }}>"{currentQ.question}"</h2>
                    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        <FaBolt size={14} color="#f2cc60" /> {currentQ.hint}
                    </div>
                </motion.div>
    
                {/* TEXTAREA & MICROPHONE */}
                <div style={{ position: 'relative' }}>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Click the mic to speak your answer, or start typing here..."
                        style={{ 
                            width: '100%', minHeight: '220px', background: 'var(--bg-main)', border: '1px solid var(--border)', 
                            borderRadius: '20px', padding: '30px', color: 'var(--text-main)', fontSize: '1.2rem', lineHeight: 1.7, 
                            resize: 'none', outline: 'none', transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = currentQ.color}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                    <motion.button 
                        whileHover={{ scale: 1.1, boxShadow: isRecording ? '0 0 30px #ef4444' : '0 0 30px #2ea043' }} 
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleRecording}
                        style={{ 
                            position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, borderRadius: '50%',
                            background: isRecording ? '#ef4444' : '#238636', border: 'none', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
                        }}
                    >
                        {isRecording ? <FaStop size={24} /> : <FaMicrophone size={24} />}
                    </motion.button>
                </div>
    
                {/* --- ACTION BUTTONS (POLISH & NEXT) --- */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 25 }}>
                    <motion.button 
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnalyze}
                        disabled={analyzing || !inputText.trim()}
                        style={{ 
                            background: analyzing ? 'var(--border)' : `linear-gradient(135deg, ${currentQ.color}, var(--bg-card))`, 
                            color: '#fff', border: `1px solid ${currentQ.color}`, padding: '16px 50px', 
                            borderRadius: '50px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', 
                            gap: 15, fontSize: '1.2rem', boxShadow: `0 10px 40px ${currentQ.color}30`
                        }}
                    >
                        {analyzing ? (
                           <> <div className="loader" /> Analyzing...</>
                        ) : (
                            <><FaMagic /> Polish My Answer</>
                        )}
                    </motion.button>
                    
                    {activeQ < questions.length - 1 && (
                        <motion.button 
                            whileHover={{ scale: 1.05, background: 'var(--bg-sidebar)' }}
                            onClick={() => { setActiveQ(prev => prev + 1); setInputText(""); setResult(null); }}
                            style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '16px 40px', borderRadius: '50px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                        >
                            Next Task <FaChevronRight style={{ marginLeft: 10 }} />
                        </motion.button>
                    )}
                </div>
    
                {/* --- RESULT FEEDBACK ENGINE --- */}
                <AnimatePresence>
                    {result && !analyzing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', marginTop: 15, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                        >
                            <div style={{ padding: '20px 30px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FaStar color="#f59e0b" /> AI COACH EVALUATION
                                </span>
                                <div style={{ background: result.score > 7 ? '#238636' : '#8b5cf6', color: '#fff', padding: '5px 15px', borderRadius: '10px', fontWeight: '900', fontSize: '1.2rem' }}>
                                    {result.score}/10
                                </div>
                            </div>
                            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #f43f5e' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8 }}>What you said:</div>
                                    <div style={{ color: '#ef4444', fontSize: '1.1rem', fontStyle: 'italic' }}>"{result.original}"</div>
                                </div>
                                <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', borderLeft: '5px solid #3fb950' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8 }}>The Professional Way:</div>
                                    <div style={{ color: '#10b981', fontWeight: '800', fontSize: '1.2rem' }}>"{result.fixed}"</div>
                                </div>
                                <div style={{ background: 'var(--bg-sidebar)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#f2cc60', display: 'block', marginBottom: 8 }}>💡 Feedback:</strong>
                                    {result.feedback}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};



// export default GrammarModule;

// --- MAIN DASHBOARD COMPONENT ---
const EnglishPrep = () => {
    
    const [activeTab, setActiveTab] = useState('read');

    // --- TYPING STATES ---
    const [titleText, setTitleText] = useState('');
    const [subtitleText, setSubtitleText] = useState('');
    const [typingPhase, setTypingPhase] = useState('title');
    
    const hasRun = useRef(false);

    const fullTitle = "English Studio"; 
    const fullSubtitle = "Refine your communication skills for high-stakes interviews.";
    
    useEffect(() => {
        let isCancelled = false;
    
        const runTypingSequence = async () => {
            // 1. Title Type (Using local variable to avoid stale state bugs)
            let currentTitle = "";
            setTitleText(""); 
            for (let i = 0; i < fullTitle.length; i++) {
                if (isCancelled) return;
                currentTitle += fullTitle[i];
                setTitleText(currentTitle);
                await new Promise(r => setTimeout(r, 100)); 
            }
    
            // 2. Pause
            await new Promise(r => setTimeout(r, 300));
            if (isCancelled) return;
            setTypingPhase('subtitle');
    
            // 3. Subtitle Type (Same robust approach)
            let currentSubtitle = "";
            setSubtitleText(""); 
            for (let i = 0; i < fullSubtitle.length; i++) {
                if (isCancelled) return;
                currentSubtitle += fullSubtitle[i];
                setSubtitleText(currentSubtitle);
                await new Promise(r => setTimeout(r, 30));
            }
    
            // 4. Done
            if (isCancelled) return;
            setTypingPhase('done');
        };
    
        runTypingSequence();
    
        return () => {
            isCancelled = true;
        };
    }, []);
    
    return (
        /* --- 🌍 MAIN WRAPPER --- */
        <div className="dashboard-content-layout" style={{ 
            display: 'flex', 
            width: '100%', 
            minHeight: '100vh', 
            background: 'var(--bg-main)',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            
            {/* --- 🟦 INTERNAL SIDEBAR (Pro Plan Box Removed 🎯) --- */}
            <div className="internal-sidebar" style={{ 
                width: '240px', 
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                borderRight: '1px solid var(--border)',
                paddingRight: '20px',
                marginRight: '20px',
                background: 'var(--bg-sidebar)',
                transition: 'all 0.3s ease'
            }}>
                <div className="brand-title" style={{ 
                    color: 'var(--text-main)', 
                    fontWeight: 800, 
                    fontSize: '1.2rem', 
                    marginBottom: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                }}>
                    <FaLayerGroup color="#3b82f6" /> Prep<span>AI</span>
                </div>
                
                {/* Navigation Items */}
                <div className={`nav-item ${activeTab === 'read' ? 'active' : ''}`} 
                     onClick={() => setActiveTab('read')}
                     style={{ 
                         padding: '12px', 
                         borderRadius: '10px', 
                         cursor: 'pointer', 
                         color: activeTab === 'read' ? 'var(--text-main)' : 'var(--text-dim)', 
                         background: activeTab === 'read' ? 'var(--accent-glow)' : 'transparent', 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '10px', 
                         fontWeight: 600,
                         transition: '0.2s'
                     }}>
                    <FaMicrophone /> Speaking
                </div>
                
                <div className={`nav-item ${activeTab === 'vocab' ? 'active' : ''}`} 
                     onClick={() => setActiveTab('vocab')}
                     style={{ 
                         padding: '12px', 
                         borderRadius: '10px', 
                         cursor: 'pointer', 
                         color: activeTab === 'vocab' ? 'var(--text-main)' : 'var(--text-dim)', 
                         background: activeTab === 'vocab' ? 'var(--accent-glow)' : 'transparent', 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '10px', 
                         fontWeight: 600,
                         transition: '0.2s'
                     }}>
                    <FaBook /> Vocabulary
                </div>
                
                <div className={`nav-item ${activeTab === 'grammar' ? 'active' : ''}`} 
                     onClick={() => setActiveTab('grammar')}
                     style={{ 
                         padding: '12px', 
                         borderRadius: '10px', 
                         cursor: 'pointer', 
                         color: activeTab === 'grammar' ? 'var(--text-main)' : 'var(--text-dim)', 
                         background: activeTab === 'grammar' ? 'var(--accent-glow)' : 'transparent', 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '10px', 
                         fontWeight: 600,
                         transition: '0.2s'
                     }}>
                    <FaTools /> Grammar
                </div>
            </div>

            {/* --- ⬜ MAIN CONTENT AREA --- */}
            <div className="main-area" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{
                            fontSize:'2.5rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            margin: 0
                        }}>
                            {titleText}
                            {typingPhase === 'title' && <span className="cursor-blink"
                             style={{background: 'var(--accent)',
                                width: '4px',
                                height: '2.5rem',
                             }}></span>}
                        </h1>
                        <p style={{
                            fontSize: '1.05rem',
                            color: 'var(--text-dim)',
                            margin: '5px 0 0 0',
                            maxWidth: '600px',
                            lineHeight: '1.5',
                            whiteSpace: 'normal'
                        }}>
                            {subtitleText}
                        </p>
                    </div>
    
                    <div style={{display:'flex', gap: 15}}>
                        <button style={{background:'#111', color:'white', border:'1px solid #333', width: 40, height: 40, borderRadius:'50%', cursor:'pointer'}}>
                            <FaRegBell />
                        </button>
                        <div style={{width: 40, height: 40, borderRadius:'50%', background:'linear-gradient(135deg, #3b82f6, #818cf8)'}}></div>
                    </div>
                </div>
    
                {/* --- CONTENT MODULES --- */}
                <div className="fade-in-section" style={{ width: '100%' }}>
                    {activeTab === 'read' && <ReadModule />}
                    {activeTab === 'vocab' && <VocabModule />}
                    {activeTab === 'grammar' && <GrammarModule />}
                </div>
            </div>
        </div>
    );
};

export default EnglishPrep;