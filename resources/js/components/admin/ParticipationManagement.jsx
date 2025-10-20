import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    CurrencyEuroIcon,
} from '@heroicons/react/24/outline';

const ParticipationManagement = () => {

    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [offers, setOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedParticipation, setSelectedParticipation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [stats, setStats] = useState({
    total: 0, approved: 0, open: 0, disapproved: 0
    });
    const [filters, setFilters] = useState({
    user_search: '',
    offer_id: '',
    status: 'all',
    date_from: '',
    date_to: '',
    period: ''
    });

    // -- debouncedFilters ---
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    // 1. Chargement des offres
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoadingOffers(true);
                const response = await axios.get('/api/admin/offers?simple=true');
                setOffers(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des offres:', error);
            } finally {
                setLoadingOffers(false);
            }
        };
        fetchOffers();
    }, []);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedFilters(filters);
        // reset to first page when filters change
        setCurrentPage(1);
      }, 500);

      return () => clearTimeout(handler);
    }, [filters]);

    // 2. Chargement principal des participations
    useEffect(() => {
      // on charge quand la page ou les filtres "débounced" changent
      fetchParticipations(currentPage, debouncedFilters);
    }, [currentPage, debouncedFilters]);

    // 3. Nettoyage

  /*   const fetchParticipations = async (page = 1) => {

             try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page,
                ...filters
            });

            // Supprimer les filtres vides
            Array.from(params.entries()).forEach(([key, value]) => {
                if (!value || value === 'all') {
                    params.delete(key);
                }
            });

            const response = await axios.get(`/api/admin/participations?${params}`);
            const data = response.data;

            setParticipations(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                per_page: data.per_page,
            });

            if (data.offers) {
                setOffers(data.offers);
            }

        } catch (error) {
            console.error('Erreur lors du chargement des participations:', error);
        } finally {
            setLoading(false);
        }
         // Calculer les statistiques
         if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }
            const response = await axios.get(`/api/admin/participations?${params}`);
            const data = response.data.data;
            setStats({
                total: data.length,
                approved: data.filter(p => p.status === 'approved').length,
                open: data.filter(p => p.status === 'open').length,
                disapproved: data.filter(p => p.status === 'disapproved').length,
            });
            setParticipations(data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });

    }; */


    const fetchParticipations = async (page = 1, appliedFilters = {}) => {
      try {
        setLoading(true);

        // Construire params proprement
        const paramsObj = { page, ...appliedFilters };

        // Supprimer propriétés vides ou "all"
        Object.keys(paramsObj).forEach(key => {
          const val = paramsObj[key];
          if (val === '' || val === null || val === undefined || val === 'all') {
            delete paramsObj[key];
          }
        });

        const response = await axios.get('/api/admin/participations', { params: paramsObj });
        const data = response.data;

        // Assumer réponse paginée standard : data.data (items) + meta/pagination
        setParticipations(data.data || []);
        setPagination({
          current_page: data.current_page ?? data.meta?.current_page ?? page,
          last_page: data.last_page ?? data.meta?.last_page ?? 1,
          total: data.total ?? data.meta?.total ?? (data.data ? data.data.length : 0),
          per_page: data.per_page ?? data.meta?.per_page ?? (data.data ? data.data.length : 0),
        });

        // Calculer stats localement si les items sont fournis
        const items = data.data || [];
        setStats({
          total: items.length,
          approved: items.filter(p => p.status === 'approved').length,
          open: items.filter(p => p.status === 'open').length,
          disapproved: items.filter(p => p.status === 'disapproved').length,
        });

        // Si le backend renvoie les offres en même payload, on les met à jour (optionnel)
        if (data.offers) {
          setOffers(data.offers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des participations:', error);
      } finally {
        setLoading(false);
      }
    };
    // AJOUTER cette nouvelle fonction
      const handleUserSearchChange = (value) => {
        setFilters(prev => ({
            ...prev,
            user_search: value
        }));
        // Ne pas appeler setCurrentPage ici : il est appelé par le debounce effect
        };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };
    const resetFilters = () => {
        setFilters({
            user_search: '',
            offer_id: '',
            status: 'all',
            date_from: '',
            date_to: '',
            period: ''
        });
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };


    const openDetailModal = (participation) => {
        setSelectedParticipation(participation);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedParticipation(null);
        setShowDetailModal(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'disapproved':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status) => {
        return status;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'disapproved':
                return 'text-red-700 bg-red-50 border-red-200';
            default:
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        }
    };

    const getCountryName = (code) => {
        const countries = {
            'FR': 'France',
            'BE': 'Belgique',
            'CH': 'Suisse',
            'CA': 'Canada',
            'DE': 'Allemagne',
            'ES': 'Espagne',
            'IT': 'Italie',
        };
        return countries[code] || code;
    };

    const getDate = (rawData) => {
        return rawData?.transaction?.date ?? null;
    };

    const getIp = (rawData) => {
        return rawData?.transaction?.anonymous_ip ?? null;
    };


    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des participations</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Suivez toutes les participations des utilisateurs aux missions.
                </p>
            </div>
             {/* Statistiques */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
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
                                    {pagination?.total || 0}
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
                                    Approved
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats.approved}
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
                                    Open
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats.open}
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
                                    Disapproved
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {stats.disapproved}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nouvelle section Filtres avancés */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filtres avancés</h3>
                    <button
                        onClick={resetFilters}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Réinitialiser
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtre Utilisateur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Utilisateur
                            </label>
                            <input
                                type="text"
                                placeholder="Nom ou email..."
                                value={filters.user_search}
                                onChange={(e) => handleUserSearchChange(e.target.value)}  // 🔥 CHANGER ici
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>


                    {/* Filtre Offre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Offre
                        </label>
                        <select
                            value={filters.offer_id}
                            onChange={(e) => handleFilterChange('offer_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes les offres</option>
                            {offers && offers.length > 0 && offers.map(offer => (
                                <option key={offer.id} value={offer.id}>
                                    {offer.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre Statut */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="open">Open</option>
                            <option value="approved">Approved</option>
                            <option value="disapproved">Disapproved</option>
                        </select>
                    </div>

                    {/* Filtre Période */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Période
                        </label>
                        <select
                            value={filters.period}
                            onChange={(e) => handleFilterChange('period', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="yesterday">Hier</option>
                            <option value="week">7 derniers jours</option>
                            <option value="month">30 derniers jours</option>
                            <option value="year">Cette année</option>
                        </select>
                    </div>
                </div>

                {/* Dates personnalisées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de début
                        </label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de fin
                        </label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Indicateur de filtres actifs */}
            {(filters.user_search || filters.offer_id || filters.status !== 'all' || filters.period || filters.date_from || filters.date_to) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                            Filtres actifs:
                            {filters.user_search && ` Utilisateur: "${filters.user_search}"`}
                            {filters.offer_id && ` Offre: ${offers.find(o => o.id == filters.offer_id)?.title}`}
                            {filters.status !== 'all' && ` Statut: ${filters.status}`}
                            {filters.period && ` Période: ${filters.period}`}
                            {(filters.date_from || filters.date_to) && ` Dates personnalisées`}
                        </span>
                        <span className="text-sm text-blue-600">
                            {pagination?.total || 0} résultat(s)
                        </span>
                    </div>
                </div>
            )}

            {/* Votre tableau existant des participations */}





            {/* Liste des participations */}
            <div className="card">
                {participations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Offre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Commission
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lien
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {participations.map((participation) => (
                                <tr key={participation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div
                                                    className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-primary-700">
                                                            {participation.user?.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {participation.user?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {participation.user?.email}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {getIp(participation.raw_data)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                            {participation.offer?.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getCountryName(participation.offer?.country)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1 text-green-600">
                                            <CurrencyEuroIcon className="h-4 w-4"/>
                                            <span className="text-sm font-medium">
                                                    1€
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(participation.status)}
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(participation.status)}`}>
                                                    {getStatusText(participation.status)}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className="block max-w-[8ch] truncate cursor-pointer"
                                            title={participation.deeplink}
                                        >
                                            {participation.deeplink || '-----'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(getDate(participation.raw_data)).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openDetailModal(participation)}
                                            className="text-primary-600 hover:text-primary-900 p-1"
                                            title="Voir les détails"
                                        >
                                            <EyeIcon className="h-4 w-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400"/>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {statusFilter === 'all' ? 'Aucune participation' : `Aucune participation ${statusFilter === 'en_attente' ? 'en attente' : statusFilter === 'validee' ? 'validée' : 'refusée'}`}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter === 'all'
                                ? 'Aucune participation n\'a été enregistrée pour le moment.'
                                : `Aucune participation avec ce statut.`
                            }
                        </p>
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

            {/* Modal détails participation */}
            {showDetailModal && selectedParticipation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Détails de la participation
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
                            <div className="space-y-6">
                                {/* Informations utilisateur */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Utilisateur</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Nom</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedParticipation.user?.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Email</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedParticipation.user?.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Pays</label>
                                            <p className="mt-1 text-sm text-gray-900">{getCountryName(selectedParticipation.user?.pays)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Statut compte</label>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedParticipation.user?.validated
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {selectedParticipation.user?.validated ? 'Validé' : 'En attente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations offre */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Offre</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Titre</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedParticipation.offer?.title}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Description</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedParticipation.offer?.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Commission</label>
                                                <p className="mt-1 text-sm font-medium text-green-600">
                                                    {selectedParticipation.offer?.commission}€
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Pays</label>
                                                <p className="mt-1 text-sm text-gray-900">{getCountryName(selectedParticipation.offer?.country)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations participation */}
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Participation</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Statut</label>
                                            <div className="mt-1 flex items-center space-x-2">
                                                {getStatusIcon(selectedParticipation.status)}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedParticipation.status)}`}>
                                                    {getStatusText(selectedParticipation.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Date de participation</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(selectedParticipation.clicked_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Dernière mise à jour</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(selectedParticipation.updated_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">ID Participation</label>
                                            <p className="mt-1 text-sm text-gray-900 font-mono">#{selectedParticipation.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Lien de tracking</label>
                                            <p className="mt-1 text-sm text-gray-900 font-mono">#{selectedParticipation.deeplink}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeDetailModal}
                                    className="btn-secondary"
                                >
                                    Fermer
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

export default ParticipationManagement;
