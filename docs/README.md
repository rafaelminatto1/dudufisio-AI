# MoocaFisio 🏥

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646cff?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A+-brightgreen)]()

Sistema completo de gestão para clínicas de fisioterapia com inteligência artificial integrada.

> **🏥 MARCA OFICIAL:** MoocaFisio (moocafisio.com.br) - Sistema de gestão inteligente para fisioterapeutas

> **⚠️ POLÍTICA ANTI-CONVÊNIOS**: Este sistema trabalha EXCLUSIVAMENTE com pacientes particulares e NUNCA processará integrações com planos de saúde. Esta é uma regra fundamental do negócio que NÃO pode ser alterada.

---

## 📖 Documentação

A documentação completa do projeto está organizada nos seguintes arquivos:

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Guia completo para desenvolvedores
- **[AI_CONTEXT.md](./AI_CONTEXT.md)** - Guia para LLMs e assistentes de IA
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)** - Regras de negócio e validações
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação de APIs e integrações
- **[CLAUDE.md](./CLAUDE.md)** - Instruções específicas para Claude AI

---

## 🚀 Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Adicionar GEMINI_API_KEY e SUPABASE_URL/KEY

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
npm run start
```

**Acesse**: http://localhost:5175

---

## 📋 Sobre o Projeto

**MoocaFisio** é uma plataforma SaaS completa para gestão de clínicas de fisioterapia, combinando:
- ✅ Gestão de pacientes e prontuários eletrônicos (HL7 FHIR)
- 📅 Agenda inteligente com múltiplos profissionais
- 💰 Controle financeiro completo (apenas particulares)
- 🧠 IA para recomendações clínicas (Google Gemini)
- 📊 Relatórios e analytics avançados
- 📱 Portal do paciente e educador físico
- 🔒 Compliance LGPD/COFFITO

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - Framework UI moderno
- **TypeScript** - Type safety
- **Vite 6** - Build tool ultra-rápido
- **TailwindCSS** - Styling responsivo
- **Shadcn/ui** - Componentes UI modernos
- **React Router v7** - Navegação SPA
- **Framer Motion** - Animações fluidas

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database principal
- **Supabase Auth** - Autenticação
- **Row Level Security (RLS)** - Segurança de dados

### IA & ML
- **Google Gemini API** - IA conversacional
- **Groq SDK** - ML predictions
- **Google Imagen 3** - Geração de imagens clínicas
- **Análise preditiva** - Risk stratification

### Integrações
- **WhatsApp Business API** - Comunicação com pacientes
- **Resend** - Email transacional
- **Stripe** - Pagamentos online
- **Google Calendar** - Sincronização de agenda

---

## 📁 Estrutura do Projeto

```
moocafisio/
├── pages/                    # Páginas da aplicação (lazy loaded)
│   ├── AgendaPage.tsx       # Agenda semanal
│   ├── PatientListPage.tsx  # Lista de pacientes
│   ├── CompleteDashboard.tsx # Dashboard principal
│   └── ...
├── components/              # Componentes React reutilizáveis
│   ├── ui/                 # Componentes base (Shadcn)
│   ├── agenda/             # Componentes de agendamento
│   ├── patient-portal/     # Portal do paciente
│   ├── medical-records/    # Prontuários eletrônicos
│   ├── atendimento/        # Componentes clínicos
│   └── ...
├── services/               # Lógica de negócio e APIs
│   ├── ai/                # Serviços de IA (Gemini, Groq)
│   ├── supabase/          # Client Supabase
│   ├── videoLibraryService.ts
│   └── ...
├── hooks/                  # Custom React hooks
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   ├── PatientContext.tsx
│   └── ...
├── lib/                   # Utilitários e helpers
│   ├── lazyLoading.tsx    # Sistema de lazy loading
│   ├── performance.ts     # Otimizações
│   └── ...
├── types/                 # TypeScript type definitions
│   ├── types.ts
│   ├── patient.ts
│   └── ...
├── supabase/              # Migrations e schemas
│   └── migrations/        # Database migrations SQL
├── tests/                 # Testes automatizados
│   ├── unit/             # Testes unitários (Vitest)
│   └── e2e/              # Testes E2E (Playwright)
├── docs/                  # Documentação de usuário
├── AppRoutes.tsx          # Configuração de rotas principais
├── vite.config.ts         # Configuração Vite otimizada
└── README.md              # Este arquivo
```

---

## 🎯 Funcionalidades Principais

### 1. **Dashboard Inteligente**
- Visão geral de métricas da clínica
- Atendimentos do dia
- Tarefas pendentes
- Insights de IA baseados em dados reais

### 2. **Gestão de Pacientes**
- Cadastro completo (dados pessoais, contatos, endereço)
- Prontuário eletrônico padrão HL7 FHIR
- Histórico de atendimentos (SOAP notes)
- Evoluções clínicas com timestamps
- Anexo de documentos e imagens
- Assinatura digital de documentos

### 3. **Agenda Otimizada**
- Visualização semanal/diária/mensal
- Múltiplos profissionais simultâneos
- Drag & drop de compromissos
- Recorrência automática de sessões
- Integração Google Calendar
- WhatsApp reminders automáticos
- Detecção de conflitos

### 4. **Atendimento Clínico**
- Avaliações especializadas (esportiva, gerontologia, pós-op)
- Biblioteca de 500+ exercícios clínicos
- Protocolos de tratamento baseados em evidências
- BodyMap interativo para mapear dor
- Geração automática de laudos PDF
- Prescrição de exercícios personalizada

### 5. **Inteligência Artificial**
- Recomendações de tratamento (Google Gemini)
- Análise de risco com ML (Groq)
- Predição de evolução clínica
- Sugestões contextuais de exercícios
- Insights de dados de pacientes
- Geração de imagens clínicas (Imagen 3)

### 6. **Financeiro**
- Controle de receitas/despesas
- Gestão de pagamentos particulares
- Relatórios financeiros detalhados
- Gráficos de evolução de receita
- Integração Stripe para pagamentos online
- Dashboard administrativo completo

### 7. **Portal do Paciente**
- Visualizar evolução do tratamento
- Marcar/remarcar consultas
- Acessar exercícios prescritos
- Visualizar laudos e documentos
- Gamificação (badges, conquistas, leaderboard)
- Histórico completo de atendimentos

### 8. **Portal do Educador Físico**
- Gerenciar clientes/atletas
- Protocolos de treinamento esportivo
- Avaliação física detalhada
- Integração com wearables (Apple Health, Fitbit)
- Gestão de grupos de treino

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase (Obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# Google Gemini AI (Obrigatório para IA)
GEMINI_API_KEY=sua_chave_gemini_api

# Groq (Opcional - ML predictions)
GROQ_API_KEY=sua_chave_groq

# WhatsApp Business (Opcional - notificações)
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token_meta

# Resend Email (Opcional - emails transacionais)
RESEND_API_KEY=sua_chave_resend

# Stripe (Opcional - pagamentos online)
VITE_STRIPE_PUBLIC_KEY=sua_chave_publica_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_stripe

# Google Calendar (Opcional - sync agenda)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
```

### Database Setup

1. **Criar projeto no Supabase** (https://supabase.com)
2. **Copiar URL e anon key** para `.env.local`
3. **Rodar migrations SQL**:
```bash
cd supabase/migrations
# Executar cada arquivo SQL no editor SQL do Supabase (em ordem numérica)
```

4. **Popular dados iniciais** (opcional):
```bash
npm run seed:modules
```

---

## 🧪 Testes

```bash
# Testes unitários (Vitest)
npm run test:unit

# Testes unitários em watch mode
npm run test:unit:watch

# Testes E2E (Playwright)
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui

# Testes com cobertura
npm run test:unit:coverage

# Testes de performance
npm run test:performance

# Rodar todos os testes
npm run test:all

# Testes críticos do sistema de evolução
npm run test:critical
npm run test:evolution
npm run test:templates
npm run test:keyboard
```

---

## 🔍 Monitoramento e Segurança

### Auditoria de Segurança

```bash
# Auditoria completa com análise de risco
npm run security:audit

# Verificação rápida
npm run security:check

# Verificar dependências críticas
npm run check:dependencies

# Alertas de vulnerabilidades
npm run alert:vulnerabilities
```

### Monitoramento de Saúde

```bash
# Verificar saúde geral do sistema
npm run monitor:health

# Relatório diário
npm run report:daily
```

### Workflows Automáticos

O projeto inclui workflows GitHub Actions para:

- ✅ **Auditoria Semanal**: Toda segunda às 9h
- ✅ **Testes E2E após Deploy**: Automático
- ✅ **Bundle Size Check**: Em PRs
- ✅ **CI/CD Completo**: Push e PRs

**Ver mais**: [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) | [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)

---

## 📦 Build & Deploy

### Build de Produção

```bash
npm run build
```

O build otimizado será gerado em `dist/` com:
- ✅ Code splitting avançado (15+ chunks inteligentes)
- ✅ Tree shaking agressivo
- ✅ Minificação Terser (drop console.log)
- ✅ Chunks otimizados por feature/domain
- ✅ Bundle size otimizado (~2.5 MB, gzipped ~700 KB)
- ✅ Sourcemaps desabilitados em produção

### Análise de Bundle

```bash
npm run bundle:analyze  # Gera relatório visual
npm run bundle:size     # Mostra tamanho dos chunks
```

### Deploy

#### Vercel (Recomendado)
```bash
vercel --prod
# ou
npm run vercel:deploy
```

**Configurações Vercel**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node Version: 18.x ou superior

#### Outros Provedores
- **Netlify**: Configure `dist` como publish directory
- **CloudFlare Pages**: Configure `npm run build` e `dist`
- **AWS S3 + CloudFront**: Deploy estático do `dist`

---

## 🎨 Customização

### Tema & Cores

O tema pode ser customizado em `index.css`:

```css
:root {
  --primary: 217 91% 60%;        /* Azul principal */
  --secondary: 217 91% 85%;      /* Azul claro */
  --accent: 217 91% 45%;         /* Azul escuro */
  --destructive: 0 84% 60%;      /* Vermelho */
  --success: 142 71% 45%;        /* Verde */
  /* ... outros tokens */
}
```

### Adicionar Componentes Shadcn/ui

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add calendar
npx shadcn@latest add data-table
```

### Adicionar Nova Página

1. Criar arquivo em `pages/MinhaNovaPage.tsx`
2. Adicionar lazy import em `lib/lazyLoading.tsx`
3. Adicionar rota em `pages/CompleteDashboard.tsx`

---

## 🔐 Segurança

- ✅ Autenticação via Supabase Auth (JWT)
- ✅ Row Level Security (RLS) no PostgreSQL
- ✅ CORS configurado corretamente
- ✅ Security headers (CSP, XSS, CSRF)
- ✅ Sanitização de inputs (DOMPurify)
- ✅ Rate limiting no backend
- ✅ Conformidade LGPD completa
- ✅ Conformidade COFFITO (CFM 1821/2007)
- ✅ Assinatura digital de documentos
- ✅ Logs de auditoria

---

## 📊 Performance

### Métricas Atuais (Production Build)
- **Bundle Total**: ~2.5 MB (gzipped: ~700 KB)
- **Largest Chunk**: ~330 KB (export-pdf)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Performance**: > 90

### Otimizações Implementadas
- ✅ Lazy loading de todas as rotas
- ✅ Code splitting inteligente (15+ chunks)
- ✅ Preload de componentes críticos baseado em role
- ✅ Service Worker para caching (PWA ready)
- ✅ Image optimization automática
- ✅ Debounce em searches (300ms)
- ✅ Virtualized lists para grandes datasets
- ✅ React.memo em componentes pesados
- ✅ useMemo/useCallback otimizados
- ✅ Suspense boundaries estratégicos

---

## 🐛 Troubleshooting

### Build Falha

```bash
# Limpar cache e reinstalar
rm -rf node_modules dist .vite
npm install
npm run build
```

### Erro "Cannot read properties of null (reading 'useContext')"

Este erro indica múltiplas instâncias do React. Solução:
```bash
npm run check:fix  # Corrige automaticamente
```

### Problemas com Scripts

Se tiver erro relacionado a `scripts/`, eles foram excluídos do build via `vite.config.ts`.

### Erro de CORS

1. Verificar configuração do Supabase
2. Checar URL no `.env.local`
3. Validar permissões CORS no projeto Supabase

### Problemas de Autenticação

1. Verificar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
2. Checar RLS policies no Supabase
3. Validar tokens de sessão no localStorage
4. Limpar cache: `localStorage.clear()`

---

## 📚 Documentação Adicional

### Para Usuários Finais
- **[docs/GUIA_USUARIO_FISIOTERAPEUTA.md](docs/GUIA_USUARIO_FISIOTERAPEUTA.md)** - Guia para fisioterapeutas
- **[docs/GUIA_USUARIO_PACIENTE.md](docs/GUIA_USUARIO_PACIENTE.md)** - Guia para pacientes
- **[docs/GUIA_USUARIO_ADMIN.md](docs/GUIA_USUARIO_ADMIN.md)** - Guia para administradores
- **[docs/GUIA_USUARIO_EDUCADOR.md](docs/GUIA_USUARIO_EDUCADOR.md)** - Guia para educadores físicos

### Para Desenvolvedores
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Guia técnico completo
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação de APIs
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)** - Regras de negócio
- **[testsprite_tests/](./testsprite_tests/)** - Suíte de testes (25 casos de teste)

### Para IAs e LLMs
- **[AI_CONTEXT.md](./AI_CONTEXT.md)** - Contexto para assistentes de IA
- **[CLAUDE.md](./CLAUDE.md)** - Instruções específicas para Claude

### Histórico
- **[.archive_docs/](.archive_docs/)** - Documentação histórica arquivada

---

## 🚀 Roadmap

### Próximas Features
- [ ] Integração com Apple Health / Google Fit
- [ ] Telemedicina (videochamadas)
- [ ] App mobile nativo (React Native)
- [ ] Prescrição de medicamentos fisioterápicos
- [ ] Sistema de mentoria/supervisão
- [ ] Integração com PACS (imagens médicas)
- [ ] Análise de marcha com IA
- [ ] Dashboard de business intelligence avançado

---

## 🤝 Contribuindo

Este é um projeto privado/proprietário. Entre em contato para mais informações sobre contribuições.

---

## 📄 Licença

**Proprietary** - Todos os direitos reservados © 2025

Este software é proprietário e confidencial. Uso, reprodução ou distribuição não autorizada é estritamente proibida.

---

## 📞 Suporte & Contato

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@moocafisio.com.br
- 💬 WhatsApp Business: +55 (XX) XXXX-XXXX
- 🌐 Site: https://moocafisio.com.br

---

**Desenvolvido com ❤️ usando React 19, TypeScript, Supabase e Google Gemini AI**

_Última atualização: 09 de Outubro de 2025_





