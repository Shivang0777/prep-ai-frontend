import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaMicrophoneAlt, FaBug, FaFilePdf, FaSync } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './MockInterview.css';
import * as pdfjsLib from 'pdfjs-dist';
// Vite ka special syntax local worker import karne ke liye
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// 🎯 FIX 1: Apne direct live render server ka URL set karo taaki phone se live hit ho sake
const API_URL = "https://prep-ai-backend-s9uw.onrender.com";

const MockInterview = () => {
  const [step, setStep] = useState('intro');
  const [resume, setResume] = useState(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiTranscript, setAiTranscript] = useState("System Standby...");
  const [userTranscript, setUserTranscript] = useState("");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const qIndexRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  
  // 🚨 REFS FOR INSTANT UPDATES
  const isInterviewActiveRef = useRef(false); 
  const resumeTextRef = useRef(""); // Yeh 400 error rokega

  const videoRef = useRef(null);
  const replayRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const recognitionRef = useRef(null);
  const historyRef = useRef([]); 
  const userTranscriptRef = useRef("");
  const [analysisResult, setAnalysisResult] = useState(null); // Backend data yahan aayega

  const [selectedRole, setSelectedRole] = useState('Fullstack Developer');
  const [isCustomRole, setIsCustomRole] = useState(false);
 
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Helper to forcefully wake up audio routing layer on mobile phone viewports
  const forceWakeMobileAudioPipeline = async () => {
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const temporaryContext = new AudioCtxClass();
      if (temporaryContext.state === 'suspended') {
        await temporaryContext.resume();
      }
    }
    // 🎯 FIX 2: Mobile par speech recognition aur TTS engine ko user interactions se initialize karna padta hai
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const initialWakeUpUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(initialWakeUpUtterance);
    }
  };

  // --- 📂 FRONTEND PDF PARSER ---
  const processPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        extractedText += pageText + " \n";
      }

      console.log("🔥 Extracted Resume Text: ", extractedText); 
      setResumeText(extractedText);
      resumeTextRef.current = extractedText; 
      return extractedText;

    } catch (error) {
      console.error("PDF Parsing Error: ", error);
      alert("PDF theek se read nahi ho paayi bhai. Try another one.");
    }
  };

  // --- 🧠 PHASE 2: THE REAL AI BRAIN (Connected to Backend) ---
  const generateAIQuestion = async (currentHistory, currentResumeText, selectedRole) => {
    setIsThinking(true);
    setAiTranscript("Analyzing your response...");

    try {
      const response = await fetch(`${API_URL}/api/coach/mock-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: currentResumeText || resumeTextRef.current, 
          chatHistory: currentHistory,
          role: selectedRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error Data:", errorData);
        throw new Error("Backend connection failed!");
      }

      const data = await response.json();
      setIsThinking(false);
      return data.question; 

    } catch (error) {
      console.error("AI Fetch Error:", error);
      setIsThinking(false);
      return "I am facing a network glitch, but let's continue. What do you consider your core technical strength?";
    }
  };

  // --- 🤖 AI VOICE (BULLETPROOF FIX) ---
  const speak = (text, callback) => {
    window.speechSynthesis.cancel(); 
    setAiTranscript(text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    window.utterances = window.utterances || [];
    window.utterances.push(utterance);

    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    utterance.onstart = () => { 
      setIsAiSpeaking(true); 
      isAiSpeakingRef.current = true; 
    };

    utterance.onend = () => { 
      setIsAiSpeaking(false); 
      isAiSpeakingRef.current = false; 
      window.utterances = []; 
      if (callback) callback(); 
    };

    utterance.onerror = (event) => {
      console.error("TTS Engine issue intercepted:", event);
      setIsAiSpeaking(false); 
      isAiSpeakingRef.current = false; 
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- 🎙️ THE MIC (MOBILE SAFE SHORT BURST ENGINE FIXED) ---
 // --- 🎙️ THE MIC (MOBILE SAFE SHORT BURST ENGINE FIXED) ---
// --- 🎙️ THE MIC (SIMPLIFIED SOLID MOBILE MICROPHONE ENGINE) ---
const initVoice = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  
  const recognition = new SpeechRecognition();
  
  // 🎯 PHONE PAR ENGINE CRASH ROKNE KE LIYE DEFAULT SETTINGS BACK
  recognition.continuous = false;
  recognition.interimResults = false; 
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    if (isAiSpeakingRef.current || isProcessingRef.current || !isInterviewActiveRef.current) return;
    
    // Direct solid block text capture
    const finalTranscript = event.results[0][0].transcript;

    setUserTranscript(finalTranscript);
    userTranscriptRef.current = finalTranscript; 

    const text = finalTranscript.toLowerCase().trim();
    console.log("Mic Live Mobile Vector:", text); 

    // 🎯 LOOSE STRING MATCHING (Includes laga diya taaki phone easily pakad le)
    if (text.includes("next question") || text.includes("next")) {
       console.log("Next Question Command Detected!");
       handleNext(false);
    } 
    else if (
      text.includes("session end") || 
      text.includes("stop interview") || 
      text.includes("end interview") ||
      text.includes("stop")
    ) {
      console.log("Stop Command Detected!");
      finish(); 
    }
    else if (text.includes("i am done") || text.includes("done")) {
      handleNext(true); 
    }
  };

  recognition.onend = () => {
    // Loop cycle automated restart for phone viewports
    if (isInterviewActiveRef.current && !isAiSpeakingRef.current && !isProcessingRef.current) {
      try { recognition.start(); } catch(e) {}
    }
  };

  recognition.onerror = (e) => {
    console.log("Speech engine warning caught:", e.error);
  };

  try {
    recognition.start();
    recognitionRef.current = recognition;
  } catch (err) {
    console.error("Mic start error:", err);
  }
};

  useEffect(() => {
    if (step === 'interview' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  // --- HARDWARE START (CODEC COMPATIBILITY HARNESS INTEGRATED) ---
  // --- HARDWARE START (CODEC COMPATIBILITY HARNESS INTEGRATED) ---
 // --- HARDWARE START (BULLETPROOF MOBILE FALLBACK HARNESS) ---
 const startHardware = async () => {
  try {
    await forceWakeMobileAudioPipeline(); 
    console.log("🚀 Initializing Mobile Hardware Stream...");
    
    let stream;
    try {
      // High-end devices ke liye video + audio dono
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: true 
      });
    } catch (videoErr) {
      // 🔥 PHONE TRACKING ALERT 1: Agar camera constraints ya resolution fail hua
      alert(`⚠️ Mobile Camera Mismatch: ${videoErr.message}. Trying Audio-Only Mode!`);
      
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    streamRef.current = stream;
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // 🎯 SAFARI/CHROME PHONE EXPLICIT UNLOCK
      videoRef.current.setAttribute("playsinline", true);
      videoRef.current.setAttribute("webkit-playsinline", true);
      try {
        await videoRef.current.play();
      } catch (playErr) {
        alert(`⚠️ Video AutoPlay Blocked by Phone: ${playErr.message}`);
      }
    }

    recordedChunks.current = [];

    // Safe container format check for phones
    let structuralMimeType = 'video/mp4'; 
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      structuralMimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      structuralMimeType = 'video/webm';
    }
    
    const mr = new MediaRecorder(stream, { mimeType: structuralMimeType });
    mediaRecorderRef.current = mr;
    
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.current.push(e.data);
      }
    };
    
    mr.onstop = () => {
      const fileBlobContainer = new Blob(recordedChunks.current, { type: structuralMimeType });
      setVideoUrl(URL.createObjectURL(fileBlobContainer));
    };

    mr.start(1000); 
  } catch (err) {
    // 🔥 PHONE TRACKING ALERT 2: Agar pooray phone ne permission ya hardware block kiya
    alert(`🚨 CRITICAL HARDWARE ERROR: Name: ${err.name} | Msg: ${err.message}`);
  }
};

  // --- 🚀 START INTERVIEW ---
 // --- 🚀 START INTERVIEW (MOBILE MOUNT SAFE WRAPPER) ---
 const startInterview = async (currentText, role) => {
  // Pehle mobile DOM ko set hone do
  setStep('interview');
  isInterviewActiveRef.current = true;
  
  // 500ms delay taaki phone browser video element ka ref catch kar sake
  setTimeout(async () => {
    await startHardware();
    
    const interviewContext = `Target Role: ${role}. Resume Details: ${currentText}`;
    
    // Backend test trigger alert to see if AI responds
    try {
      speak(`System active. Evaluating for ${role} position.`, async () => {
        const firstQuestion = await generateAIQuestion([], interviewContext, role);
        
        if(!firstQuestion) {
           alert("🚨 Backend se question nahi aaya! Server sleep mode mein hai.");
        }
        
        historyRef.current = [{ role: "ai", content: firstQuestion }];
        setChatHistory([...historyRef.current]);
        setCurrentQIndex(1); 
        
        speak(firstQuestion, () => {
          setUserTranscript("");
          userTranscriptRef.current = "";
          initVoice(); 
        });
      });
    } catch (aiErr) {
       alert(`🚨 AI Loop Error on Phone: ${aiErr.message}`);
    }
  }, 500);
};

  // --- ⚙️ HANDLE NEXT ---
  const handleNext = async (isDone = false) => {
    if (isProcessingRef.current || !isInterviewActiveRef.current) return;
    isProcessingRef.current = true;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    setTimeout(async () => {
      if (isDone) {
        finish();
        return;
      }
      
      let rawAns = userTranscriptRef.current || "";
      console.log("Full Sentence Captured:", rawAns);

      let cleanAns = rawAns.replace(/(so\s+)?next\s+question/gi, "").trim();

      if (!cleanAns || cleanAns.length < 3) {
        cleanAns = "Candidate didn't provide a verbal response.";
      }

      const updatedHistory = [...historyRef.current, { role: "user", content: cleanAns }];
      historyRef.current = updatedHistory;
      setChatHistory(updatedHistory);
      
      speak("Noted. Let's move on...", async () => {
        try {
          const nextQuestion = await generateAIQuestion(historyRef.current, resumeTextRef.current, selectedRole);
          
          historyRef.current = [...historyRef.current, { role: "ai", content: nextQuestion }];
          setChatHistory([...historyRef.current]);
          setCurrentQIndex((prev) => prev + 1); 
          
          speak(nextQuestion, () => {
            setUserTranscript("");
            userTranscriptRef.current = ""; 
            isProcessingRef.current = false; 
            if (isInterviewActiveRef.current) {
              initVoice(); 
            }
          });
        } catch (err) {
          isProcessingRef.current = false;
        }
      });
    }, 600); 
  };

  // --- 🛑 FINISH ---
  const finish = async () => {
    isInterviewActiveRef.current = false; 
    isProcessingRef.current = true; 
  
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  
    speak("Interview ended. Compiling telemetry log.", async () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
  
      try {
        const response = await fetch(`${API_URL}/api/coach/save-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chatHistory: historyRef.current, 
            resumeText: resumeTextRef.current 
          })
        });
  
        const analysisData = await response.json();
        setAnalysisResult(analysisData); 
        setStep('report'); 
  
      } catch (err) {
        console.error("Analysis Error:", err);
        setStep('report'); 
      } finally {
        isProcessingRef.current = false;
      }
    });
  };

  const dynamicRadarData = [
    { s: 'Technical', A: analysisResult?.technicalScore || 0 },
    { s: 'Communication', A: analysisResult?.communicationScore || 0 },
    { s: 'Confidence', A: analysisResult?.confidenceScore || 0 },
    { s: 'Clarity', A: analysisResult?.clarityScore || 0 },
    { s: 'Context', A: analysisResult?.contextScore || 0 },
  ];

  return (
    <>
      <div className="ambient-glow"></div>
      <div className="mock-wrapper">
        <AnimatePresence mode="wait">
          
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hero-container">
              <h1 className="massive-title">PREP.AI</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginTop: '20px' }}>
                Voice-autonomous intelligence. No clicks. No boxes.
              </p>

              <div className="naked-flow">
                <div className="naked-step">
                  <div className="giant-hollow-num">01</div>
                  <h3 className="step-heading"><FaUpload color="var(--accent-purple)" /> CONTEXT</h3>
                  <p className="step-desc">Upload PDF. We parse your history.</p>
                </div>
                
                <div className="naked-step">
                  <div className="giant-hollow-num">02</div>
                  <h3 className="step-heading"><FaMicrophoneAlt color="var(--accent-neon)" /> SPEAK</h3>
                  <p className="step-desc">Say "Next Question" to navigate.</p>
                </div>

                <div className="naked-step">
                  <div className="giant-hollow-num">03</div>
                  <h3 className="step-heading"><FaBug color="#ff4757" /> DEBUG</h3>
                  <p className="step-desc">Auto-cut fumbles & score generation.</p>
                </div>
              </div>

              {/* 🎯 FIX 3: Is button click par mobile audio sequence triggers completely bypass ho rahe hain */}
              <button className="btn-neon-line" onClick={async () => { await forceWakeMobileAudioPipeline(); setStep('upload'); }}>INITIALIZE SEQUENCE</button>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hero-container">
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '50px', 
                width: '100%',
                minHeight: '60vh'
              }}>

                {/* 🚨 ROLE SELECTION */}
                <div className="role-container" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '15px', letterSpacing: '2px' }}>
                    CHOOSE YOUR BATTLEFIELD
                  </p>
                  
                  {!isCustomRole ? (
                    <select 
                      value={selectedRole}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setIsCustomRole(true);
                          setSelectedRole(''); 
                        } else {
                          setSelectedRole(e.target.value);
                        }
                      }}
                      className="neon-select"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        color: 'var(--accent-neon)',
                        border: '1px solid rgba(0, 255, 153, 0.3)',
                        padding: '15px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        textAlign: 'center',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none'
                      }}
                    >
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Fullstack Developer">Fullstack Developer</option>
                      <option value="Web3 Engineer">Web3 Engineer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Other">Other (Custom Role) +</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                      <input 
                        type="text"
                        placeholder="Enter Custom Role..."
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          background: 'transparent',
                          color: 'var(--accent-neon)',
                          border: '1px solid var(--accent-neon)',
                          padding: '15px',
                          borderRadius: '12px',
                          outline: 'none',
                          textAlign: 'center'
                        }}
                      />
                      <button 
                        onClick={() => { setIsCustomRole(false); setSelectedRole('Fullstack Developer'); }}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: '#ff4757', 
                          cursor: 'pointer', 
                          fontSize: '1.2rem',
                          padding: '0 10px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 🚨 DROP RESUME (UPLOAD ZONE) */}
                <label className="naked-upload-zone" style={{ cursor: 'pointer', display: 'block' }}>
                  <input 
                    type="file" 
                    hidden 
                    accept=".pdf" 
                    onChange={async (e) => { 
                      const file = e.target.files[0];
                      if (file) {
                        setResume(file); 
                        const text = await processPDF(file);
                        if(text) {
                          const roleToPass = selectedRole || "Professional Candidate";
                          setTimeout(() => startInterview(text, roleToPass), 1000); 
                        }
                      }
                    }} 
                  />
                  <div className="hollow-text-large" style={{ 
                    fontSize: 'clamp(2.5rem, 10vw, 6rem)', 
                    lineHeight: '1' 
                  }}>
                    {resume ? "PARSING..." : "DROP RESUME"}
                  </div>
                  {resume && (
                    <div style={{ 
                      color: 'var(--accent-neon)', 
                      marginTop: '20px', 
                      fontSize: '0.9rem',
                      letterSpacing: '1px' 
                    }}>
                      SYSTEM DETECTED: {resume.name.toUpperCase()}
                    </div>
                  )}
                </label>

              </div>
            </motion.div>
          )}

          {step === 'interview' && (
            <motion.div key="inter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="interview-layout">
              
              {/* Video Container */}
              <div className="cam-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="borderless-cam" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '500px', 
                    borderRadius: '24px', 
                    backgroundColor: '#111', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    transform: 'scaleX(-1)' 
                  }} 
                />
                <div style={{ color: '#ff4757', fontWeight: 'bold', marginTop: '20px', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="rec-dot"></span> ● REC
                </div>
              </div>

              {/* Transcript Container */}
              <div className="floating-transcript" style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-dim)', letterSpacing: '2px', fontSize: '0.8rem' }}>SYS.PROMPT // Q{currentQIndex}</span>
                <motion.div key={aiTranscript} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="text-ai">
                  {aiTranscript}
                </motion.div>
                <div className="text-user">{userTranscript || "Listening..."}</div>
              </div>

            </motion.div>
          )}

          {step === 'report' && (
            <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 style={{ fontSize: '2.5rem', letterSpacing: '5px', textTransform: 'uppercase' }}>Telemetry Log</h1>
              
              <div className="floating-report-layout">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* SCORE DISPLAY */}
                  <div className="naked-score" style={{ marginBottom: '20px' }}>
                    {analysisResult?.overallScore || 0}<span style={{fontSize:'4rem'}}>%</span>
                  </div>

                  {/* RADAR CHART */}
                  <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}> 
                    <ResponsiveContainer width="100%" aspect={1.5}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                        <PolarGrid stroke="rgba(136, 136, 136, 0.2)" />
                        <PolarAngleAxis dataKey="s" tick={{ fill: 'var(--text-dim)', fontSize: 12 }} />
                        <Radar 
                          dataKey="A" 
                          stroke="var(--accent-neon)" 
                          fill="var(--accent-neon)" 
                          fillOpacity={0.3} 
                          strokeWidth={2} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* FEEDBACK PILLS */}
                  <div className="feedback-pills" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                     {analysisResult?.strengths?.map((s, idx) => (
                       <span key={`str-${idx}`} className="pill-green">{s}</span>
                     ))}
                     {analysisResult?.weaknesses?.map((w, idx) => (
                       <span key={`weak-${idx}`} className="pill-red">{w}</span>
                     ))}
                  </div>
                </div>

                {/* VIDEO REPLAY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <video 
                    ref={replayRef} 
                    src={videoUrl} 
                    controls 
                    playsInline
                    style={{ width: '100%', maxWidth: '550px', borderRadius: '16px', border: '1px solid var(--border-color)' }} 
                  />

                  {/* CRINGE / FILLER TIMELINE BOX */}
                  <div style={{ 
                    width: '100%',
                    maxWidth: '550px', 
                    background: 'rgba(255, 71, 87, 0.08)', 
                    padding: '20px', 
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 71, 87, 0.2)',
                    boxSizing: 'border-box'
                  }}>
                    <h3 style={{ color: '#ff4757', fontSize: '1rem', marginBottom: '15px', letterSpacing: '1px' }}>
                        FILLER WORD DETECTED (CRINGE LOG)
                    </h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {analysisResult?.fillerMoments?.length > 0 ? (
                        analysisResult.fillerMoments.map((m, idx) => (
                          <button 
                            key={idx}
                            onClick={() => { if(replayRef.current) replayRef.current.currentTime = m.time; }} 
                            className="cringe-btn"
                            style={{
                              background: '#1a1a1a',
                              border: '1px solid #ff4757',
                              color: '#ff4757',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: '0.3s'
                            }}
                          >
                            {m.timestamp} — "{m.word}"
                          </button>
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Clean Speech! No filler words found. 🔥</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MockInterview;