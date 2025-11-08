package com.financeiro.financeiro_pessoal_backend.dto.request;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParametroRequestDTO {

    @NotBlank(message = "Chave é obrigatória")
    @Size(min = 2, max = 100, message = "Chave deve ter entre 2 e 100 caracteres")
    private String chave;

    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String descricao;

    private String valor;

    @NotNull(message = "Tipo é obrigatório")
    @Builder.Default
    private TipoParametro tipo = TipoParametro.STRING;
}