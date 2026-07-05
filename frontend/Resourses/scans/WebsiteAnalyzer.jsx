import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import { analyzeWebsite } from '../services/mockAnalyzers.js';
import ScanProgress from './ScanProgress.jsx';
import ScanResults from './ScanResults.jsx';

const WebsiteAnalyzer = () => {
  const navigate = useNavigate();
  const { addScan } = useScanContext();
  const [phase, setPhase] = useState('input');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState('');
  const [result, setResult] = useState(null);

  const validateUrl = (value) => {
    if (!value.trim()) return 'Please enter a website URL.';
    try {
      new URL(value.startsWith('http') ? value : 'https://' + value);
    } catch {
      return 'Please enter a valid URL (e.g. https://example.com).';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateUrl(url);
    if (err) { setError(err); return; }
    setError('');
    setPhase('scanning');

    try {
      const fullUrl = url.startsWith('http') ? url : 'https://' + url;
      const scanResult = await analyzeWebsite(fullUrl, (stage) => {
        setProgress(stage.progress);
        setStatus(stage.status);
        setDetail(stage.detail);
      });
      addScan(scanResult);
      navigate(`/scan/results/${scanResult.id}`);
    } catch {
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
    return <ScanProgress progress={progress} status={status} detail={detail} scanType="website" />;
  }

  if (phase === 'results' && result) {
    return <ScanResults result={result} onScanAgain={handleScanAgain} onBack={() => navigate('/scan-app')} />;
  }

  return (
    <div className="max-w-2xl mx-auto hero-fade-in">
      <div className="glass-panel rounded-2xl p-8 relative">
        {/* Close Button */}
        <button 
          onClick={() => navigate('/scan-app')}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary border border-outline-variant/50 bg-white/50 backdrop-blur-sm hover:bg-surface-variant/20 transition-all cursor-pointer flex items-center justify-center p-1.5 rounded-lg"
          title="Go back to Scanner"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#E67E22]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#E67E22] text-2xl">language</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Website Analyzer</h2>
            <p className="text-xs text-on-surface-variant">Check any website for phishing, scams, and security risks.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Website URL
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">public</span>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://example-investment.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] outline-none transition-all text-on-surface text-sm placeholder-outline"
              />
            </div>
            {error && (
              <p className="text-xs text-error mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span> {error}
              </p>
            )}
          </div>

          <button type="submit"
            className="w-full py-3 rounded-xl bg-[#E67E22] text-white font-bold text-sm hover:bg-[#E67E22]/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-base">travel_explore</span> Analyze Website
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-[#E67E22]/5 rounded-xl border border-[#E67E22]/20">
          <h4 className="text-xs font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E67E22] text-sm">info</span> Security checks
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
            <span>• SSL Certificate</span>
            <span>• Domain Age (WHOIS)</span>
            <span>• Blacklist Check</span>
            <span>• Phishing Indicators</span>
            <span>• Hidden Redirects</span>
            <span>• Suspicious Forms</span>
            <span>• Fake Investment Claims</span>
            <span>• Dangerous JavaScript</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteAnalyzer;
