import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import { Spinner } from '../components/ui';
const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('request');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', position: '' });
    const [activateForm, setActivateForm] = useState({ email: '', code: '', password: '', confirm: '' });
    const handleRequest = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.signupRequest(form);
            setActivateForm(a => ({ ...a, email: form.email }));
            setStep('activate');
        }
        catch (err) {
            setError(err?.response?.data?.error || 'Request failed');
        }
        finally {
            setLoading(false);
        }
    };
    const handleActivate = async (e) => {
        e.preventDefault();
        if (activateForm.password !== activateForm.confirm) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await authService.verifyCode({ email: activateForm.email, code: activateForm.code, password: activateForm.password });
            setStep('done');
        }
        catch (err) {
            setError(err?.response?.data?.error || 'Activation failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4", children: _jsx(Scale, { size: 26, className: "text-slate-900" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-100", children: "Request Access" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Peters & Associates Staff Portal" })] }), _jsxs("div", { className: "px-8 py-7", children: [step === 'request' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex gap-1 mb-6", children: ["request", "activate"].map((s) => (_jsx("div", { className: `h-1.5 flex-1 rounded-full bg-brand-500` }, s))) }), _jsx("h2", { className: "text-lg font-semibold text-slate-200 mb-5", children: "Step 1 \u2014 Submit Request" }), error && _jsx("div", { className: "bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4", children: error }), _jsxs("form", { onSubmit: handleRequest, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Full Name" }), _jsx("input", { className: "input", required: true, value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), placeholder: "Adaeze Obi" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email Address" }), _jsx("input", { type: "email", className: "input", required: true, value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), placeholder: "you@lexcore.com" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Phone" }), _jsx("input", { className: "input", value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })), placeholder: "+234 800 000 0000" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Position" }), _jsx("input", { className: "input", value: form.position, onChange: e => setForm(f => ({ ...f, position: e.target.value })), placeholder: "Associate" })] }), _jsxs("button", { type: "submit", className: "btn-primary w-full justify-center py-2.5", disabled: loading, children: [loading && _jsx(Spinner, { size: 16 }), " Submit Request"] })] })] })), step === 'activate' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-1 mb-6", children: [_jsx("div", { className: "h-1.5 flex-1 rounded-full bg-brand-500" }), _jsx("div", { className: "h-1.5 flex-1 rounded-full bg-brand-500" })] }), _jsx("h2", { className: "text-lg font-semibold text-slate-200 mb-2", children: "Step 2 \u2014 Activate Account" }), _jsx("p", { className: "text-slate-400 text-sm mb-5", children: "Once an admin approves your request, enter the 6-character code they provide." }), error && _jsx("div", { className: "bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-4", children: error }), _jsxs("form", { onSubmit: handleActivate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { type: "email", className: "input", required: true, value: activateForm.email, onChange: e => setActivateForm(f => ({ ...f, email: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Activation Code" }), _jsx("input", { className: "input font-mono tracking-widest uppercase", maxLength: 6, required: true, value: activateForm.code, onChange: e => setActivateForm(f => ({ ...f, code: e.target.value.toUpperCase() })), placeholder: "ABC123" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "New Password" }), _jsx("input", { type: "password", className: "input", required: true, minLength: 6, value: activateForm.password, onChange: e => setActivateForm(f => ({ ...f, password: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Confirm Password" }), _jsx("input", { type: "password", className: "input", required: true, value: activateForm.confirm, onChange: e => setActivateForm(f => ({ ...f, confirm: e.target.value })) })] }), _jsxs("button", { type: "submit", className: "btn-primary w-full justify-center py-2.5", disabled: loading, children: [loading && _jsx(Spinner, { size: 16 }), " Activate Account"] })] })] })), step === 'done' && (_jsxs("div", { className: "text-center py-4", children: [_jsx(CheckCircle, { size: 48, className: "text-emerald-400 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-bold text-slate-100 mb-2", children: "Account Activated!" }), _jsx("p", { className: "text-slate-400 text-sm mb-6", children: "Your account is ready. You can now sign in." }), _jsx("button", { onClick: () => navigate('/login'), className: "btn-primary px-8 py-2.5", children: "Go to Login" })] })), _jsx("div", { className: "mt-5 text-center", children: _jsxs(Link, { to: "/login", className: "text-sm text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1", children: [_jsx(ArrowLeft, { size: 14 }), " Back to Login"] }) })] })] }) }) }));
};
export default SignupPage;
