import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./Sidebar.css";
import { FaChartLine,FaSun,FaMoon, FaReact, FaMicrophone, FaUserTie, FaHistory, FaSignOutAlt, FaLayerGroup } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = ({ toggleTheme, currentTheme }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [userName, setUserName] = useState("User"); // 🔥 State for Dynamic Name

  // 🔥 Fetch name on mount
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Dashboard layout ke liye active class check karne ka function
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* 1. LOGO SECTION */}
      <img src="/src/assets/logo.png" alt="Logo" className="logo" />
      <div 
        className="brand" 
        onClick={() => navigate('/dashboard')} 
        style={{ cursor: 'pointer' }}
      >
        <h2>PREP <span>AI</span></h2>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="menu">
        
        {/* DASHBOARD */}
        <div 
          className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <FaChartLine /> Dashboard
        </div>

        {/* TECHNICAL ROUND */}
        <div 
          className={`menu-item ${isActive('/dashboard/technical') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/technical')}
          style={{ cursor: 'pointer' }}
        >
          <FaReact /> Technical Round
        </div>

        {/* ENGLISH COACH */}
        <div 
          className={`menu-item ${isActive('/dashboard/english') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/english')}
          style={{ cursor: 'pointer' }}
        >
          <FaMicrophone /> English Coach
        </div>

        {/* MOCK INTERVIEW */}
        <div 
          className={`menu-item ${isActive('/dashboard/mock-interview') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/mock-interview')}
          style={{ cursor: 'pointer' }}
        >
          <FaUserTie /> Mock Interview
        </div>

        {/* HISTORY (VAULT) */}
        <Link 
          to="/dashboard/history" 
          className={`menu-item ${isActive('/dashboard/history') ? 'active' : ''}`}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 20px', 
            textDecoration: 'none',
            transition: '0.3s',
            color: isActive('/dashboard/history') ? '#fff' : '#8b949e'
          }}
        >
          <FaHistory /> My Vault (History)
        </Link>

      </nav>
{/* --- 🌗 THEME TOGGLE SECTION --- */}
<div className="theme-switch-wrapper" style={{ padding: '10px 20px' }}>
          <div 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '12px',
                background: 'var(--border)', // CSS variable use kar rahe hain
                color: 'var(--text-main)',
                transition: '0.3s'
            }}
          >
            {currentTheme === 'dark' ? <FaSun color="#ffa502" /> : <FaMoon color="#6c5ce7" />}
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
                {currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
      </div>
      {/* 3. USER PROFILE (Bottom) - 🔥 Dynamic Version */}
      <div className="user-profile">
        {/* Is API se Shivang ke liye 'S' wala avatar apne aap ban jayega */}
        <img 
          src={`https://ui-avatars.com/api/?name=${userName}&background=6c5ce7&color=fff`} 
          alt="User" 
        />
        <div className="user-info">
          {/* Dashboard wala asli naam yahan dikhega */}
          <h4>{userName}</h4>
          <small>Pro Member</small>
        </div>
        
        {/* Logout */}
        <FaSignOutAlt 
            className="logout-icon" 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }} 
            style={{ cursor: 'pointer', color: '#f43f5e' }}
        />
      </div>
    </aside>
  );
};

export default Sidebar;