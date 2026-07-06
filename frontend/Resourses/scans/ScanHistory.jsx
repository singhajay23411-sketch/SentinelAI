import React, { useState } from 'react';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import ScanResults from './ScanResults.jsx';

const statusBadge = {
  'Official Verified Application': 'bg-[#10B981]/10 text-[#10B981]',
  'Trusted Financial Application': 'bg-[#10B981]/10 text-[#10B981]',
  'Likely Legitimate': 'bg-primary/10 text-primary',
  'Needs Review': 'bg-[#F59E0B]/10 text-[#F59E0B]',
  'Suspicious': 'bg-[#ea580c]/10 text-[#ea580c]',
  'Potential Impersonation': 'bg-error/10 text-error',
  'High Risk Fraud': 'bg-error/10 text-error',
  'Critical Threat': 'bg-error/10 text-error',
  'Unknown': 'bg-gray-500/10 text-gray-400'
};

const typeIcons = {
  playstore: { icon: 'shop', color: 'text-tertiary' },
  manual: { icon: 'edit_note', color: 'text-primary' },
  apk: { icon: 'android', color: 'text-secondary' },
  website: { icon: 'language', color: 'text-[#E67E22]' },
};

const typeLabels = {
  playstore: 'Play Store',
  manual: 'Manual',
  apk: 'APK Scan',
  website: 'Website',
};

const ScanHistory = () => {
  const { history } = useScanContext();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingScan, setViewingScan] = useState(null);

  if (viewingScan) {
    return (
      <ScanResults
        result={viewingScan}
        onScanAgain={() => setViewingScan(null)}
        onBack={() => setViewingScan(null)}
      />
    );
  }

  const filtered = history.filter(scan => {
    if (filterType !== 'all' && scan.type !== filterType) return false;
    if (filterStatus !== 'all' && scan.verificationStatus !== filterStatus) return false;
    return true;
  });

  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:8080/export-scans');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export scans");
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!data.records) throw new Error("Invalid format");
          const res = await fetch('http://localhost:8080/import-scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: data.records })
          });
          const result = await res.json();
          if (result.success) {
            alert(`Import successful! ${result.message}`);
            window.location.reload(); // Reload to fetch updated state
          } else {
            alert(`Import failed: ${result.error}`);
          }
        } catch (err) {
          console.error("Import failed", err);
          alert("Failed to import scans. Please ensure it is a valid export file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="py-6 space-y-8 relative hero-fade-in">
      {/* Ambient Background Wave & Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[5%] left-[25%] w-[380px] h-[380px] rounded-full bg-[#4e8cff]/5 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[420px] h-[420px] rounded-full bg-[#7a5cff]/5 blur-[120px]" />
        
        {/* Abstract flowing mesh wave (Spacecloud style) */}
        <div className="absolute top-[2%] right-[-15%] w-[80%] h-[320px] opacity-[0.25]">
          <svg viewBox="0 0 500 150" fill="none" className="w-full h-full">
            <path d="M20 90 C 130 30, 200 120, 320 50 C 440 -20, 410 120, 560 50" stroke="url(#historyMeshGrad)" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M20 100 C 120 40, 190 130, 310 60 C 430 -10, 400 130, 550 60" stroke="url(#historyMeshGrad)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
            <defs>
              <linearGradient id="historyMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4e8cff" />
                <stop offset="100%" stopColor="#7a5cff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 w-full relative z-10">
        <div className="flex items-start gap-4">
          {/* Thin vertical gradient accent line */}
          <div style={{ width: '4px', height: '56px', background: 'linear-gradient(180deg, #4e8cff 0%, #7a5cff 100%)', borderRadius: '4px' }} className="shrink-0" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2E6F] tracking-tight">
              Scan History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete log of all security scans performed.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleExport} 
            className="px-6 py-2.5 rounded-full border border-slate-200 bg-white/70 text-[#1B2E6F] text-sm font-semibold hover:border-[#4e8cff] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> Export
          </button>
          <button 
            onClick={handleImport} 
            className="px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #4e8cff 0%, #7a5cff 100%)',
            }}
          >
            <span className="material-symbols-outlined text-[16px]">upload</span> Import
          </button>
        </div>
      </header>

      {/* Filters inside frosted glass container */}
      <div 
        className="p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-center justify-between w-full relative z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.03)',
        }}
      >
        <div className="flex items-center gap-2 text-sm text-[#1B2E6F] font-semibold">
          <span className="material-symbols-outlined text-[#4e8cff] text-[18px]">filter_list</span>
          <span>{filtered.length} scan{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                border: '1.5px solid rgba(99, 102, 241, 0.15)',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
              className="appearance-none px-6 py-2 rounded-full text-xs font-semibold text-[#1B2E6F] outline-none cursor-pointer hover:border-[#4e8cff] transition-all"
            >
              <option value="all">All Types</option>
              <option value="playstore">Play Store</option>
              <option value="manual">Manual</option>
              <option value="apk">APK Scan</option>
              <option value="website">Website</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#1B2E6F] pointer-events-none text-sm">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                border: '1.5px solid rgba(99, 102, 241, 0.15)',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
              className="appearance-none px-6 py-2 rounded-full text-xs font-semibold text-[#1B2E6F] outline-none cursor-pointer hover:border-[#4e8cff] transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="Official Verified Application">Official Verified</option>
              <option value="Trusted Financial Application">Trusted</option>
              <option value="Likely Legitimate">Likely Legitimate</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Suspicious">Suspicious</option>
              <option value="High Risk Fraud">High Risk Fraud</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#1B2E6F] pointer-events-none text-sm">expand_more</span>
          </div>
        </div>
      </div>

      {/* Empty State Card */}
      {filtered.length === 0 && (
        <div 
          className="rounded-[2.5rem] p-16 text-center relative overflow-hidden flex flex-col items-center justify-center border border-white/90"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(222, 242, 250, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(99, 102, 241, 0.05)',
          }}
        >
          {/* Faded background history/clock illustration on the right */}
          <div 
            className="absolute right-[-10%] bottom-[-10%] select-none pointer-events-none opacity-[0.03] text-[#1B2E6F] z-0"
            style={{ fontSize: '280px', transform: 'rotate(-15deg)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>history</span>
          </div>

          {/* Tiny dot matrix decoration in bottom left corner */}
          <div className="absolute left-10 bottom-10 opacity-25 pointer-events-none" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 4px)', gap: '6px' }}>
            {[...Array(25)].map((_, i) => <div key={i} className="w-[4px] h-[4px] rounded-full bg-[#4e8cff]" />)}
          </div>

          {/* Small floating decorative dots */}
          <div style={{ position: 'absolute', top: '15%', left: '20%', width: 6, height: 6, borderRadius: '50%', background: '#4e8cff', opacity: 0.3 }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: 8, height: 8, borderRadius: '50%', background: '#7a5cff', opacity: 0.2 }} />
          <div style={{ position: 'absolute', top: '25%', right: '22%', width: 5, height: 5, borderRadius: '50%', background: '#7a5cff', opacity: 0.3 }} />

          {/* Center aligned security history illustration */}
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center z-10">
            <div className="absolute inset-0 bg-[#4e8cff]/10 rounded-full blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#4e8cff]/20 flex items-center justify-center shadow-md relative z-10">
              <span className="material-symbols-outlined text-[#4e8cff] text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>history</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-[#1B2E6F] mb-2 z-10">
            {history.length === 0 ? 'No scans yet' : 'No matching scans'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed z-10">
            {history.length === 0 ? 'Run your first scan from the Scan App page to see results here.' : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Scan Cards */}
      {filtered.length > 0 && (
        <div className="space-y-4 relative z-10">
          {filtered.map((scan) => {
            const ti = typeIcons[scan.type] || typeIcons.manual;
            return (
              <div
                key={scan.id}
                onClick={() => setViewingScan(scan)}
                className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:shadow-lg transition-all group border border-white/60"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.02)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Type Icon Container */}
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-sm shrink-0">
                    <span className={`material-symbols-outlined ${ti.color} text-xl`}>{ti.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="text-sm font-bold text-[#1B2E6F] truncate max-w-[220px]">{scan.appName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadge[scan.verificationStatus] || statusBadge['Unknown']}`}>
                        {scan.verificationStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {typeLabels[scan.type]} · {scan.developer} · {new Date(scan.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-6 self-end md:self-auto shrink-0 pr-2">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#10B981]">{scan.trustScore || 0}</span>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Trust</span>
                  </div>
                  <div className="text-right border-l border-slate-100 pl-4">
                    <span className="text-sm font-bold text-error">{scan.threatScore || 0}</span>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Threat</span>
                  </div>
                  <div className="text-right border-l border-slate-100 pl-4">
                    <span className="text-sm font-bold text-[#3B82F6]">{scan.confidenceScore || 0}%</span>
                    <span className="text-[9px] text-slate-400 block uppercase font-semibold">Conf</span>
                  </div>
                  {/* Action Arrow */}
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#4e8cff] transition-colors ml-2 hidden md:block" style={{ fontSize: 20 }}>chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
