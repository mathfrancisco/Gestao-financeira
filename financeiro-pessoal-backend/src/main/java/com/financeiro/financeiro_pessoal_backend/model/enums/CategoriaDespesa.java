package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum CategoriaDespesa {
    ALIMENTACAO("Alimentação", "Supermercado, restaurantes, delivery"),
    MORADIA("Moradia", "Aluguel, condomínio, IPTU"),
    TRANSPORTE("Transporte", "Combustível, transporte público, manutenção"),
    SAUDE("Saúde", "Plano de saúde, medicamentos, consultas"),
    EDUCACAO("Educação", "Cursos, livros, mensalidades"),
    LAZER("Lazer", "Entretenimento, viagens, hobbies"),
    VESTUARIO("Vestuário", "Roupas, calçados, acessórios"),
    SERVICOS("Serviços", "Internet, telefone, streaming"),
    IMPOSTOS("Impostos", "IR, IPVA, taxas governamentais"),
    OUTROS("Outros", "Despesas diversas");

    private final String nome;
    private final String descricao;

    CategoriaDespesa(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}