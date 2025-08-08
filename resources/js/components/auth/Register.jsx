import React, { useState } from 'react';
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
    pays: yup.string().required('Pays requis'),
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

    const onSubmit = async (data) => {
        setIsLoading(true);
        const result = await registerUser(data);
        setIsLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else if (result.errors) {
            Object.keys(result.errors).forEach((field) => {
                setError(field, {
                    type: 'server',
                    message: result.errors[field][0],
                });
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Créer votre compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ou{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            connectez-vous à votre compte existant
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nom complet
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                autoComplete="name"
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
                                autoComplete="email"
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
                            >
                                <option value="">Sélectionnez votre pays</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {errors.pays && (
                                <p className="mt-1 text-sm text-red-600">{errors.pays.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    {...register('password_confirmation')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Créer mon compte'
                            )}
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                        En créant un compte, vous acceptez nos conditions d'utilisation.
                        Votre compte sera validé par un administrateur avant activation.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;