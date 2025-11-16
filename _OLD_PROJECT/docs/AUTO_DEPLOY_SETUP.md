# 🔄 Configuração de Deploy Automático

## Situação Atual vs Desejada

### ❌ Atual (Deploy Manual)
```
git push → Nada acontece
Você precisa rodar: cd packages/X && vercel --prod
```

### ✅ Desejado (Deploy Automático)
```
git push → Vercel detecta mudanças → Deploy automático apenas do que mudou
```

---

## 🎯 Configurando Deploy Automático

### Opção 1: Via Vercel Dashboard (Recomendado)

Para cada um dos 4 projetos:

#### 1. Agenda-Pacientes

1. Acesse https://vercel.com/rafael-minattos-projects/agenda-pacientes/settings
2. Vá em **Git** no menu lateral
3. Clique em **Connect Git Repository**
4. Selecione seu repositório: `rafael-minatto/dudufisio-ai` (ou o nome correto)
5. Em **Root Directory**, configure: `packages/agenda-pacientes`
6. Em **Production Branch**, deixe: `main` ou `master`
7. Ative **Automatically deploy all branches**
8. Salve

**Configurações Importantes:**
```json
{
  "rootDirectory": "packages/agenda-pacientes",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### 2. Tratamentos

Repita o processo acima para o projeto `tratamentos`:
- Root Directory: `packages/tratamentos`
- Mesmo processo de conexão Git

#### 3. Financeiro

Repita para `financeiro`:
- Root Directory: `packages/financeiro`

#### 4. Host

Por último, configure o `host`:
- Root Directory: `packages/host`

---

### Opção 2: Via Vercel CLI

```bash
# Para cada package
cd packages/agenda-pacientes
vercel link
vercel git connect

cd ../tratamentos
vercel link
vercel git connect

cd ../financeiro
vercel link
vercel git connect

cd ../host
vercel link
vercel git connect
```

---

## ⚙️ Configuração Avançada - Ignored Build Step

### Problema
Com monorepo, um push em QUALQUER arquivo trigga build de TODOS os projetos, mesmo que a mudança não afete aquele projeto específico.

### Solução: Ignored Build Step
Adicione em cada `vercel.json`:

**packages/agenda-pacientes/vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "devCommand": "npm run dev",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash ../scripts/ignore-build-step.sh agenda-pacientes"
}
```

**packages/tratamentos/vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "devCommand": "npm run dev",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash ../scripts/ignore-build-step.sh tratamentos"
}
```

**packages/financeiro/vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "devCommand": "npm run dev",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash ../scripts/ignore-build-step.sh financeiro"
}
```

**packages/host/vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "devCommand": "npm run dev",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash ../scripts/ignore-build-step.sh host"
}
```

### Script ignore-build-step.sh

Crie `packages/scripts/ignore-build-step.sh`:

```bash
#!/bin/bash

PACKAGE_NAME=$1

# Verifica se houve mudanças no package específico
git diff HEAD^ HEAD --quiet packages/$PACKAGE_NAME/

# Se não houve mudanças (exit code 0), ignora o build
if [ $? -eq 0 ]; then
  echo "🚫 No changes in packages/$PACKAGE_NAME - skipping build"
  exit 0
else
  echo "✅ Changes detected in packages/$PACKAGE_NAME - proceeding with build"
  exit 1
fi
```

---

## 🎯 Como Funcionará Após Configuração

### Cenário 1: Mudança em Agenda-Pacientes
```bash
# Você edita: packages/agenda-pacientes/src/pages/AgendaPage.tsx
git add .
git commit -m "feat: update agenda page"
git push

# Vercel detecta: ✅ agenda-pacientes mudou → Deploy apenas dele
# Outros 3 projetos: 🚫 Sem mudanças → Não fazem build
```

### Cenário 2: Mudança no Host
```bash
# Você edita: packages/host/src/App.tsx
git push

# Vercel detecta: ✅ host mudou → Deploy apenas do host
# Remotes: 🚫 Sem mudanças → Não fazem build
```

### Cenário 3: Mudança em Shared
```bash
# Você edita: shared/components/Button.tsx
git push

# Vercel detecta: ✅ Todos os projetos podem ser afetados
# Todos fazem build (caso não tenha ignore-build-step configurado)
```

---

## 🔐 Environment Variables

Para que o host sempre use as URLs corretas dos remotes em produção:

### No Vercel Dashboard do Host

1. Vá em: https://vercel.com/rafael-minattos-projects/host/settings/environment-variables
2. Adicione:

```env
# Production
VITE_AGENDA_PACIENTES_URL=https://agenda-pacientes.vercel.app
VITE_TRATAMENTOS_URL=https://tratamentos.vercel.app
VITE_FINANCEIRO_URL=https://financeiro.vercel.app

# Preview (opcional - para branches de preview)
VITE_AGENDA_PACIENTES_URL=https://agenda-pacientes-git-${VERCEL_GIT_COMMIT_REF}.vercel.app
VITE_TRATAMENTOS_URL=https://tratamentos-git-${VERCEL_GIT_COMMIT_REF}.vercel.app
VITE_FINANCEIRO_URL=https://financeiro-git-${VERCEL_GIT_COMMIT_REF}.vercel.app
```

### Atualize vite.config.ts do Host

```typescript
// packages/host/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      federation({
        name: 'host',
        remotes: {
          agendaPacientes: mode === 'production'
            ? `${env.VITE_AGENDA_PACIENTES_URL}/assets/remoteEntry.js`
            : 'http://localhost:5174/assets/remoteEntry.js',
          tratamentos: mode === 'production'
            ? `${env.VITE_TRATAMENTOS_URL}/assets/remoteEntry.js`
            : 'http://localhost:5175/assets/remoteEntry.js',
          financeiro: mode === 'production'
            ? `${env.VITE_FINANCEIRO_URL}/assets/remoteEntry.js`
            : 'http://localhost:5176/assets/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.3.1' },
          'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
          'react-router-dom': { singleton: true, requiredVersion: '^7.9.3' },
        },
      }),
    ],
    // ... resto da config
  };
});
```

---

## 📋 Checklist de Configuração

Para cada projeto, verifique:

### Agenda-Pacientes
- [ ] Conectado ao Git no Vercel Dashboard
- [ ] Root Directory: `packages/agenda-pacientes`
- [ ] Build Command: `npm run build`
- [ ] Install Command: `npm install`
- [ ] Output Directory: `dist`
- [ ] Ignore Build Step configurado (opcional)

### Tratamentos
- [ ] Conectado ao Git
- [ ] Root Directory: `packages/tratamentos`
- [ ] Build, Install, Output configurados
- [ ] Ignore Build Step configurado (opcional)

### Financeiro
- [ ] Conectado ao Git
- [ ] Root Directory: `packages/financeiro`
- [ ] Build, Install, Output configurados
- [ ] Ignore Build Step configurado (opcional)

### Host
- [ ] Conectado ao Git
- [ ] Root Directory: `packages/host`
- [ ] Environment Variables configuradas
- [ ] vite.config.ts atualizado
- [ ] Ignore Build Step configurado (opcional)

---

## 🎉 Resultado Final

Após configuração completa:

```
📝 Edita código
↓
💾 git commit & push
↓
🔍 Vercel detecta mudanças
↓
⚡ Build APENAS do que mudou
↓
🚀 Deploy automático em ~2-8s
↓
✅ Produção atualizada!
```

**Benefícios:**
- ✅ Deploy automático em cada push
- ✅ Build apenas do que mudou
- ✅ Economia de tempo de build
- ✅ Deploys mais rápidos
- ✅ Menos uso de recursos

---

## 🆘 Troubleshooting

### Problema: Todos os projetos fazem build em todo push
**Solução:** Configure o `ignoreCommand` no vercel.json de cada projeto

### Problema: Host não encontra remotes em produção
**Solução:** Verifique as environment variables no Vercel Dashboard

### Problema: Build falha no Vercel mas funciona local
**Solução:** Verifique que todas as dependências estão no package.json do projeto

### Problema: CORS errors em produção
**Solução:** Verifique os headers no vercel.json de cada remote

---

**Configuração Estimada:** 15-20 minutos  
**Resultado:** Deploy totalmente automático! 🎊

