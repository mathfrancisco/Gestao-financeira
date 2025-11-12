package com.financeiro.financeiro_pessoal_backend.dto.request;

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
    private LocalDate periodoInicio;

    @NotNull(message = "Período final é obrigatório")
    private LocalDate periodoFim;

    @PositiveOrZero(message = "Dias úteis deve ser positivo ou zero")
    private Integer diasUteis;

    @PositiveOrZero(message = "Salário deve ser positivo ou zero")
    private BigDecimal salario;

    @PositiveOrZero(message = "Auxílios devem ser positivos ou zero")
    private BigDecimal auxilios;

    @PositiveOrZero(message = "Serviços extras devem ser positivos ou zero")
    private BigDecimal servicosExtras;

    private String observacoes;
}