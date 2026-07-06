import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../src/context/ScanContext.jsx';
import { analyzeManual } from '../services/mockAnalyzers.js';
import ScanProgress from './ScanProgress.jsx';

const ManualVerification = () => {
  const navigate = useNavigate();
  const { addScan } = useScanContext();
  const [phase, setPhase] = useState('input'); // input | scanning
  const [form, setForm] = useState({ appName: '', description: '', developer: '', website: '', apkLink: '' });
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.appName.trim()) errs.appName = 'Please enter required fields';
    if (!form.description.trim()) errs.description = 'Please enter required fields';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPhase('scanning');

    try {
      const scanResult = await analyzeManual(form, (stage) => {
        setProgress(stage.progress);
        setStatus(stage.status);
        setDetail(stage.detail);
      });
      addScan(scanResult);
      navigate(`/scan/results/${scanResult.id}`);
    } catch (err) {
      setErrors({ formError: err.message || 'Analysis failed. Please try again.' });
      setPhase('input');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-surface-container-lowest border ${errors[field] ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm placeholder-outline`;

  if (phase === 'scanning') {
    return <ScanProgress progress={progress} status={status} detail={detail} scanType="manual" />;
  }

  return (
    <div className="max-w-2xl mx-auto hero-fade-in space-y-6 pb-12">
      <div className="glass-panel rounded-2xl p-8 relative">
        <button 
          onClick={() => navigate('/scan-app')}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary border border-outline-variant/50 bg-white/50 backdrop-blur-sm hover:bg-surface-variant/20 transition-all cursor-pointer flex items-center justify-center p-1.5 rounded-lg"
          title="Go back to Scanner"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">close</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Manual Verification</h2>
            <p className="text-xs text-on-surface-variant">Enter app details manually to verify authenticity.</p>
          </div>
        </div>

        {errors.formError && (
            <div className="mb-4 p-4 rounded-xl bg-error/10 text-error text-sm font-bold border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {errors.formError}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              App Name <span className="text-error">*</span>
            </label>
            <input type="text" value={form.appName} onChange={(e) => handleChange('appName', e.target.value)}
              placeholder="e.g. CryptoInvest Pro" className={inputClass('appName')} />
            {errors.appName && <p className="text-xs text-error mt-1">{errors.appName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Description <span className="text-error">*</span>
            </label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter the app's description or promotional text..."
              rows={4} className={`${inputClass('description')} resize-none`} />
            {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Developer</label>
              <input type="text" value={form.developer} onChange={(e) => handleChange('developer', e.target.value)}
                placeholder="Developer name" className={inputClass('developer')} />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Website</label>
              <input type="text" value={form.website} onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://..." className={inputClass('website')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">APK Link (Optional)</label>
            <input type="text" value={form.apkLink} onChange={(e) => handleChange('apkLink', e.target.value)}
              placeholder="Direct link to APK file" className={inputClass('apkLink')} />
          </div>

          <button type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-base">verified_user</span> Verify App
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualVerification;
