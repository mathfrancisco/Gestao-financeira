import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useMetaResumo } from '../../hooks/useMetas';
import { formatCurrency } from '../../utils/currencyFormatter';
import { Loading } from '../common/Loading';

interface MetasResumeProps {
    className?: string;
}

export const MetasResume = ({ className = '' }: MetasResumeProps) => {
    const { data: resumo, isLoading } = useMetaResumo();

    if (isLoading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                        <Loading variant="skeleton" />
                    </div>
                ))}
            </div>
        );
    }

    if (!resumo) return null;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {/* Total de Metas */}
            <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total de Metas</p>
                    <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{resumo.totalMetas}</p>
                <p className="text-xs text-gray-500 mt-2">
                    {resumo.emAndamento} em andamento
                </p>
            </div>

            {/* Progresso Geral */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-700">Progresso Geral</p>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                    {resumo.progressoGeral.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-2">
                    {formatCurrency(resumo.totalValorAtual)} de {formatCurrency(resumo.totalValorObjetivo)}
                </p>
            </div>

            {/* Metas Concluídas */}
            <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-emerald-700">Concluídas</p>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-600">{resumo.concluidas}</p>
                <p className="text-xs text-emerald-600 mt-2">
                    {resumo.totalMetas > 0
                        ? `${((resumo.concluidas / resumo.totalMetas) * 100).toFixed(0)}% do total`
                        : 'Nenhuma meta ainda'}
                </p>
            </div>

            {/* Alertas */}
            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-700">Atenção</p>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{resumo.metasVencidas}</p>
                <p className="text-xs text-red-600 mt-2">
                    {resumo.metasProximasVencimento} próximas do vencimento
                </p>
            </div>
        </div>
    );
};