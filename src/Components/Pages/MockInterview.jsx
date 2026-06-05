import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaMicrophoneAlt, FaBug, FaFilePdf } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import './MockInterview.css';
import * as pdfjsLib from 'pdfjs-dist';
// Vite ka special syntax local worker import karne ke liye
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
      // Update both state and Ref
      setResumeText(extractedText);
      resumeTextRef.current = extractedText; 
      return extractedText;

    } catch (error) {
      console.error("PDF Parsing Error: ", error);
      alert("PDF theek se read nahi ho paayi bhai. Try another one.");
    }
  };

  // --- 🧠 PHASE 2: THE REAL AI BRAIN (Connected to Backend) ---
  const generateAIQuestion = async (currentHistory, currentResumeText,selectedRole) => {
    setIsThinking(true);
    setAiTranscript("Analyzing your response...");

    try {
      // 🔄 GENTLE DYNAMIC REPLACEMENT: Sirf localhost hatakar API_URL bitha diya backticks mein
      const response = await fetch(`${API_URL}/api/coach/mock-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Ref use kar rahe hain taaki state delay se farak na pade (Bilkul untouched hai tera logic)
          resumeText: currentResumeText || resumeTextRef.current, 
          chatHistory: currentHistory ,
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
      // Fallback question if API fails (Tera beautiful fallback ekdum safe hai)
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
      setIsAiSpeaking(false); 
      isAiSpeakingRef.current = false; 
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- 🎙️ THE MIC (ERROR PROOF) ---
 // --- 🎙️ THE MIC (VOICE COMMANDS UPDATED) ---
 const initVoice = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  
  recognition.onresult = (event) => {
    if (isAiSpeakingRef.current || isProcessingRef.current || !isInterviewActiveRef.current) return;
    
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      finalTranscript += event.results[i][0].transcript;
    }

    setUserTranscript(finalTranscript);
    userTranscriptRef.current = finalTranscript; 

    const text = finalTranscript.toLowerCase().trim();
    console.log("Mic Live:", text); 

    // 1. Agla sawaal (Trigger tabhi hoga jab sentence ke END mein bologe)
    if (text.endsWith("next question")) {
       console.log("Next Question Command Detected!");
       handleNext(false);
    } 
    
    // 2. Session End Commands
    else if (
      text.endsWith("session end") || 
      text.endsWith("stop interview") || 
      text.endsWith("end interview")
    ) {
      console.log("Stop Command Detected!");
      finish(); 
    }

    // 3. Done Logic
    else if (text.endsWith("i am done") || text.endsWith("done")) {
      handleNext(true); 
    }
  };

  recognition.onend = () => {
    if (isInterviewActiveRef.current && !isAiSpeakingRef.current && !isProcessingRef.current) {
      try { recognition.start(); } catch(e) {}
    }
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
  // --- HARDWARE START ---
  const startHardware = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // Check agar element already render ho gaya hai toh attach kar do
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
  
      recordedChunks.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => recordedChunks.current.push(e.data);
      mr.onstop = () => setVideoUrl(URL.createObjectURL(new Blob(recordedChunks.current, { type: 'video/webm' })));
      mr.start();
    } catch (err) {
      console.error("Hardware access error:", err);
      alert("Camera/Mic access denied!");
    }
  };

  // --- 🚀 START INTERVIEW ---
  const startInterview = async (currentText, role) => { // 🚨 Step 1: 'role' parameter add kiya
    // 1. Pehle hardware ready karo
    await startHardware();
    
    // 2. Ab screen change karo
    setStep('interview');
    isInterviewActiveRef.current = true;
    
    // 3. AI ko context ke saath bulwao
    // Hum prompt mein role aur resume dono bhej rahe hain
    const interviewContext = `Target Role: ${role}. Resume Details: ${currentText}`;
    
    speak(`System active. I am Prep AI. Evaluating for ${role} position. Let's begin.`, async () => {
      
      // 🚨 Step 2: AI ko context pass kiya taaki pehla sawal role ke hisab se aaye
      const firstQuestion = await generateAIQuestion([], interviewContext);
      
      historyRef.current = [{ role: "ai", content: firstQuestion }];
      setChatHistory([...historyRef.current]);
      setCurrentQIndex(1); 
      
      speak(firstQuestion, () => {
        setUserTranscript("");
        userTranscriptRef.current = "";
        initVoice(); 
      });
    });
};

  // --- ⚙️ HANDLE NEXT ---
  const handleNext = async (isDone = false) => {
    if (isProcessingRef.current || !isInterviewActiveRef.current) return;
    isProcessingRef.current = true;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    // 🚨 600ms wait taaki mic ki "Final" state Ref mein aa jaye
    setTimeout(async () => {
      if (isDone) {
        finish();
        return;
      }
      
      // Ab yahan poora sentence milega jo mic ne suna hai
      let rawAns = userTranscriptRef.current || "";
      console.log("Full Sentence Captured:", rawAns);

      // Clean logic
      let cleanAns = rawAns.replace(/(so\s+)?next\s+question/gi, "").trim();

      if (!cleanAns || cleanAns.length < 3) {
        cleanAns = "Candidate didn't provide a verbal response.";
      }

      // History update
      const updatedHistory = [...historyRef.current, { role: "user", content: cleanAns }];
      historyRef.current = updatedHistory;
      setChatHistory(updatedHistory);
      
      speak("Noted. Let's move on...", async () => {
        try {
          const nextQuestion = await generateAIQuestion(historyRef.current, resumeTextRef.current);
          
          historyRef.current = [...historyRef.current, { role: "ai", content: nextQuestion }];
          setChatHistory([...historyRef.current]);
          setCurrentQIndex((prev) => prev + 1); 
          
          speak(nextQuestion, () => {
            setUserTranscript("");
            userTranscriptRef.current = ""; 
            isProcessingRef.current = false; 
            if (isInterviewActiveRef.current) {
              try { recognitionRef.current.start(); } catch(e) { initVoice(); }
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
      // Media stop logic (Bilkul untouched hai tera recording logic)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
  
      try {
        // 🔄 DYNAMIC REPLACEMENT: Localhost hatakar dynamic API_URL bitha diya hai backticks mein
        const response = await fetch(`${API_URL}/api/coach/save-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chatHistory: historyRef.current, 
            resumeText: resumeTextRef.current 
          })
        });
  
        const analysisData = await response.json();
        setAnalysisResult(analysisData); // State update
        setStep('report'); // Screen change
  
      } catch (err) {
        console.error("Analysis Error:", err);
        setStep('report'); // Fallback to report screen
      } finally {
        isProcessingRef.current = false;
      }
    });
  };

  // const radarData = [
  //   { s: 'Tech', A: 85 }, { s: 'Fluency', A: 65 }, 
  //   { s: 'Confidence', A: 90 }, { s: 'Logic', A: 75 }
  // ];
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

              <button className="btn-neon-line" onClick={() => setStep('upload')}>INITIALIZE SEQUENCE</button>
            </motion.div>
          )}

{step === 'upload' && (
  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hero-container">
    
    {/* Main Wrapper to keep everything centered and stacked */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '50px', // Dropdown aur Resume ke beech ka gap
      width: '100%',
      minHeight: '60vh'
    }}>

      {/* 🚨 STEP 1: ROLE SELECTION */}
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
                setSelectedRole(''); // Reset for custom input
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

      {/* 🚨 STEP 2: DROP RESUME (UPLOAD ZONE) */}
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
                // Yahan final role pass kar rahe hain
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
    
    {/* Video Container: Isko fix kiya hai */}
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
          backgroundColor: '#111', // Black background agar stream deri se aaye
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          transform: 'scaleX(-1)' // Mirror effect taaki real lage
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

        {/* RADAR CHART - Cleaned up double tags */}
        <div style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}> 
  <ResponsiveContainer width="100%" aspect={1.5}> {/* Aspect ratio se height khud set ho jayegi */}
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
  {/* Video Player */}
  <video 
    ref={replayRef} 
    src={videoUrl} 
    controls 
    style={{ width: '550px', borderRadius: '16px', border: '1px solid var(--border-color)' }} 
  />

  {/* 🚨 CRINGE / FILLER TIMELINE BOX */}
  <div style={{ 
    width: '550px', 
    background: 'rgba(255, 71, 87, 0.08)', 
    padding: '20px', 
    borderRadius: '16px',
    border: '1px solid rgba(255, 71, 87, 0.2)'
  }}>
    <h3 style={{ color: '#ff4757', fontSize: '1rem', marginBottom: '15px', letterSpacing: '1px' }}>
       FILLER WORD DETECTED (CRINGE LOG)
    </h3>
    
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {analysisResult?.fillerMoments?.length > 0 ? (
        analysisResult.fillerMoments.map((m, idx) => (
          <button 
            key={idx}
            onClick={() => { replayRef.current.currentTime = m.time }} 
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
            onMouseOver={(e) => e.target.style.background = '#ff4757'}
            onMouseOut={(e) => { e.target.style.background = '#1a1a1a'; e.target.style.color = '#ff4757'; }}
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