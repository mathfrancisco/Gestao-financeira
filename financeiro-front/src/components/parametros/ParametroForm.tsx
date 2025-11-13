import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipoParametro, type Parametro, type ParametroDTO } from '../../types/parametro';
import { useCreateParametro, useUpdateParametro } from '../../hooks/useParametros';
import { Loading } from '../common/Loading';

const parametroSchema = z.object({
    chave: z
        .string()
        .min(2, 'Chave deve ter no mínimo 2 caracteres')
        .max(100, 'Chave deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-Z0-9._-]+$/, 'Chave deve conter apenas letras, números, ponto, hífen ou underscore'),
    descricao: z
        .string()
        .max(255, 'Descrição deve ter no máximo 255 caracteres')
        .nullable()
        .optional(),
    valor: z.string().min(1, 'Valor é obrigatório'),
    tipo: z.nativeEnum(TipoParametro, {
        errorMap: () => ({ message: 'Tipo é obrigatório' }),
    }),
});

type ParametroFormData = z.infer<typeof parametroSchema>;

interface ParametroFormProps {
    parametro?: Parametro;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ParametroForm = ({ parametro, onSuccess, onCancel }: ParametroFormProps) => {
    const createMutation = useCreateParametro();
    const updateMutation = useUpdateParametro();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ParametroFormData>({
        resolver: zodResolver(parametroSchema),
        defaultValues: parametro
            ? {
                chave: parametro.chave,
                descricao: parametro.descricao,
                valor: parametro.valor,
                tipo: parametro.tipo,
            }
            : {
                tipo: TipoParametro.STRING,
            },
    });

    const tipoSelecionado = watch('tipo');

    const onSubmit = async (data: ParametroFormData) => {
        try {
            const dto: ParametroDTO = {
                ...data,
                descricao: data.descricao || null,
            };

            if (parametro) {
                await updateMutation.mutateAsync({ id: parametro.id, data: dto });
            } else {
                await createMutation.mutateAsync(dto);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar parâmetro:', error);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Renderiza input adequado baseado no tipo
    const renderValorInput = () => {
        switch (tipoSelecionado) {
            case TipoParametro.BOOLEAN:
                return (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                {...register('valor')}
                                type="checkbox"
                                value="true"
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Ativado</span>
                        </label>
                    </div>
                );

            case TipoParametro.NUMBER:
                return (
                    <input
                        {...register('valor')}
                        type="number"
                        step="any"
                        placeholder="Ex: 100, 3.14, -5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    />
                );

            case TipoParametro.JSON:
                return (
                    <textarea
                        {...register('valor')}
                        rows={6}
                        placeholder='{"chave": "valor", "numero": 123}'
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                );

            default: // STRING
                return (
                    <input
                        {...register('valor')}
                        type="text"
                        placeholder="Ex: minha_configuracao"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Chave */}
            <div>
                <label htmlFor="chave" className="block text-sm font-medium text-gray-700 mb-1">
                    Chave *
                </label>
                <input
                    {...register('chave')}
                    type="text"
                    id="chave"
                    placeholder="Ex: taxa_juros, limite_credito"
                    disabled={!!parametro} // Não permite editar chave
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {errors.chave && (
                    <p className="mt-1 text-sm text-red-600">{errors.chave.message}</p>
                )}
                {!parametro && (
                    <p className="mt-1 text-xs text-gray-500">
                        Use apenas letras, números, ponto (.), hífen (-) ou underscore (_)
                    </p>
                )}
            </div>

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <div className="grid grid-cols-4 gap-3">
                    {Object.values(TipoParametro).map((tipo) => (
                        <label
                            key={tipo}
                            className="relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-300"
                        >
                            <input
                                {...register('tipo')}
                                type="radio"
                                value={tipo}
                                className="sr-only peer"
                            />
                            <div className="text-center peer-checked:text-purple-600">
                                <p className="font-medium text-sm">{tipo}</p>
                            </div>
                            <div className="absolute inset-0 border-2 border-purple-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </label>
                    ))}
                </div>
                {errors.tipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                )}
            </div>

            {/* Valor */}
            <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                </label>
                {renderValorInput()}
                {errors.valor && (
                    <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
                )}
            </div>

            {/* Descrição */}
            <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                </label>
                <textarea
                    {...register('descricao')}
                    id="descricao"
                    rows={2}
                    placeholder="Breve descrição sobre este parâmetro..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                {errors.descricao && (
                    <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loading size="sm" />
                            Salvando...
                        </>
                    ) : (
                        <>{parametro ? 'Atualizar' : 'Criar'} Parâmetro</>
                    )}
                </button>
            </div>
        </form>
    );
};