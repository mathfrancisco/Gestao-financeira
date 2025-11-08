package com.financeiro.financeiro_pessoal_backend.model;


import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "parametros",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_parametro_usuario_chave", columnNames = {"usuario_id", "chave"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parametro extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_parametros_usuario"))
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @NotBlank(message = "Chave é obrigatória")
    @Size(min = 2, max = 100, message = "Chave deve ter entre 2 e 100 caracteres")
    @Column(nullable = false, length = 100)
    private String chave;

    @Column(length = 255)
    private String descricao;

    @Column(length = 500)
    private String valor;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private TipoParametro tipo = TipoParametro.STRING;

    // Métodos auxiliares
    @Transient
    public String getValorString() {
        return valor;
    }

    @Transient
    public Integer getValorNumerico() {
        if (tipo == TipoParametro.NUMBER && valor != null) {
            try {
                return Integer.parseInt(valor);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    @Transient
    public Boolean getValorBooleano() {
        if (tipo == TipoParametro.BOOLEAN && valor != null) {
            return Boolean.parseBoolean(valor);
        }
        return null;
    }

    @Transient
    public Double getValorDecimal() {
        if (tipo == TipoParametro.NUMBER && valor != null) {
            try {
                return Double.parseDouble(valor);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}