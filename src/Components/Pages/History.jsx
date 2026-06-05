import React, { useState, useEffect } from 'react';
import { FaLaptopCode, FaLanguage, FaRobot, FaCalendarAlt, FaStar, FaPlayCircle } from 'react-icons/fa';

const History = () => {
    const [activeTab, setActiveTab] = useState('All');
    
    // 📱 Mobile responsive tracking ke liye ek state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const historyData = [
        { id: 1, type: 'Tech', title: 'React Frontend Developer', score: '8.5/10', date: '16 Mar 2026', icon: <FaLaptopCode color="#3b82f6"/>, feedback: 'Great logic, but need to improve state management.' },
        { id: 2, type: 'English', title: 'Grammar & Fluency Test', score: '92%', date: '14 Mar 2026', icon: <FaLanguage color="#10b981"/>, feedback: 'Excellent pronunciation. Used 3 filler words.' },
        { id: 3, type: 'Coach', title: 'HR Behavioral Round', score: '7/10', date: '10 Mar 2026', icon: <FaRobot color="#8b5cf6"/>, feedback: 'Good confidence, but answers were too short.' },
        { id: 4, type: 'Tech', title: 'Node.js Backend Dev', score: '9/10', date: '05 Mar 2026', icon: <FaLaptopCode color="#3b82f6"/>, feedback: 'Perfect API architecture explanation.' },
    ];

    const filteredHistory = activeTab === 'All' 
        ? historyData 
        : historyData.filter(item => item.type === activeTab);

    return (
        <div style={{ 
            padding: isMobile ? '15px' : '30px', // Mobile par padding kam kar di
            background: 'var(--bg-main)', 
            minHeight: '100vh', 
            color: 'var(--text-main)', 
            transition: '0.3s' 
        }}>
            
            {/* 🌟 Header Section (Responsive) */}
            <div style={{ 
                marginBottom: '30px', 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', // Mobile pe upar-niche
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                gap: '15px'
            }}>
                <div>
                    <h1 style={{ color: 'var(--text-main)', fontSize: isMobile ? '1.6rem' : '2rem', marginBottom: '5px' }}>My Vault 🗄️</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Track your interview journey and analyze your growth.</p>
                </div>
                
                <div style={{ 
                    background: 'var(--bg-sidebar)', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    width: isMobile ? '100%' : 'auto', // Mobile pe full width
                    textAlign: 'center'
                }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Total Interviews: </span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>{historyData.length}</strong>
                </div>
            </div>

            {/* 🎛️ Tab Buttons (Scrollable on Mobile) */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '30px', 
                borderBottom: '1px solid var(--border)', 
                paddingBottom: '15px',
                overflowX: isMobile ? 'auto' : 'unset', // Mobile pe side scroll automatic chalega
                whiteSpace: 'nowrap',
                paddingLeft: '5px'
            }}>
                {['All', 'Tech', 'English', 'Coach'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === tab ? 'var(--accent-glow)' : 'transparent',
                            color: activeTab === tab ? 'var(--text-main)' : 'var(--text-dim)',
                            border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            transition: 'all 0.3s ease',
                            flexShrink: 0 // Mobile pe buttons pichke nahi
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 📜 History Cards List (Responsive Layout) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((session) => (
                        <div key={session.id} 
                             style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '12px', 
                                padding: isMobile ? '15px' : '20px',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row', // Mobile pe row se column ho jayega
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'stretch' : 'center',
                                gap: '20px',
                                transition: '0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: isMobile ? 'column' : 'row', // Icon aur content bhi mobile pe straight
                                alignItems: isMobile ? 'flex-start' : 'center', 
                                gap: '15px' 
                            }}>
                                {/* Icon Wrapper */}
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    background: 'var(--bg-main)', 
                                    padding: '12px', 
                                    borderRadius: '50%', 
                                    border: '1px solid var(--border)', 
                                    display: 'flex',
                                    alignSelf: isMobile ? 'center' : 'auto' // Mobile pe icon center ho jaye
                                }}>
                                    {session.icon}
                                </div>
                                
                                <div>
                                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0', fontSize: '1.1rem', textAlign: isMobile ? 'center' : 'left' }}>{session.title}</h3>
                                    <div style={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap',
                                        gap: '15px', 
                                        color: 'var(--text-dim)', 
                                        fontSize: '0.85rem',
                                        justifyContent: isMobile ? 'center' : 'flex-start'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> {session.date}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaStar color="#fbbf24" /> Score: {session.score}</span>
                                    </div>
                                    <p style={{ 
                                        color: 'var(--text-dim)', 
                                        fontSize: '0.85rem', 
                                        marginTop: '10px', 
                                        fontStyle: 'italic', 
                                        opacity: 0.8,
                                        textAlign: isMobile ? 'center' : 'left' 
                                    }}>
                                        "{session.feedback}"
                                    </p>
                                </div>
                            </div>

                            {/* Action Button (Full width on mobile) */}
                            <button style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '8px', 
                                padding: '12px 20px', 
                                background: '#2ea043', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                width: isMobile ? '100%' : 'auto', // Mobile pe full width dabba button
                                boxShadow: '0 4px 10px rgba(46, 160, 67, 0.2)'
                            }}>
                                <FaPlayCircle size={18} /> View Video
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                        No history found for {activeTab}. Time to take a new test! 🚀
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;