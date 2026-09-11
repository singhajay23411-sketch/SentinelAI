import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', org_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/enterprise/overview', { replace: true });
    return null;
  }

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password, org_id: form.org_id || undefined });
      }
      navigate('/enterprise/overview', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 50%, #0a0e1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(100,255,218,0.15)',
        borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420,
        backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#64ffda', letterSpacing: '-1px' }}>
            ⬡ SentinelAI
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Enterprise Risk Platform</div>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4, marginBottom: 28 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              background: mode === m ? 'rgba(100,255,218,0.15)' : 'transparent',
              color: mode === m ? '#64ffda' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s'
            }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input name="name" value={form.name} onChange={handle} placeholder="Full Name" required
              style={inputStyle} />
          )}
          <input name="email" type="email" value={form.email} onChange={handle} placeholder="Email Address" required
            style={inputStyle} />
          <input name="password" type="password" value={form.password} onChange={handle}
            placeholder="Password (min 8 chars)" required minLength={8} style={inputStyle} />
          {mode === 'register' && (
            <input name="org_id" value={form.org_id} onChange={handle}
              placeholder="Organization ID (leave blank to create new)" style={inputStyle} />
          )}

          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
              borderRadius: 8, padding: '10px 14px', color: '#ff4757', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px 0', background: 'linear-gradient(135deg, #64ffda, #00b4d8)',
            border: 'none', borderRadius: 8, color: '#0a0e1a', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16,
            letterSpacing: '0.3px'
          }}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' }}>
            ← Back to Scanner
          </Link>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 24, padding: '10px 14px', background: 'rgba(100,255,218,0.05)',
          border: '1px solid rgba(100,255,218,0.1)', borderRadius: 8, fontSize: 11,
          color: 'rgba(255,255,255,0.4)', textAlign: 'center'
        }}>
          Demo: Register with any email to create a personal org, or use org_id{' '}
          <code style={{ color: '#64ffda', fontSize: 11 }}>demo-sentinel-financial-services</code>{' '}
          to join the pre-loaded demo.
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', padding: '12px 14px', marginBottom: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};