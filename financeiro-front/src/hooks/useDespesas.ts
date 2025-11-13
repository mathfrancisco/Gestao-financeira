import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { despesaService } from '../services/despesaService';
import type {
    DespesaDTO,
    DespesaParams,
    StatusPagamento
} from '../types/despesa';

// ==================== QUERY KEYS ====================
export const despesaKeys = {
    all: ['despesas'] as const,
    lists: () => [...despesaKeys.all, 'list'] as const,
    list: (params: DespesaParams) => [...despesaKeys.lists(), params] as const,
    details: () => [...despesaKeys.all, 'detail'] as const,
    detail: (id: number) => [...despesaKeys.details(), id] as const,
    vencidas: () => [...despesaKeys.all, 'vencidas'] as const,
    parceladas: () => [...despesaKeys.all, 'parceladas'] as const,
    porStatus: (status: StatusPagamento) => [...despesaKeys.all, 'status', status] as const,
    porMes: (ano: number, mes: number) => [...despesaKeys.all, 'mes', ano, mes] as const,
    resumoMensal: (ano: number, mes: number) => [...despesaKeys.all, 'resumo', ano, mes] as const,
};

// ==================== QUERIES ====================

/**
 * Lista despesas com paginação e filtros
 */
export const useDespesas = (params: DespesaParams = {}) => {
    return useQuery({
        queryKey: despesaKeys.list(params),
        queryFn: () => despesaService.getDespesas(params),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};

/**
 * Busca despesa por ID
 */
export const useDespesa = (id: number) => {
    return useQuery({
        queryKey: despesaKeys.detail(id),
        queryFn: () => despesaService.getDespesa(id),
        enabled: !!id,
    });
};

/**
 * Busca despesas vencidas
 */
export const useDespesasVencidas = () => {
    return useQuery({
        queryKey: despesaKeys.vencidas(),
        queryFn: () => despesaService.getDespesasVencidas(),
    });
};

/**
 * Busca despesas parceladas
 */
export const useDespesasParceladas = () => {
    return useQuery({
        queryKey: despesaKeys.parceladas(),
        queryFn: () => despesaService.getDespesasParceladas(),
    });
};

/**
 * Busca despesas por status
 */
export const useDespesasPorStatus = (status: StatusPagamento) => {
    return useQuery({
        queryKey: despesaKeys.porStatus(status),
        queryFn: () => despesaService.getDespesasPorStatus(status),
    });
};

/**
 * Busca despesas do mês
 */
export const useDespesasPorMes = (ano: number, mes: number) => {
    return useQuery({
        queryKey: despesaKeys.porMes(ano, mes),
        queryFn: () => despesaService.getDespesasPorMes(ano, mes),
    });
};

/**
 * Resumo mensal de despesas
 */
export const useResumoMensal = (ano: number, mes: number) => {
    return useQuery({
        queryKey: despesaKeys.resumoMensal(ano, mes),
        queryFn: () => despesaService.getResumoMensal(ano, mes),
    });
};

// ==================== MUTATIONS ====================

/**
 * Cria nova despesa
 */
export const useCreateDespesa = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DespesaDTO) => despesaService.createDespesa(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: despesaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Atualiza despesa
 */
export const useUpdateDespesa = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: DespesaDTO }) =>
            despesaService.updateDespesa(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: despesaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: despesaKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Remove despesa
 */
export const useDeleteDespesa = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => despesaService.deleteDespesa(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: despesaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Marca despesa como paga
 */
export const useMarcarComoPaga = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => despesaService.marcarComoPaga(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: despesaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: despesaKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: despesaKeys.vencidas() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Marca despesa como pendente
 */
export const useMarcarComoPendente = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => despesaService.marcarComoPendente(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: despesaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: despesaKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};