// src/components/auth/LoginForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../common/Loading';
import {NavbarLp} from "../landingpage/NavbarLp.tsx";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido'),
    senha: z
        .string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const { login, isLoginLoading, loginError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
        } catch (error) {
            // Erro tratado pelo React Query
            console.error('Erro no login:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <NavbarLp/>

            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Bem-vindo de volta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Entre com suas credenciais para acessar sua conta
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {loginError && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Erro ao fazer login
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            {(loginError as any)?.response?.data?.message ||
                                                'Email ou senha incorretos'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('senha')}
                                    id="senha"
                                    type="password"
                                    autoComplete="current-password"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.senha && (
                                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoginLoading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoginLoading ? (
                                    <Loading size="sm" />
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Entrar
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Não tem uma conta?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Cadastre-se
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};