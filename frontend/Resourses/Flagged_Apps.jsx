import React from 'react';
import { useNavigate } from 'react-router-dom';

const SentinelAIFlaggedApps = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden flex">
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
              background-image: 
                  radial-gradient(circle at 15% 50%, rgba(41, 75, 255, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
              background-color: #fbf8ff;
              background-attachment: fixed;
          }
          
          .glass-panel {
              background: rgba(255, 255, 255, 0.75);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 1);
              box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.05);
          }

          .risk-badge-critical {
              background: linear-gradient(135deg, rgba(186, 26, 26, 0.1), rgba(186, 26, 26, 0.2));
              color: #93000a;
              border: 1px solid rgba(186, 26, 26, 0.3);
          }

          .risk-badge-high {
              background: linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(234, 88, 12, 0.2));
              color: #9a3412;
              border: 1px solid rgba(234, 88, 12, 0.3);
          }
        `
      }} />

      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col bg-white/75 backdrop-blur-xl h-[calc(100vh-48px)] m-6 w-72 rounded-lg border border-white/100 p-6 z-10 shrink-0 sticky top-6">
        <div className="mb-stack-xl flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
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
        
        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} href="/dashboard">
              <span className="material-symbols-outlined font-normal text-outline group-hover:text-primary">language</span>Dashboard
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/scan-app'); }} href="/scan-app">
              <span className="material-symbols-outlined font-normal text-outline group-hover:text-primary">security</span>Scan App
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/flagged-apps'); }} href="/flagged-apps">
              <span className="material-symbols-outlined font-bold text-primary">analytics</span>Flagged Apps
            </a>
          </li>
          <li></li>
          <li></li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" href="#">
              <span className="material-symbols-outlined font-normal text-outline group-hover:text-primary">security</span>Threat Intelligence
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" href="#">
              <span className="material-symbols-outlined font-normal text-outline group-hover:text-primary">history</span>Scan History
            </a>
          </li>
          <li></li>
        </ul>
        <div className="mt-auto pt-6"></div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow p-container-margin-mobile md:p-container-margin max-w-max-width mx-auto relative z-10 w-full flex flex-col">
        {/* Header & Summary */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface mb-2">Flagged Apps</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time analysis of potential network threats.</p>
          </div>
          <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border-l-4 border-l-error shrink-0 self-start md:self-auto">
            <span className="material-symbols-outlined text-error">warning</span>
            <span className="font-body-md text-body-md font-semibold text-on-surface">Total Flagged: <span className="text-error font-bold text-lg">12,842</span></span>
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
          
          {/* Card 1 (Critical) */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-6 z-10 w-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm">
                  <img 
                    className="w-10 h-10 object-contain" 
                    data-alt="A stylized, highly detailed flat vector icon of a dark, stealthy chat bubble with a glowing red warning symbol inside. The icon is set against a clean white background, rendered in a crisp, modern digital illustration style suitable for a high-end tech dashboard." 
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
                    data-alt="A stylized flat vector icon of an orange geometric battery symbol crossed with a lightning bolt, indicating aggressive power consumption. The design is modern, minimalist, set against a white background, and fits a high-tech UI environment." 
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
                    data-alt="A detailed, modern flat icon of a blue and grey VPN shield breaking apart or glitching, symbolizing a compromised network tool. Clean vector style on a white background, suitable for a cybersecurity dashboard." 
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
      </main>
    </div>
  );
};

export default SentinelAIFlaggedApps;