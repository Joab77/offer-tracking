import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get('/api/me');
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            const { access_token, user: userData } = response.data;

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success('Connexion réussie !');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur de connexion';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const { access_token, user: newUser } = response.data;

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);

            toast.success('Inscription réussie ! Votre compte sera validé par un administrateur.');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
            toast.error(message);
            return { success: false, error: message, errors: error.response?.data?.errors };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Déconnexion réussie');
        }
    };

    const forgotPassword = async (email) => {
        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success('Email de réinitialisation envoyé !');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de l\'envoi';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const resetPassword = async (data) => {
        try {
            await axios.post('/api/auth/reset-password', data);
            toast.success('Mot de passe réinitialisé avec succès !');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
