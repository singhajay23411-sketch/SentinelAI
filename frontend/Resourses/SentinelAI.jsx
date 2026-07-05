import React, { useEffect, useState } from 'react';

const SentinelAI = () => {
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [currentView]);

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden relative">
      {/* BEGIN: Massive Background Typography */}
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden z-[-2]">
        <div className="font-hero-display text-hero-display hero-bg-text bg-gradient-to-br from-primary to-tertiary text-gradient transform -rotate-12 scale-150">
          SENTINELAI
        </div>
      </div>
      {/* END: Massive Background Typography */}

      {/* BEGIN: TopNavBar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-max-width rounded-full z-50 bg-white/75 backdrop-blur-xl border border-white/100 flex justify-between items-center px-gutter py-stack-sm shadow-sm">
        <div className="flex items-center gap-2">
          <div className="font-bold text-2xl text-on-background tracking-tighter cursor-pointer" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            SentinelAI
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            className={currentView === 'home' ? "text-primary font-bold border-b-2 border-primary transition-colors text-body-md cursor-pointer" : "text-on-surface-variant hover:text-primary transition-colors text-body-md cursor-pointer"}
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Home
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors text-body-md cursor-pointer"
            onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('analyze-app')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            Analyze App
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors text-body-md cursor-pointer"
            onClick={() => { setCurrentView('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            How it's Work
          </a>
          <a
            className={currentView === 'about' ? "text-primary font-bold border-b-2 border-primary transition-colors text-body-md cursor-pointer" : "text-on-surface-variant hover:text-primary transition-colors text-body-md cursor-pointer"}
            onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            About Us
          </a>
        </div>
        <button className="bg-[#0A0F29] text-white px-6 py-2.5 rounded-full text-body-md font-semibold hover:opacity-90 transition-all active:scale-95 cursor-pointer" onClick={() => setCurrentView('home')}>
          Get Started
        </button>
      </nav>
      {/* END: TopNavBar */}

      {/* BEGIN: HeroSection */}
      {currentView === 'home' ? (
        <>
          <main className="relative min-h-[100vh] flex items-center pt-36 pb-8 px-container-margin-mobile md:px-container-margin max-w-max-width mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center w-full">
          {/* BEGIN: Hero Content */}
          <div className="lg:col-span-5 space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant">
              <span
                className="material-symbols-outlined text-primary text-sm"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                shield
              </span>
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                Advanced Threat Defense
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-on-surface">
              Detect Fake <br />
              <span
                style={{
                  color: 'rgb(26, 56, 176)',
                  background: 'none',
                  WebkitTextFillColor: 'initial',
                }}
              >
                Investment Apps
              </span>{' '}
              <br />
              Before They Scam You
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-lg">
              SentinelAI uses advanced AI, similarity analysis, and risk scoring
              to identify fake and look-alike investment applications in
              real-time and protect users from financial fraud.
            </p>
            <div className="flex flex-wrap gap-4 mt-16">
              <button className="bg-[#0A0F29] text-white px-8 py-3.5 rounded-full font-bold hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                Get Started
              </button>
            </div>
          </div>
          {/* END: Hero Content */}

          {/* BEGIN: Hero Visual */}
          <div className="lg:col-span-7 relative h-[450px] flex items-center justify-center glow-effect mt-12 lg:mt-0">
            {/* Floating Glass Cards */}
            <div
              className="absolute top-10 left-10 glass-panel p-4 rounded-2xl shadow-sm animate-bounce z-20 flex items-center gap-3"
              style={{ animationDuration: '4s' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  verified
                </span>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Accuracy
                </div>
                <div className="text-lg font-bold text-on-surface">98.7%</div>
              </div>
            </div>
            <div
              className="absolute bottom-10 right-10 glass-panel p-4 rounded-2xl shadow-sm animate-bounce z-20 flex items-center gap-3"
              style={{ animationDuration: '5s', animationDelay: '1s' }}
            >
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  warning
                </span>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant font-bold uppercase">
                  Threats Detected
                </div>
                <div className="text-lg font-bold text-on-surface">12.8K+</div>
              </div>
            </div>

            {/* 3D Shield Centerpiece Placeholder */}
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              {/* Central Abstract 3D Image */}
              <img
                alt="3D Holographic AI Shield"
                className="w-full h-full object-contain drop-shadow-2xl z-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaAT82oALZXN56LhyWNmHyYEJ4NMLa5zqwyFGACeUYIYimhgWCBkL9_p1tMQgNrilW2ByuHgs7ozdvIjLT2HdyJLYSzhZSPmyBqxf1no7sYfgZfmRJTAr9LnMgoHhs7pTLiSLgMCXtluG5RfHJy-AA0nN8E2kw7v-bKJOdUMTpvip0WqdCcDYKofu8vLd3wWP2kq9bwKxIeQtr_AS29zIj7h8fw7VvUAZ0tR1FH9s8OibClenRQvl9YaHTlNFDdA8HxDX3OOR15ssP7g"
                style={{
                  animation:
                    '6s ease-in-out 0s infinite normal none running float',
                }}
              />
              {/* Orbital Animated Rings */}
              <div className="absolute inset-4 rounded-full border border-primary/20 animate-spin-slow"></div>
              <div
                className="absolute inset-10 rounded-full border border-secondary/10 animate-spin-slow"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '15s',
                }}
              ></div>
            </div>
          </div>
          {/* END: Hero Visual */}
        </div>
      </main>
      {/* END: HeroSection */}

      {/* BEGIN: TrustLogos */}
      <section className="py-12 border-y border-outline-variant/20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-max-width mx-auto px-container-margin"></div>
      </section>
      {/* END: TrustLogos */}

      {/* BEGIN: FeaturesSection */}
      <section className="py-section-gap relative">
        <div className="max-w-max-width mx-auto px-container-margin grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 sticky top-40 space-y-6">
            <span className="text-primary font-label-caps uppercase tracking-widest">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-on-background leading-tight">
              Everything you need for advanced app protection
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Our AI-powered platform combines multiple detection engines to
              deliver enterprise-grade security.
            </p>
            <a
              className="inline-flex items-center gap-2 text-primary font-bold group"
              href="#"
            >
              Explore all features{' '}
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                arrow_forward
              </span>
            </a>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <div className="reveal-on-scroll glass-card p-10 rounded-lg space-y-6 group hover:border-primary active">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <h3 className="text-2xl font-bold">AI Similarity Engine</h3>
              <p className="text-on-surface-variant text-body-md">
                Advanced algorithms detect look-alike apps with high accuracy,
                analyzing code structures and visual assets.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="reveal-on-scroll glass-card p-10 rounded-lg space-y-6 group hover:border-tertiary active">
              <div className="w-14 h-14 rounded-2xl bg-tertiary/5 flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">
                  analytics
                </span>
              </div>
              <h3 className="text-2xl font-bold">Risk Scoring</h3>
              <p className="text-on-surface-variant text-body-md">
                Multi-factor risk assessment with explainable AI insights, giving
                your team actionable data immediately.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="reveal-on-scroll glass-card p-10 rounded-lg space-y-6 group hover:border-secondary active">
              <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">
                  radar
                </span>
              </div>
              <h3 className="text-2xl font-bold">Real-time Scanning</h3>
              <p className="text-on-surface-variant text-body-md">
                Continuous monitoring of new and existing applications across
                multiple store environments globally.
              </p>
            </div>
            {/* Feature Card 4 */}
            <div className="reveal-on-scroll glass-card p-10 rounded-lg space-y-6 group hover:border-primary active">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">
                  groups
                </span>
              </div>
              <h3 className="text-2xl font-bold">Expert Review</h3>
              <p className="text-on-surface-variant text-body-md">
                Human-in-the-loop verification for maximum accuracy in complex
                cases, combining AI with human intuition.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: FeaturesSection */}

      {/* BEGIN: HowItWorks */}
      <section id="how-it-works" className="py-section-gap bg-surface-container-low/50">
        <div className="max-w-max-width mx-auto px-container-margin text-center mb-24">
          <span className="text-primary font-label-caps uppercase tracking-widest">
            How SentinelAI Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            AI-Powered Detection in 4 Simple Steps
          </h2>
        </div>
        <div className="max-w-max-width mx-auto px-container-margin relative">
          {/* Horizontal Connector Line (Desktop Only) */}
          <div className="absolute top-12 left-0 w-full h-[1px] bg-outline-variant/50 hidden md:block z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {/* Step 1 */}
            <div className="reveal-on-scroll space-y-6 relative z-10 active">
              <div className="w-24 h-24 rounded-full glass-card mx-auto flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                1
              </div>
              <h4 className="text-xl font-bold">Collect &amp; Analyze</h4>
              <p className="text-on-surface-variant text-sm">
                We collect app data including name, icon, description, and
                metadata from global stores.
              </p>
            </div>
            {/* Step 2 */}
            <div
              className="reveal-on-scroll space-y-6 relative z-10 active"
              style={{ transitionDelay: '0.1s' }}
            >
              <div className="w-24 h-24 rounded-full glass-card mx-auto flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                2
              </div>
              <h4 className="text-xl font-bold">AI Processing</h4>
              <p className="text-on-surface-variant text-sm">
                Our AI engines analyze similarity and behavior patterns using deep
                neural networks.
              </p>
            </div>
            {/* Step 3 */}
            <div
              className="reveal-on-scroll space-y-6 relative z-10 active"
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="w-24 h-24 rounded-full glass-card mx-auto flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                3
              </div>
              <h4 className="text-xl font-bold">Risk Assessment</h4>
              <p className="text-on-surface-variant text-sm">
                Applications are scored based on risk level with detailed
                AI-generated explanations.
              </p>
            </div>
            {/* Step 4 */}
            <div
              className="reveal-on-scroll space-y-6 relative z-10 active"
              style={{ transitionDelay: '0.3s' }}
            >
              <div className="w-24 h-24 rounded-full glass-card mx-auto flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                4
              </div>
              <h4 className="text-xl font-bold">Action &amp; Protect</h4>
              <p className="text-on-surface-variant text-sm">
                Flag high-risk apps and protect users from fraud through
                automated take-down requests.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: HowItWorks */}

      {/* BEGIN: DashboardPreview */}
      <section id="analyze-app" className="py-section-gap overflow-hidden">
        <div className="max-w-max-width mx-auto px-container-margin grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-4 space-y-8">
            <span className="text-primary font-label-caps uppercase tracking-widest">
              Platform Preview
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-on-background">
              Unified Dashboard for Complete Visibility
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Monitor threats, analyze trends, and take action from a single,
              powerful dashboard designed for security teams.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                <span className="font-semibold">
                  Real-time alerts &amp; notifications
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                <span className="font-semibold">
                  Customizable risk reporting
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
                <span className="font-semibold">
                  API integration for workflows
                </span>
              </li>
            </ul>
            <button className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-tertiary transition-colors shadow-lg mt-4">
              View Full Dashboard
            </button>
          </div>
          {/* Dashboard Mockup */}
          <div className="lg:col-span-8 relative">
            <div className="reveal-on-scroll glass-card rounded-2xl shadow-2xl overflow-hidden border border-white/50 p-2 active">
              <div className="bg-white rounded-xl overflow-hidden h-[500px] flex">
                {/* Sidebar Mock */}
                <div className="w-64 bg-[#0A0F29] h-full p-6 hidden md:flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                    <span className="material-symbols-outlined">hub</span>{' '}
                    SentinelAI
                  </div>
                  <nav className="space-y-2">
                    <div className="bg-primary/20 text-white px-4 py-2.5 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined">
                        dashboard
                      </span>{' '}
                      Dashboard
                    </div>
                    <div className="text-slate-400 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined">radar</span>{' '}
                      Scan Apps
                    </div>
                    <div className="text-slate-400 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined">flag</span>{' '}
                      Flagged
                    </div>
                    <div className="text-slate-400 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-3 cursor-pointer">
                      <span className="material-symbols-outlined">
                        description
                      </span>{' '}
                      Reports
                    </div>
                  </nav>
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 p-8 bg-[#F8FAFC]">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">Threat Intelligence</h3>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Total Scanned
                      </p>
                      <div className="text-xl font-bold">2.4M+</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        High Risk
                      </p>
                      <div className="text-xl font-bold text-red-600">
                        12.8K
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Detection Rate
                      </p>
                      <div className="text-xl font-bold text-green-600">
                        98.7%
                      </div>
                    </div>
                  </div>
                  {/* Dummy Chart Visualization */}
                  <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm h-56 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold">Detection Trend</h4>
                      <span className="text-[10px] text-slate-400">
                        Last 30 Days
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-32 px-2">
                      <div
                        className="flex-1 bg-primary/10 rounded-t-sm"
                        style={{ height: '30%' }}
                      ></div>
                      <div
                        className="flex-1 bg-primary/20 rounded-t-sm"
                        style={{ height: '45%' }}
                      ></div>
                      <div
                        className="flex-1 bg-primary/30 rounded-t-sm"
                        style={{ height: '60%' }}
                      ></div>
                      <div
                        className="flex-1 bg-primary/40 rounded-t-sm"
                        style={{ height: '80%' }}
                      ></div>
                      <div
                        className="flex-1 bg-primary/60 rounded-t-sm"
                        style={{ height: '95%' }}
                      ></div>
                      <div
                        className="flex-1 bg-primary rounded-t-sm"
                        style={{ height: '85%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 blur-[100px]"></div>
          </div>
        </div>
      </section>
      {/* END: DashboardPreview */}

      {/* BEGIN: CTASection */}
      <section className="py-section-gap px-container-margin-mobile md:px-container-margin">
        <div className="max-w-max-width mx-auto bg-[#C9E8FC] rounded-3xl p-16 md:p-24 text-center text-on-background relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-tertiary/10 opacity-50"></div>
          <div
            className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#000000 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          ></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-on-background">
              Ready to Detect Fake Apps Before They Cause Damage?
            </h2>
            <p className="text-xl text-on-surface-variant">
              Join the leading financial institutions using SentinelAI to secure
              their mobile ecosystem and protect brand integrity.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
              <button className="bg-on-background text-white px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
                Request a Demo
              </button>
              <button className="border border-on-background/20 bg-on-background/5 backdrop-blur-md px-12 py-5 rounded-full font-bold text-lg hover:bg-on-background/10 transition-all text-white">
                FAQ
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* END: CTASection */}
        </>
      ) : (
        <main className="relative pt-32 pb-16 px-container-margin-mobile md:px-container-margin max-w-max-width mx-auto space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto reveal-on-scroll active">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-xs">shield</span>
              <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">
                About SentinelAI
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-on-surface">
              Unmasking Fake Apps. <br />
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
                Securing Real Trust.
              </span>
            </h1>
            <p className="text-base text-on-surface-variant italic font-medium border-l-4 border-primary pl-3 py-1.5 bg-white/40 rounded-r-xl">
              "Protecting users from digital investment scams through intelligent threat detection and risk analysis."
            </p>
          </div>

          {/* About & Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch reveal-on-scroll active">
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/40 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-on-background mb-3">Our Platform</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  <strong>SentinelAI</strong> is an AI-powered cybersecurity platform designed to detect fake investment applications, fraudulent websites, and suspicious APK files. By analyzing app details, descriptions, developer information, and security indicators, SentinelAI helps users identify potential threats before they become victims of financial fraud.
                </p>
              </div>
              <div className="mt-6 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">radar</span>
                <span className="text-xs font-semibold text-primary">Advanced multi-factor risk assessment active.</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/40 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-on-background mb-3">Our Mission</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  To create a safer digital ecosystem by helping users verify apps, websites, and financial platforms before trusting them with their hard-earned assets and data.
                </p>
              </div>
              <div className="mt-6 p-3 bg-secondary/5 rounded-xl border border-secondary/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
                <span className="text-xs font-semibold text-secondary">Providing trust verification across the globe.</span>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="space-y-8 reveal-on-scroll active">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-bold">Meet the Team</h2>
              <p className="text-xs text-on-surface-variant">The minds behind SentinelAI dedicated to securing the mobile ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Member 1: Vishal */}
              <div className="glass-card p-6 rounded-2xl text-center space-y-4 hover:border-primary border border-white/35">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xl font-bold mx-auto shadow-sm">
                  VK
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-on-surface">Vishal Kumar Singh</h4>
                  <p className="text-primary font-semibold text-xs">Backend Developer • AI Integration • Deployment</p>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">Architects robust server architectures, machine learning models, and secure cloud pipelines.</p>
              </div>

              {/* Member 2: Ajay */}
              <div className="glass-card p-6 rounded-2xl text-center space-y-4 hover:border-secondary border border-white/35">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center text-white text-xl font-bold mx-auto shadow-sm">
                  AR
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-on-surface">Ajay Raj</h4>
                  <p className="text-secondary font-semibold text-xs">Frontend Developer • UI/UX Designer</p>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">Crafts stunning, intuitive, and interactive interfaces with modern responsive designs.</p>
              </div>

              {/* Member 3: Prachi */}
              <div className="glass-card p-6 rounded-2xl text-center space-y-4 hover:border-tertiary border border-white/35">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-tertiary to-primary flex items-center justify-center text-white text-xl font-bold mx-auto shadow-sm">
                  PP
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-on-surface">Prachi Phadke</h4>
                  <p className="text-tertiary font-semibold text-xs">Project Manager • Spokesperson • Strategy Lead</p>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">Drives strategic alignment, public relations, and business growth.</p>
              </div>
            </div>
          </div>

          {/* Call to Action or Platform Signoff */}
          <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-white/50 max-w-2xl mx-auto reveal-on-scroll active">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">security</span>
            <h3 className="text-xl font-bold text-on-background">SentinelAI</h3>
            <p className="text-lg font-bold text-primary italic">
              "Unmasking Fake Apps. Securing Real Trust." 🛡️🤖
            </p>
          </div>
        </main>
      )}

      {/* BEGIN: Footer */}
      <footer className="bg-surface border-t border-outline-variant w-full mt-24">
        <div className="max-w-max-width mx-auto px-container-margin py-section-gap grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="space-y-6">
            <div className="font-bold text-2xl text-on-surface">SentinelAI</div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
              Secure by Intelligence. Protecting the next generation of financial
              infrastructure from malicious application threats.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-6">Product</h4>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Neural Shield
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Threat Map
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-6">Company</h4>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              <li>
                <a
                  className="hover:text-primary transition-colors cursor-pointer"
                  onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Careers
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-6">Legal</h4>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Security
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant/30 py-8 text-center text-sm text-on-surface-variant">
          © 2026 SentinelAI. All rights reserved.
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
};

export default SentinelAI;