package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoCategoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String nome;
    private TipoCategoria tipo;
    private Boolean ativa;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}