import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

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
    if (score <= 30) return '#10B981'; // green
    if (score <= 60) return '#F59E0B'; // orange
    return '#EF4444'; // red
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
      currentProgress += Math.floor(Math.random() * 4) + 1;
      if (currentProgress > 85) currentProgress = 85; // Cap at 85 until API responds
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
      {/* Inline styles for custom animations and effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        body {
            background-image: radial-gradient(circle at top right, #bbc3ff 0%, transparent 40%),
                              radial-gradient(circle at bottom left, #e1dfff 0%, transparent 40%);
            background-attachment: fixed;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 1);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }
        .hero-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .watermark-text {
            font-size: 20vw;
            color: rgba(0, 47, 220, 0.06);
            line-height: 1;
            z-index: 0;
            user-select: none;
            pointer-events: none;
        }
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #002fdc;
            border-radius: 50%;
            opacity: 0.3;
            animation: float 6s infinite ease-in-out;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        .glow-sphere {
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(41, 75, 255, 0.1) 0%, transparent 70%);
            filter: blur(40px);
            z-index: 0;
            pointer-events: none;
        }
        .glow-input:focus-within {
            box-shadow: 0 0 20px rgba(41, 75, 255, 0.15);
            border-color: #002fdc;
        }
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
        .floating-illustration { animation: floating 4s infinite ease-in-out; }
        @keyframes floating {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
      `}} />

      {/* SideNavBar */}
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

      {/* Main Content Canvas */}
      <main className="flex-grow relative z-10 w-full flex flex-col justify-between h-screen p-6">
        {/* Toggle button on the top left when hidden */}
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

        {/* Hero Section */}
        <section className="hero-fade-in relative overflow-hidden pt-8 pb-4">
          {/* Background Decorators */}
          <div className="watermark-text absolute left-[-5%] top-[10%] font-bold">SCAN</div>
          <div className="glow-sphere left-[10%] top-[20%]"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            {/* Left Side Content */}
            <div className="flex-1 text-left py-2">
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface leading-tight mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-[#6B7280] font-body-lg max-w-lg">
                Scan. Analyze. Protect. Stay ahead of investment fraud.
              </p>
            </div>
            
            {/* Right Side Illustration */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="floating-illustration">
                  {/* Placeholder for optional right-side illustration */}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Play Store */}
              <div className={`glass-card rounded-xl p-5 border flex flex-col justify-between h-56 transition-all cursor-pointer ${showPlayStoreInput ? 'border-tertiary shadow-lg' : 'border-outline-variant/30 hover:border-tertiary/50'}`} onClick={() => setShowPlayStoreInput(true)}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs">1</div>
                    <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOGSyt_n_Qp_53G-OO77YHuzlMq7ERegvmi11efO0AvSEu6Ubi_URpl69LiciaDKYpvgfX-NvsSByxnjoq5vVY8xEjn_ElQ0ZQXudJRf7sgRuF7JnVXbQzwZmuTqH0AGOa3IMSnhCajpI7z5aD51bJYLoDX1di3bJEqnChHcUMVJQbQ6w9b-wWkPB5P9UYVYjwIS9e31gPH1IejN_tfdDyNfU7fdz5_wyTCfWXaWpSas3AJaBA5PfSREnddxkl0zDFic2GxsEUCT2czw" 
                        alt="Play Store Logo" 
                        className="w-full h-full object-contain p-1" 
                      />
                    </div>
                  </div>
                  <div className="w-16 h-10 bg-inverse-surface rounded-lg flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-[16px]">shop</span>
                    <span className="material-symbols-outlined text-white/50 text-[16px]">link</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">Play Store Analysis</h3>
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">Paste a Play Store link to fetch details and analyze behavioral signatures.</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowPlayStoreInput(true); }}
                    className="text-xs px-4 py-1.5 rounded-full border border-tertiary text-tertiary font-bold hover:bg-tertiary hover:text-on-tertiary transition-all cursor-pointer"
                  >
                    Analyze App →
                  </button>
                </div>
              </div>

              {/* Card 2: Manual */}
              <div className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between h-56 transition-all hover:border-primary/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">2</div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                    </div>
                  </div>
                  <div className="w-16 h-10 bg-on-primary-fixed-variant rounded-lg flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-[16px]">assignment</span>
                    <span className="material-symbols-outlined text-white/50 text-[16px]">edit</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">Manual Verification</h3>
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">Enter app name and description manually to scan for fraudulent indicators.</p>
                  <button className="text-xs px-4 py-1.5 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all cursor-pointer">Analyze Manually →</button>
                </div>
              </div>

              {/* Card 3: APK */}
              <div className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between h-56 transition-all hover:border-secondary/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">3</div>
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-lg">android</span>
                    </div>
                  </div>
                  <div className="w-16 h-10 bg-[#1B4332] rounded-lg flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-[16px]">description</span>
                    <span className="material-symbols-outlined text-white/50 text-[16px]">verified_user</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">APK Security Scanner</h3>
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">Upload APK file to scan for obfuscated payloads and permissions.</p>
                  <button className="text-xs px-4 py-1.5 rounded-full border border-secondary text-secondary font-bold hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">Upload &amp; Scan →</button>
                </div>
              </div>

              {/* Card 4: Website */}
              <div className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between h-56 transition-all hover:border-error/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E67E22] text-white flex items-center justify-center font-bold text-xs">4</div>
                    <div className="w-8 h-8 rounded-lg bg-[#E67E22]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#E67E22] text-lg">language</span>
                    </div>
                  </div>
                  <div className="w-16 h-10 bg-[#4A2311] rounded-lg flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-[16px]">public</span>
                    <span className="material-symbols-outlined text-white/50 text-[16px]">search</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">Website Analyzer</h3>
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">Analyze URLs for phishing, scam patterns, and fake investment setups.</p>
                  <button className="text-xs px-4 py-1.5 rounded-full border border-[#E67E22] text-[#E67E22] font-bold hover:bg-[#E67E22] hover:text-white transition-all cursor-pointer">Analyze Website →</button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Play Store URL Input Section */}
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

        {/* Scan Progress Container */}
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

        {/* ═══════════ Analysis Results Section ═══════════ */}
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