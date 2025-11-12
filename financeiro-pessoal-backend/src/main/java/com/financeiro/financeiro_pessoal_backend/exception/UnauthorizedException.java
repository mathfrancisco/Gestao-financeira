package com.financeiro.financeiro_pessoal_backend.exception;

/**
 * Exceção lançada quando há falha na autenticação
 * Exemplo: Credenciais inválidas, token expirado, usuário inativo
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
