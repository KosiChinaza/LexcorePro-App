import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Spinner } from '../components/ui';
const ActivatePage = () => {
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
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            const msg = err?.response?.data?.error
                || 'Activation failed. Please check your code and try again.';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-center px-8 py-10", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4", children: _jsx(CheckCircle, { size: 32, className: "text-emerald-400" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-100 mb-2", children: "Account Activated!" }), _jsx("p", { className: "text-slate-400 text-sm mb-6", children: "Your password has been set. You can now log in to LexCore Pro." }), _jsx("button", { onClick: () => navigate('/login'), className: "btn-primary w-full justify-center py-2.5", children: "Go to Login" })] }) }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center p-4", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" })] }), _jsx("div", { className: "w-full max-w-md relative", children: _jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg", children: _jsx(Scale, { size: 26, className: "text-slate-900" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-100", children: "Activate Account" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Set your password to get started" })] }), _jsxs("div", { className: "px-8 py-7", children: [error && (_jsx("div", { className: "bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-5", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email Address" }), _jsx("input", { type: "email", className: "input", placeholder: "your@email.com", value: email, onChange: e => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Activation Code" }), _jsx("input", { type: "text", className: "input font-mono tracking-widest uppercase text-center text-lg font-bold", placeholder: "ABC123", maxLength: 6, value: code, onChange: e => setCode(e.target.value.toUpperCase()), required: true }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Enter the 6-character code from your email" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPw ? 'text' : 'password', className: "input pr-10", placeholder: "Min. 6 characters", value: password, onChange: e => setPassword(e.target.value), required: true, minLength: 6 }), _jsx("button", { type: "button", onClick: () => setShowPw(p => !p), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200", children: showPw ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Confirm Password" }), _jsx("input", { type: showPw ? 'text' : 'password', className: "input", placeholder: "Repeat your password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true })] }), _jsxs("button", { type: "submit", disabled: loading, className: "btn-primary w-full justify-center py-2.5 mt-2", children: [loading ? _jsx(Spinner, { size: 16 }) : null, loading ? 'Activating…' : 'Activate Account'] })] }), _jsx("div", { className: "mt-6 pt-5 border-t border-slate-700 text-center", children: _jsxs("p", { className: "text-slate-400 text-sm", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-brand-400 hover:text-brand-300 font-medium", children: "Sign in" })] }) })] })] }) })] }));
};
export default ActivatePage;
