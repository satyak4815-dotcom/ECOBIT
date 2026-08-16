import React, { useState } from 'react';
import { useESGStore } from '../store/useESGStore';
import { NavLink } from 'react-router-dom';
import { Calculator, AlertTriangle, Info, Download, Leaf, Sprout, TreeDeciduous, Wind } from 'lucide-react';
import { formatCurrency } from '../calculations/financial';

export default function CarbonROI() {
  const { rawData, metrics } = useESGStore();
  const hasData = Object.keys(rawData).length > 0;

  // Form State (Defaults to the user's requested test scenario)
  const [carbonPrice, setCarbonPrice] = useState(2500);
  const [investment, setInvestment] = useState(3787000);
  const [reductionPercent, setReductionPercent] = useState(5);
  const [analysisPeriod, setAnalysisPeriod] = useState(10);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Guard against missing data
  if (!hasData || !metrics || !metrics.emissions) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)', marginBottom: 16 }}>No Baseline Data</h2>
        <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.8)', marginBottom: 32 }}>
          You must load verified operational data from the Data Center before calculating Carbon ROI.
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          LOAD BASELINE DATA
        </NavLink>
      </div>
    );
  }

  const baselineEmissions = metrics.emissions.totalEmissions || 0;
  
  // ==========================================
  // FINANCIAL ENGINE CALCULATIONS
  // ==========================================
  
  // Estimated Carbon Cost = Total Emissions × Carbon Price
  const estimatedCarbonCost = baselineEmissions * (carbonPrice || 0);

  // Scenario Emissions
  const validReduction = Math.max(0, Math.min(100, reductionPercent || 0));
  const reducedEmissions = baselineEmissions * (1 - validReduction / 100);
  
  // Avoided Emissions = Baseline Emissions - Reduced Emissions
  const avoidedEmissions = baselineEmissions - reducedEmissions;

  // Annual Avoided Carbon Cost
  const annualFinancialBenefit = avoidedEmissions * (carbonPrice || 0);

  // Simple Payback Period
  let paybackPeriod = null;
  if (investment > 0 && annualFinancialBenefit > 0) {
    paybackPeriod = investment / annualFinancialBenefit;
  }

  // ROI %
  let roi = null;
  if (investment > 0 && annualFinancialBenefit > 0 && analysisPeriod > 0) {
    roi = (((annualFinancialBenefit * analysisPeriod) - investment) / investment) * 100;
  }

  // ==========================================
  // HELPERS
  // ==========================================
  
  const handlePrint = () => {
    window.print();
  };

  // SVG Nature Impact Component
  const NatureImpact = ({ reduction }) => {
    // Determine the state of the nature icon based on reduction %
    let Icon = Sprout;
    let color = 'var(--leaf-green)';
    let scale = 1;
    let animation = 'pulse 3s infinite ease-in-out';

    if (reduction > 20) {
      Icon = TreeDeciduous;
      scale = 1.2;
    } else if (reduction > 5) {
      Icon = Leaf;
    } else if (reduction <= 0) {
      Icon = Wind;
      color = 'var(--risk-red)';
      scale = 0.9;
      animation = 'shake 0.5s infinite';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
        <div style={{ 
          width: 80, height: 80, 
          borderRadius: '50%', 
          background: `rgba(${reduction <= 0 ? '231,111,81' : '114,184,90'}, 0.1)`, 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'all 0.5s ease'
        }}>
          <Icon size={40} color={color} style={{ transform: `scale(${scale})`, animation, transition: 'all 0.5s ease' }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>
          Nature Impact
        </div>
      </div>
    );
  };

  return (
    <div className="carbon-roi-container" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calculator size={32} /> Carbon Tax & ROI Calculator
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.7)', marginTop: 8, maxWidth: 700 }}>
            Estimate potential carbon costs and calculate the financial return on ESG investments.
          </p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '10px 20px', background: 'var(--deep-forest)' }}
        >
          <Download size={16} /> DOWNLOAD CALCULATION REPORT
        </button>
      </div>

      <div className="print-only" style={{ display: 'none', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, color: '#111827', margin: 0 }}>ECOBIT Carbon Tax & ROI Report</h1>
        <p style={{ fontSize: 12, color: '#4b5563' }}>Generated on {new Date().toLocaleDateString()}</p>
        <hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }} className="print-grid">
        
        {/* LEFT COLUMN: INPUTS & BASELINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* VERIFIED BASELINE */}
          <div className="glass-panel" style={{ padding: 24, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderLeft: '4px solid var(--leaf-green)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)', marginBottom: 16 }}>Verified Baseline</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(36,84,56,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>Total Emissions</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--deep-forest)' }}>{baselineEmissions.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span style={{fontSize: 14, fontWeight: 600}}>tCO₂e</span></div>
                <div style={{ fontSize: 10, color: 'rgba(36,84,56,0.5)', marginTop: 4 }}>Source: Verified Dashboard Dataset</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(36,84,56,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>Renewable Electricity</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--deep-forest)' }}>{rawData.renewablePercent !== undefined ? `${rawData.renewablePercent}%` : 'Not available in verified dataset'}</div>
                <div style={{ fontSize: 10, color: 'rgba(36,84,56,0.5)', marginTop: 4 }}>Source: Verified Dashboard Dataset</div>
              </div>
            </div>
          </div>

          {/* SCENARIO INPUTS */}
          <div className="glass-panel" style={{ padding: 24, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)', marginBottom: 24 }}>Scenario Inputs</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Carbon Price (₹ / tCO₂e)</label>
                <input 
                  type="number" 
                  value={carbonPrice} 
                  onChange={(e) => setCarbonPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(36,84,56,0.2)', fontSize: 16, fontWeight: 600, color: 'var(--deep-forest)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>ESG Investment (₹)</label>
                <input 
                  type="number" 
                  value={investment} 
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(36,84,56,0.2)', fontSize: 16, fontWeight: 600, color: 'var(--deep-forest)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Expected Emission Reduction (%)</label>
                <input 
                  type="number" 
                  value={reductionPercent} 
                  onChange={(e) => setReductionPercent(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(36,84,56,0.2)', fontSize: 16, fontWeight: 600, color: 'var(--deep-forest)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Analysis Period (years)</label>
                <input 
                  type="number" 
                  value={analysisPeriod} 
                  onChange={(e) => setAnalysisPeriod(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(36,84,56,0.2)', fontSize: 16, fontWeight: 600, color: 'var(--deep-forest)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* CARBON IMPACT */}
          <div className="glass-panel" style={{ padding: 24, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)' }}>Carbon Impact</h3>
              <NatureImpact reduction={validReduction} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(36,84,56,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>Baseline Emissions</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--deep-forest)' }}>{baselineEmissions.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span style={{fontSize: 12}}>tCO₂e</span></div>
              </div>
              <div style={{ color: 'var(--leaf-green)', fontWeight: 800 }}>→</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(36,84,56,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>Scenario Emissions</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--leaf-green)' }}>{reducedEmissions.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span style={{fontSize: 12}}>tCO₂e</span></div>
              </div>
            </div>

            {/* Visual Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', background: 'rgba(36,84,56,0.1)' }}>
                <div style={{ width: `${100 - validReduction}%`, background: 'var(--deep-forest)', transition: 'width 0.5s ease' }}></div>
                <div style={{ width: `${validReduction}%`, background: 'var(--leaf-green)', transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}></div>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--leaf-green)', background: 'rgba(114, 184, 90, 0.1)', padding: '12px', borderRadius: 8 }}>
              {avoidedEmissions.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} tCO₂e reduction
            </div>
          </div>

          {/* FINANCIAL IMPACT */}
          <div className="glass-panel" style={{ padding: 24, background: 'var(--deep-forest)', color: 'white' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Financial Impact</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Estimated Carbon Cost</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{formatCurrency(estimatedCarbonCost)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Annual Avoided Cost</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--leaf-green)' }}>{formatCurrency(annualFinancialBenefit)}</div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 0 24px 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Investment</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{formatCurrency(investment)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Payback</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
                  {paybackPeriod !== null && paybackPeriod !== Infinity ? `${paybackPeriod.toFixed(1)} years` : <span style={{fontSize: 12, fontWeight: 500}}>Insufficient data</span>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>ROI</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--leaf-green)' }}>
                  {roi !== null && !isNaN(roi) && roi !== Infinity ? `${roi.toFixed(1)}%` : <span style={{fontSize: 12, fontWeight: 500}}>N/A</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ASSUMPTIONS & METHODOLOGY */}
      <div className="glass-panel no-print" style={{ padding: 24, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
        <button 
          onClick={() => setShowAssumptions(!showAssumptions)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={18} color="var(--deep-forest)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)', margin: 0 }}>Assumptions & Methodology</h3>
          </div>
          <span style={{ fontSize: 18, color: 'var(--deep-forest)', fontWeight: 700 }}>{showAssumptions ? '−' : '+'}</span>
        </button>
        
        {showAssumptions && (
          <div style={{ marginTop: 24, borderTop: '1px solid rgba(36,84,56,0.1)', paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(231,111,81,0.1)', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid rgba(231,111,81,0.2)' }}>
              <AlertTriangle size={20} color="var(--risk-red)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--risk-red)', marginBottom: 4 }}>Disclaimer</div>
                <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>
                  This calculator provides a <strong>scenario estimate</strong> based on user assumptions. It does not represent a guaranteed financial return, nor does it confirm an actual legally payable carbon tax unless an applicable policy/regulation explicitly dictates the carbon price for your jurisdiction. It should not be used as official tax or legal advice.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', marginBottom: 12 }}>Data Sources</h4>
                <ul style={{ fontSize: 13, color: '#1e293b', paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
                  <li><strong>Baseline Emissions:</strong> Sourced dynamically from your ECOBIT Verified Dashboard Dataset.</li>
                  <li><strong>Carbon Price:</strong> User-defined scenario input. Check local policies (e.g., EU ETS, Carbon Border Adjustment Mechanism) for accurate regional pricing.</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', marginBottom: 12 }}>Formulas</h4>
                <ul style={{ fontSize: 13, color: '#1e293b', paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
                  <li><strong>Avoided Emissions:</strong> Baseline Emissions × Reduction %</li>
                  <li><strong>Avoided Carbon Cost:</strong> Avoided Emissions × Carbon Price</li>
                  <li><strong>Simple Payback Period:</strong> Investment ÷ Annual Avoided Cost</li>
                  <li><strong>ROI %:</strong> (((Annual Avoided Cost × Analysis Period) - Investment) ÷ Investment) × 100</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: scale(0.9) rotate(0deg); }
          25% { transform: scale(0.9) rotate(-5deg); }
          50% { transform: scale(0.9) rotate(0deg); }
          75% { transform: scale(0.9) rotate(5deg); }
          100% { transform: scale(0.9) rotate(0deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .carbon-roi-container, .carbon-roi-container * {
            visibility: visible;
          }
          .carbon-roi-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .glass-panel {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            color: black !important;
          }
          /* Ensure the right column (which was dark) is legible when printed */
          .glass-panel[style*="var(--deep-forest)"] {
            background: #f3f4f6 !important;
            color: #111827 !important;
          }
          .glass-panel[style*="var(--deep-forest)"] * {
            color: #111827 !important;
          }
          .glass-panel[style*="var(--deep-forest)"] [style*="rgba(255,255,255,0.5)"] {
            color: #4b5563 !important;
          }
          .glass-panel[style*="var(--deep-forest)"] [style*="var(--leaf-green)"] {
            color: #059669 !important; /* Darker green for print */
          }
        }
      `}</style>
    </div>
  );
}
