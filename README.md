# DuduFisio AI - Sistema de Prontuário Eletrônico Médico

Sistema avançado de prontuário eletrônico médico para fisioterapia, desenvolvido com padrões HL7 FHIR, assinatura digital e compliance com regulamentações brasileiras (CFM/COFFITO/LGPD).

## 🚀 Características Principais

- **Padrão HL7 FHIR**: Interoperabilidade completa com sistemas de saúde
- **Assinatura Digital**: Documentos clinicamente seguros e legalmente válidos
- **Compliance Total**: Atendimento às regulamentações CFM, COFFITO e LGPD
- **Templates Dinâmicos**: Formulários clínicos personalizáveis por especialidade
- **Versionamento**: Controle completo de versões de documentos
- **Auditoria**: Trilha de auditoria para todos os acessos e modificações
- **Interface Moderna**: UI/UX otimizada com shadcn/ui

## 🏗️ Arquitetura

### Backend
- **Supabase**: Banco de dados PostgreSQL com RLS
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática completa
- **Row Level Security**: Segurança granular de dados

### Frontend
- **React 18**: Interface moderna e responsiva
- **shadcn/ui**: Componentes de UI de alta qualidade
- **Tailwind CSS**: Estilização utilitária
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

### Testes
- **Playwright**: Testes end-to-end automatizados
- **Testes de Integração**: Validação de fluxos clínicos
- **Testes de Segurança**: Verificação de compliance

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/dudufisio-ai.git
cd dudufisio-ai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
NEXTAUTH_SECRET=sua_chave_secreta_nextauth
NEXTAUTH_URL=http://localhost:3000
```

4. **Execute as migrações do banco**
```bash
npx supabase db push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Testes

### Executar todos os testes
```bash
npm run test
```

### Executar testes com interface
```bash
npm run test:ui
```

### Executar testes em modo debug
```bash
npm run test:debug
```

### Visualizar relatório de testes
```bash
npm run test:report
```

## 🚀 Deploy

### Deploy no Vercel

1. **Instale o Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure as variáveis de ambiente no Vercel**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

3. **Faça o deploy**
```bash
npm run vercel:deploy
```

### Deploy de Preview
```bash
npm run vercel:preview
```

## 📊 Estrutura do Projeto

```
dudufisio-ai/
├── app/                    # Next.js App Router
├── components/             # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   └── medical-records/   # Componentes específicos do sistema
├── lib/                   # Lógica de negócio
│   ├── medical-records/   # Sistema de prontuários
│   │   ├── fhir/         # Recursos FHIR
│   │   ├── clinical/     # Entidades clínicas
│   │   └── compliance/   # Validadores de compliance
│   └── supabase/         # Cliente Supabase
├── types/                 # Definições TypeScript
├── tests/                 # Testes Playwright
├── supabase/             # Migrações e configurações
└── public/               # Arquivos estáticos
```

## 🔒 Segurança

- **Row Level Security (RLS)**: Controle granular de acesso aos dados
- **Assinatura Digital**: Documentos clinicamente seguros
- **Auditoria Completa**: Rastreamento de todas as ações
- **Compliance LGPD**: Proteção de dados pessoais
- **Validação FHIR**: Conformidade com padrões internacionais

## 📈 Performance

- **Índices Otimizados**: Consultas de banco otimizadas
- **Políticas RLS Consolidadas**: Redução de overhead
- **Lazy Loading**: Carregamento sob demanda
- **Caching Inteligente**: Cache de consultas frequentes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@dudufisio.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/dudufisio-ai/issues)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - Componentes de UI
- [Playwright](https://playwright.dev) - Testes automatizados
- [Vercel](https://vercel.com) - Plataforma de deploy