package com.financeiro.financeiro_pessoal_backend.model;


import com.financeiro.financeiro_pessoal_backend.model.enums.TipoTransacao;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes_meta", indexes = {
        @Index(name = "idx_transacoes_meta", columnList = "meta_id, data")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransacaoMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meta_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transacoes_meta"))
    @NotNull(message = "Meta é obrigatória")
    private Meta meta;

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime data = LocalDateTime.now();

    @Column(length = 255)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private TipoTransacao tipo = TipoTransacao.APORTE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (data == null) {
            data = LocalDateTime.now();
        }
    }

    // Métodos auxiliares
    @Transient
    public boolean isAporte() {
        return tipo == TipoTransacao.APORTE;
    }

    @Transient
    public boolean isResgate() {
        return tipo == TipoTransacao.RESGATE;
    }

    @Transient
    public BigDecimal getValorComSinal() {
        return isAporte() ? valor : valor.negate();
    }
}