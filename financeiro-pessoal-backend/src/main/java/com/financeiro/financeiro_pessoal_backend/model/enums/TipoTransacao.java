package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum TipoTransacao {
    APORTE("Aporte", "Adição de valor à meta"),
    RESGATE("Resgate", "Retirada de valor da meta");

    private final String nome;
    private final String descricao;

    TipoTransacao(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}