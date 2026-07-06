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
              <span className="material-symbols-outlined">analytics</span>Flagged Threats
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
          <div className="py-6">
            <header className="mb-stack-xl flex justify-between items-end">
              <div>
                <h2 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface">Overview</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Real-time threat intelligence and system metrics.</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button className="bg-white border border-[#E2E8F0] text-[#1A38B0] font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm z-10 cursor-pointer">
                  <span className="material-symbols-outlined text-lg">download</span> Export Report
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Total Apps Scanned</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(2400000 + scans.length).toLocaleString()}+</div>
                <div className="text-tertiary text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> +12% this week
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">High Risk</span>
                <div className="text-2xl font-bold text-error mb-1">{(12800 + stats.highRisk).toLocaleString()}</div>
                <div className="text-outline text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span> Action Required
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Medium Risk</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(25700 + stats.medium).toLocaleString()}</div>
                <div className="text-outline text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span> Under Review
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Safe Apps</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(2361500 + stats.safe).toLocaleString()}+</div>
                <div className="text-[#10B981] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Verified Secure
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Medium Risk</span>
                <div className="text-3xl font-bold text-[#0F172A] mt-1 mb-2">{(stats.medium || 0).toLocaleString()}</div>
                <div className="text-blue-500 text-xs font-semibold flex items-center gap-1.5 mt-auto">
                  <span className="material-symbols-outlined text-sm">info</span> Under Review
                </div>
              </div>

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel rounded-xl p-6 flex flex-col h-[350px]">
                  <h3 className="font-bold text-on-surface mb-4">Risk Distribution</h3>
                  <div className="flex-grow flex items-center justify-center relative">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#10B981" strokeDasharray="251.2" strokeDashoffset="50" strokeWidth="10" />
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#F59E0B" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="10" />
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#ba1a1a" strokeDasharray="251.2" strokeDashoffset="230" strokeWidth="10" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-on-surface">92%</span>
                        <span className="text-xs text-outline font-medium uppercase tracking-widest">Secure</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-6">
                  <h3 className="font-bold text-on-surface mb-4">Recent Scans</h3>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/50">
                        <th className="py-2 px-2 text-outline">App</th>
                        <th className="py-2 px-2 text-outline">Developer</th>
                        <th className="py-2 px-2 text-outline">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.slice(0, 5).map((scan) => (
                        <tr key={scan.id} className="border-b border-outline-variant/20 hover:bg-black/5 transition-colors cursor-pointer" onClick={() => navigate(`/scan/results/${scan.id}`)}>
                          <td className="py-3 px-2 font-medium flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${scan.riskLevel === 'Critical' || scan.riskLevel === 'High' ? 'bg-error' : scan.riskLevel === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`}></span>
                            {scan.appName}
                          </td>
                          <td className="py-3 px-2 text-on-surface-variant">{scan.developer}</td>
                          <td className={`py-3 px-2 font-bold ${scan.riskScore >= 70 ? 'text-error' : scan.riskScore >= 50 ? 'text-[#ea580c]' : scan.riskScore >= 25 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>{scan.riskScore}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-outline-variant/20">
                        <td className="py-3 px-2 font-medium">Nexus Sync</td>
                        <td className="py-3 px-2 text-on-surface-variant">OmniCorp</td>
                        <td className="py-3 px-2 text-error font-bold">85</td>
                      </tr>
                      <tr className="border-b border-outline-variant/20">
                        <td className="py-3 px-2 font-medium">Aether Drive</td>
                        <td className="py-3 px-2 text-on-surface-variant">CloudSys Ltd</td>
                        <td className="py-3 px-2 text-[#F59E0B] font-bold">42</td>
                      </tr>
                      <tr className="border-b border-outline-variant/20">
                        <td className="py-3 px-2 font-medium">PayStream</td>
                        <td className="py-3 px-2 text-on-surface-variant">FinTech Global</td>
                        <td className="py-3 px-2 text-[#10B981] font-bold">12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="font-bold text-on-surface mb-4">Top Threats</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <div>
                        <h4 className="font-medium text-xs">Zero-Day Payload</h4>
                        <p className="text-[10px] text-on-surface-variant">Detected in 4 apps across 2 distinct developers.</p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-[#F59E0B]">policy</span>
                      <div>
                        <h4 className="font-medium text-xs">Data Exfiltration Routine</h4>
                        <p className="text-[10px] text-on-surface-variant">Suspicious background activity pattern identified.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Scan App */}
        {activeTab === 'scan' && (
          <div className="py-6 space-y-6">
            <section className="hero-fade-in relative overflow-hidden pt-4 pb-4">
              <div className="watermark-text absolute left-[-5%] top-[10%] font-bold text-primary/5">SCAN</div>
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex-grow text-left">
                  <h1 className="text-3xl font-bold text-on-surface mb-1">Welcome back</h1>
                  <p className="text-sm text-[#6B7280]">Scan. Analyze. Protect. Stay ahead of investment fraud.</p>
                </div>
              </div>
            </section>

            <section className="relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between h-56 transition-all hover:border-tertiary/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs">1</div>
                        <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOGSyt_n_Qp_53G-OO77YHuzlMq7ERegvmi11efO0AvSEu6Ubi_URpl69LiciaDKYpvgfX-NvsSByxnjoq5vVY8xEjn_ElQ0ZQXudJRf7sgRuF7JnVXbQzwZmuTqH0AGOa3IMSnhCajpI7z5aD51bJYLoDX1di3bJEqnChHcUMVJQbQ6w9b-wWkPB5P9UYVYjwIS9e31gPH1IejN_tfdDyNfU7fdz5_wyTCfWXaWpSas3AJaBA5PfSREnddxkl0zDFic2GxsEUCT2czw" alt="Play Store Logo" className="w-full h-full object-contain p-1" />
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
                      <button onClick={() => navigate('/scan/playstore')} className="text-xs px-4 py-1.5 rounded-full border border-tertiary text-tertiary font-bold hover:bg-tertiary hover:text-on-tertiary transition-all cursor-pointer">Analyze App →</button>
                    </div>
                  </div>

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
                      <button onClick={() => navigate('/scan/manual')} className="text-xs px-4 py-1.5 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all cursor-pointer">Analyze Manually →</button>
                    </div>
                  </div>

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
                      <button onClick={() => navigate('/scan/apk')} className="text-xs px-4 py-1.5 rounded-full border border-secondary text-secondary font-bold hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">Upload &amp; Scan →</button>
                    </div>
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
                  >Upload &amp; Scan →</button>
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
                  >Analyze Website →</button>
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
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-primary border border-white/35">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-lg font-bold mx-auto">VK</div>
                  <h4 className="text-base font-bold">Vishal Kumar Singh</h4>
                  <p className="text-primary font-semibold text-xs">Backend Developer • AI Integration • Deployment</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-secondary border border-white/35">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center text-white text-lg font-bold mx-auto">AR</div>
                  <h4 className="text-base font-bold">Ajay Raj</h4>
                  <p className="text-secondary font-semibold text-xs">Frontend Developer • UI/UX Designer</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-tertiary border border-white/35">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-tertiary to-primary flex items-center justify-center text-white text-lg font-bold mx-auto">PP</div>
                  <h4 className="text-base font-bold">Prachi Phadke</h4>
                  <p className="text-tertiary font-semibold text-xs">Project Manager • Spokesperson • Strategy Lead</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 5: Flagged Apps */}
        {activeTab === 'flagged' && (
          <div className="py-6 space-y-6">
            {/* Header & Summary */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div>
                <h1 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface mb-2">Flagged Apps</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time analysis of potential network threats.</p>
              </div>
              <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border-l-4 border-l-error shrink-0 self-start md:self-auto">
                <span className="material-symbols-outlined text-error">warning</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">Total Flagged: <span className="text-error font-bold text-lg">{(12842 + flaggedApps.length).toLocaleString()}</span></span>
              </div>
            </div>
            
            {/* Toolbar (Search & Filter) */}
            <div className="glass-panel p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
              <div className="relative flex-grow max-w-xl w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md text-body-md placeholder-outline" 
                  placeholder="Search by app name or developer..." 
                  type="text" 
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
            
            {/* Bento Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full flex-grow">
              {flaggedApps.map((scan) => (
                <div key={scan.id} className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                  <div className={`absolute -top-10 -right-10 w-32 h-32 ${scan.riskLevel === 'Critical' ? 'bg-error/10 group-hover:bg-error/20' : 'bg-[#ea580c]/10 group-hover:bg-[#ea580c]/20'} rounded-full blur-2xl transition-colors`}></div>
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
                        <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-on-surface truncate">{scan.appName}</h3>
                        <p className="font-body-md text-sm text-on-surface-variant truncate">{scan.developer}</p>
                      </div>
                    </div>
                    <span className={`${scan.riskLevel === 'Critical' ? 'risk-badge-critical' : 'risk-badge-high'} font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0`}>
                      <span className="material-symbols-outlined text-[14px]">{scan.riskLevel === 'Critical' ? 'dangerous' : 'warning'}</span> {scan.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="mb-6 z-10 w-full flex-grow">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-body-md text-sm text-on-surface-variant">Threat Score</span>
                      <span className={`font-title-lg text-2xl font-bold ${scan.riskLevel === 'Critical' ? 'text-error' : 'text-[#ea580c]'}`}>{scan.riskScore}<span className="text-sm font-normal text-outline">/100</span></span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className={`${scan.riskLevel === 'Critical' ? 'bg-error' : 'bg-[#ea580c]'} h-2 rounded-full`} style={{ width: `${scan.riskScore}%` }}></div>
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {scan.detectedIssues.slice(0, 2).map((issue, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant truncate max-w-[150px]">
                          {issue.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/scan/results/${scan.id}`)} className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-on-surface font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                    View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              ))}
              
              {/* Card 1 (Critical) */}
              <div className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-6 z-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        className="w-10 h-10 object-contain" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHWUiseAUrZogNAhYQz0V6ePWEvCfkhoVj89u3ojCzZ79lWS5bN9g-N_v3h8kndb-JPLDE18D99C_-1JCgBeV34gIqU0y7DM7Wp2ceyfPpjVKytFGkrmNuQB4b6FNbBqE8VHF-E8agENyjxcn6yiFbfB1XnnO0v06G3WBznEkY7R64EBZpevwMXaGuw2HAs-ngvqxjnAo0UuqK-qsz0w4_BtduJoFFLl4vwbs3MN8IXi-1yPzln34Ukt0Hdt-qkYSIVNWlwt4QYcc" 
                        alt="WhisperChat"
                      />
                    </div>
                    <div>
                      <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-on-surface">WhisperChat</h3>
                      <p className="font-body-md text-sm text-on-surface-variant">Nexus Dev Corp</p>
                    </div>
                  </div>
                  <span className="risk-badge-critical font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[14px]">dangerous</span> CRITICAL
                  </span>
                </div>
                <div className="mb-6 z-10 w-full flex-grow">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-body-md text-sm text-on-surface-variant">Threat Score</span>
                    <span className="font-title-lg text-2xl font-bold text-error">98<span className="text-sm font-normal text-outline">/100</span></span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div className="bg-error h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">Data Exfiltration</span>
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">Background Audio</span>
                  </div>
                </div>
                <button className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-on-surface font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                  View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              {/* Card 2 (High) */}
              <div className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ea580c]/10 rounded-full blur-2xl group-hover:bg-[#ea580c]/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-6 z-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        className="w-10 h-10 object-contain" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHXXtIxKvhNbvhJT0D1Em5c3fO-WPeb42aFmVxU7Qef-I4_-qyZyTA9feYniiLedAxeYHX8vJ5mzOWhHZu4Iq0AL6V9ZKp5PtN2Ds1q1tmYwUpg4wX8FPlWjxoNb7082-qdSR4L4pN4g2vCk_6b3oFmWA0Fs4qiGFBCqipaYBcJHzrzHr8XIt_-g8ETzbseocigGG1jSqncZ0YOF3R78s8xVGAr9WRHRnvRqVOG0ksTSoRWITCUiRPtlKP9YfzwgRmyvL3d0TYEZI" 
                        alt="PowerBoost Pro"
                      />
                    </div>
                    <div>
                      <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-on-surface">PowerBoost Pro</h3>
                      <p className="font-body-md text-sm text-on-surface-variant">Unknown Developer</p>
                    </div>
                  </div>
                  <span className="risk-badge-high font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[14px]">warning</span> HIGH
                  </span>
                </div>
                <div className="mb-6 z-10 w-full flex-grow">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-body-md text-sm text-on-surface-variant">Threat Score</span>
                    <span className="font-title-lg text-2xl font-bold text-[#ea580c]">84<span className="text-sm font-normal text-outline">/100</span></span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div className="bg-[#ea580c] h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">Crypto Mining</span>
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">CPU Spike</span>
                  </div>
                </div>
                <button className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-on-surface font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                  View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

              {/* Card 3 (Critical) */}
              <div className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-6 z-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        className="w-10 h-10 object-contain" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaPUbcX9Ur-PYDZ68u4KqKeM2qlbT9ZEjfZlc3vaTMe9EO5G22vxiHuGa-P_7-i4Dda2E0EwtdHGDOjWvAISSDSECpGhN7lMDCK7RYRVF6wJuC61om3Rg1VeQ3qS8I60PzwzcxpmiCZnDI_2_b9iyk11rftVFCVnXIGz-60GSXoLRvS_mW9cx0sMR2sWCxagA5v2LEXnKb-IXAkdfqYO6DBUYQfGCThBbRC7NHJOfRri09Bqjxl-AbYM_AO_Jk6a1D2hzaITMxiwk" 
                        alt="SecureVPN Free"
                      />
                    </div>
                    <div>
                      <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-on-surface">SecureVPN Free</h3>
                      <p className="font-body-md text-sm text-on-surface-variant">GlobalNet Solutions</p>
                    </div>
                  </div>
                  <span className="risk-badge-critical font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[14px]">dangerous</span> CRITICAL
                  </span>
                </div>
                <div className="mb-6 z-10 w-full flex-grow">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-body-md text-sm text-on-surface-variant">Threat Score</span>
                    <span className="font-title-lg text-2xl font-bold text-error">95<span className="text-sm font-normal text-outline">/100</span></span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div className="bg-error h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">Man-in-the-Middle</span>
                    <span className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">Cert Forgery</span>
                  </div>
                </div>
                <button className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-on-surface font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                  View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
            
            {/* Load More Button */}
            <div className="mt-12 pb-12 flex justify-center w-full">
              <button className="px-8 py-3 rounded-full border border-outline-variant bg-white/50 text-on-surface font-body-md text-body-md hover:bg-surface-variant transition-colors flex items-center gap-2 cursor-pointer">
                Load More <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
        )}

        {/* View: Threat Intelligence */}
        {activeTab === 'threats' && (
          <div className="py-6">
            {/* Header */}
            <header className="flex flex-col gap-2 mb-8">
              <h1 className="font-headline-section-mobile text-headline-section-mobile md:font-headline-section md:text-headline-section text-on-surface tracking-tight leading-tight">Threat Intelligence</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">AI-powered insights into fake investment app activity, impersonation trends, and fraud patterns.</p>
            </header>

            {/* KPI Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-error text-3xl">warning</span>
                  <span className="flex items-center text-error font-semibold bg-error/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">High Risk Entities</h3>
                  <p className="text-2xl font-bold text-on-surface">{(1248 + threatMetrics.highRisk).toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-tertiary text-3xl">shield_moon</span>
                  <span className="flex items-center text-outline font-semibold bg-surface-variant/50 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_flat</span> 0%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Medium Risk</h3>
                  <p className="text-2xl font-bold text-on-surface">{(3402 + threatMetrics.mediumRisk).toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary text-3xl">fiber_new</span>
                  <span className="flex items-center text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Newly Detected</h3>
                  <p className="text-2xl font-bold text-on-surface">{(84 + threatMetrics.newlyDetected).toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#06B6D4] text-3xl">domain</span>
                  <span className="flex items-center text-[#06B6D4] font-semibold bg-[#06B6D4]/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +2</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Brands Under Attack</h3>
                  <p className="text-2xl font-bold text-on-surface">14</p>
                </div>
              </div>
            </section>

            {/* Bottom Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Most Targeted Brands */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <section className="glass-panel rounded-xl p-8 flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-on-surface">Most Targeted Brands</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm font-medium text-on-surface">Groww</span>
                      <div className="flex-1 h-3 bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-on-surface">85%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm font-medium text-on-surface">Zerodha</span>
                      <div className="flex-1 h-3 bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-on-surface">72%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-20 text-sm font-medium text-on-surface">Upstox</span>
                      <div className="flex-1 h-3 bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-on-surface">45%</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right: Risk Taxonomy + Vector Analysis */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <section className="glass-panel rounded-xl p-8 flex flex-col items-center gap-6">
                  <h2 className="text-xl font-bold text-on-surface w-full">Risk Taxonomy</h2>
                  <div className="w-48 h-48 rounded-full border-[12px] border-surface-container relative flex items-center justify-center">
                    <div className="absolute inset-[-12px] rounded-full border-[12px] border-error" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }}></div>
                    <div className="text-center">
                      <span className="block text-3xl font-bold text-on-surface">{((4700 + threatMetrics.totalEvaluated) / 1000).toFixed(1)}k</span>
                      <span className="text-xs text-on-surface-variant font-medium">Total Evaluated</span>
                    </div>
                  </div>
                  <div className="w-full flex justify-center gap-6">
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-error mr-2"></span>High</span>
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-tertiary mr-2"></span>Medium</span>
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-surface-container mr-2"></span>Safe</span>
                  </div>
                </section>

                <section className="glass-panel rounded-xl p-8 flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-on-surface">Vector Analysis</h2>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">image</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-on-surface">Icon Similarity</h4>
                        <p className="text-xs text-on-surface-variant">Primary visual vector</p>
                      </div>
                      <span className="text-sm font-bold text-primary">82%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-tertiary text-xl">match_case</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-on-surface">Name Cloning</h4>
                        <p className="text-xs text-on-surface-variant">Lexical resemblance</p>
                      </div>
                      <span className="text-sm font-bold text-tertiary">64%</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right: Most Targeted Brands */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <section className="glass-panel rounded-xl p-8 flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-on-surface">Most Targeted Brands</h2>
                  <div className="flex flex-col gap-4">
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
                        return <div className="text-sm text-outline py-4 text-center">No targeted brands recorded in history.</div>;
                      }

                      const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary'];
                      return sortedBrands.slice(0, 3).map((brand, idx) => {
                        const percent = Math.round((brand.count / totalThreatScans) * 100);
                        return (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="w-24 text-sm font-medium text-on-surface truncate" title={brand.name}>{brand.name}</span>
                            <div className="flex-grow h-3 bg-surface-variant rounded-full overflow-hidden">
                              <div className={`h-full ${colors[idx % 3]} rounded-full`} style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="w-12 text-right text-sm font-semibold text-on-surface">{percent}%</span>
                          </div>
                        );
                      });
                    })()}
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