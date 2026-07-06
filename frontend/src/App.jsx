import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SentinelAI from '../Resourses/SentinelAI.jsx';
import SentinelAIDashboard from '../Resourses/Dashboard.jsx';
import ScanApplication from '../Resourses/ScannApp.jsx';
import SentinelAIFlaggedApps from '../Resourses/Flagged_Apps.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
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
