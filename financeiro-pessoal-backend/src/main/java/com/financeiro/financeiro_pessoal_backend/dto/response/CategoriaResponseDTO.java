package com.financeiro.financeiro_pessoal_backend.dto.response;

import com.financeiro.financeiro_pessoal_backend.model.enums.TipoCategoria;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;

    private String nome;
    private TipoCategoria tipo;
    private String tipoDescricao;
    private Boolean ativa;

    private Boolean isReceita;
    private Boolean isDespesa;

    // Total de despesas (quando necessário)
    private Long totalDespesas;

    // Lista de despesas (opcional, para evitar N+1)
    private List<DespesaResumoDTO> despesas;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

}