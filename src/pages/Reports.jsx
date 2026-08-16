import React, { useState } from 'react';
import { useESGStore } from '../store/useESGStore';
import { FileText, Download, Eye, Trash2, ArrowLeft, Building2, Calendar, CheckCircle } from 'lucide-react';

export default function Reports() {
  const { reports, deleteReport } = useESGStore();
  const [viewingReport, setViewingReport] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  if (viewingReport) {
    const r = viewingReport;
    
    // REPORT VIEWER
    return (
      <div className="report-viewer" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
        
        {/* VIEWER CONTROLS */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={() => setViewingReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--deep-forest)' }}>
            <ArrowLeft size={16} /> BACK TO REPORTS
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--deep-forest)' }}>
              <Download size={16} /> DOWNLOAD PDF
            </button>
          </div>
        </div>

        {/* REPORT DOCUMENT */}
        <div className="report-document glass-panel" style={{ background: 'white', padding: '64px', borderRadius: 12 }}>
          
          {/* COVER PAGE */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--deep-forest)', margin: 0, letterSpacing: 2 }}>ECOBIT</h1>
            <h2 style={{ fontSize: 24, fontWeight: 300, color: '#1e293b', marginTop: 8, marginBottom: 48 }}>{r.title}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, color: '#4b5563' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16}/> {r.company}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16}/> {r.period}</div>
            </div>
            <div style={{ marginTop: 24, fontSize: 12, color: '#9ca3af' }}>
              Report Generated: {new Date(r.createdAt).toLocaleString()} | Version: {r.version}
            </div>
          </div>
          
          <hr style={{ borderColor: '#f3f4f6', margin: '48px 0' }} />

          {/* EXECUTIVE SUMMARY */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--leaf-green)', marginBottom: 24, letterSpacing: 1 }}>Executive Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>BRSR Readiness</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--deep-forest)' }}>{r.readinessScore}%</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Data Coverage</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--deep-forest)' }}>{r.dataCoverage}%</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
              This report analyzes the verified operational ESG data for {r.company} during the {r.period} reporting period. The current BRSR readiness score is {r.readinessScore}%, reflecting the proportion of mandatory disclosures that are fully supported by uploaded evidence. 
            </p>
          </div>

          {/* VERIFIED ESG DATA & MAPPING */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--leaf-green)', marginBottom: 24, letterSpacing: 1 }}>BRSR Disclosure Mapping</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 0', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Indicator</th>
                  <th style={{ padding: '12px 0', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Calculated Value</th>
                  <th style={{ padding: '12px 0', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {r.mappedData.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{d.category}</div>
                    </td>
                    <td style={{ padding: '16px 0', fontSize: 14, color: '#334155' }}>
                      {d.isAvailable ? `${d.value.toLocaleString()} ${d.unit}` : '—'}
                    </td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{ 
                        fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4,
                        background: d.status === 'SUPPORTED' ? '#dcfce7' : d.status === 'EVIDENCE REQUIRED' ? '#fef08a' : '#fee2e2',
                        color: d.status === 'SUPPORTED' ? '#166534' : d.status === 'EVIDENCE REQUIRED' ? '#854d0e' : '#991b1b'
                      }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* METHODOLOGY & DISCLAIMER */}
          <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 12 }}>Methodology & Disclaimer</h3>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              <strong>Data Sources:</strong> All calculated values are sourced strictly from the ECOBIT Verified Dashboard Dataset. No missing data is artificially generated.<br/><br/>
              <strong>Disclaimer:</strong> This report is an analytical readiness and reporting aid generated from the data provided to ECOBIT. It does not constitute legal, regulatory, audit, assurance, or certification advice.
            </p>
          </div>

        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .report-viewer, .report-viewer * { visibility: visible; }
            .report-viewer { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .report-document { box-shadow: none !important; padding: 0 !important; }
          }
        `}</style>
      </div>
    );
  }

  // REPORTS LIBRARY (MAIN VIEW)
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={32} /> Report Library
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.7)', marginTop: 8, maxWidth: 700 }}>
            Central repository for all intelligence reports, scenario analyses, and BRSR disclosures generated by ECOBIT.
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <FileText size={48} color="rgba(36,84,56,0.2)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--deep-forest)', marginBottom: 8 }}>No Reports Generated</h3>
          <p style={{ fontSize: 14, color: 'rgba(36,84,56,0.6)' }}>Navigate to the BRSR Intelligence or Carbon ROI modules to generate your first report.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(36,84,56,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Report Name</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Company / Period</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Date / Version</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={r.id} style={{ borderTop: '1px solid rgba(36,84,56,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.3)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--deep-forest)' }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--leaf-green)', fontWeight: 600 }}>{r.type}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 14, color: 'var(--deep-forest)' }}>{r.company}</div>
                    <div style={{ fontSize: 12, color: 'rgba(36,84,56,0.5)' }}>{r.period}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 13, color: 'var(--deep-forest)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: 11, color: 'rgba(36,84,56,0.5)', fontWeight: 700 }}>{r.version}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: 11, background: 'rgba(114, 184, 90, 0.1)', color: 'var(--leaf-green)', padding: '4px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                      <CheckCircle size={12} /> READY
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button onClick={() => setViewingReport(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--leaf-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
                        <Eye size={14} /> VIEW
                      </button>
                      <button onClick={() => deleteReport(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(36,84,56,0.4)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
