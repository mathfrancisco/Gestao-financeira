// src/types/auth.ts

export interface User {
    id: number;
    nome: string;
    email: string;
    fotoUrl?: string;
    tipoUsuario: 'USER' | 'ADMIN';
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    tipo: string;
    usuario: User;
    expiraEm: string;
}

export interface LoginDTO {
    email: string;
    senha: string;
}

export interface RegisterDTO {
    nome: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
}

export interface AlterarSenhaDTO {
    senhaAtual: string;
    novaSenha: string;
    confirmacaoSenha: string;
}

export interface AtualizarUsuarioDTO {
    nome?: string;
    fotoUrl?: string;
    tipoUsuario?: 'USER' | 'ADMIN';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (data: AuthResponse) => void;
    setUser: (user: User) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}