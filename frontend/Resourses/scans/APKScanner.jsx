import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import { analyzeAPK } from '../services/mockAnalyzers.js';
import ScanProgress from './ScanProgress.jsx';
import ScanResults from './ScanResults.jsx';

const APKScanner = () => {
  const navigate = useNavigate();
  const { addScan } = useScanContext();
  const fileRef = useRef(null);
  const [phase, setPhase] = useState('input');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState('');
  const [result, setResult] = useState(null);

  const validateFile = (f) => {
    if (!f) return 'Please select an APK file.';
    if (!f.name.toLowerCase().endsWith('.apk')) return 'Only .apk files are accepted.';
    if (f.size > 100 * 1024 * 1024) return 'File size must be under 100 MB.';
    return '';
  };

  const handleFileSelect = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select an APK file.'); return; }
    setPhase('scanning');

    try {
      const scanResult = await analyzeAPK(file, (stage) => {
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
    setFile(null);
    setResult(null);
    setProgress(0);
    setPhase('input');
  };

  if (phase === 'scanning') {
    return <ScanProgress progress={progress} status={status} detail={detail} scanType="apk" />;
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
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-2xl">android</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">APK Security Scanner</h2>
            <p className="text-xs text-on-surface-variant">Upload an APK file for deep security analysis.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-secondary bg-secondary/5' : file ? 'border-secondary/50 bg-secondary/5' : 'border-outline-variant hover:border-secondary/50'}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".apk"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            {file ? (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-secondary text-4xl">android</span>
                <p className="text-sm font-bold text-on-surface">{file.name}</p>
                <p className="text-xs text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-error hover:underline">Remove</button>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-outline text-4xl">upload_file</span>
                <p className="text-sm font-bold text-on-surface">Drag & drop your APK file here</p>
                <p className="text-xs text-on-surface-variant">or click to browse · Max 100 MB · .apk only</p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span> {error}
            </p>
          )}

          <button type="submit" disabled={!file}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${file ? 'bg-secondary text-white hover:bg-secondary/90' : 'bg-surface-variant text-outline cursor-not-allowed'}`}>
            <span className="material-symbols-outlined text-base">security</span> Upload & Scan
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
          <h4 className="text-xs font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">info</span> Deep scan covers
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
            <span>• AndroidManifest.xml</span>
            <span>• Permissions Analysis</span>
            <span>• Certificate Validation</span>
            <span>• Malware Detection</span>
            <span>• Obfuscation Check</span>
            <span>• Dynamic Code Loading</span>
            <span>• Banking Trojan Patterns</span>
            <span>• Background Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APKScanner;
