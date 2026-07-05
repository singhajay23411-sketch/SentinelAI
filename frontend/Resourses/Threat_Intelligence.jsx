import React from 'react';

const ThreatIntelligenceDashboard = () => {
  return (
    <div className="font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      {/* Mobile TopNavBar */}
      <div className="md:hidden w-full bg-white/75 backdrop-blur-xl border-b border-outline-variant fixed top-0 left-0 z-50 flex justify-between items-center p-4">
        <div className="font-title-lg text-title-lg font-bold text-on-surface">SentinelAI</div>
        <span className="material-symbols-outlined text-primary">menu</span>
      </div>

      {/* Main Layout Structure */}
      <div className="flex flex-1 pt-24 md:pt-8 max-w-max-width mx-auto w-full px-container-margin-mobile md:px-container-margin gap-gutter items-start">
        {/* SideNavBar (Hidden on Mobile) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-72 rounded-lg bg-white/75 backdrop-blur-xl border border-white p-6 md:fixed md:left-6 md:top-8 md:z-40 shrink-0">
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
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-stack-xl md:ml-80">
          {/* Left Column (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Header */}
            <header className="flex flex-col gap-stack-sm">
              <h1 className="font-headline-section-mobile text-headline-section-mobile md:font-headline-section md:text-headline-section text-on-surface tracking-tight leading-tight">Threat Intelligence</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">AI-powered insights into fake investment app activity, impersonation trends, and fraud patterns.</p>
            </header>
            
            {/* KPI Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <div className="bg-surface-container rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-error text-3xl">warning</span>
                  <span className="flex items-center text-error font-semibold bg-error-container/50 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">High Risk Entities</h3>
                  <p className="text-2xl font-bold text-on-surface">1,248</p>
                </div>
              </div>
              <div className="bg-surface-container rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-tertiary text-3xl">shield_moon</span>
                  <span className="flex items-center text-outline font-semibold bg-surface-dim/50 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_flat</span> 0%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Medium Risk</h3>
                  <p className="text-2xl font-bold text-on-surface">3,402</p>
                </div>
              </div>
              <div className="bg-surface-container rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary text-3xl">fiber_new</span>
                  <span className="flex items-center text-primary font-semibold bg-primary-container/20 px-2 py-1 rounded-full text-xs"><span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5%</span>
                </div>
                <div>
                  <h3 className="text-sm text-on-surface-variant font-medium">Newly Detected</h3>
                  <p className="text-2xl font-bold text-on-surface">84</p>
                </div>
              </div>
              <div className="bg-surface-container rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/30">
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

            {/* Most Targeted Brands Chart */}
            <section className="bg-surface-container-low rounded-lg p-8 border border-outline-variant/30 min-h-[300px] flex flex-col gap-6">
              <h2 className="text-xl font-bold text-on-surface">Most Targeted Brands</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-on-surface">Groww</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-on-surface">85%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-on-surface">Zerodha</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-on-surface">72%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-on-surface">Upstox</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-on-surface">45%</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-gutter lg:mt-[104px]">
            {/* Risk Taxonomy */}
            <section className="bg-surface-container-low rounded-lg p-8 border border-outline-variant/30 flex flex-col items-center gap-6">
              <h2 className="text-xl font-bold text-on-surface w-full">Risk Taxonomy</h2>
              <div className="w-48 h-48 rounded-full border-[12px] border-surface-container relative flex items-center justify-center">
                <div className="absolute inset-[-12px] rounded-full border-[12px] border-error" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }}></div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-on-surface">4.7k</span>
                  <span className="text-xs text-on-surface-variant font-medium">Total Evaluated</span>
                </div>
              </div>
              <div className="w-full flex justify-center gap-6">
                <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-error mr-2"></span>High</span>
                <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-tertiary mr-2"></span>Medium</span>
                <span className="flex items-center text-xs font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-surface-container mr-2"></span>Safe</span>
              </div>
            </section>

            {/* Vector Analysis */}
            <section className="bg-surface-container-low rounded-lg p-8 border border-outline-variant/30 flex flex-col gap-6">
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
        </main>
      </div>
    </div>
  );
};

export default ThreatIntelligenceDashboard;       