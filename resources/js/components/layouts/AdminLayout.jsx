import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    TagIcon,
    ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
        { name: 'Offres', href: '/admin/offers', icon: TagIcon },
        { name: 'Participations', href: '/admin/participations', icon: ClipboardDocumentListIcon },
    ];

    const isActive = (href) => location.pathname === href;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">
                                    Administration
                                </h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`${
                                                isActive(item.href)
                                                    ? 'border-primary-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-1">
                                <p className="text-xs text-primary-800 font-medium">
                                    Administrateur
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Bonjour, {user?.name}</span>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile navigation */}
            <div className="sm:hidden bg-white border-b border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${
                                    isActive(item.href)
                                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                            >
                                <div className="flex items-center">
                                    <Icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;