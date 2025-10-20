# 🚀 Aplicar Migration - Passo a Passo Simples

## ⚠️ AÇÃO NECESSÁRIA: Aplicar Migration no Supabase

A migration `assessment_compliance_log` precisa ser aplicada para que o sistema de alertas de medições (Nível C) funcione.

---

## 📋 Método Mais Simples (2 minutos)

### Passo 1: Abrir o SQL Editor do Supabase

1. **Clique neste link:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new

2. **Ou navegue manualmente:**
   - Acesse: https://supabase.com/dashboard
   - Selecione o projeto: `urfxniitfbbvsaskicfo`
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

---

### Passo 2: Copiar o SQL

1. **Abra o arquivo:** `supabase/migrations/20250125_assessment_compliance_log.sql`

2. **Selecione todo o conteúdo** (Ctrl+A)

3. **Copie** (Ctrl+C)

---

### Passo 3: Colar e Executar

1. **Cole** o SQL copiado no SQL Editor do Supabase (Ctrl+V)

2. **Clique no botão verde "Run"** no canto superior direito

3. **Aguarde** alguns segundos enquanto executa

4. **Você verá:** ✅ "Success. No rows returned"

---

### Passo 4: Verificar (Opcional)

Execute este SQL para confirmar que funcionou:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'assessment_compliance_log';
```

**Resultado esperado:** Uma linha com `assessment_compliance_log`

---

## ✅ Pronto!

A migration foi aplicada com sucesso! O sistema de alertas de medições (Nível C) agora está funcionando.

---

## 🧪 Testar o Sistema

Agora você pode testar:

1. **Iniciar o servidor:**
   ```bash
   npm run dev
   ```

2. **Navegar para um atendimento:**
   ```
   http://localhost:5173/atendimento/{appointmentId}
   ```

3. **Testar alertas:**
   - Tentar salvar sessão sem medições obrigatórias
   - Verificar diálogo de bloqueio
   - Escolher "Salvar Mesmo Assim"
   - Verificar registro de não conformidade

---

## 🔍 O Que Esta Migration Cria

### Tabela
- `assessment_compliance_log` - Registra todas as medições obrigatórias (realizadas ou não)

### Funções SQL
- `calculate_patient_compliance_rate()` - Calcula taxa de conformidade
- `get_compliance_report()` - Gera relatório de conformidade

### View
- `v_assessment_compliance_summary` - Resumo consolidado

### Índices
- 5 índices para otimização de queries

---

## ❓ Problemas?

### Erro: "relation already exists"
**Solução:** A tabela já existe. Pode ignorar ou executar:
```sql
DROP TABLE IF EXISTS assessment_compliance_log CASCADE;
```
E depois executar a migration novamente.

### Erro: "permission denied"
**Solução:** Verifique se você está logado com a conta correta no Supabase.

### Erro: "function does not exist"
**Solução:** Execute a migration completa novamente.

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Consulte: https://supabase.com/docs/guides/database
3. Entre em contato com o suporte

---

**Tempo estimado:** 2-5 minutos  
**Dificuldade:** ⭐ Fácil  
**Status:** ✅ Pronto para aplicar
