// Enums
// @ts-ignore
export enum StatusMeta {
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    CONCLUIDA = 'CONCLUIDA',
    CANCELADA = 'CANCELADA',
    PAUSADA = 'PAUSADA'
}
// @ts-ignore
export enum TipoMeta {
    ECONOMIA = 'ECONOMIA',
    INVESTIMENTO = 'INVESTIMENTO',
    COMPRA = 'COMPRA'
}
// @ts-ignore
export enum TipoTransacaoMeta {
    APORTE = 'APORTE',
    RESGATE = 'RESGATE'
}

// Interface TransacaoMeta (Aporte/Resgate)
export interface TransacaoMeta {
    id: number;
    metaId: number;
    tipo: TipoTransacaoMeta;
    valor: number;
    data: string; // ISO date
    descricao: string | null;
    createdAt: string;
    updatedAt: string;
}

// Interface principal Meta
export interface Meta {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    nome: string;
    descricao: string | null;
    tipo: TipoMeta;
    valorObjetivo: number;
    valorAtual: number;
    valorRestante: number;
    prazo: string | null; // ISO date
    status: StatusMeta;
    progresso: number; // 0-100
    observacoes: string | null;
    concluida: boolean;
    vencida: boolean;
    transacoes?: TransacaoMeta[];
    createdAt: string;
    updatedAt: string;
}

// DTO para criação/edição de Meta
export interface MetaDTO {
    nome: string;
    descricao?: string | null;
    tipo: TipoMeta;
    valorObjetivo: number;
    prazo?: string | null; // yyyy-MM-dd
    status?: StatusMeta;
    observacoes?: string | null;
}

// DTO para Aporte/Resgate
export interface AporteMetaDTO {
    valor: number;
    data?: string; // yyyy-MM-dd, opcional (padrão hoje)
    descricao?: string | null;
}

// Params para filtros
export interface MetaParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    status?: StatusMeta;
    tipo?: TipoMeta;
    inicio?: string; // yyyy-MM-dd (prazo)
    fim?: string; // yyyy-MM-dd (prazo)
}

// Response paginada
export interface PagedMetaResponse {
    content: Meta[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Resumo de Metas
export interface MetaResumo {
    totalMetas: number;
    emAndamento: number;
    concluidas: number;
    canceladas: number;
    pausadas: number;
    totalValorObjetivo: number;
    totalValorAtual: number;
    totalValorRestante: number;
    progressoGeral: number;
    metasVencidas: number;
    metasProximasVencimento: number;
}

// Helper types
export interface MetaStatusBadge {
    label: string;
    color: 'blue' | 'green' | 'red' | 'yellow';
    bgColor: string;
    textColor: string;
}

export interface MetaProgressConfig {
    percentage: number;
    color: string;
    label: string;
    barColor: string;
}