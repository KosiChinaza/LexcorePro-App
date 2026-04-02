import React, { useEffect, useState } from 'react';
import { Settings, Save, Lock } from 'lucide-react';
import { settingsService, usersService } from '../services/api';
import { FirmSettings } from '../types';
import { PageLoader, Spinner, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FirmSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FirmSettings>({} as FirmSettings);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    settingsService.get().then(res => { setSettings(res.data); setForm(res.data); }).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(form as unknown as Record<string, string>);
      setSettings(form);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await usersService.updatePassword(user!.id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch { toast.error('Failed to change password — check current password'); }
    finally { setPwSaving(false); }
  };

  if (loading) return <PageLoader />;

  const Field: React.FC<{ label: string; field: keyof FirmSettings; type?: string; placeholder?: string }> = ({ label, field, type = 'text', placeholder }) => (
    <div className="form-group">
      <label className="label">{label}</label>
      <input type={type} className="input" placeholder={placeholder} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Firm configuration and preferences</p>
      </div>

      {/* Firm Details */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2"><Settings size={16} className="text-slate-400" /><h3 className="font-semibold text-slate-200 text-sm">Firm Details</h3></div>
        </div>
        <form onSubmit={handleSaveSettings} className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Firm Name" field="firm_name" placeholder="Peters & Associates" />
            <Field label="Email" field="firm_email" type="email" placeholder="info@firm.ng" />
            <Field label="Phone" field="firm_phone" placeholder="+234 800 000 0000" />
            <Field label="Website" field="firm_website" placeholder="www.firm.ng" />
          </div>
          <Field label="Address" field="firm_address" placeholder="14 Adeola Odeku Street, Victoria Island, Lagos" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Default Hourly Rate (₦)" field="default_hourly_rate" type="number" placeholder="75000" />
            <Field label="VAT Rate (e.g. 0.075)" field="vat_rate" type="number" placeholder="0.075" />
            <Field label="Invoice Prefix" field="invoice_prefix" placeholder="INV" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={16} /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Current settings display */}
      {settings && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Current Configuration</h3></div>
          <div className="card-body grid grid-cols-2 gap-3">
            {Object.entries(settings).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-xs text-slate-500 mb-0.5">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm text-slate-300 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2"><Lock size={16} className="text-slate-400" /><h3 className="font-semibold text-slate-200 text-sm">Change Password</h3></div>
        </div>
        <form onSubmit={handleChangePassword} className="card-body space-y-4">
          <div className="form-group"><label className="label">Current Password</label><input type="password" className="input" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">New Password</label><input type="password" className="input" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Confirm New Password</label><input type="password" className="input" required value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-secondary" disabled={pwSaving}>
              {pwSaving ? <Spinner size={16} /> : <Lock size={16} />}
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
