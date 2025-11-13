import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { type TransacaoMeta, TipoTransacaoMeta } from '../../types/meta';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormatter';

interface MetaEvolutionChartProps {
    transacoes: TransacaoMeta[];
    valorObjetivo: number;
}

export const MetaEvolutionChart = ({ transacoes, valorObjetivo }: MetaEvolutionChartProps) => {
    // Ordenar transações por data
    const transacoesOrdenadas = [...transacoes].sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    // Calcular valor acumulado ao longo do tempo
    let valorAcumulado = 0;
    const chartData = transacoesOrdenadas.map((transacao) => {
        if (transacao.tipo === TipoTransacaoMeta.APORTE) {
            valorAcumulado += transacao.valor;
        } else {
            valorAcumulado -= transacao.valor;
        }

        return {
            data: formatDate(transacao.data),
            valor: valorAcumulado,
            dataCompleta: transacao.data,
        };
    });

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Sem dados suficientes para gerar gráfico</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="data"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Valor Acumulado']}
                />
                <Legend />
                <ReferenceLine
                    y={valorObjetivo}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    label={{ value: 'Meta', position: 'right', fill: '#10b981' }}
                />
                <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Valor Acumulado"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};