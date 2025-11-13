import { Edit, Trash2, CheckCircle, XCircle, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { StatusPagamento, type Despesa } from '../../types/despesa';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormatter';

interface DespesaCardProps {
    despesa: Despesa;
    onEdit: (despesa: Despesa) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (despesa: Despesa) => void;
}

export const DespesaCard = ({ despesa, onEdit, onDelete, onToggleStatus }: DespesaCardProps) => {
    const getStatusConfig = (status: StatusPagamento, vencido: boolean) => {
        if (vencido && status === StatusPagamento.PENDENTE) {
            return {
                label: 'Vencida',
                icon: AlertCircle,
                bgColor: 'bg-red-100',
                textColor: 'text-red-700',
                borderColor: 'border-red-300'
            };
        }

        switch (status) {
            case StatusPagamento.PAGO:
                return {
                    label: 'Paga',
                    icon: CheckCircle,
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-700',
                    borderColor: 'border-green-300'
                };
            case StatusPagamento.PENDENTE:
                return {
                    label: 'Pendente',
                    icon: XCircle,
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-700',
                    borderColor: 'border-yellow-300'
                };
            default:
                return {
                    label: status,
                    icon: AlertCircle,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-300'
                };
        }
    };

    const statusConfig = getStatusConfig(despesa.status, despesa.vencido);
    const StatusIcon = statusConfig.icon;

    return (
        <div
            className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-md ${
                despesa.status === StatusPagamento.PAGO
                    ? 'border-gray-200'
                    : despesa.vencido
                        ? 'border-red-300 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{despesa.descricao}</h3>
                    {despesa.categoriaNome && (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
              {despesa.categoriaNome}
            </span>
                    )}
                </div>
                <div
                    className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                </div>
            </div>

            {/* Valor */}
            <div className="mb-4">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(despesa.valor)}</p>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Vencimento: {formatDate(despesa.data)}</span>
                </div>
                {despesa.parcelado && (
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Parcela: {despesa.statusParcela}</span>
                    </div>
                )}
            </div>

            {despesa.observacoes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    {despesa.observacoes}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(despesa)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Edit className="h-4 w-4" />
                    Editar
                </button>
                <button
                    onClick={() => onToggleStatus(despesa)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        despesa.status === StatusPagamento.PAGO
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                    title={despesa.status === StatusPagamento.PAGO ? 'Marcar como Pendente' : 'Marcar como Paga'}
                >
                    {despesa.status === StatusPagamento.PAGO ? (
                        <XCircle className="h-4 w-4" />
                    ) : (
                        <CheckCircle className="h-4 w-4" />
                    )}
                </button>
                <button
                    onClick={() => onDelete(despesa.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};