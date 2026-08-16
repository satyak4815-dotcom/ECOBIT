import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import BackgroundScene from './components/intro/BackgroundScene';
import EarthScene from './components/intro/EarthScene';
import IntroUI from './components/intro/IntroUI';
import HeroLanding from './components/hero/HeroLanding';
import LeafCursor from './components/LeafCursor';
import DashboardShell from './components/dashboard/DashboardShell';
import Overview from './pages/Overview';
import DataCenter from './pages/DataCenter';
import Greenwashing from './pages/Greenwashing';
import Simulator from './pages/Simulator';
import TimeMachine from './pages/TimeMachine';
import Reports from './pages/Reports';
import PolicyRadar from './pages/PolicyRadar';
import GeminiTest from './pages/GeminiTest';
import CarbonROI from './pages/CarbonROI';
import BRSR from './pages/BRSR';
import Copilot from './pages/Copilot';
import './index.css';
import './dashboard.css';

// We create a wrapper to handle the routing logic and state cleanly
function AppContent() {
  const [appState, setAppState] = useState('LOADING'); // LOADING, HERO, DASHBOARD
  const location = useLocation();
  const navigate = useNavigate();

  // If we directly load a dashboard URL, skip the intro
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard') && appState !== 'DASHBOARD') {
      setAppState('DASHBOARD');
    }
  }, [location.pathname]);

  const handleIntroComplete = () => {
    setAppState('HERO');
  };

  const handleExploreClick = () => {
    setAppState('DASHBOARD');
    navigate('/dashboard');
  };

  return (
    <div className="app-container">
      <LeafCursor />
      
      {/* Persistent Background Layer (Z: 1) */}
      <BackgroundScene />
      
      {/* Persistent Earth Layer (Z: 20) */}
      <div className={`earth-container ${appState === 'HERO' ? 'hero-mode' : ''} ${appState === 'DASHBOARD' ? 'dashboard-mode' : ''}`}>
        <EarthScene appState={appState} />
      </div>

      {/* UI Overlays */}
      {appState === 'LOADING' && (
        <IntroUI onComplete={handleIntroComplete} />
      )}
      
      {appState === 'HERO' && (
        <HeroLanding onExplore={handleExploreClick} />
      )}

      {/* React Router handles the Dashboard modules */}
      {appState === 'DASHBOARD' && (
        <Routes>
          <Route path="/dashboard" element={<DashboardShell />}>
            <Route index element={<Overview />} />
            <Route path="data" element={<DataCenter />} />
            <Route path="greenwashing" element={<Greenwashing />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="timemachine" element={<TimeMachine />} />
            <Route path="carbon-roi" element={<CarbonROI />} />
            <Route path="policy-radar" element={<PolicyRadar />} />
            <Route path="brsr" element={<BRSR />} />
            <Route path="reports" element={<Reports />} />
            <Route path="test-gemini" element={<GeminiTest />} />
            <Route path="copilot" element={<Copilot />} />
          </Route>
        </Routes>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
