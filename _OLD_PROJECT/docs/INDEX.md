# 📚 Índice de Documentação - DuduFisio-AI

Este arquivo serve como ponto de entrada para toda a documentação do projeto.

---

## 🚀 Quick Start

**Novo no projeto?** Comece aqui:

1. **[README.md](./README.md)** - Visão geral e início rápido
2. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Guia completo para desenvolvedores
3. **[AI_CONTEXT.md](./AI_CONTEXT.md)** - Se você é uma IA/LLM, comece aqui

---

## 📖 Documentação Principal

### Para Desenvolvedores

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Guia técnico completo: arquitetura, stack, padrões, setup | 600+ |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | APIs, Supabase, services, integrações | 700+ |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Regras de negócio, validações, LGPD, fluxos | 900+ |

### Para IAs e LLMs

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [AI_CONTEXT.md](./AI_CONTEXT.md) | Contexto específico para assistentes de IA | 800+ |
| [CLAUDE.md](./CLAUDE.md) | Instruções para Claude AI | 300+ |

### Para Usuários Finais

| Documento | Tipo |
|-----------|------|
| [docs/GUIA_USUARIO_FISIOTERAPEUTA.md](./docs/GUIA_USUARIO_FISIOTERAPEUTA.md) | Fisioterapeutas |
| [docs/GUIA_USUARIO_PACIENTE.md](./docs/GUIA_USUARIO_PACIENTE.md) | Pacientes |
| [docs/GUIA_USUARIO_ADMIN.md](./docs/GUIA_USUARIO_ADMIN.md) | Administradores |
| [docs/GUIA_USUARIO_EDUCADOR.md](./docs/GUIA_USUARIO_EDUCADOR.md) | Educadores Físicos |

---

## 📊 Relatórios de Implementação

### Relatórios Atuais

| Documento | Descrição |
|-----------|-----------|
| [FINAL_IMPLEMENTATION_REPORT.md](./FINAL_IMPLEMENTATION_REPORT.md) | **📌 COMECE AQUI** - Relatório final consolidado |
| [SESSION_REPORT.md](./SESSION_REPORT.md) | Detalhes da última sessão de implementação |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Resumo do que foi implementado |
| [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) | Progresso geral do projeto |

### Relatórios Históricos

| Documento | Descrição |
|-----------|-----------|
| [testsprite_tests/testsprite-comprehensive-test-report.md](./testsprite_tests/testsprite-comprehensive-test-report.md) | Relatório TestSprite MCP |
| [testsprite_tests/RESOLUCAO_COMPLETA.md](./testsprite_tests/RESOLUCAO_COMPLETA.md) | Resolução de problemas TestSprite |
| [testsprite_tests/IMPLEMENTATION_REPORT.md](./testsprite_tests/IMPLEMENTATION_REPORT.md) | Implementação de testes |

---

## 🔥 Hotfixes e Otimizações

### Hotfix de Produção - 3 Nov 2025

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [SESSAO_HOTFIX_03_NOV_2025.md](./SESSAO_HOTFIX_03_NOV_2025.md) | **📌 INÍCIO** - Resumo executivo do hotfix (62min) | 300+ |
| [HOTFIX_PRODUCTION_ERROR.md](./HOTFIX_PRODUCTION_ERROR.md) | Análise detalhada do erro "format is not defined" | 580+ |

### Otimização de Performance - 4 Nov 2025

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [SESSAO_OTIMIZACAO_COMPLETA_04_NOV.md](./SESSAO_OTIMIZACAO_COMPLETA_04_NOV.md) | **📌 RESUMO COMPLETO** - Sessão de 4h de otimização | 800+ |
| [FASE_2_RESULTADOS_FINAIS.md](./FASE_2_RESULTADOS_FINAIS.md) | Resultados da Fase 2 (vendor-misc -45%) | 600+ |
| [BUNDLE_OPTIMIZATION_PLAN.md](./BUNDLE_OPTIMIZATION_PLAN.md) | Plano detalhado de otimização de bundles | 500+ |

### Runbooks e Procedimentos

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md](./RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md) | Procedimentos para problemas de cache do Vercel | 300+ |
| [SENTRY_MONITORING_SETUP.md](./SENTRY_MONITORING_SETUP.md) | Configuração completa de monitoramento Sentry | 400+ |

---

## 🎨 Sistema de Design

### Tipografia e UI - 5 Nov 2025

| Documento | Descrição | Linhas |
|-----------|-----------|--------|
| [docs/TYPOGRAPHY_GUIDE.md](./docs/TYPOGRAPHY_GUIDE.md) | **📌 GUIA COMPLETO** - Sistema tipográfico hierárquico | 400+ |
| [src/components/ui/Typography.README.md](./src/components/ui/Typography.README.md) | Quick start e referência rápida | 100+ |
| [src/components/examples/TypographyExamples.tsx](./src/components/examples/TypographyExamples.tsx) | 7 exemplos práticos de implementação | 500+ |

**Componentes**: H1, H2, H3, Body, Small, Caption, NumericValue, Label  
**Acessibilidade**: WCAG AA/AAA validado  
**Fonte**: Inter (Google Fonts)

---

## 🛠️ Recursos Técnicos

### Código Implementado

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| [src/components/ui/Typography.tsx](./src/components/ui/Typography.tsx) | **NOVO** - 8 componentes tipográficos reutilizáveis | 150+ |
| [lib/validators/index.ts](./lib/validators/index.ts) | Validadores centralizados + 12 schemas Zod | 500+ |
| [lib/guards/AuthGuard.tsx](./lib/guards/AuthGuard.tsx) | Proteção de autenticação | 80+ |
| [lib/guards/RoleGuard.tsx](./lib/guards/RoleGuard.tsx) | Proteção RBAC (4 roles, 65+ permissões) | 200+ |
| [lib/middleware/errorHandler.ts](./lib/middleware/errorHandler.ts) | 8 classes de erro + handlers | 400+ |
| [lib/middleware/logger.ts](./lib/middleware/logger.ts) | Sistema de logging estruturado | 300+ |

### Scripts de Automação

#### Deployment e Validação

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| [scripts/validate-deployment.js](./scripts/validate-deployment.js) | ✨ Validação completa de deployment (site, bundles, headers) | 350 |
| [scripts/verify-bundle-hash.js](./scripts/verify-bundle-hash.js) | ✨ Verificação de bundle hash (detecta cache) | 400 |
| [scripts/validate-sentry-setup.js](./scripts/validate-sentry-setup.js) | ✨ Validação de configuração do Sentry | 250 |
| [scripts/analyze-bundle-size.cjs](./scripts/analyze-bundle-size.cjs) | ✨ Análise detalhada de bundle size | 300 |
| [scripts/find-uncategorized-deps.cjs](./scripts/find-uncategorized-deps.cjs) | ✨ Identificar deps não categorizadas | 200 |

#### CI/CD Workflows

| Arquivo | Descrição |
|---------|-----------|
| [.github/workflows/verify-deployment.yml](./.github/workflows/verify-deployment.yml) | ✨ Workflow automático de validação pós-deploy |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | Pipeline CI/CD |

#### Outros Scripts

| Arquivo | Descrição |
|---------|-----------|
| [scripts/validate-project.sh](./scripts/validate-project.sh) | Validação completa do projeto |
| [scripts/migrate-to-typescript.sh](./scripts/migrate-to-typescript.sh) | Migração .jsx → .tsx |
| [.husky/pre-commit](./.husky/pre-commit) | Pre-commit hooks |

---

## 🎯 Testes

### TestSprite MCP

| Arquivo | Descrição |
|---------|-----------|
| [testsprite_tests/testsprite_frontend_test_plan.json](./testsprite_tests/testsprite_frontend_test_plan.json) | 25 casos de teste (TC001-TC025) |
| [testsprite_tests/standard_prd.json](./testsprite_tests/standard_prd.json) | PRD padronizado |
| [testsprite_tests/tmp/code_summary.json](./testsprite_tests/tmp/code_summary.json) | Resumo de código (28 features) |

### Testes Implementados

| Pasta | Tipo |
|-------|------|
| [tests/unit/](./tests/unit/) | Testes unitários |
| [tests/integration/](./tests/integration/) | Testes de integração |
| [tests/e2e/](./tests/) | Testes end-to-end (Playwright) |

---

## 🔍 Navegação por Tópico

### Arquitetura
- [DEVELOPER_GUIDE.md#arquitetura-do-projeto](./DEVELOPER_GUIDE.md#arquitetura-do-projeto)
- [AI_CONTEXT.md#arquitetura-simplificada](./AI_CONTEXT.md#arquitetura-simplificada)

### Stack Tecnológico
- [DEVELOPER_GUIDE.md#stack-tecnológico](./DEVELOPER_GUIDE.md#stack-tecnológico)
- [README.md#stack-tecnológica](./README.md#stack-tecnológica)

### Padrões de Código
- [DEVELOPER_GUIDE.md#padrões-de-código](./DEVELOPER_GUIDE.md#padrões-de-código)
- [AI_CONTEXT.md#padrões-e-convenções](./AI_CONTEXT.md#padrões-e-convenções)

### Regras de Negócio
- [BUSINESS_RULES.md](./BUSINESS_RULES.md)
- [AI_CONTEXT.md#regras-de-negócio-resumo](./AI_CONTEXT.md#regras-de-negócio-resumo)

### APIs e Integrações
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [API_DOCUMENTATION.md#integração-supabase](./API_DOCUMENTATION.md#integração-supabase)
- [API_DOCUMENTATION.md#integração-google-gemini-ai](./API_DOCUMENTATION.md#integração-google-gemini-ai)

### Validações
- [lib/validators/index.ts](./lib/validators/index.ts)
- [BUSINESS_RULES.md#regras-de-validação-de-dados](./BUSINESS_RULES.md#regras-de-validação-de-dados)

### Segurança
- [lib/guards/](./lib/guards/)
- [BUSINESS_RULES.md#regras-de-permissões-rbac](./BUSINESS_RULES.md#regras-de-permissões-rbac)
- [BUSINESS_RULES.md#regras-de-segurança-e-lgpd](./BUSINESS_RULES.md#regras-de-segurança-e-lgpd)

### Testes
- [testsprite_tests/](./testsprite_tests/)
- [DEVELOPER_GUIDE.md#testes](./DEVELOPER_GUIDE.md#testes)

### Troubleshooting
- [DEVELOPER_GUIDE.md#troubleshooting](./DEVELOPER_GUIDE.md#troubleshooting)
- [AI_CONTEXT.md#troubleshooting-rápido](./AI_CONTEXT.md#troubleshooting-rápido)

---

## 🔗 Links Úteis

### Documentação Externa
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/)
- [Google Gemini](https://ai.google.dev/docs)

### Repositório
- Issues
- Pull Requests
- Discussions

### Ferramentas de Documentação

| Documento | Descrição |
|-----------|-----------|
| [docs/DOCVIEW_TRAE.md](./docs/DOCVIEW_TRAE.md) | Guia para visualizar e manter docs no Trae |

---

## 📅 Última Atualização

**Data:** Janeiro 2025  
**Versão Docs:** 1.0  
**Status:** ✅ Documentação Completa

---

## 💡 Dica para Novos Colaboradores

**Primeiro Dia:**
1. Leia [README.md](./README.md)
2. Leia [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
3. Configure o ambiente local
4. Execute `npm run dev`

**Primeira Tarefa:**
1. Leia [AI_CONTEXT.md](./AI_CONTEXT.md)
2. Leia [BUSINESS_RULES.md](./BUSINESS_RULES.md)
3. Explore o código em `components/ui/`
4. Crie um componente simples seguindo os padrões

**Primeira Semana:**
1. Leia [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Entenda os services principais
3. Execute os testes: `npm test`
4. Contribua com sua primeira feature

---

**Bem-vindo ao DuduFisio-AI! 🏥**

