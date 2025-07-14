# Wallet AI Backend 💰

API REST para gerenciamento financeiro pessoal construída com NestJS, TypeORM e PostgreSQL.

## 🚀 Funcionalidades

- ✅ **Autenticação com Firebase** - JWT tokens para segurança
- ✅ **Gestão de Usuários** - Perfis de usuário sincronizados com Firebase
- ✅ **Gestão de Despesas** - CRUD completo com categorização
- ✅ **Gestão de Receitas** - Controle de rendas com períodos
- ✅ **Categorias** - Sistema de categorização de despesas
- ✅ **Documentação Swagger** - API completamente documentada
- ✅ **Validação de Dados** - DTOs com class-validator
- ✅ **Tratamento de Erros** - Respostas padronizadas e logs
- ✅ **Health Check** - Endpoint para monitoramento

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

```
http://localhost:3001/api/docs
```

## 🛠️ Tecnologias

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: Firebase Admin SDK
- **Documentação**: Swagger/OpenAPI
- **Validação**: Class Validator
- **Logs**: Pino
- **Testes**: Jest

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- Conta Firebase configurada

## 🔧 Instalação e Configuração

1. **Clone o repositório**

```bash
git clone <repo-url>
cd wallet-backend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

4. **Execute as migrações**

```bash
npm run typeorm migration:run
```

5. **Inicie o servidor**

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🔗 Endpoints Principais

### Health Check

- `GET /api/v1/health` - Status da aplicação

### Usuários

- `GET /api/v1/users/me` - Perfil do usuário
- `PATCH /api/v1/users/me` - Atualizar perfil
- `DELETE /api/v1/users/me` - Deletar conta

### Despesas

- `POST /api/v1/expenses` - Criar despesa
- `GET /api/v1/expenses` - Listar despesas
- `GET /api/v1/expenses/categories` - Despesas por categoria
- `PATCH /api/v1/expenses/:id` - Atualizar despesa
- `DELETE /api/v1/expenses/:id` - Deletar despesa

### Receitas

- `POST /api/v1/incomes` - Criar receita
- `GET /api/v1/incomes` - Listar receitas
- `PATCH /api/v1/incomes/:id` - Atualizar receita
- `DELETE /api/v1/incomes/:id` - Deletar receita

### Categorias

- `GET /api/v1/categories` - Listar categorias

## 🔐 Autenticação

A API utiliza JWT tokens do Firebase. Inclua o token no header:

```
Authorization: Bearer <firebase-jwt-token>
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📝 Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento com hot reload
npm run start:debug    # Debug mode
npm run build          # Build para produção
npm run lint           # Linting
npm run format         # Formatação de código
npm run typeorm        # CLI do TypeORM
```

## 🌐 Frontend Integration

Esta API está preparada para conectar com o frontend através de:

- **CORS configurado** para o domínio do frontend
- **Respostas padronizadas** com estrutura consistente
- **Documentação Swagger** para facilitar a integração
- **Tipos TypeScript** bem definidos nos DTOs

## 📊 Estrutura de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true,
  "data": "...",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

Para erros:

```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```
