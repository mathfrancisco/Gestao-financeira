import { TipoParametro } from '../types/parametro';
import type { ParametroTipoBadge } from '../types/parametro';

export const getParametroTipoBadge = (tipo: TipoParametro): ParametroTipoBadge => {
    switch (tipo) {
        case TipoParametro.STRING:
            return {
                label: 'String',
                icon: '📝',
                color: 'text-blue-700',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
            };
        case TipoParametro.NUMBER:
            return {
                label: 'Number',
                icon: '🔢',
                color: 'text-green-700',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
            };
        case TipoParametro.BOOLEAN:
            return {
                label: 'Boolean',
                icon: '✓',
                color: 'text-purple-700',
                bgColor: 'bg-purple-100',
                textColor: 'text-purple-700',
            };
        case TipoParametro.JSON:
            return {
                label: 'JSON',
                icon: '{}',
                color: 'text-orange-700',
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-700',
            };
        default:
            return {
                label: 'Unknown',
                icon: '?',
                color: 'text-gray-700',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700',
            };
    }
};

export const validateJSON = (value: string): boolean => {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
};

export const formatParametroValue = (tipo: TipoParametro, valor: string): string => {
    switch (tipo) {
        case TipoParametro.BOOLEAN:
            return valor === 'true' ? 'Verdadeiro' : 'Falso';
        case TipoParametro.JSON:
            try {
                return JSON.stringify(JSON.parse(valor), null, 2);
            } catch {
                return valor;
            }
        default:
            return valor;
    }
};