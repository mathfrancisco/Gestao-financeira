package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.CategoriaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.CategoriaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Categoria;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoriaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    Categoria toEntity(CategoriaRequestDTO dto);

    @Mapping(target = "usuarioId", source = "usuario.id")
    CategoriaResponseDTO toDTO(Categoria entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    void updateEntityFromDTO(CategoriaRequestDTO dto, @MappingTarget Categoria entity);
}