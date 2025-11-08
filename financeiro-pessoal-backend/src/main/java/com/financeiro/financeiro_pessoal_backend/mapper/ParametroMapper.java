package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.ParametroRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ParametroResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Parametro;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ParametroMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Parametro toEntity(ParametroRequestDTO dto);

    @Mapping(target = "usuarioId", source = "usuario.id")
    ParametroResponseDTO toDTO(Parametro entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "chave", ignore = true)
    void updateEntityFromDTO(ParametroRequestDTO dto, @MappingTarget Parametro entity);
}