# Documentação de Segurança do Banco de Dados

> **Última atualização:** 13 de Novembro de 2025
> **Versão:** 2.0
> **Status:** ✅ Todas as vulnerabilidades críticas corrigidas

## Índice

1. [Visão Geral](#visão-geral)
2. [Políticas RLS (Row Level Security)](#políticas-rls)
3. [Funções com Search Path](#funções-com-search-path)
4. [Views SECURITY DEFINER](#views-security-definer)
5. [Auditoria e Monitoramento](#auditoria-e-monitoramento)
6. [Histórico de Correções](#histórico-de-correções)

---

## Visão Geral

O banco de dados Supabase do projeto **dudufisio-AI** implementa múltiplas camadas de segurança:

- **RLS (Row Level Security):** Habilitado em todas as tabelas públicas
- **Search Path Seguro:** Configurado em 52 funções PostgreSQL
- **Views Documentadas:** 3 views SECURITY DEFINER com justificativas
- **Perfis de Acesso:** admin, therapist, manager, secretary, patient

### Status de Segurança

| Categoria | Status | Detalhes |
|-----------|--------|----------|
| RLS em Tabelas Públicas | ✅ 100% | Todas as tabelas têm RLS habilitado |
| Funções com search_path | ✅ 52/52 | 100% das funções protegidas |
| Views SECURITY DEFINER | ⚠️ 3 views | Documentadas e justificadas |
| Políticas RLS Documentadas | ✅ Sim | Ver seção abaixo |

---

## Políticas RLS (Row Level Security)

### Tabelas com RLS Habilitado

#### 1. clinical_materials
**Proteção:** Materiais clínicos educacionais

**Políticas:**
- **SELECT:** Todos usuários autenticados podem visualizar
- **INSERT/UPDATE/DELETE:** Apenas admin, therapist, manager

```sql
-- Leitura
CREATE POLICY "Authenticated users can view clinical materials"
  ON clinical_materials FOR SELECT TO authenticated
  USING (true);

-- Escrita
CREATE POLICY "Admins and therapists can manage clinical materials"
  ON clinical_materials FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'therapist', 'manager')
  ));
```

#### 2. clinical_material_categories
**Proteção:** Categorias de materiais clínicos

**Políticas:**
- **SELECT:** Todos usuários autenticados
- **ALL:** Apenas admins

```sql
-- Leitura
CREATE POLICY "Authenticated users can view categories"
  ON clinical_material_categories FOR SELECT TO authenticated
  USING (true);

-- Escrita
CREATE POLICY "Admins can manage categories"
  ON clinical_material_categories FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));
```

#### 3. evolution_templates
**Proteção:** Templates de evolução clínica

**Políticas:**
- **SELECT:** Proprietário OU terapeuta/admin/manager
- **INSERT:** Terapeutas podem criar (próprio therapist_id)
- **UPDATE:** Proprietário OU admin
- **DELETE:** Proprietário OU admin

```sql
-- Leitura
CREATE POLICY "Therapists can view evolution templates"
  ON evolution_templates FOR SELECT TO authenticated
  USING (
    therapist_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'therapist', 'manager')
    )
  );

-- Escrita
CREATE POLICY "Therapists can create evolution templates"
  ON evolution_templates FOR INSERT TO authenticated
  WITH CHECK (
    therapist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'therapist', 'manager')
    )
  );
```

#### 4. session_evolutions
**Proteção:** Evoluções de sessões de atendimento

**Políticas:**
- **SELECT:** Terapeuta responsável OU admin
- **INSERT:** Terapeuta/admin/manager
- **UPDATE:** Terapeuta responsável OU admin
- **DELETE:** Apenas admin

```sql
-- Políticas existentes desde migração 20251022000001
```

#### 5. notifications
**Proteção:** Notificações de usuários

**Políticas:**
- **SELECT:** Apenas próprias notificações
- **UPDATE:** Apenas próprias notificações (marcar como lida)
- **DELETE:** Apenas próprias notificações
- **INSERT:** Service role OU admin/terapeuta

```sql
-- Usuários veem apenas suas notificações
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Funções com Search Path

### Por que `SET search_path = public`?

Funções sem `search_path` definido podem ser vulneráveis a **ataques de search path poisoning**, onde um atacante poderia criar objetos maliciosos em outros schemas para interceptar chamadas de função.

### Funções Corrigidas (52 total)

#### Funções de Autenticação (5 funções)
**Criticidade:** 🔴 ALTA

- `handle_new_user()` - Cria usuário após signup
- `is_admin()` - Verifica se usuário é admin
- `is_therapist()` - Verifica se usuário é terapeuta
- `is_staff()` - Verifica se usuário é staff
- `get_user_role()` - Retorna role do usuário

**Status:** ✅ Corrigido em 13/11/2025

#### Funções de Timestamp (9 funções)
**Criticidade:** 🟡 MÉDIA

Funções que atualizam `updated_at` automaticamente via triggers:

- `update_body_map_pain_regions_updated_at()`
- `update_body_map_sessions_updated_at()`
- `update_patient_messages_updated_at()`
- `update_push_tokens_updated_at()`
- `update_session_evolutions_updated_at()`
- `update_teleconsultas_updated_at()`
- `update_updated_at()`
- `update_updated_at_column()`
- `update_whatsapp_prefs_updated_at()`

**Status:** ✅ Corrigido em 13/11/2025

#### Funções de Negócio (10 funções)
**Criticidade:** 🟠 ALTA

**Pagamentos:**
- `create_payment()` - Cria novo pagamento
- `update_payment_status()` - Atualiza status de pagamento
- `process_refund()` - Processa reembolso

**Estoque:**
- `update_stock_after_movement()` - Atualiza estoque
- `check_and_create_low_stock_alert()` - Alerta de estoque baixo
- `generate_order_number()` - Gera número de pedido

**Agendamentos:**
- `check_appointment_conflict()` - Verifica conflitos
- `get_therapist_availability()` - Disponibilidade do terapeuta
- `request_appointment()` - Solicita agendamento
- `respond_appointment_request()` - Responde solicitação

**Status:** ✅ Corrigido em 13/11/2025

#### Funções de Notificações (8 funções)
**Criticidade:** 🟡 MÉDIA

- `cleanup_old_notifications()` - Limpa notificações antigas
- `create_notification()` - Cria notificação
- `get_user_messages()` - Busca mensagens do usuário
- `mark_all_notifications_read()` - Marca todas como lidas
- `mark_message_read()` - Marca mensagem como lida
- `mark_notification_read()` - Marca notificação como lida
- `send_patient_message()` - Envia mensagem para paciente
- `update_whatsapp_message_status()` - Atualiza status WhatsApp

**Status:** ✅ Corrigido em 13/11/2025

#### Funções Auxiliares (20 funções)
**Criticidade:** 🟡 MÉDIA

**Teleconsulta:**
- `create_teleconsulta()`, `start_teleconsulta()`, `end_teleconsulta()`, `cancel_teleconsulta()`

**Controle de Acesso:**
- `create_patient_access_code()`, `validate_access_code()`, `generate_access_code()`

**Estatísticas:**
- `get_exercise_statistics()`, `get_financial_summary()`, `update_patient_stats()`

**Outros:**
- `clean_old_push_tokens()`, `has_permission()`, `increment_material_download()`,
- `increment_template_usage()`, `soft_delete_user()`, `trigger_update_stats()`,
- `update_last_login()`, `update_patient_activity()`, `get_unread_count()`, `get_user_teleconsultas()`

**Status:** ✅ Corrigido em 13/11/2025

---

## Views SECURITY DEFINER

### Por que usar SECURITY DEFINER?

Views com `SECURITY DEFINER` executam com as permissões do criador da view, não do usuário que a consulta. Isso permite:
- Agregação de dados de múltiplas tabelas com RLS diferentes
- Visões consolidadas que requerem bypass controlado de RLS
- Simplificação de queries complexas

⚠️ **ATENÇÃO:** Deve ser usado com cautela, pois pode expor dados sensíveis se mal configurado.

### 1. v_active_prescriptions
**Propósito:** Consolida prescrições de exercícios ativos com dados de pacientes e terapeutas

**Justificativa SECURITY DEFINER:**
- Faz JOIN entre 4 tabelas: `patient_exercise_prescriptions`, `patients`, `therapists`, `users`
- Cada tabela tem políticas RLS diferentes
- SECURITY DEFINER necessário para agregação cross-table
- View é **READ-ONLY** (SELECT apenas)

**Segurança Implementada:**
- Filtra apenas prescrições ativas (`status = 'active'`)
- Exclui registros deletados (`deleted_at IS NULL`)
- Respeita data de validade (`end_date >= CURRENT_DATE`)

**Uso Recomendado:**
- Dashboard de terapeutas para visualizar prescrições ativas
- Relatórios de acompanhamento de pacientes
- API endpoints que precisam de visão consolidada

### 2. v_financial_monthly_summary
**Propósito:** Agrega transações financeiras por mês

**Justificativa SECURITY DEFINER:**
- Agrega dados financeiros sensíveis (receitas, despesas, lucro)
- Realiza cálculos complexos de agregação mensal
- SECURITY DEFINER permite bypass controlado de RLS para agregação
- View é **READ-ONLY** (SELECT apenas)

**Segurança Implementada:**
- Filtra apenas transações completadas (`status = 'completed'`)
- Exclui transações deletadas (`deleted_at IS NULL`)
- Agregação por mês impede acesso a transações individuais
- Ordenação DESC garante dados mais recentes primeiro

**Uso Recomendado:**
- Dashboard financeiro administrativo
- Relatórios mensais de receitas/despesas
- Análise de lucratividade por período

⚠️ **ATENÇÃO:** Contém dados financeiros sensíveis. Acesso deve ser restrito a roles admin/manager.

### 3. patient_insights_summary
**Propósito:** Agrega insights médicos por paciente

**Justificativa SECURITY DEFINER:**
- Agrega dados médicos sensíveis (`medical_insights`)
- Sumariza insights por severidade (success, warning, error)
- SECURITY DEFINER necessário para agregação de dados clínicos
- View é **READ-ONLY** (SELECT apenas)

**Segurança Implementada:**
- Agrega apenas contadores (sem expor texto dos insights)
- Agrupa por `patient_id` (controle de acesso por paciente)
- View não expõe conteúdo detalhado dos insights
- Útil para dashboards sem expor detalhes médicos

**Dados Incluídos:**
- `total_insights`: Total de insights gerados
- `success_count`: Insights positivos (ex: melhora)
- `warning_count`: Insights de atenção
- `error_count`: Insights críticos
- `pain_insights`: Insights sobre redução de dor
- `milestones`: Marcos importantes do tratamento
- `last_insight_date`: Data do último insight

---

## Auditoria e Monitoramento

### Verificação de Segurança (Supabase Advisors)

Execute regularmente para identificar problemas:

```bash
# Via Supabase CLI
npx supabase db advisors --type security
npx supabase db advisors --type performance
```

### Logs a Monitorar

1. **Tentativas de acesso negadas por RLS**
2. **Execuções de funções SECURITY DEFINER**
3. **Queries em views SECURITY DEFINER**
4. **Mudanças em políticas RLS**

### Alertas Recomendados

- ⚠️ Múltiplas tentativas de acesso negadas pelo mesmo usuário
- ⚠️ Acesso a views financeiras fora do horário comercial
- ⚠️ Alterações em funções de autenticação
- ⚠️ Criação/modificação de políticas RLS

---

## Histórico de Correções

### 2025-11-13 - Correção Completa de Segurança

**Problemas Corrigidos:**

1. ✅ **RLS Desabilitado (3 tabelas - CRÍTICO)**
   - `clinical_materials`
   - `clinical_material_categories`
   - Políticas criadas para `evolution_templates`

2. ✅ **Funções sem search_path (52 funções - WARN)**
   - 5 funções de autenticação
   - 9 funções de timestamp
   - 10 funções de negócio
   - 8 funções de notificações
   - 20 funções auxiliares

3. ✅ **Views SECURITY DEFINER (3 views - WARN)**
   - Documentadas com justificativas
   - Comentários adicionados no banco
   - Recomendações de uso documentadas

**Migrações Aplicadas:**
- `20251113100000_fix_security_issues.sql` - RLS e funções críticas
- `20251113110000_add_search_path_to_all_functions.sql` - 47 funções
- `20251113120000_document_security_definer_views.sql` - Documentação

**Resultado:**
- 🎯 **Zero vulnerabilidades críticas**
- 🎯 **100% das funções protegidas**
- 🎯 **Todas as tabelas com RLS habilitado**

---

## Melhores Práticas

### Ao Criar Novas Tabelas

1. **SEMPRE habilite RLS:**
   ```sql
   ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;
   ```

2. **Crie políticas apropriadas:**
   ```sql
   CREATE POLICY "nome_descritivo"
     ON nova_tabela
     FOR SELECT
     TO authenticated
     USING (condicao_seguranca);
   ```

### Ao Criar Novas Funções

1. **SEMPRE adicione search_path:**
   ```sql
   CREATE FUNCTION nova_funcao()
   RETURNS tipo
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     -- código
   END;
   $$;
   ```

2. **Documente a função:**
   ```sql
   COMMENT ON FUNCTION nova_funcao() IS 'Descrição clara do propósito';
   ```

### Ao Criar Novas Views

1. **Evite SECURITY DEFINER se possível**
2. **Se necessário, documente CLARAMENTE a justificativa**
3. **Limite aos dados estritamente necessários**
4. **Sempre use SELECT apenas (read-only)**

---

## Contato e Suporte

Para questões de segurança, contate:
- **Email:** security@dudufisio.com
- **Equipe:** DevOps / Database Team

---

**Documento mantido por:** DevOps Team
**Revisão:** Trimestral
**Próxima Revisão:** Fevereiro 2026
