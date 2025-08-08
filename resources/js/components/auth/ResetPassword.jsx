import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
    email: yup.string().email('Email invalide').required('Email requis'),
    password: yup.string().required('Mot de passe requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    password_confirmation: yup.string().oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
});

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: email || '',
        },
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        const result = await resetPassword({
            ...data,
            token,
        });
        setIsLoading(false);

        if (result.success) {
            navigate('/login');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Lien invalide
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Ce lien de réinitialisation n'est pas valide ou a expiré.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/forgot-password"
                                className="btn-primary inline-block"
                            >
                                Demander un nouveau lien
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Réinitialiser votre mot de passe
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Entrez votre nouveau mot de passe ci-dessous.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
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
                                readOnly
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Nouveau mot de passe
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
                                Confirmer le nouveau mot de passe
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
                                'Réinitialiser le mot de passe'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;