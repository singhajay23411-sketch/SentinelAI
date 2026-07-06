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
    <div className="py-6 hero-fade-in">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface mb-2">
            Scan History
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Complete log of all security scans performed.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-sm font-bold hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
          <button onClick={handleImport} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">upload</span> Import
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          <span className="font-medium">{filtered.length} scan{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant px-4 py-2 pr-8 rounded-full text-sm text-on-surface focus:border-primary outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="playstore">Play Store</option>
              <option value="manual">Manual</option>
              <option value="apk">APK Scan</option>
              <option value="website">Website</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant px-4 py-2 pr-8 rounded-full text-sm text-on-surface focus:border-primary outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Official Verified Application">Official Verified</option>
              <option value="Trusted Financial Application">Trusted</option>
              <option value="Likely Legitimate">Likely Legitimate</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Suspicious">Suspicious</option>
              <option value="High Risk Fraud">High Risk Fraud</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-outline text-5xl mb-4 block">history</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            {history.length === 0 ? 'No scans yet' : 'No matching scans'}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {history.length === 0 ? 'Run your first scan from the Scan App page to see results here.' : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Scan Cards */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((scan) => {
            const ti = typeIcons[scan.type] || typeIcons.manual;
            return (
              <div
                key={scan.id}
                onClick={() => setViewingScan(scan)}
                className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${ti.color}`}>{ti.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-on-surface truncate">{scan.appName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge[scan.verificationStatus] || statusBadge['Unknown']}`}>
                        {scan.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {typeLabels[scan.type]} · {scan.developer} · {new Date(scan.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#10B981]">{scan.trustScore || 0}</span>
                    <span className="text-[10px] text-outline block uppercase">Trust</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-error">{scan.threatScore || 0}</span>
                    <span className="text-[10px] text-outline block uppercase">Threat</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#3B82F6]">{scan.confidenceScore || 0}%</span>
                    <span className="text-[10px] text-outline block uppercase">Conf</span>
                  </div>
                  {/* Arrow */}
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors ml-2 hidden md:block">chevron_right</span>
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
