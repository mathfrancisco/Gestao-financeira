package com.financeiro.financeiro_pessoal_backend.exception;

/**
 * Exceção lançada quando há tentativa de criar um recurso duplicado
 * Exemplo: Email já cadastrado, CPF duplicado, etc.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
