import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import { Spinner } from '../components/ui';

type Step = 'request' | 'activate' | 'done';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '' });
  const [activateForm, setActivateForm] = useState({ email: '', code: '', password: '', confirm: '' });

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authService.signupRequest(form);
      setActivateForm(a => ({ ...a, email: form.email }));
      setStep('activate');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Request failed');
    } finally { setLoading(false); }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activateForm.password !== activateForm.confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authService.verifyCode({ email: activateForm.email, code: activateForm.code, password: activateForm.password });
      setStep('done');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Activation failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4">
              <Scale size={26} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Request Access</h1>
            <p className="text-slate-400 text-sm mt-1">Peters & Associates Staff Portal</p>
          </div>

          <div className="px-8 py-7">
            {step === 'request' && (
              <>
                <div className="flex gap-1 mb-6">
                  {(["request", "activate"] as const).map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full bg-brand-500`} />
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-slate-200 mb-5">Step 1 — Submit Request</h2>
                {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
                <form onSubmit={handleRequest} className="space-y-4">
                  <div className="form-group"><label className="label">Full Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Adaeze Obi" /></div>
                  <div className="form-group"><label className="label">Email Address</label><input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@lexcore.com" /></div>
                  <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" /></div>
                  <div className="form-group"><label className="label">Position</label><input className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Associate" /></div>
                  <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                    {loading && <Spinner size={16} />} Submit Request
                  </button>
                </form>
              </>
            )}

            {step === 'activate' && (
              <>
                <div className="flex gap-1 mb-6">
                  <div className="h-1.5 flex-1 rounded-full bg-brand-500" />
                  <div className="h-1.5 flex-1 rounded-full bg-brand-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-200 mb-2">Step 2 — Activate Account</h2>
                <p className="text-slate-400 text-sm mb-5">Once an admin approves your request, enter the 6-character code they provide.</p>
                {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
                <form onSubmit={handleActivate} className="space-y-4">
                  <div className="form-group"><label className="label">Email</label><input type="email" className="input" required value={activateForm.email} onChange={e => setActivateForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">Activation Code</label><input className="input font-mono tracking-widest uppercase" maxLength={6} required value={activateForm.code} onChange={e => setActivateForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ABC123" /></div>
                  <div className="form-group"><label className="label">New Password</label><input type="password" className="input" required minLength={6} value={activateForm.password} onChange={e => setActivateForm(f => ({ ...f, password: e.target.value }))} /></div>
                  <div className="form-group"><label className="label">Confirm Password</label><input type="password" className="input" required value={activateForm.confirm} onChange={e => setActivateForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                  <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                    {loading && <Spinner size={16} />} Activate Account
                  </button>
                </form>
              </>
            )}

            {step === 'done' && (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-100 mb-2">Account Activated!</h2>
                <p className="text-slate-400 text-sm mb-6">Your account is ready. You can now sign in.</p>
                <button onClick={() => navigate('/login')} className="btn-primary px-8 py-2.5">Go to Login</button>
              </div>
            )}

            <div className="mt-5 text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
