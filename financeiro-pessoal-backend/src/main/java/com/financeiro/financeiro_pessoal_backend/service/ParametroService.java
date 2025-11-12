package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.ParametroRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ParametroResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.DuplicateResourceException;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.ParametroMapper;
import com.financeiro.financeiro_pessoal_backend.model.Parametro;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoParametro;
import com.financeiro.financeiro_pessoal_backend.repository.ParametroRepository;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParametroService {

    private final ParametroRepository parametroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ParametroMapper parametroMapper;
    private final SecurityUtil securityUtil;

    /**
     * Cria um novo parâmetro
     */
    @Transactional
    @CacheEvict(value = "parametros", allEntries = true)
    public ParametroResponseDTO create(ParametroRequestDTO request) {
        log.info("Criando novo parâmetro: {}", request.getChave());

        Long usuarioId = securityUtil.getUsuarioLogadoId();

        // Busca usuário
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validações
        validateParametro(request, null, usuarioId);

        // Verifica duplicidade
        if (parametroRepository.existsByUsuarioIdAndChave(usuarioId, request.getChave())) {
            throw new DuplicateResourceException("Já existe um parâmetro com esta chave");
        }

        // Valida valor conforme tipo
        validateValorPorTipo(request.getValor(), request.getTipo());

        // Cria parâmetro
        Parametro parametro = Parametro.builder()
                .usuario(usuario)
                .chave(request.getChave().trim())
                .descricao(request.getDescricao())
                .valor(request.getValor())
                .tipo(request.getTipo() != null ? request.getTipo() : TipoParametro.STRING)
                .build();

        parametro = parametroRepository.save(parametro);
        log.info("Parâmetro criado com sucesso - ID: {}, Chave: {}, Tipo: {}",
                parametro.getId(), parametro.getChave(), parametro.getTipo());

        return parametroMapper.toDto(parametro);
    }

    /**
     * Busca parâmetro por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "parametros", key = "#id")
    public ParametroResponseDTO findById(Long id) {
        log.debug("Buscando parâmetro por ID: {}", id);

        Parametro parametro = parametroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(parametro.getUsuario().getId());

        return parametroMapper.toDto(parametro);
    }

    /**
     * Busca parâmetro por chave
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "parametros", key = "'chave_' + #chave + '_' + #root.target.securityUtil.usuarioLogadoId")
    public ParametroResponseDTO findByChave(String chave) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetro por chave: {} do usuário: {}", chave, usuarioId);

        Parametro parametro = parametroRepository.findByUsuarioIdAndChave(usuarioId, chave)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com chave: " + chave));

        return parametroMapper.toDto(parametro);
    }

    /**
     * Busca valor de um parâmetro por chave
     */
    @Transactional(readOnly = true)
    public String findValorByChave(String chave) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando valor do parâmetro: {}", chave);

        return parametroRepository.findValorByUsuarioIdAndChave(usuarioId, chave)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com chave: " + chave));
    }

    /**
     * Busca valor como String ou retorna default
     */
    @Transactional(readOnly = true)
    public String findValorOrDefault(String chave, String defaultValue) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando valor do parâmetro {} com default", chave);

        return parametroRepository.findValorByUsuarioIdAndChave(usuarioId, chave)
                .orElse(defaultValue);
    }

    /**
     * Busca valor como Integer
     */
    @Transactional(readOnly = true)
    public Integer findValorAsInteger(String chave) {
        String valor = findValorByChave(chave);
        try {
            return Integer.parseInt(valor);
        } catch (NumberFormatException e) {
            throw new ValidationException("Valor do parâmetro '" + chave + "' não é um número válido");
        }
    }

    /**
     * Busca valor como Boolean
     */
    @Transactional(readOnly = true)
    public Boolean findValorAsBoolean(String chave) {
        String valor = findValorByChave(chave);
        return Boolean.parseBoolean(valor);
    }

    /**
     * Busca valor como Double
     */
    @Transactional(readOnly = true)
    public Double findValorAsDouble(String chave) {
        String valor = findValorByChave(chave);
        try {
            return Double.parseDouble(valor);
        } catch (NumberFormatException e) {
            throw new ValidationException("Valor do parâmetro '" + chave + "' não é um número decimal válido");
        }
    }

    /**
     * Lista todos os parâmetros do usuário
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "parametros", key = "'usuario_' + #root.target.securityUtil.usuarioLogadoId")
    public List<ParametroResponseDTO> findAllByUsuario() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando parâmetros do usuário: {}", usuarioId);

        List<Parametro> parametros = parametroRepository.findByUsuarioIdOrderByChaveAsc(usuarioId);
        log.info("Total de parâmetros encontrados: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros por tipo
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findByTipo(TipoParametro tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros do tipo: {}", tipo);

        List<Parametro> parametros = parametroRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
        log.info("Parâmetros encontrados do tipo {}: {}", tipo, parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros do tipo STRING
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findStringParametros() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros do tipo STRING");

        List<Parametro> parametros = parametroRepository.findStringParametrosByUsuarioId(usuarioId);
        log.info("Total de parâmetros STRING: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros do tipo NUMBER
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findNumberParametros() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros do tipo NUMBER");

        List<Parametro> parametros = parametroRepository.findNumberParametrosByUsuarioId(usuarioId);
        log.info("Total de parâmetros NUMBER: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros do tipo BOOLEAN
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findBooleanParametros() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros do tipo BOOLEAN");

        List<Parametro> parametros = parametroRepository.findBooleanParametrosByUsuarioId(usuarioId);
        log.info("Total de parâmetros BOOLEAN: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros com descrição
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findWithDescricao() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros com descrição");

        List<Parametro> parametros = parametroRepository.findByUsuarioIdWithDescricao(usuarioId);
        log.info("Parâmetros com descrição: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros por chave (busca parcial)
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> searchByChave(String chave) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros por chave: {}", chave);

        if (chave == null || chave.trim().length() < 2) {
            throw new ValidationException("O termo de busca deve ter no mínimo 2 caracteres");
        }

        List<Parametro> parametros = parametroRepository.findByUsuarioIdAndChaveContaining(usuarioId, chave);
        log.info("Parâmetros encontrados com chave '{}': {}", chave, parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca parâmetros atualizados recentemente
     */
    @Transactional(readOnly = true)
    public List<ParametroResponseDTO> findRecentlyUpdated() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando parâmetros atualizados recentemente");

        List<Parametro> parametros = parametroRepository.findByUsuarioIdOrderByUpdatedAtDesc(usuarioId);
        log.info("Parâmetros encontrados: {}", parametros.size());

        return parametros.stream()
                .map(parametroMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza parâmetro
     */
    @Transactional
    @CacheEvict(value = "parametros", allEntries = true)
    public ParametroResponseDTO update(Long id, ParametroRequestDTO request) {
        log.info("Atualizando parâmetro - ID: {}", id);

        Parametro parametro = parametroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(parametro.getUsuario().getId());

        // Validações
        validateParametro(request, id, parametro.getUsuario().getId());

        // Valida valor conforme tipo
        validateValorPorTipo(request.getValor(), request.getTipo());

        // Atualiza dados
        parametro.setChave(request.getChave().trim());
        parametro.setDescricao(request.getDescricao());
        parametro.setValor(request.getValor());
        parametro.setTipo(request.getTipo() != null ? request.getTipo() : TipoParametro.STRING);

        parametro = parametroRepository.save(parametro);
        log.info("Parâmetro atualizado com sucesso - ID: {}, Chave: {}",
                parametro.getId(), parametro.getChave());

        return parametroMapper.toDto(parametro);
    }

    /**
     * Atualiza apenas o valor do parâmetro
     */
    @Transactional
    @CacheEvict(value = "parametros", allEntries = true)
    public ParametroResponseDTO updateValor(String chave, String valor) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.info("Atualizando valor do parâmetro: {}", chave);

        Parametro parametro = parametroRepository.findByUsuarioIdAndChave(usuarioId, chave)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com chave: " + chave));

        // Valida valor conforme tipo
        validateValorPorTipo(valor, parametro.getTipo());

        parametro.setValor(valor);
        parametro = parametroRepository.save(parametro);

        log.info("Valor do parâmetro atualizado - Chave: {}, Novo valor: {}", chave, valor);
        return parametroMapper.toDto(parametro);
    }

    /**
     * Deleta parâmetro
     */
    @Transactional
    @CacheEvict(value = "parametros", allEntries = true)
    public void delete(Long id) {
        log.info("Deletando parâmetro - ID: {}", id);

        Parametro parametro = parametroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(parametro.getUsuario().getId());

        parametroRepository.delete(parametro);
        log.info("Parâmetro deletado com sucesso - ID: {}, Chave: {}", id, parametro.getChave());
    }

    /**
     * Deleta parâmetro por chave
     */
    @Transactional
    @CacheEvict(value = "parametros", allEntries = true)
    public void deleteByChave(String chave) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.info("Deletando parâmetro por chave: {}", chave);

        Parametro parametro = parametroRepository.findByUsuarioIdAndChave(usuarioId, chave)
                .orElseThrow(() -> new ResourceNotFoundException("Parâmetro não encontrado com chave: " + chave));

        parametroRepository.delete(parametro);
        log.info("Parâmetro deletado com sucesso - Chave: {}", chave);
    }

    /**
     * Conta total de parâmetros
     */
    @Transactional(readOnly = true)
    public Long count() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = parametroRepository.countByUsuarioId(usuarioId);
        log.debug("Total de parâmetros do usuário {}: {}", usuarioId, count);
        return count;
    }

    /**
     * Conta parâmetros por tipo
     */
    @Transactional(readOnly = true)
    public Long countByTipo(TipoParametro tipo) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = parametroRepository.countByUsuarioIdAndTipo(usuarioId, tipo);
        log.debug("Total de parâmetros do tipo {} do usuário {}: {}", tipo, usuarioId, count);
        return count;
    }

    /**
     * Agrupa parâmetros por tipo
     */
    @Transactional(readOnly = true)
    public Map<String, Long> agruparPorTipo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Agrupando parâmetros por tipo");

        List<Object[]> results = parametroRepository.groupByTipo(usuarioId);

        Map<String, Long> grouped = new HashMap<>();
        for (Object[] result : results) {
            TipoParametro tipo = (TipoParametro) result[0];
            Long quantidade = ((Number) result[1]).longValue();
            grouped.put(tipo.name(), quantidade);
        }

        log.info("Parâmetros agrupados por tipo: {}", grouped);
        return grouped;
    }

    /**
     * Verifica se parâmetro existe
     */
    @Transactional(readOnly = true)
    public boolean exists(String chave) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        boolean exists = parametroRepository.existsByUsuarioIdAndChave(usuarioId, chave);
        log.debug("Parâmetro '{}' existe: {}", chave, exists);
        return exists;
    }

    /**
     * Retorna todos os parâmetros como Map
     */
    @Transactional(readOnly = true)
    public Map<String, String> getAllAsMap() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Retornando todos os parâmetros como Map");

        List<Parametro> parametros = parametroRepository.findByUsuarioIdOrderByChaveAsc(usuarioId);

        Map<String, String> map = parametros.stream()
                .collect(Collectors.toMap(
                        Parametro::getChave,
                        p -> p.getValor() != null ? p.getValor() : ""
                ));

        log.info("Total de parâmetros no Map: {}", map.size());
        return map;
    }

    /**
     * Resumo de parâmetros
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getResumo() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Gerando resumo de parâmetros do usuário: {}", usuarioId);

        Long total = parametroRepository.countByUsuarioId(usuarioId);
        Long strings = parametroRepository.countByUsuarioIdAndTipo(usuarioId, TipoParametro.STRING);
        Long numbers = parametroRepository.countByUsuarioIdAndTipo(usuarioId, TipoParametro.NUMBER);
        Long booleans = parametroRepository.countByUsuarioIdAndTipo(usuarioId, TipoParametro.BOOLEAN);
        Long jsons = parametroRepository.countByUsuarioIdAndTipo(usuarioId, TipoParametro.JSON);

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("total", total);
        resumo.put("strings", strings);
        resumo.put("numbers", numbers);
        resumo.put("booleans", booleans);
        resumo.put("jsons", jsons);
        resumo.put("porTipo", agruparPorTipo());

        log.info("Resumo de parâmetros gerado - Total: {}", total);
        return resumo;
    }

    /**
     * Valida dados do parâmetro
     */
    private void validateParametro(ParametroRequestDTO request, Long parametroId, Long usuarioId) {
        if (request.getChave() == null || request.getChave().trim().isEmpty()) {
            throw new ValidationException("Chave é obrigatória");
        }
        if (request.getChave().trim().length() < 2) {
            throw new ValidationException("Chave deve ter no mínimo 2 caracteres");
        }
        if (request.getChave().trim().length() > 100) {
            throw new ValidationException("Chave deve ter no máximo 100 caracteres");
        }
        if (request.getDescricao() != null && request.getDescricao().length() > 255) {
            throw new ValidationException("Descrição não pode exceder 255 caracteres");
        }
        if (request.getValor() != null && request.getValor().length() > 500) {
            throw new ValidationException("Valor não pode exceder 500 caracteres");
        }
    }

    /**
     * Valida valor conforme o tipo
     */
    private void validateValorPorTipo(String valor, TipoParametro tipo) {
        if (valor == null || valor.trim().isEmpty()) {
            return; // Valores nulos/vazios são permitidos
        }

        try {
            switch (tipo) {
                case NUMBER:
                    Double.parseDouble(valor);
                    break;
                case BOOLEAN:
                    if (!valor.equalsIgnoreCase("true") && !valor.equalsIgnoreCase("false")) {
                        throw new ValidationException("Valor deve ser 'true' ou 'false' para tipo BOOLEAN");
                    }
                    break;
                case JSON:
                    // Validação básica de JSON
                    if (!valor.trim().startsWith("{") && !valor.trim().startsWith("[")) {
                        throw new ValidationException("Valor deve ser um JSON válido");
                    }
                    break;
                case STRING:
                default:
                    // String aceita qualquer valor
                    break;
            }
        } catch (NumberFormatException e) {
            throw new ValidationException("Valor '" + valor + "' não é válido para o tipo " + tipo);
        }
    }
}