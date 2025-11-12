package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.request.ReceitaRequestDTO;
import com.financeiro.financeiro_pessoal_backend.dto.response.ReceitaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.exception.ValidationException;
import com.financeiro.financeiro_pessoal_backend.mapper.ReceitaMapper;
import com.financeiro.financeiro_pessoal_backend.model.Receita;
import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.repository.ReceitaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.UsuarioRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceitaService {

    private final ReceitaRepository receitaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReceitaMapper receitaMapper;
    private final SecurityUtil securityUtil;

    /**
     * Cria uma nova receita
     */
    @Transactional
    @CacheEvict(value = "receitas", allEntries = true)
    public ReceitaResponseDTO create(ReceitaRequestDTO request) {
        log.info("Criando nova receita para o período: {} a {}",
                request.getPeriodoInicio(), request.getPeriodoFim());

        Long usuarioId = securityUtil.getUsuarioLogadoId();

        // Busca usuário
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Validações
        validateReceita(request, null, usuarioId);

        // Verifica se já existe receita no período
        if (receitaRepository.existsByUsuarioIdAndPeriodoOverlap(
                usuarioId, request.getPeriodoInicio(), request.getPeriodoFim())) {
            throw new ValidationException("Já existe uma receita cadastrada para este período");
        }

        // Cria receita
        Receita receita = Receita.builder()
                .usuario(usuario)
                .periodoInicio(request.getPeriodoInicio())
                .periodoFim(request.getPeriodoFim())
                .diasUteis(request.getDiasUteis())
                .salario(request.getSalario() != null ? request.getSalario() : BigDecimal.ZERO)
                .auxilios(request.getAuxilios() != null ? request.getAuxilios() : BigDecimal.ZERO)
                .servicosExtras(request.getServicosExtras() != null ? request.getServicosExtras() : BigDecimal.ZERO)
                .observacoes(request.getObservacoes())
                .build();

        receita = receitaRepository.save(receita);
        log.info("Receita criada com sucesso - ID: {}, Total: {}",
                receita.getId(), receita.getTotalReceitas());

        return receitaMapper.toDto(receita);
    }

    /**
     * Busca receita por ID
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "receitas", key = "#id")
    public ReceitaResponseDTO findById(Long id) {
        log.debug("Buscando receita por ID: {}", id);

        Receita receita = receitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(receita.getUsuario().getId());

        return receitaMapper.toDto(receita);
    }

    /**
     * Busca receita por ID com despesas (evita N+1)
     */
    @Transactional(readOnly = true)
    public ReceitaResponseDTO findByIdWithDespesas(Long id) {
        log.debug("Buscando receita com despesas - ID: {}", id);

        Receita receita = receitaRepository.findByIdWithDespesas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(receita.getUsuario().getId());

        return receitaMapper.toDtoWithDespesas(receita);
    }

    /**
     * Lista todas as receitas do usuário logado com paginação
     */
    @Transactional(readOnly = true)
    public Page<ReceitaResponseDTO> findAllByUsuario(Pageable pageable) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Listando receitas do usuário {} - Página: {}", usuarioId, pageable.getPageNumber());

        List<Receita> receitas = receitaRepository.findByUsuarioIdOrderByPeriodoInicioDesc(usuarioId);

        // Aplica paginação manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), receitas.size());
        List<Receita> pageContent = receitas.subList(start, end);

        List<ReceitaResponseDTO> dtos = pageContent.stream()
                .map(receitaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Total de receitas encontradas: {}", receitas.size());
        return new PageImpl<>(dtos, pageable, receitas.size());
    }

    /**
     * Busca receitas por período
     */
    @Transactional(readOnly = true)
    public List<ReceitaResponseDTO> findByPeriodo(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando receitas do usuário {} no período: {} a {}", usuarioId, inicio, fim);

        // Validações
        if (inicio == null || fim == null) {
            throw new ValidationException("Período inicial e final são obrigatórios");
        }
        if (inicio.isAfter(fim)) {
            throw new ValidationException("Data inicial não pode ser posterior à data final");
        }

        List<Receita> receitas = receitaRepository.findByUsuarioIdAndPeriodoBetween(usuarioId, inicio, fim);
        log.info("Receitas encontradas no período: {}", receitas.size());

        return receitas.stream()
                .map(receitaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca receitas que contêm uma data específica
     */
    @Transactional(readOnly = true)
    public List<ReceitaResponseDTO> findByDataInPeriodo(LocalDate data) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando receitas que contêm a data: {}", data);

        if (data == null) {
            throw new ValidationException("Data é obrigatória");
        }

        List<Receita> receitas = receitaRepository.findByUsuarioIdAndDataInPeriodo(usuarioId, data);
        log.info("Receitas encontradas para a data {}: {}", data, receitas.size());

        return receitas.stream()
                .map(receitaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca receita mais recente do usuário
     */
    @Transactional(readOnly = true)
    public ReceitaResponseDTO findMaisRecente() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando receita mais recente do usuário: {}", usuarioId);

        Receita receita = receitaRepository.findMaisRecenteByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Nenhuma receita encontrada"));

        return receitaMapper.toDto(receita);
    }

    /**
     * Busca receitas do ano
     */
    @Transactional(readOnly = true)
    public List<ReceitaResponseDTO> findByAno(int ano) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Buscando receitas do ano {} para usuário {}", ano, usuarioId);

        if (ano < 1900 || ano > 2100) {
            throw new ValidationException("Ano inválido");
        }

        List<Receita> receitas = receitaRepository.findByUsuarioIdAndAno(usuarioId, ano);
        log.info("Receitas encontradas no ano {}: {}", ano, receitas.size());

        return receitas.stream()
                .map(receitaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza receita
     */
    @Transactional
    @CacheEvict(value = "receitas", allEntries = true)
    public ReceitaResponseDTO update(Long id, ReceitaRequestDTO request) {
        log.info("Atualizando receita - ID: {}", id);

        Receita receita = receitaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(receita.getUsuario().getId());

        // Validações
        validateReceita(request, id, receita.getUsuario().getId());

        // Verifica sobreposição de períodos (excluindo a própria receita)
        if (!receita.getPeriodoInicio().equals(request.getPeriodoInicio()) ||
                !receita.getPeriodoFim().equals(request.getPeriodoFim())) {

            if (receitaRepository.existsByUsuarioIdAndPeriodoOverlap(
                    receita.getUsuario().getId(),
                    request.getPeriodoInicio(),
                    request.getPeriodoFim())) {

                // Verifica se a sobreposição é com outra receita
                List<Receita> overlapping = receitaRepository.findByUsuarioIdAndDataInPeriodo(
                        receita.getUsuario().getId(), request.getPeriodoInicio());

                boolean hasOtherOverlap = overlapping.stream()
                        .anyMatch(r -> !r.getId().equals(id));

                if (hasOtherOverlap) {
                    throw new ValidationException("Já existe uma receita cadastrada para este período");
                }
            }
        }

        // Atualiza dados
        receita.setPeriodoInicio(request.getPeriodoInicio());
        receita.setPeriodoFim(request.getPeriodoFim());
        receita.setDiasUteis(request.getDiasUteis());
        receita.setSalario(request.getSalario() != null ? request.getSalario() : BigDecimal.ZERO);
        receita.setAuxilios(request.getAuxilios() != null ? request.getAuxilios() : BigDecimal.ZERO);
        receita.setServicosExtras(request.getServicosExtras() != null ? request.getServicosExtras() : BigDecimal.ZERO);
        receita.setObservacoes(request.getObservacoes());

        receita = receitaRepository.save(receita);
        log.info("Receita atualizada com sucesso - ID: {}, Total: {}",
                receita.getId(), receita.getTotalReceitas());

        return receitaMapper.toDto(receita);
    }

    /**
     * Deleta receita
     */
    @Transactional
    @CacheEvict(value = "receitas", allEntries = true)
    public void delete(Long id) {
        log.info("Deletando receita - ID: {}", id);

        Receita receita = receitaRepository.findByIdWithDespesas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada com ID: " + id));

        // Valida permissão
        securityUtil.validarPermissaoUsuario(receita.getUsuario().getId());

        // Verifica se há despesas associadas
        if (!receita.getDespesas().isEmpty()) {
            throw new ValidationException(
                    "Não é possível deletar receita com despesas associadas. " +
                            "Total de despesas: " + receita.getDespesas().size()
            );
        }

        receitaRepository.delete(receita);
        log.info("Receita deletada com sucesso - ID: {}", id);
    }

    /**
     * Calcula total de receitas por período
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPorPeriodo(LocalDate inicio, LocalDate fim) {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando total de receitas do período: {} a {}", inicio, fim);

        if (inicio == null || fim == null) {
            throw new ValidationException("Período inicial e final são obrigatórios");
        }
        if (inicio.isAfter(fim)) {
            throw new ValidationException("Data inicial não pode ser posterior à data final");
        }

        BigDecimal total = receitaRepository.sumTotalReceitasByUsuarioIdAndPeriodo(usuarioId, inicio, fim);
        log.info("Total de receitas no período: {}", total);

        return total;
    }

    /**
     * Calcula média de receitas mensais
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularMediaMensal() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        log.debug("Calculando média mensal de receitas do usuário: {}", usuarioId);

        BigDecimal media = receitaRepository.calcularMediaReceitasByUsuarioId(usuarioId);
        log.info("Média mensal de receitas: {}", media);

        return media != null ? media : BigDecimal.ZERO;
    }

    /**
     * Conta total de receitas do usuário
     */
    @Transactional(readOnly = true)
    public Long count() {
        Long usuarioId = securityUtil.getUsuarioLogadoId();
        Long count = receitaRepository.countByUsuarioId(usuarioId);
        log.debug("Total de receitas do usuário {}: {}", usuarioId, count);
        return count;
    }

    /**
     * Valida dados da receita
     */
    private void validateReceita(ReceitaRequestDTO request, Long receitaId, Long usuarioId) {
        // Valida período
        if (request.getPeriodoInicio() == null) {
            throw new ValidationException("Período inicial é obrigatório");
        }
        if (request.getPeriodoFim() == null) {
            throw new ValidationException("Período final é obrigatório");
        }
        if (request.getPeriodoInicio().isAfter(request.getPeriodoFim())) {
            throw new ValidationException("Período inicial não pode ser posterior ao período final");
        }

        // Valida valores
        if (request.getSalario() != null && request.getSalario().compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Salário não pode ser negativo");
        }
        if (request.getAuxilios() != null && request.getAuxilios().compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Auxílios não podem ser negativos");
        }
        if (request.getServicosExtras() != null && request.getServicosExtras().compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Serviços extras não podem ser negativos");
        }

        // Valida dias úteis
        if (request.getDiasUteis() != null) {
            if (request.getDiasUteis() < 0 || request.getDiasUteis() > 31) {
                throw new ValidationException("Dias úteis deve estar entre 0 e 31");
            }
        }

        // Valida observações
        if (request.getObservacoes() != null && request.getObservacoes().length() > 1000) {
            throw new ValidationException("Observações não podem exceder 1000 caracteres");
        }
    }
}