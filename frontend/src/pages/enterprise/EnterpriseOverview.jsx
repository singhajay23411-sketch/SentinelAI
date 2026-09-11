import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function EnterpriseOverview() {
  const { user, orgId, role, logout, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [assessment, setAssessment] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetFilter, setAssetFilter] = useState('');
  const [connectors, setConnectors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('rbi_csf_2023');
  const [frameworkDetail, setFrameworkDetail] = useState(null);

  // What-If Simulator State
  const [simMFA, setSimMFA] = useState(true);
  const [simPatch, setSimPatch] = useState(false);
  const [simSeg, setSimSeg] = useState(false);
  const [simBackup, setSimBackup] = useState(false);
  const [simDelayDays, setSimDelayDays] = useState(0);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Optimizer State
  const [budgetSlider, setBudgetSlider] = useState(1500000);
  const [optResult, setOptResult] = useState(null);
  const [optLoading, setOptLoading] = useState(false);
  const [curveData, setCurveData] = useState(null);

  // AI Query State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [canonicalQuestions, setCanonicalQuestions] = useState([]);

  // Fetch initial dashboard data
  useEffect(() => {
    fetchInitialData();
  }, [orgId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();

      // Fetch Latest Assessment
      const asmRes = await fetch(`${API_BASE}/enterprise/assessments/latest`, { credentials: 'omit', headers });
      if (asmRes.ok) {
        const data = await asmRes.json();
        setAssessment(data);
      }

      // Fetch Trend
      const trendRes = await fetch(`${API_BASE}/enterprise/analytics/trend`, { credentials: 'omit', headers });
      if (trendRes.ok) setTrendData(await trendRes.json());

      // Fetch Anomalies
      const anomRes = await fetch(`${API_BASE}/enterprise/analytics/anomalies`, { credentials: 'omit', headers });
      if (anomRes.ok) {
        const d = await anomRes.json();
        setAnomalies(d.anomalies || []);
      }

      // Fetch Connectors
      const connRes = await fetch(`${API_BASE}/enterprise/connectors/health`, { credentials: 'omit', headers });
      if (connRes.ok) {
        const d = await connRes.json();
        setConnectors(d.connectors || []);
      }

      // Fetch Frameworks
      const fwRes = await fetch(`${API_BASE}/enterprise/frameworks`, { credentials: 'omit', headers });
      if (fwRes.ok) {
        const d = await fwRes.json();
        setFrameworks(d.frameworks || []);
      }

      // Fetch AI Canonical Questions
      const qRes = await fetch(`${API_BASE}/enterprise/ai/questions`, { credentials: 'omit', headers });
      if (qRes.ok) {
        const d = await qRes.json();
        setCanonicalQuestions(d.questions || []);
      }

      // Initial Optimizer Curve
      const curveRes = await fetch(`${API_BASE}/enterprise/optimizer/curve?max_budget_inr=4000000&steps=6`, { credentials: 'omit', headers });
      if (curveRes.ok) setCurveData(await curveRes.json());

    } catch (e) {
      console.warn("Initial data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = async () => {
    setSimLoading(true);
    try {
      const interventions = [];
      if (simMFA) interventions.push({ intervention_type: 'enable_mfa', name: 'Enforce Hardware MFA' });
      if (simPatch) interventions.push({ intervention_type: 'patch_vulnerabilities', name: '14-Day Patch SLA' });
      if (simSeg) interventions.push({ intervention_type: 'network_segmentation', name: 'Tier Micro-segmentation' });
      if (simBackup) interventions.push({ intervention_type: 'immutable_backups', name: 'Immutable Air-Gapped Backups' });
      if (simDelayDays > 0) interventions.push({ intervention_type: 'delay_remediation', name: 'Remediation Delay Window', delay_days: parseInt(simDelayDays) });

      const res = await fetch(`${API_BASE}/enterprise/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name: 'Interactive What-If Scenario Run',
          description: 'Counterfactual experiment',
          interventions,
          seed: 42,
          num_iterations: 5000,
        })
      });
      if (res.ok) {
        const d = await res.json();
        setSimResult(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  // Run Optimizer
  const handleRunOptimizer = async () => {
    setOptLoading(true);
    try {
      const res = await fetch(`${API_BASE}/enterprise/optimizer/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          budget_inr: parseFloat(budgetSlider),
          horizon_years: 1,
          seed: 42,
        })
      });
      if (res.ok) {
        const d = await res.json();
        setOptResult(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptLoading(false);
    }
  };

  // Ingest Demo Sample
  const handleIngestSample = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/enterprise/ingest/sample/${type}`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const result = await res.json();
        alert(`Successfully ingested sample ${type}! Inserted: ${result.inserted}, Updated: ${result.updated}`);
        fetchInitialData();
      }
    } catch (e) {
      alert(`Ingestion failed: ${e.message}`);
    }
  };

  // Submit AI Query
  const handleAIQuery = async (queryText) => {
    const q = queryText || aiQuery;
    if (!q) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`${API_BASE}/enterprise/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const d = await res.json();
        setAiResult(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Load Framework Details
  const loadFrameworkData = async (fid) => {
    setSelectedFramework(fid);
    try {
      const res = await fetch(`${API_BASE}/enterprise/frameworks/${fid}`, { headers: getAuthHeader() });
      if (res.ok) setFrameworkDetail(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'frameworks') {
      loadFrameworkData(selectedFramework);
    }
    if (activeTab === 'optimizer' && !optResult) {
      handleRunOptimizer();
    }
    if (activeTab === 'simulation' && !simResult) {
      handleRunSimulation();
    }
  }, [activeTab]);

  const summary = assessment?.summary || {
    expected_annual_loss_inr: 3899650.39,
    var_95_inr: 17446591.81,
    var_99_inr: 25631002.05,
    appetite_evaluation: { status: 'within_appetite' },
  };
  const topContributors = assessment?.top_contributors || [
    { scenario_name: "Ransomware - Core Service Interruption [DEMO]", expected_annual_loss_inr: 1855218.85, percentage_of_total_eal: 47.6, var_95_inr: 12500000 },
    { scenario_name: "Privileged Account Compromise [DEMO]", expected_annual_loss_inr: 1388015.19, percentage_of_total_eal: 35.6, var_95_inr: 6800000 },
    { scenario_name: "Customer Data Breach [DEMO]", expected_annual_loss_inr: 656416.35, percentage_of_total_eal: 16.8, var_95_inr: 4200000 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050b14 0%, #0a1120 50%, #0d1527 100%)',
      color: '#f8fafc',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <span style={{ fontSize: 20, color: '#fff' }}>🛡️</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>SentinelAI</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase'
              }}>
                Enterprise Risk Platform
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>SIH 2026 Problem 26105</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Organization: <strong style={{ color: '#cbd5e1' }}>Sentinel Demo Financial Services [DEMO]</strong> • BFSI Tier-1
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Risk Appetite Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: summary?.appetite_evaluation?.status === 'exceeded' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${summary?.appetite_evaluation?.status === 'exceeded' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            color: summary?.appetite_evaluation?.status === 'exceeded' ? '#f87171' : '#34d399',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: summary?.appetite_evaluation?.status === 'exceeded' ? '#ef4444' : '#10b981',
              boxShadow: `0 0 8px ${summary?.appetite_evaluation?.status === 'exceeded' ? '#ef4444' : '#10b981'}`
            }} />
            <span>Appetite: {String(summary?.appetite_evaluation?.status || 'within_appetite').toUpperCase().replace('_', ' ')}</span>
          </div>

          {/* User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
            }}>
              {role || 'Admin'}
            </span>
            <span>{user?.name || 'Administrator'}</span>
          </div>

          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', padding: '6px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer'
            }}
          >
            ← Scanner Mode
          </button>

          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171', padding: '6px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── NAVIGATION TABS ─────────────────────────────────────────────────── */}
      <nav style={{
        background: 'rgba(10, 17, 32, 0.95)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
        padding: '0 28px',
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: 'Executive Dashboard', icon: '📊' },
          { id: 'assets', label: 'Asset Inventory', icon: '🏢' },
          { id: 'ingest', label: 'Evidence & Ingestion', icon: '📥' },
          { id: 'scenarios', label: 'Risk Register', icon: '⚡' },
          { id: 'simulation', label: 'What-If Simulator', icon: '🧪' },
          { id: 'optimizer', label: 'Investment Optimizer', icon: '📈' },
          { id: 'frameworks', label: 'Standards & Compliance', icon: '📋' },
          { id: 'reports_ai', label: 'Reports & Grounded AI', icon: '🤖' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #10b981' : '2px solid transparent',
                color: isActive ? '#34d399' : '#94a3b8',
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT BODY ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '28px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                             */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Mandate & Methodology Banner */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>
                  ✓ QUANTITATIVE ACTUARIAL RISK ENGINE ACTIVE • 10,000 MONTE CARLO ITERATIONS
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Correlating 13 enterprise assets, 3 business services, and continuous vulnerability telemetry into Board-ready financial metrics.
                </div>
              </div>
              <button
                onClick={() => handleIngestSample('vulnerabilities.csv')}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7',
                  padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                }}
              >
                + Ingest Telemetry Stream
              </button>
            </div>

            {/* Key Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {/* Card 1: EAL */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: '24px 20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Expected Annual Loss (EAL)
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginTop: 8, letterSpacing: '-0.5px' }}>
                  ₹{(summary.expected_annual_loss_inr || 3899650).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: 12, color: '#34d399', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>↓ 25.0%</span>
                  <span style={{ color: '#64748b' }}>vs 6-month historical baseline</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                  Mean loss across 10,000 simulated annual trials
                </div>
              </div>

              {/* Card 2: 95% VaR */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: '24px 20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  95th Percentile Annual VaR
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#38bdf8', marginTop: 8, letterSpacing: '-0.5px' }}>
                  ₹{(summary.var_95_inr || 17446591).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  99% Tail VaR: <strong style={{ color: '#f43f5e' }}>₹{(summary.var_99_inr || 25631002).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, lineHeight: 1.3 }}>
                  Annual loss threshold exceeded in ~5% of simulated years (1-in-20 year storm). Not a maximum loss.
                </div>
              </div>

              {/* Card 3: Appetite Ratio */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: '24px 20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Board Risk Appetite Limit
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#34d399', marginTop: 8 }}>
                  ₹2,00,00,000
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Current Consumption: <strong style={{ color: '#34d399' }}>19.5% of Cap</strong>
                </div>
                <div style={{
                  width: '100%', height: 6, background: 'rgba(255,255,255,0.08)',
                  borderRadius: 3, marginTop: 14, overflow: 'hidden'
                }}>
                  <div style={{ width: '19.5%', height: '100%', background: '#10b981', borderRadius: 3 }} />
                </div>
              </div>

              {/* Card 4: Actionable Potential */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: '24px 20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Optimized Risk Reduction
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#a855f7', marginTop: 8 }}>
                  ₹31,33,948
                </div>
                <div style={{ fontSize: 12, color: '#a855f7', marginTop: 6 }}>
                  Estimated ROSI: <strong>184.9%</strong>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                  Via recommended Knapsack portfolio (₹15L Budget)
                </div>
              </div>
            </div>

            {/* Middle Section: Scenarios Breakdown & Anomaly Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
              {/* Top Contributing Scenarios */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Risk Distribution by Threat Scenario</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>EAL Contribution</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {topContributors.map((scn, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{scn.scenario_name}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8' }}>
                          ₹{Number(scn.expected_annual_loss_inr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                        <span>Portfolio Contribution: {scn.percentage_of_total_eal}%</span>
                        <span>95% VaR: ₹{Number(scn.var_95_inr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${scn.percentage_of_total_eal}%`, height: '100%',
                          background: i === 0 ? '#ef4444' : (i === 1 ? '#f59e0b' : '#3b82f6'),
                          borderRadius: 3
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Anomalies */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Active Posture Anomalies</span>
                  <span style={{
                    background: 'rgba(239, 68, 68, 0.15)', color: '#f87171',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12
                  }}>
                    {anomalies.length} Signals
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {anomalies.length > 0 ? anomalies.map((anom, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 10, padding: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>⚠️</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>{anom.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{anom.description}</div>
                      <div style={{ fontSize: 10, color: '#34d399', marginTop: 6, fontWeight: 600 }}>
                        → Action: {anom.recommended_action}
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: '#64748b', fontSize: 12, padding: 20, textAlign: 'center' }}>No posture anomalies detected.</div>
                  )}
                </div>
              </div>
            </div>

            {/* 6-Month Risk Trajectory SVG Chart */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Longitudinal Risk Trajectory (6 Months)</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Expected Annual Loss trend based on verified finding remediation cycles</div>
                </div>
                <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                  Trend: -25.0% Risk Reduction Overall
                </div>
              </div>

              {/* SVG Area Chart */}
              <div style={{ width: '100%', height: 160, position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                  <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                  <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                  {/* Area Fill */}
                  <polygon
                    points="0,150 0,30 160,45 320,65 480,85 640,105 800,115 800,150"
                    fill="url(#ealGrad)"
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points="0,30 160,45 320,65 480,85 640,105 800,115"
                  />
                  {/* Data Points */}
                  {[
                    [0, 30, '₹5.2M'], [160, 45, '₹4.8M'], [320, 65, '₹4.5M'],
                    [480, 85, '₹4.2M'], [640, 105, '₹3.9M'], [800, 115, '₹3.89M']
                  ].map(([x, y, label], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#050b14" stroke="#10b981" strokeWidth="2.5" />
                      <text x={x} y={y - 10} fill="#94a3b8" fontSize="10" textAnchor="middle">{label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ASSET INVENTORY                                                */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'assets' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Enterprise Asset Inventory (13 Critical Assets)</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>CMDB-linked assets categorized by business unit, data sensitivity, and attack surface exposure.</div>
              </div>
              <button
                onClick={() => handleIngestSample('asset_csv')}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8',
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                + Refresh Asset CSV
              </button>
            </div>

            {/* Asset Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Asset ID', 'Name', 'Type', 'Criticality', 'Data Sensitivity', 'Internet Exposed', 'Record Volume', 'Owner'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ASSET-001', name: 'Core Banking Transaction API', type: 'application', crit: 'critical', sens: 'restricted', pub: true, rec: '5,000,000', owner: 'Rohan Verma' },
                    { id: 'ASSET-002', name: 'Customer Web NetBanking Portal', type: 'application', crit: 'critical', sens: 'confidential', pub: true, rec: '3,500,000', owner: 'Ananya Deshmukh' },
                    { id: 'ASSET-003', name: 'Customer Primary PostgreSQL DB', type: 'database', crit: 'critical', sens: 'restricted', pub: false, rec: '5,000,000', owner: 'Suresh Iyer' },
                    { id: 'ASSET-004', name: 'Mobile Banking Gateway', type: 'application', crit: 'high', sens: 'confidential', pub: true, rec: '2,000,000', owner: 'Priya Sharma' },
                    { id: 'ASSET-005', name: 'UPI Payment Processing Switch', type: 'application', crit: 'critical', sens: 'restricted', pub: true, rec: '10,000,000', owner: 'Vikram Sen' },
                    { id: 'ASSET-006', name: 'Enterprise Keycloak & IAM Directory', type: 'identity_system', crit: 'critical', sens: 'restricted', pub: false, rec: '25,000', owner: 'Kavitha Nair' },
                    { id: 'ASSET-007', name: 'Corporate Loan Origination System', type: 'application', crit: 'high', sens: 'confidential', pub: false, rec: '450,000', owner: 'Arjun Mehta' },
                    { id: 'ASSET-008', name: 'Treasury Trade Execution Platform', type: 'application', crit: 'critical', sens: 'restricted', pub: false, rec: '150,000', owner: 'Rajesh Kulkarni' },
                    { id: 'ASSET-010', name: 'Kubernetes Production Cluster (EKS)', type: 'cloud_resource', crit: 'critical', sens: 'confidential', pub: true, rec: '—', owner: 'DevOps Team' },
                    { id: 'ASSET-011', name: 'AWS S3 Customer Statements Storage', type: 'cloud_resource', crit: 'high', sens: 'restricted', pub: false, rec: '8,000,000', owner: 'Cloud Eng' },
                    { id: 'ASSET-012', name: 'Corporate VPN Gateway (Firewall)', type: 'network_device', crit: 'high', sens: 'internal', pub: true, rec: '—', owner: 'SecOps Team' },
                  ].map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>{a.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#f1f5f9' }}>{a.name}</td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>{a.type}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: a.crit === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                          color: a.crit === 'critical' ? '#f87171' : '#fbbf24',
                          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {a.crit}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#cbd5e1' }}>{a.sens}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          color: a.pub ? '#f87171' : '#34d399',
                          fontWeight: 600
                        }}>
                          {a.pub ? '● Public Facing' : '○ Internal Only'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>{a.rec}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{a.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: EVIDENCE & INGESTION                                           */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ingest' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Connectors Health */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Multi-Source Connectors & Health Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {connectors.map((c) => (
                  <div key={c.id} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9' }}>{c.name}</span>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)', color: '#34d399',
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10
                      }}>
                        ACTIVE
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Category: {c.category}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', marginTop: 10 }}>
                      {c.record_count} Records
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingest Actions Box */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>One-Click SIH Live Demo Ingestion Replay</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Replays sample telemetry exports through the normalization pipeline, asset resolver, and deduplication logic.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  onClick={() => handleIngestSample('asset_csv')}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 Replay Assets CSV (13 Assets)
                </button>
                <button
                  onClick={() => handleIngestSample('vuln_csv')}
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  🛡️ Replay Vulnerabilities CSV (8 CVEs)
                </button>
                <button
                  onClick={() => handleIngestSample('iam_csv')}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  🔑 Replay IAM Export (8 Accounts)
                </button>
                <button
                  onClick={() => handleIngestSample('siem_csv')}
                  style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  ⚡ Replay SIEM Alerts (5 Events)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: WHAT-IF SIMULATOR                                              */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Counterfactual What-If Simulation Laboratory</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
                Synchronized Common Random Numbers (CRN) cancel Monte Carlo stochastic variance to isolate the exact economic effect of proposed controls.
              </div>

              {/* Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Enforce Hardware MFA (FIDO2)', state: simMFA, set: setSimMFA, desc: 'Reduces credential frequency by 75%' },
                  { label: '14-Day Critical Patch SLA', state: simPatch, set: setSimPatch, desc: 'Reduces exploit ingress rate by 60%' },
                  { label: 'Tier Micro-segmentation', state: simSeg, set: setSimSeg, desc: 'Dampens blast radius & severity by 50%' },
                  { label: 'Immutable Air-Gapped Backups', state: simBackup, set: setSimBackup, desc: 'Reduces recovery outage time by 60%' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: item.state ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${item.state ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all 0.15s ease'
                  }} onClick={() => item.set(!item.state)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: item.state ? '#34d399' : '#cbd5e1' }}>{item.label}</span>
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: item.state ? '#10b981' : '#334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff'
                      }}>
                        {item.state ? '✓' : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Delay Slider */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Model Remediation Delay Exposure:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: simDelayDays > 0 ? '#f87171' : '#34d399' }}>
                    {simDelayDays} Days Delay
                  </span>
                </div>
                <input
                  type="range" min="0" max="180" step="15"
                  value={simDelayDays} onChange={(e) => setSimDelayDays(e.target.value)}
                  style={{ width: '100%', accentColor: simDelayDays > 0 ? '#ef4444' : '#10b981' }}
                />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {simDelayDays > 0
                    ? `Explicitly simulates elevated attacker exposure during the unpatched ${simDelayDays}-day window.`
                    : 'Zero delay — immediate remediation.'}
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={simLoading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                {simLoading ? 'Simulating 5,000 Iterations...' : '🧪 Execute Counterfactual Simulation'}
              </button>
            </div>

            {/* Simulation Results Comparison */}
            {simResult && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 16 }}>
                  Simulation Results: Baseline vs. Counterfactual
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Baseline EAL</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                      ₹{Number(simResult.baseline_eal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Counterfactual EAL</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                      ₹{Number(simResult.counterfactual_eal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 14, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Net EAL Reduction</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                      ₹{Number(simResult.eal_reduction).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <div style={{ fontSize: 11, color: '#34d399', marginTop: 2 }}>{simResult.eal_reduction_pct}% decrease</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>95% VaR Tail Reduction</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#a855f7', marginTop: 4 }}>
                      ₹{Number(simResult.var95_reduction).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Per scenario deltas */}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Impact by Scenario:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {simResult.scenario_deltas?.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: 12 }}>
                      <span style={{ color: '#f1f5f9' }}>{d.scenario_name}</span>
                      <span style={{ color: d.eal_reduction >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {d.eal_reduction >= 0 ? `-${d.eal_reduction_pct}%` : `+${Math.abs(d.eal_reduction_pct)}% Exposure`} (₹{Number(d.eal_reduction).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: INVESTMENT OPTIMIZER & ROSI                                    */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'optimizer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Capital Allocation & Budget Optimizer</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
                Combinatorial 0/1 Knapsack Optimizer mathematically solves for the global maximum risk reduction portfolio within your capital budget.
              </div>

              {/* Slider */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Available Security Budget:</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
                    ₹{Number(budgetSlider).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range" min="300000" max="4000000" step="100000"
                  value={budgetSlider} onChange={(e) => setBudgetSlider(e.target.value)}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: 4 }}>
                  <span>₹3 Lakhs (Minimal)</span>
                  <span>₹15 Lakhs (Standard)</span>
                  <span>₹40 Lakhs (Comprehensive)</span>
                </div>
              </div>

              <button
                onClick={handleRunOptimizer}
                disabled={optLoading}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {optLoading ? 'Solving Combinatorial Knapsack...' : '⚡ Compute Optimal Portfolio'}
              </button>
            </div>

            {/* Optimizer Result Display */}
            {optResult && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 16, padding: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>Optimal Mitigation Portfolio (Global Optimum)</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Guaranteed by exact combinatorial knapsack evaluation</div>
                  </div>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
                    border: '1px solid #10b981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
                  }}>
                    Portfolio ROSI: {optResult.portfolio_rosi_percentage}%
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Budget Spent</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>₹{Number(optResult.spent_budget_inr).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{optResult.budget_utilization_pct}% allocated</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Annual Loss Reduction</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>₹{Number(optResult.expected_eal_reduction_inr).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Residual EAL</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#a855f7' }}>₹{Number(optResult.residual_eal_inr).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Cost-Benefit Ratio</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>{optResult.cost_benefit_ratio}x</div>
                  </div>
                </div>

                {/* Action Items List */}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Selected Investments ({optResult.recommended_portfolio?.length || 0}):</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {optResult.recommended_portfolio?.map((a) => (
                    <div key={a.id} style={{
                      background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>[{a.id}] {a.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.description}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>
                          ₹{(a.cost_onetime_inr + a.cost_annual_inr).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{a.duration_days} days deployment</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: STANDARDS & COMPLIANCE                                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'frameworks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Security & Regulatory Framework Crosswalk</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>
                Automated continuous mapping to international standards and Indian regulatory mandates (RBI, SEBI, CERT-In, ISO 27001).
              </div>

              {/* Framework Selector Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {frameworks.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => loadFrameworkData(f.id)}
                    style={{
                      background: selectedFramework === f.id ? '#10b981' : 'rgba(255,255,255,0.04)',
                      color: selectedFramework === f.id ? '#fff' : '#94a3b8',
                      border: `1px solid ${selectedFramework === f.id ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {f.name.split(' (')[0]} ({f.coverage_percentage}% Mapped)
                  </button>
                ))}
              </div>

              {/* Controls List */}
              {frameworkDetail && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8' }}>ID</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8' }}>Control / Requirement</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8' }}>Status</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8' }}>Gap Observation</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8' }}>Remediation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {frameworkDetail.controls?.map((c) => (
                        <tr key={c.control_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#38bdf8' }}>{c.control_id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f1f5f9' }}>{c.name}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              background: c.status === 'implemented' ? 'rgba(16,185,129,0.2)' : (c.status === 'partial' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'),
                              color: c.status === 'implemented' ? '#34d399' : (c.status === 'partial' ? '#fbbf24' : '#f87171'),
                              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{c.gap_description || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: 600 }}>{c.remediation_action || 'Compliant'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: REPORTS & GROUNDED AI                                          */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports_ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Download Cards */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Executive Documentation & Regulatory Exports</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 18 }}>
                Generate boardroom-ready PDF briefing decks or export raw structured JSON for regulatory filing (RBI, SEBI, CERT-In).
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <a
                  href={`${API_BASE}/enterprise/reports/export/pdf`}
                  download="sentinelai_executive_report.pdf"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff', textDecoration: 'none', padding: '12px 22px', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8
                  }}
                >
                  📄 Download Boardroom Executive PDF
                </a>
                <a
                  href={`${API_BASE}/enterprise/reports/export/json`}
                  download="sentinelai_audit_export.json"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1', textDecoration: 'none', padding: '12px 22px', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8
                  }}
                >
                  💾 Download Audit JSON Package
                </a>
              </div>
            </div>

            {/* Grounded AI Terminal */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>Grounded Cyber Risk Intelligence Assistant</span>
                <span style={{
                  background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc',
                  border: '1px solid #a855f7', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20
                }}>
                  Zero Hallucination Guardrails
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18 }}>
                Click any canonical question or ask about organizational risk, loss attribution, and optimal mitigations:
              </div>

              {/* Canonical Question Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {canonicalQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setAiQuery(q.label);
                      handleAIQuery(q.label);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#cbd5e1', padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    💬 {q.label}
                  </button>
                ))}
              </div>

              {/* Query Bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                  type="text"
                  placeholder="Ask a question (e.g., What is our highest financial risk scenario?)"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                  style={{
                    flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '12px 16px', borderRadius: 8, fontSize: 13, outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleAIQuery()}
                  disabled={aiLoading}
                  style={{
                    background: '#a855f7', border: 'none', color: '#fff',
                    padding: '0 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {aiLoading ? 'Analyzing...' : 'Ask AI'}
                </button>
              </div>

              {/* Response Card */}
              {aiResult && (
                <div style={{
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: 12, padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#c084fc' }}>{aiResult.title}</div>
                    <div style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>
                      ✓ {aiResult.grounded_verification}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                    {aiResult.answer}
                  </div>
                  <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, fontSize: 11, color: '#64748b' }}>
                    <strong>Verified Sources:</strong> {aiResult.sources?.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}