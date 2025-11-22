# API Routes - FisioFlow

Documentação completa de todas as rotas de API REST disponíveis no sistema FisioFlow.

## 📋 Índice

- [Autenticação](#autenticação)
- [Pacientes](#pacientes)
- [Agendamentos](#agendamentos)
- [Tratamentos/Sessões](#tratamentossessões)
- [Relatórios](#relatórios)
- [Auditoria](#auditoria)
- [Cron Jobs](#cron-jobs)
- [Health Check](#health-check)

---

## 🔐 Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem autenticação.

### Métodos de Autenticação

1. **Supabase Auth** (Produção)
   - Cookies de sessão do Supabase
   - Configurado automaticamente após login

2. **Test Token** (Desenvolvimento)
   - Header: `Authorization: Bearer <TEST_API_KEY>`
   - Ativo quando `TEST_MODE=true` ou `NODE_ENV=development`

---

## 🔑 Autenticação

### POST /api/auth/login

Autentica usuário e retorna sessão.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "user_metadata": {}
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_at": 1234567890
    }
  }
}
```

**Erros:**
- `400`: Email/senha inválidos
- `401`: Credenciais incorretas

---

### GET /api/auth/login

Verifica status de autenticação atual.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com"
    }
  }
}
```

**Erros:**
- `401`: Não autenticado

---

## 👤 Pacientes

### GET /api/patients

Lista pacientes com filtros opcionais.

**Query Params:**
- `search` (string): Busca por nome, email, telefone, CPF
- `status` (string): Filtro por status
- `limit` (number): Quantidade de resultados (padrão: 50)
- `offset` (number): Paginação (padrão: 0)

**Exemplo:**
```
GET /api/patients?search=João&limit=10&offset=0
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "patients": [...],
    "count": 100,
    "pagination": {
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### POST /api/patients

Cria novo paciente.

**Body:**
```json
{
  "full_name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "birth_date": "1990-01-15",
  "gender": "male",
  "address": {
    "street": "Rua Principal",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01234-567"
  },
  "emergency_contact": {
    "name": "Maria Silva",
    "phone": "(11) 99999-8888",
    "relationship": "Esposa"
  },
  "notes": "Observações adicionais"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "João Silva",
    ...
  }
}
```

**Erros:**
- `400`: Dados inválidos
- `400`: CPF já cadastrado
- `400`: Email já cadastrado

---

### GET /api/patients/[id]

Busca paciente por ID.

**Exemplo:**
```
GET /api/patients/123e4567-e89b-12d3-a456-426614174000
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "João Silva",
    "email": "joao@exemplo.com",
    ...
  }
}
```

**Erros:**
- `404`: Paciente não encontrado

---

### PUT /api/patients/[id]

Atualiza dados do paciente.

**Body:** (todos os campos são opcionais)
```json
{
  "full_name": "João da Silva",
  "phone": "(11) 98765-0000",
  "notes": "Novas observações"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

**Erros:**
- `404`: Paciente não encontrado
- `400`: Dados inválidos

---

### DELETE /api/patients/[id]

Deleta paciente (soft delete).

**Exemplo:**
```
DELETE /api/patients/123e4567-e89b-12d3-a456-426614174000
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "message": "Paciente deletado com sucesso",
    "id": "uuid"
  }
}
```

**Erros:**
- `404`: Paciente não encontrado

---

## 📅 Agendamentos

### GET /api/appointments

Lista agendamentos com filtros.

**Query Params:**
- `startDate` (string ISO): Data inicial
- `endDate` (string ISO): Data final
- `therapistId` (uuid): Filtro por fisioterapeuta
- `resourceId` (uuid): Filtro por recurso
- `status` (string): scheduled, confirmed, completed, cancelled, no_show

**Exemplo:**
```
GET /api/appointments?startDate=2025-01-01&endDate=2025-01-31&status=scheduled
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [...],
    "count": 25,
    "filters": {...}
  }
}
```

---

### POST /api/appointments

Cria novo agendamento.

**Body:**
```json
{
  "patient_id": "uuid",
  "therapist_id": "uuid",
  "start_time": "2025-01-15T14:00:00Z",
  "end_time": "2025-01-15T15:00:00Z",
  "service_type": "Fisioterapia",
  "status": "scheduled",
  "notes": "Primeira consulta",
  "send_notification": false
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    ...
  }
}
```

**Erros:**
- `400`: Dados inválidos
- `404`: Paciente não encontrado
- `409`: Conflito de horário

---

### GET /api/appointments/[id]

Busca agendamento por ID.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patients": {
      "full_name": "João Silva",
      ...
    },
    "therapists": {
      "full_name": "Dr. Pedro",
      ...
    },
    ...
  }
}
```

---

### PUT /api/appointments/[id]

Atualiza agendamento.

**Body:** (campos opcionais)
```json
{
  "start_time": "2025-01-15T15:00:00Z",
  "end_time": "2025-01-15T16:00:00Z",
  "status": "confirmed",
  "notes": "Confirmado pelo paciente"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### DELETE /api/appointments/[id]

Cancela agendamento.

**Query Params:**
- `reason` (string): Motivo do cancelamento (opcional)

**Exemplo:**
```
DELETE /api/appointments/uuid?reason=Paciente solicitou
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "message": "Agendamento cancelado com sucesso",
    "appointment": {...}
  }
}
```

---

## 🏥 Tratamentos/Sessões

### GET /api/treatments

Lista sessões/evoluções de um paciente.

**Query Params (obrigatório):**
- `patient_id` (uuid): ID do paciente
- `limit` (number): Quantidade de resultados (padrão: 10)

**Exemplo:**
```
GET /api/treatments?patient_id=uuid&limit=20
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "count": 15,
    "patient_id": "uuid"
  }
}
```

---

### POST /api/treatments

Cria nova sessão/evolução.

**Body:**
```json
{
  "patient_id": "uuid",
  "therapist_id": "uuid",
  "treatment_id": "uuid",
  "appointment_id": "uuid",
  "session_number": 1,
  "session_date": "2025-01-15T14:00:00Z",
  "subjective": "Paciente relata dor lombar...",
  "objective": "Amplitude de movimento reduzida...",
  "assessment": "Lombalgia mecânica...",
  "plan": "Continuar com exercícios de fortalecimento...",
  "conducts": {
    "exercises": ["Ponte", "Prancha"],
    "equipment": ["Bola suíça"]
  },
  "pain_level": 5
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

### GET /api/treatments/[id]

Busca sessão por ID.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "patients": {
      "full_name": "João Silva"
    },
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "...",
    ...
  }
}
```

---

### PUT /api/treatments/[id]

Atualiza sessão (SOAP notes).

**Body:** (campos opcionais)
```json
{
  "subjective": "Paciente relata melhora significativa...",
  "objective": "Amplitude de movimento aumentada...",
  "assessment": "Evolução positiva...",
  "plan": "Reduzir frequência para 2x semana...",
  "pain_level": 3
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### POST /api/treatments/[id]/generate-document

Gera documento clínico com IA.

**Body:**
```json
{
  "document_type": "evolution",
  "include_history": false,
  "custom_instructions": "Incluir recomendações detalhadas"
}
```

**Tipos de documento:**
- `evolution`: Evolução fisioterapêutica
- `prescription`: Prescrição fisioterapêutica
- `report`: Relatório de sessão
- `certificate`: Atestado de comparecimento

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "document_type": "evolution",
    "content": "EVOLUÇÃO FISIOTERAPÊUTICA\n\n...",
    "generated_at": "2025-01-15T14:00:00Z",
    "session_id": "uuid"
  }
}
```

---

## 📊 Relatórios

### GET /api/reports

Lista tipos de relatórios disponíveis.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "type": "financial",
        "name": "Relatório Financeiro",
        "description": "Receitas, despesas, fluxo de caixa",
        "endpoint": "/api/reports/financial"
      },
      ...
    ],
    "count": 4
  }
}
```

---

### POST /api/reports

Gera relatório customizado.

**Body:**
```json
{
  "type": "financial",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "format": "json",
  "filters": {
    "therapist_id": "uuid"
  }
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "type": "financial",
    "period": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    },
    "generated_at": "2025-01-15T14:00:00Z",
    "data": {...}
  }
}
```

---

### GET /api/reports/[type]

Gera relatório específico.

**Tipos disponíveis:**
- `financial`: Relatório financeiro
- `clinical`: Relatório clínico
- `operational`: Relatório operacional
- `executive`: Dashboard executivo (KPIs)

**Query Params:**
- `start_date` (string ISO): Data inicial (padrão: 30 dias atrás)
- `end_date` (string ISO): Data final (padrão: hoje)
- `therapist_id` (uuid): Filtro por fisioterapeuta
- `patient_id` (uuid): Filtro por paciente

**Exemplos:**
```
GET /api/reports/financial?start_date=2025-01-01&end_date=2025-01-31
GET /api/reports/clinical?therapist_id=uuid
GET /api/reports/operational
GET /api/reports/executive
```

**Resposta Financial (200):**
```json
{
  "success": true,
  "data": {
    "type": "financial",
    "period": {...},
    "data": {
      "summary": {
        "total_income": 50000,
        "total_expenses": 15000,
        "net_profit": 35000,
        "profit_margin": 70
      },
      "transactions": {
        "income_count": 45,
        "expenses_count": 12
      },
      "invoices": {
        "total_count": 50,
        "paid_count": 40,
        "pending_count": 8,
        "overdue_count": 2,
        "total_paid": 48000,
        "total_pending": 8000,
        "total_overdue": 2000
      }
    }
  }
}
```

**Resposta Clinical (200):**
```json
{
  "data": {
    "summary": {
      "total_sessions": 120,
      "unique_patients": 35,
      "sessions_with_complete_soap": 100,
      "documentation_rate": 83
    },
    "pain_statistics": {
      "average_pain_level": 4.5,
      "max_pain_level": 9,
      "min_pain_level": 1,
      "sessions_with_pain_data": 115
    },
    "soap_completion": {
      "with_subjective": 118,
      "with_objective": 115,
      "with_assessment": 110,
      "with_plan": 112
    }
  }
}
```

**Resposta Operational (200):**
```json
{
  "data": {
    "summary": {
      "total_appointments": 150,
      "scheduled": 30,
      "confirmed": 25,
      "completed": 85,
      "cancelled": 8,
      "no_show": 2
    },
    "rates": {
      "occupancy_rate": 57,
      "no_show_rate": 1,
      "cancellation_rate": 5,
      "completion_rate": 57
    },
    "by_therapist": [
      {
        "therapist_id": "uuid",
        "total": 50,
        "completed": 45,
        "cancelled": 3,
        "noShow": 2,
        "occupancy_rate": 90
      }
    ]
  }
}
```

**Resposta Executive (200):**
```json
{
  "data": {
    "active_patients": 120,
    "appointment_occupancy": 75,
    "monthly_revenue": 85000,
    "no_show_rate": 2,
    "nps_score": 9,
    "active_treatments": 65,
    "completed_sessions_today": 12
  }
}
```

---

## 🔍 Auditoria

### GET /api/audit

Lista logs de auditoria com filtros (conformidade LGPD).

**Query Params:**
- `user_id` (uuid): Filtro por usuário
- `action_type` (string): create, update, delete, login, logout
- `entity_type` (string): patient, appointment, session
- `date_from` (string ISO): Data inicial
- `date_to` (string ISO): Data final
- `limit` (number): Quantidade (padrão: 100, máx: 1000)
- `offset` (number): Paginação (padrão: 0)

**Exemplos:**
```
GET /api/audit?action_type=delete&date_from=2025-01-01
GET /api/audit?user_id=uuid&limit=50
GET /api/audit?entity_type=patient&action_type=update
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "timestamp": "2025-01-15T14:00:00Z",
        "user_id": "uuid",
        "user_email": "usuario@exemplo.com",
        "action_type": "update",
        "entity_type": "patient",
        "entity_id": "uuid",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "changes": {
          "phone": {
            "old": "(11) 99999-9999",
            "new": "(11) 88888-8888"
          }
        },
        "metadata": {}
      }
    ],
    "count": 50,
    "stats": {
      "total_logs": 500,
      "filtered_logs": 50,
      "actions_by_type": {
        "create": 20,
        "update": 25,
        "delete": 5
      },
      "entities_by_type": {
        "patient": 30,
        "appointment": 15,
        "session": 5
      }
    },
    "pagination": {
      "limit": 100,
      "offset": 0,
      "hasMore": false
    },
    "lgpd_compliance": {
      "status": "active",
      "retention_period_days": 365,
      "anonymization_enabled": true
    },
    "filters_applied": {
      "user_id": null,
      "action_type": "update",
      "entity_type": "patient",
      "date_from": null,
      "date_to": null
    }
  }
}
```

**Notas de Segurança:**
- Campos sensíveis são automaticamente redacted: `[REDACTED]`
- Logs incluem: password, cpf, credit_card, bank_account, token, secret

---

## ⏰ Cron Jobs

### GET /api/cron/backup-database

Executa backup do banco de dados.

**Autenticação:**
- Produção: `Authorization: Bearer <CRON_SECRET>`
- Desenvolvimento: Não requer (TEST_MODE=true)

**Resposta (200):**
```json
{
  "success": true,
  "backup_id": "uuid",
  "type": "incremental",
  "stats": {
    "tables_backed_up": 15,
    "rows_backed_up": 5000
  },
  "duration_ms": 2500,
  "timestamp": "2025-01-15T02:00:00Z",
  "test_mode": false
}
```

---

### GET /api/cron/lembretes-diarios

Envia lembretes e notificações diárias.

**Autenticação:**
- Produção: `Authorization: Bearer <CRON_SECRET>`
- Desenvolvimento: Não requer (TEST_MODE=true)

**Resposta (200):**
```json
{
  "success": true,
  "test_mode": false,
  "reminders": {
    "sent": 15,
    "error": null
  },
  "birthdays": {
    "sent": 3,
    "error": null
  }
}
```

---

## ❤️ Health Check

### GET /api/test-fase7

Health check e testes do sistema.

**Query Param:**
- `test` (string): Tipo de teste a executar

**Testes disponíveis:**
- `health`: Status de saúde do sistema
- `performance`: Métricas de performance
- `error`: Testes de error tracking
- `all`: Todos os testes acima
- `routes`: Lista todas as rotas disponíveis

**Exemplos:**
```
GET /api/test-fase7?test=health
GET /api/test-fase7?test=routes
GET /api/test-fase7?test=all
```

**Resposta routes (200):**
```json
{
  "success": true,
  "data": {
    "total_routes": 24,
    "routes": [
      {
        "method": "POST",
        "path": "/api/auth/login",
        "description": "Autenticação de usuário"
      },
      ...
    ],
    "authentication": {
      "required": true,
      "methods": ["Supabase Auth", "Test Token (development)"],
      "test_mode_enabled": true
    },
    "documentation": "/docs/API_ROUTES.md"
  }
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente

**Obrigatórias (Produção):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
CRON_SECRET=seu-secret-para-cron-jobs
```

**Opcionais (Desenvolvimento/Testes):**
```env
TEST_MODE=true
TEST_API_KEY=sua-chave-de-teste-opcional
NODE_ENV=development
```

---

## 📝 Padrões de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {...}
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

### Códigos HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autenticado
- `404`: Recurso não encontrado
- `409`: Conflito (ex: horário duplicado)
- `500`: Erro interno do servidor
- `501`: Não implementado

---

## 🧪 Testando as Rotas

### Com cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}'
```

**Listar Pacientes:**
```bash
curl -X GET "http://localhost:3000/api/patients?limit=10" \
  -H "Authorization: Bearer <token ou test-token>"
```

**Criar Paciente:**
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "full_name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "birth_date": "1990-01-15"
  }'
```

---

## 📚 Recursos Adicionais

- **Relatório de Testes Backend**: [testsprite_tests/testsprite-mcp-backend-test-report.md](../testsprite_tests/testsprite-mcp-backend-test-report.md)
- **Middleware de Autenticação**: [src/lib/api/middleware.ts](../src/lib/api/middleware.ts)
- **Server Actions**: [src/lib/actions/](../src/lib/actions/)

---

**Última atualização**: 2025-01-15
**Versão da API**: 1.0.0
