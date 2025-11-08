package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum TipoMeta {
    ECONOMIA("Economia", "Meta de poupar dinheiro"),
    INVESTIMENTO("Investimento", "Meta de investimento financeiro"),
    COMPRA("Compra", "Meta para compra de bens");

    private final String nome;
    private final String descricao;

    TipoMeta(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}