import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const ScanApplication = () => {
  const navigate = useNavigate();
  const [appUrl, setAppUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Initializing...');
  const [scanDetail, setScanDetail] = useState('Establishing secure connection to repository...');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Play Store Analysis state
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showPlayStoreInput, setShowPlayStoreInput] = useState(false);

  // Helper: get risk color
  const getRiskColor = (score) => {
    if (score <= 30) return '#10B981';
    if (score <= 60) return '#F59E0B';
    return '#EF4444';
  };
  const getRiskBg = (score) => {
    if (score <= 30) return 'rgba(16, 185, 129, 0.1)';
    if (score <= 60) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  // Handles the real Play Store analysis API call
  const handleAnalyze = async () => {
    if (!appUrl.trim()) {
      setAnalysisError('Please enter a valid Play Store URL.');
      return;
    }

    // Reset state
    setAnalysisError('');
    setAnalysisResult(null);
    setIsScanning(true);
    setProgress(0);
    setScanStatus('Initializing...');
    setScanDetail('Establishing secure connection to repository...');

    // Simulate progress during API call
    const stages = [
      { limit: 20, status: 'Ingesting Metadata...', detail: 'Fetching manifest, permissions, and developer info.' },
      { limit: 50, status: 'Running Similarity Analysis...', detail: 'Comparing behavioral signatures against global threat intelligence.' },
      { limit: 80, status: 'Deep Code Inspection...', detail: 'Scanning binaries for obfuscated payload indicators.' },
    ];

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress > 85) currentProgress = 85;
      setProgress(currentProgress);
      const currentStage = stages.find(s => currentProgress <= s.limit) || stages[2];
      setScanStatus(currentStage.status);
      setScanDetail(currentStage.detail);
    }, 300);

    try {
      const response = await axios.post(`${API_BASE}/analyze-playstore-app`, {
        url: appUrl.trim(),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setScanStatus('Analysis Complete');
      setScanDetail('Comprehensive security report generated.');
      setAnalysisResult(response.data);

    } catch (err) {
      clearInterval(progressInterval);
      setIsScanning(false);
      setProgress(0);

      if (err.response) {
        const detail = err.response.data?.detail || 'Analysis failed.';
        if (err.response.status === 400) {
          setAnalysisError(detail);
        } else {
          setAnalysisError(`Server Error: ${detail}`);
        }
      } else if (err.request) {
        setAnalysisError('Unable to reach the analysis server. Make sure the backend is running on port 8000.');
      } else {
        setAnalysisError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-hidden flex">
      {/* Inline styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: #f4f6ff;
        }

        /* ── Scan card ── */
        .sc-card {
          background: #ffffff;
          border: 1px solid #e8edf8;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          padding: 24px 22px 22px 22px;
          cursor: pointer;
          min-height: 260px;
        }
        .sc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 36px rgba(0,0,0,0.1);
        }
        .sc-card-1:hover { border-color: rgba(99,102,241,0.4); }
        .sc-card-2:hover { border-color: rgba(59,130,246,0.4); }
        .sc-card-3:hover { border-color: rgba(20,184,166,0.4); }
        .sc-card-4:hover { border-color: rgba(245,158,11,0.4); }
        .sc-card-1.sc-active { border-color: rgba(99,102,241,0.5); box-shadow: 0 10px 36px rgba(99,102,241,0.15); }

        /* ── Number badge ── */
        .sc-badge {
          width: 26px; height: 26px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
          margin-bottom: 20px;
        }

        /* ── Icon box ── */
        .sc-icon-box {
          width: 80px; height: 80px;
          border-radius: 18px;
          background: #f4f6fa;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }

        /* ── Card button ── */
        .sc-btn {
          display: inline-block;
          padding: 9px 0;
          width: 100%;
          border-radius: 50px;
          font-size: 13px; font-weight: 600;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.22s ease;
          background: transparent;
          text-align: center;
          margin-top: auto;
        }
        .sc-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        .sc-btn-indigo { border-color: #6366f1; color: #6366f1; }
        .sc-btn-indigo:hover { background: #6366f1; color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }

        .sc-btn-blue { border-color: #3b82f6; color: #3b82f6; }
        .sc-btn-blue:hover { background: #3b82f6; color: #fff; box-shadow: 0 4px 14px rgba(59,130,246,0.3); }

        .sc-btn-teal { border-color: #14b8a6; color: #14b8a6; }
        .sc-btn-teal:hover { background: #14b8a6; color: #fff; box-shadow: 0 4px 14px rgba(20,184,166,0.3); }

        .sc-btn-amber { border-color: #f59e0b; color: #d97706; }
        .sc-btn-amber:hover { background: #f59e0b; color: #fff; box-shadow: 0 4px 14px rgba(245,158,11,0.3); }

        /* ── Glass card (URL input, results, scan progress) ── */
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }

        /* ── Hero fade in ── */
        .hero-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Card appear ── */
        .sc-appear { opacity: 0; animation: scAppear 0.55s ease-out forwards; }
        .sc-d1 { animation-delay: 0.08s; }
        .sc-d2 { animation-delay: 0.16s; }
        .sc-d3 { animation-delay: 0.24s; }
        .sc-d4 { animation-delay: 0.32s; }
        @keyframes scAppear {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Fluid art animations ── */
        @keyframes fluidShift {
          0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
          33%       { transform: scale(1.03) rotate(1.5deg) translateY(-6px); }
          66%       { transform: scale(0.98) rotate(-1deg) translateY(4px); }
        }
        .fluid-animate { animation: fluidShift 9s ease-in-out infinite; }
        .fluid-animate-2 { animation: fluidShift 12s ease-in-out infinite reverse; }

        /* ── Scan animations ── */
        @keyframes scan-pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-core { animation: scan-pulse 2s infinite ease-in-out; }
        .orbiting-element { animation: orbit 4s linear infinite; }
      `}} />

      {/* ══════════════════════════════
          SIDEBAR — ORIGINAL UNCHANGED
      ══════════════════════════════ */}
      <nav className={`hidden md:flex flex-col bg-white/75 backdrop-blur-xl h-[calc(100vh-48px)] m-6 rounded-lg border border-white/100 p-6 z-10 shrink-0 sticky top-6 transition-all duration-300 ${isSidebarVisible ? 'w-72 opacity-100' : 'w-0 p-0 m-0 border-0 opacity-0 overflow-hidden'}`}>
        <div className="mb-16 flex items-center justify-between gap-4 cursor-pointer">
          <div className="flex items-center gap-4" onClick={() => navigate('/')}>
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-outline-variant bg-surface">
              <img
                alt="SentinelAI Node"
                className="w-full h-full object-cover"
                data-alt="A futuristic AI node avatar, abstract geometric shapes, glowing blue center on a white background, high tech aesthetic, minimal, vector style"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbq_X4xrqjCuAqP0h0H0l_J2YfzOTE6Y_DH1-e6RGUjWJlGXP1SMBKrd4UHToJkW0yOBGcMWf0EvDVZVNi5MDMZCEXDI0YJCWXiyxHXikKFxsLN3ZWMMILT-SoJITibzQS0eJuFhSaGhIrwxQjF7BA5_IdMQ2d0T-94EzsC7pR0KNno2NGDwN3wGv6EgOObmDSGtCuMDU4SrZb_6uwA1JC20oTri8NShquTrfnVM8EXlSkrY1bgYbTwu-18dJt6d6AfkVdoiTLJak"
              />
            </div>
            <div>
              <h1 className="font-title-lg text-title-lg font-bold text-on-surface">SentinelAI</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] glow-accent"></span>
                <span className="text-xs text-on-surface-variant font-medium">AI-Core Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarVisible(false)}
            className="text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-center p-1 rounded hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>

        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/'); }} href="/">
              <span className="material-symbols-outlined">home</span>Home
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} href="/dashboard">
              <span className="material-symbols-outlined">language</span>Dashboard
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/scan-app'); }} href="/scan-app">
              <span className="material-symbols-outlined">security</span>Scan App
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/flagged-apps'); }} href="/flagged-apps">
              <span className="material-symbols-outlined">analytics</span>Flagged App
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" href="#">
              <span className="material-symbols-outlined">security</span>Threat Intelligence
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" href="#">
              <span className="material-symbols-outlined">history</span>Scan History
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/', { state: { view: 'about' } }); }} href="/#about">
              <span className="material-symbols-outlined">info</span>About Us
            </a>
          </li>
        </ul>
        <div className="mt-auto pt-6"></div>
      </nav>

      {/* ══════════════════════════════
          MAIN CONTENT
      ══════════════════════════════ */}
      <main className="flex-grow relative z-10 w-full flex flex-col h-screen overflow-y-auto p-6">

        {/* Toggle button when sidebar hidden */}
        {!isSidebarVisible && (
          <div className="fixed top-6 left-6 z-50">
            <button
              onClick={() => setIsSidebarVisible(true)}
              className="bg-white/75 backdrop-blur-xl border border-white/100 p-2.5 rounded-lg shadow-sm hover:bg-white transition-all cursor-pointer flex items-center justify-center text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        )}

        {/* ── HERO SECTION ── */}
        <section
          className="hero-fade-in relative overflow-hidden mb-5"
          style={{
            borderRadius: 22,
            background: 'linear-gradient(135deg, #eef0ff 0%, #eff2ff 40%, #e8eeff 100%)',
            minHeight: 160,
            padding: '40px 44px',
          }}
        >
          {/* Fluid flowing art — right side */}
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: '56%', overflow: 'hidden', zIndex: 0,
            }}
          >
            {/* Outer soft lavender fade-in from left */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(238,240,255,1) 0%, rgba(238,240,255,0) 30%)',
              zIndex: 10,
            }} />

            {/* Base gradient — matches reference indigo/violet palette */}
            <div className="fluid-animate" style={{
              position: 'absolute', inset: '-10%',
              background: 'linear-gradient(140deg, #c7d2fe 0%, #a5b4fc 18%, #818cf8 34%, #6366f1 50%, #7c3aed 68%, #6d28d9 82%, #581c87 100%)',
              opacity: 0.88,
            }} />

            {/* Flowing highlight layer 1 — top right bright violet */}
            <div className="fluid-animate-2" style={{
              position: 'absolute',
              top: '-20%', right: '-10%',
              width: '65%', height: '75%',
              background: 'radial-gradient(ellipse at 50% 40%, rgba(196,181,253,0.95) 0%, rgba(167,139,250,0.7) 35%, transparent 70%)',
              borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%',
              filter: 'blur(4px)',
            }} />

            {/* Flowing wave layer 2 — mid indigo */}
            <div className="fluid-animate" style={{
              position: 'absolute',
              top: '10%', left: '-5%',
              width: '80%', height: '65%',
              background: 'radial-gradient(ellipse at 40% 55%, rgba(99,102,241,0.85) 0%, rgba(79,70,229,0.5) 45%, transparent 72%)',
              borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%',
              filter: 'blur(3px)',
            }} />

            {/* Deep shadow blob — bottom purple */}
            <div className="fluid-animate-2" style={{
              position: 'absolute',
              bottom: '-15%', right: '5%',
              width: '70%', height: '60%',
              background: 'radial-gradient(ellipse at 55% 50%, rgba(109,40,217,0.8) 0%, rgba(88,28,135,0.5) 45%, transparent 70%)',
              borderRadius: '55% 45% 60% 40% / 40% 60% 40% 60%',
              filter: 'blur(5px)',
            }} />

            {/* Bright cyan-blue highlight accent — upper-mid */}
            <div style={{
              position: 'absolute',
              top: '15%', left: '25%',
              width: '40%', height: '35%',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.35) 0%, rgba(196,181,253,0.2) 50%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(8px)',
            }} />

            {/* Sparkle dots */}
            <div style={{ position: 'absolute', top: '38%', left: '35%', width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
            <div style={{ position: 'absolute', top: '22%', left: '55%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }} />
            <div style={{ position: 'absolute', top: '60%', left: '45%', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ position: 'absolute', top: '48%', left: '70%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
          </div>

          {/* Text content — left, above fluid art */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              marginBottom: 10,
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 400, lineHeight: 1.5 }}>
              Scan. Analyze. Protect. Stay ahead of investment fraud.
            </p>
          </div>
        </section>

        {/* ── FOUR SCAN CARDS ── */}
        <section className="mb-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

          {/* Card 1: Play Store Analysis */}
          <div
            className={`sc-card sc-card-1 sc-appear sc-d1 ${showPlayStoreInput ? 'sc-active' : ''}`}
            onClick={() => setShowPlayStoreInput(true)}
          >
            {/* Badge */}
            <div className="sc-badge" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>1</div>

            {/* Icon */}
            <div className="sc-icon-box">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOGSyt_n_Qp_53G-OO77YHuzlMq7ERegvmi11efO0AvSEu6Ubi_URpl69LiciaDKYpvgfX-NvsSByxnjoq5vVY8xEjn_ElQ0ZQXudJRf7sgRuF7JnVXbQzwZmuTqH0AGOa3IMSnhCajpI7z5aD51bJYLoDX1di3bJEqnChHcUMVJQbQ6w9b-wWkPB5P9UYVYjwIS9e31gPH1IejN_tfdDyNfU7fdz5_wyTCfWXaWpSas3AJaBA5PfSREnddxkl0zDFic2GxsEUCT2czw"
                alt="Play Store"
                style={{ width: 44, height: 44, objectFit: 'contain' }}
              />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Play Store Analysis
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 20, flex: 1 }}>
              Paste a Play Store link to fetch details and analyze behavioral signatures.
            </p>

            <button
              className="sc-btn sc-btn-indigo"
              onClick={(e) => { e.stopPropagation(); setShowPlayStoreInput(true); }}
            >
              Analyze App →
            </button>
          </div>

          {/* Card 2: Manual Verification */}
          <div className="sc-card sc-card-2 sc-appear sc-d2">
            <div className="sc-badge" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>2</div>

            <div className="sc-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#3b82f6' }}>edit_note</span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Manual Verification
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 20, flex: 1 }}>
              Enter app name and description manually to scan for fraudulent indicators.
            </p>

            <button className="sc-btn sc-btn-blue">Analyze Manually →</button>
          </div>

          {/* Card 3: APK Security Scanner */}
          <div className="sc-card sc-card-3 sc-appear sc-d3">
            <div className="sc-badge" style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>3</div>

            <div className="sc-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#14b8a6' }}>android</span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.01em' }}>
              APK Security Scanner
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 20, flex: 1 }}>
              Upload APK file to scan for obfuscated payloads and permissions.
            </p>

            <button className="sc-btn sc-btn-teal">Upload &amp; Scan →</button>
          </div>

          {/* Card 4: Website Analyzer */}
          <div className="sc-card sc-card-4 sc-appear sc-d4">
            <div className="sc-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>4</div>

            <div className="sc-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#d97706' }}>language</span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Website Analyzer
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 20, flex: 1 }}>
              Analyze URLs for phishing, scam patterns, and fake investment setups.
            </p>

            <button className="sc-btn sc-btn-amber">Analyze Website →</button>
          </div>

        </section>

        {/* ── Play Store URL Input Section ── */}
        {showPlayStoreInput && (
          <section className="pb-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="glass-card rounded-xl p-6 border border-tertiary/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-tertiary">link</span>
                  <h3 className="text-lg font-bold text-on-surface">Play Store URL</h3>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={appUrl}
                    onChange={(e) => { setAppUrl(e.target.value); setAnalysisError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(); }}
                    placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                    className="flex-grow px-4 py-3 rounded-lg bg-white/80 border border-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface text-sm placeholder-outline"
                    disabled={isScanning}
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isScanning || !appUrl.trim()}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
                      isScanning
                        ? 'bg-outline/20 text-outline cursor-not-allowed'
                        : 'bg-tertiary text-on-tertiary hover:opacity-90 cursor-pointer'
                    }`}
                  >
                    {isScanning ? (
                      <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Analyzing...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">search</span> Analyze</>
                    )}
                  </button>
                </div>
                {analysisError && (
                  <div className="mt-3 flex items-center gap-2 text-error text-sm bg-error/5 px-4 py-2 rounded-lg border border-error/20">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {analysisError}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Scan Progress Container ── */}
        <section className="px-container-margin-mobile md:px-container-margin pb-4">
          <div
            className={`max-w-3xl mx-auto transition-all duration-500 overflow-hidden ${
              isScanning ? 'opacity-100 h-auto mt-6' : 'opacity-0 h-0'
            }`}
            id="scan-container"
          >
            <div className="glass-card rounded-xl p-8 md:p-12 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-container/5 rounded-xl pointer-events-none"></div>

              {/* Holographic Scanning Visual */}
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-secondary-container/20 rounded-full blur-xl scan-core"></div>
                <div className="w-24 h-24 rounded-full border border-primary flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 relative">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: '"FILL" 0' }}>aod</span>
                </div>
                <div className="absolute inset-0 rounded-full border border-primary/30 orbiting-element" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-2 rounded-full border border-secondary/20 orbiting-element" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary shadow-[0_0_10px_#5b21c4] animate-[scan-line_2s_ease-in-out_infinite]"></div>
              </div>

              {/* Progress & Status */}
              <div className="w-full max-w-md text-center">
                <div className="flex justify-between items-end mb-2 font-body-md text-body-md">
                  <span className="text-on-surface font-bold text-primary">{scanStatus}</span>
                  <span className="text-on-surface-variant font-label-caps text-label-caps">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="font-label-caps text-label-caps text-outline mt-4">{scanDetail}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ Analysis Results Section ══════════ */}
        {analysisResult && analysisResult.success && (
          <section className="pb-12 relative z-10">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Row 1: App Overview + Risk Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* App Overview Card */}
                <div className="md:col-span-2 glass-card rounded-xl p-6 border border-outline-variant/30">
                  <div className="flex items-start gap-4">
                    {analysisResult.app_details.icon && (
                      <img
                        src={analysisResult.app_details.icon}
                        alt={analysisResult.app_details.title}
                        className="w-20 h-20 rounded-2xl border border-outline-variant shadow-sm object-cover shrink-0"
                      />
                    )}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold text-on-surface truncate">{analysisResult.app_details.title}</h3>
                      <p className="text-sm text-on-surface-variant">{analysisResult.app_details.developer}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">download</span>
                          {analysisResult.app_details.installs}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#F59E0B]">star</span>
                          {analysisResult.app_details.score ? Number(analysisResult.app_details.score).toFixed(1) : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">rate_review</span>
                          {analysisResult.app_details.ratings?.toLocaleString() || '0'} ratings
                        </div>
                        {analysisResult.app_details.genre && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">category</span>
                            {analysisResult.app_details.genre}
                          </div>
                        )}
                      </div>
                      {analysisResult.app_details.description && (
                        <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{analysisResult.app_details.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Score Card */}
                <div className="glass-card rounded-xl p-6 border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mb-3 border-4 transition-all"
                    style={{
                      borderColor: getRiskColor(analysisResult.analysis.risk_score),
                      backgroundColor: getRiskBg(analysisResult.analysis.risk_score),
                    }}
                  >
                    <span className="text-3xl font-bold" style={{ color: getRiskColor(analysisResult.analysis.risk_score) }}>
                      {analysisResult.analysis.risk_score}%
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold px-4 py-1.5 rounded-full"
                    style={{
                      color: getRiskColor(analysisResult.analysis.risk_score),
                      backgroundColor: getRiskBg(analysisResult.analysis.risk_score),
                    }}
                  >
                    {analysisResult.analysis.threat_level}
                  </span>
                  {analysisResult.analysis.matched_app && analysisResult.analysis.name_similarity >= 70 && (
                    <p className="text-xs text-on-surface-variant mt-2">
                      Similar to <strong>{analysisResult.analysis.matched_app}</strong> ({analysisResult.analysis.name_similarity}%)
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Threat Reasons + Risk Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Threat Reasons Card */}
                <div className="glass-card rounded-xl p-6 border border-outline-variant/30">
                  <h4 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error">report</span>
                    Threat Analysis
                  </h4>
                  <ul className="space-y-3">
                    {analysisResult.analysis.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: getRiskColor(analysisResult.analysis.risk_score) }}>
                          {analysisResult.analysis.risk_score <= 30 ? 'check_circle' : 'warning'}
                        </span>
                        <span className="text-on-surface-variant">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Breakdown Card */}
                <div className="glass-card rounded-xl p-6 border border-outline-variant/30">
                  <h4 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Risk Breakdown
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Name Similarity', value: analysisResult.analysis.breakdown.name.risk, weight: '35%' },
                      { label: 'Description', value: analysisResult.analysis.breakdown.description.risk, weight: '25%' },
                      { label: 'Developer', value: analysisResult.analysis.breakdown.developer.risk, weight: '25%' },
                      { label: 'Install Count', value: analysisResult.analysis.breakdown.installs.risk, weight: '15%' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-on-surface-variant font-medium">{item.label} <span className="text-outline">({item.weight})</span></span>
                          <span className="font-bold" style={{ color: getRiskColor(item.value) }}>{item.value}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: getRiskColor(item.value) }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Screenshots Gallery */}
              {analysisResult.app_details.screenshots && analysisResult.app_details.screenshots.length > 0 && (
                <div className="glass-card rounded-xl p-6 border border-outline-variant/30">
                  <h4 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">photo_library</span>
                    App Screenshots
                  </h4>
                  <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                    {analysisResult.app_details.screenshots.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Screenshot ${i + 1}`}
                        className="h-52 w-auto rounded-lg border border-outline-variant/30 shadow-sm shrink-0 object-contain bg-white"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New Analysis Button */}
              <div className="text-center">
                <button
                  onClick={() => { setAnalysisResult(null); setIsScanning(false); setProgress(0); setAppUrl(''); }}
                  className="text-sm px-6 py-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-all cursor-pointer"
                >
                  ← Scan Another App
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ScanApplication;