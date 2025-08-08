import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
    email: yup.string().email('Email invalide').required('Email requis'),
});

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { forgotPassword } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        const result = await forgotPassword(data.email);
        setIsLoading(false);

        if (result.success) {
            setEmailSent(true);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Email envoyé !
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Nous avons envoyé un lien de réinitialisation à{' '}
                            <span className="font-medium">{getValues('email')}</span>
                        </p>
                        <p className="mt-4 text-sm text-gray-500">
                            Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Retour à la connexion
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
                        Mot de passe oublié
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Envoyer le lien de réinitialisation'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;