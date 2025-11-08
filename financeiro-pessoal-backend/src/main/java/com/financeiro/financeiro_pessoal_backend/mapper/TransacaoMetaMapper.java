package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.AporteMetaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.TransacaoMetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.TransacaoMeta;
import org.mapstruct.*;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, imports = LocalDateTime.class)
public interface TransacaoMetaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "meta", ignore = true)
    @Mapping(target = "data", expression = "java(LocalDateTime.now())")
    TransacaoMeta toEntity(AporteMetaRequestDTO dto);

    @Mapping(target = "metaId", source = "meta.id")
    @Mapping(target = "metaNome", source = "meta.nome")
    TransacaoMetaResponseDTO toDTO(TransacaoMeta entity);
}