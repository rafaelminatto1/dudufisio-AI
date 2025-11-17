# 🔧 Configuração do Stripe - Guia Completo

## ✅ Passo 1: Variáveis de Ambiente (Já Configurado)

As variáveis de ambiente já foram configuradas no arquivo `.env.local`:

```env
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_APP_URL=https://moocafisio.com.br
```

## 📍 Onde Configurar NEXT_PUBLIC_APP_URL

A variável `NEXT_PUBLIC_APP_URL` está configurada no arquivo `.env.local` e também precisa ser configurada:

### **Localmente (Desenvolvimento)**
- Arquivo: `fisioflow-next/.env.local`
- Valor: `https://moocafisio.com.br` (ou `http://localhost:3000` para desenvolvimento local)

### **Na Vercel (Produção)**
1. Acesse o painel da Vercel: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione a variável:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://moocafisio.com.br`
   - **Environment**: Production, Preview, Development (marque todos)
5. Clique em **Save**

## 🔗 Passo 2: Configurar Webhook no Stripe Dashboard

### **Instruções Passo a Passo:**

1. **Acesse o Stripe Dashboard**
   - Vá para: https://dashboard.stripe.com
   - Faça login na sua conta

2. **Navegue até Webhooks**
   - No menu lateral esquerdo, clique em **Developers**
   - Depois clique em **Webhooks**

3. **Adicionar Endpoint**
   - Clique no botão **"Add endpoint"** (ou **"+ Add endpoint"**)

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
   
   Marque os seguintes eventos que você quer receber:
   
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.async_payment_succeeded`
   - ✅ `checkout.session.async_payment_failed`
   
   **Dica:** Você pode também selecionar "Select all events" para receber todos os eventos, mas os listados acima são os essenciais.

6. **Salvar o Endpoint**
   - Clique em **"Add endpoint"** para salvar

7. **Copiar o Signing Secret**
   - Após criar o endpoint, você verá a página de detalhes
   - Na seção **"Signing secret"**, clique em **"Reveal"** ou **"Click to reveal"**
   - Copie o secret (começa com `whsec_...`)
   - **IMPORTANTE:** Este secret já está no seu `.env.local` como `STRIPE_WEBHOOK_SECRET`

8. **Verificar o Webhook**
   - O Stripe enviará um evento de teste para verificar se o endpoint está funcionando
   - Você verá um status verde ✅ se estiver funcionando
   - Se houver erro, verifique:
     - Se a URL está correta
     - Se o servidor está acessível
     - Se o secret está correto no `.env.local`

## 🧪 Testar o Webhook Localmente (Opcional)

Para testar localmente antes de fazer deploy:

1. **Instalar Stripe CLI**
   ```bash
   # Windows (PowerShell)
   scoop install stripe
   
   # Ou baixe de: https://stripe.com/docs/stripe-cli
   ```

2. **Login no Stripe CLI**
   ```bash
   stripe login
   ```

3. **Encaminhar Webhooks para Localhost**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copiar o Webhook Secret**
   - O CLI mostrará um secret temporário (ex: `whsec_...`)
   - Use este secret no `.env.local` para testes locais

5. **Testar Evento**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## 📝 Checklist de Configuração

- [x] Variáveis de ambiente configuradas no `.env.local`
- [ ] Webhook criado no Stripe Dashboard
- [ ] URL do webhook: `https://moocafisio.com.br/api/stripe/webhook`
- [ ] Eventos selecionados no webhook
- [ ] Signing secret copiado e salvo
- [ ] Webhook testado e funcionando
- [ ] Variáveis configuradas na Vercel (para produção)

## 🚀 Próximos Passos

1. **Fazer Deploy na Vercel**
   - Certifique-se de adicionar todas as variáveis de ambiente na Vercel
   - Faça o deploy do projeto

2. **Testar o Fluxo Completo**
   - Criar uma transação no dashboard financeiro
   - Usar o botão de pagamento com Stripe
   - Verificar se o webhook atualiza a transação automaticamente

3. **Monitorar Webhooks**
   - No Stripe Dashboard → Webhooks → Seu endpoint
   - Veja o histórico de eventos recebidos
   - Verifique se há erros

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env.local` no Git (já está no `.gitignore`)
- Use chaves de **teste** para desenvolvimento local
- Use chaves de **produção** apenas em produção
- Mantenha o `STRIPE_WEBHOOK_SECRET` seguro e nunca o compartilhe

## 🆘 Troubleshooting

### Webhook não está recebendo eventos
- Verifique se a URL está acessível publicamente
- Confirme que o secret está correto
- Verifique os logs do servidor para erros

### Erro 401/403 no webhook
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que está usando o secret do endpoint correto

### Eventos não estão sendo processados
- Verifique os logs do servidor
- Confirme que os eventos estão selecionados no webhook
- Verifique se o código de processamento está correto

