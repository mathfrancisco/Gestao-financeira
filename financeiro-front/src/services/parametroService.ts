import api from './api';
import type {
    Parametro,
    ParametroDTO,
    TipoParametro,
    ParametroResumo,
    ParametrosMap
} from '../types/parametro';

export const parametroService = {
    // ==================== CRUD BÁSICO ====================

    /**
     * Lista todos os parâmetros do usuário
     */
    async getParametros(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros');
        return response.data;
    },

    /**
     * Busca parâmetro por ID
     */
    async getParametro(id: number): Promise<Parametro> {
        const response = await api.get<Parametro>(`/parametros/${id}`);
        return response.data;
    },

    /**
     * Busca parâmetro por chave
     */
    async getParametroByChave(chave: string): Promise<Parametro> {
        const response = await api.get<Parametro>(`/parametros/chave/${chave}`);
        return response.data;
    },

    /**
     * Busca apenas o valor de um parâmetro
     */
    async getValorByChave(chave: string): Promise<string> {
        const response = await api.get<string>(`/parametros/chave/${chave}/valor`);
        return response.data;
    },

    /**
     * Busca valor como Integer
     */
    async getValorAsInteger(chave: string): Promise<number> {
        const response = await api.get<number>(`/parametros/chave/${chave}/valor-integer`);
        return response.data;
    },

    /**
     * Busca valor como Boolean
     */
    async getValorAsBoolean(chave: string): Promise<boolean> {
        const response = await api.get<boolean>(`/parametros/chave/${chave}/valor-boolean`);
        return response.data;
    },

    /**
     * Busca valor como Double
     */
    async getValorAsDouble(chave: string): Promise<number> {
        const response = await api.get<number>(`/parametros/chave/${chave}/valor-double`);
        return response.data;
    },

    /**
     * Cria novo parâmetro
     */
    async createParametro(data: ParametroDTO): Promise<Parametro> {
        const response = await api.post<Parametro>('/parametros', data);
        return response.data;
    },

    /**
     * Atualiza parâmetro completo
     */
    async updateParametro(id: number, data: ParametroDTO): Promise<Parametro> {
        const response = await api.put<Parametro>(`/parametros/${id}`, data);
        return response.data;
    },

    /**
     * Atualiza apenas o valor do parâmetro
     */
    async updateValor(chave: string, valor: string): Promise<Parametro> {
        const response = await api.patch<Parametro>(
            `/parametros/chave/${chave}`,
            null,
            { params: { valor } }
        );
        return response.data;
    },

    /**
     * Remove parâmetro por ID
     */
    async deleteParametro(id: number): Promise<void> {
        await api.delete(`/parametros/${id}`);
    },

    /**
     * Remove parâmetro por chave
     */
    async deleteByChave(chave: string): Promise<void> {
        await api.delete(`/parametros/chave/${chave}`);
    },

    // ==================== FILTROS E BUSCAS ====================

    /**
     * Busca parâmetros por tipo
     */
    async getParametrosByTipo(tipo: TipoParametro): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>(`/parametros/tipo/${tipo}`);
        return response.data;
    },

    /**
     * Busca parâmetros do tipo STRING
     */
    async getStringParametros(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/tipo/string');
        return response.data;
    },

    /**
     * Busca parâmetros do tipo NUMBER
     */
    async getNumberParametros(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/tipo/number');
        return response.data;
    },

    /**
     * Busca parâmetros do tipo BOOLEAN
     */
    async getBooleanParametros(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/tipo/boolean');
        return response.data;
    },

    /**
     * Busca parâmetros com descrição
     */
    async getWithDescricao(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/com-descricao');
        return response.data;
    },

    /**
     * Busca parâmetros por chave (busca parcial)
     */
    async searchByChave(chave: string): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/search', {
            params: { chave }
        });
        return response.data;
    },

    /**
     * Busca parâmetros atualizados recentemente
     */
    async getRecentlyUpdated(): Promise<Parametro[]> {
        const response = await api.get<Parametro[]>('/parametros/recentes');
        return response.data;
    },

    // ==================== UTILITÁRIOS ====================

    /**
     * Conta total de parâmetros
     */
    async count(): Promise<number> {
        const response = await api.get<number>('/parametros/count');
        return response.data;
    },

    /**
     * Conta parâmetros por tipo
     */
    async countByTipo(tipo: TipoParametro): Promise<number> {
        const response = await api.get<number>(`/parametros/count/tipo/${tipo}`);
        return response.data;
    },

    /**
     * Agrupa parâmetros por tipo
     */
    async agruparPorTipo(): Promise<Record<string, number>> {
        const response = await api.get<Record<string, number>>('/parametros/agrupar-tipo');
        return response.data;
    },

    /**
     * Verifica se parâmetro existe
     */
    async exists(chave: string): Promise<boolean> {
        const response = await api.get<boolean>(`/parametros/exists/${chave}`);
        return response.data;
    },

    /**
     * Retorna todos os parâmetros como Map (chave -> valor)
     */
    async getAllAsMap(): Promise<ParametrosMap> {
        const response = await api.get<ParametrosMap>('/parametros/map');
        return response.data;
    },

    /**
     * Obtém resumo dos parâmetros
     */
    async getResumo(): Promise<ParametroResumo> {
        const response = await api.get<ParametroResumo>('/parametros/resumo');
        return response.data;
    }
};