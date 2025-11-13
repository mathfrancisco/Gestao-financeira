import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type AporteMetaDTO, type Meta } from '../../types/meta';
import { useAdicionarAporte } from '../../hooks/useMetas';
import { Loading } from '../common/Loading';
import { formatCurrency } from '../../utils/currencyFormatter';
const aporteSchema = z.object({
    valor: z
        .number({ invalid_type_error: 'Valor deve ser um número' })
        .positive('Valor deve ser positivo'),
    data: z.string().optional(),
    descricao: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullable().optional(),
});
type AporteFormData = z.infer<typeof aporteSchema>;
interface AporteFormProps {
    meta: Meta;
    onSuccess: () => void;
    onCancel: () => void;
}
export const AporteForm = ({ meta, onSuccess, onCancel }: AporteFormProps) => {
    const adicionarAporteMutation = useAdicionarAporte();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AporteFormData>({
        resolver: zodResolver(aporteSchema),
        defaultValues: {
            data: new Date().toISOString().split('T')[0],
        },
    });
    const valorAporte = watch('valor') || 0;
    const novoValorAtual = meta.valorAtual + valorAporte;
    const novoProgresso = Math.min((novoValorAtual / meta.valorObjetivo) * 100, 100);
    const onSubmit = async (data: AporteFormData) => {
        try {
            const dto: AporteMetaDTO = {
                valor: data.valor,
                data: data.data,
                descricao: data.descricao || null,
            };
            await adicionarAporteMutation.mutateAsync({ metaId: meta.id, data: dto });
            onSuccess();
        } catch (error) {
            console.error('Erro ao adicionar aporte:', error);
        }
    };
    const isLoading = adicionarAporteMutation.isPending;
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Meta Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{meta.nome}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-blue-600">Valor Atual</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(meta.valorAtual)}</p>
                    </div>
                    <div>
                        <p className="text-blue-600">Falta Atingir</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(meta.valorRestante)}</p>
                    </div>
                </div>
            </div>
            {/* Valor do Aporte */}
            <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor do Aporte *
                </label>
                <input
                    {...register('valor', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    id="valor"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.valor && (
                    <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
                )}
            </div>

            {/* Data do Aporte */}
            <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Aporte
                </label>
                <input
                    {...register('data')}
                    type="date"
                    id="data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.data && (
                    <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                )}
            </div>

            {/* Descrição */}
            <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                </label>
                <input
                    {...register('descricao')}
                    type="text"
                    id="descricao"
                    placeholder="Ex: Salário do mês, Bônus, Freelance..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.descricao && (
                    <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
            </div>

            {/* Preview */}
            {valorAporte > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">Preview do Aporte</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-green-700">Novo Valor Atual:</span>
                            <span className="font-bold text-green-900">{formatCurrency(novoValorAtual)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Novo Progresso:</span>
                            <span className="font-bold text-green-900">{novoProgresso.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Ainda Falta:</span>
                            <span className="font-bold text-green-900">
            {formatCurrency(Math.max(meta.valorObjetivo - novoValorAtual, 0))}
          </span>
                        </div>
                        {novoValorAtual >= meta.valorObjetivo && (
                            <div className="mt-3 p-2 bg-green-100 rounded text-center">
                                <span className="text-green-800 font-semibold">🎉 Meta será atingida!</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loading size="sm" />
                            Adicionando...
                        </>
                    ) : (
                        'Adicionar Aporte'
                    )}
                </button>
            </div>
        </form>
    );
};
