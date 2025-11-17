# 🔧 Configuração do Stripe - Guia Rápido

## ✅ Passo 1: Criar arquivo .env.local

Crie o arquivo `.env.local` na raiz do projeto `fisioflow-next/` com o seguinte conteúdo:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Application URL
NEXT_PUBLIC_APP_URL=https://moocafisio.com.br
```

**⚠️ IMPORTANTE:** Este arquivo já está no `.gitignore` e NÃO será commitado no Git.

## 📍 Onde Configurar NEXT_PUBLIC_APP_URL

### **Localmente (Desenvolvimento)**
- Arquivo: `fisioflow-next/.env.local`
- Valor: `https://moocafisio.com.br` (ou `http://localhost:3000` para desenvolvimento local)

### **Na Vercel (Produção)**
1. Acesse: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://moocafisio.com.br`
   - **Environment**: Marque Production, Preview e Development
5. Clique em **Save**

## 🔗 Passo 2: Configurar Webhook no Stripe Dashboard

### **Instruções Passo a Passo:**

1. **Acesse o Stripe Dashboard**
   - Vá para: https://dashboard.stripe.com
   - Faça login

2. **Navegue até Webhooks**
   - Menu lateral → **Developers** → **Webhooks**

3. **Adicionar Endpoint**
   - Clique em **"Add endpoint"** ou **"+ Add endpoint"**

4. **Configurar o Endpoint**

   **Endpoint URL:**
   ```
   https://moocafisio.com.br/api/stripe/webhook
   ```

   **Description (opcional):**
   ```
   FisioFlow - Webhook para processar pagamentos
   ```

5. **Selecionar Eventos**

   Marque os seguintes eventos:
   
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.async_payment_succeeded`
   - ✅ `checkout.session.async_payment_failed`

6. **Salvar**
   - Clique em **"Add endpoint"**

7. **Copiar o Signing Secret**
   - Na página de detalhes do endpoint
   - Seção **"Signing secret"** → Clique em **"Reveal"**
   - Copie o secret (começa com `whsec_...`)
   - **NOTA:** Copie o secret que aparece aqui e atualize o `.env.local`

8. **Verificar**
   - O Stripe enviará um evento de teste
   - Status verde ✅ = funcionando
   - Se houver erro, verifique a URL e o secret

## 📝 Checklist

- [ ] Arquivo `.env.local` criado com as chaves do Stripe
- [ ] `NEXT_PUBLIC_APP_URL` configurado
- [ ] Webhook criado no Stripe Dashboard
- [ ] URL do webhook: `https://moocafisio.com.br/api/stripe/webhook`
- [ ] Eventos selecionados
- [ ] Webhook testado e funcionando
- [ ] Variáveis configuradas na Vercel (para produção)

## 🚀 Próximos Passos

1. **Reiniciar o servidor de desenvolvimento**
   ```bash
   cd fisioflow-next
   npm run dev
   ```

2. **Fazer Deploy na Vercel**
   - Adicione todas as variáveis de ambiente na Vercel
   - Faça o deploy

3. **Testar**
   - Criar uma transação no dashboard financeiro
   - Usar pagamento com Stripe
   - Verificar se o webhook atualiza automaticamente

## 🆘 Troubleshooting

### Webhook não recebe eventos
- Verifique se a URL está acessível publicamente
- Confirme que o secret está correto no `.env.local`
- Verifique os logs do servidor

### Erro 401/403
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Use o secret do endpoint correto no Stripe Dashboard

### Eventos não processados
- Verifique os logs do servidor
- Confirme que os eventos estão selecionados no webhook

