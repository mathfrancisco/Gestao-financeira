import { Edit, Trash2, Check, X } from 'lucide-react';
import { TipoParametro, type Parametro } from '../../types/parametro';
import { getParametroTipoBadge } from '../../utils/parametroHelpers';

interface ParametroCardProps {
    parametro: Parametro;
    onEdit: (parametro: Parametro) => void;
    onDelete: (id: number) => void;
}

export const ParametroCard = ({ parametro, onEdit, onDelete }: ParametroCardProps) => {
    const tipoBadge = getParametroTipoBadge(parametro.tipo);

    // Renderiza o valor com formatação apropriada
    const renderValor = () => {
        switch (parametro.tipo) {
            case TipoParametro.BOOLEAN:
                return (
                    <div className="flex items-center gap-2">
                        {parametro.valorBooleano ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : (
                            <X className="h-5 w-5 text-red-600" />
                        )}
                        <span className={parametro.valorBooleano ? 'text-green-600' : 'text-red-600'}>
              {parametro.valorBooleano ? 'Verdadeiro' : 'Falso'}
            </span>
                    </div>
                );
            case TipoParametro.NUMBER:
                return (
                    <span className="font-mono text-blue-600">{parametro.valorNumerico}</span>
                );
            case TipoParametro.JSON:
                return (
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(JSON.parse(parametro.valor), null, 2)}
          </pre>
                );
            default:
                return <span className="text-gray-900">{parametro.valor}</span>;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Chave e Tipo */}
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 font-mono">
                            {parametro.chave}
                        </h3>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${tipoBadge.bgColor} ${tipoBadge.textColor}`}
                        >
              {tipoBadge.icon} {tipoBadge.label}
            </span>
                    </div>

                    {/* Descrição */}
                    {parametro.descricao && (
                        <p className="text-sm text-gray-600 mb-3">{parametro.descricao}</p>
                    )}

                    {/* Valor */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Valor:</p>
                        {renderValor()}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => onEdit(parametro)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(parametro.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};