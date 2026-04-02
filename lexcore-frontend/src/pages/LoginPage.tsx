import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg">
              <Scale size={26} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">LexCore Pro</h1>
            <p className="text-slate-400 text-sm mt-1">ASALAW LP</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Sign in to your account</h2>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@lexcore.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
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

              <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                {loading ? <Spinner size={16} /> : null}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Request access</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 font-medium mb-2">Demo credentials</p>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div>Admin: admin@lexcore.com / admin123</div>
            <div>Staff: chidi@lexcore.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
