package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum TipoUsuario {
    USER("Usuário", "Usuário comum do sistema"),
    ADMIN("Administrador", "Usuário com privilégios administrativos");

    private final String nome;
    private final String descricao;

    TipoUsuario(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}