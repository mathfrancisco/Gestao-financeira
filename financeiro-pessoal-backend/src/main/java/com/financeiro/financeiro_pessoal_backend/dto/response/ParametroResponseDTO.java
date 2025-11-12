package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParametroResponseDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;

    private String chave;
    private String descricao;
    private String valor;

    private TipoParametro tipo;
    private String tipoDescricao;

    // Valores tipados (para facilitar uso no frontend)
    private String valorString;
    private Integer valorNumerico;
    private Boolean valorBooleano;
    private Double valorDecimal;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}