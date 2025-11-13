import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parametroService } from '../services/parametroService';
import type { ParametroDTO, TipoParametro } from '../types/parametro';

// ==================== QUERY KEYS ====================
export const parametroKeys = {
    all: ['parametros'] as const,
    lists: () => [...parametroKeys.all, 'list'] as const,
    list: () => [...parametroKeys.lists()] as const,
    details: () => [...parametroKeys.all, 'detail'] as const,
    detail: (id: number) => [...parametroKeys.details(), id] as const,
    byChave: (chave: string) => [...parametroKeys.all, 'chave', chave] as const,
    byTipo: (tipo: TipoParametro) => [...parametroKeys.all, 'tipo', tipo] as const,
    resumo: () => [...parametroKeys.all, 'resumo'] as const,
    asMap: () => [...parametroKeys.all, 'map'] as const,
};

// ==================== QUERIES ====================

/**
 * Lista todos os parâmetros
 */
export const useParametros = () => {
    return useQuery({
        queryKey: parametroKeys.list(),
        queryFn: () => parametroService.getParametros(),
        staleTime: 1000 * 60 * 10, // 10 minutos (configurações mudam pouco)
    });
};

/**
 * Busca parâmetro por ID
 */
export const useParametro = (id: number) => {
    return useQuery({
        queryKey: parametroKeys.detail(id),
        queryFn: () => parametroService.getParametro(id),
        enabled: !!id,
    });
};

/**
 * Busca parâmetro por chave
 */
export const useParametroByChave = (chave: string) => {
    return useQuery({
        queryKey: parametroKeys.byChave(chave),
        queryFn: () => parametroService.getParametroByChave(chave),
        enabled: !!chave,
    });
};

/**
 * Busca parâmetros por tipo
 */
export const useParametrosByTipo = (tipo: TipoParametro) => {
    return useQuery({
        queryKey: parametroKeys.byTipo(tipo),
        queryFn: () => parametroService.getParametrosByTipo(tipo),
    });
};

/**
 * Busca parâmetros como Map (chave -> valor)
 */
export const useParametrosAsMap = () => {
    return useQuery({
        queryKey: parametroKeys.asMap(),
        queryFn: () => parametroService.getAllAsMap(),
        staleTime: 1000 * 60 * 10,
    });
};

/**
 * Resumo de parâmetros
 */
export const useParametroResumo = () => {
    return useQuery({
        queryKey: parametroKeys.resumo(),
        queryFn: () => parametroService.getResumo(),
    });
};

// ==================== MUTATIONS ====================

/**
 * Cria novo parâmetro
 */
export const useCreateParametro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ParametroDTO) => parametroService.createParametro(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: parametroKeys.lists() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.resumo() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.asMap() });
        },
    });
};

/**
 * Atualiza parâmetro
 */
export const useUpdateParametro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ParametroDTO }) =>
            parametroService.updateParametro(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: parametroKeys.lists() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: parametroKeys.asMap() });
        },
    });
};

/**
 * Atualiza apenas valor do parâmetro
 */
export const useUpdateValor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ chave, valor }: { chave: string; valor: string }) =>
            parametroService.updateValor(chave, valor),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: parametroKeys.lists() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.byChave(variables.chave) });
            queryClient.invalidateQueries({ queryKey: parametroKeys.asMap() });
        },
    });
};

/**
 * Remove parâmetro
 */
export const useDeleteParametro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => parametroService.deleteParametro(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: parametroKeys.lists() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.resumo() });
            queryClient.invalidateQueries({ queryKey: parametroKeys.asMap() });
        },
    });
};