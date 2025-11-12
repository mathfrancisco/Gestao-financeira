package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.ParametroRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ParametroResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Parametro;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ParametroMapper {

    /**
     * Converte DTO de request para entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Parametro toEntity(ParametroRequestDTO dto);

    /**
     * Converte entity para DTO de response
     * ATENÇÃO: Método renomeado de toDTO para toDto (padrão Java)
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    ParametroResponseDTO toDto(Parametro entity);

    /**
     * Atualiza entity existente com dados do DTO
     * Usado no método update (não atualiza chave pois é identificador)
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "chave", ignore = true)
    void updateEntityFromDto(ParametroRequestDTO dto, @MappingTarget Parametro entity);
}
