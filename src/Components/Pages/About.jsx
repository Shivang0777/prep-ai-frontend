import React from 'react';
import './About.css';
import { FaLinkedin, FaGithub, FaWhatsapp } from 'react-icons/fa'; // WhatsApp Icon import kiya
import aboutVid from '../../assets/about.mp4'; 

const About = () => {
    // Team data with LinkedIn, GitHub, and WhatsApp
    const teamMembers = [
        { 
            id: '01', 
            name: 'Shivang', 
            // role: 'Founder & Lead Architect', 
            li: 'https://www.linkedin.com/in/shivang-verma-1b8219323', 
            gh: 'https://github.com/Shivang0777',
            wa: '7668377272' // Apna 10-digit no. 91 ke saath yahan daal
        },
      
       
    ];

    return (
        <section className="about-section">
            <div className="about-container">
                <div className="about-grid">
                    
                    {/* LEFT SIDE: Content */}
                    <div className="about-text-content">
                        <span className="about-badge">Our Mission</span>
                        <h2 className="about-title">
                            Bridging the Gap <br /> Between 
                            <span className="gradient-text-v2"> Code and Fluency.
                            </span>
                        </h2>
                        
                        <p className="about-description">

                        </p>
                        At Prep AI, we aren’t just building another generic mock-test platform; we are engineering an autonomous career simulator. By integrating a live JavaScript sandbox with an advanced, gamified voice feedback coach, we failure-proof your technical round execution and communication stack in one unified web grid.
                        <div className="about-stats-row">
                            <div className="stat-node">
                                <h3>90%</h3>
                                <span>TECHNICAL ACCURACY</span>
                            </div>
                            <div className="stat-node">
                                <h3>Real-time</h3>
                                <span>CONVERSATIONAL ADAPTATION</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Video Frame */}
                    <div className="about-visual-side">
                        <div className="video-frame">
                            <video 
                                src={aboutVid} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="featured-video"
                            />
                            <div className="video-overlay-tint"></div>
                        </div>
                    </div>
                </div>

                {/* TEAM SECTION - 4 MEMBERS WITH WHATSAPP */}
                <div className="about-team-footer">
                    <h4 className="team-header-tag">// THE CORE TEAM</h4>
                    
                    <div className="team-list-container">
                        {teamMembers.map((member) => (
                            <div className="team-row-item" key={member.id}>
                                <div className="m-info">
                                    <span className="m-idx">{member.id}</span>
                                    <div className="m-name-group">
                                        <p className="m-name-tag">{member.name}</p>
                                        <span className="m-role">{member.role}</span>
                                    </div>
                                </div>
                                <div className="m-actions">
                                    <a href={member.li} target="_blank" rel="noreferrer" className="social-link" title="LinkedIn">
                                        <FaLinkedin /> <span>LinkedIn</span>
                                    </a>
                                    <a href={member.gh} target="_blank" rel="noreferrer" className="social-link" title="GitHub">
                                        <FaGithub /> <span>GitHub</span>
                                    </a>
                                    {/* WHATSAPP LINK ADDED */}
                                    <a 
                                        href={`https://wa.me/${member.wa}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="social-link wa-hover"
                                        title="WhatsApp"
                                    >
                                        <FaWhatsapp /> <span>WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;