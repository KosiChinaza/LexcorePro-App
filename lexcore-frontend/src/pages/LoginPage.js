import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            const msg = err?.response?.data?.error || 'Login failed. Please try again.';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center p-4", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" })] }), _jsxs("div", { className: "w-full max-w-md relative", children: [_jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-slate-900 to-slate-800 px-8 pt-8 pb-6 border-b border-slate-700 text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg", children: _jsx(Scale, { size: 26, className: "text-slate-900" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-100", children: "LexCore Pro" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "ASALAW LP" })] }), _jsxs("div", { className: "px-8 py-7", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-200 mb-6", children: "Sign in to your account" }), error && (_jsx("div", { className: "bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm mb-5", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email address" }), _jsx("input", { type: "email", className: "input", placeholder: "you@lexcore.com", value: email, onChange: e => setEmail(e.target.value), required: true, autoFocus: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPw ? 'text' : 'password', className: "input pr-10", placeholder: "Enter your password", value: password, onChange: e => setPassword(e.target.value), required: true }), _jsx("button", { type: "button", onClick: () => setShowPw(p => !p), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200", children: showPw ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsxs("button", { type: "submit", className: "btn-primary w-full justify-center py-2.5", disabled: loading, children: [loading ? _jsx(Spinner, { size: 16 }) : null, loading ? 'Signing in…' : 'Sign In'] })] }), _jsx("div", { className: "mt-6 pt-5 border-t border-slate-700 text-center", children: _jsxs("p", { className: "text-slate-400 text-sm", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "text-brand-400 hover:text-brand-300 font-medium", children: "Request access" })] }) })] })] }), _jsxs("div", { className: "mt-4 bg-slate-800/60 border border-slate-700 rounded-xl px-5 py-4", children: [_jsx("p", { className: "text-xs text-slate-500 font-medium mb-2", children: "Demo credentials" }), _jsxs("div", { className: "space-y-1 text-xs text-slate-400 font-mono", children: [_jsx("div", { children: "Admin: admin@lexcore.com / admin123" }), _jsx("div", { children: "Staff: chidi@lexcore.com / password123" })] })] })] })] }));
};
export default LoginPage;
