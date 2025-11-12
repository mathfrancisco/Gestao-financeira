package com.financeiro.financeiro_pessoal_backend.exception;

/**
 * Exceção lançada quando um recurso solicitado não é encontrado no sistema
 * Exemplo: Usuário não encontrado, Categoria inexistente, Transação não localizada
 *
 * Geralmente mapeada para HTTP 404 Not Found
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Construtor conveniente para recurso não encontrado por ID
     */
    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s com ID %d não encontrado", resourceName, id));
    }

    /**
     * Construtor conveniente para recurso não encontrado por campo específico
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s com %s '%s' não encontrado", resourceName, fieldName, fieldValue));
    }
}
