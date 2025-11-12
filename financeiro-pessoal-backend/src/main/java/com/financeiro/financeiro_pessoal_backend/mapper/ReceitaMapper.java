package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.ReceitaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ReceitaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Receita;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReceitaMapper {

    /**
     * Converte DTO de request para entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    Receita toEntity(ReceitaRequestDTO dto);

    /**
     * Converte entity para DTO de response (sem despesas)
     * Usado para listagens e consultas simples
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "totalReceitas", expression = "java(entity.getTotalReceitas())")
    @Mapping(target = "totalDespesas", expression = "java(entity.getTotalDespesas())")
    @Mapping(target = "saldo", expression = "java(entity.getSaldo())")
    @Mapping(target = "despesas", ignore = true)  // Ignora despesas para evitar lazy loading
    ReceitaResponseDTO toDto(Receita entity);

    /**
     * Converte entity para DTO de response COM despesas
     * Usado quando a consulta já fez JOIN FETCH com despesas
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "totalReceitas", expression = "java(entity.getTotalReceitas())")
    @Mapping(target = "totalDespesas", expression = "java(entity.getTotalDespesas())")
    @Mapping(target = "saldo", expression = "java(entity.getSaldo())")
    // Não ignora despesas - elas serão mapeadas
    ReceitaResponseDTO toDtoWithDespesas(Receita entity);

    /**
     * Atualiza entity existente com dados do DTO
     * Usado no método update
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    void updateEntityFromDto(ReceitaRequestDTO dto, @MappingTarget Receita entity);
}
