package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
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
public class DespesaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;
    private Long receitaId;
    private Long categoriaId;
    private String categoriaNome;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate data;

    private String descricao;
    private BigDecimal valor;
    private StatusPagamento status;
    private Integer parcelaAtual;
    private Integer parcelaTotal;
    private String statusParcela;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fimPagamento;

    private String observacoes;
    private Boolean parcelado;
    private Boolean vencido;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}