import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    TagIcon,
    CurrencyEuroIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchOffer();
        checkParticipation();
    }, [id]);

    const fetchOffer = async () => {
        try {
            const response = await axios.get(`/api/offers`);
            const foundOffer = response.data.data.find(o => o.id === parseInt(id));
            if (foundOffer) {
                setOffer(foundOffer);
            } else {
                toast.error('Offre non trouvée');
                navigate('/offers');
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'offre:', error);
            toast.error('Erreur lors du chargement de l\'offre');
            navigate('/offers');
        } finally {
            setLoading(false);
        }
    };

    const checkParticipation = async () => {
        try {
            const response = await axios.get('/api/participations');
            const participation = response.data.data.find(p => p.offer_id === parseInt(id));
            setHasApplied(!!participation);
        } catch (error) {
            console.error('Erreur lors de la vérification de la participation:', error);
        }
    };

    const handleApply = async () => {
        try {
            setApplying(true);
            const response = await axios.post(`/api/offers/${id}/apply`);

            toast.success('Participation enregistrée avec succès !');
            setHasApplied(true);

            // Ouvrir le lien d'affiliation dans un nouvel onglet
            if (response.data.affiliate_url) {
                window.open(response.data.affiliate_url, '_blank');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la participation';
            toast.error(message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!offer) {
        return (
            <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">Offre non trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Cette offre n'existe pas ou n'est plus disponible.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div>
                <button
                    onClick={() => navigate('/offers')}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Retour aux offres
                </button>
            </div>

            {/* Détail de l'offre */}
            <div className="card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image */}
                    {offer.image_url && (
                        <div className="aspect-w-16 aspect-h-9">
                            <img
                                src={offer.image_url}
                                alt={offer.title}
                                className="w-full h-64 lg:h-full object-cover rounded-lg"
                            />
                        </div>
                    )}

                    {/* Contenu */}
                    <div className={offer.image_url ? '' : 'lg:col-span-2'}>
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0">
                                <TagIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {offer.title}
                                </h1>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <CurrencyEuroIcon className="h-5 w-5" />
                                        <span className="text-lg font-semibold">
                                            {offer.commission}€ de commission
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {offer.country}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {offer.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            {hasApplied ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">
                                                Participation enregistrée
                                            </h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>
                                                    Vous avez déjà participé à cette offre. Consultez vos participations pour suivre le statut.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="btn-primary w-full lg:w-auto flex items-center justify-center space-x-2 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <ArrowLeftIcon className="h-5 w-5" />
                                            <span>Participer à cette offre</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">
                                    Comment ça marche ?
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Cliquez sur "Participer à cette offre"</li>
                                    <li>• Vous serez redirigé vers le site partenaire</li>
                                    <li>• Effectuez l'action demandée (achat, inscription, etc.)</li>
                                    <li>• Votre commission sera validée automatiquement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferDetail;
