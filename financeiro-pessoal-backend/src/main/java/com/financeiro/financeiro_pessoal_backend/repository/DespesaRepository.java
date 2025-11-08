package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Despesa;
import com.financeiro.financeiro_pessoal_backend.model.enums.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    /**
     * Busca despesas por usuário ordenadas por data
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdOrderByDataDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Busca despesa por ID com categoria e receita (evita N+1)
     */
    @Query("SELECT d FROM Despesa d " +
            "LEFT JOIN FETCH d.categoria " +
            "LEFT JOIN FETCH d.receita " +
            "WHERE d.id = :id")
    Optional<Despesa> findByIdWithRelations(@Param("id") Long id);

    /**
     * Busca despesas do usuário com categoria e receita (evita N+1)
     */
    @Query("SELECT d FROM Despesa d " +
            "LEFT JOIN FETCH d.categoria " +
            "LEFT JOIN FETCH d.receita " +
            "WHERE d.usuario.id = :usuarioId " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdWithRelations(@Param("usuarioId") Long usuarioId);

    /**
     * Busca despesas por período
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.data BETWEEN :inicio AND :fim " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdAndDataBetween(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Busca despesas por período com relacionamentos (evita N+1)
     */
    @Query("SELECT d FROM Despesa d " +
            "LEFT JOIN FETCH d.categoria " +
            "LEFT JOIN FETCH d.receita " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.data BETWEEN :inicio AND :fim " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdAndDataBetweenWithRelations(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Busca despesas por status
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.status = :status " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdAndStatus(
            @Param("usuarioId") Long usuarioId,
            @Param("status") StatusPagamento status
    );

    /**
     * Busca despesas vencidas (pendentes com data anterior à hoje)
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.status = 'PENDENTE' " +
            "AND d.data < CURRENT_DATE " +
            "ORDER BY d.data ASC")
    List<Despesa> findVencidasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca despesas por categoria
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.categoria.id = :categoriaId " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdAndCategoriaId(
            @Param("usuarioId") Long usuarioId,
            @Param("categoriaId") Long categoriaId
    );

    /**
     * Busca despesas por receita
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.receita.id = :receitaId " +
            "ORDER BY d.data DESC")
    List<Despesa> findByReceitaId(@Param("receitaId") Long receitaId);

    /**
     * Busca despesas parceladas
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.parcelaTotal > 1 " +
            "ORDER BY d.data DESC")
    List<Despesa> findParceladasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Soma total de despesas por período
     */
    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.data BETWEEN :inicio AND :fim")
    BigDecimal sumTotalByUsuarioIdAndPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Soma total de despesas por categoria e período
     */
    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.categoria.id = :categoriaId " +
            "AND d.data BETWEEN :inicio AND :fim")
    BigDecimal sumTotalByCategoriaAndPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("categoriaId") Long categoriaId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Soma total de despesas pagas por período
     */
    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.status = 'PAGO' " +
            "AND d.data BETWEEN :inicio AND :fim")
    BigDecimal sumTotalPagoByPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Soma total de despesas pendentes por período
     */
    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.status = 'PENDENTE' " +
            "AND d.data BETWEEN :inicio AND :fim")
    BigDecimal sumTotalPendenteByPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Agrupa despesas por categoria em um período
     */
    @Query("SELECT d.categoria.nome as categoria, COALESCE(SUM(d.valor), 0) as total " +
            "FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.data BETWEEN :inicio AND :fim " +
            "GROUP BY d.categoria.id, d.categoria.nome " +
            "ORDER BY total DESC")
    List<Object[]> sumByCategoria(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    /**
     * Conta despesas por status
     */
    @Query("SELECT COUNT(d) FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND d.status = :status")
    Long countByUsuarioIdAndStatus(
            @Param("usuarioId") Long usuarioId,
            @Param("status") StatusPagamento status
    );

    /**
     * Busca despesas do mês corrente
     */
    @Query("SELECT d FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "AND EXTRACT(YEAR FROM d.data) = :ano " +
            "AND EXTRACT(MONTH FROM d.data) = :mes " +
            "ORDER BY d.data DESC")
    List<Despesa> findByUsuarioIdAndMes(
            @Param("usuarioId") Long usuarioId,
            @Param("ano") int ano,
            @Param("mes") int mes
    );

    /**
     * Média de despesas mensais
     */
    @Query("SELECT AVG(total) FROM (" +
            "SELECT SUM(d.valor) as total " +
            "FROM Despesa d " +
            "WHERE d.usuario.id = :usuarioId " +
            "GROUP BY EXTRACT(YEAR FROM d.data), EXTRACT(MONTH FROM d.data)" +
            ") as monthly_totals")
    BigDecimal calcularMediaMensalByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Conta despesas do usuário
     */
    Long countByUsuarioId(Long usuarioId);
}