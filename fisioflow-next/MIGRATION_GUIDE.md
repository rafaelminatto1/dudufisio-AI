# Guia de Migração: Vite para Next.js

Este documento descreve o processo de migração do FisioFlow de uma arquitetura Vite + Module Federation para Next.js 14+ com App Router.

## 🎯 Objetivos da Migração

1. ✅ Simplificar a arquitetura (eliminar complexidade de micro-frontends)
2. ✅ Melhorar performance com otimizações nativas do Next.js
3. ✅ Pagar dívida técnica (TypeScript strict mode)
4. ✅ Aproveitar SSR e RSC para melhor SEO e UX
5. ✅ Integração nativa com Vercel e Supabase

## 📊 Status da Migração

### ✅ Concluído

- [x] Projeto Next.js criado com TypeScript strict
- [x] shadcn/ui configurado
- [x] Clientes Supabase (browser, server, middleware)
- [x] Autenticação completa (login, signup, recuperação)
- [x] Middleware de proteção de rotas
- [x] Dashboard layout (sidebar + header)
- [x] Módulo de Pacientes (CRUD completo)
- [x] Módulo de Agenda (calendário semanal)
- [x] Módulo de Tratamentos
- [x] Módulo Financeiro (dashboard com métricas)
- [x] Portal do Paciente
- [x] Análise de Movimento com MediaPipe
- [x] Consolidação de providers de IA
- [x] Sistema de Gamificação
- [x] Edge Functions do Supabase
- [x] Cron Jobs da Vercel
- [x] Vercel Analytics e Speed Insights
- [x] Logging e debugging com MCPs

### 🔄 Em Progresso

- [ ] Testes E2E adaptados
- [ ] Deploy final para produção
- [ ] Depreciação do sistema Vite antigo

## 🏗️ Arquitetura

### Antes (Vite + Module Federation)

```
Sistema Antigo/
├── packages/
│   ├── host/                  # App principal
│   ├── agenda-pacientes/      # Micro-frontend
│   ├── tratamentos/           # Micro-frontend
│   ├── financeiro/            # Micro-frontend
│   └── patient-portal/        # Micro-frontend
├── vite.config.ts             # Configuração complexa
└── Multiple builds
```

### Depois (Next.js 14+)

```
fisioflow-next/
├── src/app/
│   ├── (auth)/               # Rotas públicas
│   ├── (dashboard)/          # Dashboard unificado
│   ├── (portal)/             # Portal do paciente
│   └── api/                  # API Routes
├── src/components/
├── src/lib/
└── Single unified build
```

## 🔄 Mapeamento de Rotas

| Sistema Antigo | Next.js | Status |
|----------------|---------|--------|
| `/` | `/dashboard` | ✅ |
| `/login` | `/login` | ✅ |
| `/pacientes` | `/dashboard/pacientes` | ✅ |
| `/agenda` | `/dashboard/agenda` | ✅ |
| `/tratamentos` | `/dashboard/tratamentos` | ✅ |
| `/financeiro` | `/dashboard/financeiro` | ✅ |
| `/portal-paciente` | `/portal` | ✅ |

## 📝 Checklist de Migração

### Infraestrutura

- [x] Criar projeto Next.js
- [x] Configurar Supabase
- [x] Configurar Vercel
- [x] Configurar variáveis de ambiente
- [x] Configurar TypeScript strict mode

### Autenticação

- [x] Implementar login
- [x] Implementar signup
- [x] Implementar recuperação de senha
- [x] Middleware de proteção de rotas
- [x] Gestão de sessão

### Módulos Core

- [x] Pacientes (listagem, cadastro, edição)
- [x] Agenda (calendário, agendamentos)
- [x] Tratamentos (planos, evolução)
- [x] Financeiro (dashboard, pagamentos)
- [x] Portal do Paciente

### Features Inovadoras

- [x] Análise de movimento (MediaPipe)
- [x] IA para relatórios e sugestões
- [x] Gamificação
- [x] Notificações automatizadas

### Deploy e Monitoramento

- [x] Vercel Analytics
- [x] Speed Insights
- [x] Edge Functions
- [x] Cron Jobs
- [ ] Deploy de produção
- [ ] Testes E2E

## 🚀 Deploy

### Pré-requisitos

1. Conta na Vercel
2. Projeto Supabase Pro
3. Variáveis de ambiente configuradas

### Processo de Deploy

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link do projeto
vercel link

# 4. Deploy de preview
vercel

# 5. Deploy de produção
vercel --prod
```

### Variáveis de Ambiente

Configure no dashboard da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Validação

### Scripts de Validação

```bash
# Validar integridade de dados
npm run validate

# Build local
npm run build

# Testar build
npm start
```

### Checklist de Validação

- [ ] Todos os módulos funcionais
- [ ] Autenticação funcionando
- [ ] RLS policies configuradas
- [ ] Edge Functions deployadas
- [ ] Cron Jobs configurados
- [ ] Analytics configurado
- [ ] Performance aceitável (Core Web Vitals)

## 📊 Métricas de Sucesso

### Performance

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Time to First Byte | TBD | TBD | TBD |
| First Contentful Paint | TBD | TBD | TBD |
| Largest Contentful Paint | TBD | TBD | TBD |
| Time to Interactive | TBD | TBD | TBD |

### Build

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Tempo de Build | ~5 min | TBD | TBD |
| Tamanho do Bundle | ~2MB | TBD | TBD |
| Complexidade | Alta | Baixa | ✅ |

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**: Verificar variáveis de ambiente
2. **RLS errors**: Verificar políticas no Supabase
3. **Build errors**: Verificar tipos TypeScript
4. **Deploy errors**: Verificar logs na Vercel

### Logs e Debugging

```bash
# Ver logs do Supabase (usar MCPs)
# Ver logs da Vercel
vercel logs

# Build local com debug
npm run build -- --debug
```

## 📞 Suporte

Para dúvidas sobre a migração, consulte:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🎉 Próximos Passos

Após a migração completa:

1. Monitorar métricas de performance
2. Coletar feedback dos usuários
3. Otimizar queries do banco de dados
4. Implementar features adicionais
5. Melhorar cobertura de testes

