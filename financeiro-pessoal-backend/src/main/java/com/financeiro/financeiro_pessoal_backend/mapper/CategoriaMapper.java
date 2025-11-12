package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.CategoriaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.CategoriaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Categoria;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoriaMapper {

    /**
     * Converte DTO de request para entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    Categoria toEntity(CategoriaRequestDTO dto);

    /**
     * Converte entity para DTO de response (sem despesas)
     * Usado para listagens e consultas simples
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "despesas", ignore = true)  // Ignora para evitar lazy loading
    CategoriaResponseDTO toDto(Categoria entity);

    /**
     * Converte entity para DTO de response COM despesas
     * Usado quando a consulta já fez JOIN FETCH com despesas
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    // Não ignora despesas - elas serão mapeadas
    CategoriaResponseDTO toDtoWithDespesas(Categoria entity);

    /**
     * Atualiza entity existente com dados do DTO
     * Usado no método update
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    void updateEntityFromDto(CategoriaRequestDTO dto, @MappingTarget Categoria entity);
}
