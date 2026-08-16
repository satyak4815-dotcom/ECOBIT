import React, { useState, useEffect } from 'react';
import { useESGStore } from '../store/useESGStore';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Upload, ArrowRight, BarChart2, ShieldAlert, Cpu } from 'lucide-react';

// BRSR Indicator Schema Map
const BRSR_SCHEMA = [
  { id: 'e1', name: 'Total Electricity Consumption', category: 'Energy', field: 'totalElectricity_kwh', unit: 'kWh' },
  { id: 'e2', name: 'Renewable Energy Share', category: 'Energy', field: 'renewablePercent', unit: '%' },
  { id: 'e3', name: 'Total Fuel Consumption', category: 'Energy', field: 'fuel_liters', unit: 'Liters' },
  { id: 'e4', name: 'Scope 1 Emissions', category: 'Emissions', metricField: 'scope1', unit: 'tCO₂e' },
  { id: 'e5', name: 'Scope 2 Emissions', category: 'Emissions', metricField: 'scope2', unit: 'tCO₂e' },
  { id: 'w1', name: 'Water Withdrawal', category: 'Water', field: 'waterWithdrawal_m3', unit: 'm³' },
  { id: 'w2', name: 'Water Recycled/Reused', category: 'Water', field: 'waterRecycledPercent', unit: '%' },
  { id: 'wa1', name: 'Total Waste Generated', category: 'Waste', field: 'totalWaste_tonnes', unit: 'Tonnes' },
  { id: 'wa2', name: 'Waste Recycled/Recovered', category: 'Waste', field: 'wasteRecycledPercent', unit: '%' },
];

export default function BRSR() {
  const { rawData, metrics, addReport } = useESGStore();
  const navigate = useNavigate();
  const hasData = Object.keys(rawData).length > 0;

  // Track evidence uploaded locally for the demo
  const [evidenceMap, setEvidenceMap] = useState({});
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
  }, []);

  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)', marginBottom: 16 }}>No Verified Data</h2>
        <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.8)', marginBottom: 32 }}>
          You must load verified operational data from the Data Center to analyze BRSR readiness.
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          LOAD BASELINE DATA
        </NavLink>
      </div>
    );
  }

  // Calculate Data Availability and Statuses
  const mappedData = BRSR_SCHEMA.map(schema => {
    let value = null;
    if (schema.field && rawData[schema.field] !== undefined && rawData[schema.field] !== null) {
      value = rawData[schema.field];
    } else if (schema.metricField && metrics?.emissions?.[schema.metricField] !== undefined) {
      value = metrics.emissions[schema.metricField];
    }

    const isAvailable = value !== null;
    const hasEvidence = evidenceMap[schema.id];
    
    let dataStatus = isAvailable ? 'AVAILABLE' : 'MISSING';
    let evidenceStatus = 'NOT ATTACHED';
    if (isAvailable && hasEvidence) evidenceStatus = 'ATTACHED';
    if (!isAvailable) evidenceStatus = 'N/A';

    return {
      ...schema,
      value,
      isAvailable,
      hasEvidence,
      dataStatus,
      evidenceStatus
    };
  });

  const totalRequired = mappedData.length;
  const dataAvailableCount = mappedData.filter(d => d.isAvailable).length;
  const evidenceAvailableCount = mappedData.filter(d => d.hasEvidence).length;
  
  // Data Readiness = Data available / Total Required
  const dataReadinessScore = Math.round((dataAvailableCount / totalRequired) * 100) || 0;
  
  // Evidence Coverage = Evidence available / Data requiring evidence (which is Data Available)
  const evidenceCoverage = dataAvailableCount > 0 ? Math.round((evidenceAvailableCount / dataAvailableCount) * 100) : 0;
  
  const gapsList = mappedData.filter(d => !d.isAvailable);

  const handleUploadEvidence = (id) => {
    // Simulate uploading evidence
    setEvidenceMap(prev => ({ ...prev, [id]: true }));
  };

  const generateReport = () => {
    const reportData = {
      type: 'BRSR',
      title: 'ECOBIT BRSR Intelligence Report',
      company: rawData.name || 'Unknown Company',
      period: rawData.reportingYear || 'Current Period',
      readinessScore: dataReadinessScore,
      dataCoverage: dataReadinessScore,
      evidenceCoverage,
      mappedData,
      metrics,
      rawData,
    };
    
    addReport(reportData);
    navigate('/dashboard/reports');
  };

  // Next Best Actions
  const actions = [];
  mappedData.forEach(gap => {
    if (!gap.isAvailable) {
      actions.push({ priority: 'HIGH', text: `Upload ${gap.name} data to the Data Center.`, reason: `Required for ${gap.category} BRSR disclosure.` });
    } else if (!gap.hasEvidence) {
      actions.push({ priority: 'MEDIUM', text: `Attach evidence (e.g., utility bills, audit logs) for ${gap.name}.`, reason: 'Verified values require supporting documentation for audit readiness.' });
    }
  });
  actions.sort((a, b) => a.priority === 'HIGH' ? -1 : 1);

  // SVG Glowing Ring Animation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animating ? circumference - (dataReadinessScore / 100) * circumference : circumference;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={32} /> BRSR Intelligence
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.7)', marginTop: 8, maxWidth: 700 }}>
            Turn verified ESG data into BRSR-ready disclosures. Map your metrics, identify gaps, and attach evidence.
          </p>
        </div>
        
        <button 
          onClick={generateReport}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '12px 24px', background: 'var(--deep-forest)' }}
        >
          <Cpu size={18} /> GENERATE BRSR REPORT
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
        
        {/* Readiness Ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', background: 'rgba(255,255,255,0.9)' }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            {/* Background Ring */}
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(36,84,56,0.1)" strokeWidth="12" />
              {/* Progress Ring */}
              <circle 
                cx="70" cy="70" r={radius} 
                fill="none" 
                stroke={dataReadinessScore === 100 ? "var(--leaf-green)" : "var(--risk-orange)"} 
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: 'drop-shadow(0 0 4px rgba(114, 184, 90, 0.5))' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--deep-forest)', lineHeight: 1 }}>{dataReadinessScore}%</span>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', letterSpacing: 1 }}>BRSR Data Readiness</div>
        </div>

        {/* Small Cards */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', marginBottom: 8 }}>Evidence Coverage</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--deep-forest)' }}>{evidenceCoverage}%</div>
          <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.5)', marginTop: 8 }}>{evidenceAvailableCount} of {dataAvailableCount} data fields supported</div>
        </div>

        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: gapsList.length > 0 ? '4px solid var(--risk-red)' : '4px solid var(--leaf-green)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', marginBottom: 8 }}>Data Gaps</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: gapsList.length > 0 ? 'var(--risk-red)' : 'var(--leaf-green)' }}>{gapsList.length}</div>
          <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.5)', marginTop: 8 }}>Missing required fields</div>
        </div>
      </div>

      {/* DISCLOSURE MAPPING TABLE */}
      <div className="glass-panel" style={{ padding: 0, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid rgba(36,84,56,0.1)', background: 'rgba(255,255,255,0.5)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--deep-forest)', margin: 0 }}>Disclosure Mapping & Evidence</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(36,84,56,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>BRSR Metric</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Calculated Value</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Source</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Data Status</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Evidence Status</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {mappedData.map((row, idx) => (
                <tr key={row.id} style={{ borderTop: '1px solid rgba(36,84,56,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.3)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-forest)' }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(36,84,56,0.5)' }}>{row.category}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: row.isAvailable ? 'var(--deep-forest)' : 'rgba(36,84,56,0.4)' }}>
                    {row.isAvailable ? `${row.value.toLocaleString()} ${row.unit}` : '—'}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 12, color: 'rgba(36,84,56,0.7)' }}>
                    {row.isAvailable ? 'Verified Dashboard Dataset' : '—'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {row.dataStatus === 'AVAILABLE' && <span style={{ padding: '4px 8px', background: 'rgba(114, 184, 90, 0.1)', color: 'var(--leaf-green)', fontSize: 11, fontWeight: 700, borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12}/> AVAILABLE</span>}
                    {row.dataStatus === 'MISSING' && <span style={{ padding: '4px 8px', background: 'rgba(231, 111, 81, 0.1)', color: 'var(--risk-red)', fontSize: 11, fontWeight: 700, borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><ShieldAlert size={12}/> MISSING</span>}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {row.evidenceStatus === 'ATTACHED' && <span style={{ padding: '4px 8px', background: 'rgba(114, 184, 90, 0.1)', color: 'var(--leaf-green)', fontSize: 11, fontWeight: 700, borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12}/> ATTACHED</span>}
                    {row.evidenceStatus === 'NOT ATTACHED' && <span style={{ padding: '4px 8px', background: 'rgba(244, 162, 97, 0.1)', color: 'var(--risk-orange)', fontSize: 11, fontWeight: 700, borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12}/> NOT ATTACHED</span>}
                    {row.evidenceStatus === 'N/A' && <span style={{ padding: '4px 8px', color: 'rgba(36,84,56,0.4)', fontSize: 11, fontWeight: 700 }}>—</span>}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {row.evidenceStatus === 'NOT ATTACHED' && (
                      <button onClick={() => handleUploadEvidence(row.id)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Upload size={14} /> Attach Evidence
                      </button>
                    )}
                    {row.dataStatus === 'MISSING' && (
                      <NavLink to="/dashboard/data" style={{ fontSize: 12, color: 'var(--leaf-green)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Add Data <ArrowRight size={14} />
                      </NavLink>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEXT BEST ACTIONS */}
      {actions.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)', marginBottom: 16 }}>Next Best Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {actions.map((act, i) => (
              <div key={i} className="glass-panel" style={{ padding: 16, borderLeft: act.priority === 'HIGH' ? '4px solid var(--risk-red)' : '4px solid var(--risk-orange)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: act.priority === 'HIGH' ? 'var(--risk-red)' : 'var(--risk-orange)', marginBottom: 8 }}>{act.priority} PRIORITY</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-forest)', marginBottom: 4 }}>{act.text}</div>
                <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.7)', lineHeight: 1.4 }}>{act.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
