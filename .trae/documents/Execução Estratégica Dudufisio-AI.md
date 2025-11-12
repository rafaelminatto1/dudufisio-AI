## Contexto e Objetivos

* Plataforma SaaS para clínicas de fisioterapia, com front-end React/Vite, serviços Supabase, IA (Gemini/Groq), testes (Vitest/Playwright), Storybook, observabilidade (Sentry) e deploy alvo Vercel.

* Objetivos imediatos: garantir confiabilidade, performance, segurança (envs/segredos), cobertura de testes, monitoramento contínuo e clareza documental.

## Variáveis-Chave, Recursos e Obstáculos

* Variáveis-chave: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, chaves IA (Gemini/Groq), Sentry (`SENTRY_DSN`), Stripe/SMTP/WhatsApp, `NEXTAUTH_SECRET`, `JWT_SECRET`.

* Recursos: Supabase (Auth/Postgres/Edge), Vercel, Playwright/Lighthouse, Sentry, Tailwind/shadcn, Storybook, MCP server.

* Obstáculos: `docker-compose.yml` vazio, TS strict parcial, coexistência Vite/Next, envs sensíveis em `.env.vercel.required`, plugin Sentry Vite desativado, lacunas de testes e múltiplas variantes de `vite.config`.

## Plano de Ação com Marcos

* Fase 1 — Diagnóstico e Higiene de Ambiente (Dia 1–2)

  * Mapear e validar todas variáveis de ambiente com templates (`.env.example` e vercel required).

  * Normalizar `vite.config` ativo e remover variantes obsoletas.

  * Revisar paths TS e strictness mínima segura; registrar TODOs de migração para strict total.

* Fase 2 — Segurança e Configuração (Dia 2–3)

  * Garantir RLS ativa e políticas críticas no Supabase (pacientes, agenda, financeiro).

  * Isolar segredos server-side; evitar exposição em build Vite.

  * Habilitar sourcemaps e integração Sentry nos builds relevantes.

* Fase 3 — Testes e Qualidade (Dia 3–5)

  * Expandir testes unitários em serviços críticos (supabase, teleconsulta, AI providers).

  * Consolidar Playwright E2E para fluxos essenciais (login, agendamento, pagamento, teleconsulta básica).

  * Implantar suíte de performance com budgets (Lighthouse e tamanho de bundle/chunks).

* Fase 4 — Performance e UX (Dia 5–7)

  * Auditar code splitting e tree-shaking; reduzir payload inicial.

  * Otimizar Tailwind/shadcn scan e purge; revisar assets pesados.

* Fase 5 — Observabilidade e Operação (Dia 7–8)

  * Configurar health checks, alertas Sentry, relatórios diários.

  * Integrar métricas web vitals (Vercel Analytics/Speed Insights) e consolidação em dashboard.

* Fase 6 — Documentação e Replicabilidade (Contínuo)

  * Atualizar `docs/README.md` com instruções de setup, testes, deploy, troubleshooting.

  * Registrar decisões arquiteturais (ADR) e guias de segurança/privacidade LGPD.

## Métricas de Sucesso

* Testes: cobertura `>= 70%` em serviços críticos; `>= 95%` de pass rate E2E em fluxos essenciais.

* Performance: Lighthouse PWA/Best Practices/SEO `>= 90`, LCP `<= 2.5s`, TBT `<= 200ms`, CLS `<= 0.1`.

* Build: bundle inicial `<= 200KB` gzip por rota crítica; número de chunks críticos reduzido.

* Confiabilidade: erro rate Sentry `<= 1%` em produção; tempo de resposta API `<= 300ms` p95.

* Segurança: zero segredos em client bundle; políticas RLS cobrindo 100% das tabelas sensíveis.

## Implementação Otimizada

* Eficiência: priorizar refatorações com maior impacto no payload e nas rotas mais usadas.

* Escalabilidade: modularizar serviços `services/*` com contratos tipados; evitar acoplamento entre workspaces.

* Sustentabilidade: padronizar scripts (`dev/build/test/perf`) e documentação; garantir atualizações fáceis.

## Monitoramento e Ajuste Contínuo

* Health checks e alertas: configurar thresholds para erros e latência, com automação de incidentes.

* Performance watch: rotinas Lighthouse CI em PRs e cron jobs; revisão de budgets.

* Telemetria: dashboards combinando Sentry + Web Vitals + logs MCP.

## Documentação

* Playbooks: setup local, CI/CD, envs, segurança, testes, performance, troubleshooting.

* ADRs: decisões sobre Vite vs Next, estrutura de chunks, estratégia de RLS e segregação de segredos.

* Checklists: antes de deploy (envs, testes, perf, observabilidade), após incidentes (postmortem).

