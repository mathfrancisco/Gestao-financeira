import { useState } from 'react';
import { ArrowLeft, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert, SuccessAlert } from '../common/ErrorMessage';
import { Modal } from '../common/Modal';
import { MetaProgressBar } from './MetaProgressBar';
import { AporteForm } from './AporteForm';
import { TransacoesMetaTable } from './TransacoesMetaTable';
import { MetaEvolutionChart } from './MetaEvolutionChart';
import { useMetaWithTransacoes } from '../../hooks/useMetas';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormatter';
import { getMetaStatusBadge, getMetaTipoIcon } from '../../utils/metaHelpers';

export const MetaDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isAporteModalOpen, setIsAporteModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { data: meta, isLoading, error } = useMetaWithTransacoes(Number(id));

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <Loading size="lg" />
                </div>
            </Layout>
        );
    }

    if (error || !meta) {
        return (
            <Layout>
                <ErrorAlert
                    title="Erro ao carregar meta"
                    message="Não foi possível carregar os detalhes da meta"
                />
            </Layout>
        );
    }

    const statusConfig = getMetaStatusBadge(meta.status);
    const TipoIcon = getMetaTipoIcon(meta.tipo);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/metas')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Voltar para Metas
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-lg ${
                            meta.tipo === 'ECONOMIA' ? 'bg-blue-100' :
                                meta.tipo === 'INVESTIMENTO' ? 'bg-green-100' :
                                    'bg-purple-100'
                        }`}>
                            <TipoIcon className={`h-8 w-8 ${
                                meta.tipo === 'ECONOMIA' ? 'text-blue-600' :
                                    meta.tipo === 'INVESTIMENTO' ? 'text-green-600' :
                                        'text-purple-600'
                            }`} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{meta.nome}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <div
                                    className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                                >
                                    <statusConfig.icon className="h-4 w-4" />
                                    {statusConfig.label}
                                </div>
                                <span className="text-sm text-gray-500">{statusConfig.tipoLabel}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAporteModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        Adicionar Aporte
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

            {/* Descrição */}
            {meta.descricao && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <p className="text-gray-700">{meta.descricao}</p>
                </div>
            )}

            {/* Cards de Informação */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-sm font-medium">Valor Atual</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(meta.valorAtual)}</p>
                </div>

                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Valor Objetivo</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(meta.valorObjetivo)}</p>
                </div>

                <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Falta Atingir</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(meta.valorRestante)}</p>
                </div>

                {meta.prazo && (
                    <div className={`bg-white rounded-lg border-2 p-6 ${
                        meta.vencida ? 'border-red-200' : 'border-green-200'
                    }`}>
                        <div className={`flex items-center gap-2 mb-2 ${
                            meta.vencida ? 'text-red-600' : 'text-green-600'
                        }`}>
                            <Calendar className="h-5 w-5" />
                            <span className="text-sm font-medium">Prazo</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                            meta.vencida ? 'text-red-600' : 'text-green-600'
                        }`}>
                            {formatDate(meta.prazo)}
                        </p>
                        {meta.vencida && (
                            <p className="text-xs text-red-500 mt-1">Vencida</p>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar Grande */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso da Meta</h2>
                <MetaProgressBar
                    current={meta.valorAtual}
                    target={meta.valorObjetivo}
                    percentage={meta.progresso}
                    showPercentage
                    showValues
                    size="lg"
                />
            </div>

            {/* Gráfico de Evolução */}
            {meta.transacoes && meta.transacoes.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução ao Longo do Tempo</h2>
                    <MetaEvolutionChart transacoes={meta.transacoes} valorObjetivo={meta.valorObjetivo} />
                </div>
            )}

            {/* Histórico de Transações */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Aportes</h2>
                <TransacoesMetaTable transacoes={meta.transacoes || []} />
            </div>

            {/* Modal de Aporte */}
            <Modal
                isOpen={isAporteModalOpen}
                onClose={() => setIsAporteModalOpen(false)}
                title="Adicionar Aporte"
                size="md"
            >
                <AporteForm
                    meta={meta}
                    onSuccess={() => {
                        setIsAporteModalOpen(false);
                        showSuccess('Aporte adicionado com sucesso!');
                    }}
                    onCancel={() => setIsAporteModalOpen(false)}
                />
            </Modal>
        </Layout>
    );
};