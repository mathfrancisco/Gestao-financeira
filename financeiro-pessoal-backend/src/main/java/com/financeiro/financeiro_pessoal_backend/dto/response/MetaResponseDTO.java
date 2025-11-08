package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
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
public class MetaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;
    private String nome;
    private String descricao;
    private TipoMeta tipo;
    private BigDecimal valorObjetivo;
    private BigDecimal valorAtual;
    private BigDecimal valorRestante;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate prazo;

    private StatusMeta status;
    private BigDecimal progresso;
    private String observacoes;
    private Boolean concluida;
    private Boolean vencida;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}