package com.financeiro.financeiro_pessoal_backend.exception;

/**
 * Exceção lançada quando há erro de validação de dados
 * Exemplo: Email inválido, senha fraca, campos obrigatórios ausentes
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
