import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { FaCode, FaSearch, FaFilter, FaChevronRight, FaGlobe, FaLock, FaCheckCircle, FaRocket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; 
import './TechnicalRound.css'; 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TechnicalRound = () => {
  const [questions, setQuestions] = useState([]); 
  const [filteredQuestions, setFilteredQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- Progression Views ---
  // views: 'welcome' | 'map' | 'list'
  const [view, setView] = useState('welcome');
  const [selectedSector, setSelectedSector] = useState(null);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // 1. 🔥 Fetch & Cache Logic
  useEffect(() => {
    const fetchQuestions = async () => {
      const cachedData = localStorage.getItem('arena_questions');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setQuestions(parsedData);
        setLoading(false); 
      }

      try {
        // 🔄 DYNAMIC REPLACEMENT: Hardcoded localhost hatakar `API_URL` bitha diya hai
        const response = await axios.get(`${API_URL}/api/questions`);
        const freshData = response.data;
        if (JSON.stringify(freshData) !== cachedData) {
          setQuestions(freshData);
          localStorage.setItem('arena_questions', JSON.stringify(freshData));
        }
        setLoading(false);
      } catch (error) {
        console.error("Atlas Sync Failed:", error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // 2. Filtering Logic (Sector wise)
  useEffect(() => {
    let result = questions;

    if (selectedSector) {
      result = result.filter(q => q.topic === selectedSector);
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter(q => q.difficulty === selectedDifficulty);
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(result);
  }, [selectedSector, selectedDifficulty, searchTerm, questions]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'editor') {
      // Agar local cache mein sector saved hai toh use set karo, nahi toh pehla topic lelo
      const lastSector = localStorage.getItem('arena_current_sector') || 'Arrays';
      setSelectedSector(lastSector);
      setView('list');
    }
  }, []);
  // --- Animation Variants ---
  const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1 } };
  const slideUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (loading) return (
    <div className="pro-loading-container">
      <div className="pro-spinner"></div>
      <p>SYNCING NEURAL DATABASE...</p>
    </div>
  );

  return (
    <div className="arena-main-layout">
      <AnimatePresence mode='wait'>
        
        {/* --- VIEW 1: WELCOME BRIEFING --- */}
        {view === 'welcome' && (
          <motion.div 
            key="welcome"
            className="welcome-stage"
            variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="briefing-box">
              <FaRocket className="briefing-icon" />
              <h1>Initialize Neural Link</h1>
              <p>Welcome to the Technical Arena. Your journey to mastery begins here. 100+ high-intensity missions across 8 sectors await your logic.</p>
              <ul className="briefing-list">
                <li><FaCheckCircle /> Complete Easy nodes to unlock Medium sectors.</li>
                <li><FaCheckCircle /> Real-time code execution via Piston Engine.</li>
                <li><FaCheckCircle /> Progress tracked across your neural session.</li>
              </ul>
              <button className="enter-btn" onClick={() => setView('map')}>
                ENTER ARENA HUB
              </button>
            </div>
          </motion.div>
        )}

        {/* --- VIEW 2: ARENA HUB (WORLD MAP) --- */}
        {view === 'map' && (
          <motion.div    
            key="map"
            className="arena-hub-stage"
            variants={fadeIn} initial="hidden" animate="show" exit={{ opacity: 0 }}
          >
            <header className="hub-header">
              <h2><FaGlobe /> Sector Map</h2>
              <p>Select a sector to view active missions</p>
            </header>

            <div className="sector-grid">
              {['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Binary Tree', 'Dynamic Programming', 'Graphs'].map((sector) => (
                <motion.div 
                  key={sector}
                  className="sector-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => {
                    setSelectedSector(sector);
                    localStorage.setItem('arena_current_sector', sector); // 🔥 Yeh line yahan aayegi
                    setView('list');
                  }}
                >
                
                  <div className="sector-icon-box">{sector[0]}</div>
                  <h3>{sector}</h3>
                  <div className="sector-status">
                    <span>{questions.filter(q => q.topic === sector).length} Missions</span>
                  </div>
                  <div className="sector-progress-bar"><div className="fill" style={{width: '0%'}}></div></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- VIEW 3: MISSION LIST (TABLE) --- */}
        {view === 'list' && (
          <motion.div 
            key="list"
            className="mission-list-stage"
            variants={slideUp} initial="hidden" animate="show"
          >
            <header className="arena-top-nav">
              <div className="nav-info">
                <button className="back-to-map" onClick={() => setView('map')}>
                  <FaChevronRight className="rotate-180" /> Back to Map
                </button>
                <h1>{selectedSector} Sector</h1>
              </div>

              <div className="nav-controls">
                <div className="pro-search-box">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search mission..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="pro-dropdown">
                  <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                    <option value="All">Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </header>

            <div className="arena-table-container">
              <table className="arena-pro-table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>MISSION TITLE</th>
                    <th>DIFFICULTY</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q._id || q.id} className="arena-row">
                      <td className="id-cell">{q.id}</td>
                      <td className="title-cell">{q.title}</td>
                      <td className="diff-cell">
                        <span className={`diff-tag ${q.difficulty.toLowerCase()}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td>
                        <Link to={`/code/${q.id}`} className="arena-solve-btn">
                          Launch Mission <FaCode />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default TechnicalRound;