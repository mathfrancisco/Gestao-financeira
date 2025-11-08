package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceitaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodoInicio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate periodoFim;

    private Integer diasUteis;
    private BigDecimal salario;
    private BigDecimal auxilios;
    private BigDecimal servicosExtras;
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldo;
    private String observacoes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}