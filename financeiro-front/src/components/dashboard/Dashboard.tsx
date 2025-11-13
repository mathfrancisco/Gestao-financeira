// src/components/dashboard/DashboardPage.tsx

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import { Layout } from '../common/Layout';
import { Loading } from '../common/Loading';
import { ErrorAlert } from '../common/ErrorMessage';
import { ResumoFinanceiro } from './ResumoFinanceiro';
import { GraficoDespesas } from './GraficoDespesas';
import { ComparativoMensal } from './ComparativoMensal';
import { MetasWidget } from './MetasWidget';
import { useDashboard, useEvolucao } from '../../hooks/useDashboard';
import {
    formatPeriod,
    getCurrentPeriod,
    getPreviousPeriod,
    getNextPeriod,
} from '../../utils/dateFormatter';
import type {DashboardFilters} from "../../types/dashboard.ts";

export const DashboardPage = () => {
    const currentPeriod = getCurrentPeriod();
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const filters: DashboardFilters = {
        mes: selectedPeriod.month,
        ano: selectedPeriod.year
    };

    const { dashboard, isLoading, error, refetch } = useDashboard(filters);
    const { evolucao, isLoading: evolucaoLoading } = useEvolucao(6);

    const handlePreviousMonth = () => {
        const prev = getPreviousPeriod(selectedPeriod.month, selectedPeriod.year);
        setSelectedPeriod({ month: prev.month, year: prev.year });
    };

    const handleNextMonth = () => {
        const next = getNextPeriod(selectedPeriod.month, selectedPeriod.year);
        setSelectedPeriod({ month: next.month, year: next.year });
    };

    const handleCurrentMonth = () => {
        setSelectedPeriod(currentPeriod);
    };

    const isCurrentMonth =
        selectedPeriod.month === currentPeriod.month &&
        selectedPeriod.year === currentPeriod.year;

    return (
        <Layout>
            {/* Header com Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Visão geral das suas finanças
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Seletor de Período */}
                    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-2">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2 px-3 py-2 min-w-[160px] justify-center">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                {formatPeriod(selectedPeriod.month, selectedPeriod.year)}
              </span>
                        </div>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Botão Mês Atual */}
                    {!isCurrentMonth && (
                        <button
                            onClick={handleCurrentMonth}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Mês Atual
                        </button>
                    )}

                    {/* Botão Atualizar */}
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        aria-label="Atualizar"
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <ErrorAlert
                    title="Erro ao carregar dashboard"
                    message="Não foi possível carregar os dados do dashboard"
                    onRetry={() => refetch()}
                    className="mb-6"
                />
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                                <Loading variant="pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 h-96">
                                <Loading variant="skeleton" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : dashboard ? (
                <>
                    {/* Cards de Resumo */}
                    <div className="mb-8">
                        <ResumoFinanceiro data={dashboard} />
                    </div>

                    {/* Grid de Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Gráfico de Despesas */}
                        <GraficoDespesas
                            categorias={dashboard.topCategorias || []}
                            totalDespesas={dashboard.totalDespesas}
                        />

                        {/* Widget de Metas */}
                        <MetasWidget data={dashboard} />
                    </div>

                    {/* Gráfico de Evolução */}
                    {evolucaoLoading ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 h-96">
                            <Loading variant="skeleton" />
                        </div>
                    ) : evolucao && evolucao.length > 0 ? (
                        <ComparativoMensal evolucao={evolucao} />
                    ) : null}

                    {/* Cards Informativos */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                💡 Dica Financeira
                            </h4>
                            <p className="text-sm text-gray-600">
                                Mantenha suas despesas abaixo de 70% das receitas para garantir uma boa saúde financeira.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                📊 Taxa de Pagamento
                            </h4>
                            <p className="text-sm text-gray-600">
                                Você pagou {dashboard.taxaPagamento.toFixed(1)}% das despesas do mês. Continue assim!
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                🎯 Próxima Meta
                            </h4>
                            <p className="text-sm text-gray-600">
                                {dashboard.countMetasEmAndamento > 0
                                    ? `Você tem ${dashboard.countMetasEmAndamento} meta(s) em andamento. Continue economizando!`
                                    : 'Crie sua primeira meta financeira e comece a poupar.'}
                            </p>
                        </div>
                    </div>
                </>
            ) : null}
        </Layout>
    );
};