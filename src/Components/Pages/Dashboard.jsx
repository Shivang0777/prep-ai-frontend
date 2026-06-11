import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    FaFire, 
    FaCode, 
    FaMicrophone, 
    FaUserTie, 
    FaSignOutAlt, 
    FaRegBell 
} from "react-icons/fa";

const data = [
    { day: "Mon", value: 30 },
    { day: "Tue", value: 50 },
    { day: "Wed", value: 40 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 60 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 100 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("User");
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedName = localStorage.getItem('userName');
        const savedStreak = localStorage.getItem('userStreak') || 0;
        
        setStreak(Number(savedStreak));

        if (!token) {
            navigate('/login');
        } else if (savedName) {
            setUserName(savedName);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login');
    };

    return (
        <div className="dashboard-content">
            
            {/* --- HEADER --- */}
            <header className="dash-header">
                <div className="welcome-text">
                    <h1>Hello {userName.split(' ')[0]}</h1> 
                    <p> YOU ARE ON A <strong> {streak} DAY STREAK </strong> KEEP GOING </p>
                </div>
                
                <div className="header-actions">
                    <div className="streak-badge">
                        <FaFire /> <span>{streak} Days</span>
                    </div>
                    
                    <button className="notif-btn" aria-label="Notification">
                        <FaRegBell />
                    </button>
                    
                    {/* 🎯 FIXED: Mobile par button ko choke hone se bachane ke liye text ko responsive wrapper mein dala */}
                    <button onClick={handleLogout} className="logout-btn-header" title="Logout Session">
                      <span className="logout-text">Log ouT</span> <FaSignOutAlt />
                    </button>
                </div>
            </header>

            {/* --- CARDS SECTION --- */}
            <div className="card-container">
                <div className="card card-tech">
                    <div className="icon-box"><FaCode /></div>
                    <h3>TECHNICAL ROUND</h3>
                    <p>DSA, JS & System Design</p>
                    <button onClick={() => navigate('/dashboard/technical')}>Solve Problem</button>
                </div>

                <div className="card card-english">
                    <div className="icon-box"><FaMicrophone /></div>
                    <h3>English Fluency</h3>
                    <p>Fix grammar & pacing</p>
                    <button onClick={() => navigate('/dashboard/english')}>Speak Now</button>
                </div>

                <div className="card card-interview">
                    <div className="icon-box"><FaUserTie /></div>
                    <h3>Mock Interview</h3>
                    <p>AI HR Simulation</p>
                    <button onClick={() => navigate('/dashboard/mock-interview')}>Start Practice</button>
                </div>
            </div>

            {/* --- PERFORMANCE GRAPH --- */}
            <div className="stats-container">
                <div className="stats-header">
                    <h3>Weekly Performance</h3>
                    <span className="stats-label">Progress Tracker</span>
                </div>
                
                <div className="graph-box" style={{ width: '100%', height: window.innerWidth < 768 ? 220 : 300, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%" key={window.innerWidth}>
                        <LineChart data={data} margin={{ right: 20, left: -25, top: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                            
                            <XAxis 
                                dataKey="day" 
                                stroke="var(--text-dim)" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                            />
                            <YAxis 
                                stroke="var(--text-dim)" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                            />
                            
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--bg-card)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '8px', 
                                    color: 'var(--text-main)' 
                                }}
                                itemStyle={{ color: 'var(--text-main)' }}
                            />
                            
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="var(--accent)" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                                activeDot={{ r: 6, stroke: 'var(--bg-main)', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;