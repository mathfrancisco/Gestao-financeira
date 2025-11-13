import { useState } from 'react';
import { Plus, AlertCircle,  Filter as FilterIcon } from 'lucide-react';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert, SuccessAlert } from '../common/ErrorMessage';
import { Modal, ConfirmModal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { DespesaForm } from './DespesaForm';
import { DespesaFilters } from './DespesaFilters';
import { DespesaCard } from './DespesaCard';
import {
    useDespesas,
    useDeleteDespesa,
    useMarcarComoPaga,
    useMarcarComoPendente
} from '../../hooks/useDespesas';
import { StatusPagamento, type DespesaParams, type Despesa } from '../../types/despesa';
import { formatCurrency } from '../../utils/currencyFormatter';

export const DespesasList = () => {
    // Estados
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<DespesaParams>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [selectedDespesa, setSelectedDespesa] = useState<Despesa | undefined>();
    const [despesaToDelete, setDespesaToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Hooks
    const { data, isLoading, error } = useDespesas({ ...filters, page });
    const deleteMutation = useDeleteDespesa();
    const marcarPagaMutation = useMarcarComoPaga();
    const marcarPendenteMutation = useMarcarComoPendente();

    // Handlers
    const handleCreate = () => {
        setSelectedDespesa(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (despesa: Despesa) => {
        setSelectedDespesa(despesa);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setDespesaToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!despesaToDelete) return;
        try {
            await deleteMutation.mutateAsync(despesaToDelete);
            setIsDeleteModalOpen(false);
            setDespesaToDelete(null);
            showSuccess('Despesa excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    const handleToggleStatus = async (despesa: Despesa) => {
        try {
            if (despesa.status === StatusPagamento.PAGO) {
                await marcarPendenteMutation.mutateAsync(despesa.id);
                showSuccess('Despesa marcada como pendente!');
            } else {
                await marcarPagaMutation.mutateAsync(despesa.id);
                showSuccess('Despesa marcada como paga!');
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleApplyFilters = (newFilters: DespesaParams) => {
        setFilters(newFilters);
        setPage(0);
        setIsFiltersOpen(false);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Renderização
    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
                    <p className="text-gray-600 mt-1">Gerencie suas despesas mensais</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-all"
                    >
                        <FilterIcon className="h-5 w-5" />
                        Filtros
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        Nova Despesa
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <SuccessAlert
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                    className="mb-6"
                />
            )}

            {/* Stats Cards */}
            {data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600">Total de Despesas</p>
                        <p className="text-2xl font-bold text-gray-900">{data.totalElements}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm text-red-700">Total Gasto</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(
                                data.content.reduce((sum, d) => sum + d.valor, 0)
                            )}
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-700">Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {data.content.filter(d => d.status === StatusPagamento.PENDENTE).length}
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <ErrorAlert
                    title="Erro ao carregar despesas"
                    message="Não foi possível carregar a lista de despesas"
                    className="mb-6"
                />
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                            <Loading variant="skeleton" />
                        </div>
                    ))}
                </div>
            ) : data && data.content.length > 0 ? (
                <>
                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {data.content.map((despesa) => (
                            <DespesaCard
                                key={despesa.id}
                                despesa={despesa}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                    />
                </>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma despesa encontrada
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {Object.keys(filters).length > 0
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece registrando sua primeira despesa'}
                    </p>
                    {Object.keys(filters).length === 0 && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Criar Primeira Despesa
                        </button>
                    )}
                </div>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDespesa(undefined);
                }}
                title={selectedDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                size="lg"
            >
                <DespesaForm
                    despesa={selectedDespesa}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setSelectedDespesa(undefined);
                        showSuccess(
                            selectedDespesa
                                ? 'Despesa atualizada com sucesso!'
                                : 'Despesa criada com sucesso!'
                        );
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedDespesa(undefined);
                    }}
                />
            </Modal>

            {/* Filters Modal */}
            <Modal
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                title="Filtros"
                size="md"
            >
                <DespesaFilters
                    onApply={handleApplyFilters}
                    onClose={() => setIsFiltersOpen(false)}
                    initialFilters={filters}
                />
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDespesaToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </Layout>
    );
};