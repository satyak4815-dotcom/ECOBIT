import React, { useState } from 'react';
import { useESGStore } from '../store/useESGStore';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FileUp, ShieldAlert, AlertTriangle, AlertOctagon, 
  HelpCircle, CheckCircle, Database, UploadCloud, RefreshCw, FileText
} from 'lucide-react';

export default function Greenwashing() {
  const { rawData } = useESGStore();
  const navigate = useNavigate();
  
  // State for Manual Check
  const [manualClaim, setManualClaim] = useState('');
  const [isManualAnalyzing, setIsManualAnalyzing] = useState(false);
  
  // State for Report Upload
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isReportAnalyzing, setIsReportAnalyzing] = useState(false);
  
  // Results State
  const [results, setResults] = useState([]); // Array of analyzed claims
  const [showAssessment, setShowAssessment] = useState(false);

  // 1. EMPTY STATE GUARD
  const hasData = Object.keys(rawData).length > 0;
  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)', marginBottom: 16 }}>No verified company dataset available.</h2>
        <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.8)', marginBottom: 32 }}>
          You must upload verified operational data to use the Greenwashing Detector.
        </p>
        <button className="btn-primary" style={{ fontSize: 16 }} onClick={() => navigate('/dashboard/data')}>
          <Database size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
          Go to Data Center
        </button>
      </div>
    );
  }

  // 3. CROSS-CHECK LOGIC ENGINE
  const verifyClaim = (claimText, source = 'Manual Entry') => {
    const lowerClaim = claimText.toLowerCase();
    
    // Fallback if no matching keyword is found
    const result = {
      claim: claimText,
      source,
      status: 'INSUFFICIENT DATA',
      riskLevel: 'UNKNOWN',
      reason: 'No corresponding operational data field could be mapped to this claim.',
      verifiedValue: '—',
      claimedValue: '—',
      sourceField: 'None'
    };

    // Metric 1: Renewable Energy
    if (lowerClaim.includes('renewable') && lowerClaim.includes('%')) {
      const match = claimText.match(/(\d+)%/);
      const claimedVal = match ? parseInt(match[1]) : null;
      
      if (claimedVal !== null && rawData.renewablePercent !== undefined) {
        result.claimedValue = claimedVal;
        result.verifiedValue = rawData.renewablePercent;
        result.sourceField = 'renewablePercent';
        
        const mismatch = claimedVal - rawData.renewablePercent;
        if (mismatch > 5) {
          result.status = 'NOT SUPPORTED';
          result.riskLevel = 'HIGH';
          result.reason = 'The claim substantially exceeds the renewable electricity percentage recorded in the verified operational dataset.';
          result.mismatch = mismatch;
        } else if (mismatch > 0 && mismatch <= 5) {
          result.status = 'PARTIALLY SUPPORTED';
          result.riskLevel = 'MEDIUM';
          result.reason = 'The claim is slightly higher than verified data, within marginal tolerance but requiring clarification.';
          result.mismatch = mismatch;
        } else {
          result.status = 'SUPPORTED';
          result.riskLevel = 'LOW';
          result.reason = 'The claim aligns securely with the verified operational dataset.';
          result.mismatch = 0;
        }
      }
    }
    
    // Metric 2: Zero Waste / Waste Recycled
    else if (lowerClaim.includes('waste') && (lowerClaim.includes('zero') || lowerClaim.includes('%'))) {
      const isZeroClaim = lowerClaim.includes('zero waste');
      const claimedVal = isZeroClaim ? 100 : (claimText.match(/(\d+)%/) ? parseInt(claimText.match(/(\d+)%/)[1]) : null);
      
      if (claimedVal !== null && rawData.wasteRecycledPercent !== undefined) {
        result.claimedValue = claimedVal;
        result.verifiedValue = rawData.wasteRecycledPercent;
        result.sourceField = 'wasteRecycledPercent';
        
        const mismatch = claimedVal - rawData.wasteRecycledPercent;
        if (mismatch > 10) {
          result.status = 'NOT SUPPORTED';
          result.riskLevel = 'HIGH';
          result.reason = 'The waste diversion claim is significantly higher than the verified recycling rate.';
          result.mismatch = mismatch;
        } else {
          result.status = 'SUPPORTED';
          result.riskLevel = 'LOW';
          result.reason = 'Waste diversion claim is supported by operational recycling data.';
          result.mismatch = 0;
        }
      }
    }

    // Metric 3: Emissions Reduction
    else if (lowerClaim.includes('emissions') && lowerClaim.includes('reduction')) {
      // In a real system, we'd check historical data. Here we flag as insufficient data for MVP if we only have current year.
      result.status = 'INSUFFICIENT DATA';
      result.riskLevel = 'MEDIUM';
      result.reason = 'Requires verified historical baseline data to validate reduction claims over time.';
      result.sourceField = 'historical_emissions';
    }

    return result;
  };

  // Handlers
  const handleCheckManualClaim = () => {
    if (!manualClaim) return;
    setIsManualAnalyzing(true);
    setShowAssessment(false);
    setResults([]);
    
    setTimeout(() => {
      const verification = verifyClaim(manualClaim, 'Manual Entry');
      setResults([verification]);
      setIsManualAnalyzing(false);
    }, 1200);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAnalyzeReport = () => {
    if (!uploadedFile) return;
    setIsReportAnalyzing(true);
    setShowAssessment(false);
    setResults([]);

    setTimeout(() => {
      // Simulated AI extraction from document
      const extractedClaims = [
        "We use 100% renewable electricity across all operations.",
        "Zero waste to landfill achieved in 2024.",
        "50% reduction in Scope 1 emissions compared to baseline.",
        "Water consumption reduced by 25%."
      ];
      
      const verifications = extractedClaims.map(claim => verifyClaim(claim, `Report: ${uploadedFile.name}`));
      setResults(verifications);
      setIsReportAnalyzing(false);
    }, 2500);
  };

  const generateAssessment = () => {
    setShowAssessment(true);
  };

  // Render Helpers
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'SUPPORTED': return <CheckCircle color="var(--leaf-green)" size={28} />;
      case 'PARTIALLY SUPPORTED': return <AlertTriangle color="var(--risk-orange)" size={28} />;
      case 'NOT SUPPORTED': return <AlertOctagon color="var(--risk-red)" size={28} />;
      case 'INSUFFICIENT DATA': return <HelpCircle color="var(--risk-orange)" size={28} />;
      default: return null;
    }
  };

  const renderResultCard = (res, idx) => {
    let borderColor = 'rgba(36, 84, 56, 0.2)';
    let statusColor = 'var(--deep-forest)';
    
    if (res.status === 'NOT SUPPORTED') {
      borderColor = 'var(--risk-red)';
      statusColor = 'var(--risk-red)';
    } else if (res.status === 'PARTIALLY SUPPORTED') {
      borderColor = 'var(--risk-orange)';
      statusColor = 'var(--risk-orange)';
    } else if (res.status === 'SUPPORTED') {
      borderColor = 'var(--leaf-green)';
      statusColor = 'var(--leaf-green)';
    } else if (res.status === 'INSUFFICIENT DATA') {
      borderColor = 'var(--risk-orange)';
      statusColor = 'var(--risk-orange)';
    }
       return (
      <div key={idx} className="fade-in" style={{ 
        background: 'rgba(255, 255, 255, 0.55)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderLeft: `6px solid ${borderColor}`,
        borderRadius: '12px',
        padding: 32,
        marginBottom: 32,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          {renderStatusIcon(res.status)}
          <h3 style={{ fontSize: 24, fontWeight: 700, color: statusColor, margin: 0 }}>
            {res.status}
          </h3>
          <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, background: 'rgba(36, 84, 56, 0.1)', padding: '6px 12px', borderRadius: 4, textTransform: 'uppercase', color: 'var(--deep-forest)' }}>
            Risk: <strong style={{ color: res.riskLevel === 'HIGH' ? 'var(--risk-red)' : (res.riskLevel === 'MEDIUM' ? 'var(--risk-orange)' : 'inherit') }}>{res.riskLevel}</strong>
          </span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(36, 84, 56, 0.9)', marginBottom: 8 }}>Claim Extracted</div>
          <p style={{ fontSize: 20, color: 'var(--deep-forest)', fontWeight: 600, fontStyle: 'italic', margin: 0 }}>"{res.claim}"</p>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(36, 84, 56, 0.8)', marginTop: 8 }}>Source: {res.source}</div>
        </div>

        {res.status !== 'INSUFFICIENT DATA' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.5)', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.9)', marginBottom: 12 }}>Claimed Value</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--deep-forest)' }}>{res.claimedValue}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.5)', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.9)', marginBottom: 12 }}>Verified Dataset</div>
              <div style={{ fontSize: 34, fontWeight: 700, color: res.status === 'NOT SUPPORTED' ? 'var(--risk-red)' : 'var(--deep-forest)' }}>{res.verifiedValue !== undefined ? res.verifiedValue : '—'}%</div>
            </div>
            {res.mismatch !== undefined && (
              <div style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.5)', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.9)', marginBottom: 12 }}>Mismatch</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: res.status === 'SUPPORTED' ? 'var(--leaf-green)' : 'var(--risk-orange)' }}>{res.mismatch} pp</div>
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.4)', padding: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', color: 'var(--deep-forest)' }}>Analysis Reason</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(36,84,56,0.9)' }}>Source field: <code style={{ background: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: 4 }}>{res.sourceField}</code></span>
          </div>
          <p style={{ fontSize: 18, color: 'var(--deep-forest)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            {res.reason}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* 2. TWO-CARD LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>
        
        {/* CHECK A CLAIM */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--deep-forest)' }}>
            <Search size={24} /> Check a Claim
          </h2>
          <p style={{ fontSize: 18, color: 'var(--deep-forest)', marginBottom: 24, lineHeight: 1.5, fontWeight: 500 }}>
            Enter a sustainability claim and ECOBIT will compare it against the company's verified operational data.
          </p>
          
          <textarea
            value={manualClaim}
            onChange={(e) => setManualClaim(e.target.value)}
            placeholder="e.g. 'Our operations are powered by 100% renewable electricity.'"
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 12,
              border: '1px solid rgba(36, 84, 56, 0.3)',
              background: 'rgba(255, 255, 255, 0.7)',
              minHeight: 140,
              fontFamily: 'inherit',
              fontSize: 18,
              color: 'var(--deep-forest)',
              resize: 'vertical',
              marginBottom: 24,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          <button className="btn-primary" onClick={handleCheckManualClaim} disabled={isManualAnalyzing || !manualClaim} style={{ width: '100%', fontSize: 18, padding: '16px' }}>
            {isManualAnalyzing ? (
              <><RefreshCw size={20} className="spin" style={{ display: 'inline', marginRight: 12, verticalAlign: 'text-bottom' }} /> Verifying...</>
            ) : (
              'Check Claim'
            )}
          </button>
        </div>

        {/* ANALYZE A REPORT */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--deep-forest)' }}>
            <FileUp size={24} /> Analyze a Report
          </h2>
          <p style={{ fontSize: 18, color: 'var(--deep-forest)', marginBottom: 24, lineHeight: 1.5, fontWeight: 500 }}>
            Upload a sustainability report, ESG report, or environmental statement for claim analysis. (PDF, DOCX, TXT)
          </p>

          {!uploadedFile ? (
            <div 
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files[0]) setUploadedFile(e.dataTransfer.files[0]);
              }}
              style={{
                flex: 1,
                border: `2px dashed ${dragActive ? 'var(--leaf-green)' : 'rgba(36, 84, 56, 0.4)'}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: dragActive ? 'rgba(114, 184, 90, 0.2)' : 'rgba(255,255,255,0.6)',
                marginBottom: 24,
                minHeight: 140,
                transition: 'all 0.2s'
              }}
            >
              <UploadCloud size={32} color={dragActive ? 'var(--leaf-green)' : 'rgba(36, 84, 56, 0.7)'} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>Drag and drop report</div>
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} id="report-upload" />
              <label htmlFor="report-upload" style={{ fontSize: 16, color: 'var(--leaf-green)', cursor: 'pointer', marginTop: 8, textDecoration: 'underline', fontWeight: 600 }}>
                or browse file
              </label>
            </div>
          ) : (
            <div style={{ flex: 1, border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: 12, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={32} color="var(--leaf-green)" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--deep-forest)' }}>Report uploaded</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(36,84,56,0.8)', marginTop: 4 }}>{uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</div>
              </div>
            </div>
          )}

          <button className="btn-primary" onClick={handleAnalyzeReport} disabled={isReportAnalyzing || !uploadedFile} style={{ width: '100%', background: 'var(--deep-forest)', fontSize: 18, padding: '16px' }}>
            {isReportAnalyzing ? (
              <><RefreshCw size={20} className="spin" style={{ display: 'inline', marginRight: 12, verticalAlign: 'text-bottom' }} /> Extracting & Verifying...</>
            ) : (
              'Analyze Report'
            )}
          </button>
        </div>

      </div>

      {/* RESULTS SECTION */}
      {results.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', marginBottom: 32 }}>
            Verification Results <span style={{ fontSize: 24, fontWeight: 600, color: 'rgba(36,84,56,0.8)' }}>({results.length} Claims Found)</span>
          </h2>
          
          {results.map((res, idx) => renderResultCard(res, idx))}

          {!showAssessment ? (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button className="btn-primary" onClick={generateAssessment} style={{ padding: '20px 40px', fontSize: 18, fontWeight: 700, background: 'var(--deep-forest)', boxShadow: '0 8px 24px rgba(36,84,56,0.3)' }}>
                <FileText size={24} style={{ display: 'inline', marginRight: 12, verticalAlign: 'text-bottom' }} />
                Generate Greenwashing Assessment
              </button>
            </div>
          ) : (
            <div className="glass-panel fade-in" style={{ marginTop: 48, borderTop: '6px solid var(--deep-forest)', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', padding: 40, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--deep-forest)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                Structured Greenwashing Assessment
              </h3>
              <p style={{ fontSize: 18, color: 'var(--deep-forest)', marginBottom: 32, lineHeight: 1.5, fontWeight: 500 }}>
                Generated automatically based on cross-referenced findings against the verified Dashboard dataset.
              </p>
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.5)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--deep-forest)' }}>{results.length}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.9)', marginTop: 8 }}>Claims Analyzed</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(114, 184, 90, 0.2)', border: '1px solid rgba(114,184,90,0.3)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--deep-forest)' }}>{results.filter(r => r.status === 'SUPPORTED').length}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--leaf-green)', marginTop: 8 }}>Supported</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(231, 111, 81, 0.2)', border: '1px solid rgba(231,111,81,0.3)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--deep-forest)' }}>{results.filter(r => r.status === 'NOT SUPPORTED').length}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--risk-red)', marginTop: 8 }}>Unsupported</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(244, 162, 97, 0.2)', border: '1px solid rgba(244,162,97,0.3)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--deep-forest)' }}>{results.filter(r => r.status === 'INSUFFICIENT DATA').length}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--risk-orange)', marginTop: 8 }}>Insufficient Data</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.5)', padding: 32, borderRadius: 12 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', color: '#000000', marginBottom: 16 }}>Executive Conclusion</h4>
                {results.some(r => r.status === 'NOT SUPPORTED') ? (
                  <p style={{ fontSize: 18, color: '#000000', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                    <strong style={{ color: 'var(--risk-red)' }}>HIGH COMPLIANCE RISK.</strong> The analyzed material contains direct contradictions with verified operational data (e.g., source: <code style={{background:'rgba(255,255,255,0.7)', padding:'2px 6px', borderRadius:4, color:'var(--deep-forest)'}}>renewablePercent</code>, <code style={{background:'rgba(255,255,255,0.7)', padding:'2px 6px', borderRadius:4, color:'var(--deep-forest)'}}>wasteRecycledPercent</code>). Publishing this material exposes the organization to greenwashing liabilities and regulatory scrutiny under BRSR/SEBI guidelines. Immediate correction required.
                  </p>
                ) : (
                  <p style={{ fontSize: 18, color: '#000000', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                    <strong style={{ color: 'var(--leaf-green)' }}>LOW COMPLIANCE RISK.</strong> All verifiable claims in the analyzed material map securely to the operational data stored in the Data Center. Ensure claims marked as 'Insufficient Data' are supported by external documentation before publication.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
