# Configuração do Vercel - Instruções

## ⚠️ Ação Necessária no Painel da Vercel

O projeto precisa ser reconfigurado no painel da Vercel para usar Next.js ao invés de Vite.

### Passo 1: Acessar o Projeto

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai
2. Vá em **Settings** → **General**

### Passo 2: Configurar Framework

1. Em **Framework Preset**, selecione: **Next.js**
2. Em **Root Directory**, deixe vazio (raiz do projeto)
3. Em **Build Command**, verifique se está: `npm run build`
4. Em **Output Directory**, deixe vazio (Next.js usa `.next` por padrão)
5. Em **Install Command**, verifique se está: `npm install`
6. Em **Node.js Version**, selecione: **22.x** (já está configurado)

### Passo 3: Configurar Variáveis de Ambiente

Vá em **Settings** → **Environment Variables** e configure:

#### Variáveis de Produção, Preview e Development:

```
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
SUPABASE_SERVICE_ROLE_KEY=[OBTER DO PAINEL DO SUPABASE]
OPENAI_API_KEY=[SUA_CHAVE_OPENAI]
ANTHROPIC_API_KEY=[SUA_CHAVE_ANTHROPIC]
GOOGLE_API_KEY=[SUA_CHAVE_GOOGLE - OPCIONAL]
CRON_SECRET=[GERAR_UMA_STRING_ALEATORIA_SEGURA]
```

**Nota:** O `SUPABASE_SERVICE_ROLE_KEY` pode ser obtido em:
- Supabase Dashboard → Settings → API → service_role key

### Passo 4: Configurar Domínio

1. Vá em **Settings** → **Domains**
2. Adicione ou verifique o domínio: `moocafisio.com.br`
3. Configure os registros DNS conforme instruções da Vercel

### Passo 5: Configurar Cron Jobs

Os cron jobs já estão configurados no `vercel.json`:
- `/api/cron/lembretes-diarios` - Segunda a Sexta às 9h
- `/api/cron/backup-database` - Diariamente às 2h

Certifique-se de que esses endpoints existem no projeto.

### Passo 6: Deploy

Após configurar tudo:
1. Faça commit e push das mudanças
2. O Vercel fará deploy automático
3. Verifique os logs em **Deployments**

## ✅ Checklist

- [ ] Framework alterado para Next.js
- [ ] Root Directory configurado (vazio = raiz)
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Domínio moocafisio.com.br configurado
- [ ] Deploy bem-sucedido
- [ ] Testes funcionando em produção

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:
1. **Analytics**: Vercel Analytics deve estar ativo
2. **Speed Insights**: Vercel Speed Insights deve estar ativo
3. **Logs**: Verificar logs de build e runtime
4. **Domínio**: Acessar moocafisio.com.br e testar funcionalidades

## 📝 Notas

- O projeto antigo (Vite) está em `_OLD_PROJECT/` para referência
- Todos os arquivos do Next.js estão na raiz do projeto
- O `vercel.json` já está configurado corretamente

