import React from 'react';

const typeColors = {
  playstore: { primary: 'tertiary', bg: 'tertiary/10', gradient: 'from-tertiary to-secondary' },
  manual: { primary: 'primary', bg: 'primary/10', gradient: 'from-primary to-secondary' },
  apk: { primary: 'secondary', bg: 'secondary/10', gradient: 'from-secondary to-tertiary' },
  website: { primary: '[#E67E22]', bg: '[#E67E22]/10', gradient: 'from-[#E67E22] to-error' },
};

const ScanProgress = ({ progress = 0, status = '', detail = '', scanType = 'playstore' }) => {
  const colors = typeColors[scanType] || typeColors.playstore;

  return (
    <div className="max-w-2xl mx-auto mt-8 glass-card rounded-xl p-8 flex flex-col items-center">
      {/* Animated Orb */}
      <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
        <div className={`absolute inset-0 bg-${colors.primary}/10 rounded-full blur-lg`}
          style={{ animation: 'scan-pulse-kf 2s infinite ease-in-out' }}>
        </div>
        <div className={`w-16 h-16 rounded-full border border-${colors.primary} flex items-center justify-center bg-white/50 backdrop-blur-sm z-10`}>
          <span className={`material-symbols-outlined text-${colors.primary} text-3xl`}>
            {scanType === 'playstore' ? 'shop' : scanType === 'manual' ? 'edit_note' : scanType === 'apk' ? 'android' : 'language'}
          </span>
        </div>
        <div className={`absolute inset-0 rounded-full border border-${colors.primary}/30`}
          style={{ animation: 'orbit-kf 3s linear infinite' }}>
        </div>
      </div>

      {/* Progress Info */}
      <div className="w-full text-center">
        <div className="flex justify-between items-end mb-2 text-xs">
          <span className={`text-${colors.primary} font-bold`}>{status}</span>
          <span className="text-on-surface-variant">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-300 ease-out rounded-full`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-outline mt-2">{detail}</p>
      </div>
    </div>
  );
};

export default ScanProgress;
