// @ts-ignore
export enum StatusPagamento {
    PENDENTE = 'PENDENTE',
    PAGO = 'PAGO',
    VENCIDO = 'VENCIDO'
}

// Interface principal
export interface Despesa {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    receitaId: number | null;
    categoriaId: number | null;
    categoriaNome?: string;
    data: string; // ISO date
    descricao: string;
    valor: number;
    status: StatusPagamento;
    parcelaAtual: number;
    parcelaTotal: number;
    statusParcela: string;
    fimPagamento: string | null; // ISO date
    observacoes: string | null;
    parcelado: boolean;
    vencido: boolean;
    createdAt: string;
    updatedAt: string;
}

// DTO para criação/edição
export interface DespesaDTO {
    receitaId?: number | null;
    categoriaId?: number | null;
    data: string; // yyyy-MM-dd
    descricao: string;
    valor: number;
    status?: StatusPagamento;
    parcelaAtual?: number;
    parcelaTotal?: number;
    fimPagamento?: string | null; // yyyy-MM-dd
    observacoes?: string | null;
}

// Params para filtros
export interface DespesaParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    inicio?: string; // yyyy-MM-dd
    fim?: string; // yyyy-MM-dd
    categoriaId?: number;
    status?: StatusPagamento;
    receitaId?: number;
}

// Response paginada
export interface PagedDespesaResponse {
    content: Despesa[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Resumo mensal
export interface DespesaResumoMensal {
    totalDespesas: number;
    totalPago: number;
    totalPendente: number;
    totalVencido: number;
    countTotal: number;
    countPagas: number;
    countPendentes: number;
    countVencidas: number;
    mediaMensal: number;
    porCategoria: Record<string, number>;
}

// Helper types
export interface DespesaStatusBadge {
    label: string;
    color: 'green' | 'yellow' | 'red';
    bgColor: string;
    textColor: string;
}