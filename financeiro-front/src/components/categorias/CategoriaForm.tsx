// src/components/categorias/CategoriaForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {type Categoria, TipoCategoria} from '../../types/categoria';
import { Loading } from '../common/Loading';

const categoriaSchema = z.object({
    nome: z
        .string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    tipo: z.nativeEnum(TipoCategoria, {
        errorMap: () => ({ message: 'Tipo é obrigatório' }),
    }),
    ativa: z.boolean().default(true),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
    categoria?: Categoria;
    onSubmit: (data: CategoriaFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const CategoriaForm = ({
                                  categoria,
                                  onSubmit,
                                  onCancel,
                                  isLoading = false,
                              }: CategoriaFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CategoriaFormData>({
        resolver: zodResolver(categoriaSchema),
        defaultValues: categoria
            ? {
                nome: categoria.nome,
                tipo: categoria.tipo,
                ativa: categoria.ativa,
            }
            : {
                ativa: true,
            },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div>
                <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Nome da Categoria *
                </label>
                <input
                    {...register('nome')}
                    type="text"
                    id="nome"
                    placeholder="Ex: Alimentação, Transporte, Salário..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
            </div>

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300">
                        <input
                            {...register('tipo')}
                            type="radio"
                            value={TipoCategoria.RECEITA}
                            className="sr-only peer"
                        />
                        <div className="flex items-center gap-3 w-full peer-checked:text-green-600">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center peer-checked:bg-green-600 peer-checked:text-white transition-colors">
                                <span className="text-xl">💰</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Receita</p>
                                <p className="text-xs text-gray-500 peer-checked:text-green-500">
                                    Entrada de dinheiro
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-green-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>

                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-red-300">
                        <input
                            {...register('tipo')}
                            type="radio"
                            value={TipoCategoria.DESPESA}
                            className="sr-only peer"
                        />
                        <div className="flex items-center gap-3 w-full peer-checked:text-red-600">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center peer-checked:bg-red-600 peer-checked:text-white transition-colors">
                                <span className="text-xl">💸</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Despesa</p>
                                <p className="text-xs text-gray-500 peer-checked:text-red-500">
                                    Saída de dinheiro
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-red-600 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </label>
                </div>
                {errors.tipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                )}
            </div>

            {/* Status */}
            {categoria && (
                <div>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                            {...register('ativa')}
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-gray-900">Categoria Ativa</p>
                            <p className="text-sm text-gray-500">
                                Desmarque para desativar esta categoria
                            </p>
                        </div>
                    </label>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loading size="sm" />
                            Salvando...
                        </>
                    ) : (
                        <>{categoria ? 'Atualizar' : 'Criar'} Categoria</>
                    )}
                </button>
            </div>
        </form>
    );
};