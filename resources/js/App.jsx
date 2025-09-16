import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// User Components
import UserLayout from './components/layouts/UserLayout';
import UserDashboard from './components/user/Dashboard';
import OffersList from './components/user/OffersList';
import OfferDetail from './components/user/OfferDetail';
import ParticipationsList from './components/user/ParticipationsList';
import UserProfile from './components/user/Profile';

// Admin Components
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import OfferManagement from './components/admin/OfferManagement';
import ParticipationManagement from './components/admin/ParticipationManagement';
import DaisyconSettings from './components/admin/DaisyconSettings';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';
// Landing  Page
import Landing from './components/landing';


function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            {/* Landing page publique */}
            <Route path="/" element={<Landing />} />

            {/* Routes publiques */}
            <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to={user.is_admin ? "/admin" : "/app"} />}
            />
            <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to="/app" />}
            />
            <Route
                path="/forgot-password"
                element={!user ? <ForgotPassword /> : <Navigate to="/app" />}
            />
            <Route
                path="/reset-password"
                element={!user ? <ResetPassword /> : <Navigate to="/app" />}
            />

            {/* Routes utilisateur */}
            <Route
                path="/app"
                element={user && !user.is_admin ? <UserLayout /> : <Navigate to={user?.is_admin ? "/admin" : "/login"} />}
            >
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="offers" element={<OffersList />} />
                <Route path="offers/:id" element={<OfferDetail />} />
                <Route path="participations" element={<ParticipationsList />} />
                <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Routes admin */}
            <Route
                path="/admin"
                element={user?.is_admin ? <AdminLayout /> : <Navigate to="/login" />}
            >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="offers" element={<OfferManagement />} />
                <Route path="participations" element={<ParticipationManagement />} />
                <Route path="daisycon" element={<DaisyconSettings />} />
            </Route>

            {/* Route par défaut pour toutes les routes inconnues */}
            <Route
                path="*"
                element={<Navigate to={user ? (user.is_admin ? "/admin" : "/app") : "/login"} />}
            />
        </Routes>
    );
}

export default App;
