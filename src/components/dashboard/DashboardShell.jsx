import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useESGStore } from '../../store/useESGStore';
import { 
  LayoutDashboard, 
  Leaf, 
  Activity, 
  History, 
  ShieldAlert, 
  Calculator, 
  FileText, 
  Database, 
  Bot, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

export default function DashboardShell() {
  const { isDemoMode, rawData } = useESGStore();
  const location = useLocation();

  // Helper to map current path to title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard': return { title: 'ESG Overview', sub: 'Your company\'s sustainability intelligence at a glance.' };
      case '/dashboard/data': return { title: 'Data Center', sub: 'Upload and manage your sustainability datasets.' };
      case '/dashboard/greenwashing': return { title: 'Greenwashing Detector', sub: 'AI-driven anomaly detection for sustainability claims.' };
      case '/dashboard/simulator': return { title: 'What-If Simulator', sub: 'Simulate operational changes against ESG metrics.' };
      case '/dashboard/timemachine': return { title: 'ESG Time Machine', sub: 'See where your ESG trajectory is heading.' };
      case '/dashboard/carbon-roi': return { title: 'Carbon Tax & ROI', sub: 'Calculate the financial impact of carbon.' };
      case '/dashboard/policy-radar': return { title: 'Policy Delta Radar', sub: 'Real-time environmental policy tracking.' };
      case '/dashboard/brsr': return { title: 'BRSR Intelligence', sub: 'Automated framework mapping and reporting.' };
      case '/dashboard/reports': return { title: 'AI Reports', sub: 'Generate professional BRSR-style narratives.' };
      case '/dashboard/copilot': return { title: 'ECOBIT Copilot', sub: 'Natural language query for your ESG data.' };
      default: return { title: 'Dashboard', sub: 'ECOBIT Intelligence' };
    }
  };

  const { title, sub } = getPageTitle(location.pathname);
  const companyName = rawData?.name || 'No Company Selected';
  const reportingYear = rawData?.reportingYear || '----';

  return (
    <div className="dashboard-layout">
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">ECOBIT</div>
        
        <div className="sidebar-section-title">OVERVIEW</div>
        <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <div className="sidebar-section-title">INTELLIGENCE</div>
        <NavLink to="/dashboard/greenwashing" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={18} />
          Greenwashing Detector
        </NavLink>
        <NavLink to="/dashboard/timemachine" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <History size={18} />
          ESG Time Machine
        </NavLink>
        <NavLink to="/dashboard/simulator" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Activity size={18} />
          What-If Simulator
        </NavLink>
        <NavLink to="/dashboard/policy-radar" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Leaf size={18} />
          Policy Delta Radar
        </NavLink>

        <div className="sidebar-section-title">FINANCIAL</div>
        <NavLink to="/dashboard/carbon-roi" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Calculator size={18} />
          Carbon Tax & ROI
        </NavLink>

        <div className="sidebar-section-title">REPORTING</div>
        <NavLink to="/dashboard/brsr" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          BRSR Intelligence
        </NavLink>
        <NavLink to="/dashboard/reports" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          Reports
        </NavLink>

        <div className="sidebar-section-title">DATA</div>
        <NavLink to="/dashboard/data" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Database size={18} />
          Data Center
        </NavLink>

        <div className="sidebar-section-title">AI</div>
        <NavLink to="/dashboard/copilot" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Bot size={18} />
          ECOBIT Copilot
        </NavLink>

        <div style={{ flex: 1 }} />

        <div className="sidebar-nav-item">
          <Settings size={18} />
          Settings
        </div>
        <div className="sidebar-nav-item">
          <HelpCircle size={18} />
          Help
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="page-title">{title}</h1>
            <div className="page-subtitle">{sub}</div>
          </div>
          
          <div className="topbar-right">
            {isDemoMode && (
              <div className="topbar-demo-badge">DEMO MODE ACTIVE</div>
            )}
            
            <div className="topbar-selector">
              <span className="selector-label">Company</span>
              <span className="selector-value">{companyName}</span>
            </div>
            <div className="topbar-selector">
              <span className="selector-label">Period</span>
              <span className="selector-value">{reportingYear}</span>
            </div>
            
            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--leaf-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
              U
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="dashboard-content-scroll">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
