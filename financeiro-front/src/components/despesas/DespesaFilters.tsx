import { useForm } from 'react-hook-form';
import { StatusPagamento, type DespesaParams } from '../../types/despesa';
import { useCategorias } from '../../hooks/useCategorias';
import { TipoCategoria } from '../../types/categoria';

interface DespesaFiltersProps {
    onApply: (filters: DespesaParams) => void;
    onClose: () => void;
    initialFilters?: DespesaParams;
}

export const DespesaFilters = ({ onApply, initialFilters = {} }: DespesaFiltersProps) => {
    const { categorias } = useCategorias();

    const categoriasDespesa = categorias?.filter(
        (cat) => cat.tipo === TipoCategoria.DESPESA && cat.ativa
    );

    const { register, handleSubmit, reset } = useForm<DespesaParams>({
        defaultValues: initialFilters,
    });

    const onSubmit = (data: DespesaParams) => {
        // Remove valores vazios
        const cleanFilters = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        );
        onApply(cleanFilters);
    };

    const handleClear = () => {
        reset({});
        onApply({});
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Período */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Período</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="inicio" className="block text-sm text-gray-700 mb-1">
                            Data Inicial
                        </label>
                        <input
                            {...register('inicio')}
                            type="date"
                            id="inicio"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="fim" className="block text-sm text-gray-700 mb-1">
                            Data Final
                        </label>
                        <input
                            {...register('fim')}
                            type="date"
                            id="fim"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>
            </div>

            {/* Categoria */}
            <div>
                <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                </label>
                <select
                    {...register('categoriaId', {
                        setValueAs: (v) => v === '' ? undefined : parseInt(v)
                    })}
                    id="categoriaId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">Todas as categorias</option>
                    {categoriasDespesa?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                </label>
                <select
                    {...register('status')}
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">Todos os status</option>
                    <option value={StatusPagamento.PENDENTE}>Pendente</option>
                    <option value={StatusPagamento.PAGO}>Pago</option>
                    <option value={StatusPagamento.VENCIDO}>Vencido</option>
                </select>
            </div>

            {/* Ordenação */}
            <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        {...register('sort')}
                        id="sort"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="data">Data</option>
                        <option value="valor">Valor</option>
                        <option value="descricao">Descrição</option>
                        <option value="createdAt">Criação</option>
                    </select>
                    <select
                        {...register('direction')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="DESC">Decrescente</option>
                        <option value="ASC">Crescente</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Limpar
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                    Aplicar Filtros
                </button>
            </div>
        </form>
    );
};