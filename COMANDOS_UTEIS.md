# 🛠️ Comandos Úteis - DuduFisio-AI

## 🚀 Desenvolvimento

### Iniciar Servidor
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

### Iniciar Produção
```bash
npm start
```

## 📦 Supabase

### Aplicar Migrations
```bash
supabase db push
```

### Ver Status das Migrations
```bash
supabase migration list
```

### Criar Nova Migration
```bash
supabase migration new nome_da_migration
```

### Resetar Banco Local
```bash
supabase db reset
```

## 🧪 Testes

### Executar Testes
```bash
npm test
```

### Testes E2E (Playwright)
```bash
npx playwright test
```

### Testes com UI
```bash
npx playwright test --ui
```

## 🔍 Verificações

### Verificar Linter
```bash
npm run lint
```

### Verificar Tipos TypeScript
```bash
npm run type-check
```

### Formatar Código
```bash
npm run format
```

## 📊 Supabase CLI

### Login
```bash
supabase login
```

### Linkar Projeto
```bash
supabase link --project-ref seu-project-ref
```

### Ver Logs
```bash
supabase logs
```

### Verificar Status
```bash
supabase status
```

## 🔐 Variáveis de Ambiente

### Gerar Token Seguro (PowerShell)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Gerar Token Seguro (Node.js)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Git

### Status
```bash
git status
```

### Adicionar Mudanças
```bash
git add .
```

### Commit
```bash
git commit -m "mensagem"
```

### Push
```bash
git push
```

## 🐛 Debug

### Ver Logs do Next.js
```bash
npm run dev -- --debug
```

### Verificar Variáveis de Ambiente
```bash
# No código, adicione temporariamente:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## 🔄 Atualizações

### Atualizar Dependências
```bash
npm update
```

### Atualizar Supabase CLI
```bash
npm install -g supabase@latest
```

## 📦 Build e Deploy

### Build para Vercel
```bash
npm run build
```

### Verificar Build Localmente
```bash
npm run build && npm start
```

## 🧹 Limpeza

### Limpar Cache do Next.js
```bash
rm -rf .next
```

### Limpar Node Modules
```bash
rm -rf node_modules && npm install
```

## 📚 Documentação

### Gerar Documentação
```bash
npm run docs
```

### Abrir Documentação
```bash
npm run docs:serve
```

---

**💡 Dica**: Mantenha este arquivo atualizado com comandos frequentes!

