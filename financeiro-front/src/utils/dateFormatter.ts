import {
    format,
    parse,
    isValid,
    parseISO,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    differenceInDays,
    differenceInMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data de acordo com o padrão especificado
 * @param date - Data a ser formatada (Date, string ISO ou timestamp)
 * @param formatStr - Padrão de formatação (padrão: 'dd/MM/yyyy')
 * @returns String formatada
 */
export const formatDate = (
    date: Date | string | number | null | undefined,
    formatStr: string = 'dd/MM/yyyy'
): string => {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

        if (!isValid(dateObj)) return '-';

        return format(dateObj, formatStr, { locale: ptBR });
    } catch {
        return '-';
    }
};

/**
 * Formata data e hora
 * @param date - Data a ser formatada
 * @returns String formatada (ex: "15/03/2024 14:30")
 */
export const formatDateTime = (
    date: Date | string | number
): string => {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formata data de forma relativa (ex: "há 2 dias")
 * @param date - Data a ser formatada
 * @returns String formatada
 */
export const formatRelativeDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const days = differenceInDays(now, dateObj);

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    if (days < 30) return `Há ${Math.floor(days / 7)} semanas`;

    const months = differenceInMonths(now, dateObj);
    if (months < 12) return `Há ${months} meses`;

    return formatDate(dateObj);
};

/**
 * Retorna nome do mês
 * @param month - Número do mês (1-12)
 * @returns Nome do mês em português
 */
export const getMonthName = (month: number): string => {
    const months = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
    ];

    return months[month - 1] || '';
};

/**
 * Retorna nome abreviado do mês
 * @param month - Número do mês (1-12)
 * @returns Nome abreviado (ex: "Jan", "Fev")
 */
export const getShortMonthName = (month: number): string => {
    const months = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
    ];

    return months[month - 1] || '';
};

/**
 * Formata período mês/ano
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns String formatada (ex: "Março/2024")
 */
export const formatPeriod = (month: number, year: number): string => {
    return `${getMonthName(month)}/${year}`;
};

/**
 * Formata período curto
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns String formatada (ex: "03/2024")
 */
export const formatShortPeriod = (month: number, year: number): string => {
    return `${month.toString().padStart(2, '0')}/${year}`;
};

/**
 * Retorna primeiro dia do mês
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Date do primeiro dia
 */
export const getFirstDayOfMonth = (month: number, year: number): Date => {
    return startOfMonth(new Date(year, month - 1, 1));
};

/**
 * Retorna último dia do mês
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Date do último dia
 */
export const getLastDayOfMonth = (month: number, year: number): Date => {
    return endOfMonth(new Date(year, month - 1, 1));
};

/**
 * Retorna mês e ano atual
 * @returns { month, year }
 */
export const getCurrentPeriod = (): { month: number; year: number } => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    };
};

/**
 * Retorna mês e ano anterior
 * @param month - Mês atual (1-12)
 * @param year - Ano atual
 * @returns { month, year } do mês anterior
 */
export const getPreviousPeriod = (
    month: number,
    year: number
): { month: number; year: number } => {
    const date = subMonths(new Date(year, month - 1, 1), 1);
    return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
};

/**
 * Retorna próximo mês e ano
 * @param month - Mês atual (1-12)
 * @param year - Ano atual
 * @returns { month, year } do próximo mês
 */
export const getNextPeriod = (
    month: number,
    year: number
): { month: number; year: number } => {
    const date = addMonths(new Date(year, month - 1, 1), 1);
    return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
};

/**
 * Parse de string de data para Date
 * @param dateString - String no formato dd/MM/yyyy
 * @returns Date object
 */
export const parseDate = (dateString: string): Date | null => {
    try {
        const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
        return isValid(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

/**
 * Formata data para ISO string (para envio ao backend)
 * @param date - Data a ser formatada
 * @returns String ISO (yyyy-MM-dd)
 */
export const formatISO = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Verifica se uma data está no passado
 * @param date - Data a verificar
 * @returns true se estiver no passado
 */
export const isPast = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
};

/**
 * Verifica se uma data está no futuro
 * @param date - Data a verificar
 * @returns true se estiver no futuro
 */
export const isFuture = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
};