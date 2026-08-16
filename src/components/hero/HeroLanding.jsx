import React from 'react';
import '../../hero.css';

export default function HeroLanding({ onExplore }) {
  return (
    <div className="hero-landing-container fade-in-hero">
      
      {/* Floating Navigation */}
      <nav className="floating-nav">
        <div className="nav-brand">ECOBIT</div>
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#solutions">Solutions</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#about">About</a>
        </div>
        <button className="nav-cta" onClick={onExplore}>OPEN DASHBOARD →</button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">ECOBIT • ESG INTELLIGENCE PLATFORM</div>
          <h1 className="hero-headline">
            <span className="headline-dark">TURN ESG DATA</span><br />
            <span className="headline-gradient">INTO ACTION.</span>
          </h1>
          <p className="hero-description">
            One intelligence layer for emissions, ESG compliance, greenwashing detection, policy change and sustainability decisions.
          </p>
          <div className="hero-actions">
            <button className="primary-cta" onClick={onExplore}>
              EXPLORE ECOBIT
              <span className="cta-arrow">→</span>
            </button>
            <button className="secondary-cta">
              VIEW HOW IT WORKS
            </button>
          </div>
        </div>
      </section>

      {/* Product Value Strip */}
      <div className="value-strip">
        <div className="value-strip-title">ONE PLATFORM. COMPLETE ESG INTELLIGENCE.</div>
        <div className="value-items">
          <div className="value-item">
            <span className="value-number">01</span>
            <span className="value-label">Measure</span>
          </div>
          <div className="value-item">
            <span className="value-number">02</span>
            <span className="value-label">Detect</span>
          </div>
          <div className="value-item">
            <span className="value-number">03</span>
            <span className="value-label">Simulate</span>
          </div>
          <div className="value-item">
            <span className="value-number">04</span>
            <span className="value-label">Act</span>
          </div>
        </div>
      </div>

      {/* Feature Preview Section */}
      <section className="features-section">
        <h2 className="features-title">THE INTELLIGENCE LAYER BEHIND ECOBIT</h2>
        <div className="features-grid">
          {[
            { title: "Greenwashing Detector", desc: "AI-driven anomaly detection for sustainability claims." },
            { title: "ESG Time Machine", desc: "Historical impact analysis and trend forecasting." },
            { title: "What-If Simulator", desc: "Simulate operational changes against ESG metrics." },
            { title: "Financial Impact / ROI", desc: "Correlate sustainability actions with financial outcomes." },
            { title: "Policy Delta Radar", desc: "Real-time global environmental policy tracking." },
            { title: "BRSR Compliance", desc: "Automated framework mapping and reporting." },
            { title: "Evidence Vault", desc: "Immutable storage for sustainability audits." },
            { title: "AI Copilot", desc: "Natural language query for your ESG data." }
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
