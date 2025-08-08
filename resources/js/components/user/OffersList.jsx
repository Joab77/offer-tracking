import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import { TagIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchOffers(currentPage);
    }, [currentPage]);

    const fetchOffers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/offers?page=${page}`);
            setOffers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Offres d'affiliation</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Découvrez les offres disponibles dans votre pays et commencez à gagner des commissions.
                </p>
            </div>

            {/* Liste des offres */}
            {offers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {offers.map((offer) => (
                        <div key={offer.id} className="card hover:shadow-md transition-shadow duration-200">
                            {offer.image_url && (
                                <div className="aspect-w-16 aspect-h-9 mb-4">
                                    <img
                                        src={offer.image_url}
                                        alt={offer.title}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <TagIcon className="h-6 w-6 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {offer.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {offer.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1 text-green-600">
                                            <CurrencyEuroIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {offer.commission}€ de commission
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {offer.country}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            to={`/offers/${offer.id}`}
                                            className="btn-primary w-full text-center"
                                        >
                                            Voir les détails
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre disponible</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Il n'y a actuellement aucune offre disponible dans votre pays.
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
                                {[...Array(pagination.last_page)].map((_, index) => {
                                    const page = index + 1;
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

export default OffersList;