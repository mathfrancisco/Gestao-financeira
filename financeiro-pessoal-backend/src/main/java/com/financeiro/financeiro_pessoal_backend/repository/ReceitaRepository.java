package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    /**
     * Busca receitas por usuário ordenadas por período
     */
    @Query("SELECT r FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "ORDER BY r.periodoInicio DESC")
    List<Receita> findByUsuarioIdOrderByPeriodoInicioDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca receita por ID com despesas (evita N+1)
     */
    @Query("SELECT r FROM Receita r " +
            "LEFT JOIN FETCH r.despesas d " +
            "WHERE r.id = :id")
    Optional<Receita> findByIdWithDespesas(@Param("id") Long id);

    /**
     * Busca receitas do usuário com despesas (evita N+1)
     */
    @Query("SELECT DISTINCT r FROM Receita r " +
            "LEFT JOIN FETCH r.despesas d " +
            "WHERE r.usuario.id = :usuarioId " +
            "ORDER BY r.periodoInicio DESC")
    List<Receita> findByUsuarioIdWithDespesas(@Param("usuarioId") Long usuarioId);

    /**
     * Busca receitas por período
     */
    @Query("SELECT r FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND r.periodoInicio >= :inicio " +
            "AND r.periodoFim <= :fim " +
            "ORDER BY r.periodoInicio DESC")
    List<Receita> findByUsuarioIdAndPeriodoBetween(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Busca receitas que contêm uma data específica
     */
    @Query("SELECT r FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND :data BETWEEN r.periodoInicio AND r.periodoFim")
    List<Receita> findByUsuarioIdAndDataInPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("data") LocalDate data
    );

    /**
     * Busca receita mais recente do usuário
     */
    @Query("SELECT r FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "ORDER BY r.periodoInicio DESC " +
            "LIMIT 1")
    Optional<Receita> findMaisRecenteByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Soma total de salários por período
     */
    @Query("SELECT COALESCE(SUM(r.salario), 0) FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND r.periodoInicio >= :inicio " +
            "AND r.periodoFim <= :fim")
    BigDecimal sumSalarioByUsuarioIdAndPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Soma total de receitas (salário + auxílios + serviços) por período
     */
    @Query("SELECT COALESCE(SUM(r.salario + r.auxilios + r.servicosExtras), 0) FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND r.periodoInicio >= :inicio " +
            "AND r.periodoFim <= :fim")
    BigDecimal sumTotalReceitasByUsuarioIdAndPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Busca receitas do ano corrente
     */
    @Query("SELECT r FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND EXTRACT(YEAR FROM r.periodoInicio) = :ano " +
            "ORDER BY r.periodoInicio DESC")
    List<Receita> findByUsuarioIdAndAno(
            @Param("usuarioId") Long usuarioId,
            @Param("ano") int ano
    );

    /**
     * Verifica se existe receita no período para o usuário
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId " +
            "AND ((r.periodoInicio BETWEEN :inicio AND :fim) " +
            "OR (r.periodoFim BETWEEN :inicio AND :fim) " +
            "OR (:inicio BETWEEN r.periodoInicio AND r.periodoFim))")
    boolean existsByUsuarioIdAndPeriodoOverlap(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Conta receitas do usuário
     */
    Long countByUsuarioId(Long usuarioId);

    /**
     * Média de receitas mensais do usuário
     */
    @Query("SELECT AVG(r.salario + r.auxilios + r.servicosExtras) FROM Receita r " +
            "WHERE r.usuario.id = :usuarioId")
    BigDecimal calcularMediaReceitasByUsuarioId(@Param("usuarioId") Long usuarioId);
}