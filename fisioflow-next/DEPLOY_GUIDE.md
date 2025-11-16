# 🚀 Guia de Deploy - FisioFlow Next.js

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- [ ] Conta na Vercel (https://vercel.com)
- [ ] Projeto Supabase configurado
- [ ] Chaves de API (OpenAI, Anthropic, etc.)
- [ ] Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🔧 Preparação do Projeto

### 1. Variáveis de Ambiente

Crie as seguintes variáveis no painel da Vercel:

#### **Supabase** (Obrigatório)
```
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### **APIs de IA** (Opcional mas recomendado)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=your_google_key
```

#### **Produção**
```
NEXT_PUBLIC_BASE_URL=https://seu-dominio.vercel.app
CRON_SECRET=gere_um_secret_aleatorio
```

### 2. Build Local (Teste)

```bash
# Testar build localmente
npm run build

# Iniciar modo produção
npm start
```

---

## 🌐 Deploy na Vercel

### Opção 1: Via CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### Opção 2: Via GitHub (Automático)

1. **Conectar Repositório**
   - Acesse https://vercel.com/new
   - Conecte seu repositório GitHub
   - Selecione o projeto `fisioflow-next`

2. **Configurar Build**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (ou path do projeto)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Adicionar Variáveis de Ambiente**
   - Vá em Settings > Environment Variables
   - Adicione todas as variáveis listadas acima
   - Separe por ambiente (Production, Preview, Development)

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar (~2-5 min)
   - Acesse a URL gerada

---

## 🔍 Verificação Pós-Deploy

### Checklist de Funcionalidades

- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Sidebar aparece corretamente
- [ ] Pacientes lista corretamente
- [ ] Agenda funciona
- [ ] Geração de laudo IA funciona
- [ ] Imagens carregam
- [ ] Fontes carregam
- [ ] CSS aplicado corretamente

### Comandos de Verificação

```bash
# Ver logs em tempo real
vercel logs

# Ver deployments
vercel ls

# Ver domínios
vercel domains ls

# Rollback para versão anterior
vercel rollback
```

---

## 🎯 Configurações Avançadas

### Domínio Customizado

```bash
# Adicionar domínio
vercel domains add moocafisio.com.br

# Configurar DNS
# A/AAAA: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

### Headers de Segurança

Adicione em `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ]
}
```

### Redirects

```typescript
async redirects() {
  return [
    {
      source: '/old-path',
      destination: '/new-path',
      permanent: true,
    },
  ]
}
```

---

## 📊 Monitoramento

### Vercel Analytics

Já está integrado! Acesse:
- https://vercel.com/seu-projeto/analytics

### Speed Insights

Métricas de performance em tempo real:
- Core Web Vitals
- Real User Monitoring
- Performance Score

### Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Filtrar por tipo
vercel logs --type error
```

---

## 🔄 CI/CD Automático

### Fluxo Padrão

```
1. Push para branch → Vercel cria Preview Deploy
2. Merge para main → Vercel faz Production Deploy
3. Rollback se necessário → Versão anterior volta
```

### Proteção de Branch

Configure no GitHub:
- Require pull request reviews
- Require status checks (Vercel)
- Require branches to be up to date

---

## 🐛 Troubleshooting

### Build Falhando

```bash
# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Build local
npm run build
```

### Variáveis de Ambiente

```bash
# Verificar variáveis
vercel env ls

# Adicionar variável
vercel env add VARIABLE_NAME

# Remover variável
vercel env rm VARIABLE_NAME
```

### Erros 500

1. Verifique logs: `vercel logs`
2. Verifique variáveis de ambiente
3. Teste localmente: `npm run build && npm start`
4. Verifique conexão com Supabase

### Erros de Build

```
Error: Module not found

Solução:
1. Verificar imports
2. Verificar tsconfig.json
3. Limpar cache e rebuildar
```

---

## 🔐 Segurança

### Secrets no Vercel

```bash
# Nunca commitar .env.local
# Usar Vercel Environment Variables

# Rotacionar chaves periodicamente
# Usar diferentes keys para produção/dev
```

### Proteção de Rotas Sensíveis

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // Verificar autenticação
  // Verificar permissões
  // Rate limiting
}
```

---

## 📈 Performance

### Otimizações Aplicadas

✅ Image Optimization (Next.js)
✅ Automatic Code Splitting
✅ Server Components (RSC)
✅ Edge Runtime
✅ CDN Global (70+ regiões)

### Métricas Alvo

- **FCP:** < 1.8s
- **LCP:** < 2.5s
- **TTI:** < 3.8s
- **CLS:** < 0.1

---

## 🎉 Deploy Completo!

Após seguir este guia, você terá:

✅ Aplicação rodando em produção
✅ CI/CD automático configurado
✅ Monitoramento ativo
✅ Backups automáticos
✅ SSL/HTTPS ativado
✅ CDN global configurado

### URLs Importantes

```
Produção: https://seu-dominio.vercel.app
Vercel Dashboard: https://vercel.com/seu-usuario/fisioflow-next
Analytics: https://vercel.com/seu-usuario/fisioflow-next/analytics
Logs: https://vercel.com/seu-usuario/fisioflow-next/logs
```

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Discord Vercel:** https://vercel.com/discord

---

**Última Atualização:** 16/11/2025  
**Versão:** 1.0

