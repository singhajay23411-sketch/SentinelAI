import React from 'react';
import { useNavigate } from 'react-router-dom';

const SentinelAIDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden flex">
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
        `
      }} />

      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-tertiary/5 blur-[150px]"></div>
      </div>

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
          {/* Active Tab: Dashboard */}
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} href="/dashboard">
              <span className="material-symbols-outlined">language</span>Dashboard
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300 cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/scan-app'); }} href="/scan-app">
              <span className="material-symbols-outlined">security</span>Scan App
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">analytics</span>Flagged App
            </a>
          </li>
          <li></li>
          <li></li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">security</span>Threat Intelligence
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/20 transition-all duration-300" href="#">
              <span className="material-symbols-outlined">history</span>Scan History
            </a>
          </li>
        </ul>
        <div className="mt-auto pt-6"></div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow p-container-margin-mobile md:p-container-margin max-w-max-width mx-auto">
        <header className="mb-stack-xl flex justify-between items-end">
          <div>
            <h2 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface">Overview</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Real-time threat intelligence and system metrics.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-primary font-medium hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span> Export Report
            </button>
          </div>
        </header>

        {/* Stats Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-xl">
          {/* Stat Card 1 */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mb-4 block">Total Apps Scanned</span>
              <div className="font-title-lg text-title-lg text-on-surface mb-1">2.4M+</div>
              <div className="flex items-center gap-1 text-tertiary text-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +12% this week
              </div>
            </div>
          </div>
          
          {/* Stat Card 2 */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mb-4 block">High Risk</span>
              <div className="font-title-lg text-title-lg text-error mb-1">12.8K</div>
              <div className="flex items-center gap-1 text-outline text-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">warning</span> Action Required
              </div>
            </div>
          </div>
          
          {/* Stat Card 3 */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#F59E0B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mb-4 block">Medium Risk</span>
              <div className="font-title-lg text-title-lg text-on-surface mb-1">25.7K</div>
              <div className="flex items-center gap-1 text-outline text-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">info</span> Under Review
              </div>
            </div>
          </div>
          
          {/* Stat Card 4 */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#10B981]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mb-4 block">Safe Apps</span>
              <div className="font-title-lg text-title-lg text-on-surface mb-1">2.3M+</div>
              <div className="flex items-center gap-1 text-[#10B981] text-sm font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified Secure
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-section-gap">
          {/* Left Column: Chart & Recent Scans (Spans 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-gutter">
            
            {/* Risk Distribution Chart Area */}
            <div className="glass-panel rounded-xl p-6 flex flex-col h-[400px]">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-6">Risk Distribution</h3>
              <div className="flex-grow flex items-center justify-center relative">
                <div className="relative w-64 h-64">
                  {/* Outer Ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Safe (Green-ish/Teal) */}
                    <circle className="opacity-80" cx="50" cy="50" fill="transparent" r="40" stroke="#10B981" strokeDasharray="251.2" strokeDashoffset="50" strokeWidth="12" />
                    {/* Medium (Yellow/Orange) */}
                    <circle className="opacity-80" cx="50" cy="50" fill="transparent" r="40" stroke="#F59E0B" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="12" />
                    {/* High (Red/Error) */}
                    <circle className="opacity-80" cx="50" cy="50" fill="transparent" r="40" stroke="#ba1a1a" strokeDasharray="251.2" strokeDashoffset="230" strokeWidth="12" />
                  </svg>
                  {/* Inner Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-section-mobile text-headline-section-mobile text-on-surface">92%</span>
                    <span className="text-sm text-outline font-medium uppercase tracking-widest">Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scans Table */}
            <div className="glass-panel rounded-xl p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-title-lg text-title-lg text-on-surface">Recent Scans</h3>
                <a className="text-primary font-medium hover:underline text-sm" href="#">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50">
                      <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">App</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Developer</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Risk Score</th>
                      <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-outline text-[20px]">smart_toy</span>
                        </div>
                        <span className="font-medium text-on-surface">Nexus Sync</span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">OmniCorp</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-error w-[85%]"></div>
                          </div>
                          <span className="text-error font-medium text-sm">85</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-container text-on-error-container">Critical</span>
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-outline text-[20px]">cloud</span>
                        </div>
                        <span className="font-medium text-on-surface">Aether Drive</span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">CloudSys Ltd</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] w-[42%]"></div>
                          </div>
                          <span className="text-[#F59E0B] font-medium text-sm">42</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant">Flagged</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container/30 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-outline text-[20px]">payments</span>
                        </div>
                        <span className="font-medium text-on-surface">PayStream</span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">FinTech Global</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-[#10B981] w-[12%]"></div>
                          </div>
                          <span className="text-[#10B981] font-medium text-sm">12</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#065F46]">Clear</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Cards */}
          <div className="flex flex-col gap-gutter">
            
            {/* Top Threats */}
            <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-4 relative z-10">Top Threats</h3>
              <ul className="flex flex-col gap-4 relative z-10">
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30">
                  <span className="material-symbols-outlined text-error mt-1" data-weight="fill">warning</span>
                  <div>
                    <h4 className="font-medium text-on-surface">Zero-Day Payload</h4>
                    <p className="text-sm text-on-surface-variant mt-1">Detected in 4 apps across 2 distinct developer accounts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30">
                  <span className="material-symbols-outlined text-[#F59E0B] mt-1" data-weight="fill">policy</span>
                  <div>
                    <h4 className="font-medium text-on-surface">Data Exfiltration Routine</h4>
                    <p className="text-sm text-on-surface-variant mt-1">Suspicious background activity pattern identified.</p>
                  </div>
                </li>
              </ul>
              <button className="mt-6 w-full text-center text-sm font-medium text-primary hover:text-secondary transition-colors">Investigate Patterns</button>
            </div>

            {/* Live Intelligence Feed */}
            <div className="glass-panel rounded-xl p-6 flex-grow flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <h3 className="font-title-lg text-title-lg text-on-surface">Live Feed</h3>
              </div>
              
              <div className="flex-grow space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-outline-variant/30">
                {/* Feed Item */}
                <div className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-outline z-10 ring-4 ring-white"></div>
                  <div className="text-xs text-outline mb-1">Just now</div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 text-sm">
                    <strong className="text-on-surface">Node Alpha</strong> completed global sync. No anomalies.
                  </div>
                </div>
                
                {/* Feed Item */}
                <div className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-tertiary z-10 ring-4 ring-white"></div>
                  <div className="text-xs text-outline mb-1">2m ago</div>
                  <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 text-sm">
                    Neural model updated to version <span className="font-mono bg-surface-variant px-1 rounded">v4.2.1</span>
                  </div>
                </div>
                
                {/* Feed Item */}
                <div className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-error z-10 ring-4 ring-white"></div>
                  <div className="text-xs text-outline mb-1">15m ago</div>
                  <div className="bg-error-container/50 p-3 rounded-lg border border-error/20 text-sm">
                    <strong className="text-error">Alert:</strong> API rate limit approaching threshold on Gateway Beta.
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default SentinelAIDashboard;