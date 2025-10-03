import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    CurrencyEuroIcon,
} from '@heroicons/react/24/outline';

const ParticipationsList = () => {
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchParticipations(currentPage);
    }, [currentPage, filter]);

    const fetchParticipations = async (page = 1) => {
        try {
            setLoading(true);
            let url = `/api/participations?page=${page}`;

            const response = await axios.get(url);
            let filteredParticipations = response.data.data;

            // Filtrer côté client selon le statut de l'offre
            if (filter !== 'all') {
                filteredParticipations = response.data.data.filter(p => p?.status === filter);
            }
            console.log("filter", filter)

            setParticipations(filteredParticipations);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des participations:', error);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const getDate = (rawData) => {
        return rawData?.transaction?.date ?? null;
    };

    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes participations</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Suivez le statut des offres auxquelles vous participez.
                </p>
            </div>

            {/* Filtres */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'opened', label: 'Opened' },
                    { key: 'approved', label: 'Approved' },
                    { key: 'disapproved', label: 'Disapproved' },
                ].map((filterOption) => (
                    <button
                        key={filterOption.key}
                        onClick={() => handleFilterChange(filterOption.key)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            filter === filterOption.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {filterOption.label}
                    </button>
                ))}
            </div>

            {/* Liste des participations */}
            {participations.length > 0 ? (
                <div className="space-y-4">
                    {participations.map((participation) => (
                        <div key={participation.id} className="card">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    {getOfferStatusIcon(participation?.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {participation.offer?.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {participation.offer?.description}
                                            </p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>
                                                    {new Date(getDate(participation.raw_data)).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </span>
                                                {participation?.commission && (
                                                    <div className="flex items-center space-x-1 text-green-600">
                                                        <CurrencyEuroIcon className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {participation.commission} €
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {
                                            participation?.status &&
                                            <div className="flex-shrink-0 ml-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getOfferStatusColor(participation?.status)}`}>
                                                    {getOfferStatusText(participation?.status)}
                                                </span>
                                            </div>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400"/>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {filter === 'all' ? 'Aucune participation' : `Aucune offre ${filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvée' : 'refusée'}`}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter === 'all'
                            ? 'Vous n\'avez participé à aucune offre pour le moment.'
                            : `Vous n'avez aucune offre avec ce statut.`
                        }
                    </p>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1 || loading}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page || loading}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de{' '}
                                <span className="font-medium">
                                    {(pagination.current_page - 1) * pagination.per_page + 1}
                                </span>{' '}
                                à{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                </span>{' '}
                                sur{' '}
                                <span className="font-medium">{pagination.total}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1 || loading}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Précédent
                                </button>
                                {[...Array(Math.min(pagination.last_page, 5))].map((_, index) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = index + 1;
                                    } else {
                                        const start = Math.max(1, pagination.current_page - 2);
                                        page = start + index;
                                    }

                                    if (page > pagination.last_page) return null;

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                page === pagination.current_page
                                                    ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page || loading}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {loading && currentPage > 1 && (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default ParticipationsList;
