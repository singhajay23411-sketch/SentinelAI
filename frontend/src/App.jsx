import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SentinelAI from '../Resourses/SentinelAI.jsx';
import SentinelAIDashboard from '../Resourses/Dashboard.jsx';
import ScanApplication from '../Resourses/ScannApp.jsx';
import SentinelAIFlaggedApps from '../Resourses/Flagged_Apps.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Lazy-loaded enterprise pages (built in Milestone 6)
const LoginPage = lazy(() => import('./pages/enterprise/LoginPage.jsx'));
const EnterpriseOverview = lazy(() => import('./pages/enterprise/EnterpriseOverview.jsx'));

function EnterpriseGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0e1a',color:'#64ffda'}}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        {/* ── Existing scanner routes (preserved) ─────────────────────────── */}
        <Route path="/" element={<SentinelAI />} />
        <Route path="/home" element={<SentinelAIDashboard defaultTab="home" />} />
        <Route path="/dashboard" element={<SentinelAIDashboard defaultTab="dashboard" />} />
        <Route path="/scan-app" element={<SentinelAIDashboard defaultTab="scan" />} />
        <Route path="/flagged-apps" element={<SentinelAIDashboard defaultTab="flagged" />} />
        <Route path="/about" element={<SentinelAIDashboard defaultTab="about" />} />
        <Route path="/threat-intelligence" element={<SentinelAIDashboard defaultTab="threats" />} />
        <Route path="/scan/playstore" element={<SentinelAIDashboard defaultTab="scan-playstore" />} />
        <Route path="/scan/manual" element={<SentinelAIDashboard defaultTab="scan-manual" />} />
        <Route path="/scan/apk" element={<SentinelAIDashboard defaultTab="scan-apk" />} />
        <Route path="/scan/website" element={<SentinelAIDashboard defaultTab="scan-website" />} />
        <Route path="/scan/results/:id" element={<SentinelAIDashboard defaultTab="scan-results" />} />
        <Route path="/scan-history" element={<SentinelAIDashboard defaultTab="history" />} />

        {/* ── Enterprise routes (new) ──────────────────────────────────────── */}
        <Route path="/login" element={
          <Suspense fallback={null}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/enterprise/*" element={
          <EnterpriseGuard>
            <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0e1a',color:'#64ffda'}}>Loading enterprise...</div>}>
              <EnterpriseOverview />
            </Suspense>
          </EnterpriseGuard>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
