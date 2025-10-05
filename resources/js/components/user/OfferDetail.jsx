import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '@/utils/alert';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    TagIcon,
    CurrencyEuroIcon,
    ArrowLeftIcon,
    LinkIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
        // debug states pour afficher la réponse brute
    const [lastResponse, setLastResponse] = useState(null);
    const [lastStatus, setLastStatus] = useState(null);

    useEffect(() => {
        if (!id) {
            console.warn('OfferDetail: id manquant dans l\'URL');
            setLoading(false);
            return;
        }

        // Charge l'offre sans header (backend gère le pays)
        fetchOffer();
        checkParticipation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchOffer = async () => {
        setLoading(true);
        try {
            console.log("fetchOffer - id:", id);
            const response = await axios.get(`/api/offers/${id}`);
            console.log("fetchOffer response:", response);
            // stocke la réponse brute pour debug
            setLastStatus(response?.status);
            setLastResponse(response?.data ?? null);

            // Comme dans OffersList, preferer response.data.data puis fallback sur response.data
        
            const payload = response?.data?.data ?? response?.data ?? null;


            if (!payload) {
                console.warn('fetchOffer: payload vide', response);
                Alert.error('Offre non trouvée');
                setOffer(null);
                return;
            }

            // Si payload contient wrapper (adapter si nécessaire)
            // Exemple OffersList stocke response.data.data pour chaque offre
            // Ici on assume payload est l'objet offre ou contient directement les champs
            setOffer(payload);
        } catch (error) {
            console.error("Erreur lors du chargement de l'offre:", error);
            Alert.error(error.response?.data?.message || "Erreur lors du chargement de l'offre");
            setOffer(null);
        } finally {
            setLoading(false);
        }
    };

    const checkParticipation = async () => {
        try {
            const response = await axios.get('/api/participations');
            const participation = response?.data?.data?.find(p => p.offer_id === parseInt(id, 10));
            setHasApplied(!!participation);
        } catch (error) {
            console.error('Erreur lors de la vérification de la participation:', error);
        }
    };

    const handleParticipate = async (isApply = true) => {
        if (!offer) return;
        try {
            setApplying(true);
            const response = await axios.post(`/api/offers/${id}/apply`, {});

            if (response.data?.action === 'continue') {
                Alert.info('Redirection vers votre mission...');
            } else {
                Alert.success('Participation enregistrée avec succès !');
                setHasApplied(true);
            }

            const deeplink = response.data?.deeplink || offer.deeplink;
            if (deeplink) window.open(deeplink, '_blank');
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la participation';
            Alert.error(message);
        } finally {
            setApplying(false);
        }
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
            <div>
                <button
                    onClick={() => navigate('/offers')}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Retour aux offres
                </button>
            </div>

            <div className="card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {offer.image_url && (
                        <div className="aspect-w-16 aspect-h-9">
                            <img
                                src={offer.image_url}
                                alt={offer.title}
                                className="w-full h-64 lg:h-full object-cover rounded-lg"
                            />
                        </div>
                    )}

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
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {offer.country}
                                    </span>
                                    {offer.status &&
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(offer.status)}`}>
                                            {offer.status}
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {offer.description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {hasApplied ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">Vous participez à cette offre</h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>
                                                    Cliquez sur "Continuer la mission" pour accéder à nouveau au lien d'affiliation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleParticipate(false)}
                                            disabled={applying}
                                            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {applying ? (
                                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <LinkIcon className="h-4 w-4" />
                                                    <span>Continuer la mission</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleParticipate(true)}
                                    disabled={applying}
                                    className="btn-primary w-full lg:w-auto flex items-center justify-center space-x-2 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <LinkIcon className="h-5 w-5" />
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
                                    <li>• Le statut de l'offre sera mis à jour automatiquement</li>
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