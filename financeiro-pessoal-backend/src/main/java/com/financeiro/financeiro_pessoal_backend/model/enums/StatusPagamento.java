package com.financeiro.financeiro_pessoal_backend.model.enums;

import lombok.Getter;

@Getter
public enum StatusPagamento {
    PENDENTE("Pendente", "Pagamento ainda não realizado"),
    PAGO("Pago", "Pagamento confirmado"),
    VENCIDO("Vencido", "Pagamento em atraso");

    private final String nome;
    private final String descricao;

    StatusPagamento(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}