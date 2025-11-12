package com.financeiro.financeiro_pessoal_backend.service;

import com.financeiro.financeiro_pessoal_backend.dto.response.TransacaoMetaResponseDTO;
import com.financeiro.financeiro_pessoal_backend.exception.ResourceNotFoundException;
import com.financeiro.financeiro_pessoal_backend.mapper.TransacaoMetaMapper;
import com.financeiro.financeiro_pessoal_backend.model.Meta;
import com.financeiro.financeiro_pessoal_backend.model.TransacaoMeta;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoTransacao;
import com.financeiro.financeiro_pessoal_backend.repository.MetaRepository;
import com.financeiro.financeiro_pessoal_backend.repository.TransacaoMetaRepository;
import com.financeiro.financeiro_pessoal_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransacaoMetaService {

    private final TransacaoMetaRepository transacaoMetaRepository;
    private final MetaRepository metaRepository;
    private final TransacaoMetaMapper transacaoMetaMapper;
    private final SecurityUtil securityUtil;

    /**
     * Busca transações por meta com paginação
     */
    @Transactional(readOnly = true)
    public Page<TransacaoMetaResponseDTO> findByMeta(Long metaId, Pageable pageable) {
        log.debug("Buscando transações da meta: {}", metaId);

        // Valida meta
        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());

        List<TransacaoMeta> transacoes = transacaoMetaRepository.findByMetaIdOrderByDataDesc(metaId);

        // Aplica paginação
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), transacoes.size());
        List<TransacaoMeta> pageContent = transacoes.subList(start, end);

        List<TransacaoMetaResponseDTO> dtos = pageContent.stream()
                .map(transacaoMetaMapper::toDto)
                .collect(Collectors.toList());

        log.info("Total de transações encontradas: {}", transacoes.size());
        return new PageImpl<>(dtos, pageable, transacoes.size());
    }

    /**
     * Busca aportes de uma meta
     */
    @Transactional(readOnly = true)
    public List<TransacaoMetaResponseDTO> findAportes(Long metaId) {
        log.debug("Buscando aportes da meta: {}", metaId);

        validateMetaOwnership(metaId);

        List<TransacaoMeta> aportes = transacaoMetaRepository.findAportesByMetaId(metaId);
        log.info("Total de aportes encontrados: {}", aportes.size());

        return aportes.stream()
                .map(transacaoMetaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca resgates de uma meta
     */
    @Transactional(readOnly = true)
    public List<TransacaoMetaResponseDTO> findResgates(Long metaId) {
        log.debug("Buscando resgates da meta: {}", metaId);

        validateMetaOwnership(metaId);

        List<TransacaoMeta> resgates = transacaoMetaRepository.findResgatesByMetaId(metaId);
        log.info("Total de resgates encontrados: {}", resgates.size());

        return resgates.stream()
                .map(transacaoMetaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca transações por período
     */
    @Transactional(readOnly = true)
    public List<TransacaoMetaResponseDTO> findByPeriodo(Long metaId, LocalDateTime inicio, LocalDateTime fim) {
        log.debug("Buscando transações da meta {} no período: {} a {}", metaId, inicio, fim);

        validateMetaOwnership(metaId);

        List<TransacaoMeta> transacoes = transacaoMetaRepository.findByMetaIdAndDataBetween(metaId, inicio, fim);
        log.info("Transações encontradas no período: {}", transacoes.size());

        return transacoes.stream()
                .map(transacaoMetaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca últimas N transações
     */
    @Transactional(readOnly = true)
    public List<TransacaoMetaResponseDTO> findTopN(Long metaId, int limit) {
        log.debug("Buscando últimas {} transações da meta: {}", limit, metaId);

        validateMetaOwnership(metaId);

        List<TransacaoMeta> transacoes = transacaoMetaRepository.findTopNByMetaId(metaId, limit);
        log.info("Transações encontradas: {}", transacoes.size());

        return transacoes.stream()
                .map(transacaoMetaMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Soma total de aportes
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalAportes(Long metaId) {
        validateMetaOwnership(metaId);

        BigDecimal total = transacaoMetaRepository.sumAportesByMetaId(metaId);
        log.debug("Total de aportes da meta {}: {}", metaId, total);
        return total;
    }

    /**
     * Soma total de resgates
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalResgates(Long metaId) {
        validateMetaOwnership(metaId);

        BigDecimal total = transacaoMetaRepository.sumResgatesByMetaId(metaId);
        log.debug("Total de resgates da meta {}: {}", metaId, total);
        return total;
    }

    /**
     * Calcula média de aportes
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularMediaAportes(Long metaId) {
        validateMetaOwnership(metaId);

        BigDecimal media = transacaoMetaRepository.calcularMediaAportes(metaId);
        log.debug("Média de aportes da meta {}: {}", metaId, media);
        return media != null ? media : BigDecimal.ZERO;
    }

    /**
     * Busca maior aporte
     */
    @Transactional(readOnly = true)
    public BigDecimal findMaiorAporte(Long metaId) {
        validateMetaOwnership(metaId);

        BigDecimal maior = transacaoMetaRepository.findMaiorAporte(metaId);
        log.debug("Maior aporte da meta {}: {}", metaId, maior);
        return maior != null ? maior : BigDecimal.ZERO;
    }

    /**
     * Busca menor aporte
     */
    @Transactional(readOnly = true)
    public BigDecimal findMenorAporte(Long metaId) {
        validateMetaOwnership(metaId);

        BigDecimal menor = transacaoMetaRepository.findMenorAporte(metaId);
        log.debug("Menor aporte da meta {}: {}", metaId, menor);
        return menor != null ? menor : BigDecimal.ZERO;
    }

    /**
     * Conta transações
     */
    @Transactional(readOnly = true)
    public Long count(Long metaId) {
        validateMetaOwnership(metaId);

        Long count = transacaoMetaRepository.countByMetaId(metaId);
        log.debug("Total de transações da meta {}: {}", metaId, count);
        return count;
    }

    /**
     * Conta aportes
     */
    @Transactional(readOnly = true)
    public Long countAportes(Long metaId) {
        validateMetaOwnership(metaId);

        Long count = transacaoMetaRepository.countAportesByMetaId(metaId);
        log.debug("Total de aportes da meta {}: {}", metaId, count);
        return count;
    }

    /**
     * Conta resgates
     */
    @Transactional(readOnly = true)
    public Long countResgates(Long metaId) {
        validateMetaOwnership(metaId);

        Long count = transacaoMetaRepository.countResgatesByMetaId(metaId);
        log.debug("Total de resgates da meta {}: {}", metaId, count);
        return count;
    }

    /**
     * Valida se a meta pertence ao usuário logado
     */
    private void validateMetaOwnership(Long metaId) {
        Meta meta = metaRepository.findById(metaId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        securityUtil.validarPermissaoUsuario(meta.getUsuario().getId());
    }
}