# Checklist de Deploy - FisioFlow Next.js

## ✅ Pré-Deploy

### Código e Build

- [x] TypeScript em modo strict configurado
- [x] Todos os módulos implementados
- [x] Componentes shadcn/ui configurados
- [x] Testes E2E criados (estrutura básica)
- [ ] Build local sem erros (`npm run build`)
- [ ] Linter sem erros (`npm run lint`)

### Supabase

- [x] Projeto Supabase Pro configurado
- [x] Clientes Supabase criados (browser, server, middleware)
- [x] RLS policies configuradas
- [x] Edge Functions deployadas
- [ ] Migrations aplicadas
- [x] Storage buckets configurados

### Vercel

- [ ] Projeto criado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Integração Supabase ativada
- [x] Vercel Analytics configurado no código
- [x] Speed Insights configurado no código
- [x] Cron Jobs definidos (vercel.json)

## 🔐 Segurança

### Variáveis de Ambiente

Configurar na Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret)
```

### Segurança do Banco

- [x] RLS habilitado nas tabelas principais
- [ ] Verificar advisors de segurança
- [ ] Políticas de backup configuradas
- [ ] SSL/TLS configurado

## 🚀 Deploy

### Primeira vez

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login na Vercel
vercel login

# 3. Deploy do projeto
cd fisioflow-next
vercel

# 4. Configurar variáveis de ambiente no dashboard

# 5. Deploy de produção
vercel --prod
```

### Deploys Subsequentes

```bash
# Deploy automático via Git
git push origin main

# Ou manual
vercel --prod
```

## ✅ Pós-Deploy

### Verificações Imediatas

- [ ] Site acessível na URL de produção
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Módulos principais funcionando
  - [ ] Pacientes
  - [ ] Agenda
  - [ ] Tratamentos
  - [ ] Financeiro
  - [ ] Portal do Paciente

### Monitoramento

- [ ] Vercel Analytics ativo
- [ ] Speed Insights mostrando métricas
- [ ] Logs do Supabase sem erros críticos
- [ ] Edge Functions respondendo
- [ ] Cron Jobs executando

### Performance

Verificar Core Web Vitals:

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Funcionalidades Inovadoras

- [ ] Análise de movimento com MediaPipe funcional
- [ ] Sistema de IA respondendo
- [ ] Gamificação ativa
- [ ] Notificações sendo enviadas

## 📊 Monitoramento Contínuo

### Diário

- Verificar logs do Supabase
- Verificar Analytics da Vercel
- Verificar execução de Cron Jobs

### Semanal

- Analisar Core Web Vitals
- Revisar feedbacks de usuários
- Verificar advisors de performance/segurança
- Revisar uso de recursos

### Mensal

- Analisar crescimento de dados
- Otimizar queries lentas
- Atualizar dependências
- Revisar políticas de RLS

## 🔧 Troubleshooting

### Build Errors

```bash
# Limpar cache e rebuild
rm -rf .next
npm run build
```

### Errors de Autenticação

1. Verificar variáveis de ambiente
2. Verificar políticas RLS
3. Ver logs do Supabase Auth

### Performance Issues

1. Usar Vercel Speed Insights
2. Verificar queries do banco
3. Otimizar imagens
4. Implementar caching

## 📞 Suporte

### Links Úteis

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Vercel Logs](https://vercel.com/docs/observability/runtime-logs)
- [Supabase Logs via MCP](usar MCPs do Cursor)

### Contatos de Emergência

- Suporte Vercel: support@vercel.com
- Suporte Supabase: support@supabase.com
- Documentação: README.md e MIGRATION_GUIDE.md

## ✨ Próximos Passos

Após deploy bem-sucedido:

1. Comunicar usuários sobre novo sistema
2. Monitorar métricas por 48h
3. Coletar feedback inicial
4. Planejar melhorias incrementais
5. Depreciar sistema antigo (após período de transição)

