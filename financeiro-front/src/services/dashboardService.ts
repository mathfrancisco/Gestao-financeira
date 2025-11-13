import api from './api';
import type {
    DashboardResponse,
    EvolucaoMensal,
    TopCategoria,
    Indicadores,
    SaldoResponse,
    ComparativoResponse,
} from '../types/dashboard';

export const dashboardService = {
    /**
     * Busca dados gerais do dashboard
     * @param mes - Mês (opcional, padrão: mês atual)
     * @param ano - Ano (opcional, padrão: ano atual)
     */
    async getDashboard(mes?: number, ano?: number): Promise<DashboardResponse> {
        const params: Record<string, number> = {};
        if (mes) params.mes = mes;
        if (ano) params.ano = ano;

        const response = await api.get<DashboardResponse>('/dashboard', { params });
        return response.data;
    },

    /**
     * Busca total de receitas do período
     * @param inicio - Data inicial (formato: yyyy-MM-dd)
     * @param fim - Data final (formato: yyyy-MM-dd)
     */
    async getTotalReceitas(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/dashboard/receitas-totais', {
            params: { inicio, fim },
        });
        return response.data;
    },

    /**
     * Busca total de despesas do período
     * @param inicio - Data inicial (formato: yyyy-MM-dd)
     * @param fim - Data final (formato: yyyy-MM-dd)
     */
    async getTotalDespesas(inicio: string, fim: string): Promise<number> {
        const response = await api.get<number>('/dashboard/despesas-totais', {
            params: { inicio, fim },
        });
        return response.data;
    },

    /**
     * Busca saldo atual do mês corrente
     */
    async getSaldo(): Promise<SaldoResponse> {
        const response = await api.get<SaldoResponse>('/dashboard/saldo');
        return response.data;
    },

    /**
     * Compara dois períodos (meses)
     * @param mes1 - Mês do primeiro período
     * @param ano1 - Ano do primeiro período
     * @param mes2 - Mês do segundo período
     * @param ano2 - Ano do segundo período
     */
    async compararPeriodos(
        mes1: number,
        ano1: number,
        mes2: number,
        ano2: number
    ): Promise<ComparativoResponse> {
        const response = await api.get<ComparativoResponse>('/dashboard/comparativo', {
            params: { mes1, ano1, mes2, ano2 },
        });
        return response.data;
    },

    /**
     * Busca evolução dos últimos N meses
     * @param meses - Número de meses (padrão: 6)
     */
    async getEvolucao(meses: number = 6): Promise<EvolucaoMensal[]> {
        const response = await api.get<EvolucaoMensal[]>('/dashboard/evolucao', {
            params: { meses },
        });
        return response.data;
    },

    /**
     * Busca top N categorias mais gastas
     * @param limite - Número de categorias (padrão: 5)
     * @param mes - Mês (opcional)
     * @param ano - Ano (opcional)
     */
    async getTopCategorias(
        limite: number = 5,
        mes?: number,
        ano?: number
    ): Promise<TopCategoria[]> {
        const params: Record<string, number> = { limite };
        if (mes) params.mes = mes;
        if (ano) params.ano = ano;

        const response = await api.get<TopCategoria[]>('/dashboard/categorias-top', {
            params,
        });
        return response.data;
    },

    /**
     * Busca indicadores financeiros
     */
    async getIndicadores(): Promise<Indicadores> {
        const response = await api.get<Indicadores>('/dashboard/indicadores');
        return response.data;
    },
};