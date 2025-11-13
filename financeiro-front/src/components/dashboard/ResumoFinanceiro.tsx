// src/components/dashboard/ResumoFinanceiro.tsx

import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/currencyFormatter';
import type { DashboardResponse } from '../../types/dashboard';

interface ResumoFinanceiroProps {
    data: DashboardResponse;
}

export const ResumoFinanceiro = ({ data }: ResumoFinanceiroProps) => {
    const cards = [
        {
            title: 'Receitas do Mês',
            value: data.totalReceitas,
            icon: TrendingUp,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            trend: data.mediaReceitasMensal,
            trendLabel: 'média mensal',
            trendUp: data.totalReceitas >= data.mediaReceitasMensal,
        },
        {
            title: 'Despesas do Mês',
            value: data.totalDespesas,
            icon: TrendingDown,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            subtitle: `${data.countDespesasPagas} pagas · ${data.countDespesasPendentes} pendentes`,
            trend: data.mediaDespesasMensal,
            trendLabel: 'média mensal',
            trendUp: data.totalDespesas < data.mediaDespesasMensal,
        },
        {
            title: 'Saldo Atual',
            value: data.saldo,
            icon: DollarSign,
            iconBg: data.saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100',
            iconColor: data.saldo >= 0 ? 'text-blue-600' : 'text-orange-600',
            subtitle: `${formatPercentage(data.percentualEconomizado)} economizado`,
            highlight: true,
        },
        {
            title: 'Progresso das Metas',
            value: data.valorAtualMetas,
            icon: Target,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            subtitle: `${data.countMetasEmAndamento} ativas · ${formatPercentage(data.progressoMedioMetas)} concluído`,
            progress: data.progressoMedioMetas,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.trendUp ? ArrowUpRight : ArrowDownRight;

                return (
                    <div
                        key={index}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${
                            card.highlight ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.iconBg}`}>
                                <Icon className={`h-6 w-6 ${card.iconColor}`} />
                            </div>

                            {card.trend !== undefined && (
                                <div
                                    className={`flex items-center gap-1 text-sm font-medium ${
                                        card.trendUp ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    <TrendIcon className="h-4 w-4" />
                                    {formatCurrency(card.trend)}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-1">
                                {card.title}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                {formatCurrency(card.value)}
                            </p>

                            {card.subtitle && (
                                <p className="text-xs text-gray-500">{card.subtitle}</p>
                            )}

                            {card.trendLabel && (
                                <p className="text-xs text-gray-500 mt-1">{card.trendLabel}</p>
                            )}

                            {/* Progress Bar */}
                            {card.progress !== undefined && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(card.progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};