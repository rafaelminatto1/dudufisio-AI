# Fase 4 – Infraestrutura e Qualidade

## Objetivos
- Estabelecer pipeline CI/CD com validações automáticas (lint, testes, build, deploy).
- Garantir cobertura de testes end-to-end e regressão contínua.

## Proposta de Pipeline (GitHub Actions)
1. **Workflow `ci.yml`** (trigger em PR/main)
   - `setup`: Node 18+, cache npm.
   - `lint`: `npm run lint` (ESLint + format checks).
   - `typecheck`: `npm run typecheck`.
   - `test`: `npm run test` (unit/integration).
   - `build`: `npm run build` (garante artefato pronto).
   - Publicar artefatos (relatórios, cobertura) no GH Actions.

2. **Workflow `deploy.yml`**
   - Trigger manual ou em push `main/tag`.
   - Executa `ci.yml` via reusable workflow.
   - Deploy para Vercel (`vercel --prod`) ou Supabase Edge Functions, conforme alvo.
   - Envia notificação (Slack/Teams) com status.

3. **Workflow `nightly.yml`**
   - Agendado (cron) para rodar regressão completa.
   - Executa Playwright/Cypress headless, captura screenshots e vídeos.

## Pilares de Testes
- **Unit tests**: Jest + React Testing Library (`npm run test`).
- **Integration tests**: módulos críticos (Supabase services, TISS serialization) com mocks.
- **E2E tests**: Playwright (fluxos dashboard → agenda → TISS → relatórios).
- **Performance smoke**: k6 scripts simples (opcional) em endpoints críticos.

## Ações Prioritárias
1. Criar scripts npm dedicados (`lint`, `typecheck`, `test:unit`, `test:e2e`).
2. Configurar Playwright (ou Cypress) com ambiente isolado + seeds.
3. Preparar container de execução (ex.: `Dockerfile`/`docker-compose.test.yml`).
4. Definir estratégia de gestão de segredos (GitHub Actions Secrets + Vercel).
5. Monitorar pipelines (GitHub Actions Insights, Sentry releases).

## Métricas & Quality Gates
- Build e lint obrigatórios antes de merge (branch protection).
- Cobertura mínima: 60% -> evolução gradual para 80%.
- Zero testes falhos permitidos em `main`.
- Deploy bloqueado se build falhar ou se cobertura cair abaixo do mínimo.

## Próximos Passos
- Implementar workflows `.github/workflows/ci.yml` e `deploy.yml` (esqueleto com jobs descritos).
- Documentar como rodar pipeline localmente (`docs/ci-cd/README.md`).
- Integrar com ferramentas de QA (Sentry releases, Checkly, etc.).
