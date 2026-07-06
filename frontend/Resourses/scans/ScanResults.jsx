import React from 'react';

const statusColors = {
  'Official Verified Application': { badge: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' },
  'Trusted Financial Application': { badge: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' },
  'Trusted Application': { badge: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' },
  'Likely Legitimate': { badge: 'bg-primary/10 text-primary border-primary/30' },
  'Needs Review': { badge: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' },
  'Suspicious': { badge: 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/30' },
  'Potential Impersonation': { badge: 'bg-error/10 text-error border-error/30' },
  'High Risk Fraud': { badge: 'bg-error/10 text-error border-error/30' },
  'Critical Threat': { badge: 'bg-error/10 text-error border-error/30' },
  'Unknown': { badge: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
};

const severityColors = {
  Critical: 'border-l-error bg-error/5',
  High: 'border-l-[#ea580c] bg-[#ea580c]/5',
  Medium: 'border-l-[#F59E0B] bg-[#F59E0B]/5',
  Low: 'border-l-primary bg-primary/5',
};

const typeLabels = {
  playstore: 'Play Store Analysis',
  manual: 'Manual Verification',
  apk: 'APK Security Scan',
  website: 'Website Analysis',
};

const MetricRing = ({ value, color, label }) => {
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 shrink-0 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="30" fill="transparent"
            className={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">{value}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{label}</span>
    </div>
  );
};

const ScanResults = ({ result, onScanAgain, onBack }) => {
  if (!result) return null;

  const statusStyle = statusColors[result.verificationStatus] || statusColors['Unknown'];

  const handleDownloadReport = () => {
    const lines = [
      `SentinelAI Trust Intelligence Report`,
      `${'='.repeat(50)}`,
      ``,
      `App Name: ${result.appName}`,
      `Developer: ${result.developer}`,
      `Scan Type: ${typeLabels[result.type] || result.type}`,
      `Verification Status: ${result.verificationStatus}`,
      `Trust Score: ${result.trustScore}/100`,
      `Threat Score: ${result.threatScore}/100`,
      `Confidence: ${result.confidenceScore}%`,
      `Date: ${new Date(result.timestamp).toLocaleString()}`,
      ``,
      `AI Verdict`,
      `${'-'.repeat(50)}`,
      ...(typeof result.aiVerdict === 'string' ? [result.aiVerdict] : [
        ...(result.aiVerdict?.findings?.map(f => `${f.heading}: ${f.detail}`) || []),
        '',
        result.aiVerdict?.summary || ''
      ]),
      ``,
      `Detected Issues (${result.detectedIssues.length})`,
      `${'-'.repeat(50)}`,
      ...result.detectedIssues.map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.title}: ${issue.description}`),
      ``,
      `Recommendations`,
      `${'-'.repeat(50)}`,
      ...result.recommendations.map((r, i) => `${i + 1}. ${r}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SentinelAI_Report_${result.appName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 hero-fade-in">
      {/* Header with New Intelligence Metrics */}
      <div className="glass-panel rounded-2xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">{result.appName}</h2>
          <div className="flex items-center justify-center gap-3">
             <span className={`px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-wider ${statusStyle.badge}`}>
               {result.verificationStatus}
             </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">{result.developer}</p>
          <p className="text-xs text-outline mt-1">
            {typeLabels[result.type]} · {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-8">
          <MetricRing value={result.trustScore || 0} color="stroke-[#10B981]" label="Trust" />
          <MetricRing value={result.threatScore || 0} color="stroke-error" label="Threat" />
          <MetricRing value={result.confidenceScore || 0} color="stroke-[#3B82F6]" label="Confidence" />
        </div>
      </div>

      {/* AI Security Assessment */}
      <div className="bg-[#DEF2FA] border border-[#b2dcf0] rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Decorative cyber grid background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#b2dcf0 1px, transparent 1px), linear-gradient(90deg, #b2dcf0 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="flex items-center gap-3 mb-4 relative z-10 border-b border-[#b2dcf0] pb-4">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1e40af] text-xl">shield_person</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1e293b] tracking-wide">AI Security Assessment</h3>
            <p className="text-[10px] text-[#1e40af] font-mono uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>
        
        <div className="relative z-10 w-full">
          {typeof result.aiVerdict === 'string' ? (
            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar text-sm text-[#334155] leading-relaxed font-sans space-y-4">
              {result.aiVerdict.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-[#334155]">{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.aiVerdict?.findings?.map((finding, idx) => (
                  <div key={idx} className="bg-white/80 border border-[#b2dcf0] p-4 rounded-xl flex flex-col gap-2 shadow-sm">
                     <span className="text-[#1e40af] font-bold text-sm tracking-wide">{finding.heading}</span>
                     <span className="text-[#334155] text-sm leading-relaxed">{finding.detail}</span>
                  </div>
                ))}
              </div>
              {result.aiVerdict?.summary && (
                <div className="mt-4 p-4 bg-white/60 border border-[#b2dcf0] rounded-xl text-[#334155] text-sm leading-relaxed font-normal">
                   {result.aiVerdict.summary}
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Play Store Data (if hybrid analysis) */}
      {result.playstoreDataFound && (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-[#3B82F6]/30">
          <div className="absolute top-0 right-0 bg-[#3B82F6] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Verified Data
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#3B82F6] text-xl">shop</span>
            <h3 className="text-lg font-bold text-on-surface">Play Store Data Retrieved</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-[#10B981]">check</span> App Name</span>
              <span className="text-sm font-medium text-on-surface break-all">{result.appName}</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-[#10B981]">check</span> Developer</span>
              <span className="text-sm font-medium text-on-surface break-all">{result.developer}</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-[#10B981]">check</span> Package Name</span>
              <span className="text-sm font-medium text-on-surface break-all">{result.packageName}</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-[#10B981]">check</span> Rating</span>
              <span className="text-sm font-medium text-on-surface break-all">{result.playstoreRating} ★</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-[#10B981]">check</span> Downloads</span>
              <span className="text-sm font-medium text-on-surface break-all">{result.playstoreDownloads}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detected Issues */}
      {result.detectedIssues && result.detectedIssues.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-error text-xl">bug_report</span>
            <h3 className="text-lg font-bold text-on-surface">Detected Issues ({result.detectedIssues.length})</h3>
          </div>
          <div className="space-y-3">
            {result.detectedIssues.map((issue, i) => (
              <div key={i} className={`border-l-4 rounded-lg p-4 ${severityColors[issue.severity] || severityColors.Medium}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">{issue.severity}</span>
                  <h4 className="text-sm font-bold text-on-surface">{issue.title}</h4>
                </div>
                <p className="text-xs text-on-surface-variant">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column: Permissions + Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permissions */}
        {result.permissions && result.permissions.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#F59E0B] text-xl">key</span>
              <h3 className="text-lg font-bold text-on-surface">Permissions ({result.permissions.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.permissions.map((perm, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-surface-variant text-xs font-medium text-on-surface-variant">
                  {perm.split('.').pop()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Evidence */}
        {result.evidence && result.evidence.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary text-xl">fact_check</span>
              <h3 className="text-lg font-bold text-on-surface">Evidence</h3>
            </div>
            <div className="space-y-3">
              {result.evidence.map((ev, i) => (
                <div key={i} className="flex justify-between items-center border-b border-outline-variant/20 pb-2 last:border-0">
                  <span className="text-xs text-on-surface-variant">{ev.label}</span>
                  <span className="text-xs font-bold text-on-surface">{ev.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata (type-specific) */}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary text-xl">info</span>
            <h3 className="text-lg font-bold text-on-surface">Metadata</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(result.metadata).map(([key, val]) => (
              <div key={key}>
                <span className="text-[10px] text-outline uppercase tracking-widest block mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-sm font-medium text-on-surface break-all">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#10B981] text-xl">tips_and_updates</span>
            <h3 className="text-lg font-bold text-on-surface">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[#10B981] text-base mt-0.5 shrink-0">check_circle</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pb-8">
        <button
          onClick={handleDownloadReport}
          className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">download</span> Download Report
        </button>
        <button
          onClick={onScanAgain}
          className="px-6 py-3 rounded-full border border-outline-variant bg-white/50 text-on-surface font-bold text-sm hover:bg-surface-variant transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">refresh</span> Scan Again
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full border border-outline-variant bg-white/50 text-on-surface font-bold text-sm hover:bg-surface-variant transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span> Back to Scanner
          </button>
        )}
      </div>
    </div>
  );
};

export default ScanResults;
