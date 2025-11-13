// src/components/receitas/ReceitasList.tsx
import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    TrendingUp,
    Edit2,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Layout } from '../common/Layout';
import { useReceitas } from '../../hooks/useReceitas';
import { ReceitaForm } from './ReceitaForm';
import { ReceitaDetail } from './ReceitaDetail';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Receita } from '../../types/receita';

export const ReceitasList = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const {
        receitas,
        pagination,
        isLoading,
        deleteReceita,
        isDeleting
    } = useReceitas({ page: currentPage, size: 10 });

    const handleEdit = (receita: Receita) => {
        setSelectedReceita(receita);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleView = (receita: Receita) => {
        setSelectedReceita(receita);
        setShowDetail(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
            deleteReceita(id);
        }
    };

    const handleCreate = () => {
        setSelectedReceita(null);
        setIsEditing(false);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedReceita(null);
        setIsEditing(false);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedReceita(null);
    };

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-primary-600" />
                            Receitas
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gerencie seus períodos de receita e acompanhe suas entradas
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Receita
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar receitas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Filtros
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Início
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data Fim
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-end">
                            <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total de Receitas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {pagination.totalElements}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Receita Média</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {formatCurrency(
                                    receitas.reduce((sum, r) => sum + r.totalReceitas, 0) / (receitas.length || 1)
                                )}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Saldo Total</p>
                            <p className="text-2xl font-bold text-primary-600 mt-1">
                                {formatCurrency(
                                    receitas.reduce((sum, r) => sum + r.saldo, 0)
                                )}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-600">Carregando...</div>
                ) : receitas.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        Nenhuma receita encontrada. Crie sua primeira receita!
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Período
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Dias Úteis
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Receitas
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Despesas
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Saldo
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {receitas.map((receita) => (
                                    <tr key={receita.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(receita.periodoInicio)} - {formatDate(receita.periodoFim)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {receita.diasUteis || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-semibold text-green-600">
                                                {formatCurrency(receita.totalReceitas)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-semibold text-red-600">
                                                {formatCurrency(receita.totalDespesas)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-sm font-bold ${
                                                receita.saldo >= 0 ? 'text-primary-600' : 'text-red-600'
                                            }`}>
                                                {formatCurrency(receita.saldo)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(receita)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(receita)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(receita.id)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Mostrando {receitas.length} de {pagination.totalElements} receitas
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={pagination.first}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Página {pagination.currentPage + 1} de {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages - 1, prev + 1))}
                                        disabled={pagination.last}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showForm && (
                <ReceitaForm
                    receita={selectedReceita}
                    isEditing={isEditing}
                    onClose={handleCloseForm}
                />
            )}

            {showDetail && selectedReceita && (
                <ReceitaDetail
                    receitaId={selectedReceita.id}
                    onClose={handleCloseDetail}
                    onEdit={() => {
                        handleCloseDetail();
                        handleEdit(selectedReceita);
                    }}
                />
            )}
        </Layout>
    );
};