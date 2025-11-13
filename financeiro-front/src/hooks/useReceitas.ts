// src/hooks/useReceitas.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { receitaService } from '../services/receitaService';
import type { ReceitaDTO, ReceitaParams } from '../types/receita';
import { toast } from 'react-hot-toast';

export const useReceitas = (params: ReceitaParams = {}) => {
    const queryClient = useQueryClient();

    // Query para listar receitas
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['receitas', params],
        queryFn: () => receitaService.getReceitas(params),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Query para receita única
    const useGetReceita = (id: number | null) => {
        return useQuery({
            queryKey: ['receita', id],
            queryFn: () => receitaService.getReceita(id!),
            enabled: !!id,
        });
    };

    // Query para receita mais recente
    const useMaisRecente = () => {
        return useQuery({
            queryKey: ['receita-mais-recente'],
            queryFn: () => receitaService.getMaisRecente(),
        });
    };

    // Mutation para criar receita
    const createMutation = useMutation({
        mutationFn: (data: ReceitaDTO) => receitaService.createReceita(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['receitas'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Receita criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao criar receita');
        },
    });

    // Mutation para atualizar receita
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ReceitaDTO }) =>
            receitaService.updateReceita(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['receitas'] });
            queryClient.invalidateQueries({ queryKey: ['receita'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Receita atualizada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar receita');
        },
    });

    // Mutation para deletar receita
    const deleteMutation = useMutation({
        mutationFn: (id: number) => receitaService.deleteReceita(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['receitas'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Receita deletada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar receita');
        },
    });

    return {
        receitas: data?.content || [],
        pagination: {
            totalElements: data?.totalElements || 0,
            totalPages: data?.totalPages || 0,
            currentPage: data?.number || 0,
            size: data?.size || 20,
            first: data?.first || true,
            last: data?.last || true,
        },
        isLoading,
        error,
        refetch,
        createReceita: createMutation.mutate,
        updateReceita: updateMutation.mutate,
        deleteReceita: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        useGetReceita,
        useMaisRecente,
    };
};
