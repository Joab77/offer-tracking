import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from '@/utils/alert';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    CogIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const schema = yup.object({
    publisher_id: yup.string().required('Publisher ID requis'),
    username: yup.string().required('Nom d\'utilisateur requis'),
    password: yup.string().required('Mot de passe requis').min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const DaisyconSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testing, setTesting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncInfo, setSyncInfo] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/daisycon/settings');
            const { settings, sync_info } = response.data;

            if (settings.publisher_id) setValue('publisher_id', settings.publisher_id);
            if (settings.username) setValue('username', settings.username);

            setSyncInfo(sync_info);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            Alert.error('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            await axios.post('/api/admin/daisycon/settings', data);
            Alert.success('Paramètres sauvegardés avec succès !');
            setConnectionStatus(null); // Reset connection status
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            Alert.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const testConnection = async () => {
        try {
            setTesting(true);
            const response = await axios.post('/api/admin/daisycon/test');
            setConnectionStatus({
                success: true,
                message: response.data.message
            });
            Alert.success('Connexion réussie !');
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur de connexion';
            setConnectionStatus({
                success: false,
                message: message
            });
            Alert.error(message);
        } finally {
            setTesting(false);
        }
    };

    const syncNow = async () => {
        try {
            setSyncing(true);
            const response = await axios.post('/api/admin/daisycon/sync');
            Alert.success(response.data.message);
            fetchSettings(); // Refresh sync info
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la synchronisation';
            Alert.error(message);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Daisycon</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Configurez vos identifiants Daisycon pour la synchronisation automatique des transactions.
                </p>
            </div>

            {/* Informations de synchronisation */}
            {syncInfo && (
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de synchronisation</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center space-x-3">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Dernière synchronisation</p>
                                <p className="text-sm text-gray-500">
                                    {syncInfo.last_sync
                                        ? new Date(syncInfo.last_sync).toLocaleString('fr-FR')
                                        : 'Jamais'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Transactions synchronisées</p>
                                <p className="text-sm text-gray-500">{syncInfo.last_sync_count}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={syncNow}
                            disabled={syncing}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {syncing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ArrowPathIcon className="h-4 w-4" />
                            )}
                            <span>{syncing ? 'Synchronisation...' : 'Synchroniser les offres'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Formulaire de configuration */}
            <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                    <CogIcon className="h-6 w-6 text-primary-600" />
                    <h3 className="text-lg font-medium text-gray-900">Identifiants API Daisycon</h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publisher ID
                        </label>
                        <input
                            {...register('publisher_id')}
                            type="text"
                            className="input-field"
                            placeholder="Votre Publisher ID Daisycon"
                        />
                        {errors.publisher_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.publisher_id.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            {...register('username')}
                            type="text"
                            className="input-field"
                            placeholder="Votre nom d'utilisateur Daisycon"
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            {...register('password')}
                            type="password"
                            className="input-field"
                            placeholder="Votre mot de passe Daisycon"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Statut de connexion */}
                    {connectionStatus && (
                        <div className={`p-4 rounded-lg border ${
                            connectionStatus.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {connectionStatus.success ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                )}
                                <p className={`text-sm font-medium ${
                                    connectionStatus.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {connectionStatus.message}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between space-x-4">
                        <button
                            type="button"
                            onClick={testConnection}
                            disabled={testing}
                            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testing ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                            )}
                            <span>{testing ? 'Test en cours...' : 'Tester la connexion'}</span>
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CogIcon className="h-4 w-4" />
                            )}
                            <span>{submitting ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Informations sur la synchronisation automatique */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Synchronisation automatique
                </h4>
                <p className="text-sm text-blue-800">
                    La synchronisation des offres avec l'API Daisycon s'effectue automatiquement toutes les nuits à 2h00.
                    Cette synchronisation met à jour les statuts, commissions et autres données des offres existantes.
                </p>
            </div>
        </div>
    );
};

export default DaisyconSettings;
