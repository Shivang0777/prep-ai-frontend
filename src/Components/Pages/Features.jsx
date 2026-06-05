import React from 'react';
import { FaBrain, FaMicrophoneAlt, FaCode, FaChartLine } from 'react-icons/fa';
import './Features.css';

const Features = () => {
    const featureList = [
        {
            icon: <FaBrain />,
            title: "AI Mock Interviews",
            desc: "Face high-fidelity AI interviewers that dynamically change their questioning style and tech difficulty based on how you answer on the fly."
        },
        {
            icon: <FaMicrophoneAlt />,
            title: "Gamified English Coach",
            desc: "Fix your grammar, expand vocabulary, and build bulletproof communication through interactive speaking games and real-time speech feedback."
        },
        {
            icon: <FaCode />,
            title: "JS Tech Terminal",
            desc: "Solve core DSA and logic problems inside a live, dedicated JS code runner with instant execution and line-by-line optimization tips."
        },
        {
            icon: <FaChartLine />,
            title: "Interactive Terminal",
            desc: "No boring registration forms. Onboard your account through an intuitive conversational AI that secures your data and generates your live identity card.."
        }
    ];

    return (
        <div className="features-section">
            <div className="features-container">
                <div className="features-header">
                    <span className="features-badge">Capabilities</span>
                    <h2>Advanced AI Features</h2>
                </div>
                
                <div className="features-grid">
                    {featureList.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="f-icon-box">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;