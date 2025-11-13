import { useState } from 'react';
import { Plus, Settings, Search } from 'lucide-react';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert, SuccessAlert } from '../common/ErrorMessage';
import { Modal, ConfirmModal } from '../common/Modal';
import { ParametroForm } from './ParametroForm';
import { ParametroCard } from './ParametroCard';
import { useParametros, useDeleteParametro } from '../../hooks/useParametros';
import {type Parametro, TipoParametro} from "../../types/parametro.ts";

export const ParametrosList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedParametro, setSelectedParametro] = useState<Parametro | undefined>();
    const [parametroToDelete, setParametroToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState<TipoParametro | 'TODOS'>('TODOS');

    const { data: parametros, isLoading, error } = useParametros();
    const deleteMutation = useDeleteParametro();

    const handleCreate = () => {
        setSelectedParametro(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (parametro: Parametro) => {
        setSelectedParametro(parametro);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setParametroToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!parametroToDelete) return;
        try {
            await deleteMutation.mutateAsync(parametroToDelete);
            setIsDeleteModalOpen(false);
            setParametroToDelete(null);
            showSuccess('Parâmetro excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Filtrar parâmetros
    const filteredParametros = parametros?.filter((param) => {
        const matchTipo = filterTipo === 'TODOS' || param.tipo === filterTipo;
        const matchSearch =
            !searchTerm ||
            param.chave.toLowerCase().includes(searchTerm.toLowerCase()) ||
            param.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTipo && matchSearch;
    });

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Parâmetros do Sistema</h1>
                    <p className="text-gray-600 mt-1">Configure as definições do seu aplicativo</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Novo Parâmetro
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <SuccessAlert
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                    className="mb-6"
                />
            )}

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por chave ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Filter Tipo */}
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="TODOS">Todos os tipos</option>
                        <option value={TipoParametro.STRING}>String</option>
                        <option value={TipoParametro.NUMBER}>Number</option>
                        <option value={TipoParametro.BOOLEAN}>Boolean</option>
                        <option value={TipoParametro.JSON}>JSON</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <ErrorAlert
                    title="Erro ao carregar parâmetros"
                    message="Não foi possível carregar os parâmetros"
                    className="mb-6"
                />
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                            <Loading variant="skeleton" />
                        </div>
                    ))}
                </div>
            ) : filteredParametros && filteredParametros.length > 0 ? (
                /* Lista de Parâmetros */
                <div className="space-y-3">
                    {filteredParametros.map((parametro) => (
                        <ParametroCard
                            key={parametro.id}
                            parametro={parametro}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                        <Settings className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum parâmetro encontrado
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterTipo !== 'TODOS'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando seu primeiro parâmetro'}
                    </p>
                    {!searchTerm && filterTipo === 'TODOS' && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Criar Primeiro Parâmetro
                        </button>
                    )}
                </div>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedParametro(undefined);
                }}
                title={selectedParametro ? 'Editar Parâmetro' : 'Novo Parâmetro'}
                size="md"
            >
                <ParametroForm
                    parametro={selectedParametro}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedParametro(undefined);
                        showSuccess(
                            selectedParametro
                                ? 'Parâmetro atualizado com sucesso!'
                                : 'Parâmetro criado com sucesso!'
                        );
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedParametro(undefined);
                    }}
                />
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setParametroToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este parâmetro? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </Layout>
    );
};