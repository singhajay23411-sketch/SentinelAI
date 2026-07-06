import React from 'react';

const typeColors = {
  playstore: { primary: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', gradient: 'from-[#6366f1] to-[#8b5cf6]' },
  manual: { primary: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', gradient: 'from-[#3b82f6] to-[#6366f1]' },
  apk: { primary: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)', gradient: 'from-[#14b8a6] to-[#0ea5e9]' },
  website: { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', gradient: 'from-[#f59e0b] to-[#f97316]' },
};

const ScanProgress = ({ progress = 0, status = '', detail = '', scanType = 'playstore' }) => {
  const colors = typeColors[scanType] || typeColors.playstore;

  return (
    <div className="max-w-3xl mx-auto mt-8 relative z-10">
      {/* Redesigned Premium Glass Panel */}
      <div 
        className="rounded-2xl p-10 flex flex-col items-center relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 1)',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Stylized background shapes specifically for the scan detail card */}
        <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', filter: 'blur(10px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', filter: 'blur(10px)', pointerEvents: 'none' }} />

        {/* Magnifying Glass and Scan Ring Container */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Subtle Outer Pulse Sphere */}
          <div 
            className="absolute inset-2 rounded-full blur-xl"
            style={{
              background: colors.bg,
              animation: 'scan-pulse-kf 2s infinite ease-in-out',
            }}
          />

          {/* Animated Arc / Progress Ring around the Glass (matching the blue scanning arcs in reference) */}
          <svg className="absolute w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(99, 102, 241, 0.05)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#arcGradient)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="276"
              strokeDashoffset="120"
              strokeLinecap="round"
              style={{
                animation: 'spin 3s linear infinite',
                transformOrigin: '50px 50px',
              }}
            />
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating light points in background (matching dots in reference) */}
          <div style={{ position: 'absolute', top: '15%', left: '15%', width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', opacity: 0.8 }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', opacity: 0.6 }} />
          <div style={{ position: 'absolute', top: '25%', right: '12%', width: 5, height: 5, borderRadius: '50%', background: '#c084fc', opacity: 0.7 }} />
          <div style={{ position: 'absolute', bottom: '25%', right: '15%', width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', opacity: 0.7 }} />

          {/* Magnifying Glass Container - STATIONARY FRAME AND HANDLE */}
          <div className="w-32 h-32 relative flex items-center justify-center">
            {/* Magnifying Glass SVG asset - highly detailed, premium look */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full drop-shadow-lg"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ zIndex: 5 }}
            >
              {/* Metal/Chrome Outer Ring */}
              <circle cx="45" cy="45" r="25" stroke="#1e293b" strokeWidth="3" />
              <circle cx="45" cy="45" r="23.5" stroke="#475569" strokeWidth="0.8" />
              <circle cx="45" cy="45" r="26.5" stroke="#94a3b8" strokeWidth="0.8" />
              
              {/* Glass Lens Highlight/Refraction Effect */}
              <circle cx="45" cy="45" r="23.5" fill="rgba(255, 255, 255, 0.15)" />
              <path d="M26 45C26 34.5066 34.5066 26 45 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              
              {/* Premium dark handle with metallic accents - STATIONARY */}
              <line x1="62.5" y1="62.5" x2="82.5" y2="82.5" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
              <line x1="62.5" y1="62.5" x2="82.5" y2="82.5" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="61" y1="61" x2="63.5" y2="63.5" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />
            </svg>

            {/* Inner Scanning Area (inside the lens bounds) */}
            <div 
              className="absolute overflow-hidden rounded-full"
              style={{
                top: '22%',
                left: '22%',
                width: '46%',
                height: '46%',
                zIndex: 4,
              }}
            >
              {/* Moving scanning radar/line inside the lens */}
              <div 
                className="absolute w-full h-[3px] left-0 opacity-80"
                style={{
                  background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)',
                  boxShadow: '0 0 8px #0ea5e9',
                  animation: 'lens-scan-line 2s ease-in-out infinite',
                }}
              />

              {/* Pulsing/Glow effect inside the lens */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)',
                  animation: 'lens-glow 2s ease-in-out infinite',
                }}
              />

              {/* Inner Brand/App/Type Icon floating inside the lens */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    fontSize: 26, 
                    color: '#0ea5e9',
                    fontVariationSettings: '"FILL" 1',
                    animation: 'icon-pulse 2s ease-in-out infinite',
                  }}
                >
                  {scanType === 'playstore' ? 'shop' : scanType === 'manual' ? 'edit_note' : scanType === 'apk' ? 'android' : 'language'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Keyframes for Scan Details Screen */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes lens-scan-line {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          @keyframes lens-glow {
            0%, 100% { transform: scale(0.9); opacity: 0.15; }
            50% { transform: scale(1.1); opacity: 0.45; }
          }
          @keyframes icon-pulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}} />

        {/* Progress Bar & Status Section */}
        <div className="w-full">
          <div className="flex justify-between items-end mb-3 text-sm font-semibold">
            <span style={{ color: '#0ea5e9', letterSpacing: '-0.01em' }}>{status}</span>
            <span style={{ color: '#1e293b' }}>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${progress}%`, backgroundSize: '200% 100%' }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">{detail}</p>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;
