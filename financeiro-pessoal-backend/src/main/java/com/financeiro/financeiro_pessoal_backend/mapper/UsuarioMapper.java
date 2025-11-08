package com.financeiro.financeiro_pessoal_backend.mapper;

import com.financeiro.financeiro_pessoal_backend.dto.request.RegisterRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.UsuarioResponseDTO;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UsuarioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", source = "senha")
    @Mapping(target = "tipoUsuario", constant = "USER")
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "receitas", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    @Mapping(target = "metas", ignore = true)
    @Mapping(target = "categorias", ignore = true)
    Usuario toEntity(RegisterRequestDTO dto);

    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    UsuarioResponseDTO toDTO(Usuario entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "senhaHash", ignore = true)
    @Mapping(target = "tipoUsuario", ignore = true)
    @Mapping(target = "receitas", ignore = true)
    @Mapping(target = "despesas", ignore = true)
    @Mapping(target = "metas", ignore = true)
    @Mapping(target = "categorias", ignore = true)
    void updateEntityFromDTO(RegisterRequestDTO dto, @MappingTarget Usuario entity);
}