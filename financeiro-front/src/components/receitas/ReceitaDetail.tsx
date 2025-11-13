// src/components/receitas/ReceitaDetail.tsx
import { X, Edit2, Calendar, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useReceitas } from '../../hooks/useReceitas';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReceitaDetailProps {
    receitaId: number;
    onClose: () => void;
    onEdit: () => void;
}

export const ReceitaDetail = ({ receitaId, onClose, onEdit }: ReceitaDetailProps) => {
    const { useGetReceita } = useReceitas();
    const { data: receita, isLoading } = useGetReceita(receitaId);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!receita) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary-600" />
                        Detalhes da Receita
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Período */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Período
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-600">Data Início</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(receita.periodoInicio)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Data Fim</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(receita.periodoFim)}
                                </p>
                            </div>
                            {receita.diasUteis && (
                                <div>
                                    <p className="text-xs text-gray-600">Dias Úteis</p>
                                    <p className="text-sm font-medium text-gray-900">{receita.diasUteis}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Receitas */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Receitas
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Salário</span>
                                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(receita.salario)}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Auxílios</span>
                                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(receita.auxilios)}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Serviços Extras</span>
                                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(receita.servicosExtras)}
                </span>
                            </div>
                            <div className="pt-3 border-t border-green-200 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(receita.totalReceitas)}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Despesas */}
                    <div className="bg-red-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            Despesas
                        </h3>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total de Despesas</span>
                            <span className="text-lg font-bold text-red-600">
                {formatCurrency(receita.totalDespesas)}
              </span>
                        </div>
                    </div>

                    {/* Saldo */}
                    <div className={`rounded-lg p-4 ${
                        receita.saldo >= 0 ? 'bg-primary-50 border-primary-200' : 'bg-red-50 border-red-200'
                    } border`}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Saldo Final</h3>
                            <span className={`text-2xl font-bold ${
                                receita.saldo >= 0 ? 'text-primary-600' : 'text-red-600'
                            }`}>
                {formatCurrency(receita.saldo)}
              </span>
                        </div>
                    </div>

                    {/* Observações */}
                    {receita.observacoes && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Observações</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {receita.observacoes}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Informações do Sistema
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-600">Criado em</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(receita.createdAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Atualizado em</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(receita.updatedAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
