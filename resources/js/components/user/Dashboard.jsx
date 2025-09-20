import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    TagIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentOffers, setRecentOffers] = useState([]);
    const [recentParticipations, setRecentParticipations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [offersResponse, participationsResponse] = await Promise.all([
                axios.get('/api/offers?per_page=3'),
                axios.get('/api/participations?per_page=5'),
            ]);

            setRecentOffers(offersResponse.data.data);
            setRecentParticipations(participationsResponse.data.data);

            // Calculer les statistiques
            const participations = participationsResponse.data.data;
            const stats = {
                totalParticipations: participations.length,
                approvedOffers: participations.filter(p => p.offer?.status === 'approved').length,
                pendingOffers: participations.filter(p => p.offer?.status === 'pending').length,
                disapprovedOffers: participations.filter(p => p.offer?.status === 'disapproved').length,
            };
            setStats(stats);
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOfferStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'disapproved':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getOfferStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Approuvée';
            case 'disapproved':
                return 'Refusée';
            default:
                return 'En attente';
        }
    };

    const getOfferStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'disapproved':
                return 'text-red-700 bg-red-50 border-red-200';
            default:
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user?.validated) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Compte en attente de validation</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Votre compte est en cours de validation par notre équipe. Vous recevrez un email dès que votre compte sera activé.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Bienvenue {user?.name}, voici un aperçu de votre activité.
                </p>
            </div>

            {/* Statistiques */}
            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total participations
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.totalParticipations}
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
                                        Approuvées
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.approvedOffers}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        En attente
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.pendingOffers}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Refusées
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.disapprovedOffers}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Offres récentes */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Offres récentes</h3>
                        <Link
                            to="/offers"
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            Voir toutes
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOffers.length > 0 ? (
                            recentOffers.map((offer) => (
                                <div key={offer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <TagIcon className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {offer.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Commission: {offer.commission} {offer.currency_code}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/offers/${offer.id}`}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Voir
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Aucune offre disponible pour votre pays.
                            </p>
                        )}
                    </div>
                </div>

                {/* Participations récentes */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Participations récentes</h3>
                        <Link
                            to="/participations"
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            Voir toutes
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentParticipations.length > 0 ? (
                            recentParticipations.map((participation) => (
                                <div key={participation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {getOfferStatusIcon(participation.offer?.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {participation.offer?.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(participation.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOfferStatusColor(participation.offer?.status)}`}>
                                        {getOfferStatusText(participation.offer?.status)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Aucune participation pour le moment.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
