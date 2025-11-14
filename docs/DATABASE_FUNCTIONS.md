# Documentação de Funções do Banco de Dados

> **Última atualização:** 13 de Novembro de 2025
> **Total de Funções:** 52 funções PostgreSQL
> **Status de Segurança:** ✅ 100% com search_path configurado

## Índice

1. [Funções de Autenticação](#funções-de-autenticação)
2. [Funções de Timestamp](#funções-de-timestamp)
3. [Funções de Negócio](#funções-de-negócio)
4. [Funções de Notificações](#funções-de-notificações)
5. [Funções Auxiliares](#funções-auxiliares)
6. [Padrões e Convenções](#padrões-e-convenções)

---

## Funções de Autenticação

### handle_new_user()
**Tipo:** Trigger Function
**Security:** SECURITY DEFINER, search_path = public

**Descrição:** Executado automaticamente quando um novo usuário se registra via Supabase Auth. Cria registro correspondente na tabela `users`.

**Trigger:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Comportamento:**
- Cria usuário com role padrão 'patient'
- Copia email e nome completo dos metadados
- Usa ID do auth.users como chave primária

---

### is_admin()
**Retorna:** BOOLEAN
**Security:** SECURITY DEFINER, search_path = public

**Descrição:** Verifica se o usuário atual é administrador.

**Uso:**
```sql
SELECT is_admin(); -- true ou false
```

**Exemplo em RLS:**
```sql
CREATE POLICY "Admins can do anything"
  ON some_table FOR ALL
  USING (is_admin());
```

---

### is_therapist()
**Retorna:** BOOLEAN
**Security:** SECURITY DEFINER, search_path = public

**Descrição:** Verifica se o usuário é terapeuta, manager ou admin.

**Roles aceitos:** 'therapist', 'manager', 'admin'

**Uso:**
```sql
SELECT is_therapist(); -- true ou false
```

---

### is_staff()
**Retorna:** BOOLEAN
**Security:** SECURITY DEFINER, search_path = public

**Descrição:** Verifica se o usuário é parte da equipe (staff).

**Roles aceitos:** 'admin', 'therapist', 'manager', 'secretary'

**Uso:**
```sql
SELECT is_staff(); -- true ou false
```

---

### get_user_role()
**Retorna:** TEXT
**Security:** SECURITY DEFINER, search_path = public

**Descrição:** Retorna o role do usuário atual.

**Valores possíveis:** 'admin', 'therapist', 'manager', 'secretary', 'patient', NULL

**Uso:**
```sql
SELECT get_user_role(); -- retorna 'admin', 'therapist', etc.
```

---

## Funções de Timestamp

Todas as funções abaixo são **Trigger Functions** que atualizam automaticamente a coluna `updated_at` quando um registro é modificado.

**Security:** SET search_path = public
**Padrão:** BEFORE UPDATE FOR EACH ROW

### Lista de Funções de Timestamp

1. **update_body_map_pain_regions_updated_at()**
   - Tabela: `body_map_pain_regions`

2. **update_body_map_sessions_updated_at()**
   - Tabela: `body_map_sessions`

3. **update_patient_messages_updated_at()**
   - Tabela: `patient_messages`

4. **update_push_tokens_updated_at()**
   - Tabela: `push_notification_tokens`

5. **update_session_evolutions_updated_at()**
   - Tabela: `session_evolutions`

6. **update_teleconsultas_updated_at()**
   - Tabela: `teleconsultas`

7. **update_updated_at()**
   - Genérica, usada em múltiplas tabelas

8. **update_updated_at_column()**
   - Genérica, usada em múltiplas tabelas

9. **update_whatsapp_prefs_updated_at()**
   - Tabela: `whatsapp_preferences`

**Exemplo de Implementação:**
```sql
CREATE TRIGGER trigger_name
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_table_name_updated_at();
```

---

## Funções de Negócio

### Pagamentos

#### create_payment()
**Parâmetros:**
- `p_patient_id` UUID
- `p_appointment_id` UUID
- `p_amount` NUMERIC
- `p_payment_method` TEXT
- `p_description` TEXT
- `p_metadata` JSONB

**Retorna:** UUID (ID do pagamento criado)
**Security:** SET search_path = public

**Descrição:** Cria um novo registro de pagamento com validações.

**Exemplo:**
```sql
SELECT create_payment(
  'patient-uuid',
  'appointment-uuid',
  150.00,
  'credit_card',
  'Consulta fisioterapia',
  '{"transaction_id": "tx_123"}'::jsonb
);
```

---

#### update_payment_status()
**Parâmetros:**
- `p_payment_id` UUID
- `p_status` TEXT
- `p_provider_response` JSONB

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Atualiza status do pagamento e registra resposta do provedor.

**Status válidos:** 'pending', 'completed', 'failed', 'refunded'

---

#### process_refund()
**Parâmetros:**
- `p_payment_id` UUID
- `p_amount` NUMERIC
- `p_reason` TEXT

**Retorna:** BOOLEAN (sucesso)
**Security:** SET search_path = public

**Descrição:** Processa reembolso total ou parcial de um pagamento.

**Validações:**
- Verifica se pagamento existe e está 'completed'
- Valida que amount não excede valor pago
- Atualiza status para 'refunded'

---

### Estoque

#### update_stock_after_movement()
**Tipo:** Trigger Function
**Security:** SET search_path = public

**Descrição:** Atualiza quantidade em estoque após movimentação (entrada/saída).

**Trigger:** Executado em `stock_movements` AFTER INSERT

---

#### check_and_create_low_stock_alert()
**Tipo:** Trigger Function
**Security:** SET search_path = public

**Descrição:** Verifica estoque baixo e cria alerta automático se necessário.

**Trigger:** Executado após atualização de estoque

---

#### generate_order_number()
**Retorna:** TEXT
**Security:** SET search_path = public

**Descrição:** Gera número único de pedido no formato: ORD-YYYYMMDD-XXXX

**Exemplo:**
```sql
SELECT generate_order_number(); -- 'ORD-20251113-0001'
```

---

### Agendamentos

#### check_appointment_conflict()
**Parâmetros:**
- `p_therapist_id` UUID
- `p_start_time` TIMESTAMPTZ
- `p_end_time` TIMESTAMPTZ
- `p_appointment_id` UUID (opcional)

**Retorna:** BOOLEAN (true se há conflito)
**Security:** SET search_path = public

**Descrição:** Verifica se há conflito de horário para o terapeuta.

**Uso:**
```sql
SELECT check_appointment_conflict(
  'therapist-uuid',
  '2025-11-14 10:00:00',
  '2025-11-14 11:00:00',
  NULL
); -- true/false
```

---

#### get_therapist_availability()
**Parâmetros:**
- `p_therapist_id` UUID
- `p_date` DATE

**Retorna:** TABLE (time_slot TEXT, available BOOLEAN)
**Security:** SET search_path = public

**Descrição:** Retorna disponibilidade do terapeuta em um dia específico.

**Exemplo:**
```sql
SELECT * FROM get_therapist_availability(
  'therapist-uuid',
  '2025-11-14'
);
-- time_slot | available
-- '09:00'   | true
-- '10:00'   | false
-- ...
```

---

#### request_appointment()
**Parâmetros:**
- `p_therapist_id` UUID
- `p_preferred_date` TIMESTAMPTZ
- `p_preferred_time_slot` TEXT
- `p_reason` TEXT
- `p_urgency` TEXT
- `p_alternative_dates` JSONB

**Retorna:** UUID (ID da solicitação)
**Security:** SET search_path = public

**Descrição:** Cria solicitação de agendamento que aguarda aprovação.

---

#### respond_appointment_request()
**Parâmetros:**
- `p_request_id` UUID
- `p_approved` BOOLEAN
- `p_approved_date` TIMESTAMPTZ
- `p_response_message` TEXT

**Retorna:** UUID (ID do appointment criado, se aprovado)
**Security:** SET search_path = public

**Descrição:** Responde solicitação de agendamento, aprovando ou recusando.

---

## Funções de Notificações

### create_notification()
**Parâmetros:**
- `p_user_id` UUID
- `p_type` TEXT
- `p_title` TEXT
- `p_message` TEXT
- `p_data` JSONB
- `p_scheduled_for` TIMESTAMPTZ (opcional)
- `p_channels` TEXT[] (opcional)

**Retorna:** UUID (ID da notificação)
**Security:** SET search_path = public

**Descrição:** Cria notificação para usuário, com opção de agendamento.

**Tipos válidos:**
- 'appointment_confirmation'
- 'appointment_reminder_24h'
- 'appointment_reminder_2h'
- 'appointment_cancellation'
- 'payment_due'
- 'evolution_added'
- 'message_received'
- 'system'

**Exemplo:**
```sql
SELECT create_notification(
  'user-uuid',
  'appointment_reminder_24h',
  'Lembrete de Consulta',
  'Você tem consulta amanhã às 10h',
  '{"appointment_id": "apt-123"}'::jsonb,
  NOW() + INTERVAL '1 day',
  ARRAY['push', 'email']
);
```

---

### mark_notification_read()
**Parâmetros:**
- `p_notification_id` UUID
- `p_user_id` UUID

**Retorna:** BOOLEAN (sucesso)
**Security:** SET search_path = public

**Descrição:** Marca notificação como lida.

---

### mark_all_notifications_read()
**Parâmetros:**
- `p_user_id` UUID

**Retorna:** INTEGER (quantidade marcada)
**Security:** SET search_path = public

**Descrição:** Marca todas as notificações do usuário como lidas.

---

### get_user_messages()
**Parâmetros:**
- `p_folder` TEXT ('inbox', 'sent', 'archived')
- `p_limit` INTEGER

**Retorna:** TABLE (mensagens)
**Security:** SET search_path = public

**Descrição:** Busca mensagens do usuário atual por pasta.

---

### send_patient_message()
**Parâmetros:**
- `p_recipient_id` UUID
- `p_subject` TEXT
- `p_message` TEXT
- `p_message_type` TEXT
- `p_priority` TEXT
- `p_thread_id` UUID (opcional)

**Retorna:** UUID (ID da mensagem)
**Security:** SET search_path = public

**Descrição:** Envia mensagem para paciente via sistema interno.

---

### cleanup_old_notifications()
**Retorna:** INTEGER (quantidade deletada)
**Security:** SET search_path = public

**Descrição:** Remove notificações antigas (>90 dias lidas ou >180 dias).

**Uso recomendado:** Executar via cron job diário.

---

### update_whatsapp_message_status()
**Parâmetros:**
- `p_whatsapp_message_id` TEXT
- `p_status` TEXT
- `p_timestamp` TIMESTAMPTZ

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Atualiza status de mensagem WhatsApp (webhook).

---

## Funções Auxiliares

### Teleconsulta

#### create_teleconsulta()
**Parâmetros:**
- `p_patient_id` UUID
- `p_therapist_id` UUID
- `p_appointment_id` UUID
- `p_scheduled_start` TIMESTAMPTZ
- `p_scheduled_end` TIMESTAMPTZ

**Retorna:** UUID (ID teleconsulta)
**Security:** SET search_path = public

---

#### start_teleconsulta()
**Parâmetros:**
- `p_teleconsulta_id` UUID
- `p_user_id` UUID
- `p_user_type` TEXT ('therapist' ou 'patient')

**Retorna:** TEXT (access_token)
**Security:** SET search_path = public

**Descrição:** Inicia teleconsulta e gera token de acesso.

---

#### end_teleconsulta()
**Parâmetros:**
- `p_teleconsulta_id` UUID
- `p_therapist_notes` TEXT
- `p_connection_quality` TEXT

**Retorna:** VOID
**Security:** SET search_path = public

---

#### cancel_teleconsulta()
**Parâmetros:**
- `p_teleconsulta_id` UUID
- `p_user_id` UUID
- `p_reason` TEXT

**Retorna:** VOID
**Security:** SET search_path = public

---

### Controle de Acesso

#### create_patient_access_code()
**Parâmetros:**
- `p_patient_id` UUID
- `p_created_by` UUID
- `p_expires_in_days` INTEGER

**Retorna:** TEXT (código de 6 dígitos)
**Security:** SET search_path = public

**Descrição:** Gera código de acesso temporário para paciente.

---

#### validate_access_code()
**Parâmetros:**
- `p_access_code` TEXT

**Retorna:** UUID (patient_id se válido, NULL se inválido)
**Security:** SET search_path = public

---

#### generate_access_code()
**Retorna:** TEXT (código de 6 dígitos)
**Security:** SET search_path = public

**Descrição:** Gera código aleatório único.

---

### Estatísticas e Relatórios

#### get_financial_summary()
**Parâmetros:**
- `p_start_date` DATE
- `p_end_date` DATE
- `p_therapist_id` UUID (opcional)

**Retorna:** TABLE (resumo financeiro)
**Security:** SET search_path = public

**Colunas retornadas:**
- total_revenue
- total_expenses
- profit
- pending_payments
- completed_payments

---

#### get_exercise_statistics()
**Retorna:** TABLE (estatísticas de exercícios)
**Security:** SET search_path = public

**Descrição:** Retorna estatísticas de prescrições e execuções de exercícios.

---

#### update_patient_stats()
**Parâmetros:**
- `p_patient_id` UUID

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Recalcula estatísticas agregadas do paciente.

---

### Utilidades Diversas

#### has_permission()
**Parâmetros:**
- `user_id` UUID
- `permission` TEXT

**Retorna:** BOOLEAN
**Security:** SET search_path = public

**Descrição:** Verifica se usuário tem permissão específica.

---

#### soft_delete_user()
**Parâmetros:**
- `user_id` UUID

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Marca usuário como deletado (soft delete) sem remover dados.

---

#### increment_material_download()
**Parâmetros:**
- `p_material_id` UUID

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Incrementa contador de downloads de material clínico.

---

#### increment_template_usage()
**Parâmetros:**
- `template_id` UUID

**Retorna:** VOID
**Security:** SET search_path = public

**Descrição:** Incrementa contador de uso de template.

---

#### clean_old_push_tokens()
**Retorna:** INTEGER (quantidade removida)
**Security:** SET search_path = public

**Descrição:** Remove tokens push expirados ou inativos (>60 dias).

---

#### get_unread_count()
**Parâmetros:**
- `p_user_id` UUID

**Retorna:** INTEGER
**Security:** SET search_path = public

**Descrição:** Retorna quantidade de notificações não lidas.

---

#### get_user_teleconsultas()
**Parâmetros:**
- `p_user_id` UUID
- `p_status` TEXT (opcional)
- `p_limit` INTEGER (padrão 50)

**Retorna:** TABLE (teleconsultas)
**Security:** SET search_path = public

---

#### update_last_login()
**Tipo:** Trigger Function
**Security:** SET search_path = public

**Descrição:** Atualiza timestamp de último login do usuário.

---

#### update_patient_activity()
**Tipo:** Trigger Function
**Security:** SET search_path = public

**Descrição:** Atualiza última atividade do paciente.

---

#### trigger_update_stats()
**Tipo:** Trigger Function
**Security:** SET search_path = public

**Descrição:** Dispara recálculo de estatísticas.

---

## Padrões e Convenções

### Nomenclatura

- **Prefixo `update_`:** Funções trigger de timestamp
- **Prefixo `create_`:** Funções que criam registros
- **Prefixo `get_`:** Funções de consulta/query
- **Prefixo `is_`:** Funções booleanas de verificação
- **Prefixo `has_`:** Funções booleanas de permissão

### Segurança

**TODAS as funções devem ter:**
```sql
SET search_path = public
```

**Funções que acessam dados sensíveis devem usar:**
```sql
SECURITY DEFINER
```

### Documentação

**Sempre adicione comentários:**
```sql
COMMENT ON FUNCTION nome_funcao() IS 'Descrição clara e concisa';
```

### Tratamento de Erros

**Use RAISE EXCEPTION para erros:**
```sql
IF condition THEN
  RAISE EXCEPTION 'Mensagem de erro clara';
END IF;
```

### Retorno de Dados

**Para consultas, use RETURNS TABLE:**
```sql
RETURNS TABLE (
  column1 TYPE,
  column2 TYPE
) AS $$
```

---

**Documento mantido por:** DevOps Team
**Última revisão:** 13 de Novembro de 2025
