import { useState } from 'react';
import { Plus, Edit, Trash2, Power, Search, Filter } from 'lucide-react';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert, SuccessAlert } from '../common/ErrorMessage';
import { Modal, ConfirmModal } from '../common/Modal';
import { CategoriaForm } from './CategoriaForm';
import {
    useCategorias,
    useCreateCategoria,
    useUpdateCategoria,
    useDeleteCategoria,
    useToggleCategoria,
    useResumoCategoria,
} from '../../hooks/useCategorias';
import { type Categoria, TipoCategoria, type CategoriaRequestDTO } from '../../types/categoria';
import { formatDate } from '../../utils/dateFormatter';

export const CategoriasList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | undefined>();
    const [categoriaToDelete, setCategoriaToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [filterTipo, setFilterTipo] = useState<TipoCategoria | 'TODAS'>('TODAS');
    const [filterAtiva, setFilterAtiva] = useState<'TODAS' | 'ATIVAS' | 'INATIVAS'>('TODAS');
    const [searchTerm, setSearchTerm] = useState('');

    const { categorias, isLoading, error } = useCategorias();
    const { resumo } = useResumoCategoria();
    const createMutation = useCreateCategoria();
    const updateMutation = useUpdateCategoria();
    const deleteMutation = useDeleteCategoria();
    const toggleMutation = useToggleCategoria();

    const handleCreate = () => {
        setSelectedCategoria(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (categoria: Categoria) => {
        setSelectedCategoria(categoria);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setCategoriaToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleToggle = async (categoria: Categoria) => {
        try {
            await toggleMutation.mutateAsync({ id: categoria.id, ativa: categoria.ativa });
            showSuccess(`Categoria ${categoria.ativa ? 'desativada' : 'ativada'} com sucesso!`);
        } catch (error) {
            console.error('Erro ao alternar status:', error);
        }
    };

    const confirmDelete = async () => {
        if (!categoriaToDelete) return;

        try {
            await deleteMutation.mutateAsync(categoriaToDelete);
            setIsDeleteModalOpen(false);
            setCategoriaToDelete(null);
            showSuccess('Categoria excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    const handleSubmit = async (data: CategoriaRequestDTO) => {
        try {
            if (selectedCategoria) {
                await updateMutation.mutateAsync({ id: selectedCategoria.id, data });
                showSuccess('Categoria atualizada com sucesso!');
            } else {
                await createMutation.mutateAsync(data);
                showSuccess('Categoria criada com sucesso!');
            }
            setIsModalOpen(false);
            setSelectedCategoria(undefined);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Filtrar categorias
    const filteredCategorias = categorias?.filter((cat) => {
        const matchTipo = filterTipo === 'TODAS' || cat.tipo === filterTipo;
        const matchAtiva =
            filterAtiva === 'TODAS' ||
            (filterAtiva === 'ATIVAS' && cat.ativa) ||
            (filterAtiva === 'INATIVAS' && !cat.ativa);
        const matchSearch =
            !searchTerm || cat.nome.toLowerCase().includes(searchTerm.toLowerCase());

        return matchTipo && matchAtiva && matchSearch;
    });

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
                    <p className="text-gray-600 mt-1">
                        Gerencie suas categorias de receitas e despesas
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Nova Categoria
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

            {/* Resumo */}
            {resumo && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{resumo.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-700">Ativas</p>
                        <p className="text-2xl font-bold text-green-600">{resumo.ativas}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-700">Receitas</p>
                        <p className="text-2xl font-bold text-blue-600">{resumo.porTipo.RECEITA}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm text-red-700">Despesas</p>
                        <p className="text-2xl font-bold text-red-600">{resumo.porTipo.DESPESA}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filter Tipo */}
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="TODAS">Todos os tipos</option>
                        <option value="RECEITA">Receitas</option>
                        <option value="DESPESA">Despesas</option>
                    </select>

                    {/* Filter Status */}
                    <select
                        value={filterAtiva}
                        onChange={(e) => setFilterAtiva(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="TODAS">Todos os status</option>
                        <option value="ATIVAS">Ativas</option>
                        <option value="INATIVAS">Inativas</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <ErrorAlert
                    title="Erro ao carregar categorias"
                    message="Não foi possível carregar a lista de categorias"
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
            ) : filteredCategorias && filteredCategorias.length > 0 ? (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategorias.map((categoria) => (
                        <div
                            key={categoria.id}
                            className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-md ${
                                categoria.ativa
                                    ? 'border-gray-200'
                                    : 'border-gray-300 bg-gray-50 opacity-75'
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-lg ${
                                            categoria.tipo === TipoCategoria.RECEITA
                                                ? 'bg-green-100'
                                                : 'bg-red-100'
                                        }`}
                                    >
                    <span className="text-2xl">
                      {categoria.tipo === TipoCategoria.RECEITA ? '💰' : '💸'}
                    </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{categoria.nome}</h3>
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                categoria.tipo === TipoCategoria.RECEITA
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                      {categoria.tipoDescricao}
                    </span>
                                    </div>
                                </div>
                                <div
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        categoria.ativa
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {categoria.ativa ? 'Ativa' : 'Inativa'}
                                </div>
                            </div>

                            {/* Info */}
                            {categoria.totalDespesas !== undefined && (
                                <div className="mb-4 text-sm text-gray-600">
                                    {categoria.totalDespesas} despesa(s) associada(s)
                                </div>
                            )}

                            <div className="text-xs text-gray-500 mb-4">
                                Criada em {formatDate(categoria.createdAt)}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(categoria)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleToggle(categoria)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                        categoria.ativa
                                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                                >
                                    <Power className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(categoria.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                        <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma categoria encontrada
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterTipo !== 'TODAS' || filterAtiva !== 'TODAS'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece criando sua primeira categoria'}
                    </p>
                    {!searchTerm && filterTipo === 'TODAS' && filterAtiva === 'TODAS' && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Criar Primeira Categoria
                        </button>
                    )}
                </div>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCategoria(undefined);
                }}
                title={selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                size="md"
            >
                <CategoriaForm
                    categoria={selectedCategoria}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedCategoria(undefined);
                    }}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCategoriaToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e todas as associações serão removidas."
                confirmText="Excluir"
                cancelText="Cancelar"
                isLoading={deleteMutation.isPending}
            />
        </Layout>
    );
};