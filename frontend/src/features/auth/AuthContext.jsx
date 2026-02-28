import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../shared/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // In a real app, we would fetch user info here
                    // For now, we'll just assume the token is valid if it exists
                    setUser({ email: localStorage.getItem('userEmail') });
                } catch {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
        return response.data;
    };

    const register = async (email, password, password_confirm) => {
        const response = await api.post('/auth/register', { email, password, password_confirm });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
