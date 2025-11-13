// src/components/auth/RegisterForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../common/Loading';

const registerSchema = z
    .object({
        nome: z
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .max(100, 'Nome deve ter no máximo 100 caracteres'),
        email: z
            .string()
            .min(1, 'Email é obrigatório')
            .email('Email inválido'),
        senha: z
            .string()
            .min(6, 'Senha deve ter no mínimo 6 caracteres')
            .max(50, 'Senha deve ter no máximo 50 caracteres'),
        confirmacaoSenha: z
            .string()
            .min(1, 'Confirmação de senha é obrigatória'),
    })
    .refine((data) => data.senha === data.confirmacaoSenha, {
        message: 'As senhas não coincidem',
        path: ['confirmacaoSenha'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
    const { register: registerUser, isRegisterLoading, registerError } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const senha = watch('senha');

    const getPasswordStrength = (password: string): {
        strength: number;
        label: string;
        color: string;
    } => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

        return {
            strength: Math.min(strength, 5),
            label: labels[Math.min(strength - 1, 4)],
            color: colors[Math.min(strength - 1, 4)],
        };
    };

    const passwordStrength = getPasswordStrength(senha);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data);
        } catch (error) {
            console.error('Erro no registro:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Criar nova conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Preencha os dados abaixo para começar
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {registerError && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Erro ao criar conta
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            {(registerError as any)?.response?.data?.message ||
                                                'Ocorreu um erro ao criar sua conta'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                Nome completo
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('nome')}
                                    id="nome"
                                    type="text"
                                    autoComplete="name"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Seu nome"
                                />
                            </div>
                            {errors.nome && (
                                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                            )}
                        </div>

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
                                    autoComplete="new-password"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            {senha && passwordStrength.strength > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                                    </div>
                                </div>
                            )}
                            {errors.senha && (
                                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmacaoSenha" className="block text-sm font-medium text-gray-700">
                                Confirmar senha
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    {...register('confirmacaoSenha')}
                                    id="confirmacaoSenha"
                                    type="password"
                                    autoComplete="new-password"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmacaoSenha && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmacaoSenha.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isRegisterLoading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isRegisterLoading ? (
                                    <Loading size="sm" />
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Criar conta
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Já tem uma conta?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Faça login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};