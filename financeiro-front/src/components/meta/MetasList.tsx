// src/components/metas/MetasList.tsx

import { useState } from 'react';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert, SuccessAlert } from '../common/ErrorMessage';
import { Modal, ConfirmModal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { MetaForm } from './MetaForm';
import { MetaCard } from './MetaCard';
import { MetasResume } from './MetasResume';
import {
    useMetas,
    useDeleteMeta,
    useCancelarMeta,
    usePausarMeta,
    useRetomarMeta
} from '../../hooks/useMetas';
import { StatusMeta, type MetaParams, type Meta } from '../../types/meta';

export const MetasList = () => {
    // ==================== ESTADOS ====================
    const [page, setPage] = useState(0);
    const [filters] = useState<MetaParams>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMeta, setSelectedMeta] = useState<Meta | undefined>();
    const [metaToDelete, setMetaToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'TODAS' | StatusMeta>('TODAS');

    // ==================== HOOKS ====================
    const { data, isLoading, error } = useMetas({
        ...filters,
        page,
        status: activeTab !== 'TODAS' ? activeTab : undefined
    });

    const deleteMutation = useDeleteMeta();
    const cancelarMutation = useCancelarMeta();
    const pausarMutation = usePausarMeta();
    const retomarMutation = useRetomarMeta();

    // ==================== HANDLERS ====================

    /**
     * Abre modal para criar nova meta
     */
    const handleCreate = () => {
        setSelectedMeta(undefined);
        setIsModalOpen(true);
    };

    /**
     * Abre modal para editar meta existente
     */
    const handleEdit = (meta: Meta) => {
        setSelectedMeta(meta);
        setIsModalOpen(true);
    };

    /**
     * Abre modal de confirmação para deletar meta
     */
    const handleDelete = (id: number) => {
        setMetaToDelete(id);
        setIsDeleteModalOpen(true);
    };

    /**
     * Confirma e executa a exclusão da meta
     */
    const confirmDelete = async () => {
        if (!metaToDelete) return;

        try {
            await deleteMutation.mutateAsync(metaToDelete);
            setIsDeleteModalOpen(false);
            setMetaToDelete(null);
            showSuccess('Meta excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir meta:', error);
        }
    };

    /**
     * Cancela uma meta (irreversível)
     */
    const handleCancelar = async (id: number) => {
        try {
            await cancelarMutation.mutateAsync(id);
            showSuccess('Meta cancelada com sucesso!');
        } catch (error) {
            console.error('Erro ao cancelar meta:', error);
        }
    };

    /**
     * Pausa uma meta em andamento
     */
    const handlePausar = async (id: number) => {
        try {
            await pausarMutation.mutateAsync(id);
            showSuccess('Meta pausada com sucesso!');
        } catch (error) {
            console.error('Erro ao pausar meta:', error);
        }
    };

    /**
     * Retoma uma meta pausada
     */
    const handleRetomar = async (id: number) => {
        try {
            await retomarMutation.mutateAsync(id);
            showSuccess('Meta retomada com sucesso!');
        } catch (error) {
            console.error('Erro ao retomar meta:', error);
        }
    };

    /**
     * Exibe mensagem de sucesso temporária
     */
    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    /**
     * Muda a tab ativa e reseta a página
     */
    const handleTabChange = (tab: 'TODAS' | StatusMeta) => {
        setActiveTab(tab);
        setPage(0);
    };

    // ==================== RENDER ====================
    return (
        <Layout>
            {/* ========== HEADER ========== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
                    <p className="text-gray-600 mt-1">Gerencie seus objetivos e conquiste suas metas</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Nova Meta
                </button>
            </div>

            {/* ========== SUCCESS MESSAGE ========== */}
            {successMessage && (
                <SuccessAlert
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                    className="mb-6"
                />
            )}

            {/* ========== RESUMO ========== */}
            <MetasResume className="mb-6" />

            {/* ========== TABS DE FILTRO ========== */}
            <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6 flex gap-1 overflow-x-auto">
                {[
                    { key: 'TODAS', label: 'Todas', count: data?.totalElements },
                    { key: StatusMeta.EM_ANDAMENTO, label: 'Em Andamento' },
                    { key: StatusMeta.CONCLUIDA, label: 'Concluídas' },
                    { key: StatusMeta.PAUSADA, label: 'Pausadas' },
                    { key: StatusMeta.CANCELADA, label: 'Canceladas' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key as any)}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {tab.label}
                        {tab.key === 'TODAS' && tab.count !== undefined && (
                            <span className="ml-2 text-xs opacity-75">({tab.count})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ========== ERROR STATE ========== */}
            {error && (
                <ErrorAlert
                    title="Erro ao carregar metas"
                    message="Não foi possível carregar a lista de metas. Tente novamente."
                    className="mb-6"
                />
            )}

            {/* ========== LOADING STATE ========== */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 h-80">
                            <Loading variant="skeleton" />
                        </div>
                    ))}
                </div>
            ) : data && data.content.length > 0 ? (
                <>
                    {/* ========== GRID DE METAS ========== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {data.content.map((meta) => (
                            <MetaCard
                                key={meta.id}
                                meta={meta}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onCancelar={handleCancelar}
                                onPausar={handlePausar}
                                onRetomar={handleRetomar}
                            />
                        ))}
                    </div>

                    {/* ========== PAGINAÇÃO ========== */}
                    {data.totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={data.totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            ) : (
                /* ========== EMPTY STATE ========== */
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                        {activeTab === 'TODAS' ? (
                            <Target className="h-8 w-8 text-gray-400" />
                        ) : (
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === 'TODAS'
                            ? 'Nenhuma meta encontrada'
                            : `Nenhuma meta ${activeTab.toLowerCase()}`}
                    </h3>

                    <p className="text-gray-600 mb-6">
                        {activeTab === 'TODAS'
                            ? 'Comece criando sua primeira meta financeira e acompanhe seu progresso'
                            : `Você não possui metas com status "${activeTab}"`}
                    </p>

                    {activeTab === 'TODAS' && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Criar Primeira Meta
                        </button>
                    )}
                </div>
            )}

            {/* ========== MODAL DE FORMULÁRIO ========== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMeta(undefined);
                }}
                title={selectedMeta ? 'Editar Meta' : 'Nova Meta'}
                size="lg"
            >
                <MetaForm
                    meta={selectedMeta}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedMeta(undefined);
                        showSuccess(
                            selectedMeta
                                ? '🎯 Meta atualizada com sucesso!'
                                : '🎯 Meta criada com sucesso!'
                        );
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedMeta(undefined);
                    }}
                />
            </Modal>

            {/* ========== MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ========== */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setMetaToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita e todo o histórico de aportes será perdido permanentemente."
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </Layout>
    );
};