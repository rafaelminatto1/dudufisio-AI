# 📚 Documentação do Banco de Dados - Guia Rápido

> **Projeto:** dudufisio-AI
> **Última Atualização:** 13 de Novembro de 2025
> **Status:** ✅ Produção - Seguro

---

## 🎯 Início Rápido

Se você precisa de informações sobre o banco de dados, este é o ponto de partida!

### 📖 Documentos Disponíveis

| Documento | Quando Usar | Tempo de Leitura |
|-----------|-------------|------------------|
| **[DATABASE_SECURITY.md](DATABASE_SECURITY.md)** | Entender segurança, RLS, políticas | 15-20 min |
| **[DATABASE_FUNCTIONS.md](DATABASE_FUNCTIONS.md)** | Consultar funções disponíveis | 20-30 min |
| **[DATABASE_IMPROVEMENTS_REPORT.md](DATABASE_IMPROVEMENTS_REPORT.md)** | Ver relatório de melhorias | 10-15 min |
| **[DATABASE_README.md](DATABASE_README.md)** | Visão geral rápida (você está aqui) | 5 min |

---

## 🔍 Encontre Rapidamente

### Precisa de informações sobre...

#### 🔐 Segurança
- **RLS (Row Level Security)?** → [DATABASE_SECURITY.md - Políticas RLS](DATABASE_SECURITY.md#políticas-rls)
- **Quem pode acessar o quê?** → [DATABASE_SECURITY.md - Tabelas com RLS](DATABASE_SECURITY.md#tabelas-com-rls-habilitado)
- **Views SECURITY DEFINER?** → [DATABASE_SECURITY.md - Views SECURITY DEFINER](DATABASE_SECURITY.md#views-security-definer)

#### ⚙️ Funções
- **Listar todas as funções?** → [DATABASE_FUNCTIONS.md](DATABASE_FUNCTIONS.md)
- **Funções de autenticação?** → [DATABASE_FUNCTIONS.md - Autenticação](DATABASE_FUNCTIONS.md#funções-de-autenticação)
- **Como criar pagamento?** → [DATABASE_FUNCTIONS.md - create_payment()](DATABASE_FUNCTIONS.md#create_payment)
- **Como enviar notificação?** → [DATABASE_FUNCTIONS.md - create_notification()](DATABASE_FUNCTIONS.md#create_notification)

#### 📊 Relatórios
- **O que foi corrigido?** → [DATABASE_IMPROVEMENTS_REPORT.md - Sumário](DATABASE_IMPROVEMENTS_REPORT.md#-sumário-executivo)
- **Métricas de segurança?** → [DATABASE_IMPROVEMENTS_REPORT.md - Estatísticas](DATABASE_IMPROVEMENTS_REPORT.md#-estatísticas-de-segurança)
- **Antes vs Depois?** → [DATABASE_IMPROVEMENTS_REPORT.md - Resultados](DATABASE_IMPROVEMENTS_REPORT.md#-resultados-finais)

---

## 🚀 Casos de Uso Comuns

### 1. "Preciso criar uma nova tabela"

**Checklist de Segurança:**
```sql
-- 1. Criar a tabela
CREATE TABLE minha_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  -- ... outras colunas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEMPRE habilitar RLS
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas apropriadas
CREATE POLICY "Users can view their own data"
  ON minha_tabela FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Adicionar trigger de updated_at
CREATE TRIGGER update_minha_tabela_updated_at
  BEFORE UPDATE ON minha_tabela
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

📖 **Leia mais:** [DATABASE_SECURITY.md - Melhores Práticas](DATABASE_SECURITY.md#melhores-práticas)

---

### 2. "Preciso criar uma nova função"

**Template Seguro:**
```sql
CREATE OR REPLACE FUNCTION minha_funcao(
  p_param1 UUID,
  p_param2 TEXT
)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ⚠️ CRÍTICO: sempre adicionar!
AS $$
BEGIN
  -- Seu código aqui
  RETURN QUERY
  SELECT ...;
END;
$$;

-- Sempre documentar
COMMENT ON FUNCTION minha_funcao(UUID, TEXT) IS
  'Descrição clara do que a função faz';
```

📖 **Leia mais:** [DATABASE_FUNCTIONS.md - Padrões](DATABASE_FUNCTIONS.md#padrões-e-convenções)

---

### 3. "Preciso entender quem pode acessar uma tabela"

**Passo a passo:**

1. Verifique se RLS está habilitado:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename = 'nome_da_tabela';
   ```

2. Liste as políticas:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'nome_da_tabela';
   ```

3. Consulte a documentação:
   - Vá para [DATABASE_SECURITY.md](DATABASE_SECURITY.md)
   - Busque pela tabela (Ctrl+F)
   - Leia as políticas explicadas

📖 **Leia mais:** [DATABASE_SECURITY.md - Políticas RLS](DATABASE_SECURITY.md#políticas-rls)

---

### 4. "Como usar as funções de autenticação?"

**Funções Disponíveis:**

```sql
-- Verificar se é admin
SELECT is_admin(); -- true/false

-- Verificar se é terapeuta (ou manager/admin)
SELECT is_therapist(); -- true/false

-- Verificar se é staff (qualquer role exceto patient)
SELECT is_staff(); -- true/false

-- Obter role do usuário
SELECT get_user_role(); -- 'admin', 'therapist', etc.
```

**Uso em RLS:**
```sql
CREATE POLICY "Only admins can delete"
  ON sensitive_table FOR DELETE
  USING (is_admin());
```

📖 **Leia mais:** [DATABASE_FUNCTIONS.md - Autenticação](DATABASE_FUNCTIONS.md#funções-de-autenticação)

---

### 5. "Como criar notificações?"

**Exemplo Completo:**

```sql
-- Criar notificação simples
SELECT create_notification(
  'user-uuid-aqui',                    -- ID do usuário
  'appointment_reminder_24h',          -- Tipo
  'Lembrete de Consulta',              -- Título
  'Você tem consulta amanhã às 10h',  -- Mensagem
  '{"appointment_id": "apt-123"}'::jsonb,  -- Dados extras
  NOW() + INTERVAL '1 day',            -- Quando enviar (opcional)
  ARRAY['push', 'email']               -- Canais (opcional)
);

-- Marcar como lida
SELECT mark_notification_read('notification-uuid', 'user-uuid');

-- Marcar todas como lidas
SELECT mark_all_notifications_read('user-uuid');
```

📖 **Leia mais:** [DATABASE_FUNCTIONS.md - Notificações](DATABASE_FUNCTIONS.md#funções-de-notificações)

---

### 6. "Como criar um pagamento?"

**Exemplo:**

```sql
-- Criar pagamento
SELECT create_payment(
  'patient-uuid',                      -- ID do paciente
  'appointment-uuid',                  -- ID do agendamento
  150.00,                              -- Valor
  'credit_card',                       -- Método
  'Consulta fisioterapia',             -- Descrição
  '{"transaction_id": "tx_123"}'::jsonb  -- Metadados
);

-- Atualizar status
SELECT update_payment_status(
  'payment-uuid',
  'completed',
  '{"provider": "stripe", "status": "paid"}'::jsonb
);

-- Processar reembolso
SELECT process_refund(
  'payment-uuid',
  150.00,  -- Valor a reembolsar
  'Cancelamento de consulta'
);
```

📖 **Leia mais:** [DATABASE_FUNCTIONS.md - Pagamentos](DATABASE_FUNCTIONS.md#pagamentos)

---

## 📊 Estatísticas do Banco

### Resumo Atual

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 50+ tabelas |
| **Tabelas com RLS** | 100% ✅ |
| **Total de Funções** | 52 funções |
| **Funções Seguras** | 100% ✅ |
| **Políticas RLS** | 50+ políticas |
| **Views Documentadas** | 3 views ✅ |
| **Vulnerabilidades** | 0 ✅ |

### Principais Tabelas

| Tabela | Propósito | RLS | Políticas |
|--------|-----------|-----|-----------|
| users | Usuários do sistema | ✅ | 4+ |
| patients | Pacientes | ✅ | 4+ |
| appointments | Agendamentos | ✅ | 4+ |
| session_evolutions | Evoluções clínicas | ✅ | 4 |
| notifications | Notificações | ✅ | 5 |
| clinical_materials | Materiais clínicos | ✅ | 2 |
| evolution_templates | Templates | ✅ | 4 |
| payments | Pagamentos | ✅ | 4+ |

---

## 🛠️ Ferramentas e Comandos Úteis

### Verificar Segurança

```bash
# Executar advisors de segurança
npx supabase db advisors --type security

# Executar advisors de performance
npx supabase db advisors --type performance

# Listar migrações
npx supabase migration list

# Criar nova migração
npx supabase migration new nome_da_migracao
```

### Consultas SQL Úteis

```sql
-- Listar todas as tabelas com RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Listar todas as políticas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Listar todas as funções
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;

-- Verificar índices
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial

- **Supabase:** https://supabase.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **RLS:** https://supabase.com/docs/guides/auth/row-level-security

### Guias Específicos

1. **RLS (Row Level Security)**
   - [Guia Oficial Supabase](https://supabase.com/docs/guides/auth/row-level-security)
   - [DATABASE_SECURITY.md - Políticas RLS](DATABASE_SECURITY.md#políticas-rls)

2. **Funções PostgreSQL**
   - [PostgreSQL Functions](https://www.postgresql.org/docs/current/plpgsql.html)
   - [DATABASE_FUNCTIONS.md](DATABASE_FUNCTIONS.md)

3. **Segurança de Banco de Dados**
   - [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)
   - [DATABASE_SECURITY.md](DATABASE_SECURITY.md)

---

## 🚨 Avisos Importantes

### ⚠️ Ao Modificar o Banco

1. **SEMPRE crie uma migração** - Nunca modifique diretamente em produção
2. **SEMPRE habilite RLS** em novas tabelas públicas
3. **SEMPRE adicione search_path** em novas funções
4. **SEMPRE teste** em ambiente de desenvolvimento primeiro
5. **SEMPRE documente** suas mudanças

### ⚠️ Views SECURITY DEFINER

As seguintes views usam SECURITY DEFINER (é intencional e documentado):
- `v_active_prescriptions`
- `v_financial_monthly_summary`
- `patient_insights_summary`

**NÃO remova** SECURITY DEFINER dessas views sem revisar a documentação.

📖 **Leia:** [DATABASE_SECURITY.md - Views SECURITY DEFINER](DATABASE_SECURITY.md#views-security-definer)

---

## 📞 Suporte

### Precisa de Ajuda?

1. **Dúvidas sobre segurança:** Leia [DATABASE_SECURITY.md](DATABASE_SECURITY.md)
2. **Dúvidas sobre funções:** Consulte [DATABASE_FUNCTIONS.md](DATABASE_FUNCTIONS.md)
3. **Entender mudanças:** Veja [DATABASE_IMPROVEMENTS_REPORT.md](DATABASE_IMPROVEMENTS_REPORT.md)
4. **Ainda com dúvidas:** Contate devops@dudufisio.com

### Reportar Problemas

- **Vulnerabilidades:** security@dudufisio.com
- **Bugs:** dba@dudufisio.com
- **Performance:** devops@dudufisio.com

---

## 📝 Changelog

### 2025-11-13 - Revisão Completa de Segurança

- ✅ Corrigidas 3 vulnerabilidades críticas
- ✅ Protegidas 52 funções com search_path
- ✅ Habilitado RLS em 100% das tabelas
- ✅ Criada documentação completa
- ✅ Zero vulnerabilidades remanescentes

📖 **Detalhes:** [DATABASE_IMPROVEMENTS_REPORT.md](DATABASE_IMPROVEMENTS_REPORT.md)

---

## 🎯 Próximos Passos Recomendados

1. ✅ Ler este guia rápido (você já está fazendo!)
2. 📖 Explorar [DATABASE_SECURITY.md](DATABASE_SECURITY.md) para entender políticas
3. 📖 Consultar [DATABASE_FUNCTIONS.md](DATABASE_FUNCTIONS.md) quando precisar usar funções
4. 📊 Revisar [DATABASE_IMPROVEMENTS_REPORT.md](DATABASE_IMPROVEMENTS_REPORT.md) para contexto
5. 🔧 Configurar alertas do Supabase Advisor
6. 🧪 Criar testes para políticas RLS

---

**Bem-vindo à documentação do banco de dados dudufisio-AI!** 🎉

*Este guia é atualizado regularmente. Última revisão: 13/11/2025*
