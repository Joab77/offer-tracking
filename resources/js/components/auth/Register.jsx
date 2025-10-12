import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
    name: yup.string().required('Nom requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: yup.string().email('Email invalide').required('Email requis'),
    password: yup.string().required('Mot de passe requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    password_confirmation: yup.string().oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
});

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Stockage du pays détecté
    const [country, setCountry] = useState(null);

    // Exemple : récupérer la localisation IP via un service public (à déplacer en backend en prod)
    useEffect(() => {
        fetch("https://ipinfo.io/json/") // tu peux remplacer par ton backend
            .then((res) => res.json())
            .then((data) => {
                setCountry(data.country_code)

            })
            .catch(() => setCountry("FR")); // fallback France
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);

        // on envoie le pays automatiquement avec les données
        const result = await registerUser({ ...data, country });

        setIsLoading(false);

        if (result.success) {

            navigate('/');

        } else if (result.errors) {
            // si register() renvoie des erreurs de validation
            Object.keys(result.errors).forEach((field) => {
                setError(field, {
                    type: 'server',
                    message: result.errors[field][0],
                });
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo + titre */}
                <div className="text-center mb-8">
                    <div
                        className="mx-auto h-16 w-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white font-bold  text-xl">
                        GainsExprex
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
                    <p className="text-gray-600">Rejoignez GainsExprex</p>
                </div>

                {/* Formulaire */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nom complet
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                autoComplete="name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                placeholder="Votre nom complet"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                placeholder="votre@email.com"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-4"
                                        onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500"/> : <EyeIcon className="h-5 w-5 text-gray-500"/>}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password_confirmation')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-4"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500"/> : <EyeIcon className="h-5 w-5 text-gray-500"/>}
                                </button>
                            </div>
                            {errors.password_confirmation && <p className="mt-2 text-sm text-red-600">{errors.password_confirmation.message}</p>}
                        </div>

                        {/* Bouton */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                        >
                            {isLoading ? "Création en cours..." : "Créer mon compte"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Se connecter</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
