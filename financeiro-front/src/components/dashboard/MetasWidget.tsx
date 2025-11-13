// src/components/dashboard/MetasWidget.tsx

import { Link } from 'react-router-dom';
import { Target, TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/currencyFormatter';
import type { DashboardResponse } from '../../types/dashboard';

interface MetasWidgetProps {
    data: DashboardResponse;
}

export const MetasWidget = ({ data }: MetasWidgetProps) => {
    const hasActiveMetas = data.countMetasEmAndamento > 0 || data.countMetasConcluidas > 0;

    // Calcula progresso médio
    const progressoMedio = data.progressoMedioMetas;

    // Status das metas
    const metasStats = [
        {
            label: 'Em Andamento',
            value: data.countMetasEmAndamento,
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            label: 'Concluídas',
            value: data.countMetasConcluidas,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            label: 'Vencidas',
            value: data.countMetasVencidas,
            icon: Target,
            color: 'text-red-600',
            bg: 'bg-red-100',
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Minhas Metas
                        </h3>
                        <p className="text-sm text-gray-500">
                            Acompanhe seu progresso
                        </p>
                    </div>
                </div>
                <Link
                    to="/metas"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {hasActiveMetas ? (
                <>
                    {/* Progresso Geral */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso Médio
              </span>
                            <span className="text-sm font-semibold text-purple-600">
                {formatPercentage(progressoMedio)}
              </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${Math.min(progressoMedio, 100)}%` }}
                            >
                                {progressoMedio > 15 && (
                                    <span className="text-xs text-white font-medium">
                    {formatPercentage(progressoMedio)}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Valor Objetivo</p>
                            <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(data.valorObjetivoMetas)}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Valor Atual</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(data.valorAtualMetas)}
                            </p>
                        </div>
                    </div>

                    {/* Restante */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                  Falta para as metas
                </span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                {formatCurrency(data.valorRestanteMetas)}
              </span>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {metasStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`inline-flex p-2 ${stat.bg} rounded-lg mb-2`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-600">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* Estado Vazio */
                <div className="py-12 text-center">
                    <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                        <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma meta cadastrada
                    </h4>
                    <p className="text-sm text-gray-600 mb-6">
                        Crie suas primeiras metas financeiras e acompanhe seu progresso
                    </p>
                    <Link
                        to="/metas/nova"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
                    >
                        <Target className="h-5 w-5" />
                        Criar Primeira Meta
                    </Link>
                </div>
            )}
        </div>
    );
};