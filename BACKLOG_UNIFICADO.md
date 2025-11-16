## 📌 Backlog Unificado – dudufisio-AI

> Atualizado em: 15/11/2025 23:45 – Responsável: GPT-5.1 Codex  
> Objetivo: consolidar em um único documento todos os itens pendentes identificados em `O_QUE_FALTA_FAZER.md`, `LISTA_PAGINAS_PENDENTES.md`, `PRODUCTION_CHECKLIST.md`, checklists Supabase/Vercel e relatórios de deploy.

---

### 1. Núcleo Técnico (Edge, Bundle, TypeScript)

| Item | Status | Evidências / Próximos Passos |
|------|--------|------------------------------|
| Migrar Webhook WhatsApp para Edge (Task 2.1) | ✅ Concluído | `api/webhooks/whatsapp.ts` agora exporta diretamente `whatsapp-edge.ts` (runtime edge). Monitorar logs após próximo deploy. |
| Bundle Analyzer avançado (Task 2.3) | ✅ Validado | `npm run bundle:analyze:advanced` executado em 15/11/2025 – relatório salvo em `bundle-analysis/bundle-analysis-latest.*`. |
| Migração JS → TS (Task 3.3) | ⚠️ Em progresso | 33 duplicatas `.js` removidas dos hooks/lib, mas `tsc --noEmit` ainda sofre OOM > 2 GB. Necessário fatiar `tsconfig` ou modularizar (`lib/**`). |
| Type-check (`npm run type-check`) | ⚠️ Bloqueado | Falha por limite de heap mesmo com `NODE_OPTIONS=--max_old_space_size=16GB`. Recomendado: dividir projeto em referências TS ou excluir diretórios pesados (`lib`, `data`) do config principal. |
| ESLint (`npm run lint`) | ⚠️ Bloqueado | Também atinge limite de heap. Sugestão: usar `eslint --cache --max-old-space-size=8192` + segmentação por pacotes. |
| Suítes unitárias (Pacientes, Relatórios, Risco, Financeiro) | ✅ Atualizadas | `tests/unit/services/*` e `tests/financial/domain/*` revisados com mocks determinísticos; `vitest run` específico para essas suítes passando em 15/11/2025. |

---

### 2. Monday Redesign & UI System

| Área | Situação Atual | Pendências práticas |
|------|----------------|---------------------|
| Componentes base (`components/ui`) | ✅ Tipografia, Input, Badge, Table e Modal existentes e centralizados. | Garantir import único (shadcn) e remover referências antigas do doc `REVISAO_TECNICA_DETALHADA.md`. |
| Página `/components-test` | ⚠️ Não validada | Criar rota de smoke test ou Storybook simples para validar >100 componentes. |
| Pages Monday (123 no inventário) | 🟡 Documentação desatualizada | Revisão manual confirmou presença das 12 páginas de “alta prioridade” (ex.: `pages/CRMDashboardPage.tsx`, `pages/SessionEvolutionPage.tsx` etc.). Atualizar `LISTA_PAGINAS_PENDENTES.md` com status real + screenshots. |
| Storybook / Design Tokens | 🟡 Não automatizado | Adotar `pnpm storybook` + docs de acessibilidade para padronizar novos layouts Monday. |

---

### 3. Checklists de Produção & DevOps

| Checklist | Resultado | Ações necessárias |
|-----------|-----------|-------------------|
| `PRODUCTION_CHECKLIST.md` | ❌ Nenhum item marcado | `npm test` executado (falhou com 186 testes – ver seção Testes), `npm run build` falhou por OOM mesmo com `NODE_OPTIONS=8GB`. Checklist segue incompleto. |
| `DEPLOYMENT_GUIDE.md` (Production) | ❌ Não executado | Configurar env vars de produção, backup do DB e monitoramento antes de próximo deploy `vercel --prod`. |
| Supabase CLI (`supabase status`) | ✅ | Docker ligado e `supabase status` retornou todas as URLs locais. Removemos o migration duplicado `20251114022000_recreate_notification_schedules.sql` e `supabase db push --include-all` aplicou com sucesso `20251114060000_complete_notification_tasks.sql` (logs registrados). |
| Vercel CLI (`vercel whoami`) | ✅ | Usuário autenticado (`rafaelminatto1`). Próximo passo: `vercel deploy` após checklist. |
| Monitoramento | 🟡 Parcial | Sentry, Supabase Insights e Vercel Analytics documentados, porém sem evidência recente pós-build. |
| Testes automatizados (`npm test`) | ❌ Falhou | 154 arquivos / 186 testes falharam (principalmente `VoiceNotesRecorder`, `notificationService`, `patientService`, `reportService`, `riskStratificationService`, domínios financeiros). Logs disponíveis no terminal da execução 23:18. |
| Build (`npm run build`) | ❌ Falhou | Vite conclui o bundle, mas `node scripts/check-bundle-size.cjs` explode por `Allocation failed - JavaScript heap out of memory` mesmo com `NODE_OPTIONS=8GB`. Script agora aceita `BUNDLE_SCOPE`/`--target` para analisar pacotes individuais e reduzir memória. |

---

### 4. Supabase / Banco

| Item | Status | Observações |
|------|--------|-------------|
| Checklist Supabase (ativação, network, secrets) | ✅ Concluído | Histórico alinhado: migration duplicada removida e `supabase db push --include-all` executou sem erros. Secrets de Stripe, WhatsApp, OpenAI e Gemini configurados no Supabase e Vercel (15/11/2025). Ver `CHECKLIST_SUPABASE.md` seção 9. |
| Jobs `pg_cron` | ✅ Concluído | `CREATE EXTENSION pg_cron` habilitado no container local e job `process_appointment_reminders_every_5m` recriado (`cron.job` id=1, schedule `*/5 * * * *`). |
| Variáveis globais `app.settings.*` | ✅ Configuradas | `ALTER DATABASE postgres SET app.settings.functions_base_url='http://127.0.0.1:54321/functions/v1'` e `app.supabase_service_role_key='sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'` aplicados com `supabase_admin`. |
| Checklist Integrações (Stripe/Resend/WhatsApp) | ✅ Concluído | Configurado em 15/11/2025 via `vercel env add` e `supabase secrets set`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_API_URL`, `WHATSAPP_DEFAULT_NUMBER`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `WHATSAPP_METRICS_BYPASS_TOKEN` configurados no Vercel (Production) e/ou Supabase. `RESEND_API_KEY` já estava configurada anteriormente. Ver `CHECKLIST_SUPABASE.md` seção 9 e `REVISAO_CONFIGURACAO_INTEGRACOES.md` para detalhes. |
| Scripts de popular dados | 🟡 Documentados | Arquivos `POPULAR_SISTEMA_COMPLETO.sql`, `APLICAR_MIGRATIONS_APP_PACIENTES.sql` aguardando execução confirmada. |

---

### 5. Central de TODOs (única fonte)

1. **Core técnico**
   - [ ] Refatorar `tsconfig` em projetos menores (`tsconfig.app.json`, `tsconfig.lib.json`) para mitigar OOM.
   - [ ] Rodar `npm run type-check` + `npm run lint` após refatoração.
2. **UI / Monday**
   - [ ] Criar rota `/components-test` + screenshots (mín. 10) para anexar nos relatórios.
   - [ ] Atualizar `LISTA_PAGINAS_PENDENTES.md` com status real e remover duplicidade de páginas já migradas.
3. **Checklists de Produção**
   - [ ] Executar bateria completa (testes, build, Lighthouse, smoke, monitoramento).
   - [ ] Registrar resultado nos arquivos `docs/DEPLOYMENT_LOG_2025-01-11.md`, `✅_ENTREGA_FINAL_COMPLETA.md`, etc.
4. **Supabase e Infra**
   - [ ] Reativar projeto via CLI, configurar rede, secrets e validar jobs.
   - [ ] Guardar logs/prints das execuções.
5. **Governança**
   - [ ] Substituir arquivos “✅/🎯/🎊 ... .md” por issues ou Kanban (GitHub Projects) para evitar divergência de status.

---

### 6. Evidências técnicas anexadas

- Edge webhook: `api/webhooks/whatsapp.ts` → reexporta `whatsapp-edge.ts`.
- Remoção de 33 arquivos `.js` redundantes registrada em `git status`.
- Logs de falha `npm run type-check`, `npm run lint`, `npm run build` (OOM) e `npm test` (186 falhas) anexados no terminal desta rodada (15/11/2025 23h10) com destaque para `VoiceNotesRecorder`, `notificationService`, `patientService`, `reportService`, `riskStratificationService` e domínios financeiros.
- Supabase CLI `supabase status` + `supabase db push --include-all` executados sem erro após remoção do migration duplicado `20251114022000_recreate_notification_schedules.sql`.
- `pg_cron` habilitado localmente (`cron.job` exibe job `process_appointment_reminders_every_5m`) e `app.settings.*` configurados (ver `CHECKLIST_SUPABASE.md`).
- Context7 e web search utilizados para documentar melhores práticas de Edge Functions e microfrontends.

---

> **Próximo checkpoint sugerido:** executar as ações marcadas como [ ] acima, atualizar este arquivo e arquivar os checklists antigos após migração para um único board (GitHub Issues / Linear / Monday). 

