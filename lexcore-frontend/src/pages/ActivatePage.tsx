import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Spinner } from '../components/ui';

const ActivatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-code', {
        email: email.trim().toLowerCase(),
        code: code.trim().toUpperCase(),
        password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Activation failed. Please check your code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-center px-8 py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Account Activated!</h1>
            <p className="text-slate-400 text-sm mb-6">
              Your password has been set. You can now log in to LexCore Pro.
            </p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center py-2.5">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg">
              <Scale size={26} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Activate Account</h1>
            <p className="text-slate-400 text-sm mt-1">Set your password to get started</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Activation Code</label>
                <input
                  type="text"
                  className="input font-mono tracking-widest uppercase text-center text-lg font-bold"
                  placeholder="ABC123"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter the 6-character code from your email</p>
              </div>

              <div className="form-group">
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? <Spinner size={16} /> : null}
                {loading ? 'Activating…' : 'Activate Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivatePage;