# 📋 Arquivo `.env.local` - Pronto para Copiar

## ✅ Credenciais Já Configuradas

- ✅ WhatsApp Business API
- ✅ Resend Email  
- ✅ CRON_SECRET: `U8Ase5QuLpjkzNPVbw726IyYCTO0XJgv`
- ✅ Webhook Token: `CvdPuLDBi3tbVchqQOpGHfz7IsFl14eo`

## 📝 O que fazer

1. **Abra o arquivo `.env.local`** na raiz do projeto
2. **Copie o conteúdo** do arquivo `ENV_LOCAL_FINAL.txt`
3. **Substitua apenas as 3 linhas do Supabase** com suas credenciais reais
4. **Salve o arquivo**

## 🔑 Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (clique em "Reveal")

## 📄 Conteúdo Completo

Veja o arquivo `ENV_LOCAL_FINAL.txt` - está tudo pronto, só falta preencher o Supabase!

## ✅ Após Preencher

1. Salve o arquivo `.env.local`
2. Reinicie o servidor: `npm run dev`
3. Teste a conexão - se não houver erros, está funcionando!

---

**⚠️ IMPORTANTE**: Nunca commite o `.env.local` no Git!

