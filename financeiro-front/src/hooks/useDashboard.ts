// src/hooks/useDashboard.ts

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { DashboardFilters } from '../types/dashboard';

export const useDashboard = (filters?: DashboardFilters) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboard', filters?.mes, filters?.ano],
        queryFn: () => dashboardService.getDashboard(filters?.mes, filters?.ano),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    return {
        dashboard: data,
        isLoading,
        error,
        refetch,
    };
};

export const useSaldo = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', 'saldo'],
        queryFn: () => dashboardService.getSaldo(),
        staleTime: 2 * 60 * 1000, // 2 minutos
    });

    return {
        saldo: data,
        isLoading,
        error,
    };
};

export const useEvolucao = (meses: number = 6) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', 'evolucao', meses],
        queryFn: () => dashboardService.getEvolucao(meses),
        staleTime: 10 * 60 * 1000, // 10 minutos
    });

    return {
        evolucao: data,
        isLoading,
        error,
    };
};

export const useTopCategorias = (
    limite: number = 5,
    filters?: DashboardFilters
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', 'top-categorias', limite, filters?.mes, filters?.ano],
        queryFn: () =>
            dashboardService.getTopCategorias(limite, filters?.mes, filters?.ano),
        staleTime: 5 * 60 * 1000,
    });

    return {
        topCategorias: data,
        isLoading,
        error,
    };
};

export const useIndicadores = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', 'indicadores'],
        queryFn: () => dashboardService.getIndicadores(),
        staleTime: 5 * 60 * 1000,
    });

    return {
        indicadores: data,
        isLoading,
        error,
    };
};

export const useComparativo = (
    mes1: number,
    ano1: number,
    mes2: number,
    ano2: number
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', 'comparativo', mes1, ano1, mes2, ano2],
        queryFn: () => dashboardService.compararPeriodos(mes1, ano1, mes2, ano2),
        enabled: !!(mes1 && ano1 && mes2 && ano2),
        staleTime: 10 * 60 * 1000,
    });

    return {
        comparativo: data,
        isLoading,
        error,
    };
};