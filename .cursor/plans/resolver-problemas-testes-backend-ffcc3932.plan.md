<!-- ffcc3932-71a2-432a-9357-d31e5171e66d 90eab46d-70cb-4526-9a30-46b38e367bd4 -->
# Plano: Resolver Problemas de Testes Backend

## Objetivo

Resolver os problemas identificados no relatório de testes do backend, criando rotas de API REST que permitam testes automatizados enquanto mantém a arquitetura atual com Server Actions.

## Estratégia

Criar rotas de API wrapper que chamam os Server Actions existentes, mantendo compatibilidade com o frontend e permitindo testes externos.

## Tarefas

### 1. Criar Rotas de API para Pacientes

**Arquivo:** `src/app/api/patients/route.ts`

- GET: Listar pacientes com filtros (chama Server Action)
- POST: Criar paciente (chama `createPatient` de `src/lib/actions/patients.ts`)
- Validação de CPF, email e telefone
- Tratamento de erros adequado

**Arquivo:** `src/app/api/patients/[id]/route.ts`

- GET: Buscar paciente por ID
- PUT: Atualizar paciente (chama `updatePatient`)
- DELETE: Soft delete paciente

### 2. Criar Rotas de API para Autenticação

**Arquivo:** `src/app/api/auth/login/route.ts`

- POST: Login com email/password (wrapper para Server Action de login)
- Retorna JWT token ou erro apropriado
- Suporta autenticação Supabase

### 3. Criar Rotas de API para Agendamentos

**Arquivo:** `src/app/api/appointments/route.ts`

- GET: Listar agendamentos com filtros (chama `getAppointments`)
- POST: Criar agendamento
- Suporte a notificações automáticas

**Arquivo:** `src/app/api/appointments/[id]/route.ts`

- GET: Buscar agendamento específico
- PUT: Atualizar agendamento
- DELETE: Cancelar agendamento

### 4. Criar Rotas de API para Tratamentos/Documentos Clínicos

**Arquivo:** `src/app/api/treatments/route.ts`

- GET: Listar tratamentos
- POST: Criar tratamento/sessão

**Arquivo:** `src/app/api/treatments/[id]/route.ts`

- GET: Buscar tratamento específico
- PUT: Atualizar tratamento (SOAP notes)
- POST: Gerar documento clínico com IA

### 5. Criar Rotas de API para Relatórios

**Arquivo:** `src/app/api/reports/route.ts`

- GET: Listar relatórios disponíveis
- POST: Gerar relatório (financeiro ou clínico)
- Suporte a exportação PDF/Excel

**Arquivo:** `src/app/api/reports/[type]/route.ts`

- GET: Gerar relatório específico (financial, clinical, operational)

### 6. Criar Rotas de API para Auditoria

**Arquivo:** `src/app/api/audit/route.ts`

- GET: Listar logs de auditoria com filtros
- Query params: user_id, action_type, date_from, date_to
- Retorna logs formatados para compliance LGPD

### 7. Melhorar Endpoints de Cron para Testes

**Arquivo:** `src/app/api/cron/backup-database/route.ts`

- Adicionar modo de teste que não requer CRON_SECRET em ambiente de desenvolvimento
- Verificar `NODE_ENV` ou variável `TEST_MODE`

**Arquivo:** `src/app/api/cron/lembretes-diarios/route.ts`

- Mesma melhoria: suportar modo de teste

### 8. Criar Middleware de Autenticação Reutilizável

**Arquivo:** `src/lib/api/middleware.ts`

- Função para validar autenticação Supabase
- Função para validar tokens de teste
- Suporte a diferentes tipos de autenticação

### 9. Configurar Variáveis de Ambiente para Testes

**Arquivo:** `.env.example` ou documentação

- `CRON_SECRET` para produção
- `TEST_MODE=true` para ambiente de testes
- `TEST_API_KEY` opcional para testes automatizados

### 10. Criar Documentação de Rotas de API

**Arquivo:** `docs/API_ROUTES.md`

- Lista completa de todas as rotas de API
- Métodos HTTP suportados
- Parâmetros de query e body
- Exemplos de requisições e respostas
- Requisitos de autenticação para cada rota

### 11. Atualizar Endpoint de Health Check

**Arquivo:** `src/app/api/test-fase7/route.ts`

- Manter funcionalidade existente
- Adicionar informações sobre rotas disponíveis
- Incluir status de autenticação

## Arquivos a Modificar/Criar

**Novos arquivos:**

- `src/app/api/patients/route.ts`
- `src/app/api/patients/[id]/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/appointments/route.ts`
- `src/app/api/appointments/[id]/route.ts`
- `src/app/api/treatments/route.ts`
- `src/app/api/treatments/[id]/route.ts`
- `src/app/api/reports/route.ts`
- `src/app/api/reports/[type]/route.ts`
- `src/app/api/audit/route.ts`
- `src/lib/api/middleware.ts`
- `docs/API_ROUTES.md`

**Arquivos a modificar:**

- `src/app/api/cron/backup-database/route.ts` (adicionar modo teste)
- `src/app/api/cron/lembretes-diarios/route.ts` (adicionar modo teste)
- `src/app/api/test-fase7/route.ts` (melhorar documentação)

## Considerações

1. **Compatibilidade:** Manter Server Actions para uso do frontend, criar API routes apenas para testes externos
2. **Autenticação:** Suportar tanto autenticação Supabase quanto tokens de teste
3. **Validação:** Reutilizar validações existentes dos Server Actions
4. **Erros:** Retornar erros HTTP apropriados (400, 401, 404, 500)
5. **Documentação:** Criar documentação clara para facilitar testes futuros

### To-dos

- [ ] Criar rotas de API para pacientes (GET, POST, PUT, DELETE) em src/app/api/patients/
- [ ] Criar rota de API para autenticação (POST /api/auth/login)
- [ ] Criar rotas de API para agendamentos (GET, POST, PUT, DELETE) em src/app/api/appointments/
- [ ] Criar rotas de API para tratamentos e documentos clínicos em src/app/api/treatments/
- [ ] Criar rotas de API para relatórios e exportação em src/app/api/reports/
- [ ] Criar rota de API para logs de auditoria em src/app/api/audit/
- [ ] Melhorar endpoints de cron para suportar modo de teste sem CRON_SECRET
- [ ] Criar middleware reutilizável de autenticação em src/lib/api/middleware.ts
- [ ] Criar documentação completa de todas as rotas de API em docs/API_ROUTES.md