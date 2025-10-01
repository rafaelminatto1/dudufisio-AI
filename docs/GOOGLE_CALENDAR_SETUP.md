# Configuração do Google Calendar para Produção

## ✅ Status Atual

- ✅ **Microsoft Calendar/Outlook removido** (devido a custos)
- ✅ **Estrutura de integração configurada**
- ✅ **Dependências instaladas** (googleapis, ics, bull, nodemailer)
- ✅ **Scripts de teste prontos**
- ⚠️ **Aguardando credenciais reais do Google Calendar**

## 🔧 Passos para Configuração de Produção

### 1. Criar Service Account no Google Cloud

1. **Acesse o Google Cloud Console**:
   - Vá para [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um novo projeto ou use um existente
   - Nome sugerido: `dudufisio-calendar`

2. **Habilitar Google Calendar API**:
   ```bash
   # No Cloud Console, vá para:
   # APIs & Services > Library > Google Calendar API > Enable
   ```

3. **Criar Service Account**:
   ```bash
   # No Cloud Console, vá para:
   # IAM & Admin > Service Accounts > Create Service Account

   # Configurações:
   Nome: calendar-service
   Email: calendar-service@dudufisio-calendar.iam.gserviceaccount.com
   Descrição: Integração de calendário para DuduFisio
   ```

4. **Gerar Chave Privada**:
   ```bash
   # Clique no Service Account criado
   # Vá para Keys > Add Key > Create New Key > JSON
   # Baixe o arquivo JSON
   ```

### 2. Configurar Credenciais no Projeto

1. **Atualizar .env.local**:
   ```bash
   # Substitua o conteúdo de GOOGLE_CALENDAR_SERVICE_ACCOUNT
   # pelo JSON completo baixado do Google Cloud Console

   GOOGLE_CALENDAR_SERVICE_ACCOUNT={"type":"service_account","project_id":"dudufisio-calendar","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQ...","client_email":"calendar-service@dudufisio-calendar.iam.gserviceaccount.com",...}
   ```

2. **Configurar Calendário**:
   ```bash
   # Para usar o calendário padrão do Gmail:
   GOOGLE_CALENDAR_ID=primary

   # Para criar calendário específico da clínica:
   # 1. Abra Google Calendar (calendar.google.com)
   # 2. Crie novo calendário: "DuduFisio - Agendamentos"
   # 3. Compartilhe com o Service Account com permissão de "Fazer alterações e gerenciar compartilhamento"
   # 4. Use o ID do calendário criado
   ```

### 3. Testar Integração

```bash
# Executar teste de conexão
node scripts/test-google-calendar.cjs

# Resultado esperado com sucesso:
{
  "success": true,
  "message": "Conexão OK — Google Calendar acessível",
  "calendarId": "primary",
  "retrievedItems": 0
}
```

### 4. Configuração de Email (ICS Fallback)

```bash
# Para Gmail App Password:
# 1. Vá para myaccount.google.com
# 2. Security > 2-Step Verification > App passwords
# 3. Gere uma senha para "DuduFisio Calendar"
# 4. Use a senha gerada no EMAIL_PASS

EMAIL_USER=noreply@dudufisio.com
EMAIL_PASS=sua_app_password_aqui
```

### 5. Configuração de Redis (Opcional)

```bash
# Para desenvolvimento local:
REDIS_HOST=localhost
REDIS_PORT=6379

# Para produção, configure Redis Cloud ou instância dedicada:
REDIS_HOST=seu-redis-host
REDIS_PASSWORD=sua-redis-password
```

## 🚀 Provedor Padrão

O sistema está configurado para usar **ICS por email** como fallback padrão:

```bash
CALENDAR_DEFAULT_PROVIDER=ics
```

Isso significa que mesmo sem Google Calendar configurado, os convites serão enviados como arquivo .ics por email, compatível com todos os clientes de calendário (Gmail, Outlook, Apple Calendar, etc.).

## 🧪 Teste de Produção

Para testar com dados reais:

```bash
# 1. Configure as credenciais reais
# 2. Execute o teste
node scripts/test-google-calendar.cjs

# 3. Se sucesso, teste criação de evento
node scripts/create-test-event.cjs

# 4. Verifique no Google Calendar se o evento foi criado
```

## 🔒 Segurança

- ✅ **Credenciais em .env.local** (não commitadas no git)
- ✅ **Service Account com escopo mínimo** (apenas Calendar API)
- ✅ **Eventos marcados como privados** por padrão
- ✅ **Logs sem dados sensíveis**

## 🎯 Funcionalidades Ativas

| Funcionalidade | Google Calendar | ICS Email |
|---------------|-----------------|-----------|
| Criar Evento | ✅ | ✅ |
| Atualizar Evento | ✅ | ❌ |
| Excluir Evento | ✅ | ❌ |
| Lembretes | ✅ | ✅ |
| Recorrência | ✅ | ✅ |
| Participantes | ✅ | ✅ |

## ❗ Importante

- **Microsoft Calendar foi removido** por questões de custo
- **Use Google Calendar** para funcionalidades completas
- **ICS por email** funciona como fallback universal
- **Teste sempre** antes de colocar em produção

## 📞 Próximos Passos

1. Obter credenciais reais do Google Cloud Console
2. Configurar calendário específico da clínica
3. Testar criação/atualização de eventos
4. Configurar monitoramento e alertas
5. Documentar processo para equipe

---

*Última atualização: Dezembro 2024*
*Sistema pronto para produção, aguardando credenciais válidas*