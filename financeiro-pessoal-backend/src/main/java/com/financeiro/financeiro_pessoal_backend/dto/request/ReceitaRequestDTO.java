package com.financeiro.financeiro_pessoal_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
public class ReceitaRequestDTO {

    @NotNull(message = "Período inicial é obrigatório")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodoInicio;

    @NotNull(message = "Período final é obrigatório")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodoFim;

    private Integer diasUteis;

    @PositiveOrZero(message = "Salário deve ser positivo ou zero")
    @Builder.Default
    private BigDecimal salario = BigDecimal.ZERO;

    @PositiveOrZero(message = "Auxílios devem ser positivos ou zero")
    @Builder.Default
    private BigDecimal auxilios = BigDecimal.ZERO;

    @PositiveOrZero(message = "Serviços extras devem ser positivos ou zero")
    @Builder.Default
    private BigDecimal servicosExtras = BigDecimal.ZERO;

    private String observacoes;
}