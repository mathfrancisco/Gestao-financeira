package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.DespesaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.DespesaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Despesa;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DespesaMapper {

    /**
     * Converte DTO de request para entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "receita", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    Despesa toEntity(DespesaRequestDTO dto);

    /**
     * Converte entity para DTO de response
     * ATENÇÃO: Método renomeado de toDTO para toDto (padrão Java)
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "receitaId", source = "receita.id")
    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "categoriaNome", source = "categoria.nome")
    @Mapping(target = "statusParcela", expression = "java(entity.getStatusParcela())")
    @Mapping(target = "parcelado", expression = "java(entity.isParcelado())")
    @Mapping(target = "vencido", expression = "java(entity.isVencido())")
    DespesaResponseDTO toDto(Despesa entity);

    /**
     * Atualiza entity existente com dados do DTO
     * Usado no método update
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "receita", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void updateEntityFromDto(DespesaRequestDTO dto, @MappingTarget Despesa entity);
}
