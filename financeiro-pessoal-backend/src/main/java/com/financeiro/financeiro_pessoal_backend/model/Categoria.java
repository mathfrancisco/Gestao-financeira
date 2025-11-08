package com.financeiro.financeiro_pessoal_backend.model;

import com.financeiro.model.enums.TipoCategoria;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorias",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_categoria_usuario_nome", columnNames = {"usuario_id", "nome"})
        },
        indexes = {
                @Index(name = "idx_categorias_usuario_tipo", columnList = "usuario_id, tipo, ativa"),
                @Index(name = "idx_categorias_usuario", columnList = "usuario_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_categorias_usuario"))
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @NotNull(message = "Tipo é obrigatório")
    private TipoCategoria tipo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativa = true;

    // Relacionamentos
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Despesa> despesas = new ArrayList<>();

    // Métodos auxiliares
    @Transient
    public boolean isReceita() {
        return tipo == TipoCategoria.RECEITA;
    }

    @Transient
    public boolean isDespesa() {
        return tipo == TipoCategoria.DESPESA;
    }

    public void desativar() {
        this.ativa = false;
    }

    public void ativar() {
        this.ativa = true;
    }
}