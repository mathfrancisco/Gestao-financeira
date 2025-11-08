package com.financeiro.financeiro_pessoal_backend.model;


import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "metas", indexes = {
        @Index(name = "idx_metas_usuario_status", columnList = "usuario_id, status"),
        @Index(name = "idx_metas_usuario", columnList = "usuario_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meta extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_metas_usuario"))
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private TipoMeta tipo = TipoMeta.ECONOMIA;

    @NotNull(message = "Valor objetivo é obrigatório")
    @Positive(message = "Valor objetivo deve ser positivo")
    @Column(name = "valor_objetivo", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorObjetivo;

    @PositiveOrZero(message = "Valor atual deve ser positivo ou zero")
    @Column(name = "valor_atual", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal valorAtual = BigDecimal.ZERO;

    @Column
    private LocalDate prazo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private StatusMeta status = StatusMeta.EM_ANDAMENTO;

    @Column(precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal progresso = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // Relacionamentos
    @OneToMany(mappedBy = "meta", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("data DESC")
    @Builder.Default
    private List<TransacaoMeta> transacoes = new ArrayList<>();

    // Métodos auxiliares
    @Transient
    public BigDecimal getValorRestante() {
        return valorObjetivo.subtract(valorAtual);
    }

    @Transient
    public boolean isConcluida() {
        return valorAtual.compareTo(valorObjetivo) >= 0;
    }

    @Transient
    public boolean isVencida() {
        return prazo != null &&
                prazo.isBefore(LocalDate.now()) &&
                status == StatusMeta.EM_ANDAMENTO &&
                !isConcluida();
    }

    public void calcularProgresso() {
        if (valorObjetivo.compareTo(BigDecimal.ZERO) == 0) {
            this.progresso = BigDecimal.ZERO;
            return;
        }

        BigDecimal percentual = valorAtual
                .multiply(BigDecimal.valueOf(100))
                .divide(valorObjetivo, 2, RoundingMode.HALF_UP);

        this.progresso = percentual.min(BigDecimal.valueOf(100));
    }

    public void atualizarStatus() {
        if (isConcluida() && status != StatusMeta.CANCELADA) {
            this.status = StatusMeta.CONCLUIDA;
        } else if (isVencida()) {
            // Mantém em andamento se vencida, mas não força mudança
            // Apenas para verificação
        }
    }

    @PrePersist
    @PreUpdate
    private void calcularAntesDeAtualizarMetaDados() {
        calcularProgresso();
        atualizarStatus();
    }
}