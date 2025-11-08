package com.financeiro.financeiro_pessoal_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "receitas", indexes = {
        @Index(name = "idx_receitas_usuario_periodo", columnList = "usuario_id, periodo_inicio, periodo_fim"),
        @Index(name = "idx_receitas_usuario", columnList = "usuario_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receita extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_receitas_usuario"))
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @NotNull(message = "Período inicial é obrigatório")
    @Column(name = "periodo_inicio", nullable = false)
    private LocalDate periodoInicio;

    @NotNull(message = "Período final é obrigatório")
    @Column(name = "periodo_fim", nullable = false)
    private LocalDate periodoFim;

    @Column(name = "dias_uteis")
    private Integer diasUteis;

    @PositiveOrZero(message = "Salário deve ser positivo ou zero")
    @Column(precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal salario = BigDecimal.ZERO;

    @PositiveOrZero(message = "Auxílios devem ser positivos ou zero")
    @Column(precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal auxilios = BigDecimal.ZERO;

    @PositiveOrZero(message = "Serviços extras devem ser positivos ou zero")
    @Column(name = "servicos_extras", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal servicosExtras = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // Relacionamentos
    @OneToMany(mappedBy = "receita", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Despesa> despesas = new ArrayList<>();

    // Métodos auxiliares
    @Transient
    public BigDecimal getTotalReceitas() {
        return salario.add(auxilios).add(servicosExtras);
    }

    @Transient
    public BigDecimal getTotalDespesas() {
        return despesas.stream()
                .map(Despesa::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getSaldo() {
        return getTotalReceitas().subtract(getTotalDespesas());
    }
}