import api from './api';
import type {
    Meta,
    MetaDTO,
    MetaParams,
    PagedMetaResponse,
    AporteMetaDTO,
    TransacaoMeta,
    StatusMeta,
    TipoMeta,
    MetaResumo
} from '../types/meta';

export const metaService = {
    // ==================== CRUD BÁSICO ====================

    /**
     * Lista metas com paginação e filtros
     */
    async getMetas(params: MetaParams = {}): Promise<PagedMetaResponse> {
        const {
            page = 0,
            size = 20,
            sort = 'createdAt',
            direction = 'DESC',
            status,
            tipo,
            inicio,
            fim
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        if (status) {
            const response = await api.get<PagedMetaResponse>(`/metas/status/${status}`, {
                params: { page, size, sort: `${sort},${direction}` }
            });
            return response.data;
        }

        if (tipo) {
            const response = await api.get<Meta[]>(`/metas/tipo/${tipo}`);
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

        if (inicio && fim) {
            const response = await api.get<Meta[]>('/metas/prazo', {
                params: { inicio, fim }
            });
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

        const response = await api.get<PagedMetaResponse>(`/metas?${queryParams}`);
        return response.data;
    },

    /**
     * Busca meta por ID
     */
    async getMeta(id: number): Promise<Meta> {
        const response = await api.get<Meta>(`/metas/${id}`);
        return response.data;
    },

    /**
     * Busca meta por ID com transações
     */
    async getMetaWithTransacoes(id: number): Promise<Meta> {
        const response = await api.get<Meta>(`/metas/${id}/transacoes`);
        return response.data;
    },

    /**
     * Cria nova meta
     */
    async createMeta(data: MetaDTO): Promise<Meta> {
        const response = await api.post<Meta>('/metas', data);
        return response.data;
    },

    /**
     * Atualiza meta existente
     */
    async updateMeta(id: number, data: MetaDTO): Promise<Meta> {
        const response = await api.put<Meta>(`/metas/${id}`, data);
        return response.data;
    },

    /**
     * Remove meta
     */
    async deleteMeta(id: number): Promise<void> {
        await api.delete(`/metas/${id}`);
    },

    // ==================== TRANSAÇÕES (APORTES/RESGATES) ====================

    /**
     * Adiciona aporte à meta
     */
    async adicionarAporte(metaId: number, data: AporteMetaDTO): Promise<Meta> {
        const response = await api.post<Meta>(`/metas/${metaId}/aportes`, data);
        return response.data;
    },

    /**
     * Adiciona resgate à meta
     */
    async adicionarResgate(metaId: number, data: AporteMetaDTO): Promise<Meta> {
        const response = await api.post<Meta>(`/metas/${metaId}/resgates`, data);
        return response.data;
    },

    /**
     * Lista transações de uma meta
     */
    async getTransacoes(
        metaId: number,
        pageable?: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' }
    ): Promise<{ content: TransacaoMeta[]; totalElements: number; totalPages: number }> {
        const { page = 0, size = 20, sort = 'data', direction = 'DESC' } = pageable || {};

        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: `${sort},${direction}`,
        });

        const response = await api.get(`/metas/${metaId}/transacoes/lista?${queryParams}`);
        return response.data;
    },

    // ==================== FILTROS ESPECÍFICOS ====================

    /**
     * Busca metas por status
     */
    async getMetasPorStatus(
        status: StatusMeta,
        pageable?: { page?: number; size?: number }
    ): Promise<PagedMetaResponse> {
        const { page = 0, size = 20 } = pageable || {};

        const response = await api.get<PagedMetaResponse>(`/metas/status/${status}`, {
            params: { page, size, sort: 'createdAt,DESC' }
        });
        return response.data;
    },

    /**
     * Busca metas em andamento
     */
    async getMetasEmAndamento(): Promise<Meta[]> {
        const response = await api.get<Meta[]>('/metas/em-andamento');
        return response.data;
    },

    /**
     * Busca metas concluídas
     */
    async getMetasConcluidas(): Promise<Meta[]> {
        const response = await api.get<Meta[]>('/metas/concluidas');
        return response.data;
    },

    /**
     * Busca metas por tipo
     */
    async getMetasPorTipo(tipo: TipoMeta): Promise<Meta[]> {
        const response = await api.get<Meta[]>(`/metas/tipo/${tipo}`);
        return response.data;
    },

    /**
     * Busca metas vencidas
     */
    async getMetasVencidas(): Promise<Meta[]> {
        const response = await api.get<Meta[]>('/metas/vencidas');
        return response.data;
    },

    /**
     * Busca metas próximas do vencimento (30 dias)
     */
    async getMetasProximasVencimento(): Promise<Meta[]> {
        const response = await api.get<Meta[]>('/metas/proximas-vencimento');
        return response.data;
    },

    /**
     * Busca metas por período de prazo
     */
    async getMetasPorPrazo(inicio: string, fim: string): Promise<Meta[]> {
        const response = await api.get<Meta[]>('/metas/prazo', {
            params: { inicio, fim }
        });
        return response.data;
    },

    // ==================== AÇÕES DE STATUS ====================

    /**
     * Cancela meta
     */
    async cancelarMeta(id: number): Promise<Meta> {
        const response = await api.patch<Meta>(`/metas/${id}/cancelar`);
        return response.data;
    },

    /**
     * Pausa meta
     */
    async pausarMeta(id: number): Promise<Meta> {
        const response = await api.patch<Meta>(`/metas/${id}/pausar`);
        return response.data;
    },

    /**
     * Retoma meta pausada
     */
    async retomarMeta(id: number): Promise<Meta> {
        const response = await api.patch<Meta>(`/metas/${id}/retomar`);
        return response.data;
    },

    // ==================== ESTATÍSTICAS E RESUMO ====================

    /**
     * Obtém resumo geral das metas
     */
    async getResumo(): Promise<MetaResumo> {
        const response = await api.get<MetaResumo>('/metas/resumo');
        return response.data;
    }
};