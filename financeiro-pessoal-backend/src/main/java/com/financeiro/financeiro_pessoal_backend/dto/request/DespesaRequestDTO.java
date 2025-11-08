package com.financeiro.financeiro_pessoal_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DespesaRequestDTO {

    private Long receitaId;

    private Long categoriaId;

    @NotNull(message = "Data é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate data;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 3, max = 255, message = "Descrição deve ter entre 3 e 255 caracteres")
    private String descricao;

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    private BigDecimal valor;

    @Builder.Default
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @PositiveOrZero(message = "Parcela atual deve ser positiva ou zero")
    @Builder.Default
    private Integer parcelaAtual = 1;

    @Positive(message = "Parcela total deve ser positiva")
    @Builder.Default
    private Integer parcelaTotal = 1;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fimPagamento;

    private String observacoes;
}