// src/hooks/useCategorias.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriaService } from '../services/categoriaService';
import type { CategoriaRequestDTO, TipoCategoria } from '../types/categoria';

export const useCategorias = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias'],
        queryFn: () => categoriaService.findAll(),
        staleTime: 10 * 60 * 1000, // 10 minutos
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoriasAtivas = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'ativas'],
        queryFn: () => categoriaService.findAtivas(),
        staleTime: 10 * 60 * 1000,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoriasByTipo = (tipo: TipoCategoria) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'tipo', tipo],
        queryFn: () => categoriaService.findByTipo(tipo),
        staleTime: 10 * 60 * 1000,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoriasAtivasByTipo = (tipo: TipoCategoria) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'tipo', tipo, 'ativas'],
        queryFn: () => categoriaService.findAtivasByTipo(tipo),
        staleTime: 10 * 60 * 1000,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoriasDespesaAtivas = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'despesa', 'ativas'],
        queryFn: () => categoriaService.findCategoriasDespesaAtivas(),
        staleTime: 10 * 60 * 1000,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoriasReceitaAtivas = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'receita', 'ativas'],
        queryFn: () => categoriaService.findCategoriasReceitaAtivas(),
        staleTime: 10 * 60 * 1000,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useCategoria = (id: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', id],
        queryFn: () => categoriaService.findById(id),
        enabled: !!id,
    });

    return {
        categoria: data,
        isLoading,
        error,
    };
};

export const useCategoriaWithDespesas = (id: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', id, 'despesas'],
        queryFn: () => categoriaService.findByIdWithDespesas(id),
        enabled: !!id,
    });

    return {
        categoria: data,
        isLoading,
        error,
    };
};

export const useSearchCategorias = (nome: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'search', nome],
        queryFn: () => categoriaService.searchByNome(nome),
        enabled: nome.length >= 2,
    });

    return {
        categorias: data,
        isLoading,
        error,
    };
};

export const useResumoCategoria = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['categorias', 'resumo'],
        queryFn: () => categoriaService.getResumo(),
        staleTime: 5 * 60 * 1000,
    });

    return {
        resumo: data,
        isLoading,
        error,
    };
};

// Mutations
export const useCreateCategoria = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CategoriaRequestDTO) => categoriaService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};

export const useUpdateCategoria = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoriaRequestDTO }) =>
            categoriaService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};

export const useDeleteCategoria = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => categoriaService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};

export const useToggleCategoria = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ativa }: { id: number; ativa: boolean }) =>
            ativa ? categoriaService.desativar(id) : categoriaService.ativar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
    });
};