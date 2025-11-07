text
# Diagrama de Autenticação JWT

## Visão Geral

Este documento descreve os fluxos de autenticação e autorização do sistema utilizando JWT (JSON Web Token) [web:22][web:24].

## Arquitetura de Autenticação

┌─────────────────────────────────────────────────────────────┐
│ COMPONENTES DE SEGURANÇA │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ JwtTokenProvider│ │ SecurityConfig │ │
│ │ - generateToken │ │ - filterChain │ │
│ │ - validateToken │ │ - corsConfig │ │
│ │ - getUserFromToken │ - authManager │ │
│ └──────────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ JwtAuthFilter │ │UserDetailsService│ │
│ │ - doFilterInternal│ │ - loadUserByUsername │
│ └──────────────────┘ └──────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────┘

text

## Fluxo 1: Registro de Usuário

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ POST /api/auth/register │
│ { │
│ "nome": "João Silva", │
│ "email": "joao@example.com", │
│ "senha": "senha123" │
│ } │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ AuthController │ │
│ │ - register() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Valida dados │
│ │ │
│ ┌────────▼─────────┐ │
│ │ UsuarioService │ │
│ │ - criarUsuario() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 2. Verifica email │
│ │ duplicado │
│ │ │
│ ┌────────▼─────────┐ │
│ │UsuarioRepository │ │
│ │- findByEmail() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 3. Hash senha │
│ │ (Argon2) │
│ │ │
│ │ 4. Salva usuário │
│ ┌────────▼─────────┐ │
│ │ PostgreSQL │ │
│ │ INSERT INTO │ │
│ │ usuarios │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 5. Gera JWT │
│ ┌────────▼─────────┐ │
│ │ JwtTokenProvider │ │
│ │- generateToken() │ │
│ └────────┬─────────┘ │
│ │ │
│ HTTP 201 Created │
│ { │
│ "token": "eyJhbGci...", │
│ "refreshToken": "eyJhbGci...", │
│ "tipo": "Bearer", │
│ "expiresIn": 86400000, │
│ "usuario": { │
│ "id": 1, │
│ "nome": "João Silva", │
│ "email": "joao@example.com" │
│ } │
│ } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Fluxo 2: Login

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ POST /api/auth/login │
│ { │
│ "email": "joao@example.com", │
│ "senha": "senha123" │
│ } │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ AuthController │ │
│ │ - login() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Cria token │
│ │ de autenticação │
│ ┌────────▼─────────┐ │
│ │AuthenticationMgr │ │
│ │- authenticate() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 2. Busca usuário │
│ ┌────────▼─────────┐ │
│ │UserDetailsService│ │
│ │-loadUserByUsername │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │UsuarioRepository │ │
│ │- findByEmail() │ │
│ └────────┬─────────┘ │
│ │ │
│ ┌────────▼─────────┐ │
│ │ PostgreSQL │ │
│ │ SELECT * FROM │ │
│ │ usuarios │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 3. Verifica senha │
│ │ (Argon2) │
│ │ │
│ ┌─────────────▼──────────┐ │
│ │ Senha válida? │ │
│ └──┬──────────────────┬──┘ │
│ │ │ │
│ SIM│ │NÃO │
│ │ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐ │
│ │ Gera JWT │ │ HTTP 401 │ │
│ │ JwtTokenProvider│ │ Unauthorized│ │
│ └────────┬────────┘ └─────────────┘ │
│ │ │
│ HTTP 200 OK │
│ { │
│ "token": "eyJhbGci...", │
│ "refreshToken": "eyJhbGci...", │
│ "tipo": "Bearer", │
│ "expiresIn": 86400000, │
│ "usuario": { ... } │
│ } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Fluxo 3: Requisição Autenticada

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ GET /api/despesas │
│ Headers: │
│ Authorization: Bearer eyJhbGci... │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ JwtAuthFilter │ │
│ │-doFilterInternal │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Extrai token │
│ │ do header │
│ │ │
│ ┌────────▼─────────┐ │
│ │ JwtTokenProvider │ │
│ │ - validateToken()│ │
│ └────────┬─────────┘ │
│ │ │
│ │ 2. Valida token │
│ │ - Assinatura │
│ │ - Expiração │
│ │ - Claims │
│ │ │
│ ┌─────────────▼──────────┐ │
│ │ Token válido? │ │
│ └──┬──────────────────┬──┘ │
│ │ │ │
│ SIM│ │NÃO │
│ │ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐ │
│ │ Extrai usuário │ │ HTTP 401 │ │
│ │ do token │ │ Unauthorized│ │
│ └────────┬────────┘ └─────────────┘ │
│ │ │
│ │ 3. Busca detalhes │
│ ┌────────▼────────┐ │
│ │UserDetailsService│ │
│ │-loadUserByUsername │
│ └────────┬────────┘ │
│ │ │
│ │ 4. Cria contexto │
│ │ de segurança │
│ ┌────────▼────────┐ │
│ │SecurityContext │ │
│ │-setAuthentication │
│ └────────┬────────┘ │
│ │ │
│ │ 5. Continua requisição │
│ ┌────────▼────────┐ │
│ │DespesaController│ │
│ │ - listar() │ │
│ └────────┬────────┘ │
│ │ │
│ │ 6. Processa request │
│ │ com usuário autenticado │
│ │ │
│ HTTP 200 OK │
│ { │
│ "content": [...], │
│ "page": 0, │
│ "totalElements": 50 │
│ } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Fluxo 4: Refresh Token

┌──────┐ ┌──────────┐
│Client│ │ Backend │
└──┬───┘ └────┬─────┘
│ │
│ POST /api/auth/refresh │
│ { │
│ "refreshToken": "eyJhbGci..." │
│ } │
├──────────────────────────────────────────────────────>│
│ │
│ ┌──────────────────┐ │
│ │ AuthController │ │
│ │ - refreshToken() │ │
│ └────────┬─────────┘ │
│ │ │
│ │ 1. Valida refresh │
│ │ token │
│ ┌────────▼─────────┐ │
│ │ JwtTokenProvider │ │
│ │ - validateToken()│ │
│ └────────┬─────────┘ │
│ │ │
│ ┌─────────────▼──────────┐ │
│ │ Token válido? │ │
│ └──┬──────────────────┬──┘ │
│ │ │ │
│ SIM│ │NÃO │
│ │ │ │
│ ┌────────▼────────┐ ┌──────▼──────┐ │
│ │ Gera novo JWT │ │ HTTP 401 │ │
│ │ e refresh token │ │ Unauthorized│ │
│ └────────┬────────┘ └─────────────┘ │
│ │ │
│ HTTP 200 OK │
│ { │
│ "token": "eyJhbGci...", │
│ "refreshToken": "eyJhbGci...", │
│ "tipo": "Bearer", │
│ "expiresIn": 86400000 │
│ } │
│<──────────────────────────────────────────────────────┤
│ │

text

## Estrutura do JWT Token

{
"header": {
"alg": "HS512",
"typ": "JWT"
},
"payload": {
"sub": "joao@example.com",
"userId": 1,
"nome": "João Silva",
"authorities": ["ROLE_USER"],
"iat": 1699370400,
"exp": 1699456800
},
"signature": "HMACSHA512(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}

text

## Configurações de Segurança

### Tempo de Expiração
- **Access Token**: 24 horas (86400000 ms)
- **Refresh Token**: 7 dias (604800000 ms)

### Algoritmo
- **HS512** (HMAC with SHA-512)

### Secret Key
- Mínimo 256 bits
- Armazenado em variável de ambiente: `JWT_SECRET`

## Tratamento de Erros

| Código | Cenário | Resposta |
|--------|---------|----------|
| 401 | Token inválido ou expirado | `{"message": "Token inválido ou expirado"}` |
| 401 | Token não fornecido | `{"message": "Token de autenticação não fornecido"}` |
| 401 | Credenciais inválidas | `{"message": "Email ou senha inválidos"}` |
| 403 | Sem permissão | `{"message": "Acesso negado"}` |
| 409 | Email já cadastrado | `{"message": "Email já cadastrado"}` |

## Boas Práticas Implementadas

1. **Tokens Stateless**: Não armazena sessão no servidor
2. **Refresh Token**: Permite renovação sem re-autenticação
3. **Argon2 Hash**: Algoritmo de hash mais seguro que BCrypt
4. **HTTPS Only**: Tokens só transmitidos via HTTPS em produção
5. **CORS Configurado**: Apenas origens permitidas
6. **Rate Limiting**: Proteção contra brute force
7. **Password Policy**: Mínimo 8 caracteres
8. **Token no Header**: `Authorization: Bearer {token}`

## Referências

- JWT Specification: RFC 7519
- Spring Security Documentation
- OWASP Authentication Cheat Sheet [web:22][web:24][web:26]
