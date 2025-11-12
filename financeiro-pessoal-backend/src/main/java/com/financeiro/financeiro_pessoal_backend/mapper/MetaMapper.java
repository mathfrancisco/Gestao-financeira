package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.MetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.MetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Meta;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MetaMapper {

    /**
     * Converte DTO de request para entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "valorAtual", constant = "0")
    @Mapping(target = "progresso", constant = "0")
    @Mapping(target = "transacoes", ignore = true)
    Meta toEntity(MetaRequestDTO dto);

    /**
     * Converte entity para DTO de response (sem transações)
     * Usado para listagens e consultas simples
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "valorRestante", expression = "java(entity.getValorRestante())")
    @Mapping(target = "concluida", expression = "java(entity.isConcluida())")
    @Mapping(target = "vencida", expression = "java(entity.isVencida())")
    @Mapping(target = "transacoes", ignore = true)  // Ignora para evitar lazy loading
    MetaResponseDTO toDto(Meta entity);

    /**
     * Converte entity para DTO de response COM transações
     * Usado quando a consulta já fez JOIN FETCH com transações
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "valorRestante", expression = "java(entity.getValorRestante())")
    @Mapping(target = "concluida", expression = "java(entity.isConcluida())")
    @Mapping(target = "vencida", expression = "java(entity.isVencida())")
    // Não ignora transacoes - elas serão mapeadas
    MetaResponseDTO toDtoWithTransacoes(Meta entity);

    /**
     * Atualiza entity existente com dados do DTO
     * Usado no método update
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "valorAtual", ignore = true)
    @Mapping(target = "progresso", ignore = true)
    @Mapping(target = "transacoes", ignore = true)
    void updateEntityFromDto(MetaRequestDTO dto, @MappingTarget Meta entity);
}
