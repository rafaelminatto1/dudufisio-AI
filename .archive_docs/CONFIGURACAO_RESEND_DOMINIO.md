# 🌐 CONFIGURAÇÃO DO DOMÍNIO NO RESEND - moocafisio.com.br

## ✅ **VARIÁVEIS DE AMBIENTE CONFIGURADAS NA VERCEL**

As seguintes variáveis já foram configuradas na Vercel via CLI:

```env
RESEND_API_KEY=re_Em2ZXmiq_HAQvz1pi9miZT8aAqvttwSqw
EMAIL_FROM=noreply@moocafisio.com.br
EMAIL_FROM_NAME=DuduFisio
EMAIL_ENABLED=true
```

---

## 🔧 **PASSO A PASSO PARA CONFIGURAR O DOMÍNIO**

### **1. Acessar o Resend**
1. Vá para: https://resend.com/
2. Faça login na sua conta
3. Vá para **Domains** no menu lateral

### **2. Adicionar Domínio**
1. Clique em **"Add Domain"**
2. Digite: `moocafisio.com.br` (sem www)
3. Clique em **"Add"**

### **3. Configurar DNS**
O Resend mostrará as configurações DNS necessárias. Você precisa adicionar no seu provedor de domínio:

#### **Registro 1: TXT (Verificação DKIM)**
```
Tipo: TXT
Nome: @
Valor: resend._domainkey.moocafisio.com.br
TTL: 3600 (ou padrão)
```

#### **Registro 2: CNAME (Envio)**
```
Tipo: CNAME
Nome: resend.moocafisio.com.br
Valor: resend.com
TTL: 3600 (ou padrão)
```

### **4. Onde Configurar DNS**
**Provedores comuns:**
- **Registro.br**: Área do cliente → DNS
- **GoDaddy**: Painel → Domínios → Gerenciar DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Cloudflare**: DNS → Records

### **5. Verificar Configuração**
1. Volte ao Resend
2. Clique **"Verify"**
3. Aguarde propagação (5-30 minutos)
4. Status deve ficar **"Verified"** ✅

---

## 🧪 **TESTE DE CONFIGURAÇÃO**

### **Teste via API (usando sua chave)**
```bash
curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_Em2ZXmiq_HAQvz1pi9miZT8aAqvttwSqw' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "noreply@moocafisio.com.br",
       "to": ["seu_email@gmail.com"],
       "subject": "Teste DuduFisio - moocafisio.com.br",
       "html": "<h1>Teste de Email Profissional!</h1><p>Email enviado com sucesso do domínio moocafisio.com.br!</p>"
     }'
```

### **Teste no Dashboard Resend**
1. Vá em **Emails** → **Send**
2. Preencha:
   - **From**: `noreply@moocafisio.com.br`
   - **To**: `seu_email@gmail.com`
   - **Subject**: `Teste DuduFisio`
   - **Content**: `Teste de email profissional!`
3. Clique **"Send"**

---

## 🚨 **PROBLEMAS COMUNS**

### **Domínio não verifica**
- Verifique se os registros DNS estão corretos
- Aguarde até 24h para propagação completa
- Use `dig TXT moocafisio.com.br` para verificar

### **Emails vão para spam**
- Configure SPF, DKIM e DMARC
- Use conteúdo profissional
- Evite palavras de spam

---

## ✅ **CHECKLIST**

- [ ] Domínio adicionado no Resend
- [ ] Registros DNS configurados
- [ ] Domínio verificado no Resend
- [ ] Teste de email funcionando
- [ ] Emails chegando na caixa de entrada

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Configure o domínio no Resend** (seguindo os passos acima)
2. **Me avise quando estiver pronto**
3. **Eu implemento as mudanças no código**
4. **Testamos tudo funcionando**

---

**Agora é só seguir o passo a passo para configurar o domínio!** 🎯
