import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SentinelAI from '../Resourses/SentinelAI.jsx';
import SentinelAIDashboard from '../Resourses/Dashboard.jsx';
import ScanApplication from '../Resourses/ScannApp.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<SentinelAI />} />
        <Route path="/dashboard" element={<SentinelAIDashboard defaultTab="dashboard" />} />
        <Route path="/scan-app" element={<SentinelAIDashboard defaultTab="scan" />} />
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
