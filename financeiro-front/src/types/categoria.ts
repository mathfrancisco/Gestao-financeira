// @ts-ignore
export enum TipoCategoria {
    RECEITA = 'RECEITA',
    DESPESA = 'DESPESA',
}

export interface DespesaResumo {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    status: string;
}

export interface Categoria {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    nome: string;
    tipo: TipoCategoria;
    tipoDescricao: string;
    ativa: boolean;
    isReceita: boolean;
    isDespesa: boolean;
    totalDespesas?: number;
    despesas?: DespesaResumo[];
    createdAt: string;
    updatedAt: string;
}

export interface CategoriaRequestDTO {
    nome: string;
    tipo: TipoCategoria;
    ativa?: boolean;
}

export interface CategoriaResumo {
    total: number;
    ativas: number;
    inativas: number;
    porTipo: {
        RECEITA: number;
        DESPESA: number;
    };
}

export interface CategoriaFilters {
    tipo?: TipoCategoria;
    ativa?: boolean;
    search?: string;
}