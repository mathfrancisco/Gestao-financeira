import api from './api';
import type {
    Despesa,
    DespesaDTO,
    DespesaParams,
    PagedDespesaResponse,
    DespesaResumoMensal,
    StatusPagamento
} from '../types/despesa';

export const despesaService = {
    // ==================== CRUD BÁSICO ====================

    /**
     * Lista despesas com paginação e filtros
     */
    async getDespesas(params: DespesaParams = {}): Promise<PagedDespesaResponse> {
        const {
            page = 0,
            size = 20,
            sort = 'data',
            direction = 'DESC',
            inicio,
            fim,
            categoriaId,
            status,
            receitaId
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        if (inicio && fim) {
            queryParams.append('inicio', inicio);
            queryParams.append('fim', fim);
        }

        if (categoriaId) {
            return this.getDespesasPorCategoria(categoriaId, { page, size, sort, direction });
        }

        if (status) {
            const response = await api.get<Despesa[]>(`/despesas/status/${status}`);
            return {
                content: response.data,
                totalElements: response.data.length,
                totalPages: 1,
                size: response.data.length,
                number: 0,
                first: true,
                last: true,
                empty: response.data.length === 0
            };
        }

        if (receitaId) {
            const response = await api.get<Despesa[]>(`/despesas/receita/${receitaId}`);
            return {
                content: response.data,
                totalElements: response.data.length,
                totalPages: 1,
                size: response.data.length,
                number: 0,
                first: true,
                last: true,
                empty: response.data.length === 0
            };
        }

        const response = await api.get<PagedDespesaResponse>(`/despesas?${queryParams}`);
        return response.data;
    },

    /**
     * Busca despesa por ID
     */
    async getDespesa(id: number): Promise<Despesa> {
        const response = await api.get<Despesa>(`/despesas/${id}`);
        return response.data;
    },

    /**
     * Cria nova despesa
     */
    async createDespesa(data: DespesaDTO): Promise<Despesa> {
        const response = await api.post<Despesa>('/despesas', data);
        return response.data;
    },

    /**
     * Atualiza despesa existente
     */
    async updateDespesa(id: number, data: DespesaDTO): Promise<Despesa> {
        const response = await api.put<Despesa>(`/despesas/${id}`, data);
        return response.data;
    },

    /**
     * Remove despesa
     */
    async deleteDespesa(id: number): Promise<void> {
        await api.delete(`/despesas/${id}`);
    },

    // ==================== FILTROS ESPECÍFICOS ====================

    /**
     * Busca despesas por período
     */
    async getDespesasPorPeriodo(
        inicio: string,
        fim: string,
        pageable?: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' }
    ): Promise<PagedDespesaResponse> {
        const { page = 0, size = 20, sort = 'data', direction = 'DESC' } = pageable || {};

        const queryParams = new URLSearchParams({
            inicio,
            fim,
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        const response = await api.get<PagedDespesaResponse>(`/despesas/periodo?${queryParams}`);
        return response.data;
    },

    /**
     * Busca despesas por categoria
     */
    async getDespesasPorCategoria(
        categoriaId: number,
        pageable?: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' }
    ): Promise<PagedDespesaResponse> {
        const { page = 0, size = 20, sort = 'data', direction = 'DESC' } = pageable || {};

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        const response = await api.get<PagedDespesaResponse>(
            `/despesas/categoria/${categoriaId}?${queryParams}`
        );
        return response.data;
    },

    /**
     * Busca despesas por status
     */
    async getDespesasPorStatus(status: StatusPagamento): Promise<Despesa[]> {
        const response = await api.get<Despesa[]>(`/despesas/status/${status}`);
        return response.data;
    },

    /**
     * Busca despesas vencidas
     */
    async getDespesasVencidas(): Promise<Despesa[]> {
        const response = await api.get<Despesa[]>('/despesas/vencidas');
        return response.data;
    },

    /**
     * Busca despesas parceladas
     */
    async getDespesasParceladas(): Promise<Despesa[]> {
        const response = await api.get<Despesa[]>('/despesas/parceladas');
        return response.data;
    },

    /**
     * Busca despesas do mês
     */
    async getDespesasPorMes(ano: number, mes: number): Promise<Despesa[]> {
        const response = await api.get<Despesa[]>(`/despesas/mes/${ano}/${mes}`);
        return response.data;
    },

    /**
     * Busca despesas por receita
     */
    async getDespesasPorReceita(receitaId: number): Promise<Despesa[]> {
        const response = await api.get<Despesa[]>(`/despesas/receita/${receitaId}`);
        return response.data;
    },

    // ==================== AÇÕES DE STATUS ====================

    /**
     * Marca despesa como paga
     */
    async marcarComoPaga(id: number): Promise<Despesa> {
        const response = await api.patch<Despesa>(`/despesas/${id}/pagar`);
        return response.data;
    },

    /**
     * Marca despesa como pendente
     */
    async marcarComoPendente(id: number): Promise<Despesa> {
        const response = await api.patch<Despesa>(`/despesas/${id}/pendente`);
        return response.data;
    },

    // ==================== CÁLCULOS E ESTATÍSTICAS ====================

    /**
     * Calcula total de despesas por período
     */
    async calcularTotalPorPeriodo(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/despesas/total', {
            params: { inicio, fim }
        });
        return response.data;
    },

    /**
     * Calcula total pago por período
     */
    async calcularTotalPagoPorPeriodo(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/despesas/total/pagas', {
            params: { inicio, fim }
        });
        return response.data;
    },

    /**
     * Calcula total pendente por período
     */
    async calcularTotalPendentePorPeriodo(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/despesas/total/pendentes', {
            params: { inicio, fim }
        });
        return response.data;
    },

    /**
     * Agrupa despesas por categoria
     */
    async agruparPorCategoria(inicio: string, fim: string): Promise<Record<string, number>> {
        const response = await api.get<Record<string, number>>('/despesas/agrupar-categoria', {
            params: { inicio, fim }
        });
        return response.data;
    },

    /**
     * Conta despesas por status
     */
    async countByStatus(status: StatusPagamento): Promise<number> {
        const response = await api.get<number>(`/despesas/count/status/${status}`);
        return response.data;
    },

    /**
     * Calcula média mensal
     */
    async calcularMediaMensal(): Promise<number> {
        const response = await api.get<number>('/despesas/media-mensal');
        return response.data;
    },

    /**
     * Obtém resumo mensal completo
     */
    async getResumoMensal(ano: number, mes: number): Promise<DespesaResumoMensal> {
        const response = await api.get<DespesaResumoMensal>(`/despesas/resumo-mensal/${ano}/${mes}`);
        return response.data;
    }
};