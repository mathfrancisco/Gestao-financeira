// src/components/receitas/ReceitaForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, DollarSign, Calendar } from 'lucide-react';
import { useReceitas } from '../../hooks/useReceitas';
import type { Receita, ReceitaDTO } from '../../types/receita';
import { formatDateToISO } from '../../utils/formatters';

const receitaSchema = z.object({
    periodoInicio: z.string().min(1, 'Data inicial é obrigatória'),
    periodoFim: z.string().min(1, 'Data final é obrigatória'),
    diasUteis: z.number().min(0, 'Dias úteis deve ser positivo').nullable(),
    salario: z.number().min(0, 'Salário deve ser positivo'),
    auxilios: z.number().min(0, 'Auxílios devem ser positivos'),
    servicosExtras: z.number().min(0, 'Serviços extras devem ser positivos'),
    observacoes: z.string().optional(),
}).refine(data => new Date(data.periodoFim) >= new Date(data.periodoInicio), {
    message: 'Data final deve ser maior ou igual à data inicial',
    path: ['periodoFim'],
});

type ReceitaFormData = z.infer<typeof receitaSchema>;

interface ReceitaFormProps {
    receita: Receita | null;
    isEditing: boolean;
    onClose: () => void;
}

export const ReceitaForm = ({ receita, isEditing, onClose }: ReceitaFormProps) => {
    const { createReceita, updateReceita, isCreating, isUpdating } = useReceitas();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ReceitaFormData>({
        resolver: zodResolver(receitaSchema),
        defaultValues: receita ? {
            periodoInicio: receita.periodoInicio,
            periodoFim: receita.periodoFim,
            diasUteis: receita.diasUteis,
            salario: receita.salario,
            auxilios: receita.auxilios,
            servicosExtras: receita.servicosExtras,
            observacoes: receita.observacoes || '',
        } : {
            periodoInicio: formatDateToISO(new Date()),
            periodoFim: formatDateToISO(new Date()),
            diasUteis: null,
            salario: 0,
            auxilios: 0,
            servicosExtras: 0,
            observacoes: '',
        },
    });

    const salario = watch('salario');
    const auxilios = watch('auxilios');
    const servicosExtras = watch('servicosExtras');
    const totalReceitas = (salario || 0) + (auxilios || 0) + (servicosExtras || 0);

    const onSubmit = (data: ReceitaFormData) => {
        const receitaDTO: ReceitaDTO = {
            periodoInicio: data.periodoInicio,
            periodoFim: data.periodoFim,
            diasUteis: data.diasUteis,
            salario: data.salario,
            auxilios: data.auxilios,
            servicosExtras: data.servicosExtras,
            observacoes: data.observacoes,
        };

        if (isEditing && receita) {
            updateReceita({ id: receita.id, data: receitaDTO });
        } else {
            createReceita(receitaDTO);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary-600" />
                        {isEditing ? 'Editar Receita' : 'Nova Receita'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Período */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Início *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    {...register('periodoInicio')}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                        errors.periodoInicio ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.periodoInicio && (
                                <p className="mt-1 text-sm text-red-600">{errors.periodoInicio.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Fim *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    {...register('periodoFim')}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                        errors.periodoFim ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.periodoFim && (
                                <p className="mt-1 text-sm text-red-600">{errors.periodoFim.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Dias Úteis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dias Úteis
                        </label>
                        <input
                            type="number"
                            {...register('diasUteis', { valueAsNumber: true })}
                            placeholder="Ex: 22"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                errors.diasUteis ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.diasUteis && (
                            <p className="mt-1 text-sm text-red-600">{errors.diasUteis.message}</p>
                        )}
                    </div>

                    {/* Valores */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Valores de Receita
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Salário *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('salario', { valueAsNumber: true })}
                                    placeholder="0,00"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                        errors.salario ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.salario && (
                                <p className="mt-1 text-sm text-red-600">{errors.salario.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Auxílios *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('auxilios', { valueAsNumber: true })}
                                    placeholder="0,00"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                        errors.auxilios ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.auxilios && (
                                <p className="mt-1 text-sm text-red-600">{errors.auxilios.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Serviços Extras *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('servicosExtras', { valueAsNumber: true })}
                                    placeholder="0,00"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                        errors.servicosExtras ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.servicosExtras && (
                                <p className="mt-1 text-sm text-red-600">{errors.servicosExtras.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Total Preview */}
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total de Receitas:</span>
                            <span className="text-2xl font-bold text-primary-600">
                R$ {totalReceitas.toFixed(2)}
              </span>
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea
                            {...register('observacoes')}
                            rows={4}
                            placeholder="Adicione observações sobre este período..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isCreating || isUpdating ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
