import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, matchPath, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import Navebar from './Components/Navebar';
import Sidebar from './Components/Sidebar';
import Home from './Components/Pages/Home';
import Dashboard from './Components/Pages/Dashboard';
import TechnicalRound from './Components/Pages/TechnicalRound';
import CodeEditor from './Components/Pages/CodeEditor';
import Preloader from './Components/Pages/Preloader';
import MockInterviewModule from './Components/Pages/MockInterview'; 
import History from './Components/Pages/History';
import Register from './Components/Pages/Register'; 
import Login from './Components/Pages/Login';
import EnglishPractice from './Components/Pages/EnglishPractice';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // --- 🌗 THEME LOGIC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const isCodePage = matchPath("/code/:id", location.pathname);
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-world">
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* Landing Page Navbar */}
          {!isCodePage && !isAuthPage && !isDashboard && (
            <Navebar toggleTheme={toggleTheme} currentTheme={theme} />
          )}
          
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/code/:id" element={<CodeEditor />} />
              
              {/* --- 🚀 DASHBOARD LAYOUT --- */}
              <Route path="/dashboard/*" element={
                 <div className="dashboard-layout-wrapper">
                    <div className="sidebar-fixed-area">
                       <Sidebar toggleTheme={toggleTheme} currentTheme={theme} />
                    </div>

                    <div className="content-scroll-area">
                       <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="technical" element={<TechnicalRound />} />
                          <Route path="english" element={<EnglishPractice />} />
                          <Route path="mock-interview" element={<MockInterviewModule />} />
                          <Route path="history" element={<History />} />
                       </Routes>
                    </div>
                 </div>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;