import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StatusMeta, TipoMeta, type Meta, type MetaDTO } from '../../types/meta';
import { useCreateMeta, useUpdateMeta } from '../../hooks/useMetas';
import { Loading } from '../common/Loading';

// Schema de validação com Zod
const metaSchema = z.object({
    nome: z
        .string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    descricao: z
        .string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .nullable()
        .optional(),
    tipo: z.nativeEnum(TipoMeta, {
        errorMap: () => ({ message: 'Tipo é obrigatório' }),
    }),
    valorObjetivo: z
        .number({ invalid_type_error: 'Valor deve ser um número' })
        .positive('Valor objetivo deve ser positivo'),
    prazo: z.string().nullable().optional(),
    status: z.nativeEnum(StatusMeta).default(StatusMeta.EM_ANDAMENTO),
    observacoes: z
        .string()
        .max(500, 'Observações devem ter no máximo 500 caracteres')
        .nullable()
        .optional(),
}).refine(
    (data) => {
        // Validação customizada: prazo deve ser data futura
        if (data.prazo) {
            const prazoDate = new Date(data.prazo);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            return prazoDate >= hoje;
        }
        return true;
    },
    {
        message: 'Prazo deve ser uma data futura',
        path: ['prazo'],
    }
);

type MetaFormData = z.infer<typeof metaSchema>;

interface MetaFormProps {
    meta?: Meta;
    onSuccess: () => void;
    onCancel: () => void;
}

export const MetaForm = ({ meta, onSuccess, onCancel }: MetaFormProps) => {
    const createMutation = useCreateMeta();
    const updateMutation = useUpdateMeta();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MetaFormData>({
        resolver: zodResolver(metaSchema),
        defaultValues: meta
            ? {
                nome: meta.nome,
                descricao: meta.descricao,
                tipo: meta.tipo,
                valorObjetivo: meta.valorObjetivo,
                prazo: meta.prazo,
                status: meta.status,
                observacoes: meta.observacoes,
            }
            : {
                tipo: TipoMeta.ECONOMIA,
                status: StatusMeta.EM_ANDAMENTO,
            },
    });

    const onSubmit = async (data: MetaFormData) => {
        try {
            const dto: MetaDTO = {
                ...data,
                descricao: data.descricao || null,
                prazo: data.prazo || null,
                observacoes: data.observacoes || null,
            };

            if (meta) {
                await updateMutation.mutateAsync({ id: meta.id, data: dto });
            } else {
                await createMutation.mutateAsync(dto);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar meta:', error);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome da Meta */}
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Meta *
                </label>
                <input
                    {...register('nome')}
                    type="text"
                    id="nome"
                    placeholder="Ex: Viagem para Europa, Carro novo, Reserva de emergência..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
            </div>

            {/* Tipo da Meta */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <div className="grid grid-cols-3 gap-4">
                    {/* Opção: Economia */}
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300">
                        <input
                            {...register('tipo')}
                            type="radio"
                            value={TipoMeta.ECONOMIA}
                            className="sr-only peer"
                        />
                        <div className="flex flex-col items-center gap-2 w-full peer-checked:text-blue-600">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center peer-checked:bg-blue-600 peer-checked:text-white transition-colors">
                                <span className="text-2xl">💰</span>
                            </div>
                            <p className="font-medium text-sm text-center">Economia</p>
                        </div>
                        <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>

                    {/* Opção: Investimento */}
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300">
                        <input
                            {...register('tipo')}
                            type="radio"
                            value={TipoMeta.INVESTIMENTO}
                            className="sr-only peer"
                        />
                        <div className="flex flex-col items-center gap-2 w-full peer-checked:text-green-600">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center peer-checked:bg-green-600 peer-checked:text-white transition-colors">
                                <span className="text-2xl">📈</span>
                            </div>
                            <p className="font-medium text-sm text-center">Investimento</p>
                        </div>
                        <div className="absolute inset-0 border-2 border-green-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>

                    {/* Opção: Compra */}
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-300">
                        <input
                            {...register('tipo')}
                            type="radio"
                            value={TipoMeta.COMPRA}
                            className="sr-only peer"
                        />
                        <div className="flex flex-col items-center gap-2 w-full peer-checked:text-purple-600">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center peer-checked:bg-purple-600 peer-checked:text-white transition-colors">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <p className="font-medium text-sm text-center">Compra</p>
                        </div>
                        <div className="absolute inset-0 border-2 border-purple-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>
                </div>
                {errors.tipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                )}
            </div>

            {/* Valor Objetivo e Prazo */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="valorObjetivo" className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Objetivo *
                    </label>
                    <input
                        {...register('valorObjetivo', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        id="valorObjetivo"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.valorObjetivo && (
                        <p className="mt-1 text-sm text-red-600">{errors.valorObjetivo.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="prazo" className="block text-sm font-medium text-gray-700 mb-1">
                        Prazo (opcional)
                    </label>
                    <input
                        {...register('prazo')}
                        type="date"
                        id="prazo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.prazo && (
                        <p className="mt-1 text-sm text-red-600">{errors.prazo.message}</p>
                    )}
                </div>
            </div>

            {/* Descrição */}
            <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    {...register('descricao')}
                    id="descricao"
                    rows={3}
                    placeholder="Descreva sua meta e seus objetivos..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {errors.descricao && (
                    <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
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
                    rows={2}
                    placeholder="Informações adicionais..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {errors.observacoes && (
                    <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
                )}
            </div>

            {/* Botões de Ação */}
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loading size="sm" />
                            Salvando...
                        </>
                    ) : (
                        <>{meta ? 'Atualizar' : 'Criar'} Meta</>
                    )}
                </button>
            </div>
        </form>
    );
};