package com.financeiro.financeiro_pessoal_backend.mapper;


import com.financeiro.financeiro_pessoal_backend.dto.request.ReceitaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ReceitaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Receita;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReceitaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    Receita toEntity(ReceitaRequestDTO dto);

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "usuarioNome", source = "usuario.nome")
    @Mapping(target = "totalReceitas", expression = "java(entity.getTotalReceitas())")
    @Mapping(target = "totalDespesas", expression = "java(entity.getTotalDespesas())")
    @Mapping(target = "saldo", expression = "java(entity.getSaldo())")
    ReceitaResponseDTO toDTO(Receita entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    void updateEntityFromDTO(ReceitaRequestDTO dto, @MappingTarget Receita entity);
}