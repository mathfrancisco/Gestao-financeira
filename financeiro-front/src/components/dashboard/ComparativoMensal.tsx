import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { getShortMonthName } from '../../utils/dateFormatter';
import type { EvolucaoMensal } from '../../types/dashboard';

interface ComparativoMensalProps {
    evolucao: EvolucaoMensal[];
}

export const ComparativoMensal = ({ evolucao }: ComparativoMensalProps) => {
    // Prepara dados para o gráfico
    const chartData = evolucao.map((item) => ({
        periodo: `${getShortMonthName(item.mes)}/${item.ano.toString().slice(-2)}`,
        receitas: item.receitas,
        despesas: item.despesas,
        saldo: item.saldo,
    }));

    // Calcula estatísticas
    const totalReceitas = evolucao.reduce((sum, item) => sum + item.receitas, 0);
    const totalDespesas = evolucao.reduce((sum, item) => sum + item.despesas, 0);
    const mediaReceitas = totalReceitas / evolucao.length;
    const mediaDespesas = totalDespesas / evolucao.length;

    // Tooltip customizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                />
                  {entry.name}:
              </span>
                            <span className="text-sm font-medium text-gray-900">
                {formatCurrency(entry.value)}
              </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Evolução Mensal
                        </h3>
                        <p className="text-sm text-gray-500">
                            Últimos {evolucao.length} meses
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Média Receitas</p>
                        <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(mediaReceitas)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Média Despesas</p>
                        <p className="text-sm font-semibold text-red-600">
                            {formatCurrency(mediaDespesas)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            {chartData.length > 0 ? (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="periodo"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={{ stroke: '#e5e7eb' }}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                                formatter={(value) => {
                                    const labels: Record<string, string> = {
                                        receitas: 'Receitas',
                                        despesas: 'Despesas',
                                        saldo: 'Saldo',
                                    };
                                    return <span className="text-sm text-gray-700">{labels[value] || value}</span>;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="receitas"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="receitas"
                            />
                            <Line
                                type="monotone"
                                dataKey="despesas"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ fill: '#ef4444', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="despesas"
                            />
                            <Line
                                type="monotone"
                                dataKey="saldo"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="saldo"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                    <Activity className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">Sem dados para exibir</p>
                </div>
            )}

            {/* Legenda Inferior */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-xs text-gray-600">Total Receitas</p>
                        <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(totalReceitas)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                        <p className="text-xs text-gray-600">Total Despesas</p>
                        <p className="text-sm font-semibold text-red-600">
                            {formatCurrency(totalDespesas)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                        <p className="text-xs text-gray-600">Saldo Acumulado</p>
                        <p className="text-sm font-semibold text-blue-600">
                            {formatCurrency(totalReceitas - totalDespesas)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};