# 📘 Como Habilitar GitHub Pages para Relatórios de Performance

Este guia explica como ativar GitHub Pages no repositório para publicar automaticamente os relatórios de performance.

## Passo 1: Habilitar GitHub Pages

1. Acesse o repositório no GitHub: https://github.com/rafaelminatto1/dudufisio-AI
2. Vá em **Settings** (Configurações)
3. No menu lateral esquerdo, clique em **Pages**
4. Em **Source** (Origem), selecione **GitHub Actions**
5. Clique em **Save** (Salvar)

## Passo 2: Verificar Deploy

Após o próximo push na branch `main`:
1. Vá em **Actions** no repositório
2. Procure o workflow **Deploy Reports to GitHub Pages**
3. Aguarde a conclusão (ícone verde ✓)
4. Acesse os relatórios em: `https://rafaelminatto1.github.io/dudufisio-AI/`

## Relatórios Disponíveis

Uma vez publicados, você terá acesso a:
- **Bundle Visualizer**: Gráfico interativo do tamanho dos chunks
- **Lighthouse Reports**: Relatórios HTML detalhados de performance
- **Bundle Sizes**: Tabela Markdown com top chunks
- **Lighthouse Summary**: Resumo das métricas principais (FCP, LCP, TTI, TBT, CLS)

## Atualização Automática

Os relatórios são atualizados automaticamente a cada push na branch `main`. Não é necessária nenhuma ação manual.

## Troubleshooting

### Deploy falhou?
- Verifique se a branch `gh-pages` tem permissões corretas
- Confirme que GitHub Actions tem permissão de escrita (Settings → Actions → General → Workflow permissions → Read and write)

### Página 404?
- Aguarde 2-3 minutos após o primeiro deploy
- Limpe o cache do navegador (Ctrl+Shift+R)

## Monitoramento de PRs

O workflow `Performance Audit` também comenta automaticamente em Pull Requests com:
- Score do Lighthouse
- Métricas de performance (FCP, LCP, TTI)
- Top 15 chunks do bundle

Isso permite revisar impacto de performance antes de fazer merge.

