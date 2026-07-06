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
                <h2 className="text-3xl md:text-4xl font-bold text-on-surface">Overview</h2>
                <p className="text-sm md:text-base text-on-surface-variant mt-2">Real-time threat intelligence and system metrics.</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-primary font-medium hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span> Export Report
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Total Apps Scanned</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(stats.total || 0).toLocaleString()}</div>
                <div className="text-tertiary text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Live metrics
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">High Risk</span>
                <div className="text-2xl font-bold text-error mb-1">{(stats.high || 0).toLocaleString()}</div>
                <div className="text-outline text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span> Action Required
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Medium Risk</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(stats.medium || 0).toLocaleString()}</div>
                <div className="text-outline text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span> Under Review
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
                <span className="font-label-caps text-xs text-outline uppercase tracking-widest mb-4 block">Safe Apps</span>
                <div className="text-2xl font-bold text-on-surface mb-1">{(stats.safe || 0).toLocaleString()}</div>
                <div className="text-[#10B981] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Verified Secure
                </div>
              </div>
            </div>

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Recent Scans */}
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
                      {scans.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-outline">No scans performed yet.</td>
                        </tr>
                      ) : (
                        scans.slice(0, 5).map((scan) => {
                          const score = scan.threatScore !== undefined ? scan.threatScore : (scan.riskScore || 0);
                          const severity = score >= 70 ? 'Critical' : (score >= 45 ? 'Medium' : 'Low');
                          return (
                            <tr key={scan.id} className="border-b border-outline-variant/20 hover:bg-black/5 transition-colors cursor-pointer" onClick={() => navigate(`/scan/results/${scan.id}`)}>
                              <td className="py-3 px-2 font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${severity === 'Critical' ? 'bg-error' : severity === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`}></span>
                                {scan.appName}
                              </td>
                              <td className="py-3 px-2 text-on-surface-variant">{scan.developer}</td>
                              <td className={`py-3 px-2 font-bold ${score >= 70 ? 'text-error' : score >= 45 ? 'text-[#ea580c]' : score >= 25 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>{score}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right column: Risk Distribution & Top Threats */}
              <div className="flex flex-col gap-6">
                {/* Risk Distribution */}
                <div className="glass-panel rounded-xl p-6 flex flex-col h-[350px]">
                  <h3 className="font-bold text-on-surface mb-4">Risk Distribution</h3>
                  <div className="flex-grow flex items-center justify-center relative">
                    <div className="relative w-48 h-48">
                      {(() => {
                        const total = stats.total || 0;
                        if (total === 0) {
                          return (
                            <>
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e8f0" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="10" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-on-surface">100%</span>
                                <span className="text-xs text-outline font-medium uppercase tracking-widest">Secure</span>
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
                              {/* High Risk (Red) */}
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#ba1a1a" strokeDasharray="251.2" strokeDashoffset={0} strokeWidth="10" />
                              {/* Medium Risk (Orange) on top */}
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#F59E0B" strokeDasharray="251.2" strokeDashoffset={(highPercent / 100) * 251.2} strokeWidth="10" />
                              {/* Safe Apps (Green) on top */}
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#10B981" strokeDasharray="251.2" strokeDashoffset={((highPercent + mediumPercent) / 100) * 251.2} strokeWidth="10" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-on-surface">{Math.round(safePercent)}%</span>
                              <span className="text-xs text-outline font-medium uppercase tracking-widest">Secure</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Top Threats */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="font-bold text-on-surface mb-4">Top Threats</h3>
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
                        return <li className="text-sm text-outline">No active threats detected.</li>;
                      }

                      return topThreats.slice(0, 5).map((threat, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className={`material-symbols-outlined ${threat.severity === 'High' || threat.severity === 'Critical' ? 'text-error' : 'text-[#F59E0B]'}`}>
                            {threat.severity === 'High' || threat.severity === 'Critical' ? 'warning' : 'policy'}
                          </span>
                          <div>
                            <h4 className="font-medium text-xs truncate max-w-[200px]" title={threat.title}>{threat.title}</h4>
                            <p className="text-[10px] text-on-surface-variant">
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
                      <button onClick={() => navigate('/scan/website')} className="text-xs px-4 py-1.5 rounded-full border border-[#E67E22] text-[#E67E22] font-bold hover:bg-[#E67E22] hover:text-white transition-all cursor-pointer">Analyze Website →</button>
                    </div>
                  </div>
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
          <div className="py-6 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-xs">shield</span>
                <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">About SentinelAI</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-on-surface">
                Unmasking Fake Apps. <br />
                <span className="text-primary">Securing Real Trust.</span>
              </h1>
              <p className="text-sm text-on-surface-variant italic font-medium border-l-4 border-primary pl-3 py-1.5 bg-white/40 rounded-r-xl">
                "Protecting users from digital investment scams through intelligent threat detection and risk analysis."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/40 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold mb-2">Our Platform</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong>SentinelAI</strong> is an AI-powered cybersecurity platform designed to detect fake investment applications, fraudulent websites, and suspicious APK files. By analyzing app details, descriptions, developer information, and security indicators, SentinelAI helps users identify potential threats before they become victims of financial fraud.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/40 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold mb-2">Our Mission</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    To create a safer digital ecosystem by helping users verify apps, websites, and financial platforms before trusting them with their hard-earned assets and data.
                  </p>
                </div>
              </div>
            </div>

            {/* Meet the Team */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-primary border border-white/35">
                  <div className="w-20 h-20 rounded-full mx-auto shadow-md overflow-hidden border-2 border-primary/50">
                    <img src={vishalImg} alt="Vishal Kumar Singh" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-base font-bold">Vishal Kumar Singh</h4>
                  <p className="text-primary font-semibold text-xs">Backend Developer • AI Integration • Deployment</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-secondary border border-white/35">
                  <div className="w-20 h-20 rounded-full mx-auto shadow-md overflow-hidden border-2 border-secondary/50">
                    <img src={ajayImg} alt="Ajay Raj" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-base font-bold">Ajay Raj</h4>
                  <p className="text-secondary font-semibold text-xs">Frontend Developer • UI/UX Designer</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center space-y-3 hover:border-tertiary border border-white/35">
                  <div className="w-20 h-20 rounded-full mx-auto shadow-md overflow-hidden border-2 border-tertiary/50">
                    <img src={prachiImg} alt="Prachi Phadke" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-base font-bold">Prachi Phadke</h4>
                  <p className="text-tertiary font-semibold text-xs">Project Manager • Spokesperson • Strategy Lead</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 5: Flagged Threats */}
        {activeTab === 'flagged' && (
          <div className="py-6 space-y-6">
            {/* Header & Summary */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">Flagged Threats</h1>
                <p className="text-sm md:text-base text-on-surface-variant">Real-time analysis of potential network threats.</p>
              </div>
              <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border-l-4 border-l-error shrink-0 self-start md:self-auto">
                <span className="material-symbols-outlined text-error">warning</span>
                <span className="font-body-md text-body-md font-semibold text-on-surface">Total Flagged: <span className="text-error font-bold text-lg">{flaggedApps.length.toLocaleString()}</span></span>
              </div>
            </div>
            
            {/* Toolbar (Search & Filter) */}
            <div className="glass-panel p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
              <div className="relative flex-grow max-w-xl w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md text-body-md placeholder-outline" 
                  placeholder="Search by app name, domain, or developer..." 
                  type="text" 
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <div className="relative">
                  <select className="appearance-none bg-surface-container-lowest border border-outline-variant px-6 py-3 pr-10 rounded-full font-body-md text-body-md text-on-surface focus:border-primary outline-none cursor-pointer">
                    <option>All Risk Levels</option>
                    <option>Critical Only</option>
                    <option>High Only</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>

                <div className="relative hidden sm:block">
                  <select defaultValue="Fake Investment Apps" className="appearance-none bg-surface-container-lowest border border-outline-variant px-6 py-3 pr-10 rounded-full font-body-md text-body-md text-on-surface focus:border-primary outline-none cursor-pointer">
                    <option>All Categories</option>
                    <option>Fake Investment Apps</option>
                    <option>Social Media</option>
                    <option>Utilities</option>
                    <option>Games</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
            
            {/* Bento Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full flex-grow">
              {flaggedApps.length === 0 ? (
                <div className="col-span-full py-12 text-center text-outline glass-panel rounded-2xl">
                  No flagged threats, websites, or suspicious applications detected in history.
                </div>
              ) : (
                flaggedApps.map((scan) => {
                  const score = scan.threatScore !== undefined ? scan.threatScore : (scan.riskScore || 0);
                  const level = score >= 75 ? 'Critical' : 'High';
                  const isCritical = level === 'Critical';
                  return (
                    <div key={scan.id} className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
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
                            <h3 className="font-title-lg text-[22px] leading-tight font-semibold text-on-surface truncate">{scan.appName}</h3>
                            <p className="font-body-md text-sm text-on-surface-variant truncate">{scan.developer}</p>
                          </div>
                        </div>
                        <span className={`${isCritical ? 'risk-badge-critical' : 'risk-badge-high'} font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0`}>
                          <span className="material-symbols-outlined text-[14px]">{isCritical ? 'dangerous' : 'warning'}</span> {level.toUpperCase()}
                        </span>
                      </div>
                      <div className="mb-6 z-10 w-full flex-grow">
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-body-md text-sm text-on-surface-variant">Threat Score</span>
                          <span className={`font-title-lg text-2xl font-bold ${isCritical ? 'text-error' : 'text-[#ea580c]'}`}>{score}<span className="text-sm font-normal text-outline">/100</span></span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                          <div className={`${isCritical ? 'bg-error' : 'bg-[#ea580c]'} h-2 rounded-full`} style={{ width: `${score}%` }}></div>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {(scan.detectedIssues || []).slice(0, 2).map((issue, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant truncate max-w-[150px]" title={issue.description || issue.title}>
                              {issue.title || issue.description}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => navigate(`/scan/results/${scan.id}`)} className="mt-auto w-full py-3 rounded-xl bg-white/50 border border-outline-variant text-on-surface font-body-md text-body-md font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors z-10 flex items-center justify-center gap-2 cursor-pointer">
                        View Analysis <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  );
                })
              )}
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
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">Threat Intelligence</h1>
              <p className="text-sm md:text-base text-on-surface-variant max-w-2xl">AI-powered insights into fake investment app activity, impersonation trends, and fraud patterns.</p>
            </header>

            {/* KPI Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-error text-3xl">warning</span>
                  <span className="flex items-center text-error font-semibold bg-error/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> Active</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">High Risk Entities</h3>
                  <p className="text-2xl font-bold text-on-surface">{(stats.high || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-tertiary text-3xl">shield_moon</span>
                  <span className="flex items-center text-outline font-semibold bg-surface-variant/50 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_flat</span> Monitor</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Medium Risk</h3>
                  <p className="text-2xl font-bold text-on-surface">{(stats.medium || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary text-3xl">fiber_new</span>
                  <span className="flex items-center text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> Live</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Newly Detected (24h)</h3>
                  <p className="text-2xl font-bold text-on-surface">
                    {(() => {
                      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return scans.filter(s => new Date(s.timestamp) > oneDayAgo).length.toLocaleString();
                    })()}
                  </p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#06B6D4] text-3xl">domain</span>
                  <span className="flex items-center text-[#06B6D4] font-semibold bg-[#06B6D4]/10 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> Target</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Brands Under Attack</h3>
                  <p className="text-2xl font-bold text-on-surface">
                    {(() => {
                      const suspiciousApps = scans.filter(s => {
                        const score = s.threatScore !== undefined ? s.threatScore : (s.riskScore || 0);
                        return score >= 30; // suspicious or high threat
                      });
                      const uniqueBrands = new Set(suspiciousApps.map(s => s.appName ? s.appName.split(':')[0].split(' ')[0].trim() : 'Unknown'));
                      return uniqueBrands.size.toLocaleString();
                    })()}
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Risk Taxonomy & Vector Analysis (side-by-side) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Taxonomy */}
                <section className="glass-panel rounded-xl p-8 flex flex-col items-center gap-6">
                  <h2 className="text-xl font-bold text-on-surface w-full">Risk Taxonomy</h2>
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    {(() => {
                      const total = stats.total || 0;
                      if (total === 0) {
                        return (
                          <>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e8f0" strokeDasharray="251.2" strokeDashoffset="0" strokeWidth="10" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-on-surface">0</span>
                              <span className="text-xs text-outline font-medium uppercase tracking-widest">Total</span>
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
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#ba1a1a" strokeDasharray="251.2" strokeDashoffset={0} strokeWidth="10" />
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#F59E0B" strokeDasharray="251.2" strokeDashoffset={(highPercent / 100) * 251.2} strokeWidth="10" />
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#10B981" strokeDasharray="251.2" strokeDashoffset={((highPercent + mediumPercent) / 100) * 251.2} strokeWidth="10" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-on-surface">{total}</span>
                            <span className="text-xs text-outline font-medium uppercase tracking-widest">Total Scans</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="w-full flex justify-center gap-6">
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-error mr-2"></span>High</span>
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-tertiary mr-2"></span>Medium</span>
                    <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] mr-2"></span>Safe</span>
                  </div>
                </section>

                {/* Vector Analysis */}
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