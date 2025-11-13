// Enums
// @ts-ignore
export enum TipoParametro {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    JSON = 'JSON'
}

// Interface principal
export interface Parametro {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    chave: string;
    descricao: string | null;
    valor: string;
    tipo: TipoParametro;
    tipoDescricao: string;
    // Valores tipados
    valorString: string;
    valorNumerico: number | null;
    valorBooleano: boolean | null;
    valorDecimal: number | null;
    createdAt: string;
    updatedAt: string;
}

// DTO para criação/edição
export interface ParametroDTO {
    chave: string;
    descricao?: string | null;
    valor: string;
    tipo: TipoParametro;
}

// Interface para resumo
export interface ParametroResumo {
    total: number;
    porTipo: Record<string, number>;
    recentementeAtualizados: number;
}

// Helper types
export interface ParametroTipoBadge {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
}

// Map de parâmetros (útil para configurações)
export type ParametrosMap = Record<string, string>;