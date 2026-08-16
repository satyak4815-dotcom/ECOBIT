import React, { useState } from 'react';
import Papa from 'papaparse';
import { useESGStore } from '../store/useESGStore';
import { useNavigate } from 'react-router-dom';
import { Upload, Database, CheckCircle, AlertTriangle, FilePlus } from 'lucide-react';

export default function DataCenter() {
  const { isDemoMode, rawData, loadDemoData, updateRawData, clearData } = useESGStore();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  const hasData = Object.keys(rawData).length > 0;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file) => {
    setParseError(null);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError("Error parsing CSV. Please check formatting.");
          return;
        }
        
        // We expect one row of data for the MVP
        const data = results.data[0];
        
        // Validate core expected columns
        const missing = [];
        if (!data.electricity_kwh) missing.push('electricity_kwh');
        if (data.renewable_percent === undefined) missing.push('renewable_percent');
        
        if (missing.length > 0) {
          setParseError(`Missing required fields: ${missing.join(', ')}`);
          return;
        }

        setCsvPreview(data);
      },
      error: () => {
        setParseError("Failed to read the file.");
      }
    });
  };

  const confirmImport = () => {
    if (!csvPreview) return;
    
    // Map CSV columns to our rawData structure
    updateRawData({
      totalElectricity_kwh: csvPreview.electricity_kwh,
      renewablePercent: csvPreview.renewable_percent,
      fuelDiesel_litres: csvPreview.fuel_litres || 0,
      waterWithdrawal_m3: csvPreview.water_m3 || 0,
      totalWaste_tonnes: csvPreview.waste_tonnes || 0,
      wasteRecycledPercent: csvPreview.waste_recycled_percent || 0,
      employees: csvPreview.employees || 0,
      femaleEmployees: csvPreview.female_employees || 0,
    });
    setCsvPreview(null);
    setIsUploadingNew(false);
    navigate('/dashboard');
  };

  const handleLoadDemo = () => {
    loadDemoData();
    setIsUploadingNew(false);
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      
      {/* Demo Mode Actions */}
      <div className="glass-panel" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Load Sample Dataset</h2>
          <p style={{ fontSize: 14, color: 'rgba(36, 84, 56, 0.6)' }}>
            For hackathon demonstration, you can instantly populate the application with a realistic dataset.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {hasData && (
             <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--risk-red)', color: 'var(--risk-red)' }} onClick={clearData}>
               Clear Data
             </button>
          )}
          <button className="btn-primary" onClick={handleLoadDemo}>
            <Database size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Load DEMO DATA
          </button>
        </div>
      </div>

      {hasData && !isUploadingNew ? (
        <div className="glass-panel">
          <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} color="var(--leaf-green)" /> Data Loaded Successfully
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(36, 84, 56, 0.6)', marginBottom: 24 }}>
            Your operational data is currently active and powering the ESG intelligence engine.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard Overview
            </button>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--deep-forest)', color: 'var(--deep-forest)' }} onClick={() => setIsUploadingNew(true)}>
              <FilePlus size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
              Upload New Data
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Upload Sustainability Data (CSV)</h2>
          <p style={{ fontSize: 14, color: 'rgba(36, 84, 56, 0.6)', marginBottom: 24 }}>
            Upload your raw operational data. Required columns: <code>electricity_kwh</code>, <code>renewable_percent</code>, <code>fuel_litres</code>.
          </p>

          <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--leaf-green)' : 'rgba(36, 84, 56, 0.2)'}`,
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            background: dragActive ? 'rgba(114, 184, 90, 0.05)' : 'transparent',
            transition: 'all 0.2s',
            marginBottom: 24
          }}
        >
          <Upload size={32} color={dragActive ? 'var(--leaf-green)' : 'rgba(36, 84, 56, 0.4)'} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Drag and drop your CSV file here</p>
          <p style={{ fontSize: 12, color: 'rgba(36, 84, 56, 0.5)', marginBottom: 16 }}>or click to browse</p>
          <input type="file" accept=".csv" onChange={handleFileInput} style={{ display: 'none' }} id="csv-upload" />
          <label htmlFor="csv-upload" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
            Select File
          </label>
        </div>

        {parseError && (
          <div style={{ background: 'rgba(231, 111, 81, 0.1)', color: 'var(--risk-red)', padding: 16, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: 13 }}>{parseError}</span>
          </div>
        )}

        {csvPreview && (
          <div style={{ border: '1px solid rgba(36, 84, 56, 0.1)', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--leaf-green)' }}>
              <CheckCircle size={16} /> File Parsed Successfully
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(36, 84, 56, 0.5)' }}>Electricity</span>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{csvPreview.electricity_kwh?.toLocaleString()} kWh</div>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(36, 84, 56, 0.5)' }}>Renewable</span>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{csvPreview.renewable_percent}%</div>
              </div>
            </div>

            <button className="btn-primary" onClick={confirmImport}>
              Confirm & Calculate KPIs
            </button>
          </div>
        )}
        
        {isUploadingNew && hasData && (
          <div style={{ marginTop: 24 }}>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid rgba(36, 84, 56, 0.3)', color: 'rgba(36, 84, 56, 0.6)', padding: '8px 16px', fontSize: 12 }} onClick={() => setIsUploadingNew(false)}>
              Cancel Upload
            </button>
          </div>
        )}
      </div>
      )}

    </div>
  );
}
