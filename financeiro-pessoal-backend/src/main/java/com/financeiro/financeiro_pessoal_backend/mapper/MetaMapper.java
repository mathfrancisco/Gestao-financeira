package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.MetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.MetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Meta;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MetaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "valorAtual", constant = "0")
    @Mapping(target = "progresso", constant = "0")
    @Mapping(target = "transacoes", ignore = true)
    Meta toEntity(MetaRequestDTO dto);

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "valorRestante", expression = "java(entity.getValorRestante())")
    @Mapping(target = "concluida", expression = "java(entity.isConcluida())")
    @Mapping(target = "vencida", expression = "java(entity.isVencida())")
    MetaResponseDTO toDTO(Meta entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "valorAtual", ignore = true)
    @Mapping(target = "progresso", ignore = true)
    @Mapping(target = "transacoes", ignore = true)
    void updateEntityFromDTO(MetaRequestDTO dto, @MappingTarget Meta entity);
}