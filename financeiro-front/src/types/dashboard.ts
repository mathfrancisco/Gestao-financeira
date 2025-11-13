// src/types/dashboard.ts

export interface CategoriaResumo {
    nome: string;
    valor: number;
    percentual: number;
}

export interface DashboardResponse {
    // Período
    mes: number;
    ano: number;
    periodo: string;

    // Receitas
    totalReceitas: number;
    mediaReceitasMensal: number;

    // Despesas
    totalDespesas: number;
    totalDespesasPagas: number;
    totalDespesasPendentes: number;
    mediaDespesasMensal: number;
    countDespesasPagas: number;
    countDespesasPendentes: number;

    // Saldos
    saldo: number;
    saldoDisponivel: number;

    // Percentuais
    percentualGasto: number;
    percentualEconomizado: number;
    taxaPagamento: number;

    // Despesas por categoria
    despesasPorCategoria: Record<string, number>;
    topCategorias: CategoriaResumo[];

    // Metas
    valorObjetivoMetas: number;
    valorAtualMetas: number;
    valorRestanteMetas: number;
    totalEconomizado: number;
    progressoMedioMetas: number;
    countMetasEmAndamento: number;
    countMetasConcluidas: number;
    countMetasVencidas: number;

    // Categorias
    totalCategorias: number;
    categoriasAtivas: number;
}

export interface EvolucaoMensal {
    mes: number;
    ano: number;
    periodo: string;
    receitas: number;
    despesas: number;
    saldo: number;
}

export interface TopCategoria {
    nome: string;
    valor: number;
    percentual: number;
    count: number;
}

export interface Indicadores {
    taxaPagamento: number;
    capacidadePoupanca: number;
    endividamento: number;
    saudeFinalceira: 'excelente' | 'boa' | 'regular' | 'ruim';
    recomendacoes: string[];
}

export interface SaldoResponse {
    receitas: number;
    despesas: number;
    saldo: number;
    despesasPagas: number;
    despesasPendentes: number;
}

export interface ComparativoResponse {
    periodo1: {
        mes: number;
        ano: number;
        receitas: number;
        despesas: number;
        saldo: number;
    };
    periodo2: {
        mes: number;
        ano: number;
        receitas: number;
        despesas: number;
        saldo: number;
    };
    diferencas: {
        receitas: number;
        receitasPercentual: number;
        despesas: number;
        despesasPercentual: number;
        saldo: number;
        saldoPercentual: number;
    };
}

export interface DashboardFilters {
    mes?: number;
    ano?: number;
}