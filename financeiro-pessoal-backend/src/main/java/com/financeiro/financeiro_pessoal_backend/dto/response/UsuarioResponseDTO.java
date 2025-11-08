package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long id;
    private String email;
    private String nome;
    private String fotoUrl;
    private TipoUsuario tipoUsuario;
    private Boolean ativo;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}