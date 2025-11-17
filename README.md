# FisioFlow Next.js

Sistema de gestão completo para clínicas de fisioterapia, construído com Next.js 16, Supabase e shadcn/ui.

> **📌 Migração Completa:** Este projeto foi migrado de React 18 + Vite para Next.js 16 em Novembro de 2025.  
> O código antigo está em `_OLD_PROJECT/` para referência.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **React:** React 19
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI:** shadcn/ui + Tailwind CSS 3.4 + Radix UI
- **TypeScript:** Modo strict habilitado
- **Deploy:** Vercel (CI/CD automático)
- **IA:** OpenAI, Anthropic (Vercel AI SDK)
- **Análise de Movimento:** MediaPipe

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🏗️ Estrutura do Projeto

```
.
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (auth)/            # Rotas públicas (login, signup)
│   │   ├── (dashboard)/       # Dashboard principal
│   │   ├── (portal)/          # Portal do paciente
│   │   └── api/               # API Routes + Cron Jobs
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── features/          # Componentes de negócio
│   ├── lib/
│   │   ├── supabase/          # Clientes Supabase (SSR)
│   │   ├── ai/                # Providers de IA
│   │   └── utils.ts           # Utilitários
│   └── types/
│       └── database.types.ts  # Types do Supabase
├── supabase/
│   └── migrations/            # Migrations do banco
├── _OLD_PROJECT/              # Código legado (Vite) - apenas referência
├── next.config.ts             # Configuração Next.js
├── vercel.json                # Configuração de deploy
└── package.json

## 🎯 Funcionalidades Principais

### Gestão de Pacientes
- Cadastro completo com validação
- Histórico médico
- Documentos e anexos

### Agenda
- Visualização de calendário semanal
- Criação e gestão de agendamentos
- Sistema de notificações

### Tratamentos
- Planos de tratamento personalizados
- Evolução de sessões
- Análise de progresso

### Financeiro
- Dashboard com métricas
- Gestão de pagamentos
- Relatórios

### Portal do Paciente
- Área exclusiva para pacientes
- Visualização de tratamentos
- Próximas consultas

### Inovações com IA

#### Análise de Movimento em Tempo Real
- Detecção de pose com MediaPipe
- Feedback visual sobre execução de exercícios
- Métricas de ângulos articulares

#### Assistente de IA
- Geração de relatórios clínicos
- Sugestões de planos de tratamento
- Análise preditiva

#### Gamificação
- Sistema de pontos e níveis
- Conquistas e badges
- Ranking de engajamento

## 🔐 Autenticação e Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Middleware de proteção de rotas
- TypeScript em modo strict

## 🚀 Deploy na Vercel

### ⚠️ Configuração Inicial Necessária

**IMPORTANTE:** Após a migração, você precisa reconfigurar o projeto no painel da Vercel:

1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings
2. Altere **Framework Preset** de "vite" para **"Next.js"**
3. Configure as variáveis de ambiente (veja `VERCEL_CONFIGURATION.md`)

### Variáveis de Ambiente na Vercel

Configure as seguintes variáveis no dashboard da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (obter no painel Supabase)
- `OPENAI_API_KEY` - Chave da OpenAI
- `ANTHROPIC_API_KEY` - Chave da Anthropic
- `CRON_SECRET` - String aleatória para proteger cron jobs

**📖 Instruções completas:** Veja `VERCEL_CONFIGURATION.md`

### Deploy Automático

Após configurar, o deploy é automático via Git:

```bash
git push origin main
```

Ou deploy manual:

```bash
vercel --prod
```

## 📊 Monitoramento

- **Vercel Analytics:** Métricas de usuários e performance
- **Vercel Speed Insights:** Core Web Vitals
- **Supabase Logs:** Logs de API, Auth e Edge Functions

## 🧪 Testes

```bash
# Executar validação de dados
npm run validate

# Testes E2E (quando configurados)
npm run test:e2e
```

## 📝 Scripts Úteis

```bash
# Validar integridade de dados
npm run validate

# Verificar advisors de segurança
# (usar MCPs do Supabase)

# Ver logs do Supabase
# (usar MCPs do Supabase)
```

## 🎨 Design System

O projeto utiliza shadcn/ui como base do design system:

- Componentes acessíveis (Radix UI)
- Totalmente customizável
- Dark mode suportado
- Responsivo por padrão

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📚 Documentação Adicional

- **`MIGRATION_COMPLETED.md`** - Detalhes completos da migração
- **`VERCEL_CONFIGURATION.md`** - Instruções de configuração do Vercel
- **`_OLD_PROJECT/README.md`** - Informações sobre código legado

## 🔒 Segurança

- ✅ **0 erros de segurança** nos advisors do Supabase
- ✅ RLS habilitado em todas as tabelas críticas
- ✅ Funções com `search_path` fixo
- ✅ Headers de segurança configurados no Next.js
- ✅ Views sem `SECURITY DEFINER`

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para suporte, entre em contato através do email: suporte@fisioflow.com.br

---

**Versão:** v2.0.0-nextjs  
**Última Atualização:** Novembro 2025
