import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    UsersIcon,
    TagIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersResponse, offersResponse, participationsResponse] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/offers'),
                axios.get('/api/admin/participations'),
            ]);

            const users = usersResponse.data.data;
            const offers = offersResponse.data.data;
            const participations = participationsResponse.data.data;

            setStats({
                totalUsers: users.length,
                validatedUsers: users.filter(u => u.validated).length,
                pendingUsers: users.filter(u => !u.validated).length,
                totalOffers: offers.length,
                totalParticipations: participations.length,
                validatedParticipations: participations.filter(p => p.status === 'approved').length,
                pendingParticipations: participations.filter(p => p.status === 'open').length,
                rejectedParticipations: participations.filter(p => p.status === 'disapproved').length,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
                <p className="mt-1 text-sm text-gray-600">
                    GainsExprex
                </p>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UsersIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total utilisateurs
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats?.totalUsers || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TagIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total offres
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats?.totalOffers || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total participations
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats?.totalParticipations || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Participations validées
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats?.validatedParticipations || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Détails des statistiques */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Statistiques utilisateurs */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisateurs</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-600">Utilisateurs validés</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats?.validatedUsers || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm text-gray-600">En attente de validation</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats?.pendingUsers || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statistiques participations */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Participations</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-600">Validées</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats?.validatedParticipations || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm text-gray-600">Open</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats?.pendingParticipations || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                                <span className="text-sm text-gray-600">Refusées</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats?.rejectedParticipations || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions rapides */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <a
                        href="/admin/users"
                        className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                    >
                        <UsersIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-primary-900">Gérer les utilisateurs</p>
                            <p className="text-xs text-primary-700">Valider les comptes</p>
                        </div>
                    </a>
                    <a
                        href="/admin/offers"
                        className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    >
                        <TagIcon className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-green-900">Gérer les offres</p>
                            <p className="text-xs text-green-700">Créer et modifier</p>
                        </div>
                    </a>
                    <a
                        href="/admin/participations"
                        className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                        <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Voir les participations</p>
                            <p className="text-xs text-blue-700">Suivre l'activité</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
