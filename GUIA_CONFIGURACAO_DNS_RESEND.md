# 🌐 GUIA COMPLETO - CONFIGURAÇÃO DNS PARA RESEND

## 📋 **SITUAÇÃO ATUAL**

✅ **Variáveis de ambiente**: Configuradas na Vercel  
✅ **Integração Resend**: Funcionando  
❌ **Registros DNS**: Precisam ser configurados  

---

## 🔍 **VERIFICAÇÃO DNS**

Execute este comando para verificar o status atual:

```bash
npx tsx scripts/check-dns-config.js
```

**Resultado esperado**: Os registros ainda não estão configurados (isso é normal).

---

## 🌐 **ONDE CONFIGURAR O DNS**

### **1. Identificar o provedor do domínio**

Execute este comando para descobrir onde está hospedado:

```bash
nslookup moocafisio.com.br
```

### **2. Provedores comuns no Brasil:**

| Provedor | Como acessar |
|----------|--------------|
| **Registro.br** | Área do cliente → DNS |
| **GoDaddy** | Painel → Domínios → Gerenciar DNS |
| **Namecheap** | Domain List → Manage → Advanced DNS |
| **Cloudflare** | DNS → Records |
| **Hostinger** | Domínios → Gerenciar DNS |

---

## 📝 **REGISTROS DNS NECESSÁRIOS**

### **Registro 1: TXT (Verificação DKIM)**
```
Tipo: TXT
Nome: @
Valor: resend._domainkey.moocafisio.com.br
TTL: 3600 (ou padrão)
```

### **Registro 2: CNAME (Envio)**
```
Tipo: CNAME
Nome: resend.moocafisio.com.br
Valor: resend.com
TTL: 3600 (ou padrão)
```

---

## 🔧 **PASSO A PASSO POR PROVEDOR**

### **Registro.br (Mais comum no Brasil)**

1. **Acesse**: https://registro.br/
2. **Faça login** na sua conta
3. **Vá em**: "Meus domínios"
4. **Clique em**: "Gerenciar" ao lado de `moocafisio.com.br`
5. **Vá em**: "DNS"
6. **Adicione os registros**:

   **Registro TXT:**
   - Tipo: `TXT`
   - Nome: `@`
   - Valor: `resend._domainkey.moocafisio.com.br`
   - TTL: `3600`

   **Registro CNAME:**
   - Tipo: `CNAME`
   - Nome: `resend`
   - Valor: `resend.com`
   - TTL: `3600`

7. **Salve** as alterações

### **GoDaddy**

1. **Acesse**: https://godaddy.com/
2. **Faça login** na sua conta
3. **Vá em**: "Meus produtos" → "Domínios"
4. **Clique em**: "Gerenciar" ao lado de `moocafisio.com.br`
5. **Vá em**: "DNS"
6. **Adicione os registros** (mesmos valores acima)
7. **Salve** as alterações

### **Cloudflare**

1. **Acesse**: https://cloudflare.com/
2. **Selecione** o domínio `moocafisio.com.br`
3. **Vá em**: "DNS" → "Records"
4. **Adicione os registros** (mesmos valores acima)
5. **Salve** as alterações

---

## ⏱️ **TEMPO DE PROPAGAÇÃO**

- **Propagação DNS**: 5 minutos a 24 horas
- **Verificação automática**: A cada 5 minutos
- **Recomendado**: Aguardar 1 hora para propagação completa

---

## 🧪 **VERIFICAÇÃO APÓS CONFIGURAÇÃO**

### **1. Verificar DNS localmente**
```bash
# Verificar registro TXT
nslookup -type=TXT moocafisio.com.br

# Verificar registro CNAME
nslookup resend.moocafisio.com.br
```

### **2. Executar script de verificação**
```bash
npx tsx scripts/check-dns-config.js
```

### **3. Verificar no Resend**
1. **Acesse**: https://resend.com/
2. **Vá em**: Domains
3. **Clique em**: "Verify" ao lado de `moocafisio.com.br`
4. **Status deve ficar**: ✅ "Verified"

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema 1: Registro não aparece**
**Solução**: 
- Aguarde até 24h para propagação completa
- Verifique se salvou corretamente no provedor
- Use ferramentas online como `whatsmydns.net`

### **Problema 2: Erro de sintaxe**
**Solução**:
- Verifique se não há espaços extras
- Confirme se o tipo está correto (TXT/CNAME)
- Verifique se o valor está exatamente como mostrado

### **Problema 3: Domínio não verifica no Resend**
**Solução**:
- Aguarde mais tempo para propagação
- Verifique se os registros estão corretos
- Entre em contato com o suporte do Resend

---

## 📊 **STATUS ESPERADO**

### **Antes da configuração:**
```
❌ Registro TXT: Não encontrado
❌ Registro CNAME: Não encontrado
❌ Status no Resend: Pending
```

### **Após configuração (aguardar propagação):**
```
✅ Registro TXT: resend._domainkey.moocafisio.com.br
✅ Registro CNAME: resend.com
✅ Status no Resend: Verified
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. **✅ Configure os registros DNS** (seguir guia acima)
2. **⏱️ Aguarde propagação** (1-24 horas)
3. **🧪 Execute verificação** (`npx tsx scripts/check-dns-config.js`)
4. **✅ Verifique no Resend** (domínio deve ficar "Verified")
5. **🚀 Teste envio de email** (já funcionando)

---

## 📞 **SUPORTE**

Se tiver dificuldades:

1. **Verifique o provedor** do domínio
2. **Consulte a documentação** do provedor
3. **Entre em contato** com o suporte do provedor
4. **Use ferramentas online** como `whatsmydns.net`

---

**Após configurar o DNS, a integração estará 100% completa!** 🎉
