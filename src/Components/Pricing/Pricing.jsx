import React from 'react';
import './Pricing.css';

const Pricing = () => {
  return (
    <section id="pricing-section" className="pricing-section">
      <div className="pricing-header">
        <span className="pricing-badge">PRICING</span>
        <h2>Simple, Transparent Plans</h2>
        <p>No hidden fees. Choose the plan that fits your preparation needs.</p>
      </div>

      <div className="pricing-container">
        {/* Card 1: Free Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Free Plan</h3>
            <p className="plan-desc">Perfect for trying out Prep AI</p>
            <div className="price">₹0<span>/month</span></div>
          </div>
          <ul className="features-list">
            <li>✓ 5 AI Mock Interviews / mo</li>
            <li>✓ Basic Performance Analytics</li>
            <li>✓ Standard AI Feedback</li>
            <li className="disabled">✗ Priority Support</li>
            <li className="disabled">✗ Unlimited Custom Topics</li>
          </ul>
          <button className="pricing-btn-minimal">Get Started</button>
        </div>

        {/* Card 2: Pro Plan */}
        <div className="pricing-card popular">
          <div className="popular-badge">MOST POPULAR</div>
          <div className="card-header">
            <h3>Pro Plan</h3>
            <p className="plan-desc">Best for active job seekers</p>
            <div className="price">₹499<span>/month</span></div>
          </div>
          <ul className="features-list">
            <li>✓ Unlimited AI Mock Interviews</li>
            <li>✓ Advanced Deep-Dive Analytics</li>
            <li>✓ Detailed Resume Review by AI</li>
            <li>✓ Priority Email Support</li>
            <li>✓ Custom Topic Selection</li>
          </ul>
          <button className="pricing-btn-solid">Upgrade to Pro</button>
        </div>

        {/* Card 3: Ultimate Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Ultimate</h3>
            <p className="plan-desc">For serious learners & teams</p>
            <div className="price">₹999<span>/month</span></div>
          </div>
          <ul className="features-list">
            <li>✓ Everything in Pro Plan</li>
            <li>✓ 1-on-1 Human Mentor Session</li>
            <li>✓ Lifetime History Storage</li>
            <li>✓ 24/7 Premium Whatsapp Support</li>
            <li>✓ Dedicated Interview Roadmaps</li>
          </ul>
          <button className="pricing-btn-minimal">Go Ultimate</button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;