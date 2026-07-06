import React from 'react';

const ThreatIntelligenceDashboard = () => {
  return (
    <div className="bg-[#fbf8ff] text-on-background min-h-screen font-body-md overflow-x-hidden flex">
      {/* Shared theme styling matching Flagged Apps */}
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

      {/* SideNavBar (Left untouched for theme integration) */}
      <aside className="hidden md:flex flex-col bg-white/75 backdrop-blur-xl h-[calc(100vh-48px)] m-6 w-72 rounded-lg border border-white/100 p-6 z-10 shrink-0 sticky top-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8YhMnrkZRG-d9auJ6mm2-EUcZ3gyEOB6utByvQKDdNV07ioX5YMjX85acDl8SjE7aDHa2_udxte5i_XANnUTNIQYVRKtyccREpxtePV7ZeMEwroFn3OTpx_UmT_ViMclPhHbo-K9wJffAj5lQAgA7KiYxbcdYbCAZFFz0DiCSwLoCkTQ7d-kup5bL7bLHnG3gXI9_3f-I9c9zgR8ETsAsJ3394ZRETSqFZAWAE-EEATAhdA_U7KiH2EJcbjiEHtjKmYS3cF6kqwI"
              alt="Profile avatar"
            />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">SentinelAI</h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant">AI-Core Active</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-primary-container/20 transition-all group" href="#">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">language</span>Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-primary-container/20 transition-all group" href="#">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">shield</span>Scan App
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-primary-container/20 transition-all group" href="#">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">security</span>Flagged Apps
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-l-4 border-primary bg-primary-container/10 font-body-md transition-all" href="#">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>Threat Intelligence
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-primary-container/20 transition-all group" href="#">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">history</span>Scan History
          </a>
        </nav>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-grow p-container-margin-mobile md:p-container-margin max-w-max-width mx-auto relative z-10 w-full flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-[#1B2E6F] tracking-tight">Threat Intelligence</h1>
          <p className="text-sm text-slate-500">AI-powered insights into fake investment app activity, impersonation trends, and fraud patterns.</p>
        </header>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* High Risk */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
              </div>
              <span className="flex items-center text-red-500 font-semibold bg-red-500/10 px-3 py-1 rounded-full text-[11px]">
                <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span> Active
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk Entities</h3>
              <p className="text-3xl font-extrabold text-[#1B2E6F] mt-1">1,248</p>
            </div>
          </div>

          {/* Medium Risk */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#7a5cff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7a5cff] text-xl">shield_moon</span>
              </div>
              <span className="flex items-center text-[#7a5cff] font-semibold bg-[#7a5cff]/10 px-3 py-1 rounded-full text-[11px]">
                <span className="material-symbols-outlined text-[12px] mr-1">arrow_forward</span> Monitor
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medium Risk</h3>
              <p className="text-3xl font-extrabold text-[#1B2E6F] mt-1">3,402</p>
            </div>
          </div>

          {/* Newly Detected */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#294bff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#294bff] text-xl">fiber_new</span>
              </div>
              <span className="flex items-center text-[#294bff] font-semibold bg-[#294bff]/10 px-3 py-1 rounded-full text-[11px]">
                <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span> Live
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Newly Detected</h3>
              <p className="text-3xl font-extrabold text-[#1B2E6F] mt-1">84</p>
            </div>
          </div>

          {/* Brands Under Attack */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#06B6D4] text-xl">domain</span>
              </div>
              <span className="flex items-center text-[#06B6D4] font-semibold bg-[#06B6D4]/10 px-3 py-1 rounded-full text-[11px]">
                <span className="material-symbols-outlined text-[12px] mr-1">track_changes</span> Target
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brands Under Attack</h3>
              <p className="text-3xl font-extrabold text-[#1B2E6F] mt-1">14</p>
            </div>
          </div>
        </section>

        {/* Bottom charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left charts column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Risk Taxonomy */}
            <section className="glass-panel rounded-[2rem] p-8 flex flex-col items-center gap-6">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-bold text-[#1B2E6F]">Risk Taxonomy</h2>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
              </div>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#EF4444" strokeDasharray="251.2" strokeDashoffset={0} strokeWidth="8" />
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#7a5cff" strokeDasharray="251.2" strokeDashoffset={60} strokeWidth="8" />
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#06B6D4" strokeDasharray="251.2" strokeDashoffset={160} strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-[#1B2E6F]">4.7k</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                </div>
              </div>
              <div className="w-full flex justify-center gap-6 border-t border-slate-100 pt-4">
                <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>High</span>
                <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#7a5cff] mr-2"></span>Medium</span>
                <span className="flex items-center text-xs font-semibold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] mr-2"></span>Safe</span>
              </div>
            </section>

            {/* Vector Analysis */}
            <section className="glass-panel rounded-[2rem] p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-bold text-[#1B2E6F]">Vector Analysis</h2>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
              </div>
              <div className="flex flex-col gap-5 justify-center flex-grow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#294bff]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#294bff] text-xl">image</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="text-sm font-bold text-slate-700">Icon Similarity</h4>
                      <span className="text-sm font-extrabold text-[#294bff]">82%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Primary visual vector</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-[#294bff] h-1.5 rounded-full" style={{ width: '82%' }}></div>
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

          {/* Right column: Targeted brands list */}
          <div className="lg:col-span-4 flex flex-col gap-8 h-full">
            <section className="glass-panel rounded-[2rem] p-8 flex flex-col gap-6 h-full min-h-[300px]">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-bold text-[#1B2E6F]">Most Targeted Brands</h2>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
              </div>
              <div className="flex flex-col gap-5 justify-center flex-grow">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-slate-700">Groww</span>
                    <span className="text-xs font-extrabold text-[#294bff]">85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#294bff] to-[#7a5cff]" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-slate-700">Zerodha</span>
                    <span className="text-xs font-extrabold text-[#7a5cff]">72%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#294bff] to-[#7a5cff]" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-slate-700">Upstox</span>
                    <span className="text-xs font-extrabold text-[#06B6D4]">45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#294bff] to-[#7a5cff]" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThreatIntelligenceDashboard;