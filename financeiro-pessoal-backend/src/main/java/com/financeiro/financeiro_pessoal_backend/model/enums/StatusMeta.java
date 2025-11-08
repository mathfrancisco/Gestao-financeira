package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum StatusMeta {
    EM_ANDAMENTO("Em Andamento", "Meta ativa e em progresso"),
    CONCLUIDA("Concluída", "Meta alcançada com sucesso"),
    CANCELADA("Cancelada", "Meta cancelada pelo usuário"),
    PAUSADA("Pausada", "Meta temporariamente suspensa");

    private final String nome;
    private final String descricao;

    StatusMeta(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}