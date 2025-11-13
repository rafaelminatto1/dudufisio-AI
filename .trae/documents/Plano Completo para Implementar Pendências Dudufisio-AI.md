# Plano Completo para Implementar Pendências — Dudufisio-AI

## Sumário Executivo

Este documento orienta a execução, validação e entrega das pendências críticas do projeto, com enfoque em confiabilidade, performance, segurança e experiência do usuário. Abrange migração para TypeScript, validação de Edge Functions, padronização de nomenclatura de banco, monitoramento de performance, análise/otimização de bundle, MVP de análise de movimento com IA, testes integrados (Playwright + Puppeteer), operações Supabase CLI, observabilidade e documentação.

## Critérios de Priorização

* Impacto no usuário e confiabilidade (Edge Function + performance + erros).

* Dependências técnicas (base TS, nomenclatura do DB).

* Risco/maturidade (IA de movimento → MVP e iteração).

## Padrões e Convenções

* Variáveis de ambiente: prefixo `VITE_*` para client; segredos sem `VITE_` (server-side).

* Nomenclatura DB: pt-BR snake\_case para views padronizadas; colunas derivadas com sufixos coerentes.

* Formatação: Markdown com seções claras, listas e blocos de código/lógicas exemplificadas.

* Observabilidade: Sentry habilitado de forma condicional, sem expor segredos no bundle.

## Pendências com Especificações Técnicas

### 1) Migração TypeScript (322 arquivos)

* Requisitos Funcionais:

  * Migrar hooks críticos, contexts e serviços prioritários mantendo comportamento atual.

  * Tipar interfaces de retorno e parâmetros; reduzir any.

* Requisitos Não Funcionais:

  * Passar `type-check`; manter lint sem erros; cobertura mínima nos módulos alterados.

* Dependências/Pré-requisitos:

  * `typescript`, `tsconfig`, ferramentas de lint; padrões de import `@/...` em `tsconfig`.

* Critérios de Aceitação:

  * 72 arquivos de alta prioridade migrados; build sem erros de tipo; testes de fumaça aprovados.

* Entregáveis:

  * Hooks: `useAppointments`, `usePatients`, `useExercises`, `useSupabaseAuth`, `useNotifications`.

  * Contexts: `PatientContext`, `ExerciseContext` → `.tsx`.

  * 8 serviços/repositórios (prioritários conforme inventário).

### 2) Validação Edge Functions (WhatsApp)

* Requisitos Funcionais:

  * Verificar endpoint (GET hub.\*) e processar mensagens (POST) sem bloqueio (Edge Runtime).

* Requisitos Não Funcionais:

  * Latência p95 < 100ms; cold start 0ms; CORS adequado.

* Dependências/Pré-requisitos:

  * Variáveis de verificação, ambientes staging; integração Sentry.

* Critérios de Aceitação:

  * Verificação e processamento aprovados com logs consistentes.

  * Benchmarks e comparação com Node registrados.

* Entregáveis:

  * Relatório de latência (p50/p95/p99); checklist de deploy.

### 3) Padronização de Nomenclatura do Banco

* Requisitos Funcionais:

  * Adotar views padronizadas sem quebrar compatibilidade; atualizar consultas.

* Requisitos Não Funcionais:

  * Zero downtime; testes de regressão aprovados.

* Dependências/Pré-requisitos:

  * Migrations de views; mapeamento de consultas existentes.

* Critérios de Aceitação:

  * Código principal consumindo `paciente_registros`, `agendamento_status`, `prescricoes_exercicios`.

* Entregáveis:

  * Auditoria com plano de atualização gradual; testes de integração.

### 4) Monitoramento de Performance (Frontend/Backend)

* Requisitos Funcionais:

  * Coletar LCP, FID/INP, CLS, FCP, TTFB e long tasks; monitorar p50/p95/p99 e latência de API.

* Requisitos Não Funcionais:

  * Baixo overhead; dashboards utilizáveis por equipe.

* Dependências/Pré-requisitos:

  * `web-vitals`, integração de logs/métricas; endpoints de coleta.

* Critérios de Aceitação:

  * Dashboard com métricas e alertas de degradação.

* Entregáveis:

  * Serviços de coleta; export de relatórios; integrações com analytics.

### 5) Bundle Analysis & Otimização

* Requisitos Funcionais:

  * Visualizer ativo; budgets Lighthouse; redução de chunks grandes por lazy/dynamic imports.

* Requisitos Não Funcionais:

  * Manter funcionalidade; evitar regressões de UX.

* Dependências/Pré-requisitos:

  * `rollup-plugin-visualizer`; revisão de `manualChunks`.

* Critérios de Aceitação:

  * Redução ≥ 20% nos maiores chunks; melhoria em web vitals.

* Entregáveis:

  * Relatório comparativo antes/depois; ajustes em `vite.config.ts`.

### 6) MVP de Análise de Movimento (IA)

* Requisitos Funcionais:

  * Detectar pose e gerar relatório de amplitude, compensações e recomendações.

* Requisitos Não Funcionais:

  * Processamento eficiente; privacidade de dados.

* Dependências/Pré-requisitos:

  * Preferir `@tensorflow-models/pose-detection` (BlazePose/MoveNet); caso MediaPipe Pose, corrigir `locateFile` com paths válidos.

* Critérios de Aceitação:

  * MVP funcional; acurácia inicial ≥ 85% em cenários básicos; relatório exportável.

* Entregáveis:

  * Componente MVP; serviço de análise; exemplos e testes.

### 7) Testes Integrados e Automação MCP

* Requisitos Funcionais:

  * E2E críticos com Playwright; screenshots/PDFs com Puppeteer.

* Requisitos Não Funcionais:

  * Compatível com 3 navegadores; estável em CI.

* Dependências/Pré-requisitos:

  * Instalação de browsers Playwright; cenários configurados; seeds de dados.

* Critérios de Aceitação:

  * Fluxos críticos aprovados; relatórios disponíveis.

* Entregáveis:

  * Suíte E2E; scripts de automação; artefatos de relatório.

### 8) Supabase CLI & Operações

* Requisitos Funcionais:

  * `link/push/pull/migration repair`; CRUD via REST com `service role`.

* Requisitos Não Funcionais:

  * Segurança: uso de `service role` apenas server-side; registros de execução.

* Dependências/Pré-requisitos:

  * `supabase` CLI atualizado; `DATABASE_URL` válido; permissões.

* Critérios de Aceitação:

  * Migrations sincronizadas; CRUD executado com UUID válido; sem erros de permissão.

* Entregáveis:

  * Scripts npm para operações; logs de execução.

### 9) Observabilidade e Segurança

* Requisitos Funcionais:

  * Sentry condicional com sourcemaps; alertas; dashboards.

* Requisitos Não Funcionais:

  * Zero segredos expostos; RLS revisada.

* Dependências/Pré-requisitos:

  * Variáveis Sentry; policies no banco.

* Critérios de Aceitação:

  * Erros rastreados; issues reduzidas; cobertura de logs adequada.

* Entregáveis:

  * Configuração Sentry; guias de segurança.

### 10) Documentação

* Requisitos Funcionais:

  * Playbooks de setup, testes, CI/CD, monitoramento e troubleshooting; ADRs.

* Requisitos Não Funcionais:

  * Consistência; atualizações contínuas; requisitos LGPD.

* Dependências/Pré-requisitos:

  * Acesso a informações e histórico; padrões do projeto.

* Critérios de Aceitação:

  * Documentos completos e úteis; orientação clara para execução.

* Entregáveis:

  * Plano unificado atualizado; guias e ADRs.

## Métricas de Sucesso

* TypeScript: 72 arquivos críticos migrados; `type-check` limpo.

* Edge: p95 < 100ms; verificação/eventos OK.

* DB: views consumidas; regressão aprovada.

* Performance: LCP ≤ 2.5s; TBT ≤ 200ms; CLS ≤ 0.1.

* Bundle: -20% nos maiores chunks.

* IA: MVP funcional com acurácia ≥ 85% nos casos básicos.

* Testes: E2E críticos aprovados em 3 navegadores.

## Cronograma e Marcos (4 semanas)

* Semana 1: Migração TS (hooks), Edge staging, análise de bundle.

* Semana 2: Contexts/serviços TS, DB views, monitor de performance.

* Semana 3: Testes E2E, relatórios Puppeteer, otimização de chunks.

* Semana 4: MVP IA, documentação final, dashboards/alertas.

## Riscos & Mitigação

* Migração TS complexa → incremental, testes, rollback por lote.

* Histórico Supabase divergente → `migration repair` e validação manual.

* Assets MediaPipe → usar TensorFlow Models ou CDN/versões fixas com paths válidos.

## Referências e Documentação Complementar

* `scripts/test-whatsapp-webhook.js:17-44,49-107` — testes de verificação e mensagens.

* `App.tsx:33-42` — inicialização de monitoramento de performance.

* `services/performanceMonitoring.ts:135-165,209-225,230-242` — coleta e relatórios de performance.

* `vite.config.ts:39-45,180-186` — visualizer e sourcemaps condicionais.

* `supabase/migrations/20251112_nomenclature_views.sql` — views padronizadas.

* `docs/TROUBLESHOOTING.md` — guia de ambiente e verificação.

## Atualizações Executadas (12/11/2025)

* Migração TS (lote 1): `useOnlineStatus`, `useRealtimeSubscription`, `useVirtualizedList` migrados; removidas versões JS duplicadas.

* Edge Function (WhatsApp): teste de verificação executado; retorno 500 em produção (gru1). Ação: validar em staging e revisar logs/variáveis do endpoint.

* Supabase Views: leitura opcional via `paciente_registros` integrada em `services/supabase/patientServiceSupabase.ts` (listagem e busca), com fallback para `patients` quando necessário.

* Performance Monitoring: criado `services/performanceMonitoring.ts` com cálculo de ratings, coleta básica e helpers.

* IA Movimento: adicionado `services/movementAnalysis.ts` com import opcional de `@tensorflow-models/pose-detection` e computação de ROM, compensações e recomendações iniciais.

### Próximas Execuções

* Validar Edge em staging com token de bypass Vercel e registrar p50/p95/p99.

* Rodar E2E Playwright em ambiente limpo (CI/local limpo) devido inconsistências no `node_modules`.

* Migrar lote 2 de hooks/contexts/serviços para TS e adicionar testes de integração.

