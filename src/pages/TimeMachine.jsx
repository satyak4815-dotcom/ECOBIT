import React, { useState, useEffect } from 'react';
import { useESGStore } from '../store/useESGStore';
import { NavLink } from 'react-router-dom';
import { 
  Database, Clock, Leaf, Activity, ArrowUpRight, ArrowDownRight, 
  Wind, Droplets, Trash2, Zap, LayoutTemplate, Layers, CheckCircle 
} from 'lucide-react';

const BASE_YEAR = 2026;

// =========================================================
// 1. CALCULATION ENGINE
// =========================================================
function calculateESG(year, scenario, baselineData) {
  const years = year - BASE_YEAR;

  // Use real baseline if available, otherwise fallback to reasonable defaults
  const bRenewable = baselineData.renewablePercent ?? 17;
  const bWaste = baselineData.wasteRecycledPercent ?? 59;
  
  let renewable, carbon, waste, water;

  if (scenario === 'green') {
    renewable = Math.min(100, bRenewable + years * 4);
    carbon = Math.max(20, 100 - years * 3.5);
    waste = Math.min(100, bWaste + years * 2);
    water = Math.max(40, 100 - years * 1.5);
  } else if (scenario === 'current') {
    renewable = Math.min(100, bRenewable + years * 2);
    carbon = Math.max(30, 100 - years * 1.5);
    waste = Math.min(100, bWaste + years * 1);
    water = Math.max(50, 100 - years * 0.8);
  } else {
    // business
    renewable = Math.max(5, bRenewable + years * 0.2);
    carbon = Math.min(140, 100 + years * 2);
    waste = Math.max(20, bWaste - years * 1);
    water = Math.min(140, 100 + years * 1);
  }

  const rawScore = (renewable * 0.35) + (waste * 0.25) + ((200 - carbon) / 2 * 0.25) + ((200 - water) / 2 * 0.15);
  const esgScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return { renewable: Math.round(renewable), carbon: Math.round(carbon), waste: Math.round(waste), water: Math.round(water), esgScore };
}

function getEnvironmentState(score) {
  if (score < 30) return 'dying';
  if (score < 50) return 'weak';
  if (score < 70) return 'growing';
  if (score < 85) return 'healthy';
  return 'thriving';
}

// =========================================================
// 2. SVG ENVIRONMENT SCENE
// =========================================================
const EnvironmentalScene = ({ score, isComparing = false, label = "" }) => {
  const envState = getEnvironmentState(score);
  
  // Style configurations based on state
  const styles = {
    dying: { sky: 'linear-gradient(to bottom, #4a4a4a, #8b7355)', ground: '#5c4e3a', canopyOp: 0, trunk: '#33271d', particles: 'smoke' },
    weak: { sky: 'linear-gradient(to bottom, #728c89, #a3b19b)', ground: '#78825c', canopyOp: 0.3, trunk: '#4a3d2e', particles: 'none' },
    growing: { sky: 'linear-gradient(to bottom, #8db5c4, #b4d3d1)', ground: '#74a86b', canopyOp: 0.7, trunk: '#544634', particles: 'none' },
    healthy: { sky: 'linear-gradient(to bottom, #6cb2eb, #a2ded0)', ground: '#60b84f', canopyOp: 1, trunk: '#5c4a35', particles: 'light' },
    thriving: { sky: 'linear-gradient(to bottom, #399ced, #8df2d9)', ground: '#4ac932', canopyOp: 1, trunk: '#5c4a35', particles: 'glow', filter: 'drop-shadow(0 0 20px rgba(141,255,114,0.4))' },
  };
  
  const currentStyle = styles[envState];

  return (
    <div style={{
      position: 'relative', width: '100%', height: isComparing ? '300px' : '450px', 
      borderRadius: '16px', overflow: 'hidden', 
      background: currentStyle.sky, transition: 'background 1.5s ease-in-out',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
    }}>
      {/* Dynamic Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '35%',
        background: currentStyle.ground, transition: 'background 1.5s ease-in-out',
        borderRadius: '50% 50% 0 0 / 20px 20px 0 0'
      }} />

      {/* Particles */}
      {currentStyle.particles === 'smoke' && (
        <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.6, backgroundImage: 'radial-gradient(circle at 50% 70%, rgba(100,100,100,0.5) 0%, transparent 60%)', animation: 'pulse 4s infinite alternate' }} />
      )}
      {currentStyle.particles === 'glow' && (
        <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(141,255,114,0.2) 0%, transparent 50%)', animation: 'pulse 3s infinite alternate' }} />
      )}

      {/* SVG Tree */}
      <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%) scale(0.75)', transformOrigin: 'bottom center', filter: currentStyle.filter || 'none', transition: 'filter 1.5s ease' }}>
        <svg width="200" height="250" viewBox="0 0 200 250" style={{ overflow: 'visible' }}>
          {/* Trunk */}
          <path d="M90 250 Q95 150 90 100 L110 100 Q105 150 110 250 Z" fill={currentStyle.trunk} style={{ transition: 'fill 1.5s ease' }} />
          <path d="M90 130 Q70 100 50 80" stroke={currentStyle.trunk} strokeWidth="12" fill="none" strokeLinecap="round" style={{ transition: 'stroke 1.5s ease' }} />
          <path d="M110 140 Q130 90 160 70" stroke={currentStyle.trunk} strokeWidth="15" fill="none" strokeLinecap="round" style={{ transition: 'stroke 1.5s ease' }} />
          <path d="M100 100 Q100 60 105 30" stroke={currentStyle.trunk} strokeWidth="10" fill="none" strokeLinecap="round" style={{ transition: 'stroke 1.5s ease' }} />
          
          {/* Canopy (Leaves) */}
          <g style={{ opacity: currentStyle.canopyOp, transition: 'opacity 1.5s ease, transform 1.5s ease', transformOrigin: '100px 100px', transform: `scale(${0.8 + (currentStyle.canopyOp * 0.2)})` }}>
            {/* Left Branch Leaves */}
            <circle cx="50" cy="70" r="35" fill="rgba(60, 140, 50, 0.9)" />
            <circle cx="35" cy="90" r="25" fill="rgba(75, 160, 60, 0.9)" />
            
            {/* Right Branch Leaves */}
            <circle cx="160" cy="60" r="45" fill="rgba(60, 140, 50, 0.9)" />
            <circle cx="180" cy="80" r="30" fill="rgba(75, 160, 60, 0.9)" />
            
            {/* Top Canopy */}
            <circle cx="105" cy="25" r="50" fill="rgba(50, 120, 40, 0.9)" />
            <circle cx="80" cy="45" r="40" fill="rgba(75, 160, 60, 0.9)" />
            <circle cx="130" cy="40" r="35" fill="rgba(90, 180, 70, 0.9)" />
          </g>
        </svg>
      </div>

      {label && (
        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 14, color: 'var(--deep-forest)', backdropFilter: 'blur(8px)' }}>
          {label}
        </div>
      )}
      
      {/* Add global keyframes if not present */}
      <style>{`
        @keyframes pulse { 0% { opacity: 0.3; transform: scale(0.95); } 100% { opacity: 0.7; transform: scale(1.05); } }
      `}</style>
    </div>
  );
};

// =========================================================
// 3. MAIN COMPONENT
// =========================================================
export default function TimeMachine() {
  const { rawData } = useESGStore();
  const hasData = Object.keys(rawData).length > 0;

  const [selectedYear, setSelectedYear] = useState(2026);
  const [scenario, setScenario] = useState('current'); // 'current', 'green', 'business'
  const [isComparing, setIsComparing] = useState(false);

  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)', marginBottom: 16 }}>No Baseline Data Available</h2>
        <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.8)', marginBottom: 32 }}>
          You must load verified operational data before projecting into the future.
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          <Database size={20} /> LOAD BASELINE DATA
        </NavLink>
      </div>
    );
  }

  // Calculate values
  const baseline = calculateESG(2026, 'current', rawData); // True baseline
  const projected = calculateESG(selectedYear, scenario, rawData);

  const getMetricColor = (diff, isGoodDirectionUp) => {
    if (diff === 0) return 'var(--deep-forest)';
    const improved = isGoodDirectionUp ? diff > 0 : diff < 0;
    return improved ? 'var(--leaf-green)' : 'var(--risk-red)';
  };

  const getNarrative = () => {
    if (selectedYear === BASE_YEAR) return "You are viewing the current verified baseline. Adjust the timeline to simulate future environmental impact.";
    
    if (scenario === 'green') return `By ${selectedYear}, massive investments in renewable energy and circular waste infrastructure have successfully decoupled growth from emissions. The resulting high ESG score (${projected.esgScore}) reflects a thriving, restored ecosystem.`;
    if (scenario === 'current') return `By ${selectedYear}, steady but moderate sustainability improvements have maintained basic compliance. While some metrics improved, the ecosystem remains vulnerable to long-term climate risks.`;
    if (scenario === 'business') return `By ${selectedYear}, failure to transition away from carbon-intensive operations has caused severe metric degradation. The resulting low ESG score (${projected.esgScore}) reflects high regulatory risk and a devastated local ecosystem.`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={32} /> ESG Time Machine
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.7)', marginTop: 8 }}>
            Simulate future sustainability performance and immediately visualize the environmental consequences.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setIsComparing(!isComparing)}
          style={{ background: isComparing ? 'var(--risk-orange)' : 'var(--deep-forest)' }}
        >
          {isComparing ? <><LayoutTemplate size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Exit Comparison</> : <><Layers size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Compare to Baseline</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isComparing ? '1fr' : '1.2fr 1fr', gap: 32 }}>
        
        {/* LEFT PANEL: VISUALIZATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isComparing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <EnvironmentalScene score={baseline.esgScore} isComparing={true} label={`Baseline (${BASE_YEAR})`} />
              <EnvironmentalScene score={projected.esgScore} isComparing={true} label={`Projected (${selectedYear} - ${scenario.toUpperCase()})`} />
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 16, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }}>
              <EnvironmentalScene score={projected.esgScore} />
              
              <div style={{ marginTop: 24, padding: 24, background: 'rgba(255,255,255,0.8)', borderRadius: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 8 }}>Environmental Impact Status</h4>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)', textTransform: 'uppercase' }}>{getEnvironmentState(projected.esgScore)} PLANET</div>
                <p style={{ fontSize: 16, color: 'var(--deep-forest)', lineHeight: 1.5, marginTop: 12, fontStyle: 'italic' }}>
                  "{getNarrative()}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CONTROLS & METRICS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* TIMELINE CONTROL */}
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', padding: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 24 }}>Time Travel</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>2026</span>
              <input 
                type="range" 
                min="2026" 
                max="2050" 
                step="1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--leaf-green)', height: 8, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>2050</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--leaf-green)', lineHeight: 1 }}>{selectedYear}</div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.5)', marginTop: 4 }}>Selected Projection Year</div>
            </div>
          </div>

          {/* SCENARIO CONTROL */}
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', padding: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 16 }}>Policy Scenario</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => setScenario('green')}
                style={{ padding: 16, borderRadius: 8, border: `2px solid ${scenario === 'green' ? 'var(--leaf-green)' : 'rgba(36,84,56,0.1)'}`, background: scenario === 'green' ? 'rgba(114,184,90,0.1)' : 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>Green Transition</span>
                {scenario === 'green' && <CheckCircle size={20} color="var(--leaf-green)" />}
              </button>
              <button 
                onClick={() => setScenario('current')}
                style={{ padding: 16, borderRadius: 8, border: `2px solid ${scenario === 'current' ? 'var(--risk-orange)' : 'rgba(36,84,56,0.1)'}`, background: scenario === 'current' ? 'rgba(244,162,97,0.1)' : 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>Current Trajectory (Baseline)</span>
                {scenario === 'current' && <CheckCircle size={20} color="var(--risk-orange)" />}
              </button>
              <button 
                onClick={() => setScenario('business')}
                style={{ padding: 16, borderRadius: 8, border: `2px solid ${scenario === 'business' ? 'var(--risk-red)' : 'rgba(36,84,56,0.1)'}`, background: scenario === 'business' ? 'rgba(231,111,81,0.1)' : 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>High Carbon / Business as Usual</span>
                {scenario === 'business' && <CheckCircle size={20} color="var(--risk-red)" />}
              </button>
            </div>
          </div>

          {/* METRICS PANEL */}
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)' }}>Projected ESG Metrics</h3>
              <span style={{ fontSize: 10, background: 'rgba(36,84,56,0.1)', padding: '4px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>Simulated Data</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Score */}
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(36,84,56,0.1)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Overall ESG Score</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--deep-forest)' }}>{projected.esgScore} <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(36,84,56,0.4)' }}>/ 100</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.5)', marginBottom: 4 }}>Change vs 2026</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: getMetricColor(projected.esgScore - baseline.esgScore, true), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {projected.esgScore >= baseline.esgScore ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    {Math.abs(projected.esgScore - baseline.esgScore)} pts
                  </div>
                </div>
              </div>

              {/* Carbon */}
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, border: '1px solid rgba(36,84,56,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Wind size={12} /> Carbon Index</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)' }}>{projected.carbon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: getMetricColor(projected.carbon - baseline.carbon, false), marginTop: 4 }}>
                  {projected.carbon > baseline.carbon ? '+' : ''}{projected.carbon - baseline.carbon} vs base
                </div>
              </div>

              {/* Renewable */}
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, border: '1px solid rgba(36,84,56,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} /> Renewable %</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)' }}>{projected.renewable}%</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: getMetricColor(projected.renewable - baseline.renewable, true), marginTop: 4 }}>
                  {projected.renewable > baseline.renewable ? '+' : ''}{projected.renewable - baseline.renewable} pp vs base
                </div>
              </div>

              {/* Waste */}
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, border: '1px solid rgba(36,84,56,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={12} /> Waste Recycled</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)' }}>{projected.waste}%</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: getMetricColor(projected.waste - baseline.waste, true), marginTop: 4 }}>
                  {projected.waste > baseline.waste ? '+' : ''}{projected.waste - baseline.waste} pp vs base
                </div>
              </div>

              {/* Water */}
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 12, border: '1px solid rgba(36,84,56,0.1)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Droplets size={12} /> Water Index</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)' }}>{projected.water}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: getMetricColor(projected.water - baseline.water, false), marginTop: 4 }}>
                  {projected.water > baseline.water ? '+' : ''}{projected.water - baseline.water} vs base
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
