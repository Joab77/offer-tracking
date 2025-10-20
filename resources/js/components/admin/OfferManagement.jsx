import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '@/utils/alert';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    TagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

const schema = yup.object({
    title: yup.string().required('Titre requis').min(3, 'Le titre doit contenir au moins 3 caractères'),
    description: yup.string().nullable('Description requise').min(10, 'La description doit contenir au moins 10 caractères'),
    image_url: yup.string().url('URL invalide').nullable(),
    country: yup.string().required('Pays requis'),
    deeplink: yup.string().required('URL Daisycon requise').url('URL invalide'),
    api_key: yup.string().nullable(),
});

import countries from '../../utils/countries.json'

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        fetchOffers(currentPage);
    }, [currentPage, search, countryFilter]);

    const fetchOffers = async (page = 1) => {
        try {
            setLoading(true);
            let url = `/api/admin/offers?page=${page}`;

            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            if (countryFilter !== 'all') {
                url += `&country=${countryFilter}`;
            }

            const response = await axios.get(url);
            setOffers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
            Alert.error('Erreur lors du chargement des offres');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingOffer(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (offer) => {
        setEditingOffer(offer);
        setValue('title', offer.title);
        setValue('description', offer.description);
        setValue('image_url', offer.image_url || '');
        setValue('country', offer.country);
        setValue('deeplink', offer.deeplink);
        setValue('api_key', offer.api_key || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOffer(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);

            if (editingOffer) {
                await axios.put(`/api/admin/offers/${editingOffer.id}`, data);
                Alert.success('Offre modifiée avec succès !');
            } else {
                await axios.post('/api/admin/offers', data);
                Alert.success('Offre créée avec succès !');
            }

            closeModal();
            fetchOffers(currentPage);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            Alert.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (offerId) => {
        try {
            // Demande de confirmation via SweetAlert
            const result = await Alert.confirm(
                "Êtes-vous sûr de vouloir supprimer cette offre ? Cette action entraînera la suppression de toutes les participations liées à l'offre."
            );

            // Si l'utilisateur annule, on sort
            if (!result.isConfirmed) return;

            setDeleting(offerId);

            await axios.delete(`/api/admin/offers/${offerId}`);
            Alert.success('Offre supprimée avec succès !');
            fetchOffers(currentPage);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            Alert.error(message);
        } finally {
            setDeleting(null);
        }
    };

    const openDetailModal = (offer) => {
        setSelectedOffer(offer);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedOffer(null);
        setShowDetailModal(false);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleCountryFilterChange = (country) => {
        setCountryFilter(country);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getCountryName = (code) => {
        const country = countries.find(c => c.code === code);
        return country ? country.name : code;
    };

    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des offres</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Créez et gérez les missions disponibles sur la plateforme.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvelle offre</span>
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une offre..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filtre par pays */}
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={countryFilter}
                            onChange={(e) => handleCountryFilterChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">Tous les pays</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des offres */}
            <div className="card">
                {offers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Offre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pays
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Créée le
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {offers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={offer.image_url ? 'ml-4' : ''}>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {offer.title}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {getCountryName(offer.country)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openDetailModal(offer)}
                                                className="text-primary-600 hover:text-primary-900 p-1"
                                                title="Voir les détails"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(offer)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Modifier"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(offer.id)}
                                                disabled={deleting === offer.id}
                                                className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Supprimer"
                                            >
                                                {deleting === offer.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <TrashIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Commencez par créer votre première Mission.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={openCreateModal}
                                className="btn-primary flex items-center space-x-2 mx-auto"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Nouvelle offre</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

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

            {/* Modal création/modification */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Titre de l'offre
                                        </label>
                                        <input
                                            {...register('title')}
                                            type="text"
                                            className="input-field mt-1"
                                            placeholder="Titre de l'offre"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Pays
                                        </label>
                                        <select
                                            {...register('country')}
                                            className="input-field mt-1"
                                        >
                                            <option value="">Sélectionnez un pays</option>
                                            {countries.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.country && (
                                            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            URL Daisycon
                                        </label>
                                        <input
                                            {...register('deeplink')}
                                            type="url"
                                            className="input-field mt-1"
                                            placeholder="https://daisycon.io/click?a=123&c=456&p=789"
                                        />
                                        {errors.deeplink && (
                                            <p className="mt-1 text-sm text-red-600">{errors.deeplink.message}</p>
                                        )}
                                    </div>

                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="btn-secondary"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span>{editingOffer ? 'Modifier' : 'Créer'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal détails offre */}
            {showDetailModal && selectedOffer && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Détails de l'offre
                                </h3>
                                <button
                                    onClick={closeDetailModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedOffer.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pays</label>
                                        <p className="mt-1 text-sm text-gray-900">{getCountryName(selectedOffer.country)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL Daisycon</label>
                                    <p className="mt-1 text-sm text-gray-900 break-all">{selectedOffer.deeplink}</p>
                                </div>
                                {selectedOffer.api_key && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Clé API</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedOffer.api_key}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date de création</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedOffer.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={closeDetailModal}
                                    className="btn-secondary"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        closeDetailModal();
                                        openEditModal(selectedOffer);
                                    }}
                                    className="btn-primary"
                                >
                                    Modifier
                                </button>
                            </div>
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

export default OfferManagement;
