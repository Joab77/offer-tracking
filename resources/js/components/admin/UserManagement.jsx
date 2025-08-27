import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    UsersIcon,
    CheckCircleIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [validating, setValidating] = useState(null);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, search, filter]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            let url = `/api/admin/users?page=${page}`;

            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            if (filter !== 'all') {
                url += `&validated=${filter === 'validated' ? '1' : '0'}`;
            }

            const response = await axios.get(url);
            setUsers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateUser = async (userId) => {
        try {
            setValidating(userId);
            await axios.patch(`/api/admin/users/${userId}/validate`);
            toast.success('Utilisateur validé avec succès !');
            fetchUsers(currentPage);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la validation';
            toast.error(message);
        } finally {
            setValidating(null);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setShowUserModal(false);
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

    if (loading && currentPage === 1) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gérez les inscriptions et validez les comptes utilisateurs.
                </p>
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
                                placeholder="Rechercher par nom ou email..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">Tous les utilisateurs</option>
                            <option value="validated">Validés</option>
                            <option value="pending">En attente</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                                    Validés
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    {users.filter(u => u.validated).length}
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
                                    {users.filter(u => !u.validated).length}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="card">
                {users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pays
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Inscription
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                          <span className="text-sm font-medium text-primary-700">
                                                              {user.name.charAt(0).toUpperCase()}
                                                          </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                  {getCountryName(user.pays)}
                                              </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                  user.validated
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                  {user.validated ? 'Validé' : 'En attente'}
                                              </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openUserModal(user)}
                                                className="text-primary-600 hover:text-primary-900 p-1"
                                                title="Voir les détails"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            {!user.validated && (
                                                <button
                                                    onClick={() => handleValidateUser(user.id)}
                                                    disabled={validating === user.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {validating === user.id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        'Valider'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Aucun utilisateur ne correspond à vos critères de recherche.
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

            {/* Modal détails utilisateur */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Détails de l'utilisateur
                                </h3>
                                <button
                                    onClick={closeUserModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pays</label>
                                    <p className="mt-1 text-sm text-gray-900">{getCountryName(selectedUser.pays)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        selectedUser.validated
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                          {selectedUser.validated ? 'Validé' : 'En attente'}
                                      </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date d'inscription</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', {
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
                                    onClick={closeUserModal}
                                    className="btn-secondary"
                                >
                                    Fermer
                                </button>
                                {!selectedUser.validated && (
                                    <button
                                        onClick={() => {
                                            handleValidateUser(selectedUser.id);
                                            closeUserModal();
                                        }}
                                        disabled={validating === selectedUser.id}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Valider l'utilisateur
                                    </button>
                                )}
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

export default UserManagement;
