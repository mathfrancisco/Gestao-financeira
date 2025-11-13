// src/types/receita.ts

export interface Receita {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    periodoInicio: string; // formato: "yyyy-MM-dd"
    periodoFim: string; // formato: "yyyy-MM-dd"
    diasUteis: number | null;
    salario: number;
    auxilios: number;
    servicosExtras: number;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    observacoes: string | null;
    despesas?: any[]; // opcional
    createdAt: string;
    updatedAt: string;
}

export interface ReceitaDTO {
    periodoInicio: string;
    periodoFim: string;
    diasUteis: number | null;
    salario: number;
    auxilios: number;
    servicosExtras: number;
    observacoes?: string;
}

export interface ReceitaParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
    inicio?: string;
    fim?: string;
    ano?: number;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
