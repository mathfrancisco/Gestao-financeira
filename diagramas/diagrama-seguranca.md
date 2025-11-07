# Diagrama de Segurança

## Visão Geral

Este documento detalha todas as camadas de segurança implementadas no sistema, desde autenticação até proteções contra ataques [web:28][web:31].

## Arquitetura de Segurança em Camadas

┌─────────────────────────────────────────────────────────────┐
│ CAMADAS DE SEGURANÇA │
├─────────────────────────────────────────────────────────────┤
│ │
│ Camada 1: Network & Infrastructure │
│ ├─ HTTPS/TLS 1.3 │
│ ├─ CORS Whitelist │
│ ├─ Firewall (Railway/Cloud) │
│ └─ DDoS Protection │
│ │
│ Camada 2: Authentication & Authorization │
│ ├─ JWT Stateless Tokens │
│ ├─ Argon2 Password Hashing │
│ ├─ Role-Based Access Control │
│ └─ Session Management │
│ │
│ Camada 3: Application Security │
│ ├─ Input Validation │
│ ├─ SQL Injection Protection (JPA) │
│ ├─ XSS Protection (React Auto-escape) │
│ ├─ CSRF Protection │
│ └─ Rate Limiting │
│ │
│ Camada 4: Data Security │
│ ├─ Encryption at Rest (PostgreSQL) │
│ ├─ Encryption in Transit (TLS) │
│ ├─ User Data Isolation │
│ └─ Audit Logs │
│ │
│ Camada 5: Monitoring & Response │
│ ├─ Security Headers │
│ ├─ Error Handling │
│ ├─ Logging & Alerting │
│ └─ Incident Response │
│ │
└─────────────────────────────────────────────────────────────┘

text

## Fluxo de Segurança: Requisição Completa

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ GET /api/despesas/123 │
│ Headers: │
│ Authorization: Bearer eyJhbGci... │
│ Origin: https://app.financeiro.com │
├────────────────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────────┐ │
│ │ 1. CORS Filter │ │
│ │ - Valida origem │ │
│ └──────────┬───────────┘ │
│ │ │
│ ┌────────────────▼────────────┐ │
│ │ Origem permitida? │ │
│ └──┬───────────────────────┬──┘ │
│ │ │ │
│ NÃO│ │SIM │
│ │ │ │
│ ┌────────▼────────┐ ┌────────▼─────────┐ │
│ │ HTTP 403 │ │ 2. Security │ │
│ │ CORS Blocked │ │ Headers │ │
│ └─────────────────┘ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ Add Headers: │ │
│ │ - X-Frame-Options│ │
│ │ - X-XSS-Protection│ │
│ │ - CSP │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ 3. Rate Limiter │ │
│ │ - Check IP/User │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌───────────────▼────────────┐│
│ │ Limite excedido? ││
│ └──┬──────────────────────┬──┘│
│ │ │ │
│ SIM│ │NÃO│
│ │ │ │
│ ┌─────────▼────────┐ ┌─────────▼──────┐
│ │ HTTP 429 │ │ 4. JWT Auth │
│ │ Too Many Requests│ │ Filter │
│ └──────────────────┘ └─────────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ Extrai Token │
│ │ do Header │
│ └────────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ Valida Token │
│ │ - Assinatura │
│ │ - Expiração │
│ │ - Claims │
│ └────────┬──────┘
│ │
│ ┌───────────────▼────────┐
│ │ Token válido? │
│ └──┬──────────────────┬──┘
│ │ │
│ NÃO│ │SIM
│ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐
│ │ HTTP 401 │ │ 5. Load User│
│ │ Unauthorized │ │ Details │
│ └─────────────────┘ └──────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ Set Security │
│ │ Context │
│ └────────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ 6. Controller │
│ │ - Verifica │
│ │ ownership │
│ └────────┬──────┘
│ │
│ ┌───────────────▼────────┐
│ │ Despesa pertence ao │
│ │ usuário autenticado? │
│ └──┬──────────────────┬──┘
│ │ │
│ NÃO│ │SIM
│ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐
│ │ HTTP 403 │ │ 7. Process │
│ │ Forbidden │ │ Request │
│ └─────────────────┘ └──────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ 8. Validate │
│ │ Input │
│ └────────┬──────┘
│ │
│ ┌────────▼──────┐
│ │ 9. Sanitize │
│ │ Output │
│ └────────┬──────┘
│ │
│ HTTP 200 OK │
│ { │
│ "id": 123, │
│ "data": "2025-11-07", │
│ ... │
│ } │
│<─────────────────────────────────────────────────────────────────────────┤
│ │

