package com.financeiro.financeiro_pessoal_backend.dto.request;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarUsuarioRequestDTO {

    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @Size(max = 500, message = "URL da foto deve ter no máximo 500 caracteres")
    private String fotoUrl;

    private TipoUsuario tipoUsuario;
}