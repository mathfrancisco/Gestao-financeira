package com.financeiro.financeiro_pessoal_backend.util;

import com.financeiro.financeiro_pessoal_backend.exception.UnauthorizedException;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilitário para operações relacionadas à segurança e autenticação
 */
@Component
@Slf4j
public class SecurityUtil {

    /**
     * Retorna o usuário atualmente autenticado
     */
    public Usuario getUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Usuario) {
            return (Usuario) principal;
        }

        throw new UnauthorizedException("Contexto de segurança inválido");
    }

    /**
     * Retorna o ID do usuário autenticado
     */
    public Long getUsuarioLogadoId() {
        return getUsuarioLogado().getId();
    }

    /**
     * Retorna o ID do usuário para uso em SpEL (cache keys)
     * Método auxiliar que evita exceção quando não há usuário autenticado
     */
    public Long getUsuarioIdForCache() {
        try {
            return getUsuarioLogadoId();
        } catch (Exception e) {
            return 0L; // Retorna 0 se não autenticado (não deve acontecer em métodos autenticados)
        }
    }

    /**
     * Retorna o email do usuário autenticado
     */
    public String getEmailUsuarioLogado() {
        return getUsuarioLogado().getEmail();
    }

    /**
     * Retorna o nome do usuário autenticado
     */
    public String getNomeUsuarioLogado() {
        return getUsuarioLogado().getNome();
    }

    /**
     * Verifica se o usuário autenticado é administrador
     */
    public boolean isAdmin() {
        try {
            Usuario usuario = getUsuarioLogado();
            return usuario.getTipoUsuario() == TipoUsuario.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifica se o usuário autenticado é do tipo USER
     */
    public boolean isUser() {
        try {
            Usuario usuario = getUsuarioLogado();
            return usuario.getTipoUsuario() == TipoUsuario.USER;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifica se o ID fornecido pertence ao usuário logado
     */
    public boolean isProprioUsuario(Long usuarioId) {
        try {
            return getUsuarioLogadoId().equals(usuarioId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifica se o usuário tem permissão para acessar o recurso
     * (próprio usuário ou admin)
     */
    public boolean temPermissaoParaUsuario(Long usuarioId) {
        return isProprioUsuario(usuarioId) || isAdmin();
    }

    /**
     * Verifica se há um usuário autenticado
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * Lança exceção se o usuário não tiver permissão para o recurso
     */
    public void validarPermissaoUsuario(Long usuarioId) {
        if (!temPermissaoParaUsuario(usuarioId)) {
            log.warn("Usuário {} tentou acessar recurso do usuário {}",
                    getUsuarioLogadoId(), usuarioId);
            throw new UnauthorizedException("Você não tem permissão para acessar este recurso");
        }
    }

    /**
     * Lança exceção se o usuário não for administrador
     */
    public void validarAdmin() {
        if (!isAdmin()) {
            log.warn("Usuário não-admin {} tentou acessar recurso restrito",
                    getUsuarioLogadoId());
            throw new UnauthorizedException("Acesso negado. Apenas administradores podem realizar esta operação");
        }
    }
}