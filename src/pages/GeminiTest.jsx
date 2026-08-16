import React, { useState } from 'react';
import { Activity, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function GeminiTest() {
  const [status, setStatus] = useState('IDLE'); // IDLE, TESTING, SUCCESS, ERROR
  const [errorMessage, setErrorMessage] = useState('');

  const runTest = async () => {
    setStatus('TESTING');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/policy-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyData: { testPing: true } 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('SUCCESS');
      } else {
        setStatus('ERROR');
        setErrorMessage(data.error || 'Unknown server error');
      }
    } catch (e) {
      setStatus('ERROR');
      setErrorMessage(e.message || 'Network failure');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 32 }} className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Cpu size={24} color="var(--deep-forest)" />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--deep-forest)', margin: 0 }}>Gemini Secure Connection Test</h2>
      </div>

      <p style={{ fontSize: 15, color: 'rgba(36,84,56,0.7)', marginBottom: 32, lineHeight: 1.5 }}>
        This utility tests the secure backend connection between the ECOBIT frontend and the Vercel Serverless `/api/policy-scan` route. It ensures that the `GEMINI_API_KEY` is correctly loaded into the backend Node environment and is safely hidden from the browser.
      </p>

      <button 
        onClick={runTest}
        disabled={status === 'TESTING'}
        className="btn-primary" 
        style={{ width: '100%', padding: '16px', fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: status === 'TESTING' ? 'rgba(36,84,56,0.5)' : 'var(--deep-forest)' }}
      >
        {status === 'TESTING' ? 'TESTING SECURE CONNECTION...' : 'TEST GEMINI SECURE CONNECTION'}
      </button>

      {status === 'SUCCESS' && (
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(114, 184, 90, 0.1)', border: '1px solid var(--leaf-green)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={24} color="var(--leaf-green)" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--leaf-green)' }}>Gemini Connected Securely</div>
            <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.7)' }}>The server successfully accessed the API key and routed the request.</div>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(231, 111, 81, 0.1)', border: '1px solid var(--risk-red)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={24} color="var(--risk-red)" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--risk-red)' }}>Gemini Connection Failed</div>
            <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.7)' }}>{errorMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}
