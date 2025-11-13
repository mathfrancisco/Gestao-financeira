// src/components/dashboard/GraficoDespesas.tsx

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import type { CategoriaResumo } from '../../types/dashboard';

interface GraficoDespesasProps {
    categorias: CategoriaResumo[];
    totalDespesas: number;
}

const COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
];

export const GraficoDespesas = ({ categorias, totalDespesas }: GraficoDespesasProps) => {
    // Prepara dados para o gráfico
    const chartData = categorias.map((cat) => ({
        name: cat.nome,
        value: cat.valor,
        percentual: cat.percentual,
    }));

    // Tooltip customizado
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        Valor: <span className="font-medium text-gray-900">{formatCurrency(data.value)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Percentual: <span className="font-medium text-gray-900">{data.percentual.toFixed(1)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Label customizado
    const renderCustomLabel = (entry: any) => {
        return `${entry.percentual.toFixed(0)}%`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Despesas por Categoria
                        </h3>
                        <p className="text-sm text-gray-500">
                            Total: {formatCurrency(totalDespesas)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            {chartData.length > 0 ? (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value, entry: any) => (
                                    <span className="text-sm text-gray-700">
                    {value} - {formatCurrency(entry.payload.value)}
                  </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <TrendingDown className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma despesa encontrada</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Registre suas despesas para visualizar o gráfico
                    </p>
                </div>
            )}

            {/* Lista de Categorias */}
            {chartData.length > 0 && (
                <div className="mt-6 space-y-2">
                    {categorias.slice(0, 5).map((cat, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-900">
                  {cat.nome}
                </span>
                            </div>
                            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {cat.percentual.toFixed(1)}%
                </span>
                                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(cat.valor)}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};