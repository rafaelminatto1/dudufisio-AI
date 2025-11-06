# 🚀 SETUP RÁPIDO - WHATSAPP WEB + CRM

**Tempo estimado: 15-30 minutos**

---

## ✅ PRÉ-REQUISITOS

- [x] Node.js v18+ instalado
- [x] npm funcionando
- [x] Número fixo da clínica com WhatsApp Business
- [x] Acesso ao código do projeto

---

## 🔧 PASSO 1: INSTALAR DEPENDÊNCIAS (2 min)

```bash
# Instalar bibliotecas necessárias
npm install whatsapp-web.js qrcode-terminal

# Opcional mas recomendado (para produção)
npm install -g pm2
```

---

## ⚙️ PASSO 2: CONFIGURAR VARIÁVEIS (3 min)

```bash
# Criar arquivo de configuração local
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**Configurações essenciais:**

```env
# WhatsApp Web (GRATUITO!)
VITE_WHATSAPP_USE_WEB_CLIENT=true
WHATSAPP_BUSINESS_NUMBER=+5511999999999  # Seu número fixo

# Supabase (obrigatório)
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=seu_key_aqui

# Gemini AI (para automações inteligentes)
VITE_GOOGLE_AI_API_KEY=seu_key_aqui
```

---

## 🚀 PASSO 3: INICIAR SERVIÇO (2 min)

### Primeira vez (Desenvolvimento):

```bash
# Iniciar serviço WhatsApp
npm run start:whatsapp
```

**Você verá um QR Code no terminal!**

### Escanear QR Code:

1. Abra o **WhatsApp Business** no celular
2. Toque em **⋮ (Mais opções)** > **Aparelhos conectados**
3. Toque em **Conectar um aparelho**
4. Aponte a câmera para o QR Code no terminal

**Aguarde a mensagem:**
```
✅ WHATSAPP WEB CONECTADO COM SUCESSO!
```

---

## ✅ PASSO 4: TESTAR (5 min)

### Teste 1: Receber mensagem

```bash
1. Do seu celular, envie uma mensagem para o número fixo
2. Aguarde 2-5 segundos
3. Verifique os logs no terminal
4. Deve aparecer: "✨ Novo lead criado!"
```

### Teste 2: Ver no CRM

```bash
# Abrir aplicação
npm run dev

# Acessar CRM
http://localhost:3000/crm

# Verificar:
✅ Lead aparece no Kanban
✅ Status: "novo"
✅ Score calculado automaticamente
✅ Histórico da mensagem salvo
```

### Teste 3: Resposta automática

```bash
# A resposta de boas-vindas deve ter sido enviada automaticamente!
# Verifique no WhatsApp do seu celular
```

---

## 🏭 PASSO 5: PRODUÇÃO (OPCIONAL)

### Com PM2 (recomendado):

```bash
# Iniciar em background
npm run whatsapp:pm2

# Ver logs
npm run whatsapp:logs

# Ver status
npm run whatsapp:status

# Reiniciar
npm run whatsapp:restart

# Parar
npm run whatsapp:stop
```

### Configurar para iniciar no boot:

```bash
# Salvar configuração PM2
pm2 save

# Configurar startup
pm2 startup

# Executar comando mostrado pelo PM2
```

---

## 📊 PASSO 6: ATIVAR AUTOMAÇÕES (5 min)

```sql
-- Executar no Supabase SQL Editor:

-- 1. Ativar boas-vindas automáticas
UPDATE automation_rules 
SET is_active = true 
WHERE name LIKE '%Boas-vindas%';

-- 2. Ativar follow-up 24h
UPDATE automation_rules 
SET is_active = true 
WHERE name LIKE '%24h%';

-- 3. Ativar follow-up qualificado
UPDATE automation_rules 
SET is_active = true 
WHERE name LIKE '%Qualificado%';

-- 4. Verificar ativas
SELECT name, is_active, priority 
FROM automation_rules 
WHERE is_active = true;
```

---

## 🎯 VERIFICAR SE ESTÁ FUNCIONANDO

### ✅ Checklist de Sucesso:

- [ ] WhatsApp conectado (veja logs)
- [ ] Mensagem de teste recebida
- [ ] Lead criado automaticamente
- [ ] Boas-vindas enviadas
- [ ] Lead aparece no CRM
- [ ] Score calculado (50-70)
- [ ] Automações ativas

### 📊 Métricas Esperadas:

```
⏱️ Tempo de resposta: < 10 segundos
💰 Custo por mensagem: R$ 0
📈 Taxa de criação de leads: 100%
✅ Uptime: > 99%
```

---

## ⚠️ TROUBLESHOOTING

### Problema: QR Code não aparece

```bash
# Solução:
rm -rf whatsapp-session/
npm run start:whatsapp
```

### Problema: "WhatsApp não está conectado"

```bash
# Verificar se o serviço está rodando:
ps aux | grep start-whatsapp

# Se não estiver, iniciar:
npm run start:whatsapp

# Ou em produção:
npm run whatsapp:pm2
```

### Problema: Mensagens não chegam

```bash
# Ver logs:
npm run whatsapp:logs

# Verificar conexão:
# Logs devem mostrar: "✅ WHATSAPP WEB CONECTADO"

# Se não, reiniciar:
npm run whatsapp:restart
```

### Problema: Lead não é criado

```bash
# Verificar configuração Supabase em .env.local:
cat .env.local | grep SUPABASE

# Testar conexão com banco:
# Abrir aplicação e verificar outras páginas
```

### Problema: Erro "Module not found"

```bash
# Reinstalar dependências:
npm install whatsapp-web.js qrcode-terminal
npm install

# Limpar cache:
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 DICAS IMPORTANTES

### 1. Backup da Sessão

```bash
# Fazer backup regularmente:
tar -czf whatsapp-session-backup-$(date +%Y%m%d).tar.gz whatsapp-session/

# Restaurar se necessário:
tar -xzf whatsapp-session-backup-20251014.tar.gz
```

### 2. Monitoramento

```bash
# Ver logs em tempo real:
tail -f logs/whatsapp.log

# Ver status do PM2:
pm2 monit
```

### 3. Atualizar Código

```bash
# Parar serviço
npm run whatsapp:stop

# Atualizar código (git pull, etc)

# Reinstalar dependências se necessário
npm install

# Reiniciar
npm run whatsapp:pm2
```

---

## 📊 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run start:whatsapp        # Iniciar em foreground (ver logs)

# Produção
npm run whatsapp:pm2          # Iniciar em background
npm run whatsapp:logs         # Ver logs
npm run whatsapp:status       # Ver status
npm run whatsapp:restart      # Reiniciar
npm run whatsapp:stop         # Parar

# Debugging
pm2 logs whatsapp-service --lines 100   # Ver últimas 100 linhas
pm2 monit                               # Monitor em tempo real
```

---

## 🎉 PRONTO!

Seu WhatsApp está integrado ao CRM!

### Agora você tem:

✅ **Mensagens gratuitas ilimitadas**  
✅ **Leads criados automaticamente**  
✅ **Respostas em 2-5 segundos**  
✅ **Economia de 60-70%**  
✅ **Sistema escalável**  

### Próximos passos:

1. **Testar com volume real** - Envie várias mensagens
2. **Ajustar templates** - Personalize mensagens
3. **Configurar mais automações** - Follow-ups, remarketing
4. **Treinar equipe** - Como usar o CRM
5. **Monitorar métricas** - Acompanhar resultados

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:

- 🎯 **COMECE_AQUI.md** - Overview rápido
- 📋 **RESUMO_ANALISE_CRM.md** - Análise completa
- 🚀 **IMPLEMENTACAO_WHATSAPP_FIXO.md** - Guia detalhado
- ⚡ **QUICK_WINS_CRM.md** - Ações rápidas
- ✅ **CHECKLIST_EXECUTIVO.md** - Checklist completo

---

## 💬 SUPORTE

Dúvidas ou problemas?

1. ✅ Consulte a documentação acima
2. ✅ Veja seção de Troubleshooting
3. ✅ Verifique os logs: `npm run whatsapp:logs`

---

**🎯 Setup completo em 15-30 minutos!**

**Data:** 14 de outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso



