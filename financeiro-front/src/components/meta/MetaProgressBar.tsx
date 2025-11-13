import { getMetaProgressConfig } from '../../utils/metaHelpers';

interface MetaProgressBarProps {
    current: number;
    target: number;
    percentage?: number;
    showPercentage?: boolean;
    showValues?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

export const MetaProgressBar = ({
                                    current,
                                    target,
                                    percentage,
                                    showPercentage = false,
                                    showValues = false,
                                    size = 'md',
                                    animated = true,
                                }: MetaProgressBarProps) => {
    // Calcula percentual se não foi fornecido
    const calculatedPercentage = percentage ?? Math.min((current / target) * 100, 100);

    // Obtém configuração de cores baseada no progresso
    const config = getMetaProgressConfig(calculatedPercentage);

    // Define altura da barra baseado no tamanho
    const heights = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className="w-full">
            {/* Valores Atual e Objetivo (opcional) */}
            {showValues && (
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            )}

            {/* Barra de Progresso */}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
                <div
                    className={`${heights[size]} ${config.barColor} rounded-full ${
                        animated ? 'transition-all duration-500 ease-out' : ''
                    }`}
                    style={{ width: `${calculatedPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={calculatedPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>

            {/* Percentual e Label (opcional) */}
            {showPercentage && (
                <div className="flex justify-between items-center mt-2">
          <span className={`text-sm font-semibold ${config.color}`}>
            {calculatedPercentage.toFixed(1)}%
          </span>
                    <span className="text-xs text-gray-500">{config.label}</span>
                </div>
            )}
        </div>
    );
};