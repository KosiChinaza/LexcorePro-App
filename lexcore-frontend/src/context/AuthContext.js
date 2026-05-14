import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Restore session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('lexcore_token');
        const savedUser = localStorage.getItem('lexcore_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                // Silently verify token is still valid
                authService.me()
                    .then((res) => {
                    setUser(res.data);
                    localStorage.setItem('lexcore_user', JSON.stringify(res.data));
                })
                    .catch(() => {
                    // Token expired or invalid — clear everything
                    localStorage.removeItem('lexcore_token');
                    localStorage.removeItem('lexcore_user');
                    setToken(null);
                    setUser(null);
                })
                    .finally(() => setIsLoading(false));
            }
            catch {
                localStorage.removeItem('lexcore_token');
                localStorage.removeItem('lexcore_user');
                setIsLoading(false);
            }
        }
        else {
            setIsLoading(false);
        }
    }, []);
    const login = useCallback(async (email, password) => {
        // Clear any stale session first
        localStorage.removeItem('lexcore_token');
        localStorage.removeItem('lexcore_user');
        const res = await authService.login(email.trim().toLowerCase(), password);
        const { token: newToken, user: newUser } = res.data;
        if (!newToken || !newUser) {
            throw new Error('Invalid response from server');
        }
        localStorage.setItem('lexcore_token', newToken);
        localStorage.setItem('lexcore_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        }
        catch { /* ignore network errors on logout */ }
        localStorage.removeItem('lexcore_token');
        localStorage.removeItem('lexcore_user');
        setToken(null);
        setUser(null);
    }, []);
    return (_jsx(AuthContext.Provider, { value: {
            user,
            token,
            isLoading,
            login,
            logout,
            isAdmin: user?.role === 'admin',
        }, children: children }));
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
