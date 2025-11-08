package com.financeiro.financeiro_pessoal_backend.model;

import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "despesas", indexes = {
        @Index(name = "idx_despesas_usuario_data", columnList = "usuario_id, data"),
        @Index(name = "idx_despesas_categoria", columnList = "categoria_id"),
        @Index(name = "idx_despesas_status", columnList = "status"),
        @Index(name = "idx_despesas_receita", columnList = "receita_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Despesa extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_despesas_usuario"))
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_id", foreignKey = @ForeignKey(name = "fk_despesas_receita"))
    private Receita receita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", foreignKey = @ForeignKey(name = "fk_despesas_categoria"))
    private Categoria categoria;

    @NotNull(message = "Data é obrigatória")
    @Column(nullable = false)
    private LocalDate data;

    @NotBlank(message = "Descrição é obrigatória")
    @Column(nullable = false)
    private String descricao;

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @PositiveOrZero(message = "Parcela atual deve ser positiva")
    @Column(name = "parcela_atual")
    @Builder.Default
    private Integer parcelaAtual = 1;

    @Positive(message = "Parcela total deve ser positiva")
    @Column(name = "parcela_total")
    @Builder.Default
    private Integer parcelaTotal = 1;

    @Column(name = "fim_pagamento")
    private LocalDate fimPagamento;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // Métodos auxiliares
    @Transient
    public boolean isParcelado() {
        return parcelaTotal != null && parcelaTotal > 1;
    }

    @Transient
    public boolean isVencido() {
        return status == StatusPagamento.PENDENTE &&
                data.isBefore(LocalDate.now());
    }

    @Transient
    public String getStatusParcela() {
        if (!isParcelado()) {
            return "À vista";
        }
        return String.format("%d/%d", parcelaAtual, parcelaTotal);
    }

    @PrePersist
    @PreUpdate
    private void validarParcelas() {
        if (parcelaAtual > parcelaTotal) {
            throw new IllegalStateException("Parcela atual não pode ser maior que o total");
        }
    }
}