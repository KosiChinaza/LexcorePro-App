import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Settings, Save, Lock } from 'lucide-react';
import { settingsService, usersService } from '../services/api';
import { PageLoader, Spinner, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
const SettingsPage = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    useEffect(() => {
        settingsService.get().then(res => { setSettings(res.data); setForm(res.data); }).finally(() => setLoading(false));
    }, []);
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsService.update(form);
            setSettings(form);
            toast.success('Settings saved');
        }
        catch {
            toast.error('Failed to save settings');
        }
        finally {
            setSaving(false);
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPwSaving(true);
        try {
            await usersService.updatePassword(user.id, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
            toast.success('Password changed successfully');
        }
        catch {
            toast.error('Failed to change password — check current password');
        }
        finally {
            setPwSaving(false);
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    const Field = ({ label, field, type = 'text', placeholder }) => (_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: label }), _jsx("input", { type: type, className: "input", placeholder: placeholder, value: form[field] || '', onChange: e => setForm(f => ({ ...f, [field]: e.target.value })) })] }));
    return (_jsxs("div", { className: "space-y-6 animate-fade-in max-w-3xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Settings" }), _jsx("p", { className: "page-subtitle", children: "Firm configuration and preferences" })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Settings, { size: 16, className: "text-slate-400" }), _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Firm Details" })] }) }), _jsxs("form", { onSubmit: handleSaveSettings, className: "card-body space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Field, { label: "Firm Name", field: "firm_name", placeholder: "Peters & Associates" }), _jsx(Field, { label: "Email", field: "firm_email", type: "email", placeholder: "info@firm.ng" }), _jsx(Field, { label: "Phone", field: "firm_phone", placeholder: "+234 800 000 0000" }), _jsx(Field, { label: "Website", field: "firm_website", placeholder: "www.firm.ng" })] }), _jsx(Field, { label: "Address", field: "firm_address", placeholder: "14 Adeola Odeku Street, Victoria Island, Lagos" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(Field, { label: "Default Hourly Rate (\u20A6)", field: "default_hourly_rate", type: "number", placeholder: "75000" }), _jsx(Field, { label: "VAT Rate (e.g. 0.075)", field: "vat_rate", type: "number", placeholder: "0.075" }), _jsx(Field, { label: "Invoice Prefix", field: "invoice_prefix", placeholder: "INV" })] }), _jsx("div", { className: "flex justify-end pt-2", children: _jsxs("button", { type: "submit", className: "btn-primary", disabled: saving, children: [saving ? _jsx(Spinner, { size: 16 }) : _jsx(Save, { size: 16 }), saving ? 'Saving…' : 'Save Settings'] }) })] })] }), settings && (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Current Configuration" }) }), _jsx("div", { className: "card-body grid grid-cols-2 gap-3", children: Object.entries(settings).map(([k, v]) => (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs text-slate-500 mb-0.5", children: k.replace(/_/g, ' ') }), _jsx("span", { className: "text-sm text-slate-300 font-medium", children: v })] }, k))) })] })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lock, { size: 16, className: "text-slate-400" }), _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Change Password" })] }) }), _jsxs("form", { onSubmit: handleChangePassword, className: "card-body space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Current Password" }), _jsx("input", { type: "password", className: "input", required: true, value: pwForm.currentPassword, onChange: e => setPwForm(f => ({ ...f, currentPassword: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "New Password" }), _jsx("input", { type: "password", className: "input", required: true, minLength: 6, value: pwForm.newPassword, onChange: e => setPwForm(f => ({ ...f, newPassword: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Confirm New Password" }), _jsx("input", { type: "password", className: "input", required: true, value: pwForm.confirm, onChange: e => setPwForm(f => ({ ...f, confirm: e.target.value })) })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "submit", className: "btn-secondary", disabled: pwSaving, children: [pwSaving ? _jsx(Spinner, { size: 16 }) : _jsx(Lock, { size: 16 }), pwSaving ? 'Changing…' : 'Change Password'] }) })] })] })] }));
};
export default SettingsPage;
