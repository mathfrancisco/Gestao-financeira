package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum TipoCategoria {
    RECEITA("Receita", "Categoria de entrada de dinheiro"),
    DESPESA("Despesa", "Categoria de saída de dinheiro");

    private final String nome;
    private final String descricao;

    TipoCategoria(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}