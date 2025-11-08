package com.financeiro.financeiro_pessoal_backend.repository;

import com.financeiro.financeiro_pessoal_backend.model.Usuario;
import com.financeiro.financeiro_pessoal_backend.model.enums.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca usuário por email (usado no login)
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verifica se existe usuário com o email
     */
    boolean existsByEmail(String email);

    /**
     * Busca usuário por email e ativo
     */
    Optional<Usuario> findByEmailAndAtivoTrue(String email);

    /**
     * Busca todos os usuários ativos
     */
    List<Usuario> findByAtivoTrue();

    /**
     * Busca usuários por tipo
     */
    List<Usuario> findByTipoUsuario(TipoUsuario tipoUsuario);

    /**
     * Busca usuários ativos por tipo
     */
    List<Usuario> findByTipoUsuarioAndAtivoTrue(TipoUsuario tipoUsuario);

    /**
     * Busca usuário com todas as receitas (evita N+1)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
            "LEFT JOIN FETCH u.receitas " +
            "WHERE u.id = :id")
    Optional<Usuario> findByIdWithReceitas(@Param("id") Long id);

    /**
     * Busca usuário com todas as despesas (evita N+1)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
            "LEFT JOIN FETCH u.despesas " +
            "WHERE u.id = :id")
    Optional<Usuario> findByIdWithDespesas(@Param("id") Long id);

    /**
     * Busca usuário com todas as metas (evita N+1)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
            "LEFT JOIN FETCH u.metas " +
            "WHERE u.id = :id")
    Optional<Usuario> findByIdWithMetas(@Param("id") Long id);

    /**
     * Busca usuário com todas as categorias (evita N+1)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
            "LEFT JOIN FETCH u.categorias " +
            "WHERE u.id = :id")
    Optional<Usuario> findByIdWithCategorias(@Param("id") Long id);

    /**
     * Busca usuário com todos os relacionamentos (uso cauteloso)
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
            "LEFT JOIN FETCH u.receitas " +
            "LEFT JOIN FETCH u.despesas " +
            "LEFT JOIN FETCH u.metas " +
            "LEFT JOIN FETCH u.categorias " +
            "WHERE u.id = :id")
    Optional<Usuario> findByIdWithAllRelations(@Param("id") Long id);

    /**
     * Conta usuários ativos
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.ativo = true")
    Long countAtivos();

    /**
     * Conta usuários por tipo
     */
    Long countByTipoUsuario(TipoUsuario tipoUsuario);

    /**
     * Busca usuários por nome (case insensitive)
     */
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%')) AND u.ativo = true")
    List<Usuario> findByNomeContainingIgnoreCaseAndAtivoTrue(@Param("nome") String nome);
}