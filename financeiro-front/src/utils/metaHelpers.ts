import { CheckCircle, XCircle, Pause, Target, TrendingUp, ShoppingCart } from 'lucide-react';
import { StatusMeta, TipoMeta } from '../types/meta';
import type { MetaStatusBadge, MetaProgressConfig } from '../types/meta';

export const getMetaStatusBadge = (status: StatusMeta): MetaStatusBadge & { icon: any; tipoLabel: string } => {
    switch (status) {
        case StatusMeta.EM_ANDAMENTO:
            return {
                label: 'Em Andamento',
                tipoLabel: 'Meta Ativa',
                color: 'blue',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
                icon: Target,
            };
        case StatusMeta.CONCLUIDA:
            return {
                label: 'Concluída',
                tipoLabel: 'Meta Atingida',
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                icon: CheckCircle,
            };
        case StatusMeta.CANCELADA:
            return {
                label: 'Cancelada',
                tipoLabel: 'Meta Cancelada',
                color: 'red',
                bgColor: 'bg-red-100',
                textColor: 'text-red-700',
                icon: XCircle,
            };
        case StatusMeta.PAUSADA:
            return {
                label: 'Pausada',
                tipoLabel: 'Meta Pausada',
                color: 'yellow',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-700',
                icon: Pause,
            };
        default:
            return {
                label: 'Desconhecido',
                tipoLabel: 'Status Desconhecido',
                color: 'yellow',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700',
                icon: Target,
            };
    }
};

export const getMetaTipoIcon = (tipo: TipoMeta) => {
    switch (tipo) {
        case TipoMeta.ECONOMIA:
            return Target;
        case TipoMeta.INVESTIMENTO:
            return TrendingUp;
        case TipoMeta.COMPRA:
            return ShoppingCart;
        default:
            return Target;
    }
};

export const getMetaProgressConfig = (percentage: number): MetaProgressConfig => {
    if (percentage >= 100) {
        return {
            percentage,
            color: 'text-green-600',
            label: 'Meta Atingida!',
            barColor: 'bg-green-600',
        };
    } else if (percentage >= 75) {
        return {
            percentage,
            color: 'text-blue-600',
            label: 'Quase lá!',
            barColor: 'bg-blue-600',
        };
    } else if (percentage >= 50) {
        return {
            percentage,
            color: 'text-yellow-600',
            label: 'Na metade do caminho',
            barColor: 'bg-yellow-500',
        };
    } else if (percentage >= 25) {
        return {
            percentage,
            color: 'text-orange-600',
            label: 'Progredindo',
            barColor: 'bg-orange-500',
        };
    } else {
        return {
            percentage,
            color: 'text-red-600',
            label: 'Começando',
            barColor: 'bg-red-500',
        };
    }
};

export const calcularDiasRestantes = (prazo: string): number => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const diff = dataPrazo.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const calcularAporteMensalNecessario = (
    valorRestante: number,
    prazo: string | null
): number | null => {
    if (!prazo) return null;

    const diasRestantes = calcularDiasRestantes(prazo);
    if (diasRestantes <= 0) return null;

    const mesesRestantes = Math.max(1, Math.ceil(diasRestantes / 30));
    return valorRestante / mesesRestantes;
};