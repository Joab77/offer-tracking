import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { UserIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
    name: yup.string().required('Nom requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: yup.string().email('Email invalide').required('Email requis'),
});

const countries = [
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
];

const Profile = () => {
    const { user, checkAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            pays: user?.pays || '',
        },
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            await axios.put('/api/profile', data);
            toast.success('Profil mis à jour avec succès !');
            await checkAuth(); // Recharger les données utilisateur
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
            toast.error(message);
            
            if (error.response?.data?.errors) {
                Object.keys(error.response.data.errors).forEach((field) => {
                    setError(field, {
                        type: 'server',
                        message: error.response.data.errors[field][0],
                    });
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getCountryName = (code) => {
        const country = countries.find(c => c.code === code);
        return country ? country.name : code;
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Gérez vos informations personnelles et vos préférences de compte.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Informations du compte */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du compte</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-sm text-gray-500">Nom complet</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                    <p className="text-sm text-gray-500">Adresse email</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{getCountryName(user?.pays)}</p>
                                    <p className="text-sm text-gray-500">Pays</p>
                                </div>
                            </div>
                        </div>

                        {/* Statut du compte */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Statut du compte</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Compte validé</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user?.validated 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user?.validated ? 'Oui' : 'En attente'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type de compte</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user?.is_admin 
                                            ? 'bg-purple-100 text-purple-800' 
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user?.is_admin ? 'Administrateur' : 'Utilisateur'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulaire de modification */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Modifier mes informations</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nom complet
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="input-field mt-1"
                                    placeholder="Votre nom complet"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Adresse email
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="input-field mt-1"
                                    placeholder="votre@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="pays" className="block text-sm font-medium text-gray-700">
                                    Pays
                                </label>
                                <select
                                    {...register('pays')}
                                    className="input-field mt-1"
                                    disabled
                                >
                                    <option value="">Sélectionnez votre pays</option>
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    Le pays ne peut pas être modifié après l'inscription.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Sauvegarder les modifications</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;