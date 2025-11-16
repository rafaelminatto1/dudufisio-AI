# Plano de Ação Estratégico: Evolução do FisioFlow para Next.js na Vercel & Supabase

## 1. Visão Geral e Estratégia

O objetivo é refatorar o FisioFlow para uma arquitetura unificada em **Next.js (App Router)**, com backend e banco de dados gerenciados por **Supabase**, e deploy contínuo na **Vercel**. Esta abordagem irá:

- **Simplificar Radicalmente o Build:** Eliminar a complexidade da dupla configuração Vite + Next.js.
- **Aumentar a Performance:** Utilizar as otimizações nativas da Vercel e do Next.js (SSR, RSC, Otimização de Imagens).
- **Pagar a Dívida Técnica:** Implementar TypeScript em modo `strict` desde o início.
- **Acelerar o Desenvolvimento:** Aproveitar a integração nativa Vercel + Supabase para gerenciamento de ambiente e a eficiência da `shadcn/ui`.

Vamos estruturar o trabalho em fases, com prompts claros para serem executados em modo de planejamento no Cursor.

---

## 2. Ordem de Execução e Prompts para o Cursor IDE

Execute os prompts na ordem apresentada. Cada um representa uma etapa de desenvolvimento autocontida.

### Fase 1: Fundação da Nova Arquitetura

O foco aqui é estabelecer uma base de projeto limpa, robusta e integrada.

**Prompt 1.1: Inicialização do Projeto Next.js**
```
Crie um novo projeto Next.js 14+ usando o App Router, TypeScript e Tailwind CSS. Configure o ESLint com regras estritas para qualidade de código, incluindo o plugin `eslint-plugin-tailwindcss`. Organize a estrutura de pastas inicial com diretórios `/app`, `/components`, `/lib`, e `/utils`.
```

**Prompt 1.2: Integração com Supabase e Configuração Local**
```
Utilize a CLI do Supabase para inicializar o projeto. Execute 'supabase init' para criar a estrutura local. Em seguida, execute 'supabase login' e 'supabase link --project-ref <SEU_PROJECT_ID>' para conectar ao seu projeto Supabase Pro. Configure o `docker-compose.yml` do Supabase para o desenvolvimento local e crie um arquivo `.env.local` com as chaves do ambiente local.
```

**Prompt 1.3: Conexão Vercel + Supabase e Variáveis de Ambiente**
```
Instale a integração do Supabase no seu projeto Vercel. No dashboard da Vercel, conecte este repositório e adicione a integração do Supabase. Isso deve sincronizar automaticamente as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Adicione a `SUPABASE_SERVICE_ROLE_KEY` manualmente como uma variável de ambiente secreta.
```

**Prompt 1.4: Configuração TypeScript Estrita e `shadcn/ui`**
```
Modifique o arquivo `tsconfig.json` para ativar o modo estrito (`"strict": true`). Em seguida, inicialize a `shadcn/ui` no projeto usando a CLI (`npx shadcn-ui@latest init`). Configure `components.json` para usar o alias `~/components` e o estilo `default`.
```

### Fase 2: Autenticação e UI Base

Com a fundação pronta, implementamos a base da experiência do usuário.

**Prompt 2.1: Implementação do Fluxo de Autenticação**
```
Crie o fluxo de autenticação completo usando o Supabase Auth. Desenvolva as páginas de Login, Cadastro e Recuperação de Senha usando os Server Components do Next.js. Utilize o pacote `@supabase/auth-helpers-nextjs` para gerenciar a sessão do usuário. Estilize os formulários com os componentes `Input`, `Button`, `Card` e `Label` da `shadcn/ui`.
```

**Prompt 2.2: Criação de Layouts e Rotas Protegidas**
```
Crie um layout principal para o dashboard em `/app/(app)/layout.tsx`. Implemente a proteção de rotas usando um middleware (`middleware.ts`) que verifica a sessão do usuário com Supabase. Se o usuário não estiver logado, redirecione-o para a página de login. O layout do dashboard deve conter um menu lateral e um cabeçalho.
```

### Fase 3: Migração de Funcionalidades e Pagamento de Dívida

Migramos o código legado para a nova arquitetura, corrigindo a tipagem no processo.

**Prompt 3.1: Migração do Módulo de Pacientes**
```
Migre a funcionalidade de listagem e cadastro de pacientes. Crie a rota `/dashboard/pacientes`. Use Server Components para buscar a lista de pacientes do Supabase. Exiba os dados em uma `Table` da `shadcn/ui` com paginação e filtros do lado do servidor. Crie um formulário de cadastro/edição de paciente dentro de um `Dialog` da `shadcn/ui`, garantindo tipagem estrita para todos os dados do paciente.
```

**Prompt 3.2: Refatoração do Módulo de Agenda (Recharts)**
```
Recrie a página da Agenda em `/dashboard/agenda`. Utilize a biblioteca `recharts` para exibir os agendamentos. Carregue o componente do gráfico de forma assíncrona usando `React.lazy` e `Suspense` para otimizar o carregamento da página. Crie as funções de API no Supabase (Edge Functions) para buscar e salvar agendamentos, garantindo que todas as entradas e saídas sejam estritamente tipadas.
```

### Fase 4: Inovação e Diferenciação

Implementamos as funcionalidades de alto impacto sugeridas na análise.

**Prompt 4.1: Implementação da Análise de Movimento (Computer Vision)**
```
Crie a base para a funcionalidade de análise de movimento em tempo real. Desenvolva uma nova página em `/dashboard/exercicios/analise`. Integre a biblioteca `@mediapipe/tasks-vision` do Google. Implemente a lógica para acessar a webcam do usuário, criar um `PoseLandmarker`, e desenhar os pontos de referência da pose sobre um elemento `<canvas>` que se sobrepõe ao vídeo em tempo real.
```

**Prompt 4an.2: Gamificação - Jornada de Reabilitação**
```
Desenvolva a funcionalidade de 'Jornada de Reabilitação'. Primeiro, use a CLI do Supabase para criar uma nova migration com as tabelas `treatment_journeys` e `milestones`. Em seguida, crie um componente React que renderize visualmente essa jornada, buscando os dados do Supabase. Ao completar uma tarefa, o status deve ser atualizado no banco de dados.
```

### Fase 5: Deploy, Monitoramento e Otimizações Finais

Garantimos que a aplicação seja robusta, monitorada e performática em produção.

**Prompt 5.1: Configuração de CI/CD e Monitoramento**
```
Configure o deploy contínuo na Vercel a partir do branch `main`. Adicione o Sentry ao projeto Next.js para monitoramento de erros em tempo real, configurando-o para capturar erros tanto no cliente quanto no servidor. Utilize a CLI da Vercel (`vercel deploy --prod`) para forçar um deploy de produção e verificar os logs.
```

**Prompt 5.2: Otimização de Performance com Vercel Pro**
```
Implemente as otimizações de performance da Vercel. Ative o Vercel Analytics para obter insights sobre os usuários. Configure um Vercel Cron Job para uma tarefa de rotina, como enviar lembretes de agendamento. Use a CLI da Vercel para inspecionar a velocidade do site (`vercel inspect <URL_DO_DEPLOY>`) e identificar possíveis gargalos.
```
