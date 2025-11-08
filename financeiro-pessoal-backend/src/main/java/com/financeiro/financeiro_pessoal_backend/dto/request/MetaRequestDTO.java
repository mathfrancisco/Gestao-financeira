package com.financeiro.financeiro_pessoal_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.financeiro.financeiro_pessoal_backend.model.enums.StatusMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoMeta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class MetaRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    private String descricao;

    @NotNull(message = "Tipo é obrigatório")
    private TipoMeta tipo;

    @NotNull(message = "Valor objetivo é obrigatório")
    @Positive(message = "Valor objetivo deve ser positivo")
    private BigDecimal valorObjetivo;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate prazo;

    @Builder.Default
    private StatusMeta status = StatusMeta.EM_ANDAMENTO;

    private String observacoes;
}