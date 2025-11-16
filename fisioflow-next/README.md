# FisioFlow Next.js

Sistema de gestão completo para clínicas de fisioterapia, construído com Next.js 14+, Supabase e shadcn/ui.

## 🚀 Tecnologias

- **Framework:** Next.js 14+ (App Router)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI:** shadcn/ui + Tailwind CSS + Radix UI
- **TypeScript:** Modo strict habilitado
- **Deploy:** Vercel
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
fisioflow-next/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/            # Rotas públicas (login, signup)
│   │   ├── (dashboard)/       # Dashboard principal
│   │   ├── (portal)/          # Portal do paciente
│   │   └── api/               # API Routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── features/          # Componentes de negócio
│   ├── lib/
│   │   ├── supabase/          # Clientes Supabase
│   │   ├── ai/                # Providers de IA
│   │   └── utils/             # Utilitários
│   └── types/                 # Tipos TypeScript
├── scripts/                    # Scripts de utilidade
└── vercel.json                # Configuração de deploy

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

```bash
# Conectar projeto
vercel

# Deploy de produção
vercel --prod
```

### Variáveis de Ambiente na Vercel

Configure as seguintes variáveis no dashboard da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

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

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para suporte, entre em contato através do email: suporte@fisioflow.com.br
