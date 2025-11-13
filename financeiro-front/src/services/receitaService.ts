// src/services/receitaService.ts
import api from './api';
import type { Receita, ReceitaDTO, ReceitaParams, PagedResponse } from '../types/receita';

export const receitaService = {
    // Listar receitas com paginação
    async getReceitas(params: ReceitaParams = {}): Promise<PagedResponse<Receita>> {
        const { page = 0, size = 20, sort = 'periodoInicio', direction = 'DESC', inicio, fim } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        if (inicio && fim) {
            queryParams.append('inicio', inicio);
            queryParams.append('fim', fim);
        }

        const response = await api.get<PagedResponse<Receita>>(`/receitas?${queryParams}`);
        return response.data;
    },

    // Buscar receita por ID
    async getReceita(id: number): Promise<Receita> {
        const response = await api.get<Receita>(`/receitas/${id}`);
        return response.data;
    },

    // Buscar receita com despesas
    async getReceitaWithDespesas(id: number): Promise<Receita> {
        const response = await api.get<Receita>(`/receitas/${id}/despesas`);
        return response.data;
    },

    // Buscar receita mais recente
    async getMaisRecente(): Promise<Receita> {
        const response = await api.get<Receita>('/receitas/mais-recente');
        return response.data;
    },

    // Buscar por período
    async getByPeriodo(inicio: string, fim: string): Promise<Receita[]> {
        const response = await api.get<Receita[]>('/receitas/periodo', {
            params: { inicio, fim }
        });
        return response.data;
    },

    // Buscar por ano
    async getByAno(ano: number): Promise<Receita[]> {
        const response = await api.get<Receita[]>(`/receitas/ano/${ano}`);
        return response.data;
    },

    // Criar receita
    async createReceita(data: ReceitaDTO): Promise<Receita> {
        const response = await api.post<Receita>('/receitas', data);
        return response.data;
    },

    // Atualizar receita
    async updateReceita(id: number, data: ReceitaDTO): Promise<Receita> {
        const response = await api.put<Receita>(`/receitas/${id}`, data);
        return response.data;
    },

    // Deletar receita
    async deleteReceita(id: number): Promise<void> {
        await api.delete(`/receitas/${id}`);
    },

    // Calcular total por período
    async calcularTotalPorPeriodo(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/receitas/total', {
            params: { inicio, fim }
        });
        return response.data;
    },

    // Calcular média mensal
    async calcularMediaMensal(): Promise<number> {
        const response = await api.get<number>('/receitas/media-mensal');
        return response.data;
    },

    // Contar total
    async count(): Promise<number> {
        const response = await api.get<number>('/receitas/count');
        return response.data;
    }
};
