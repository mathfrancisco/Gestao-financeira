// src/utils/currencyFormatter.ts

/**
 * Formata um valor numérico como moeda
 * @param value - Valor a ser formatado
 * @param currency - Código da moeda (padrão: BRL)
 * @param locale - Locale para formatação (padrão: pt-BR)
 * @returns String formatada como moeda
 */
export const formatCurrency = (
    value: number | string | null | undefined,
    currency: string = 'BRL',
    locale: string = 'pt-BR'
): string => {
    if (value === null || value === undefined) {
        return formatCurrency(0, currency, locale);
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
        return formatCurrency(0, currency, locale);
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);
};

/**
 * Remove formatação de moeda e retorna número
 * @param formatted - String formatada como moeda
 * @returns Valor numérico
 */
export const parseCurrency = (formatted: string): number => {
    if (!formatted) return 0;

    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    const cleaned = formatted.replace(/[^\d,.-]/g, '');

    // Substitui vírgula por ponto para parseFloat
    const normalized = cleaned.replace(',', '.');

    const value = parseFloat(normalized);
    return isNaN(value) ? 0 : value;
};

/**
 * Formata apenas o número sem símbolo de moeda
 * @param value - Valor a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada
 */
export const formatNumber = (
    value: number | string,
    decimals: number = 2
): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
        return '0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(numericValue);
};

/**
 * Formata valor como percentual
 * @param value - Valor decimal (ex: 0.15 para 15%)
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada como percentual
 */
export const formatPercentage = (
    value: number,
    decimals: number = 1
): string => {
    if (isNaN(value)) return '0%';

    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
};

/**
 * Formata valor compacto (ex: 1.5K, 2.3M)
 * @param value - Valor a ser formatado
 * @returns String formatada de forma compacta
 */
export const formatCompact = (value: number): string => {
    if (isNaN(value)) return 'R$ 0';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        compactDisplay: 'short',
    }).format(value);
};

/**
 * Calcula variação percentual entre dois valores
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Percentual de variação
 */
export const calculateVariation = (
    current: number,
    previous: number
): number => {
    if (previous === 0) return current > 0 ? 100 : 0;

    return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Formata variação com sinal e percentual
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns String formatada (ex: "+15.5%" ou "-8.2%")
 */
export const formatVariation = (current: number, previous: number): string => {
    const variation = calculateVariation(current, previous);
    const sign = variation > 0 ? '+' : '';
    return `${sign}${formatNumber(variation, 1)}%`;
};