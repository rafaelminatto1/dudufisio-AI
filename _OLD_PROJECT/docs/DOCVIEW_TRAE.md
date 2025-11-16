# 📖 DocView (Trae) — Guia de Uso e Boas Práticas

> Documentação oficial para visualizar e manter documentos Markdown diretamente no Trae (painel DocView), alinhada ao estilo do repositório DuduFisio-AI.

---

## 🎯 Objetivo

- Centralizar o uso do painel DocView no Trae para leitura, navegação e edição de documentação.
- Padronizar como criamos, nomeamos e indexamos arquivos `.md` neste repositório.
- Garantir que novos documentos apareçam corretamente nos índices e sejam fáceis de descobrir.

---

## 🗂️ Onde ficam os documentos

- `./INDEX.md` — Índice geral na raiz do projeto.
- `./docs/INDEX.md` — Índice detalhado por categorias dentro de `docs/`.
- Pastas relacionadas: `./docs/`, `./docs/flows/`, `./docs/minatto/` e arquivos temáticos na raiz (ex.: `DEVELOPER_GUIDE.md`, `AI_CONTEXT.md`).

Recomendação: coloque novos guias, checklists e tutoriais em `docs/` e acrescente links nos dois índices (`docs/INDEX.md` e `./INDEX.md`) quando fizer sentido.

---

## 👀 Como usar o DocView no Trae

1. Abra o painel “DocView” no topo do Trae.
2. Navegue pelo explorador de arquivos e clique no `.md` que deseja visualizar.
3. Use visualização lado a lado (DocView + Editor) para editar e ver o resultado em tempo real (salvou, atualizou).
4. Links relativos funcionam direto no DocView. Clique para abrir o alvo no mesmo painel.
5. Use o painel “Browser” quando quiser abrir links externos ou pré-visualizar assets hospedados.

Observação: O DocView renderiza Markdown padrão (títulos, listas, tabelas, código, imagens). Diagramas ASCII são suportados como texto; para outras formas de diagramação, mantenha em Markdown simples.

---

## 🧩 Estrutura recomendada de um documento

```md
# Título Claro do Documento

> Breve descrição do propósito do arquivo

---

## Objetivo
- O que este documento cobre

## Contexto
- Onde se aplica no projeto

## Passo a Passo / Guia
- Etapas numeradas

## Referências
- Links relativos para outros docs

---

**Última Atualização:** AAAA-MM-DD  
**Versão:** 1.0  
**Status:** ✅ Publicado / 🔄 Em atualização / ⚠️ Parcial
```

Inclua sempre as três linhas finais (data, versão, status) para facilitar manutenção.

---

## 🧱 Padrões de nomenclatura e organização

- Extensão: use `.md` (evite `.mdx` se não for necessário).
- Nomes descritivos e curtos: `DOCVIEW_TRAE.md`, `SUPABASE_SETUP.md`, `GUIA_USUARIO_*.md`.
- Emojis são permitidos, mas prefira nomes sem emoji para evitar problemas em ferramentas externas.
- Coloque imagens em `public/images/` e referencie com caminhos relativos.

---

## 🔗 Links, âncoras e referências

- Prefira links relativos: `./docs/INDEX.md`, `../README.md`.
- Use âncoras de título padrão do Markdown: `./DEVELOPER_GUIDE.md#arquitetura-do-projeto`.
- Para trechos de código, use blocos de código com linguagem: 
  ```ts
  // exemplo
  export function hello() { return 'world'; }
  ```

---

## 🖼️ Imagens e mídia

- Coloque arquivos em `public/images/` ou subpastas apropriadas.
- Use alt text descritivo: `![Fluxo de login](./public/images/fluxo-login.png)`.
- Evite imagens muito pesadas; prefira `.png` otimizados.

---

## 🔍 Indexação nos índices

- Após criar um novo documento, adicione-o em:
  - `docs/INDEX.md` (na categoria adequada); e
  - `./INDEX.md` (se for documentação principal ou útil para onboarding).
- Siga o formato de tabela já utilizado (Documento | Descrição | Status/Linhas).

---

## 🧭 Fluxo de trabalho sugerido

1. Criar arquivo em `docs/` com estrutura recomendada.
2. Preencher “Última Atualização / Versão / Status”.
3. Adicionar links nos índices.
4. Visualizar no DocView e ajustar formatação.
5. Commitar com mensagem descritiva (ex.: `docs: adicionar guia DocView`).

---

## ✅ Checklist de qualidade

- Título `#` único e claro.
- Sumário lógico com seções `##` coerentes.
- Links relativos testados no DocView.
- Imagens com alt text e caminhos válidos.
- Campo de “Última Atualização / Versão / Status” preenchido.
- Linguagem objetiva e em português.

---

## 🛠️ Troubleshooting

- Documento não aparece no DocView:
  - Verifique se a extensão é `.md` e o arquivo foi salvo.
  - Confirme o caminho (evite caracteres especiais fora do padrão).

- Link quebrado:
  - Ajuste o caminho relativo e confirme a existência do arquivo alvo.

- Imagem não renderiza:
  - Caminho incorreto; coloque o asset em `public/images/`.

---

## 📚 Referências úteis dentro do projeto

- `./INDEX.md` — Índice geral
- `./docs/INDEX.md` — Índice detalhado por categorias
- `./DEVELOPER_GUIDE.md` — Guia técnico completo
- `./AI_CONTEXT.md` — Contexto para IAs/LLMs

---

**Última Atualização:** 2025-11-04  
**Versão:** 1.0  
**Status:** ✅ Publicado