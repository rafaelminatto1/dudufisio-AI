## Escopo e Objetivos
- Implementar integralmente as pendências do plano unificado com foco em: migração TypeScript, Edge WhatsApp (env + métricas), monitoramento de performance com dashboard, bundle analysis/otimização, MVP de análise de movimento (IA), testes E2E/CI, integração de views do Supabase e ajustes de observabilidade/segurança e documentação.

## Backlog Prioritário
1. Migração TS de hooks/componentes críticos (39 hooks + 3 componentes) – alta
2. Edge WhatsApp: mover VERIFY_TOKEN para env, instrumentar p50/p95/p99 e logs Sentry – alta
3. Performance: integrar services/performanceMonitoring.ts em dashboard/UX e coleta contínua – média
4. Bundle: rodar visualizer e aplicar otimizações em chunks grandes (lazy/dynamic) – média
5. MVP IA Movimento: componente gated por flag e validação prática – média
6. E2E/CI: executar Playwright em ambiente limpo, instalar browsers, gerar relatório – média
7. Supabase Views: consumo consistente das views padronizadas nas páginas/relatórios – média
8. Observabilidade/Segurança: unificar init Sentry, evitar segredos no código, revisar envs – baixa/média
9. Documentação: atualizar plano com evidências e ADRs – baixa

## Implementação por Fases
### Fase 1 (Semana 1)
- Migração TS (lote crítico):
  - Migrar: useSupabaseAuth, supabase/useSupabasePatients, supabase/useSupabaseAppointments, useExerciseLibrary, useMedicalRecords, useRealtimeNotifications, useBodyMap.
  - Critérios: type-check limpo, APIs preservadas, smoke tests OK.
- Edge WhatsApp:
  - Mover VERIFY_TOKEN para `WHATSAPP_VERIFY_TOKEN` (env), adicionar logs Sentry (erro/latência), expor métricas p50/p95/p99.
  - Validar GET/POST em produção/staging com bypass token.
- E2E infra:
  - Preparar job CI (instalar browsers Playwright, cache, variáveis), rodar teste simples.

### Fase 2 (Semana 2)
- Performance Dashboard:
  - Integrar `services/performanceMonitoring.ts` em UI (widget), coletar web-vitals e p50/p95/p99 e exibir em página de monitoramento.
  - Exportar métricas para logs/analytics (opcional).
- Supabase Views:
  - Garantir consumo de `paciente_registros`, `agendamento_status`, `prescricoes_exercicios` nas páginas de listas/search.
  - Testes de regressão em rotas/relatórios.
- Bundle Analysis:
  - Rodar relatório, identificar top chunks e aplicar lazy/dynamic imports onde necessário.

### Fase 3 (Semana 3)
- MVP IA Movimento:
  - Criar componente gated por `VITE_ENABLE_MOVEMENT_ANALYSIS`, acionar `analyzeMovement` com arquivo teste, exibir ROM/compensações/recomendações.
  - Testes práticos/UX e fallback sem libs externas.
- E2E Playwright:
  - Rodar suíte crítica (login, agenda, teleconsulta), gerar relatório, corrigir falhas, pipeline CI verde.

### Fase 4 (Semana 4)
- Observabilidade/Segurança:
  - Unificar init Sentry (evitar duplicação), revisar envs obrigatórias, remover segredos hardcoded.
  - Checklist LGPD/privacidade básico.
- Documentação:
  - Atualizar plano com evidências (latências, telas dashboard), criar ADRs (token env, performance monitor, IA movimento), revisar TROUBLESHOOTING.

## Critérios de Aceitação e Métricas
- TS: 72 arquivos críticos migrados; `tsc --noEmit` sem erros.
- Edge: GET/POST válidos; latência p95 < 100ms medida com bypass; logs Sentry ativos.
- Performance: dashboard com web-vitals + p50/p95/p99 visível; eventos coletados.
- Bundle: -20% nos maiores chunks; relatório comparativo.
- IA: componente funcional com acurácia inicial plausível em casos básicos.
- E2E/CI: suíte crítica passando em 3 navegadores; relatório gerado.
- Supabase Views: consumo consistente nas páginas principais; testes OK.
- Observabilidade: sem segredos no client; init Sentry único; envs revisadas.
- Documentação: plano e ADRs atualizados, TROUBLESHOOTING revisado.

## Riscos e Mitigação
- Complexidade TS: migrar em lotes, testes de fumaça, rollback por arquivo.
- Ambiente local instável: executar E2E em CI limpo; cache e installs previsíveis.
- Assets IA: usar import opcional; fallback sem libs; documentar dependências.
- Proteção Vercel: usar bypass token e expirar links; registrar tempo e cookies.

## Entregáveis e Validação
- Commits/PRs por tópico; relatórios de latência (benchmark) e bundle; página de dashboard performance; componente IA movimento; CI verde; documentação atualizada.

## Execução Contínua
- Progredir sem interrupções, reportando marcos por fase; após aprovação, inicio execução imediata conforme ordem acima, com validação em cada etapa.