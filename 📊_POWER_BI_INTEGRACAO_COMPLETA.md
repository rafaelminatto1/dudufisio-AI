# 📊 POWER BI - INTEGRAÇÃO COMPLETA

**Data:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🎯 GUIA DE IMPLEMENTAÇÃO

---

## 🎯 VISÃO GERAL

Guia completo para integração do Power BI com o sistema DuduFisio AI, incluindo:
- Conexão direta com Supabase
- Dashboards embarcados no sistema
- Modelo dimensional otimizado
- Atualização automática de dados
- Row-Level Security (RLS)

---

## 📋 ÍNDICE

1. [Arquitetura de Dados](#arquitetura-de-dados)
2. [Modelo Dimensional](#modelo-dimensional)
3. [Conexão Supabase → Power BI](#conexão-supabase--power-bi)
4. [Dashboards Power BI](#dashboards-power-bi)
5. [Power BI Embedded](#power-bi-embedded)
6. [Segurança e RLS](#segurança-e-rls)
7. [Refresh Automático](#refresh-automático)
8. [Medidas DAX](#medidas-dax)
9. [Implementação no React](#implementação-no-react)

---

## 1. ARQUITETURA DE DADOS

### 1.1 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│  Tabelas Operacionais (OLTP):                              │
│  - patients                                                 │
│  - appointments                                             │
│  - sessions                                                 │
│  - financial_transactions                                   │
│  - users (therapists)                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ ETL / Views Materializadas
                   ▼
┌─────────────────────────────────────────────────────────────┐
│            DATA WAREHOUSE (OLAP - Views)                    │
├─────────────────────────────────────────────────────────────┤
│  Tabelas Dimensão:                                          │
│  - dim_patients                                             │
│  - dim_therapists                                           │
│  - dim_date                                                 │
│  - dim_time                                                 │
│                                                             │
│  Tabelas Fato:                                              │
│  - fato_sessions                                            │
│  - fato_financial                                           │
│  - fato_clinical_outcomes                                   │
│  - fato_appointments                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Direct Query / Import
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     POWER BI SERVICE                        │
├─────────────────────────────────────────────────────────────┤
│  Datasets:                                                  │
│  - DuduFisio_Main (modelo completo)                        │
│  - DuduFisio_Financial (financeiro)                        │
│  - DuduFisio_Clinical (clínico)                            │
│                                                             │
│  Dashboards:                                                │
│  - Dashboard Executivo                                      │
│  - Dashboard Financeiro                                     │
│  - Dashboard Operacional                                    │
│  - Dashboard Clínico                                        │
│  - Dashboard de Pacientes                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Embed API / REST API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   REACT APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  - <PowerBIEmbed /> - Embed de dashboards                  │
│  - <BIDashboard /> - Controles e filtros                   │
│  - <ReportViewer /> - Visualizador de relatórios           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. MODELO DIMENSIONAL

### 2.1 Schema Estrela (Star Schema)

```sql
-- ============================================================================
-- DIMENSÃO: PACIENTES
-- ============================================================================

CREATE OR REPLACE VIEW dim_patients AS
SELECT 
  p.id as patient_key,
  p.code as patient_code,
  p.name as patient_name,
  p.email,
  p.cpf,
  p.gender,
  p.age,
  CASE 
    WHEN p.age < 18 THEN 'Menor de 18'
    WHEN p.age BETWEEN 18 AND 30 THEN '18-30'
    WHEN p.age BETWEEN 31 AND 45 THEN '31-45'
    WHEN p.age BETWEEN 46 AND 60 THEN '46-60'
    ELSE 'Acima de 60'
  END as age_group,
  p.marital_status,
  p.occupation,
  p.status as patient_status,
  p.insurance->>'type' as insurance_type,
  p.insurance->>'provider' as insurance_provider,
  p.address->>'city' as city,
  p.address->>'state' as state,
  p.registration_date,
  p.first_appointment_date,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) as current_age,
  CASE 
    WHEN p.tags IS NOT NULL AND 'vip' = ANY(p.tags) THEN true 
    ELSE false 
  END as is_vip,
  p.main_diagnosis,
  p.referring_doctor
FROM patients p
WHERE p.deleted_at IS NULL;

-- ============================================================================
-- DIMENSÃO: TERAPEUTAS
-- ============================================================================

CREATE OR REPLACE VIEW dim_therapists AS
SELECT 
  u.id as therapist_key,
  u.name as therapist_name,
  u.email,
  u.specialty,
  u.registration_number,
  u.status,
  u.hire_date,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.hire_date)) as years_of_service,
  u.photo_url,
  CASE 
    WHEN u.is_active THEN 'Ativo'
    ELSE 'Inativo'
  END as activity_status
FROM users u
WHERE u.role = 'Therapist' AND u.deleted_at IS NULL;

-- ============================================================================
-- DIMENSÃO: DATA
-- ============================================================================

CREATE OR REPLACE VIEW dim_date AS
SELECT 
  date::date as date_key,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(QUARTER FROM date) as quarter,
  EXTRACT(MONTH FROM date) as month,
  TO_CHAR(date, 'TMMonth') as month_name,
  TO_CHAR(date, 'Mon') as month_short,
  EXTRACT(WEEK FROM date) as week_of_year,
  EXTRACT(DOW FROM date) as day_of_week,
  TO_CHAR(date, 'TMDay') as day_name,
  TO_CHAR(date, 'Dy') as day_short,
  EXTRACT(DAY FROM date) as day_of_month,
  CASE WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN true ELSE false END as is_weekend,
  CASE 
    WHEN date IN (
      SELECT holiday_date FROM holidays
    ) THEN true 
    ELSE false 
  END as is_holiday,
  TO_CHAR(date, 'YYYY-MM') as year_month,
  TO_CHAR(date, 'YYYY-Q') as year_quarter,
  CASE 
    WHEN EXTRACT(MONTH FROM date) IN (1,2,3) THEN 'Q1'
    WHEN EXTRACT(MONTH FROM date) IN (4,5,6) THEN 'Q2'
    WHEN EXTRACT(MONTH FROM date) IN (7,8,9) THEN 'Q3'
    ELSE 'Q4'
  END as quarter_name
FROM generate_series(
  '2020-01-01'::date,
  '2030-12-31'::date,
  '1 day'::interval
) as date;

-- ============================================================================
-- DIMENSÃO: HORA
-- ============================================================================

CREATE OR REPLACE VIEW dim_time AS
SELECT 
  time::time as time_key,
  EXTRACT(HOUR FROM time) as hour,
  EXTRACT(MINUTE FROM time) as minute,
  TO_CHAR(time, 'HH24:MI') as time_formatted,
  TO_CHAR(time, 'HH12:MI AM') as time_12h,
  CASE 
    WHEN EXTRACT(HOUR FROM time) BETWEEN 6 AND 11 THEN 'Manhã'
    WHEN EXTRACT(HOUR FROM time) BETWEEN 12 AND 17 THEN 'Tarde'
    WHEN EXTRACT(HOUR FROM time) BETWEEN 18 AND 23 THEN 'Noite'
    ELSE 'Madrugada'
  END as period_of_day
FROM generate_series(
  '00:00'::time,
  '23:59'::time,
  '15 minutes'::interval
) as time;

-- ============================================================================
-- FATO: SESSÕES
-- ============================================================================

CREATE OR REPLACE VIEW fato_sessions AS
SELECT 
  s.id as session_key,
  s.patient_id as patient_key,
  s.therapist_id as therapist_key,
  s.appointment_id,
  s.session_date::date as date_key,
  s.session_time::time as time_key,
  
  -- Métricas numéricas
  s.duration_minutes,
  s.pain_level_before,
  s.pain_level_after,
  s.pain_level_before - s.pain_level_after as pain_reduction,
  CASE 
    WHEN s.pain_level_before > 0 THEN 
      ((s.pain_level_before - s.pain_level_after)::NUMERIC / s.pain_level_before::NUMERIC * 100)
    ELSE 0 
  END as pain_improvement_pct,
  s.mobility_score,
  s.functionality_score,
  s.satisfaction_score,
  s.amount_charged,
  s.amount_paid,
  s.amount_charged - s.amount_paid as amount_pending,
  
  -- Dimensões e flags
  s.session_type,
  s.status,
  s.no_show,
  s.cancellation_reason,
  s.payment_status,
  
  -- Contadores
  CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END as sessions_completed,
  CASE WHEN s.status = 'cancelled' THEN 1 ELSE 0 END as sessions_cancelled,
  CASE WHEN s.no_show THEN 1 ELSE 0 END as sessions_no_show,
  CASE WHEN s.payment_status = 'paid' THEN 1 ELSE 0 END as sessions_paid,
  
  -- Metadata
  s.created_at,
  s.updated_at
FROM sessions s
WHERE s.deleted_at IS NULL;

-- ============================================================================
-- FATO: FINANCEIRO
-- ============================================================================

CREATE OR REPLACE VIEW fato_financial AS
SELECT 
  t.id as transaction_key,
  t.patient_id as patient_key,
  t.session_id,
  t.transaction_date::date as date_key,
  
  -- Métricas financeiras
  t.amount,
  CASE 
    WHEN t.transaction_type = 'payment' THEN t.amount 
    ELSE 0 
  END as revenue,
  CASE 
    WHEN t.transaction_type = 'refund' THEN t.amount 
    ELSE 0 
  END as refund,
  CASE 
    WHEN t.status = 'pending' THEN t.amount 
    ELSE 0 
  END as accounts_receivable,
  CASE 
    WHEN t.status = 'overdue' THEN t.amount 
    ELSE 0 
  END as overdue_amount,
  
  -- Classificações
  t.transaction_type,
  t.payment_method,
  t.status,
  t.category,
  t.due_date,
  t.paid_date,
  CASE 
    WHEN t.paid_date IS NOT NULL AND t.due_date IS NOT NULL 
    THEN (t.paid_date::date - t.due_date::date) 
    ELSE NULL 
  END as days_to_payment,
  CASE 
    WHEN t.paid_date > t.due_date THEN 'Atrasado'
    WHEN t.paid_date <= t.due_date THEN 'Em Dia'
    WHEN t.status = 'pending' AND CURRENT_DATE > t.due_date THEN 'Vencido'
    ELSE 'Pendente'
  END as payment_status_detailed,
  
  -- Contadores
  1 as transaction_count,
  CASE WHEN t.status = 'paid' THEN 1 ELSE 0 END as paid_count,
  CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END as pending_count,
  CASE WHEN t.status = 'overdue' THEN 1 ELSE 0 END as overdue_count,
  
  -- Metadata
  t.created_at,
  t.notes
FROM financial_transactions t
WHERE t.deleted_at IS NULL;

-- ============================================================================
-- FATO: OUTCOMES CLÍNICOS
-- ============================================================================

CREATE OR REPLACE VIEW fato_clinical_outcomes AS
SELECT 
  p.id as patient_key,
  p.registration_date::date as registration_date_key,
  p.first_appointment_date::date as first_appointment_date_key,
  COALESCE(p.last_appointment_date, CURRENT_DATE)::date as last_appointment_date_key,
  
  -- Métricas de sessões
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'cancelled') as cancelled_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.no_show = true) as no_show_sessions,
  CASE 
    WHEN COUNT(DISTINCT s.id) > 0 THEN
      (COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::NUMERIC / COUNT(DISTINCT s.id)::NUMERIC * 100)
    ELSE 0 
  END as adherence_rate,
  
  -- Métricas clínicas
  AVG(s.pain_level_before) as avg_pain_before,
  AVG(s.pain_level_after) as avg_pain_after,
  AVG(s.pain_level_before - s.pain_level_after) as avg_pain_reduction,
  AVG(s.mobility_score) as avg_mobility,
  AVG(s.functionality_score) as avg_functionality,
  AVG(s.satisfaction_score) as avg_satisfaction,
  
  -- Métricas de melhora
  CASE 
    WHEN AVG(s.pain_level_before) > 0 THEN
      ((AVG(s.pain_level_before) - AVG(s.pain_level_after)) / AVG(s.pain_level_before) * 100)
    ELSE 0 
  END as pain_improvement_pct,
  
  -- Métricas temporais
  EXTRACT(DAY FROM (COALESCE(p.last_appointment_date, CURRENT_DATE) - p.first_appointment_date)) as days_in_treatment,
  EXTRACT(DAY FROM (COALESCE(p.last_appointment_date, CURRENT_DATE) - p.first_appointment_date)) / 7.0 as weeks_in_treatment,
  CASE 
    WHEN EXTRACT(DAY FROM (COALESCE(p.last_appointment_date, CURRENT_DATE) - p.first_appointment_date)) > 0 THEN
      COUNT(DISTINCT s.id)::NUMERIC / (EXTRACT(DAY FROM (COALESCE(p.last_appointment_date, CURRENT_DATE) - p.first_appointment_date)) / 7.0)
    ELSE 0 
  END as sessions_per_week,
  
  -- Métricas financeiras
  SUM(ft.amount) FILTER (WHERE ft.status = 'paid') as total_revenue,
  SUM(ft.amount) FILTER (WHERE ft.status = 'pending') as total_pending,
  AVG(s.amount_charged) as avg_session_cost,
  
  -- Status do paciente
  p.status as current_status,
  p.main_diagnosis,
  
  -- Classificações
  CASE 
    WHEN AVG(s.satisfaction_score) >= 9 THEN 'Promotor'
    WHEN AVG(s.satisfaction_score) >= 7 THEN 'Neutro'
    ELSE 'Detrator'
  END as nps_category,
  
  CASE 
    WHEN COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') >= 
         (p.session_progress->>'totalPlannedSessions')::INTEGER * 0.8 
    THEN 'Alta Aderência'
    WHEN COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') >= 
         (p.session_progress->>'totalPlannedSessions')::INTEGER * 0.5 
    THEN 'Média Aderência'
    ELSE 'Baixa Aderência'
  END as adherence_classification
  
FROM patients p
LEFT JOIN sessions s ON s.patient_id = p.id
LEFT JOIN financial_transactions ft ON ft.patient_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.registration_date, p.first_appointment_date, p.last_appointment_date, 
         p.status, p.main_diagnosis, p.session_progress;

-- ============================================================================
-- FATO: AGENDAMENTOS
-- ============================================================================

CREATE OR REPLACE VIEW fato_appointments AS
SELECT 
  a.id as appointment_key,
  a.patient_id as patient_key,
  a.therapist_id as therapist_key,
  a.appointment_date::date as date_key,
  a.start_time::time as time_key,
  
  -- Métricas
  a.duration_minutes,
  1 as appointment_count,
  CASE WHEN a.status = 'scheduled' THEN 1 ELSE 0 END as scheduled_count,
  CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END as completed_count,
  CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END as cancelled_count,
  CASE WHEN a.no_show THEN 1 ELSE 0 END as no_show_count,
  
  -- Dimensões
  a.status,
  a.appointment_type,
  a.no_show,
  a.cancellation_reason,
  a.cancellation_time,
  CASE 
    WHEN a.cancellation_time IS NOT NULL AND a.appointment_date IS NOT NULL THEN
      EXTRACT(HOUR FROM (a.appointment_date - a.cancellation_time))
    ELSE NULL 
  END as hours_to_cancellation,
  
  -- Metadata
  a.notes,
  a.created_at,
  a.updated_at
FROM appointments a
WHERE a.deleted_at IS NULL;
```

---

## 3. CONEXÃO SUPABASE → POWER BI

### 3.1 Configurar Conexão PostgreSQL

No **Power BI Desktop**:

1. **Obter Dados** → **PostgreSQL database**

2. **Configurar conexão:**
   ```
   Server: db.[projeto-id].supabase.co
   Database: postgres
   Port: 5432
   
   Data Connectivity mode: DirectQuery (ou Import)
   ```

3. **Credenciais:**
   - Username: `postgres`
   - Password: [senha do banco Supabase]

4. **Avançado (opcional):**
   ```sql
   -- Executar query SQL personalizada
   SELECT * FROM dim_patients;
   SELECT * FROM fato_sessions WHERE session_date >= CURRENT_DATE - INTERVAL '90 days';
   ```

### 3.2 Configurar Connection String

Alternativa: usar string de conexão completa

```
Server=db.[projeto-id].supabase.co;
Database=postgres;
Port=5432;
User Id=postgres;
Password=[sua-senha];
SSL Mode=Require;
```

### 3.3 Import vs DirectQuery

**Import Mode** (Recomendado para dados históricos):
- ✅ Melhor performance
- ✅ Todas as funcionalidades DAX
- ❌ Requer refresh agendado
- ❌ Limite de tamanho (Pro: 10GB, Premium: 100GB+)

**DirectQuery** (Para dados em tempo real):
- ✅ Sempre atualizado
- ✅ Sem limite de tamanho
- ❌ Performance dependente do banco
- ❌ Limitações em DAX

**Recomendação**: Usar **Modo Misto** (Composite)
- Import para dimensões (mudam pouco)
- DirectQuery para fatos (dados recentes)

---

## 4. DASHBOARDS POWER BI

### 4.1 Dashboard Executivo

**KPIs Principais:**
```dax
// Receita Total
Receita Total = 
SUM(fato_financial[revenue])

// Receita vs Meta
Receita vs Meta = 
VAR ReceitaMeta = 100000 // Meta mensal
RETURN 
DIVIDE([Receita Total], ReceitaMeta, 0)

// Crescimento MoM
Crescimento MoM = 
VAR ReceitaMesAtual = [Receita Total]
VAR ReceitaMesAnterior = 
    CALCULATE(
        [Receita Total],
        DATEADD(dim_date[date_key], -1, MONTH)
    )
RETURN 
DIVIDE(ReceitaMesAtual - ReceitaMesAnterior, ReceitaMesAnterior, 0)

// Total de Pacientes Ativos
Pacientes Ativos = 
CALCULATE(
    DISTINCTCOUNT(dim_patients[patient_key]),
    dim_patients[patient_status] = "Active"
)

// Taxa de Ocupação
Taxa de Ocupação = 
VAR TotalSlots = 480 // 8 horas * 60 min = 480 slots de 15min por dia
VAR SlotsUsados = SUM(fato_sessions[duration_minutes]) / 15
RETURN 
DIVIDE(SlotsUsados, TotalSlots, 0)

// NPS Score
NPS = 
VAR Promotores = 
    CALCULATE(
        COUNTROWS(fato_clinical_outcomes),
        fato_clinical_outcomes[avg_satisfaction] >= 9
    )
VAR Detratores = 
    CALCULATE(
        COUNTROWS(fato_clinical_outcomes),
        fato_clinical_outcomes[avg_satisfaction] <= 6
    )
VAR Total = COUNTROWS(fato_clinical_outcomes)
RETURN 
(Promotores - Detratores) / Total * 100
```

**Visualizações:**
1. **Scorecard** - KPIs principais com semáforo
2. **Gráfico de Linha** - Tendência de receita (12 meses)
3. **Gráfico Waterfall** - Composição da receita
4. **Mapa** - Distribuição geográfica de pacientes
5. **Tabela** - Top 10 insights e alertas

### 4.2 Dashboard Financeiro

**Medidas DAX:**
```dax
// MRR (Monthly Recurring Revenue)
MRR = 
CALCULATE(
    [Receita Total],
    dim_date[month] = MONTH(TODAY()),
    dim_date[year] = YEAR(TODAY())
)

// ARR (Annual Recurring Revenue)
ARR = [MRR] * 12

// Taxa de Inadimplência
Taxa Inadimplência = 
DIVIDE(
    SUM(fato_financial[overdue_amount]),
    SUM(fato_financial[accounts_receivable]),
    0
)

// Ticket Médio
Ticket Médio = 
DIVIDE(
    SUM(fato_sessions[amount_charged]),
    COUNT(fato_sessions[session_key]),
    0
)

// Receita por Terapeuta
Receita por Terapeuta = 
DIVIDE(
    [Receita Total],
    DISTINCTCOUNT(dim_therapists[therapist_key]),
    0
)

// LTV (Lifetime Value)
LTV = 
DIVIDE(
    SUMX(
        VALUES(dim_patients[patient_key]),
        CALCULATE(SUM(fato_financial[revenue]))
    ),
    DISTINCTCOUNT(dim_patients[patient_key]),
    0
)
```

**Visualizações:**
1. **Gráfico de Área** - Receita e despesas ao longo do tempo
2. **Gráfico de Barras** - Top 10 pacientes por receita
3. **Funil** - Status de pagamentos
4. **Matriz** - Receita por método de pagamento e mês
5. **Cartões** - KPIs financeiros

### 4.3 Dashboard Clínico

**Medidas DAX:**
```dax
// Taxa de Melhora Clínica
Taxa de Melhora = 
AVERAGEX(
    fato_clinical_outcomes,
    fato_clinical_outcomes[pain_improvement_pct]
)

// Satisfação Média
Satisfação Média = 
AVERAGE(fato_clinical_outcomes[avg_satisfaction])

// Taxa de Alta
Taxa de Alta = 
DIVIDE(
    CALCULATE(
        COUNT(dim_patients[patient_key]),
        dim_patients[patient_status] = "Discharged"
    ),
    COUNT(dim_patients[patient_key]),
    0
)

// Taxa de Abandono (Churn)
Taxa de Abandono = 
VAR PacientesInicioMes = 
    CALCULATE(
        COUNT(dim_patients[patient_key]),
        DATEADD(dim_date[date_key], -1, MONTH)
    )
VAR PacientesAbandonaram = 
    CALCULATE(
        COUNT(dim_patients[patient_key]),
        dim_patients[patient_status] = "Inactive",
        dim_patients[last_appointment_date] >= DATEADD(TODAY(), -30, DAY)
    )
RETURN 
DIVIDE(PacientesAbandonaram, PacientesInicioMes, 0)

// Aderência Média
Aderência Média = 
AVERAGE(fato_clinical_outcomes[adherence_rate])
```

**Visualizações:**
1. **Gráfico de Linha** - Evolução de dor/mobilidade ao longo do tempo
2. **Gráfico de Barras** - Distribuição por diagnóstico
3. **Scatter Plot** - Melhora clínica vs número de sessões
4. **Histograma** - Distribuição de satisfação
5. **Tabela** - Pacientes com alertas (piora ou sem evolução)

---

## 5. POWER BI EMBEDDED

### 5.1 Configurar Azure Active Directory

1. **Registrar aplicação no Azure AD:**
   - Acesse [Azure Portal](https://portal.azure.com)
   - Azure Active Directory → App registrations → New registration
   - Nome: `DuduFisio-PowerBI-App`
   - Supported account types: Single tenant
   - Redirect URI: `https://[seu-dominio.com]/auth/callback`

2. **Configurar Permissões API:**
   ```
   Power BI Service → Report.Read.All
   Power BI Service → Dataset.Read.All
   Power BI Service → Dashboard.Read.All
   Power BI Service → Group.Read.All
   ```

3. **Gerar Client Secret:**
   - Certificates & secrets → New client secret
   - Salvar: `Client ID` e `Client Secret`

### 5.2 Service Layer - Power BI Integration

```typescript
// services/powerbi/powerBIService.ts

import { models } from 'powerbi-client';

interface PowerBIConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  workspaceId: string;
}

export class PowerBIService {
  private config: PowerBIConfig;
  private accessToken: string | null = null;
  
  constructor(config: PowerBIConfig) {
    this.config = config;
  }
  
  /**
   * Obter access token do Azure AD
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }
    
    const response = await fetch(
      `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'https://analysis.windows.net/powerbi/api/.default',
        }),
      }
    );
    
    const data = await response.json();
    this.accessToken = data.access_token;
    
    // Refresh token antes de expirar
    setTimeout(() => {
      this.accessToken = null;
    }, (data.expires_in - 300) * 1000); // 5 min antes
    
    return this.accessToken;
  }
  
  /**
   * Listar relatórios do workspace
   */
  async getReports(): Promise<any[]> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    return data.value;
  }
  
  /**
   * Obter embed token para relatório específico
   */
  async getEmbedToken(reportId: string, datasetId: string): Promise<{
    token: string;
    tokenId: string;
    expiration: string;
  }> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datasets: [{ id: datasetId }],
          reports: [{ id: reportId }],
          targetWorkspaces: [{ id: this.config.workspaceId }],
        }),
      }
    );
    
    return await response.json();
  }
  
  /**
   * Obter configuração de embed para relatório
   */
  async getEmbedConfig(reportId: string): Promise<{
    type: string;
    embedUrl: string;
    accessToken: string;
    tokenType: models.TokenType;
    settings: any;
  }> {
    // Buscar detalhes do relatório
    const reports = await this.getReports();
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
      throw new Error('Relatório não encontrado');
    }
    
    // Gerar embed token
    const embedToken = await this.getEmbedToken(reportId, report.datasetId);
    
    return {
      type: 'report',
      embedUrl: report.embedUrl,
      accessToken: embedToken.token,
      tokenType: models.TokenType.Embed,
      settings: {
        panes: {
          filters: {
            expanded: false,
            visible: true,
          },
        },
        background: models.BackgroundType.Transparent,
      },
    };
  }
  
  /**
   * Aplicar filtros dinâmicos ao relatório
   */
  async applyFilters(report: any, filters: {
    table: string;
    column: string;
    values: any[];
  }[]): Promise<void> {
    const powerbiFilters = filters.map(filter => ({
      $schema: 'http://powerbi.com/product/schema#basic',
      target: {
        table: filter.table,
        column: filter.column,
      },
      operator: 'In',
      values: filter.values,
      filterType: models.FilterType.BasicFilter,
    }));
    
    await report.setFilters(powerbiFilters);
  }
  
  /**
   * Exportar relatório para PDF
   */
  async exportToPDF(reportId: string, pageName?: string): Promise<Blob> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports/${reportId}/ExportTo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'PDF',
          powerBIReportConfiguration: pageName ? {
            pages: [{ pageName }],
          } : undefined,
        }),
      }
    );
    
    const exportJob = await response.json();
    
    // Polling para esperar exportação completar
    let status = 'Running';
    while (status === 'Running') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
      
      const statusResponse = await fetch(
        `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports/${reportId}/exports/${exportJob.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const statusData = await statusResponse.json();
      status = statusData.status;
      
      if (status === 'Succeeded') {
        // Download do arquivo
        const fileResponse = await fetch(
          `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/reports/${reportId}/exports/${exportJob.id}/file`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        return await fileResponse.blob();
      }
    }
    
    throw new Error('Falha ao exportar relatório');
  }
}

// Instância singleton
export const powerBIService = new PowerBIService({
  clientId: process.env.NEXT_PUBLIC_POWERBI_CLIENT_ID!,
  clientSecret: process.env.POWERBI_CLIENT_SECRET!,
  tenantId: process.env.POWERBI_TENANT_ID!,
  workspaceId: process.env.POWERBI_WORKSPACE_ID!,
});
```

---

## 6. IMPLEMENTAÇÃO NO REACT

### 6.1 Componente PowerBI Embed

```typescript
// components/powerbi/PowerBIEmbed.tsx

import React, { useEffect, useRef, useState } from 'react';
import { PowerBIEmbed as PowerBIEmbedSDK } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { powerBIService } from '@/services/powerbi/powerBIService';
import { Loader2 } from 'lucide-react';

interface PowerBIEmbedProps {
  reportId: string;
  filters?: {
    table: string;
    column: string;
    values: any[];
  }[];
  pageName?: string;
  onLoaded?: () => void;
  onError?: (error: any) => void;
}

export const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({
  reportId,
  filters,
  pageName,
  onLoaded,
  onError,
}) => {
  const [embedConfig, setEmbedConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef<any>(null);
  
  useEffect(() => {
    loadReport();
  }, [reportId]);
  
  useEffect(() => {
    if (reportRef.current && filters) {
      applyFilters();
    }
  }, [filters]);
  
  const loadReport = async () => {
    try {
      setIsLoading(true);
      const config = await powerBIService.getEmbedConfig(reportId);
      
      setEmbedConfig({
        ...config,
        ...(pageName && { pageName }),
      });
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = async () => {
    if (!reportRef.current || !filters) return;
    
    try {
      await powerBIService.applyFilters(reportRef.current, filters);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };
  
  const handleReportLoaded = () => {
    console.log('Relatório carregado com sucesso');
    onLoaded?.();
  };
  
  const handleReportError = (event: any) => {
    console.error('Erro no relatório:', event.detail);
    onError?.(event.detail);
  };
  
  if (isLoading || !embedConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }
  
  return (
    <div className="h-full w-full">
      <PowerBIEmbedSDK
        embedConfig={embedConfig}
        eventHandlers={
          new Map([
            ['loaded', handleReportLoaded],
            ['error', handleReportError],
            ['rendered', () => console.log('Relatório renderizado')],
          ])
        }
        cssClassName="powerbi-embed-container"
        getEmbeddedComponent={(embeddedReport) => {
          reportRef.current = embeddedReport;
        }}
      />
    </div>
  );
};
```

### 6.2 Dashboard com Power BI

```typescript
// components/powerbi/BIDashboard.tsx

import React, { useState } from 'react';
import { PowerBIEmbed } from './PowerBIEmbed';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, Filter } from 'lucide-react';
import { powerBIService } from '@/services/powerbi/powerBIService';

export const BIDashboard: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('executive-dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [isExporting, setIsExporting] = useState(false);
  
  const reports = [
    { id: 'executive-dashboard', name: 'Dashboard Executivo', reportId: 'abc-123' },
    { id: 'financial-dashboard', name: 'Dashboard Financeiro', reportId: 'def-456' },
    { id: 'clinical-dashboard', name: 'Dashboard Clínico', reportId: 'ghi-789' },
    { id: 'operational-dashboard', name: 'Dashboard Operacional', reportId: 'jkl-012' },
  ];
  
  const currentReport = reports.find(r => r.id === selectedReport);
  
  const handleExportPDF = async () => {
    if (!currentReport) return;
    
    setIsExporting(true);
    try {
      const blob = await powerBIService.exportToPDF(currentReport.reportId);
      
      // Download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentReport.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const getFilters = () => {
    // Calcular datas baseado no período selecionado
    const endDate = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'last-7-days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last-30-days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last-90-days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'this-year':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
    }
    
    return [
      {
        table: 'dim_date',
        column: 'date_key',
        values: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
      },
    ];
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reports.map(report => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
                <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
                <SelectItem value="last-90-days">Últimos 90 dias</SelectItem>
                <SelectItem value="this-year">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Relatório */}
      <div className="flex-1 bg-slate-50 p-4">
        <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
          {currentReport && (
            <PowerBIEmbed
              reportId={currentReport.reportId}
              filters={getFilters()}
              onLoaded={() => console.log('Dashboard carregado')}
              onError={(error) => console.error('Erro no dashboard:', error)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 7. REFRESH AUTOMÁTICO

### 7.1 Configurar Gateway de Dados

1. **Instalar Power BI Gateway:**
   - Download: [Power BI Gateway](https://powerbi.microsoft.com/pt-br/gateway/)
   - Instalar no servidor que tem acesso ao Supabase

2. **Configurar Source de Dados:**
   - Power BI Service → Settings → Manage gateways
   - Add data source → PostgreSQL
   - Server: `db.[projeto-id].supabase.co:5432`
   - Database: `postgres`
   - Authentication: Username/Password

3. **Agendar Refresh:**
   - Power BI Service → Dataset settings → Scheduled refresh
   - Frequency: Daily, 8x per day (a cada 3 horas)
   - Time zones: (GMT-03:00) Brasília

### 7.2 Refresh via API

```typescript
// services/powerbi/refreshService.ts

export class PowerBIRefreshService {
  /**
   * Trigger refresh manual de dataset
   */
  async refreshDataset(datasetId: string): Promise<void> {
    const token = await powerBIService.getAccessToken();
    
    await fetch(
      `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/refreshes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  /**
   * Verificar status de refresh
   */
  async getRefreshStatus(datasetId: string): Promise<any[]> {
    const token = await powerBIService.getAccessToken();
    
    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/refreshes?$top=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    return data.value;
  }
}

export const refreshService = new PowerBIRefreshService();
```

---

## 8. ROW-LEVEL SECURITY (RLS)

### 8.1 Configurar RLS no Power BI

**Modelo de Segurança:**

```dax
// Role: Therapist
// Filtro: Dim_Therapists

[therapist_email] = USERPRINCIPALNAME()

// Role: Admin
// Sem filtros (vê tudo)

// Role: Patient
// Filtro: Dim_Patients

[email] = USERPRINCIPALNAME()
```

### 8.2 Implementar RLS Dinâmico

```typescript
// services/powerbi/rlsService.ts

export class RLSService {
  /**
   * Gerar embed token com RLS aplicado
   */
  async getEmbedTokenWithRLS(
    reportId: string,
    datasetId: string,
    userEmail: string,
    userRole: string
  ): Promise<string> {
    const token = await powerBIService.getAccessToken();
    
    const response = await fetch(
      `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datasets: [{
            id: datasetId,
            ...(userRole !== 'Admin' && {
              roles: [userRole],
              username: userEmail,
            }),
          }],
          reports: [{ id: reportId }],
        }),
      }
    );
    
    const data = await response.json();
    return data.token;
  }
}

export const rlsService = new RLSService();
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Preparação (1 semana)
- [ ] Criar views dimensionais no Supabase
- [ ] Validar modelo de dados
- [ ] Documentar KPIs e métricas
- [ ] Configurar Azure AD app registration

### Fase 2: Power BI Desktop (1 semana)
- [ ] Conectar Power BI ao Supabase
- [ ] Criar modelo de dados (relacionamentos)
- [ ] Desenvolver medidas DAX
- [ ] Criar 5 dashboards principais
- [ ] Configurar RLS (roles e filtros)
- [ ] Testar e validar relatórios

### Fase 3: Power BI Service (3 dias)
- [ ] Publicar datasets no workspace
- [ ] Publicar dashboards
- [ ] Configurar gateway de dados
- [ ] Agendar refresh automático
- [ ] Testar RLS em produção

### Fase 4: Integração React (1 semana)
- [ ] Implementar PowerBIService
- [ ] Criar componente PowerBIEmbed
- [ ] Criar BIDashboard
- [ ] Implementar filtros dinâmicos
- [ ] Implementar exportação PDF
- [ ] Testes de integração

### Fase 5: Deploy e Monitoramento (3 dias)
- [ ] Deploy em ambiente de staging
- [ ] Testes de usuários
- [ ] Deploy em produção
- [ ] Monitoramento de performance
- [ ] Documentação para usuários

---

## 📊 MÉTRICAS DE SUCESSO

- 🎯 Dashboards carregando em < 3 segundos
- 🎯 Refresh automático funcionando 100%
- 🎯 RLS funcionando corretamente por usuário
- 🎯 Exportação PDF em < 10 segundos
- 🎯 Satisfação dos usuários > 4.5/5
- 🎯 10+ dashboards publicados e em uso ativo

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Criar views dimensionais no Supabase
2. ✅ Conectar Power BI Desktop ao banco
3. ✅ Desenvolver primeiro dashboard (Executivo)
4. ✅ Publicar no Power BI Service
5. ✅ Configurar refresh automático
6. ✅ Implementar embed no React
7. ✅ Deploy e testes

---

**Última Atualização:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🟢 GUIA COMPLETO

