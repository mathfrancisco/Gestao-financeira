import { TrendingUp, TrendingDown } from 'lucide-react';
import { type TransacaoMeta, TipoTransacaoMeta } from '../../types/meta';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormatter';

interface TransacoesMetaTableProps {
    transacoes: TransacaoMeta[];
}

export const TransacoesMetaTable = ({ transacoes }: TransacoesMetaTableProps) => {
    if (transacoes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Nenhum aporte registrado ainda</p>
                <p className="text-sm mt-1">Adicione seu primeiro aporte para começar</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrição</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor</th>
                </tr>
                </thead>
                <tbody>
                {transacoes.map((transacao) => (
                    <tr key={transacao.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{formatDate(transacao.data)}</td>
                        <td className="py-3 px-4">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        transacao.tipo === TipoTransacaoMeta.APORTE
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                  {transacao.tipo === TipoTransacaoMeta.APORTE ? (
                      <>
                          <TrendingUp className="h-3 w-3" />
                          Aporte
                      </>
                  ) : (
                      <>
                          <TrendingDown className="h-3 w-3" />
                          Resgate
                      </>
                  )}
                </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                            {transacao.descricao || '-'}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                            transacao.tipo === TipoTransacaoMeta.APORTE
                                ? 'text-green-600'
                                : 'text-red-600'
                        }`}>
                            {transacao.tipo === TipoTransacaoMeta.APORTE ? '+' : '-'}
                            {formatCurrency(transacao.valor)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};