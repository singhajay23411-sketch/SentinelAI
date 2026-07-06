import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useScanContext } from '../src/context/ScanContext.jsx';
import PlayStoreAnalysis from './scans/PlayStoreAnalysis.jsx';
import ManualVerification from './scans/ManualVerification.jsx';
import APKScanner from './scans/APKScanner.jsx';
import WebsiteAnalyzer from './scans/WebsiteAnalyzer.jsx';
import ScanResults from './scans/ScanResults.jsx';
import ScanHistory from './scans/ScanHistory.jsx';
import vishalImg from '../src/assets/team/vishal.jpg';
import ajayImg from '../src/assets/team/ajay.jpg';
import prachiImg from '../src/assets/team/prachi.jpg';

const SentinelAIDashboard = ({ defaultTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { scans, stats, flaggedApps, threatMetrics, getScanById } = useScanContext();
  const currentResult = id ? getScanById(id) : null;
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab state with URL / defaultTab prop
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Scanner States
  const [appUrl, setAppUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Initializing...');
  const [scanDetail, setScanDetail] = useState('Establishing secure connection to repository...');

  // Handles the scan animation and state updates
  const handleAnalyze = () => {
    setIsScanning(true);
    setProgress(0);
    setScanStatus('Initializing...');
    setScanDetail('Establishing secure connection to repository...');

    let currentProgress = 0;
    const stages = [
      { limit: 25, status: 'Ingesting Metadata...', detail: 'Fetching manifest, permissions, and developer info.' },
      { limit: 60, status: 'Running Similarity Analysis...', detail: 'Comparing behavioral signatures against global threat intelligence.' },
      { limit: 90, status: 'Deep Code Inspection...', detail: 'Scanning binaries for obfuscated payload indicators.' },
      { limit: 100, status: 'Analysis Complete', detail: 'Generating comprehensive security report.' }
    ];

    const interval = setInterval(() => {
      currentProgress += 3;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }

      setProgress(currentProgress);

      const currentStage = stages.find(s => currentProgress <= s.limit) || stages[3];
      setScanStatus(currentStage.status);
      setScanDetail(currentStage.detail);
    }, 200);
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-hidden flex h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
          .glass-panel {
              background-color: rgba(255, 255, 255, 0.75);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 1);
          }
          .glow-accent {
              box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
          }
          .hero-fade-in { animation: fadeIn 1s ease-out forwards; }
          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .watermark-text {
              font-size: 15vw;
              color: rgba(0, 47, 220, 0.04);
              line-height: 1;
              z-index: 0;
              user-select: none;
              pointer-events: none;
          }
          .scan-pulse { animation: scan-pulse-kf 2s infinite ease-in-out; }
          @keyframes scan-pulse-kf {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.05); opacity: 0.8; }
              100% { transform: scale(0.95); opacity: 0.5; }
          }
          @keyframes orbit-kf {
              0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
              100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
          }
          .orbiting-element { animation: orbit-kf 4s linear infinite; }
          @keyframes scan-line-kf {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
          }
          @keyframes fluidShift {
              0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
              33%       { transform: scale(1.03) rotate(1.5deg) translateY(-6px); }
              66%       { transform: scale(0.98) rotate(-1deg) translateY(4px); }
          }
        `
      }} />

      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-tertiary/5 blur-[150px]"></div>
      </div>

      {/* SideNavBar */}
      <nav className={`hidden md:flex flex-col bg-white/75 backdrop-blur-xl h-[calc(100vh-48px)] m-6 rounded-lg border border-white/100 p-6 z-10 shrink-0 sticky top-6 transition-all duration-300 ${isSidebarVisible ? 'w-72 opacity-100' : 'w-0 p-0 m-0 border-0 opacity-0 overflow-hidden'}`}>
        <div className="mb-16 flex items-center justify-between gap-4 cursor-pointer">
          <div className="flex items-center gap-4" onClick={() => navigate('/')}>
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-outline-variant bg-surface">
              <img
                alt="SentinelAI Node"
                className="w-full h-full object-cover"
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
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'home' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('home'); navigate('/home'); }}
              href="/home"
            >
              <span className="material-symbols-outlined">home</span>Home
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); navigate('/dashboard'); }}
              href="/dashboard"
            >
              <span className="material-symbols-outlined">language</span>Dashboard
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${(activeTab === 'scan' || activeTab.startsWith('scan-')) ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('scan'); navigate('/scan-app'); }}
              href="/scan-app"
            >
              <span className="material-symbols-outlined">security</span>Scan App
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'flagged' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('flagged'); navigate('/flagged-apps'); }}
              href="/flagged-apps"
            >
              <span className="material-symbols-outlined">analytics</span>Flagged Apps
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'threats' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); navigate('/threat-intelligence'); }}
              href="/threat-intelligence"
            >
              <span className="material-symbols-outlined">security</span>Threat Intelligence
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'history' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); navigate('/scan-history'); }}
              href="/scan-history"
            >
              <span className="material-symbols-outlined">history</span>Scan History
            </a>
          </li>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${activeTab === 'about' ? 'text-primary font-bold border-b-2 border-primary pb-1 bg-primary/5' : 'text-on-surface-variant hover:bg-primary-container/20'}`}
              onClick={(e) => { e.preventDefault(); setActiveTab('about'); navigate('/about'); }}
              href="/about"
            >
              <span className="material-symbols-outlined">info</span>About Us
            </a>
          </li>
        </ul>
        <div className="mt-auto pt-6"></div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow p-container-margin-mobile md:p-container-margin max-w-max-width mx-auto relative overflow-y-auto h-screen">
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

        {/* View 1: Home (Original Landing Content adapted for Dashboard wrapper) */}
        {activeTab === 'home' && (
          <div className="relative space-y-16 py-6 overflow-x-hidden">
            {/* Massive Background Typography */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-[-1] pointer-events-none opacity-40">
              <div className="font-hero-display text-7xl font-black text-[#002fdc]/5 tracking-tighter transform -rotate-12 scale-125">
                SENTINELAI
              </div>
            </div>

            {/* HeroSection */}
            <section className="relative pt-8 pb-8 px-container-margin-mobile md:px-container-margin max-w-max-width mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center w-full">
                {/* Hero Content */}
                <div className="lg:col-span-5 space-y-4 z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Advanced Threat Defense</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-on-surface">
                    Detect Fake <br />
                    <span style={{ color: 'rgb(26, 56, 176)', background: 'none', WebkitTextFillColor: 'initial' }}>Investment Apps</span> <br />
                    Before They Scam You
                  </h1>
                  <p className="text-body-md text-on-surface-variant max-w-lg">
                    SentinelAI uses advanced AI, similarity analysis, and risk scoring to identify fake and look-alike investment applications in real-time and protect users from financial fraud.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button onClick={() => { setActiveTab('scan'); navigate('/scan-app'); }} className="bg-[#0A0F29] text-white px-8 py-3.5 rounded-full font-bold hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      Get Started
                    </button>
                  </div>
                </div>

                {/* Hero Visual */}
                <div className="lg:col-span-7 relative h-[400px] flex items-center justify-center mt-12 lg:mt-0">
                  {/* Floating Glass Cards */}
                  <div className="absolute top-10 left-10 glass-panel p-4 rounded-2xl shadow-sm animate-bounce z-20 flex items-center gap-3" style={{ animationDuration: '4s' }}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant font-bold uppercase">Accuracy</div>
                      <div className="text-lg font-bold text-on-surface">98.7%</div>
                    </div>
                  </div>
                  <div className="absolute bottom-10 right-10 glass-panel p-4 rounded-2xl shadow-sm animate-bounce z-20 flex items-center gap-3" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                    <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant font-bold uppercase">Threats Detected</div>
                      <div className="text-lg font-bold text-on-surface">12.8K+</div>
                    </div>
                  </div>

                  {/* Centerpiece Graphic */}
                  <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                    <img
                      alt="3D Holographic AI Shield"
                      className="w-full h-full object-contain drop-shadow-2xl z-10"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaAT82oALZXN56LhyWNmHyYEJ4NMLa5zqwyFGACeUYIYimhgWCBkL9_p1tMQgNrilW2ByuHgs7ozdvIjLT2HdyJLYSzhZSPmyBqxf1no7sYfgZfmRJTAr9LnMgoHhs7pTLiSLgMCXtluG5RfHJy-AA0nN8E2kw7v-bKJOdUMTpvip0WqdCcDYKofu8vLd3wWP2kq9bwKxIeQtr_AS29zIj7h8fw7VvUAZ0tR1FH9s8OibClenRQvl9YaHTlNFDdA8HxDX3OOR15ssP7g"
                    />
                    <div className="absolute inset-4 rounded-full border border-primary/20 animate-spin-slow"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-12 relative border-t border-outline-variant/20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-primary font-bold text-xs uppercase tracking-widest">Powerful Features</span>
                  <h2 className="text-3xl font-bold text-on-background leading-tight">Everything you need for advanced app protection</h2>
                  <p className="text-sm text-on-surface-variant">Our AI-powered platform combines multiple detection engines to deliver enterprise-grade security.</p>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 rounded-xl space-y-3">
                    <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                    <h3 className="text-lg font-bold">AI Similarity Engine</h3>
                    <p className="text-xs text-on-surface-variant">Advanced algorithms detect look-alike apps with high accuracy, analyzing behavioral signatures.</p>
                  </div>
                  <div className="glass-panel p-6 rounded-xl space-y-3">
                    <span className="material-symbols-outlined text-secondary text-3xl">analytics</span>
                    <h3 className="text-lg font-bold">Risk Scoring</h3>
                    <p className="text-xs text-on-surface-variant">Multi-factor risk assessment with explainable AI insights.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 bg-surface-container-low/50 rounded-2xl p-8">
              <div className="text-center mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">How SentinelAI Works</span>
                <h2 className="text-3xl font-bold mt-2">AI-Powered Detection in 4 Simple Steps</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto flex items-center justify-center">1</div>
                  <h4 className="font-bold text-base">Collect &amp; Analyze</h4>
                  <p className="text-xs text-on-surface-variant">We collect app data including name, icon, description, and metadata.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto flex items-center justify-center">2</div>
                  <h4 className="font-bold text-base">AI Processing</h4>
                  <p className="text-xs text-on-surface-variant">Our AI engines analyze similarity and behavior patterns using deep networks.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto flex items-center justify-center">3</div>
                  <h4 className="font-bold text-base">Risk Assessment</h4>
                  <p className="text-xs text-on-surface-variant">Applications are scored based on risk level with detailed explanations.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mx-auto flex items-center justify-center">4</div>
                  <h4 className="font-bold text-base">Action &amp; Protect</h4>
                  <p className="text-xs text-on-surface-variant">Flag high-risk apps and protect users from fraud through reports.</p>
                </div>
              </div>
            </section>

            {/* CTASection */}
            <section className="py-12 bg-[#C9E8FC] rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold leading-tight text-on-background">Ready to Detect Fake Apps Before They Cause Damage?</h2>
                <p className="text-sm text-on-surface-variant">Join leading financial institutions using SentinelAI to secure their mobile ecosystem and protect brand integrity.</p>
                <button onClick={() => { setActiveTab('scan'); navigate('/scan-app'); }} className="bg-on-background text-white px-10 py-3.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg cursor-pointer">
                  Request a Demo
                </button>
              </div>
            </section>
          </div>
        )}

        {/* View 2: Dashboard (Overview Metrics) */}
        {activeTab === 'dashboard' && (
          <div className="py-6 relative flex flex-col h-full">
            {/* Ambient wavy background for the header */}
            <div className="absolute top-0 right-0 w-[60%] h-[180px] pointer-events-none overflow-hidden opacity-60 z-0">
              <svg className="w-full h-full text-indigo-200/40" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 40 C 100 20, 150 100, 300 30 C 450 -40, 500 80, 600 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M-50 60 C 120 40, 130 110, 280 50 C 430 -10, 480 90, 600 60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
                <path d="M-50 20 C 80 0, 170 90, 320 20 C 470 -50, 520 70, 600 20" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <header className="mb-8 flex justify-between items-center relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-1.5 h-12 bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6] rounded-full self-center"></div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">Overview</h2>
                  <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Real-time threat intelligence and system metrics.</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button className="bg-white border border-[#E2E8F0] text-[#1A38B0] font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm z-10 cursor-pointer">
                  <span className="material-symbols-outlined text-lg">download</span> Export Report
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
              {/* Total Apps Scanned */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0]/80 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 min-h-[170px]">
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-purple-100/40 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Total Apps Scanned</span>
                <div className="text-3xl font-bold text-[#0F172A] mt-1 mb-2">{(stats.total || 0).toLocaleString()}</div>
                <div className="text-purple-600 text-xs font-semibold flex items-center gap-1 mt-auto">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Live metrics
                </div>
              </div>

              {/* High Risk */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0]/80 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 min-h-[170px]">
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-red-100/40 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">High Risk</span>
                <div className="text-3xl font-bold text-red-600 mt-1 mb-2">{(stats.high || 0).toLocaleString()}</div>
                <div className="text-red-500 text-xs font-semibold flex items-center gap-1.5 mt-auto">
                  <span className="material-symbols-outlined text-sm">warning</span> Action Required
                </div>
              </div>

              {/* Medium Risk */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0]/80 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 min-h-[170px]">
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-blue-100/40 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                  <span className="material-symbols-outlined text-xl">info</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Medium Risk</span>
                <div className="text-3xl font-bold text-[#0F172A] mt-1 mb-2">{(stats.medium || 0).toLocaleString()}</div>
                <div className="text-blue-500 text-xs font-semibold flex items-center gap-1.5 mt-auto">
                  <span className="material-symbols-outlined text-sm">info</span> Under Review
                </div>
              </div>

              {/* Safe Apps */}
              <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0]/80 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 min-h-[170px]">
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Safe Apps</span>
                <div className="text-3xl font-bold text-[#0F172A] mt-1 mb-2">{(stats.safe || 0).toLocaleString()}</div>
                <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5 mt-auto">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span> Verified Secure
                </div>
              </div>
            </div>

            {/* Charts & Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 items-stretch flex-grow">
              {/* Left Column: Recent Scans Card */}
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col h-full min-h-[450px]">
                <h3 className="font-bold text-[#0F172A] text-lg mb-6">Recent Scans</h3>
                <div className="flex-grow flex flex-col">
                  {scans.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                      <div className="relative mb-6">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="28" cy="80" r="4" fill="#C7D2FE" opacity="0.6" />
                          <circle cx="88" cy="30" r="3" fill="#C7D2FE" opacity="0.8" />
                          <circle cx="94" cy="74" r="5" fill="#818CF8" opacity="0.4" />
                          <circle cx="24" cy="36" r="6" fill="#818CF8" opacity="0.3" />
                          <rect x="36" y="24" width="48" height="64" rx="8" fill="#F0F4FF" stroke="#D2DFFA" strokeWidth="2" />
                          <line x1="46" y1="40" x2="66" y2="40" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" />
                          <line x1="46" y1="50" x2="74" y2="50" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" />
                          <line x1="46" y1="60" x2="58" y2="60" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="72" cy="72" r="12" fill="white" stroke="#2563EB" strokeWidth="3" />
                          <line x1="80.5" y1="80.5" x2="94" y2="94" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] mb-1">No scans performed yet.</h3>
                      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Start scanning apps to see results here.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-gray-400 font-semibold">
                          <th className="py-3 px-2 text-[11px] uppercase tracking-wider">App</th>
                          <th className="py-3 px-2 text-[11px] uppercase tracking-wider">Developer</th>
                          <th className="py-3 px-2 text-[11px] uppercase tracking-wider">Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scans.slice(0, 6).map((scan) => {
                          const score = scan.threatScore !== undefined ? scan.threatScore : (scan.riskScore || 0);
                          const severity = score >= 70 ? 'Critical' : (score >= 45 ? 'Medium' : 'Low');
                          return (
                            <tr key={scan.id} className="border-b border-[#E2E8F0]/40 hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => navigate(`/scan/results/${scan.id}`)}>
                              <td className="py-3.5 px-2 font-medium text-[#0F172A] flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${severity === 'Critical' ? 'bg-error' : severity === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`}></span>
                                {scan.appName}
                              </td>
                              <td className="py-3.5 px-2 text-gray-500">{scan.developer}</td>
                              <td className={`py-3.5 px-2 font-bold ${score >= 70 ? 'text-error' : score >= 45 ? 'text-[#ea580c]' : score >= 25 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>{score}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right Column: Risk Distribution & Top Threats stacked */}
              <div className="flex flex-col gap-6 h-full justify-between">
                {/* Risk Distribution */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col flex-1 min-h-[210px] justify-between">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-[#0F172A] text-lg">Risk Distribution</h3>
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="flex-grow flex items-center justify-center relative my-3">
                    <div className="relative w-36 h-36">
                      {(() => {
                        const total = stats.total || 0;
                        if (total === 0) {
                          return (
                            <>
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <defs>
                                  <linearGradient id="secureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                  </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#secureGrad)" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="10" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-[#0F172A]">100%</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Secure</span>
                              </div>
                            </>
                          );
                        }
                        const safePercent = Math.round((stats.safe / total) * 100);
                        const strokeDashoffset = 251.2 - (safePercent / 100) * 251.2;

                        return (
                          <>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <defs>
                                <linearGradient id="secureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#3B82F6" />
                                  <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                              </defs>
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#secureGrad)" strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} strokeWidth="10" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-extrabold text-[#0F172A]">{safePercent}%</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Secure</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Top Threats */}
                <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col flex-1 min-h-[210px] justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[#0F172A] text-lg">Top Threats</h3>
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <ul className="space-y-4">
                      {(() => {
                        const topThreats = [];
                        scans.forEach(scan => {
                          if (scan.detectedIssues && scan.detectedIssues.length > 0) {
                            scan.detectedIssues.forEach(issue => {
                              const title = issue.description || issue.title;
                              if (!title) return;
                              const existing = topThreats.find(t => t.title.toLowerCase() === title.toLowerCase());
                              if (existing) {
                                existing.count += 1;
                                if (!existing.apps.includes(scan.appName)) {
                                  existing.apps.push(scan.appName);
                                }
                              } else {
                                topThreats.push({
                                  title: title,
                                  count: 1,
                                  apps: [scan.appName],
                                  severity: issue.severity || 'Medium'
                                });
                              }
                            });
                          }
                        });

                        topThreats.sort((a, b) => b.count - a.count);

                        if (topThreats.length === 0) {
                          return (
                            <div className="flex items-center gap-4 py-2">
                              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                <span className="material-symbols-outlined text-2xl">shield</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-400">No active threats detected.</span>
                            </div>
                          );
                        }

                        return topThreats.slice(0, 3).map((threat, idx) => (
                          <li key={idx} className="flex gap-3 items-center">
                            <span className={`material-symbols-outlined p-2 rounded-full ${threat.severity === 'High' || threat.severity === 'Critical' ? 'text-red-500 bg-red-50' : 'text-[#F59E0B] bg-amber-50'}`}>
                              {threat.severity === 'High' || threat.severity === 'Critical' ? 'warning' : 'policy'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-xs text-[#0F172A] truncate" title={threat.title}>{threat.title}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                Detected in {threat.count} {threat.count === 1 ? 'app' : 'apps'} ({threat.apps.slice(0, 2).join(', ')}{threat.apps.length > 2 ? '...' : ''}).
                              </p>
                            </div>
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Scan App */}
        {activeTab === 'scan' && (
          <div className="py-4 space-y-5">
            {/* ΓöÇΓöÇ Hero Section with fluid art ΓöÇΓöÇ */}
            <section
              className="hero-fade-in relative overflow-hidden"
              style={{
                borderRadius: 20,
                background: '#f6f7ff',
                minHeight: 160,
                padding: '40px 44px',
                boxShadow: '0 2px 20px rgba(99,102,241,0.06)',
              }}
            >
              {/* Fluid flowing art ΓÇö right side, matches reference exactly */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '58%', overflow: 'hidden', zIndex: 0, borderRadius: '0 20px 20px 0' }}>
                {/* Soft left-to-right fade so text area stays clean */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #f6f7ff 0%, rgba(246,247,255,0.6) 20%, transparent 45%)', zIndex: 10 }} />

                {/* Base ΓÇö light periwinkle to mid-blue, NOT dark purple */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(125deg, #dde4ff 0%, #bac8ff 20%, #91a7ff 38%, #748ffc 52%, #5c7cfa 65%, #7950f2 80%, #6741d9 100%)', opacity: 0.75 }} />

                {/* Big soft wave ΓÇö upper right, light lavender highlight (the bright area in reference) */}
                <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '75%', height: '90%', background: 'radial-gradient(ellipse at 45% 45%, rgba(224,215,255,0.95) 0%, rgba(186,168,255,0.75) 30%, rgba(132,108,255,0.3) 60%, transparent 80%)', borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%', filter: 'blur(2px)', animation: 'fluidShift 10s ease-in-out infinite' }} />

                {/* Mid flowing body ΓÇö indigo/blue core wave */}
                <div style={{ position: 'absolute', top: '5%', left: '0%', width: '85%', height: '80%', background: 'radial-gradient(ellipse at 35% 60%, rgba(99,102,241,0.6) 0%, rgba(66,82,212,0.35) 40%, transparent 70%)', borderRadius: '40% 60% 35% 65% / 55% 45% 55% 45%', filter: 'blur(6px)', animation: 'fluidShift 13s ease-in-out infinite reverse' }} />

                {/* Bottom deep violet ΓÇö gives depth like reference */}
                <div style={{ position: 'absolute', bottom: '-10%', right: '0%', width: '65%', height: '55%', background: 'radial-gradient(ellipse at 55% 50%, rgba(103,65,217,0.7) 0%, rgba(79,44,180,0.4) 40%, transparent 70%)', borderRadius: '50% 50% 50% 50%', filter: 'blur(8px)', animation: 'fluidShift 10s ease-in-out infinite' }} />

                {/* Ribbon wave ΓÇö flowing across the middle like silk */}
                <div style={{ position: 'absolute', top: '25%', left: '10%', width: '90%', height: '45%', background: 'linear-gradient(110deg, rgba(165,148,255,0.4) 0%, rgba(99,102,241,0.5) 40%, rgba(118,89,234,0.35) 70%, transparent 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(5px)', transform: 'rotate(-8deg)', animation: 'fluidShift 15s ease-in-out infinite reverse' }} />

                {/* White shine ΓÇö top right corner glow like reference */}
                <div style={{ position: 'absolute', top: '5%', right: '5%', width: '30%', height: '40%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, rgba(220,215,255,0.25) 50%, transparent 70%)', borderRadius: '50%', filter: 'blur(6px)' }} />

                {/* Sparkle dots */}
                <div style={{ position: 'absolute', top: '42%', left: '30%', width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 8px 2px rgba(255,255,255,0.7)' }} />
                <div style={{ position: 'absolute', top: '20%', left: '52%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
                <div style={{ position: 'absolute', top: '65%', left: '42%', width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
                <div style={{ position: 'absolute', top: '30%', left: '72%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 0 5px rgba(255,255,255,0.6)' }} />
                <div style={{ position: 'absolute', top: '55%', left: '62%', width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }} />
              </div>

              {/* Text content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 10 }}>
                  Welcome back
                </h1>
                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 400, lineHeight: 1.5 }}>
                  Scan. Analyze. Protect. Stay ahead of investment fraud.
                </p>
              </div>
            </section>

            {/* ΓöÇΓöÇ Four Scan Cards ΓöÇΓöÇ */}
            <section className="relative z-10">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

                {/* Card 1: Play Store Analysis */}
                <div
                  style={{ background: '#ffffff', border: '1px solid #e8edf8', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '22px 20px 20px', cursor: 'pointer', minHeight: 420, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e8edf8'; }}
                  onClick={() => navigate('/scan/playstore')}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 18 }}>1</div>
                  <div style={{ width: 80, height: 80, borderRadius: 18, background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOGSyt_n_Qp_53G-OO77YHuzlMq7ERegvmi11efO0AvSEu6Ubi_URpl69LiciaDKYpvgfX-NvsSByxnjoq5vVY8xEjn_ElQ0ZQXudJRf7sgRuF7JnVXbQzwZmuTqH0AGOa3IMSnhCajpI7z5aD51bJYLoDX1di3bJEqnChHcUMVJQbQ6w9b-wWkPB5P9UYVYjwIS9e31gPH1IejN_tfdDyNfU7fdz5_wyTCfWXaWpSas3AJaBA5PfSREnddxkl0zDFic2GxsEUCT2czw" alt="Play Store" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 7, letterSpacing: '-0.01em' }}>Play Store Analysis</h3>
                  <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.55, flex: 1, marginBottom: 16 }}>Paste a Play Store link to fetch details and analyze behavioral signatures.</p>
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/scan/playstore'); }}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 50, fontSize: 13, fontWeight: 600, border: '1.5px solid #6366f1', color: '#6366f1', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.background = '#6366f1'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#6366f1'; }}
                  >Analyze App ΓåÆ</button>
                </div>

                {/* Card 2: Manual Verification */}
                <div
                  style={{ background: '#ffffff', border: '1px solid #e8edf8', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '22px 20px 20px', cursor: 'pointer', minHeight: 420, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e8edf8'; }}
                  onClick={() => navigate('/scan/manual')}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 18 }}>2</div>
                  <div style={{ width: 80, height: 80, borderRadius: 18, background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#3b82f6' }}>edit_note</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 7, letterSpacing: '-0.01em' }}>Manual Verification</h3>
                  <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.55, flex: 1, marginBottom: 16 }}>Enter app name and description manually to scan for fraudulent indicators.</p>
                  <button
                    style={{ width: '100%', padding: '9px 0', borderRadius: 50, fontSize: 13, fontWeight: 600, border: '1.5px solid #3b82f6', color: '#3b82f6', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.background = '#3b82f6'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#3b82f6'; }}
                    onClick={() => navigate('/scan/manual')}
                  >Analyze Manually ΓåÆ</button>
                </div>

                {/* Card 3: APK Security Scanner */}
                <div
                  style={{ background: '#ffffff', border: '1px solid #e8edf8', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '22px 20px 20px', cursor: 'pointer', minHeight: 420, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e8edf8'; }}
                  onClick={() => navigate('/scan/apk')}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 18 }}>3</div>
                  <div style={{ width: 80, height: 80, borderRadius: 18, background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#14b8a6' }}>android</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 7, letterSpacing: '-0.01em' }}>APK Security Scanner</h3>
                  <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.55, flex: 1, marginBottom: 16 }}>Upload APK file to scan for obfuscated payloads and permissions.</p>
                  <button
                    style={{ width: '100%', padding: '9px 0', borderRadius: 50, fontSize: 13, fontWeight: 600, border: '1.5px solid #14b8a6', color: '#14b8a6', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.background = '#14b8a6'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#14b8a6'; }}
                    onClick={() => navigate('/scan/apk')}
                  >Upload &amp; Scan ΓåÆ</button>
                </div>

                {/* Card 4: Website Analyzer */}
                <div
                  style={{ background: '#ffffff', border: '1px solid #e8edf8', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '22px 20px 20px', cursor: 'pointer', minHeight: 420, transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e8edf8'; }}
                  onClick={() => navigate('/scan/website')}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 18 }}>4</div>
                  <div style={{ width: 80, height: 80, borderRadius: 18, background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#d97706' }}>language</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 7, letterSpacing: '-0.01em' }}>Website Analyzer</h3>
                  <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.55, flex: 1, marginBottom: 16 }}>Analyze URLs for phishing, scam patterns, and fake investment setups.</p>
                  <button
                    style={{ width: '100%', padding: '9px 0', borderRadius: 50, fontSize: 13, fontWeight: 600, border: '1.5px solid #f59e0b', color: '#d97706', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.background = '#f59e0b'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#d97706'; }}
                    onClick={() => navigate('/scan/website')}
                  >Analyze Website ΓåÆ</button>
                </div>

              </div>
            </section>

            {/* Scan Progress */}
            {isScanning && (
              <div className="max-w-2xl mx-auto mt-6 glass-card rounded-xl p-6 flex flex-col items-center">
                <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg scan-pulse"></div>
                  <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                    <span className="material-symbols-outlined text-primary text-3xl">aod</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-primary/30 orbiting-element" style={{ animationDuration: '3s' }}></div>
                </div>
                <div className="w-full text-center">
                  <div className="flex justify-between items-end mb-2 text-xs">
                    <span className="text-primary font-bold">{scanStatus}</span>
                    <span className="text-on-surface-variant">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-outline mt-2">{scanDetail}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 4: About Us */}
        {activeTab === 'about' && (
          <div className="py-6 space-y-12 relative overflow-hidden">
            {/* Spacecloud Ambient Elements for About Us page */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
              <div className="absolute top-[5%] left-[20%] w-[380px] h-[380px] rounded-full bg-[#4e8cff]/5 blur-[110px]" />
              <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#7a5cff]/5 blur-[100px]" />

              {/* Shield logo watermark outline in top right */}
              <div className="absolute top-[5%] right-[5%] opacity-[0.03] select-none text-[#1b2e6f]">
                <svg width="220" height="250" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                </svg>
              </div>

              {/* Grid dots decoration */}
              <div className="absolute left-[3%] top-[12%] opacity-[0.2] flex gap-1.5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)' }}>
                {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#4e8cff]" />)}
              </div>
              <div className="absolute right-[3%] bottom-[35%] opacity-[0.2] flex gap-1.5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)' }}>
                {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#7a5cff]" />)}
              </div>
            </div>

            {/* Header / Hero */}
            <div className="text-center space-y-5 max-w-3xl mx-auto relative z-10 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/80 bg-white/70 shadow-sm">
                <span className="material-symbols-outlined text-[#4e8cff] text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <span className="text-[10px] text-[#1b2e6f] font-extrabold uppercase tracking-widest">About SentinelAI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#1b2e6f] tracking-tight">
                Unmasking Fake Apps. <br />
                <span className="bg-gradient-to-r from-[#4e8cff] to-[#7a5cff] bg-clip-text text-transparent">Securing Real Trust.</span>
              </h1>
              <div
                className="max-w-xl mx-auto rounded-2xl p-4 border border-[#4e8cff]/15 bg-gradient-to-r from-white/70 to-[#def2fa]/30"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: '#7a5cff',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <p className="text-xs text-slate-500 font-medium italic">
                  "Protecting users from digital investment scams through intelligent threat detection and risk analysis."
                </p>
              </div>
            </div>

            {/* Features section (Our Platform & Our Mission) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10">
              {/* Card 1: Our Platform */}
              <div
                className="rounded-[2rem] p-8 border border-white/80 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 min-h-[220px]"
                style={{
                  background: 'linear-gradient(135deg, #F5F7FF 0%, #EBF0FF 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Loop Arrow Watermark (Top Right) */}
                <div className="absolute -top-10 -right-10 w-40 h-40 opacity-[0.035] pointer-events-none select-none text-[#1b2e6f]">
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>

                {/* Grid Dots decoration (Bottom Left) */}
                <div className="absolute bottom-5 left-5 opacity-[0.04] pointer-events-none select-none text-[#1b2e6f]">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)', gap: '4px' }}>
                    {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-current" />)}
                  </div>
                </div>

                {/* Floating circles decoration */}
                <div className="absolute top-[20%] left-[80%] w-2 h-2 rounded-full bg-[#1b2e6f]/5 blur-[0.5px]"></div>
                <div className="absolute bottom-[30%] right-[70%] w-3.5 h-3.5 rounded-full bg-[#1b2e6f]/4 blur-[1px]"></div>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#4e8cff]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#4e8cff] text-xl">shield</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1b2e6f]">Our Platform</h3>
                      <div className="w-8 h-0.5 bg-[#4e8cff] mt-1 rounded-full" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed space-y-3 font-medium">
                    <p>
                      <strong className="text-[#1b2e6f]">SentinelAI</strong> is an AI-powered cybersecurity platform designed to detect fake investment applications, fraudulent websites, and suspicious APK files.
                    </p>
                    <p>
                      By analyzing app details, descriptions, developer information, and security indicators, SentinelAI helps users identify potential threats before they become <strong className="text-[#7a5cff]">victims of financial fraud</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Our Mission */}
              <div
                className="rounded-[2rem] p-8 border border-white/80 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 min-h-[220px]"
                style={{
                  background: 'linear-gradient(135deg, #F5F7FF 0%, #EBF0FF 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Loop Arrow Watermark (Top Right) */}
                <div className="absolute -top-10 -right-10 w-40 h-40 opacity-[0.035] pointer-events-none select-none text-[#1b2e6f]">
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>

                {/* Grid Dots decoration (Bottom Left) */}
                <div className="absolute bottom-5 left-5 opacity-[0.04] pointer-events-none select-none text-[#1b2e6f]">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)', gap: '4px' }}>
                    {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-current" />)}
                  </div>
                </div>

                {/* Floating circles decoration */}
                <div className="absolute top-[20%] left-[80%] w-2 h-2 rounded-full bg-[#1b2e6f]/5 blur-[0.5px]"></div>
                <div className="absolute bottom-[30%] right-[70%] w-3.5 h-3.5 rounded-full bg-[#1b2e6f]/4 blur-[1px]"></div>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#7a5cff]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#7a5cff] text-xl font-bold">track_changes</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1b2e6f]">Our Mission</h3>
                      <div className="w-8 h-0.5 bg-[#7a5cff] mt-1 rounded-full" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed font-medium">
                    <p className="mt-2">
                      To create a safer digital ecosystem by helping users verify apps, websites, and financial platforms before trusting them with their hard-earned assets and data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meet the Team */}
            <div className="space-y-8 relative z-10 mt-12">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-extrabold text-[#1b2e6f] text-center">Meet the Team</h2>
                <div className="flex gap-1.5 items-center mt-2.5">
                  <div className="w-8 h-0.5 bg-[#4e8cff] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-[#7a5cff] rounded-full" />
                  <div className="w-8 h-0.5 bg-[#4e8cff] rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Team member 1: Vishal Kumar Singh */}
                <div
                  className="rounded-[2rem] p-8 text-center space-y-4 border border-white/80 group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F5F7FF 0%, #EBF0FF 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Loop Arrow Watermark (Top Right) */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 opacity-[0.03] pointer-events-none select-none text-[#1b2e6f]">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>

                  {/* Grid Dots decoration (Bottom Left) */}
                  <div className="absolute bottom-4 left-4 opacity-[0.04] pointer-events-none select-none text-[#1b2e6f]">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)', gap: '4px' }}>
                      {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-current" />)}
                    </div>
                  </div>

                  <div className="relative w-20 h-20 mx-auto z-10">
                    <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#4e8cff]/20 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-md relative z-10">
                      <img src={vishalImg} alt="Vishal Kumar Singh" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#4e8cff] rounded-full flex items-center justify-center border-2 border-white z-20">
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-base font-bold text-[#1b2e6f]">Vishal Kumar Singh</h4>
                    <div className="w-6 h-0.5 bg-[#4e8cff] mx-auto mt-2 rounded-full" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-[#4e8cff] font-bold text-xs uppercase tracking-wider">Backend Developer</p>
                    <p className="text-[10px] text-slate-400 font-semibold">AI Integration • Deployment</p>
                  </div>
                  <div className="pt-2 relative z-10">
                    <a href="#" className="w-8 h-8 rounded-full bg-white/80 hover:bg-[#4e8cff]/10 text-slate-400 hover:text-[#4e8cff] inline-flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  </div>
                </div>

                {/* Team member 2: Ajay Raj */}
                <div
                  className="rounded-[2rem] p-8 text-center space-y-4 border border-white/80 group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F5F7FF 0%, #EBF0FF 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Loop Arrow Watermark */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 opacity-[0.03] pointer-events-none select-none text-[#1b2e6f]">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  {/* Grid Dots */}
                  <div className="absolute bottom-4 left-4 opacity-[0.04] pointer-events-none select-none text-[#1b2e6f]">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)', gap: '4px' }}>
                      {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-current" />)}
                    </div>
                  </div>
                  <div className="relative w-20 h-20 mx-auto z-10">
                    <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#7a5cff]/20 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-md relative z-10">
                      <img src={ajayImg} alt="Ajay Raj" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#7a5cff] rounded-full flex items-center justify-center border-2 border-white z-20">
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-base font-bold text-[#1b2e6f]">Ajay Raj</h4>
                    <div className="w-6 h-0.5 bg-[#7a5cff] mx-auto mt-2 rounded-full" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-[#7a5cff] font-bold text-xs uppercase tracking-wider">Frontend Engineer</p>
                    <p className="text-[10px] text-slate-400 font-semibold">UI/UX • Component Architecture</p>
                  </div>
                  <div className="pt-2 relative z-10">
                    <a href="#" className="w-8 h-8 rounded-full bg-white/80 hover:bg-[#7a5cff]/10 text-slate-400 hover:text-[#7a5cff] inline-flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </div>

                {/* Team member 3: Prachi Phadke */}
                <div
                  className="rounded-[2rem] p-8 text-center space-y-4 border border-white/80 group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F5F7FF 0%, #EBF0FF 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Loop Arrow Watermark */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 opacity-[0.03] pointer-events-none select-none text-[#1b2e6f]">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  {/* Grid Dots */}
                  <div className="absolute bottom-4 left-4 opacity-[0.04] pointer-events-none select-none text-[#1b2e6f]">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 3px)', gap: '4px' }}>
                      {[...Array(25)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-current" />)}
                    </div>
                  </div>
                  <div className="relative w-20 h-20 mx-auto z-10">
                    <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#7a5cff]/20 group-hover:rotate-45 transition-transform duration-700" />
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-md relative z-10">
                      <img src={prachiImg} alt="Prachi Phadke" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#7a5cff] rounded-full flex items-center justify-center border-2 border-white z-20">
                      <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-base font-bold text-[#1b2e6f]">Prachi Phadke</h4>
                    <div className="w-6 h-0.5 bg-[#7a5cff] mx-auto mt-2 rounded-full" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-[#7a5cff] font-bold text-xs uppercase tracking-wider">Project Manager</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Spokesperson • Strategy Lead</p>
                  </div>
                  <div className="pt-2 relative z-10">
                    <a href="#" className="w-8 h-8 rounded-full bg-white/80 hover:bg-[#7a5cff]/10 text-slate-400 hover:text-[#7a5cff] inline-flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                </div>

              </div>{/* end team grid */}
            </div>{/* end Meet the Team section */}
          </div>
        )}{/* end activeTab === 'about' */}

        {/* View 5: Flagged Apps */}
        {activeTab === 'flagged' && (
          <div className="py-6 space-y-8 relative">

            {/* Toolbar (Search & Filter) */}
            <div
              className="p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center justify-between w-full relative overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)',
              }}
            >
              {/* Abstract flowing mesh graphic behind filters */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-30 pointer-events-none z-0" style={{ overflow: 'hidden' }}>
                <svg viewBox="0 0 200 100" fill="none" className="w-full h-full transform translate-x-12 translate-y-4">
                  <path d="M0 80 C 50 30, 80 90, 130 40 C 180 -10, 190 60, 250 10" stroke="url(#meshGrad)" strokeWidth="4" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5B7FFF" />
                      <stop offset="100%" stopColor="#7A5CFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Search pill */}
              <div className="relative flex-grow max-w-xl w-full z-10">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full pl-13 pr-5 py-3.5 rounded-full bg-white/70 border border-slate-200/80 outline-none transition-all text-slate-700 placeholder-slate-400"
                  style={{ fontSize: 14.5, boxShadow: 'inset 0 2px 4px rgba(99,102,241,0.02)' }}
                  placeholder="Search by app name or developer..."
                  type="text"
                  onFocus={e => e.target.style.borderColor = '#5B7FFF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)'}
                />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end z-10">
                <div className="relative">
                  <select
                    style={{ border: '1.5px solid rgba(99, 102, 241, 0.15)', background: 'rgba(255, 255, 255, 0.8)' }}
                    className="appearance-none px-6 py-2.5 pr-10 rounded-full text-sm font-semibold text-[#1B2E6F] outline-none cursor-pointer hover:border-[#5B7FFF] transition-all"
                  >
                    <option>All Risk Levels</option>
                    <option>Critical Only</option>
                    <option>High Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#1B2E6F] pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                </div>
                <div className="relative hidden sm:block">
                  <select
                    defaultValue="Fake Investment Apps"
                    style={{ border: '1.5px solid rgba(99, 102, 241, 0.15)', background: 'rgba(255, 255, 255, 0.8)' }}
                    className="appearance-none px-6 py-2.5 pr-10 rounded-full text-sm font-semibold text-[#1B2E6F] outline-none cursor-pointer hover:border-[#5B7FFF] transition-all"
                  >
                    <option>All Categories</option>
                    <option>Fake Investment Apps</option>
                    <option>Social Media</option>
                    <option>Utilities</option>
                    <option>Games</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#1B2E6F] pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                </div>
              </div>
            </div>

            {/* Bento Grid List / Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full flex-grow relative z-10">
              {flaggedApps.length === 0 ? (
                /* Premium Hero Empty State */
                <div
                  className="col-span-full py-16 px-6 text-center rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center border border-white/90"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(222, 242, 250, 0.4) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(99, 102, 241, 0.05)',
                  }}
                >
                  {/* Decorative faint typography SAFE */}
                  <div
                    className="absolute inset-0 flex items-center justify-center select-none pointer-events-none font-sans font-black tracking-widest opacity-[0.04]"
                    style={{ fontSize: '18vw', color: '#1B2E6F', zIndex: 0 }}
                  >
                    SAFE
                  </div>

                  {/* Tiny grid decoration in corner */}
                  <div className="absolute right-8 bottom-8 opacity-25 pointer-events-none" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 4px)', gap: '6px' }}>
                    {[...Array(25)].map((_, i) => <div key={i} className="w-[4px] h-[4px] rounded-full bg-[#5B7FFF]" />)}
                  </div>

                  {/* Small floating decorative dots */}
                  <div style={{ position: 'absolute', top: '15%', left: '20%', width: 6, height: 6, borderRadius: '50%', background: '#5B7FFF', opacity: 0.3 }} />
                  <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: 8, height: 8, borderRadius: '50%', background: '#7A5CFF', opacity: 0.2 }} />
                  <div style={{ position: 'absolute', top: '25%', right: '22%', width: 5, height: 5, borderRadius: '50%', background: '#7A5CFF', opacity: 0.3 }} />

                  {/* Center aligned security shield illustration */}
                  <div className="relative w-24 h-24 mb-6 flex items-center justify-center z-10">
                    <div className="absolute inset-0 bg-[#5B7FFF]/10 rounded-full blur-xl animate-pulse" />
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#5B7FFF]/20 flex items-center justify-center shadow-md relative z-10">
                      <span className="material-symbols-outlined text-[#5B7FFF] text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-[#1B2E6F] mb-2 z-10">No flagged threats detected</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed z-10">
                    Your scan history is clean. No suspicious applications have been detected.
                  </p>
                </div>
              ) : (
                flaggedApps.map((scan) => {
                  const score = scan.threatScore !== undefined ? scan.threatScore : (scan.riskScore || 0);
                  const level = score >= 75 ? 'Critical' : 'High';
                  const isCritical = level === 'Critical';
                  return (
                    <div
                      key={scan.id}
                      className="rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full border border-white/60"
                      style={{
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.04)',
                      }}
                    >
                      <div className={`absolute -top-10 -right-10 w-32 h-32 ${isCritical ? 'bg-error/10 group-hover:bg-error/20' : 'bg-[#ea580c]/10 group-hover:bg-[#ea580c]/20'} rounded-full blur-2xl transition-colors`}></div>
                      <div className="flex justify-between items-start mb-6 z-10 w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                            {scan.type === 'apk' ? (
                              <span className="material-symbols-outlined text-secondary text-3xl">android</span>
                            ) : scan.type === 'website' ? (
                              <span className="material-symbols-outlined text-[#E67E22] text-3xl">language</span>
                            ) : (
                              <span className="material-symbols-outlined text-primary text-3xl">shop</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-[#1B2E6F] truncate">{scan.appName}</h3>
                            <p className="font-body-md text-sm text-slate-500 truncate">{scan.developer}</p>
                          </div>
                        </div>
                        <span className={`${isCritical ? 'risk-badge-critical' : 'risk-badge-high'} font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0`}>
                          <span className="material-symbols-outlined text-[14px]">{isCritical ? 'dangerous' : 'warning'}</span> {level.toUpperCase()}
                        </span>
                      </div>
                      <div className="mb-6 z-10 w-full flex-grow">
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-body-md text-sm text-slate-500">Threat Score</span>
                          <span className={`font-title-lg text-2xl font-bold ${isCritical ? 'text-error' : 'text-[#ea580c]'}`}>{score}<span className="text-sm font-normal text-slate-400">/100</span></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className={`${isCritical ? 'bg-error' : 'bg-[#ea580c]'} h-2 rounded-full`} style={{ width: `${score}%` }}></div>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {(scan.detectedIssues || []).slice(0, 2).map((issue, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-500 truncate max-w-[150px]" title={issue.description || issue.title}>
                              {issue.title || issue.description}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => navigate(`/scan/results/${scan.id}`)} className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-[#1B2E6F] font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                        View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Load More Button - Premium Floating CTA */}
            <div className="mt-12 pb-12 flex justify-center w-full relative z-10">
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(99, 102, 241, 0.15)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.04)',
                }}
                className="px-8 py-3 rounded-full text-sm font-bold text-[#1B2E6F] flex items-center gap-2 cursor-pointer hover:scale-[1.03] hover:shadow-lg"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#5B7FFF';
                  const arrow = e.currentTarget.querySelector('.material-symbols-outlined');
                  if (arrow) arrow.style.transform = 'translateY(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
                  const arrow = e.currentTarget.querySelector('.material-symbols-outlined');
                  if (arrow) arrow.style.transform = '';
                }}
              >
                Load More
                <span className="material-symbols-outlined transition-transform duration-200">expand_more</span>
              </button>
            </div>
          </div>
        )}

        {/* View: Threat Intelligence */}
        {activeTab === 'threats' && (
          <div className="py-6 space-y-8 relative">
            {/* Ambient background glows & Enlarged spacecloud mesh wave pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
              <div className="absolute top-[10%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#5b7fff]/6 blur-[110px]" />
              <div className="absolute bottom-[5%] left-[10%] w-[350px] h-[350px] rounded-full bg-[#7a5cff]/5 blur-[100px]" />

              {/* Enlarged Spacecloud Mesh Wave Pattern (background overlay, spanning right side) */}
              <div className="absolute top-[2%] right-[-15%] w-[80%] h-[320px] opacity-[0.25]">
                <svg viewBox="0 0 500 150" fill="none" className="w-full h-full">
                  <path d="M20 90 C 130 30, 200 120, 320 50 C 440 -20, 410 120, 560 50" stroke="url(#intelMeshGradBig)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M20 100 C 120 40, 190 130, 310 60 C 430 -10, 400 130, 550 60" stroke="url(#intelMeshGradBig)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                  <defs>
                    <linearGradient id="intelMeshGradBig" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5b7fff" />
                      <stop offset="100%" stopColor="#7a5cff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full relative z-10 pr-8 pb-4">
              <div className="flex items-start gap-4">
                {/* Thin vertical gradient accent line */}
                <div style={{ width: '4px', height: '56px', background: 'linear-gradient(180deg, #5b7fff 0%, #7a5cff 100%)', borderRadius: '4px' }} className="shrink-0" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#1b2e6f] tracking-tight">Threat Intelligence</h1>
                  <p className="text-sm text-slate-500 mt-1">AI-powered insights into fake investment app activity, impersonation trends, and fraud patterns.</p>
                </div>
              </div>
            </div>

            {/* Redesigned Metric KPI Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
              {/* Card 1: High Risk */}
              <div
                className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                  </div>
                  <span className="flex items-center text-red-500 font-semibold bg-red-500/10 px-3 py-1 rounded-full text-[11px]">
                    <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span> Active
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk Entities</h3>
                  <p className="text-3xl font-extrabold text-[#1b2e6f] mt-1">{(stats.high || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Card 2: Medium Risk */}
              <div
                className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-[#7a5cff]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#7a5cff] text-2xl">shield</span>
                  </div>
                  <span className="flex items-center text-[#7a5cff] font-semibold bg-[#7a5cff]/10 px-3 py-1 rounded-full text-[11px]">
                    <span className="material-symbols-outlined text-[12px] mr-1">arrow_forward</span> Monitor
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medium Risk</h3>
                  <p className="text-3xl font-extrabold text-[#1b2e6f] mt-1">{(stats.medium || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Card 3: Newly Detected */}
              <div
                className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-[#5b7fff]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#5b7fff] text-2xl">fiber_new</span>
                  </div>
                  <span className="flex items-center text-[#5b7fff] font-semibold bg-[#5b7fff]/10 px-3 py-1 rounded-full text-[11px]">
                    <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span> Live
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Newly Detected (24h)</h3>
                  <p className="text-3xl font-extrabold text-[#1b2e6f] mt-1">
                    {(() => {
                      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return scans.filter(s => new Date(s.timestamp) > oneDayAgo).length.toLocaleString();
                    })()}
                  </p>
                </div>
              </div>

              {/* Card 4: Brands Under Attack */}
              <div
                className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-[#14b8a6]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#14b8a6] text-2xl">domain</span>
                  </div>
                  <span className="flex items-center text-[#14b8a6] font-semibold bg-[#14b8a6]/10 px-3 py-1 rounded-full text-[11px]">
                    <span className="material-symbols-outlined text-[12px] mr-1">track_changes</span> Target
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brands Under Attack</h3>
                  <p className="text-3xl font-extrabold text-[#1b2e6f] mt-1">
                    {(() => {
                      const suspiciousApps = scans.filter(s => {
                        const score = s.threatScore !== undefined ? s.threatScore : (s.riskScore || 0);
                        return score >= 30;
                      });
                      const uniqueBrands = new Set(suspiciousApps.map(s => s.appName ? s.appName.split(':')[0].split(' ')[0].trim() : 'Unknown'));
                      return uniqueBrands.size.toLocaleString();
                    })()}
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Redesigned Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Left Column: Risk Taxonomy + Vector Analysis */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Risk Taxonomy Donut Card */}
                <section
                  className="glass-panel rounded-[2rem] p-6 flex flex-col items-center gap-6"
                >
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-base font-bold text-[#1b2e6f]">Risk Taxonomy</h2>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
                  </div>

                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {(() => {
                      const total = stats.total || 0;
                      if (total === 0) {
                        return (
                          <>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="8" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-extrabold text-[#1b2e6f]">0</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL</span>
                            </div>
                          </>
                        );
                      }
                      const safePercent = (stats.safe / total) * 100;
                      const mediumPercent = (stats.medium / total) * 100;
                      const highPercent = (stats.high / total) * 100;

                      return (
                        <>
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* High */}
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#EF4444" strokeDasharray="251.2" strokeDashoffset={0} strokeWidth="8" />
                            {/* Medium */}
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#7a5cff" strokeDasharray="251.2" strokeDashoffset={(highPercent / 100) * 251.2} strokeWidth="8" />
                            {/* Safe */}
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#06B6D4" strokeDasharray="251.2" strokeDashoffset={((highPercent + mediumPercent) / 100) * 251.2} strokeWidth="8" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold text-[#1b2e6f]">{total}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="w-full flex justify-center gap-4 border-t border-slate-100 pt-4">
                    <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span>High</span>
                    <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#7a5cff] mr-1.5"></span>Medium</span>
                    <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] mr-1.5"></span>Safe</span>
                  </div>
                </section>

                {/* Vector Analysis Card */}
                <section
                  className="glass-panel rounded-[2rem] p-6 flex flex-col gap-6"
                >
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-base font-bold text-[#1b2e6f]">Vector Analysis</h2>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
                  </div>

                  <div className="flex flex-col gap-5 justify-center flex-grow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#5b7fff]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#5b7fff] text-xl">image</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                          <h4 className="text-sm font-bold text-slate-700">Icon Similarity</h4>
                          <span className="text-sm font-extrabold text-[#5b7fff]">82%</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Primary visual vector</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                          <div className="bg-[#5b7fff] h-1.5 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="w-10 h-10 rounded-xl bg-[#7a5cff]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#7a5cff] text-xl">text_fields</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                          <h4 className="text-sm font-bold text-slate-700">Name Cloning</h4>
                          <span className="text-sm font-extrabold text-[#7a5cff]">64%</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Lexical resemblance</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                          <div className="bg-[#7a5cff] h-1.5 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Most Targeted Brands */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <section
                  className="glass-panel rounded-[2rem] p-6 flex flex-col gap-6 h-full justify-between"
                >
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-base font-bold text-[#1b2e6f]">Most Targeted Brands</h2>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
                  </div>

                  <div className="flex flex-col gap-4 flex-grow justify-center mt-2">
                    {(() => {
                      const brandAttackCounts = {};
                      scans.forEach(scan => {
                        const score = scan.threatScore !== undefined ? scan.threatScore : (scan.riskScore || 0);
                        if (score >= 30) {
                          const brand = scan.appName ? scan.appName.split(':')[0].split(' ')[0].trim() : 'Unknown';
                          brandAttackCounts[brand] = (brandAttackCounts[brand] || 0) + 1;
                        }
                      });
                      const sortedBrands = Object.entries(brandAttackCounts)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count);

                      const totalThreatScans = sortedBrands.reduce((sum, b) => sum + b.count, 0) || 1;

                      if (sortedBrands.length === 0) {
                        return <div className="text-sm text-slate-400 py-4 text-center">No targeted brands recorded in history.</div>;
                      }

                      return sortedBrands.slice(0, 3).map((brand, idx) => {
                        const percent = Math.round((brand.count / totalThreatScans) * 100);
                        return (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-sm font-semibold text-slate-700 truncate max-w-[140px]" title={brand.name}>{brand.name}</span>
                              <span className="text-xs font-extrabold text-[#5b7fff]">{percent}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#5b7fff] to-[#7a5cff]" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Subtle dots grid decoration inside targeted brands container */}
                  <div className="flex justify-end opacity-20 mt-4 pointer-events-none">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 3px)', gap: '5px' }}>
                      {[...Array(24)].map((_, i) => <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#5b7fff]" />)}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* View: Play Store Scanner */}
        {activeTab === 'scan-playstore' && <PlayStoreAnalysis />}

        {/* View: Manual Verification */}
        {activeTab === 'scan-manual' && <ManualVerification />}

        {/* View: APK Scanner */}
        {activeTab === 'scan-apk' && <APKScanner />}

        {/* View: Website Analyzer */}
        {activeTab === 'scan-website' && <WebsiteAnalyzer />}

        {/* View: Scan Results */}
        {activeTab === 'scan-results' && (
          <div className="py-6">
            <ScanResults
              result={currentResult}
              onScanAgain={() => {
                if (currentResult?.type === 'playstore') {
                  navigate('/scan/playstore');
                } else if (currentResult?.type === 'manual') {
                  navigate('/scan/manual');
                } else if (currentResult?.type === 'apk') {
                  navigate('/scan/apk');
                } else if (currentResult?.type === 'website') {
                  navigate('/scan/website');
                } else {
                  navigate('/scan-app');
                }
              }}
              onBack={() => navigate('/scan-app')}
            />
          </div>
        )}

        {/* View: Scan History */}
        {activeTab === 'history' && <ScanHistory />}
      </main>
    </div>
  );
};

export default SentinelAIDashboard;
