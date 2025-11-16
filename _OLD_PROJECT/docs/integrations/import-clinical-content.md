# Importação de Conteúdo Clínico

## Visão Geral
Script utilitário `scripts/import-clinical-content.ts` sincroniza:
- Categorias de materiais (`clinical_material_categories`)
- Materiais clínicos em Markdown (`clinical_materials`)
- Biblioteca de exercícios terapêuticos (`exercises`)
- Arquivos `.md` no bucket Storage `clinical-materials`

## Pré-requisitos
1. Definir `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` ou `.env`.
2. Garantir que as pastas de origem estejam atualizadas:
   - `materiais_clinicos/`
   - `scripts/generate-exercises.ts`
3. Executar `npm install` (dependências do projeto já incluem `@supabase/supabase-js`).

## Execução
```bash
npx tsx scripts/import-clinical-content.ts
```

## Resultado
- Categorias inexistentes são criadas com `name`, `description`, `color` e `icon`.
- Materiais são atualizados/insertados por `name`, com `content` (Markdown), `tags`, `file_url` público e status `published`.
- Exercícios são atualizados/insertados por `name`, incluindo `muscle_groups`, `instructions`, `difficulty_level` mapeada (`iniciante` → `beginner`, etc.).
- Logs resumem cada item processado.

## Observações
- Script é idempotente: reexecuções atualizam registros existentes.
- Caso o bucket `clinical-materials` não exista, ele é criado como público (10 MB por arquivo).
- Em falhas de rede/credenciais, nenhuma alteração é aplicada ao Supabase.

