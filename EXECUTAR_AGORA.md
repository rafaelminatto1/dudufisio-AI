# ⚡ Executar Agora - 2 Comandos Rápidos
## Push Notifications MoocaFisio

---

## 🎯 PASSO 2: Aplicar Migration no Supabase

### Método 1: SQL Editor (RECOMENDADO - 1 minuto)

1. **Abra este link:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
   ```

2. **Abra o arquivo:**
   ```
   EXECUTAR_MIGRATION.sql
   ```
   (está na raiz do projeto)

3. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

4. **Cole no SQL Editor** do Supabase (Ctrl+V)

5. **Clique em "Run"** (ou pressione Ctrl+Enter)

6. **Resultado esperado:**
   ```
   Success. No rows returned
   ```

✅ **PASSO 2 CONCLUÍDO!**

---

## 🎯 PASSO 3: Configurar Secret do Firebase

### Método 1: Via PowerShell (AUTOMÁTICO - 30 segundos)

Abra o PowerShell no diretório do projeto e execute:

```powershell
.\configurar-firebase-secret.ps1
```

### Método 2: Manual via Dashboard (1 minuto)

1. **Abra este link:**
   ```
   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions
   ```

2. Role até **"Edge Function Secrets"**

3. Clique em **"Add new secret"**

4. Preencha:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Cole o conteúdo do arquivo JSON que você baixou do Firebase

⚠️ **IMPORTANTE:** O JSON completo do Service Account deve ser colado aqui. Por segurança, não incluímos as credenciais neste arquivo de documentação.

5. Clique em **"Save"** ou **"Add secret"**

✅ **PASSO 3 CONCLUÍDO!**

---

## 🎯 PASSO 4 (OPCIONAL): Deploy Edge Function

### Via Supabase CLI

```bash
supabase functions deploy send-push-notification --project-ref urfxniitfbbvsaskicfo
```

---

## 🧪 TESTE FINAL

1. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

2. **Abrir navegador:**
   ```
   http://localhost:5173
   ```

3. **Fazer login:**
   - Email: `admin@moocafisio.com.br`
   - Senha: `DuduFisio2024!`

4. **Clicar em "Ativar Notificações"**

5. **Aceitar permissão do navegador**

6. **Verificar console (F12)** para:
   ```
   [Firebase] FCM token obtained: ...
   [PushService] Token saved successfully
   ```

✅ **SISTEMA FUNCIONANDO!** 🎉

---

## 📝 ARQUIVOS CRIADOS

- ✅ `EXECUTAR_MIGRATION.sql` - SQL para copiar no Supabase
- ✅ `configurar-firebase-secret.ps1` - Script PowerShell automático
- ✅ `EXECUTAR_AGORA.md` - Este arquivo (guia rápido)

---

## ❓ PROBLEMAS?

### Migration retorna erro
**Solução:** Verifique se está logado no Supabase Dashboard

### Secret não salva
**Solução:** Tente via Dashboard manual (Método 2)

### Notificações não aparecem
**Solução:** 
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Verifique console para erros
3. Confira se todas as variáveis VITE_FIREBASE_* estão no .env.local

---

**🚀 Agora é só executar os 2 comandos acima e testar!**

