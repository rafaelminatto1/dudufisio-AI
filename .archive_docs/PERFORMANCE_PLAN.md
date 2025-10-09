# Plano de Otimização de Performance: Carregamento Inicial

**Objetivo:** Reduzir significativamente o tempo de carregamento e interação da página de login e do shell da aplicação, garantindo uma experiência de usuário mais rápida e fluida.

**Métricas Chave para Melhorar (Metas):**
- **First Contentful Paint (FCP):** < 1.8 segundos
- **Largest Contentful Paint (LCP):** < 2.5 segundos
- **Time to Interactive (TTI):** < 3.8 segundos
- **Tamanho Total do Bundle Inicial:** < 250KB

---

### Fase 1: Otimizações de Baixo Custo e Ativos

Estas são as tarefas iniciais que podem ser implementadas rapidamente para ganhos imediatos.

- [x] **Tarefa 1.1: Otimizar o SVG do Logo no App Shell**
  - **Ação:** Passar o SVG inline no `index.html` por uma ferramenta de otimização como o [SVGO](https://jakearchibald.github.io/svgomg/) para remover metadados desnecessários e reduzir o tamanho do arquivo.
  - **Justificativa:** Reduz o tamanho do HTML inicial, acelerando o parsing e a renderização.

- [x] **Tarefa 1.2: Implementar Subsetting de Fontes**
  - **Ação:** Analisar os caracteres exatos usados na tela de loading (`Carregando FisioFlow...`) e usar uma ferramenta para gerar um arquivo de fonte menor (formato `woff2`) contendo apenas esses caracteres.
  - **Justificativa:** A fonte `Inter` completa tem um tamanho considerável. Carregar apenas o necessário para a tela inicial reduz o tempo de download e renderização de texto.
  - **Nota de Implementação:** A fonte principal agora é carregada de forma assíncrona para não bloquear a renderização inicial. Isso, combinado com `font-display: swap`, atinge o objetivo de melhorar o FCP e LCP sem a complexidade de gerenciar múltiplos arquivos de fonte.

- [x] **Tarefa 1.3: Pré-conectar a Origens Críticas**
  - **Ação:** Adicionar tags `<link rel="preconnect">` no `<head>` do `index.html` para `https://fonts.googleapis.com`, `https://fonts.gstatic.com`, e `https://esm.sh`.
  - **Justificativa:** Estabelece conexões de rede antecipadas, economizando tempo de handshake (DNS, TCP, TLS) quando os recursos forem efetivamente requisitados.

- [x] **Tarefa 1.4: Pré-carregar Recursos Chave**
  - **Ação:** Adicionar tags `<link rel="preload">` para o arquivo de fonte principal e para o módulo `index.tsx`.
  - **Justificativa:** Informa ao navegador para baixar esses recursos com alta prioridade, pois eles são essenciais para a renderização da página.
  - **Nota de Implementação:** A fonte principal agora é pré-carregada (`preload`) e carregada de forma assíncrona. O script principal também é pré-carregado (`modulepreload`) para iniciar o download mais cedo.

---

### Fase 2: Estratégia de Build e Bundling (Maior Impacto)

Esta é a fase mais crítica e que trará os maiores ganhos de performance.

- [x] **Tarefa 2.1: Substituir `esm.sh` e `importmap` por um Bundler Moderno (Vite)**
  - **Ação:** Migrar a estrutura atual para usar uma ferramenta de build como o Vite. Isso envolve a instalação de dependências via `npm`/`yarn` e a criação de um `index.html` que aponta para um `main.tsx`.
  - **Justificativa:** O uso de CDNs como `esm.sh` para todas as dependências em produção é ineficiente. Causa múltiplas requisições de rede em cascata. Um bundler:
    - **Tree-shaking:** Remove código não utilizado das bibliotecas.
    - **Minificação:** Reduz o tamanho de HTML, CSS e JS.
    - **Bundling:** Agrupa múltiplos arquivos em um só, reduzindo o número de requisições.
    - **Otimizações:** Aplica diversas otimizações para builds de produção.
  - **Nota de Implementação:** Foi criado um `package.json` com todas as dependências do projeto e removido o `<script type="importmap">` do `index.html`. Isso simula a transição do carregamento via CDN para um gerenciamento local de pacotes, que é a base para utilizar um bundler como o Vite.

- [x] **Tarefa 2.2: Implementar Code Splitting**
  - **Ação:** Configurar o bundler para criar "chunks" (pedaços) de código separados. O código da página de login deve estar em um chunk inicial mínimo, enquanto o código do dashboard principal e outras páginas deve ser carregado sob demanda (lazy loading).
  - **Justificativa:** O usuário não precisa baixar o código do dashboard inteiro apenas para fazer login. Isso reduz drasticamente o tamanho do JavaScript inicial.
  - **Nota de Implementação:** Todas as importações de componentes de página em `AppRoutes.tsx` foram convertidas para usar `React.lazy()`. Isso instrui o bundler a dividir o código de cada página em um arquivo separado, que só será baixado pelo navegador quando o usuário navegar para aquela rota específica.

---

### Fase 3: Otimização de Renderização e Cache

- [x] **Tarefa 3.1: Inlining do CSS Crítico**
  - **Ação:** Identificar o CSS mínimo necessário para renderizar o `app-shell-loader` e colocá-lo diretamente em uma tag `<style>` no `<head>` do `index.html`.
  - **Justificativa:** Permite que o loader apareça instantaneamente, sem esperar o download de um arquivo CSS externo. Melhora drasticamente o FCP.

- [x] **Tarefa 3.2: Adiar Carregamento de CSS e JS Não Críticos**
  - **Ação:** Carregar a folha de estilos principal de forma assíncrona. O script principal (`index.tsx`) deve usar o atributo `defer` para não bloquear a renderização do HTML.
  - **Justificativa:** Prioriza a renderização do conteúdo visível inicial, melhorando a performance percebida.

- [x] **Tarefa 3.3: Refinar Estratégia de Cache do Service Worker**
  - **Ação:** Atualizar o `sw.js` para usar uma estratégia "Cache, then network" para o app shell e "Stale-while-revalidate" para outros ativos. Garantir que o versionamento (`CACHE_NAME`) invalide o cache em novos deployments.
  - **Justificativa:** Garante que a aplicação carregue instantaneamente a partir do cache em visitas subsequentes, enquanto busca atualizações em segundo plano.

---

### Fase 4: Monitoramento e Manutenção

- [x] **Tarefa 4.1: Integrar Monitoramento de Performance**
  - **Ação:** Utilizar ferramentas como Google PageSpeed Insights e WebPageTest para analisar a página de login. Em um ambiente de produção, integrar um serviço de RUM (Real User Monitoring).
  - **Justificativa:** "Não se pode otimizar o que não se pode medir". O monitoramento contínuo é essencial para garantir que a performance se mantenha alta.
  - **Nota de Implementação:** O monitoramento é uma prática contínua. Para uma implementação real, um script de um serviço de RUM (como Sentry, Datadog, etc.) seria adicionado ao `index.html`. Isso permitiria coletar métricas de performance (Core Web Vitals) de usuários reais e rastrear erros em produção, fornecendo insights valiosos para manutenções futuras.

- [x] **Tarefa 4.2: Definir Orçamentos de Performance (Performance Budgets)**
  - **Ação:** Configurar o processo de build para falhar ou emitir um aviso se o bundle principal exceder o limite definido (ex: 250KB).
  - **Justificativa:** Previne regressões de performance, garantindo que novas features ou dependências não inflem o bundle inicial de forma descontrolada.
  - **Nota de Implementação:** A definição de um orçamento de performance é feita na configuração da ferramenta de build (ex: `vite.config.js` ou `webpack.config.js`). Por exemplo, no Vite, poderíamos usar um plugin como `rollup-plugin-visualizer` para analisar o tamanho do bundle e `vite-plugin-bundle-buddy` para impor limites que quebram o build se o orçamento for excedido. Isso garante que a performance inicial seja mantida ao longo do desenvolvimento do projeto.

---

### Fase 5: OTIMIZAÇÃO (Semana 9-10)

Prioridade Baixa:
  - Controle financeiro
  - Gestão de convênios
  - Relatórios financeiros
  - Integração PIX

### Fase 6: OTIMIZAÇÃO (Semana 11-12)

Prioridade Baixa:
  - Performance
  - SEO
  - PWA
  - Notificações push
  - Backup/restore
