// src/components/auth/ProfilePage.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../common/Modal';
import { Loading } from '../common/Loading';

const updateProfileSchema = z.object({
    nome: z
        .string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    fotoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

const changePasswordSchema = z
    .object({
        senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
        novaSenha: z
            .string()
            .min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
        confirmacaoSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
    })
    .refine((data) => data.novaSenha === data.confirmacaoSenha, {
        message: 'As senhas não coincidem',
        path: ['confirmacaoSenha'],
    });

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ProfilePage = () => {
    const {
        user,
        updateProfile,
        changePassword,
        isUpdateProfileLoading,
        isChangePasswordLoading,
        updateProfileError,
        changePasswordError,
    } = useAuth();

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            nome: user?.nome || '',
            fotoUrl: user?.fotoUrl || '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmitProfile = async (data: UpdateProfileFormData) => {
        try {
            await updateProfile({
                nome: data.nome,
                fotoUrl: data.fotoUrl || undefined,
            });
            setSuccessMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        }
    };

    const onSubmitPassword = async (data: ChangePasswordFormData) => {
        try {
            await changePassword(data);
            setSuccessMessage('Senha alterada com sucesso!');
            setIsPasswordModalOpen(false);
            resetPasswordForm();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
        }
    };

    if (!user) {
        return <Loading fullScreen text="Carregando perfil..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                                {user.fotoUrl ? (
                                    <img
                                        src={user.fotoUrl}
                                        alt={user.nome}
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{user.nome}</h1>
                                <p className="text-blue-100">{user.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-blue-600 bg-white rounded-full">
                  {user.tipoUsuario === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mx-6 mt-6 rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Form */}
                    <div className="px-6 py-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">
                            Informações do Perfil
                        </h2>

                        {updateProfileError && (
                            <div className="mb-6 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {(updateProfileError as any)?.response?.data?.message ||
                                                'Erro ao atualizar perfil'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="nome"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Nome
                                </label>
                                <input
                                    {...registerProfile('nome')}
                                    type="text"
                                    id="nome"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {profileErrors.nome && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {profileErrors.nome.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="fotoUrl"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    URL da Foto (opcional)
                                </label>
                                <input
                                    {...registerProfile('fotoUrl')}
                                    type="text"
                                    id="fotoUrl"
                                    placeholder="https://exemplo.com/foto.jpg"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {profileErrors.fotoUrl && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {profileErrors.fotoUrl.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    O email não pode ser alterado
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isUpdateProfileLoading}
                                    className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdateProfileLoading ? (
                                        <Loading size="sm" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Alterar Senha
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    resetPasswordForm();
                }}
                title="Alterar Senha"
            >
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                    {changePasswordError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        {(changePasswordError as any)?.response?.data?.message ||
                                            'Erro ao alterar senha'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="senhaAtual"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Senha Atual
                        </label>
                        <input
                            {...registerPassword('senhaAtual')}
                            type="password"
                            id="senhaAtual"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {passwordErrors.senhaAtual && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.senhaAtual.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="novaSenha"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Nova Senha
                        </label>
                        <input
                            {...registerPassword('novaSenha')}
                            type="password"
                            id="novaSenha"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {passwordErrors.novaSenha && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.novaSenha.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmacaoSenha"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirmar Nova Senha
                        </label>
                        <input
                            {...registerPassword('confirmacaoSenha')}
                            type="password"
                            id="confirmacaoSenha"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {passwordErrors.confirmacaoSenha && (
                            <p className="mt-1 text-sm text-red-600">
                                {passwordErrors.confirmacaoSenha.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPasswordModalOpen(false);
                                resetPasswordForm();
                            }}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isChangePasswordLoading}
                            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isChangePasswordLoading ? <Loading size="sm" /> : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};