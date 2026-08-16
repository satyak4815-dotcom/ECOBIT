import React, { useState, useEffect } from 'react';
import { useESGStore } from '../store/useESGStore';
import { calculateFinancialImpact, formatCurrency } from '../calculations/financial';
import { NavLink } from 'react-router-dom';
import { Activity, Leaf, Zap, ArrowRight, TrendingDown, Target, ZapOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { calculateEmissions } from '../calculations/emissions';

// ============================================================================
// SVG CIRCULAR IMPACT VISUALIZER
// ============================================================================
const EnvironmentalImpactRing = ({ reductionPercentage, avoidedCO2, isScanning }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  
  // Safe percentage calculation
  const safePercentage = Math.min(100, Math.max(0, reductionPercentage || 0));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
      <svg width="240" height="240" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 12px rgba(114, 184, 90, 0.4))' }}>
        {/* Track Background */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(36,84,56,0.1)" strokeWidth="8" />
        
        {/* Dynamic Progress Ring */}
        <circle 
          cx="100" 
          cy="100" 
          r={radius} 
          fill="none" 
          stroke="var(--leaf-green)" 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isScanning ? circumference : strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        
        {/* Scanning Pulse Ring */}
        {isScanning && (
          <circle 
            cx="100" cy="100" r={radius} fill="none" stroke="rgba(141, 255, 114, 0.8)" strokeWidth="12"
            style={{ animation: 'scanPulse 1s linear infinite' }}
          />
        )}
      </svg>
      
      {/* Center Readout */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Leaf size={24} color="var(--leaf-green)" style={{ marginBottom: 4, opacity: isScanning ? 0.5 : 1, transition: 'opacity 0.3s' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(36,84,56,0.6)' }}>CO₂e Avoided</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--deep-forest)', lineHeight: 1.1, marginTop: 4 }}>
          {isScanning ? <span style={{ animation: 'blink 0.5s infinite' }}>---</span> : avoidedCO2.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(36,84,56,0.5)' }}>tons / yr</div>
      </div>

      <style>{`
        @keyframes scanPulse {
          0% { stroke-dasharray: 0 ${circumference}; stroke-dashoffset: 0; opacity: 1; }
          50% { stroke-dasharray: ${circumference * 0.5} ${circumference}; opacity: 0.5; }
          100% { stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: -${circumference}; opacity: 0; }
        }
        @keyframes blink { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN SIMULATOR COMPONENT
// ============================================================================
export default function Simulator() {
  const { rawData, scenarios, updateScenarioA } = useESGStore();
  const [isScanning, setIsScanning] = useState(false);

  const hasData = Object.keys(rawData).length > 0;

  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 16 }}>No Baseline Data</h2>
        <p style={{ fontSize: 16, color: 'rgba(36, 84, 56, 0.6)', marginBottom: 32 }}>
          You must load data before running environmental simulations.
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          LOAD DATA
        </NavLink>
      </div>
    );
  }

  const { baseline, scenarioA } = scenarios;
  if (!baseline || !scenarioA) return null;

  // Simulate an "Optimized Scenario" purely for UI comparison.
  // We assume an aggressive 80% renewable target and 15% efficiency gain over baseline.
  const optimizedRaw = {
    ...baseline.raw,
    totalElectricity_kwh: baseline.raw.totalElectricity_kwh * 0.85,
    renewablePercent: Math.max(80, baseline.raw.renewablePercent)
  };
  
  // Calculate emissions for Optimized Scenario dynamically using the central calculator
  const optimizedEmissions = calculateEmissions(optimizedRaw);

  // Run financial calculations for both scenarios against baseline
  const impactA = calculateFinancialImpact(baseline.emissions, scenarioA.emissions);
  const impactOptimized = calculateFinancialImpact(baseline.emissions, optimizedEmissions);

  const handleSliderChange = (e, field) => {
    updateScenarioA({ [field]: parseFloat(e.target.value) });
  };

  const runScenario = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  // Reduction percentage for visualizer
  const reductionPercentageA = baseline.emissions.totalEmissions > 0 
    ? (impactA.carbonReduction / baseline.emissions.totalEmissions) * 100 
    : 0;

  // Insight Generator
  const generateInsight = () => {
    const renewDelta = scenarioA.raw.renewablePercent - baseline.raw.renewablePercent;
    const energyDelta = scenarioA.raw.totalElectricity_kwh - baseline.raw.totalElectricity_kwh;
    
    if (renewDelta > 0 && energyDelta < 0) {
      return `By simultaneously expanding renewables by ${renewDelta} pp and reducing energy footprint, Scenario A unlocks a highly efficient path with a rapid payback of ${impactA.paybackYears} years.`;
    }
    if (renewDelta > 15) {
      return `Aggressively shifting to ${scenarioA.raw.renewablePercent}% renewable electricity successfully avoids ${impactA.carbonReduction.toLocaleString()} tCO₂e, driving a strong ROI of ${impactA.roi}%.`;
    }
    if (energyDelta > 0) {
      return `Warning: Operational expansion has increased energy usage. Ensure renewable integration outpaces energy demand to avoid long-term carbon tax liabilities.`;
    }
    return `Adjust the parameters to model your organization's transition. Focus on renewable deployment and energy efficiency to maximize ROI and minimize environmental impact.`;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Activity size={32} /> What-If Simulator
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.7)', marginTop: 8 }}>
            Dynamically model operational changes against your verified baseline to optimize ESG & financial impact.
          </p>
        </div>
        <button 
          onClick={runScenario}
          className="btn-primary" 
          style={{ background: isScanning ? 'rgba(36,84,56,0.5)' : 'var(--leaf-green)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '16px 32px' }}
          disabled={isScanning}
        >
          <RefreshCw size={20} className={isScanning ? "spinning" : ""} style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
          {isScanning ? 'ANALYZING...' : 'RUN SCENARIO'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 32 }}>
        
        {/* LEFT: CONTROLS & VISUALIZER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="glass-panel" style={{ padding: 32, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 32 }}>Operational Levers</h3>
            
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} /> Renewable Share</span>
                <span style={{ fontSize: 18, color: 'var(--leaf-green)', fontWeight: 800 }}>{scenarioA.raw.renewablePercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={scenarioA.raw.renewablePercent}
                onChange={(e) => handleSliderChange(e, 'renewablePercent')}
                style={{ width: '100%', accentColor: 'var(--leaf-green)', cursor: 'pointer', height: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 600, color: 'rgba(36,84,56,0.5)' }}>
                <span>Base: {baseline.raw.renewablePercent}%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 8 }}><ZapOff size={18} /> Total Energy (kWh)</span>
              </div>
              <div style={{ fontSize: 24, color: 'var(--deep-forest)', fontWeight: 800, marginBottom: 12 }}>{scenarioA.raw.totalElectricity_kwh.toLocaleString()}</div>
              <input 
                type="range" 
                min={baseline.raw.totalElectricity_kwh * 0.5} 
                max={baseline.raw.totalElectricity_kwh * 1.5} 
                step="1000"
                value={scenarioA.raw.totalElectricity_kwh}
                onChange={(e) => handleSliderChange(e, 'totalElectricity_kwh')}
                style={{ width: '100%', accentColor: 'var(--deep-forest)', cursor: 'pointer', height: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 600, color: 'rgba(36,84,56,0.5)' }}>
                <span>-50%</span>
                <span>Base: {baseline.raw.totalElectricity_kwh.toLocaleString()}</span>
                <span>+50%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 32, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)', marginBottom: 24 }}>Live Environmental Impact</h3>
            <EnvironmentalImpactRing reductionPercentage={reductionPercentageA} avoidedCO2={impactA.carbonReduction} isScanning={isScanning} />
          </div>
          
        </div>

        {/* RIGHT: COMPARISON MATRIX & INSIGHTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* COMPARISON TABLE */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.85)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(36,84,56,0.1)', background: 'rgba(255,255,255,0.5)' }}>
              <div style={{ padding: '24px 16px' }}></div>
              <div style={{ padding: '24px 16px', borderLeft: '1px solid rgba(36,84,56,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.5)', marginBottom: 4 }}>Verified Operational Data</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--deep-forest)' }}>BASELINE</div>
              </div>
              <div style={{ padding: '24px 16px', borderLeft: '1px solid rgba(36,84,56,0.1)', textAlign: 'center', background: 'rgba(114, 184, 90, 0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--leaf-green)', marginBottom: 4 }}>Live Simulator Config</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--leaf-green)' }}>SCENARIO A</div>
              </div>
              <div style={{ padding: '24px 16px', borderLeft: '1px solid rgba(36,84,56,0.1)', textAlign: 'center', background: 'var(--deep-forest)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Recommended ESG Path</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Target size={16} color="var(--leaf-green)"/> OPTIMIZED</div>
              </div>
            </div>

            {/* Metrics Rows */}
            {[
              { label: "Renewable Share", key: "renewable", baseline: `${baseline.raw.renewablePercent}%`, a: `${scenarioA.raw.renewablePercent}%`, opt: `${optimizedRaw.renewablePercent}%` },
              { label: "Energy Demand", key: "energy", baseline: baseline.raw.totalElectricity_kwh.toLocaleString(), a: scenarioA.raw.totalElectricity_kwh.toLocaleString(), opt: optimizedRaw.totalElectricity_kwh.toLocaleString() },
              { label: "Total Emissions (tCO₂e)", key: "emissions", baseline: Math.round(baseline.emissions.totalEmissions).toLocaleString(), a: Math.round(scenarioA.emissions.totalEmissions).toLocaleString(), opt: Math.round(optimizedEmissions.totalEmissions).toLocaleString(), bold: true },
              { label: "Carbon Avoided (tCO₂e)", key: "reduction", baseline: "—", a: impactA.carbonReduction.toLocaleString(), opt: impactOptimized.carbonReduction.toLocaleString(), green: true },
              { label: "Est. Investment", key: "investment", baseline: "—", a: formatCurrency(impactA.estimatedInvestment), opt: formatCurrency(impactOptimized.estimatedInvestment) },
              { label: "Annual Carbon Savings", key: "savings", baseline: "—", a: formatCurrency(impactA.annualSavings), opt: formatCurrency(impactOptimized.annualSavings), green: true },
              { label: "Return on Investment", key: "roi", baseline: "—", a: impactA.roi > 0 ? `${impactA.roi}%` : "—", opt: impactOptimized.roi > 0 ? `${impactOptimized.roi}%` : "—" },
              { label: "Payback Period", key: "payback", baseline: "—", a: impactA.paybackYears > 0 ? `${impactA.paybackYears} yrs` : "—", opt: impactOptimized.paybackYears > 0 ? `${impactOptimized.paybackYears} yrs` : "—" }
            ].map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(36,84,56,0.05)' }}>
                <div style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'rgba(36,84,56,0.7)', display: 'flex', alignItems: 'center' }}>
                  {row.label}
                </div>
                <div style={{ padding: '16px', borderLeft: '1px solid rgba(36,84,56,0.05)', textAlign: 'center', fontSize: 16, fontWeight: 600, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.baseline}
                </div>
                <div style={{ padding: '16px', borderLeft: '1px solid rgba(36,84,56,0.05)', textAlign: 'center', fontSize: row.bold ? 20 : 16, fontWeight: row.bold ? 800 : 700, color: row.green ? 'var(--leaf-green)' : 'var(--deep-forest)', background: 'rgba(114, 184, 90, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isScanning ? <span style={{ animation: 'blink 0.5s infinite' }}>---</span> : row.a}
                </div>
                <div style={{ padding: '16px', borderLeft: '1px solid rgba(36,84,56,0.05)', textAlign: 'center', fontSize: row.bold ? 20 : 16, fontWeight: row.bold ? 800 : 700, color: row.green ? 'var(--leaf-green)' : 'white', background: 'var(--deep-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {row.opt}
                </div>
              </div>
            ))}
            
          </div>

          {/* DYNAMIC INSIGHT & TRADE-OFF */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            <div className="glass-panel" style={{ padding: 24, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderLeft: '4px solid var(--leaf-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle2 size={20} color="var(--leaf-green)" />
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.7)' }}>Scenario Intelligence</h3>
              </div>
              <p style={{ fontSize: 18, color: 'var(--deep-forest)', lineHeight: 1.6, fontWeight: 500 }}>
                {isScanning ? "Analyzing operational deltas and calculating carbon pricing impact..." : generateInsight()}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: 24, background: 'var(--deep-forest)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Environmental ↔ Financial Trade-off</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Avoided Carbon</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--leaf-green)' }}>{isScanning ? '---' : impactA.carbonReduction.toLocaleString()} <span style={{fontSize: 12}}>tCO₂e</span></div>
                </div>
                <TrendingDown size={24} color="rgba(255,255,255,0.2)" />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Payback Period</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{isScanning ? '---' : (impactA.paybackYears > 0 ? `${impactA.paybackYears} yrs` : 'N/A')}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
