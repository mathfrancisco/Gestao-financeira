import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metaService } from '../services/metaService';
import type {
    MetaDTO,
    MetaParams,
    AporteMetaDTO,
    StatusMeta,
    TipoMeta
} from '../types/meta';

// ==================== QUERY KEYS ====================
export const metaKeys = {
    all: ['metas'] as const,
    lists: () => [...metaKeys.all, 'list'] as const,
    list: (params: MetaParams) => [...metaKeys.lists(), params] as const,
    details: () => [...metaKeys.all, 'detail'] as const,
    detail: (id: number) => [...metaKeys.details(), id] as const,
    detailWithTransacoes: (id: number) => [...metaKeys.details(), id, 'transacoes'] as const,
    transacoes: (metaId: number) => [...metaKeys.all, 'transacoes', metaId] as const,
    emAndamento: () => [...metaKeys.all, 'em-andamento'] as const,
    concluidas: () => [...metaKeys.all, 'concluidas'] as const,
    vencidas: () => [...metaKeys.all, 'vencidas'] as const,
    proximasVencimento: () => [...metaKeys.all, 'proximas-vencimento'] as const,
    porStatus: (status: StatusMeta) => [...metaKeys.all, 'status', status] as const,
    porTipo: (tipo: TipoMeta) => [...metaKeys.all, 'tipo', tipo] as const,
    resumo: () => [...metaKeys.all, 'resumo'] as const,
};

// ==================== QUERIES ====================

/**
 * Lista metas com paginação e filtros
 */
export const useMetas = (params: MetaParams = {}) => {
    return useQuery({
        queryKey: metaKeys.list(params),
        queryFn: () => metaService.getMetas(params),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};

/**
 * Busca meta por ID
 */
export const useMeta = (id: number) => {
    return useQuery({
        queryKey: metaKeys.detail(id),
        queryFn: () => metaService.getMeta(id),
        enabled: !!id,
    });
};

/**
 * Busca meta com transações
 */
export const useMetaWithTransacoes = (id: number) => {
    return useQuery({
        queryKey: metaKeys.detailWithTransacoes(id),
        queryFn: () => metaService.getMetaWithTransacoes(id),
        enabled: !!id,
    });
};

/**
 * Busca transações de uma meta
 */
export const useTransacoesMeta = (metaId: number, pageable?: any) => {
    return useQuery({
        queryKey: metaKeys.transacoes(metaId),
        queryFn: () => metaService.getTransacoes(metaId, pageable),
        enabled: !!metaId,
    });
};

/**
 * Busca metas em andamento
 */
export const useMetasEmAndamento = () => {
    return useQuery({
        queryKey: metaKeys.emAndamento(),
        queryFn: () => metaService.getMetasEmAndamento(),
    });
};

/**
 * Busca metas concluídas
 */
export const useMetasConcluidas = () => {
    return useQuery({
        queryKey: metaKeys.concluidas(),
        queryFn: () => metaService.getMetasConcluidas(),
    });
};

/**
 * Busca metas vencidas
 */
export const useMetasVencidas = () => {
    return useQuery({
        queryKey: metaKeys.vencidas(),
        queryFn: () => metaService.getMetasVencidas(),
    });
};

/**
 * Busca metas próximas do vencimento
 */
export const useMetasProximasVencimento = () => {
    return useQuery({
        queryKey: metaKeys.proximasVencimento(),
        queryFn: () => metaService.getMetasProximasVencimento(),
    });
};

/**
 * Busca metas por status
 */
export const useMetasPorStatus = (status: StatusMeta, pageable?: any) => {
    return useQuery({
        queryKey: metaKeys.porStatus(status),
        queryFn: () => metaService.getMetasPorStatus(status, pageable),
    });
};

/**
 * Busca metas por tipo
 */
export const useMetasPorTipo = (tipo: TipoMeta) => {
    return useQuery({
        queryKey: metaKeys.porTipo(tipo),
        queryFn: () => metaService.getMetasPorTipo(tipo),
    });
};

/**
 * Resumo geral das metas
 */
export const useMetaResumo = () => {
    return useQuery({
        queryKey: metaKeys.resumo(),
        queryFn: () => metaService.getResumo(),
    });
};

// ==================== MUTATIONS ====================

/**
 * Cria nova meta
 */
export const useCreateMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MetaDTO) => metaService.createMeta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Atualiza meta
 */
export const useUpdateMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: MetaDTO }) =>
            metaService.updateMeta(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
        },
    });
};

/**
 * Remove meta
 */
export const useDeleteMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => metaService.deleteMeta(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Adiciona aporte à meta
 */
export const useAdicionarAporte = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ metaId, data }: { metaId: number; data: AporteMetaDTO }) =>
            metaService.adicionarAporte(metaId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.detailWithTransacoes(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.transacoes(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

/**
 * Adiciona resgate à meta
 */
export const useAdicionarResgate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ metaId, data }: { metaId: number; data: AporteMetaDTO }) =>
            metaService.adicionarResgate(metaId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.detailWithTransacoes(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.transacoes(variables.metaId) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
        },
    });
};

/**
 * Cancela meta
 */
export const useCancelarMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => metaService.cancelarMeta(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
        },
    });
};

/**
 * Pausa meta
 */
export const usePausarMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => metaService.pausarMeta(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
        },
    });
};

/**
 * Retoma meta pausada
 */
export const useRetomarMeta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => metaService.retomarMeta(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: metaKeys.lists() });
            queryClient.invalidateQueries({ queryKey: metaKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: metaKeys.resumo() });
        },
    });
};