# Plano de Ação Estratégico (Detalhado): Evolução do FisioFlow para Next.js

## 1. Visão Geral e Estratégia

O objetivo é refatorar o FisioFlow para uma arquitetura unificada em **Next.js (App Router)**, com backend e banco de dados gerenciados por **Supabase**, e deploy contínuo na **Vercel**. Esta abordagem irá:

- **Simplificar Radicalmente o Build:** Eliminar a complexidade da dupla configuração Vite + Next.js.
- **Aumentar a Performance:** Utilizar as otimizações nativas da Vercel e do Next.js (SSR, RSC, Otimização de Imagens).
- **Pagar a Dívida Técnica:** Implementar TypeScript em modo `strict` desde o início.
- **Acelerar o Desenvolvimento:** Aproveitar a integração nativa Vercel + Supabase para gerenciamento de ambiente e a eficiência da `shadcn/ui`.

---

## 2. Ordem de Execução e Prompts Detalhados para o Cursor IDE

Execute os prompts na ordem apresentada. Cada um representa uma etapa de desenvolvimento autocontida.

### Fase 1: Fundação da Nova Arquitetura

**Prompt 1.1: Inicialização do Projeto Next.js**

*   **🎯 Objetivo:** Criar um projeto Next.js moderno, limpo e com ferramentas de qualidade de código ativadas.
*   **💡 Racional:** Uma base sólida com linting estrito previne erros comuns e garante consistência no código desde o primeiro dia.
*   **📋 Passos Detalhados:**
    1.  Execute o comando: `npx create-next-app@latest fisioflow-next --typescript --tailwind --eslint`.
    2.  Navegue para o novo diretório: `cd fisioflow-next`.
    3.  Instale o plugin de lint para Tailwind: `npm install -D eslint-plugin-tailwindcss`.
    4.  Atualize o `.eslintrc.json` para estender o plugin: `"extends": ["next/core-web-vitals", "plugin:tailwindcss/recommended"]`.
    5.  Crie os diretórios: `mkdir -p app components lib utils`.

```
Crie um novo projeto Next.js 14+ usando o comando 'npx create-next-app@latest'. Escolha as opções para usar TypeScript, Tailwind CSS e ESLint. Após a criação, instale 'eslint-plugin-tailwindcss' e adicione-o às extensões do ESLint para organizar automaticamente as classes do Tailwind. Por fim, crie os diretórios '/app', '/components', '/lib', e '/utils' na raiz do projeto para organizar a estrutura de código.
```

---

**Prompt 1.2: Integração com Supabase e Configuração Local**

*   **🎯 Objetivo:** Conectar o projeto a uma instância local do Supabase para desenvolvimento rápido e isolado.
*   **💡 Racional:** Desenvolver localmente com a stack completa do Supabase (Auth, DB, Storage) acelera o ciclo de feedback e evita custos durante o desenvolvimento.
*   **📋 Passos Detalhados:**
    1.  Instale a CLI do Supabase: `npm install -g supabase`.
    2.  Faça login: `supabase login`.
    3.  Dentro do projeto, inicialize o Supabase: `supabase init`.
    4.  Conecte ao seu projeto remoto: `supabase link --project-ref <SEU_PROJECT_ID>`.
    5.  Inicie os serviços locais: `supabase start`.
    6.  Ao final do comando `start`, o terminal exibirá as chaves locais. Copie-as para um novo arquivo `.env.local`.

```
Utilize a CLI do Supabase para integrar o backend. Execute 'supabase init' para criar a pasta '/supabase'. Em seguida, execute 'supabase login' e 'supabase link --project-ref <SEU_PROJECT_ID>' para conectar ao seu projeto Supabase Pro. Inicie o ambiente de desenvolvimento local com 'supabase start'. Crie um arquivo '.env.local' na raiz do projeto e popule-o com as variáveis de ambiente fornecidas pelo comando 'supabase start', como NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.
```

---

**Prompt 1.3: Conexão Vercel + Supabase**

*   **🎯 Objetivo:** Automatizar o gerenciamento de variáveis de ambiente entre Vercel e Supabase.
*   **💡 Racional:** A integração oficial elimina a necessidade de copiar e colar chaves manualmente, reduzindo o risco de erros e vazamentos. As variáveis são sincronizadas de forma segura.
*   **📋 Passos Detalhados:**
    1.  Acesse o dashboard do seu projeto na Vercel.
    2.  Vá para a aba "Integrations" e adicione a integração "Supabase".
    3.  Siga o fluxo para conectar sua conta Supabase e selecionar o projeto correto.
    4.  A integração criará um grupo de variáveis de ambiente na Vercel, aplicando-as automaticamente aos ambientes de Produção, Preview e Desenvolvimento.

```
Instale a integração do Supabase no seu projeto Vercel. No dashboard da Vercel, conecte este repositório e adicione a integração do Supabase. Configure a integração para sincronizar as variáveis de ambiente do projeto Supabase Pro. Isso deve configurar automaticamente as variáveis de produção. Verifique se a `SUPABASE_SERVICE_ROLE_KEY` também foi adicionada como uma variável 'Secret'.
```

---

**Prompt 1.4: Configuração TypeScript Estrita e `shadcn/ui`**

*   **🎯 Objetivo:** Forçar a máxima segurança de tipos e preparar o sistema de design.
*   **💡 Racional:** O modo `strict` do TypeScript é a principal ferramenta para pagar a dívida técnica identificada no relatório. `shadcn/ui` oferece componentes de alta qualidade e acessíveis que aceleram o desenvolvimento da UI.
*   **📋 Passos Detalhados:**
    1.  Abra `tsconfig.json` e garanta que a opção `"strict": true` esteja definida.
    2.  Execute `npx shadcn-ui@latest init` e configure-o conforme as perguntas.
    3.  Crie um arquivo `lib/utils.ts` se ele não existir.

```
Modifique o arquivo `tsconfig.json` para ativar o modo estrito, definindo a opção `"strict": true` dentro de `compilerOptions`. Em seguida, inicialize a `shadcn/ui` no projeto usando a CLI (`npx shadcn-ui@latest init`). Configure `components.json` para usar o alias `~/components` para os componentes e `~/lib/utils` para as funções utilitárias.
```

---

### Fase 2: Autenticação e UI Base

**Prompt 2.1: Implementação do Fluxo de Autenticação**

*   **🎯 Objetivo:** Criar um sistema de login e cadastro seguro e funcional.
*   **💡 Racional:** A autenticação é a porta de entrada para qualquer funcionalidade protegida. Usar os Auth Helpers do Supabase para Next.js simplifica o gerenciamento de sessão em Server Components e API Routes.
*   **⭐ Exemplo de Código (Action de Login):**
    ```typescript
    // app/login/actions.ts
    'use server';
    import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    
    export async function login(formData: FormData) {
      const email = String(formData.get('email'));
      const password = String(formData.get('password'));
      const supabase = createServerActionClient({ cookies });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Retornar erro para a UI
      }
      // Redirecionar para o dashboard
    }
    ```

```
Crie o fluxo de autenticação completo usando o Supabase Auth e Server Actions do Next.js. Desenvolva as páginas de Login (`/login`), Cadastro (`/signup`) e um formulário de Recuperação de Senha. Utilize o pacote `@supabase/auth-helpers-nextjs` para criar um `createServerActionClient` para gerenciar a sessão do usuário nas actions. Estilize os formulários com os componentes `Input`, `Button`, `Card` e `Label` da `shadcn/ui`.
```

---

**Prompt 2.2: Criação de Layouts e Rotas Protegidas**

*   **🎯 Objetivo:** Estruturar a área logada da aplicação e protegê-la de acesso não autorizado.
*   **💡 Racional:** O middleware do Next.js é o local ideal para centralizar a lógica de proteção de rotas, rodando na edge para máxima performance.
*   **⭐ Exemplo de Código (`middleware.ts`):**
    ```typescript
    // middleware.ts
    import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';
    
    export async function middleware(req: NextRequest) {
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req, res });
      const { data: { session } } = await supabase.auth.getSession();
    
      if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return res;
    }
    
    export const config = {
      matcher: ['/dashboard/:path*'],
    };
    ```

```
Crie um layout principal para a área logada em `/app/dashboard/layout.tsx`. Este layout deve conter um menu lateral e um cabeçalho. Em seguida, crie um arquivo `middleware.ts` na raiz do projeto para proteger todas as rotas sob `/dashboard`. Use `createMiddlewareClient` do Supabase para verificar a sessão do usuário e redirecioná-lo para a página de login caso não esteja autenticado.
```

---

### Fase 3: Migração de Funcionalidades e Pagamento de Dívida

**Prompt 3.1: Migração do Módulo de Pacientes**

*   **🎯 Objetivo:** Recriar a gestão de pacientes com as melhores práticas do Next.js 14.
*   **💡 Racional:** Usar Server Components para buscar dados reduz o JavaScript enviado ao cliente, melhora o SEO e a segurança. A `Table` da `shadcn/ui` é construída sobre a TanStack Table, oferecendo uma base poderosa para dados tabulados.
*   **⭐ Exemplo de Código (Busca de Dados em Server Component):**
    ```typescript
    // app/dashboard/pacientes/page.tsx
    import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    import { PacientesDataTable } from './_components/pacientes-data-table';
    
    export default async function PacientesPage() {
      const supabase = createServerComponentClient({ cookies });
      const { data: pacientes } = await supabase.from('pacientes').select('*');
      
      return <PacientesDataTable data={pacientes || []} />;
    }
    ```

```
Migre a funcionalidade de listagem e cadastro de pacientes para a rota `/dashboard/pacientes`. Crie um Server Component (`page.tsx`) para buscar a lista de pacientes do Supabase usando `createServerComponentClient`. Passe esses dados para um Client Component que renderiza uma `Table` da `shadcn/ui`. Implemente um formulário de cadastro/edição de paciente dentro de um `Dialog` da `shadcn/ui`, garantindo tipagem estrita para todos os dados do paciente.
```

---

### Fase 4: Inovação e Diferenciação

**Prompt 4.1: Implementação da Análise de Movimento (Computer Vision)**

*   **🎯 Objetivo:** Construir a prova de conceito para a análise de exercícios em tempo real.
*   **💡 Racional:** Esta funcionalidade é um diferencial competitivo enorme, posicionando o FisioFlow na vanguarda da tele-reabilitação.
*   **⭐ Exemplo de Código (Componente React Básico):**
    ```typescript
    'use client';
    import { useEffect, useRef } from 'react';
    import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
    
    export function PoseAnalysis() {
      const videoRef = useRef<HTMLVideoElement>(null);
      const canvasRef = useRef<HTMLCanvasElement>(null);
    
      useEffect(() => {
        // Lógica para inicializar o PoseLandmarker,
        // acessar a webcam e iniciar o loop de detecção
        // desenhando no canvas.
      }, []);
    
      return (
        <div>
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} />
        </div>
      );
    }
    ```

```
Crie a base para a funcionalidade de análise de movimento em tempo real na rota `/dashboard/exercicios/analise`. Desenvolva um Client Component que utilize a biblioteca `@mediapipe/tasks-vision`. Implemente a lógica para: 1. Acessar a webcam do usuário usando `navigator.mediaDevices.getUserMedia`. 2. Inicializar o `PoseLandmarker` do MediaPipe. 3. Em um loop `requestAnimationFrame`, passar os frames do vídeo para o landmarkder e desenhar os pontos da pose detectada sobre um elemento `<canvas>` que se sobrepõe ao vídeo.
```

---

### Fase 5: Deploy, Monitoramento e Otimizações Finais

**Prompt 5.1: Configuração de CI/CD e Monitoramento**

*   **🎯 Objetivo:** Automatizar o deploy e ter visibilidade sobre erros em produção.
*   **💡 Racional:** CI/CD remove o trabalho manual de deploy, enquanto o monitoramento de erros permite corrigir problemas proativamente antes que afetem um grande número de usuários.
*   **📋 Passos Detalhados:**
    1.  Conecte o repositório a um projeto Vercel.
    2.  Execute `npx @sentry/wizard@latest -i nextjs`.
    3.  Siga os passos do wizard para fazer login e conectar ao seu projeto Sentry.
    4.  O wizard criará os arquivos de configuração (`sentry.client.config.ts`, `sentry.server.config.ts`, etc.) e ajustará seu `next.config.js`.
    5.  Faça o deploy na Vercel.

```
Configure o deploy contínuo na Vercel a partir do branch `main`. Adicione o Sentry ao projeto Next.js para monitoramento de erros em tempo real usando o comando `npx @sentry/wizard@latest -i nextjs`. Siga as instruções para conectar ao seu projeto Sentry. Isso irá configurar automaticamente a captura de erros no cliente, servidor e edge. Por fim, faça um deploy de produção e gere um erro de teste para confirmar que ele aparece no dashboard do Sentry.
```

---

**Prompt 5.2: Otimização de Performance com Vercel Pro**

*   **🎯 Objetivo:** Utilizar os recursos avançados da Vercel para melhorar a performance e a funcionalidade da aplicação.
*   **💡 Racional:** Os recursos Pro (Analytics, Cron Jobs) agregam valor direto à aplicação sem a necessidade de infraestrutura externa.
*   **⭐ Exemplo de Código (`vercel.json` para Cron Job):**
    ```json
    {
      "crons": [
        {
          "path": "/api/send-reminders",
          "schedule": "0 9 * * 1-5"
        }
      ]
    }
    ```

```
Implemente as otimizações de performance da Vercel. Primeiro, ative o Vercel Analytics no dashboard do projeto para obter insights sobre os usuários. Em seguida, crie um Cron Job da Vercel para uma tarefa de rotina. Defina a configuração no arquivo `vercel.json` para chamar uma API Route (ex: `/api/send-reminders`) em um cronograma específico (ex: '0 9 * * 1-5' para rodar às 9h de segunda a sexta). Implemente a lógica básica nesta API Route.
```
