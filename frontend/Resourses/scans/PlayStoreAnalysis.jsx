import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import { analyzePlayStore } from '../services/mockAnalyzers.js';
import ScanProgress from './ScanProgress.jsx';
import ScanResults from './ScanResults.jsx';

const PlayStoreAnalysis = () => {
  const navigate = useNavigate();
  const { addScan } = useScanContext();
  const [phase, setPhase] = useState('input'); // input | scanning | results
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState('');
  const [result, setResult] = useState(null);

  const validateUrl = (value) => {
    if (!value.trim()) return 'Please enter a Play Store URL.';
    if (!value.includes('play.google.com')) return 'Please enter a valid Google Play Store URL.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateUrl(url);
    if (err) { setError(err); return; }
    setError('');
    setPhase('scanning');

    try {
      const scanResult = await analyzePlayStore(url, (stage) => {
        setProgress(stage.progress);
        setStatus(stage.status);
        setDetail(stage.detail);
      });
      addScan(scanResult);
      navigate(`/scan/results/${scanResult.id}`);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setPhase('input');
    }
  };

  const handleScanAgain = () => {
    setUrl('');
    setResult(null);
    setProgress(0);
    setPhase('input');
  };

  if (phase === 'scanning') {
    return <ScanProgress progress={progress} status={status} detail={detail} scanType="playstore" />;
  }

  if (phase === 'results' && result) {
    return (
      <ScanResults
        result={result}
        onScanAgain={handleScanAgain}
        onBack={() => navigate('/scan-app')}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto hero-fade-in">
      <div className="glass-panel rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-2xl">shop</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Play Store Analysis</h2>
            <p className="text-xs text-on-surface-variant">Paste a Google Play Store link to analyze the app for threats.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Play Store URL
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">link</span>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all text-on-surface text-sm placeholder-outline"
              />
            </div>
            {error && (
              <p className="text-xs text-error mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-tertiary text-white font-bold text-sm hover:bg-tertiary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">search</span> Analyze App
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-tertiary/5 rounded-xl border border-tertiary/20">
          <h4 className="text-xs font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-sm">info</span> What we analyze
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
            <span>• App Name & Package</span>
            <span>• Developer Info</span>
            <span>• Permissions</span>
            <span>• Download Count</span>
            <span>• Icon Similarity</span>
            <span>• Review Patterns</span>
            <span>• Investment Keywords</span>
            <span>• Update History</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayStoreAnalysis;
