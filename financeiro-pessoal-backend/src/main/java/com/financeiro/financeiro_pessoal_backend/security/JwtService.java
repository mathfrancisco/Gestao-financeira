package com.financeiro.financeiro_pessoal_backend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    /**
     * Extrai o username (email) do token
     */
    public String extractUsername(String token) {
        try {
            DecodedJWT decodedJWT = decodeToken(token);
            return decodedJWT.getSubject();
        } catch (JWTVerificationException e) {
            log.error("Erro ao extrair username do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gera um token JWT para o usuário
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails, jwtExpiration);
    }

    /**
     * Gera um refresh token JWT para o usuário
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, refreshExpiration);
    }

    /**
     * Gera um token JWT com tempo de expiração customizado
     */
    private String generateToken(UserDetails userDetails, long expiration) {
        Instant now = Instant.now();
        Instant expirationTime = now.plusMillis(expiration);

        Algorithm algorithm = Algorithm.HMAC256(secretKey);

        return JWT.create()
                .withSubject(userDetails.getUsername())
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expirationTime))
                .withClaim("authorities", userDetails.getAuthorities().stream()
                        .map(Object::toString)
                        .toList())
                .sign(algorithm);
    }

    /**
     * Valida se o token é válido para o usuário
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username != null &&
                    username.equals(userDetails.getUsername()) &&
                    !isTokenExpired(token));
        } catch (Exception e) {
            log.error("Erro ao validar token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifica se o token está expirado
     */
    private boolean isTokenExpired(String token) {
        try {
            DecodedJWT decodedJWT = decodeToken(token);
            return decodedJWT.getExpiresAt().before(new Date());
        } catch (JWTVerificationException e) {
            log.error("Erro ao verificar expiração do token: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Extrai a data de expiração do token
     */
    public LocalDateTime extractExpiration(String token) {
        try {
            DecodedJWT decodedJWT = decodeToken(token);
            return LocalDateTime.ofInstant(
                    decodedJWT.getExpiresAt().toInstant(),
                    ZoneId.systemDefault()
            );
        } catch (JWTVerificationException e) {
            log.error("Erro ao extrair data de expiração do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Decodifica e verifica o token JWT
     */
    private DecodedJWT decodeToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secretKey);
        return JWT.require(algorithm)
                .build()
                .verify(token);
    }

    /**
     * Extrai o tempo restante até a expiração em milissegundos
     */
    public long getTimeUntilExpiration(String token) {
        try {
            DecodedJWT decodedJWT = decodeToken(token);
            long expirationTime = decodedJWT.getExpiresAt().getTime();
            long currentTime = System.currentTimeMillis();
            return Math.max(0, expirationTime - currentTime);
        } catch (JWTVerificationException e) {
            log.error("Erro ao calcular tempo de expiração: {}", e.getMessage());
            return 0;
        }
    }
}