import { Edit, Trash2, Pause, Play, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { StatusMeta, TipoMeta, type Meta } from '../../types/meta';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormatter';
import { MetaProgressBar } from './MetaProgressBar';
import { getMetaStatusBadge, getMetaTipoIcon } from '../../utils/metaHelpers';

interface MetaCardProps {
    meta: Meta;
    onEdit: (meta: Meta) => void;
    onDelete: (id: number) => void;
    onCancelar: (id: number) => void;
    onPausar: (id: number) => void;
    onRetomar: (id: number) => void;
}

export const MetaCard = ({
                             meta,
                             onEdit,
                             onDelete,
                             onCancelar,
                             onPausar,
                             onRetomar
                         }: MetaCardProps) => {
    const statusConfig = getMetaStatusBadge(meta.status);
    const StatusIcon = statusConfig.icon;
    const TipoIcon = getMetaTipoIcon(meta.tipo);

    return (
        <div
            className={`bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                meta.concluida
                    ? 'border-green-300 bg-green-50'
                    : meta.status === StatusMeta.PAUSADA
                        ? 'border-yellow-300 bg-yellow-50'
                        : meta.status === StatusMeta.CANCELADA
                            ? 'border-gray-300 bg-gray-50 opacity-75'
                            : meta.vencida
                                ? 'border-red-300 bg-red-50'
                                : 'border-blue-200'
            }`}
        >
            {/* Header com Ícone, Nome e Status */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    {/* Ícone do Tipo */}
                    <div className={`p-3 rounded-lg ${
                        meta.tipo === TipoMeta.ECONOMIA ? 'bg-blue-100' :
                            meta.tipo === TipoMeta.INVESTIMENTO ? 'bg-green-100' :
                                'bg-purple-100'
                    }`}>
                        <TipoIcon className={`h-6 w-6 ${
                            meta.tipo === TipoMeta.ECONOMIA ? 'text-blue-600' :
                                meta.tipo === TipoMeta.INVESTIMENTO ? 'text-green-600' :
                                    'text-purple-600'
                        }`} />
                    </div>

                    {/* Nome e Tipo */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{meta.nome}</h3>
                        <p className="text-xs text-gray-500">{statusConfig.tipoLabel}</p>
                    </div>
                </div>

                {/* Badge de Status */}
                <div
                    className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                </div>
            </div>

            {/* Descrição (se existir) */}
            {meta.descricao && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{meta.descricao}</p>
            )}

            {/* Valores: Atual vs Objetivo */}
            <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <p className="text-xs text-gray-500">Valor Atual</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(meta.valorAtual)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Objetivo</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(meta.valorObjetivo)}</p>
                    </div>
                </div>

                {/* Barra de Progresso */}
                <MetaProgressBar
                    current={meta.valorAtual}
                    target={meta.valorObjetivo}
                    percentage={meta.progresso}
                    showPercentage
                    size="md"
                />
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-2 mb-4 text-sm">
                {/* Valor Restante */}
                <div className="flex items-center justify-between text-gray-600">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Restante:
          </span>
                    <span className="font-semibold">{formatCurrency(meta.valorRestante)}</span>
                </div>

                {/* Prazo (se existir) */}
                {meta.prazo && (
                    <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              Prazo:
            </span>
                        <span className={`font-semibold ${
                            meta.vencida ? 'text-red-600' : 'text-gray-900'
                        }`}>
              {formatDate(meta.prazo)}
                            {meta.vencida && ' (Vencida)'}
            </span>
                    </div>
                )}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
                {/* Botão Editar */}
                <button
                    onClick={() => onEdit(meta)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Editar meta"
                >
                    <Edit className="h-4 w-4" />
                </button>

                {/* Botão Pausar (apenas se EM_ANDAMENTO) */}
                {meta.status === StatusMeta.EM_ANDAMENTO && (
                    <button
                        onClick={() => onPausar(meta.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                        title="Pausar meta"
                    >
                        <Pause className="h-4 w-4" />
                    </button>
                )}

                {/* Botão Retomar (apenas se PAUSADA) */}
                {meta.status === StatusMeta.PAUSADA && (
                    <button
                        onClick={() => onRetomar(meta.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Retomar meta"
                    >
                        <Play className="h-4 w-4" />
                    </button>
                )}

                {/* Botão Cancelar (apenas se EM_ANDAMENTO ou PAUSADA) */}
                {(meta.status === StatusMeta.EM_ANDAMENTO || meta.status === StatusMeta.PAUSADA) && (
                    <button
                        onClick={() => onCancelar(meta.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                        title="Cancelar meta"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                )}

                {/* Botão Excluir */}
                <button
                    onClick={() => onDelete(meta.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Excluir meta"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
