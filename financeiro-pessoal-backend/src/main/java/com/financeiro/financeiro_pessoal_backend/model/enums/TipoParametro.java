package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum TipoParametro {
    STRING("String", "Texto simples"),
    NUMBER("Number", "Valor numérico"),
    BOOLEAN("Boolean", "Verdadeiro ou Falso"),
    JSON("JSON", "Objeto JSON");

    private final String nome;
    private final String descricao;

    TipoParametro(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}