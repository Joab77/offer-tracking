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
    const [balance, setBalance] = useState(0);
    const [stats, setStats] = useState({ all: 0, opened: 0, approved: 0, disapproved: 0 });

    useEffect(() => {
        fetchParticipations(currentPage);
        getSold()
    }, [currentPage, filter]);

    const fetchParticipations = async (page = 1) => {
        try {
            setLoading(true);
            let url = `/api/participations?page=${page}`;

            const response = await axios.get(url);
            let filteredParticipations = response.data.data;

            if (filter !== 'all') {
                filteredParticipations = response.data.data.filter(p => p?.status === filter);
            }

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

    const getSold = async () => {
        try {
            const response = await axios.get(`/api/get/user/sold`);
            let sold = response.data.sold;
            setStats(() => ({ all: response.data.total, opened: response.data.opened, approved: response.data.approved, disapproved: response.data.disapproved }))
            setBalance(sold)
        } catch (error) {
            console.error('Erreur lors du chargement des participations:', error);
        } finally {
        }
    }

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

    // Robust date formatter: accepts ISO strings or unix timestamps (seconds),
    // falls back to participation.created_at when available.
    const formatParticipationDate = (participation) => {
        const raw = participation?.raw_data;
        let dateValue = null;

        if (raw?.transaction?.date) {
            dateValue = raw.transaction.date;
        } else if (participation?.created_at) {
            dateValue = participation.created_at;
        }

        if (!dateValue) return null;

        // If numeric string or number and likely seconds (length 10), convert to ms
        if (typeof dateValue === 'number' || (/^\d+$/).test(String(dateValue))) {
            const num = Number(dateValue);
            // Distinguish seconds (10 digits) vs ms (13 digits)
            if (String(num).length === 10) {
                return new Date(num * 1000);
            }
            return new Date(num);
        }

        // Otherwise try ISO parse
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return null;
        return d;
    };

    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes participations</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Suivez le statut des offres auxquelles vous participez.
                    </p>
                </div>

                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-semibold text-green-700">
                        Solde : {balance} €
                    </span>
                </div>
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
                        {filterOption.label}({ stats[filterOption.key] })
                    </button>
                ))}
            </div>

            {/* Liste des participations */}
            {participations.length > 0 ? (
                <div className="overflow-x-auto bg-white shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {participations.map((participation, idx) => {
                            const rowNumber = (pagination ? (pagination.current_page - 1) * pagination.per_page : 0) + idx + 1;
                            const dateObj = formatParticipationDate(participation);
                            const dateStr = dateObj
                                ? dateObj.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : '-';
                            return (
                                <tr key={participation.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rowNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{dateStr}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{participation.offer?.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {participation?.commission ? `${participation.commission} €` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {getOfferStatusIcon(participation?.status)}
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getOfferStatusColor(participation?.status)}`}>
                                                {getOfferStatusText(participation?.status)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
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
            )}        </div>
    );
};

export default ParticipationsList;
