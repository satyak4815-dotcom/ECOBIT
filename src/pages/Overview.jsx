import React from 'react';
import { useESGStore } from '../store/useESGStore';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, ArrowRight, Zap, Droplets, Recycle } from 'lucide-react';

export default function Overview() {
  const { rawData, metrics } = useESGStore();

  const hasData = Object.keys(rawData).length > 0;

  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Your ESG intelligence starts here.</h2>
        <p style={{ fontSize: 16, color: 'rgba(36, 84, 56, 0.6)', marginBottom: 32 }}>
          Upload your company data to calculate emissions, targets, risks and financial impact.
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          UPLOAD DATA
        </NavLink>
      </div>
    );
  }

  const { emissions, score } = metrics;
  
  // Create trend data for the chart (simulating historical data for the MVP based on current)
  const trendData = [
    { year: '2022', scope1: emissions.scope1 * 1.15, scope2: emissions.scope2 * 1.2 },
    { year: '2023', scope1: emissions.scope1 * 1.05, scope2: emissions.scope2 * 1.1 },
    { year: '2024', scope1: emissions.scope1 * 0.98, scope2: emissions.scope2 * 0.95 },
    { year: '2025', scope1: emissions.scope1, scope2: emissions.scope2 },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Top row: ESG Score and Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
        
        {/* Main Score Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)', marginBottom: 16 }}>
            ESG Health Score
          </span>
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(114, 184, 90, 0.1)', border: '2px solid rgba(114, 184, 90, 0.3)' }}>
            <span style={{ fontSize: 48, fontWeight: 300, color: 'var(--deep-forest)' }}>
              {score.total}
            </span>
          </div>
          
          <div style={{ marginTop: 24, width: '100%', padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11 }}>Environmental</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{score.breakdown.environmental}/40</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11 }}>Resource</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{score.breakdown.resource}/30</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11 }}>Social</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{score.breakdown.social}/20</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 24 }}>
          
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Total Emissions</span>
              <Activity size={16} color="var(--deep-forest)" />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)' }}>
                {emissions.totalEmissions.toLocaleString()} <span style={{ fontSize: 14 }}>tCO₂e</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--leaf-green)', marginTop: 4 }}>
                Scope 1: {emissions.scope1.toLocaleString()} | Scope 2: {emissions.scope2.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Renewable Energy</span>
              <Zap size={16} color="var(--deep-forest)" />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)' }}>
                {rawData.renewablePercent}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--risk-orange)', marginTop: 4 }}>
                Target: {rawData.renewableTarget2030 || '80'}%
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Water Efficiency</span>
              <Droplets size={16} color="var(--deep-forest)" />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)' }}>
                {rawData.waterRecycledPercent}% <span style={{ fontSize: 14 }}>recycled</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(36,84,56,0.6)', marginTop: 4 }}>
                Total withdrawn: {rawData.waterWithdrawal_m3?.toLocaleString()} m³
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(36,84,56,0.6)' }}>Waste Circularity</span>
              <Recycle size={16} color="var(--deep-forest)" />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)' }}>
                {rawData.wasteRecycledPercent}% <span style={{ fontSize: 14 }}>diverted</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(36,84,56,0.6)', marginTop: 4 }}>
                Total generated: {rawData.totalWaste_tonnes?.toLocaleString()} t
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-panel">
        <h3 style={{ fontSize: 14, marginBottom: 24, color: 'var(--deep-forest)' }}>Emissions Trajectory (tCO₂e)</h3>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--risk-orange)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--risk-orange)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorS2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--leaf-green)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--leaf-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(36,84,56,0.1)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--deep-forest)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--deep-forest)' }} />
              <Tooltip 
                contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="scope1" stackId="1" stroke="var(--risk-orange)" fillOpacity={1} fill="url(#colorS1)" name="Scope 1" />
              <Area type="monotone" dataKey="scope2" stackId="1" stroke="var(--leaf-green)" fillOpacity={1} fill="url(#colorS2)" name="Scope 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
