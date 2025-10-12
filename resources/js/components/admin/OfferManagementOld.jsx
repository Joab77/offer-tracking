import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const initialFormState = {
    title: '',
    description: '',
    commission: '',
    country: '',
    image_url: '',
};

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal & form states
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOffers(currentPage);
    }, [currentPage]);

    const fetchOffers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/offers?page=${page}`);
            setOffers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            alert('Erreur lors du chargement des offres.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const openModalForCreate = () => {
        setEditingOfferId(null);
        setForm(initialFormState);
        setFormErrors({});
        setModalOpen(true);
    };

    const openModalForEdit = (offer) => {
        setEditingOfferId(offer.id);
        setForm({
            title: offer.title || '',
            description: offer.description || '',
            commission: offer.commission || '',
            country: offer.country || '',
            image_url: offer.image_url || '',
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return; // Prevent close while saving
        setModalOpen(false);
    };

    const validateForm = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'Le titre est obligatoire.';
        if (!form.commission || isNaN(form.commission)) errors.commission = 'La commission doit être un nombre.';
        if (!form.country.trim()) errors.country = 'Le pays est obligatoire.';
        // Ajoute d'autres validations si besoin
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            if (editingOfferId) {
                // Modifier
                await axios.put(`/api/admin/offers/${editingOfferId}`, form);
                alert('Offre mise à jour avec succès.');
            } else {
                // Créer
                await axios.post('/api/admin/offers', form);
                alert('Offre créée avec succès.');
            }
            setModalOpen(false);
            fetchOffers(currentPage);
        } catch (error) {
            alert('Erreur lors de la sauvegarde.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
        try {
            await axios.delete(`/api/admin/offers/${id}`);
            setOffers(offers.filter(o => o.id !== id));
            alert('Offre supprimée.');
        } catch (error) {
            alert('Erreur lors de la suppression.');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des offres</h1>
                    <p className="mt-1 text-sm text-gray-600">Ajoutez, modifiez ou supprimez des missions.</p>
                </div>
                <button
                    onClick={openModalForCreate}
                    className="btn-primary flex items-center space-x-2"
                    disabled={loading}
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvelle offre</span>
                </button>
            </div>

            {/* Table */}
            {loading && currentPage === 1 ? (
                <LoadingSpinner />
            ) : offers.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pays</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission (€)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {offers.map(offer => (
                            <tr key={offer.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">{offer.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{offer.country}</td>
                                <td className="px-6 py-4 text-sm text-green-600 font-medium">{offer.commission}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openModalForEdit(offer)}
                                        className="text-blue-600 hover:text-blue-800"
                                        disabled={saving}
                                        title="Modifier"
                                    >
                                        <PencilIcon className="h-5 w-5 inline" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="text-red-600 hover:text-red-800"
                                        disabled={saving}
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="h-5 w-5 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                            {[...Array(pagination.last_page)].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        disabled={loading || saving}
                                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                                            page === pagination.current_page
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-sm font-medium text-gray-900">Aucune offre trouvée</p>
                    <p className="mt-1 text-sm text-gray-500">Créez votre première offre en cliquant sur “Nouvelle offre”.</p>
                </div>
            )}

            {/* Modal formulaire */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
                        onClick={e => e.stopPropagation()} // Empêche la fermeture en cliquant dans la boîte
                    >
                        <button
                            onClick={closeModal}
                            disabled={saving}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">{editingOfferId ? 'Modifier l\'offre' : 'Nouvelle offre'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Titre
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className={`input-field ${formErrors.title ? 'border-red-500' : ''}`}
                                    disabled={saving}
                                />
                                {formErrors.title && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="input-field"
                                    disabled={saving}
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label htmlFor="commission" className="block text-sm font-medium text-gray-700">
                                    Commission (€)
                                </label>
                                <input
                                    type="number"
                                    name="commission"
                                    id="commission"
                                    value={form.commission}
                                    onChange={handleChange}
                                    className={`input-field ${formErrors.commission ? 'border-red-500' : ''}`}
                                    disabled={saving}
                                    step="0.01"
                                    min="0"
                                />
                                {formErrors.commission && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.commission}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    id="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    className={`input-field ${formErrors.country ? 'border-red-500' : ''}`}
                                    disabled={saving}
                                />
                                {formErrors.country && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                                    URL de l'image (optionnel)
                                </label>
                                <input
                                    type="text"
                                    name="image_url"
                                    id="image_url"
                                    value={form.image_url}
                                    onChange={handleChange}
                                    className="input-field"
                                    disabled={saving}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="btn-secondary"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary"
                                >
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
