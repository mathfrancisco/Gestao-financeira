import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StatusPagamento, type Despesa, type DespesaDTO } from '../../types/despesa';
import { useCreateDespesa, useUpdateDespesa } from '../../hooks/useDespesas';
import { useCategorias } from '../../hooks/useCategorias';
import { Loading } from '../common/Loading';
import { TipoCategoria } from '../../types/categoria';

const despesaSchema = z.object({
    receitaId: z.number().nullable().optional(),
    categoriaId: z.number().nullable().optional(),
    data: z.string().min(1, 'Data é obrigatória'),
    descricao: z
        .string()
        .min(3, 'Descrição deve ter no mínimo 3 caracteres')
        .max(255, 'Descrição deve ter no máximo 255 caracteres'),
    valor: z
        .number({ invalid_type_error: 'Valor deve ser um número' })
        .positive('Valor deve ser positivo'),
    status: z.nativeEnum(StatusPagamento).default(StatusPagamento.PENDENTE),
    parcelaAtual: z.number().int().positive().default(1),
    parcelaTotal: z.number().int().positive().default(1),
    fimPagamento: z.string().nullable().optional(),
    observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').nullable().optional(),
}).refine(
    (data) => data.parcelaAtual <= data.parcelaTotal,
    {
        message: 'Parcela atual não pode ser maior que o total',
        path: ['parcelaAtual'],
    }
);

type DespesaFormData = z.infer<typeof despesaSchema>;

interface DespesaFormProps {
    despesa?: Despesa;
    onSuccess: () => void;
    onCancel: () => void;
}

export const DespesaForm = ({ despesa, onSuccess, onCancel }: DespesaFormProps) => {
    const createMutation = useCreateDespesa();
    const updateMutation = useUpdateDespesa();
    const { categorias } = useCategorias();

    // Filtrar apenas categorias de DESPESA ativas
    const categoriasDespesa = categorias?.filter(
        (cat) => cat.tipo === TipoCategoria.DESPESA && cat.ativa
    );

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<DespesaFormData>({
        resolver: zodResolver(despesaSchema),
        defaultValues: despesa
            ? {
                receitaId: despesa.receitaId,
                categoriaId: despesa.categoriaId,
                data: despesa.data,
                descricao: despesa.descricao,
                valor: despesa.valor,
                status: despesa.status,
                parcelaAtual: despesa.parcelaAtual,
                parcelaTotal: despesa.parcelaTotal,
                fimPagamento: despesa.fimPagamento,
                observacoes: despesa.observacoes,
            }
            : {
                status: StatusPagamento.PENDENTE,
                parcelaAtual: 1,
                parcelaTotal: 1,
                data: new Date().toISOString().split('T')[0],
            },
    });

    const parcelaTotal = watch('parcelaTotal');

    const onSubmit = async (data: DespesaFormData) => {
        try {
            const dto: DespesaDTO = {
                ...data,
                receitaId: data.receitaId || null,
                categoriaId: data.categoriaId || null,
                fimPagamento: data.fimPagamento || null,
                observacoes: data.observacoes || null,
            };

            if (despesa) {
                await updateMutation.mutateAsync({ id: despesa.id, data: dto });
            } else {
                await createMutation.mutateAsync(dto);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Descrição */}
            <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                </label>
                <input
                    {...register('descricao')}
                    type="text"
                    id="descricao"
                    placeholder="Ex: Conta de luz, Mercado, Combustível..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {errors.descricao && (
                    <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                        Valor *
                    </label>
                    <input
                        {...register('valor', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        id="valor"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {errors.valor && (
                        <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento *
                    </label>
                    <input
                        {...register('data')}
                        type="date"
                        id="data"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {errors.data && (
                        <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                    )}
                </div>
            </div>

            {/* Categoria */}
            <div>
                <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                </label>
                <select
                    {...register('categoriaId', {
                        setValueAs: (v) => v === '' ? null : parseInt(v)
                    })}
                    id="categoriaId"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="">Sem categoria</option>
                    {categoriasDespesa?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
                {errors.categoriaId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoriaId.message}</p>
                )}
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-yellow-300">
                        <input
                            {...register('status')}
                            type="radio"
                            value={StatusPagamento.PENDENTE}
                            className="sr-only peer"
                        />
                        <div className="flex items-center gap-3 w-full peer-checked:text-yellow-600">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center peer-checked:bg-yellow-600 peer-checked:text-white transition-colors">
                                <span className="text-xl">⏳</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Pendente</p>
                                <p className="text-xs text-gray-500 peer-checked:text-yellow-500">
                                    Aguardando pagamento
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-yellow-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>

                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300">
                        <input
                            {...register('status')}
                            type="radio"
                            value={StatusPagamento.PAGO}
                            className="sr-only peer"
                        />
                        <div className="flex items-center gap-3 w-full peer-checked:text-green-600">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center peer-checked:bg-green-600 peer-checked:text-white transition-colors">
                                <span className="text-xl">✅</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Pago</p>
                                <p className="text-xs text-gray-500 peer-checked:text-green-500">
                                    Pagamento confirmado
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-green-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>
                </div>
                {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
            </div>

            {/* Parcelamento */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Parcelamento</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="parcelaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                            Parcela Atual
                        </label>
                        <input
                            {...register('parcelaAtual', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            id="parcelaAtual"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {errors.parcelaAtual && (
                            <p className="mt-1 text-sm text-red-600">{errors.parcelaAtual.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="parcelaTotal" className="block text-sm font-medium text-gray-700 mb-1">
                            Total de Parcelas
                        </label>
                        <input
                            {...register('parcelaTotal', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            id="parcelaTotal"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {errors.parcelaTotal && (
                            <p className="mt-1 text-sm text-red-600">{errors.parcelaTotal.message}</p>
                        )}
                    </div>
                </div>

                {parcelaTotal > 1 && (
                    <div className="mt-4">
                        <label htmlFor="fimPagamento" className="block text-sm font-medium text-gray-700 mb-1">
                            Fim do Pagamento
                        </label>
                        <input
                            {...register('fimPagamento')}
                            type="date"
                            id="fimPagamento"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                )}
            </div>

            {/* Observações */}
            <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                </label>
                <textarea
                    {...register('observacoes')}
                    id="observacoes"
                    rows={3}
                    placeholder="Informações adicionais sobre a despesa..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                {errors.observacoes && (
                    <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
                )}
            </div>

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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loading size="sm" />
                            Salvando...
                        </>
                    ) : (
                        <>{despesa ? 'Atualizar' : 'Criar'} Despesa</>
                    )}
                </button>
            </div>
        </form>
    );
};