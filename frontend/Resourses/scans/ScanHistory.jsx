import React, { useState } from 'react';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import ScanResults from './ScanResults.jsx';

const riskBadge = {
  Critical: 'bg-error/10 text-error',
  High: 'bg-[#ea580c]/10 text-[#ea580c]',
  Medium: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  Low: 'bg-primary/10 text-primary',
  Safe: 'bg-[#10B981]/10 text-[#10B981]',
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
  const [filterRisk, setFilterRisk] = useState('all');
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
    if (filterRisk !== 'all' && scan.riskLevel !== filterRisk) return false;
    return true;
  });

  return (
    <div className="py-6 hero-fade-in">
      <header className="mb-8">
        <h1 className="font-headline-section-mobile md:font-headline-section text-headline-section-mobile md:text-headline-section text-on-surface mb-2">
          Scan History
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Complete log of all security scans performed.
        </p>
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
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant px-4 py-2 pr-8 rounded-full text-sm text-on-surface focus:border-primary outline-none cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Safe">Safe</option>
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
                className="glass-panel rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
              >
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${ti.color}`}>{ti.icon}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-on-surface truncate">{scan.appName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskBadge[scan.riskLevel]}`}>
                      {scan.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {typeLabels[scan.type]} · {scan.developer} · {new Date(scan.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-on-surface">{scan.riskScore}</span>
                  <span className="text-xs text-outline">/100</span>
                </div>

                {/* Arrow */}
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
