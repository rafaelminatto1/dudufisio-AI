# Plano de Mitigação de Erros de Lint

## Objetivo
Reduzir gradualmente os ~5900 erros de lint reportados, priorizando módulos críticos e adotando estratégia iterativa para não comprometer funcionalidades existentes.

## Diagnóstico
- **Erros recorrentes**: `@typescript-eslint/no-explicit-any`, `prefer-nullish-coalescing`, `no-unused-vars`, `@typescript-eslint/no-non-null-assertion`, `no-console` e parsing em arquivos sem inclusão no `tsconfig`.
- **Módulos mais afetados**: `services/supabase/*`, `services/teleconsulta/*`, `types/*`, `workers/*`, `vite.config.*`.
- **Causas**: tipagem parcial ou ausente, utilitários genéricos com `any`, logs temporários, arquivos backups fora do escopo do TypeScript config.

## Princípios
1. Foco em segurança clínica/integridade de dados (serviços Supabase, teleconsulta).
2. Pequenas PRs com escopo claro para facilitar revisão.
3. Flexibilizar regras apenas quando tecnicamente justificável (ex.: shims).
4. Adotar `unknown`/tipos específicos em vez de `any` sempre que possível.
5. Documentar ajustes de ESLint/TypeScript para rastreabilidade.

## Fases de Execução

### Fase 1 – Configuração & Arquivos Críticos
- Incluir arquivos necessários nos `tsconfig` ou aplicar exclusões explícitas (`vite.config.*`, `workers/dataProcessingWorker.ts`).
- Revisar `services/supabase/*` e `types/medical-records.ts` para remover `any`, `||` → `??`, `no-unused-vars` e `no-non-null-assertion`.
- Criar utilitários tipados para eventos/payloads Supabase Realtime (substituir `any`).

### Fase 2 – Serviços Complementares
- Tratar `services/teleconsulta/*.ts`, removendo `console.log` desnecessários, substituindo `any` por interfaces, revendo non-null assertions.
- Atualizar `types/*` (exercise, financial, session) com nullish coalescing e tipos mais restritos.

### Fase 3 – Utilitários e Declarações Globais
- Revisar `types/utils.ts`, `types/shims-*.d.ts`: definir tipos adequados ou usar `unknown`, modularizar funções não utilizadas.
- Configurar regras específicas para arquivos `.d.ts` quando necessário (ex.: permitir `any` controlado via `eslint-disable-next-line` com comentário justificativo).

### Fase 4 – Limpeza Final & Automatização
- Remover/backupar arquivos de configuração redundantes (`vite.config.backup.ts` etc.) ou ajustar lint config para ignorá-los.
- Garantir que scripts `npm run lint` sejam executados no CI; adicionar pre-commit opcional (Husky/lint-staged).
- Monitorar regressão com check semanal.

## Cronograma Sugerido
- Semana 1: Fase 1 concluída (arquivos supabase + config ts).
- Semana 2: Fase 2 (teleconsulta + tipos complementares).
- Semana 3: Fase 3 (utilitários/global). Ajustar regras pontuais.
- Semana 4: Fase 4 (limpeza final, automação).

## Métricas de Sucesso
- Erros de lint reduzidos >80% após fases 1 e 2.
- Zero regressões críticas em módulos clínicos.
- CI executando lint sem falhas ao término da fase 4.

## Riscos & Mitigações
- **Refatoração Sensível**: Revisão pair-programming ou testes automáticos antes do merge.
- **Falta de Tipos**: Consultar contexto do domínio (fisioterapia) para nomear/estruturar tipos adequadamente.
- **Tempo**: dividir tarefas entre membros, priorizar blocos de arquivos.


