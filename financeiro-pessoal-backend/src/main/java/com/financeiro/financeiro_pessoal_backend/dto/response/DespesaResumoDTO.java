package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class DespesaResumoDTO {
    private Long id;
    private String descricao;
    private BigDecimal valor;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate data;

    private String status;
    private String categoriaNome;
}
