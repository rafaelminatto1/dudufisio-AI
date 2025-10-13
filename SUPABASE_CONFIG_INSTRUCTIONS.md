# 🔐 Instruções de Configuração do Supabase

**ATENÇÃO**: As credenciais foram fornecidas e estão prontas para uso!

---

## 📝 PASSO 1: Criar arquivo .env.local

Na raiz do projeto, crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA

# Service Role (para migrations apenas - NÃO compartilhar)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg

# Outras configurações
NODE_ENV=development
```

---

## ✅ PASSO 2: Verificar se já existe

Se o arquivo `.env.local` já existir, adicione apenas estas linhas (ou atualize):

```env
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
```

---

## 🚀 PASSO 3: Reiniciar Servidor

```bash
# Parar o servidor atual (Ctrl+C)

# Iniciar novamente
npm run dev
```

---

## ✅ VALIDAÇÃO

Após reiniciar, verifique no console do navegador:

**Deve aparecer**:
```
[config] supabase.config.loaded {
  environment: development,
  hasValidCredentials: true,  ← IMPORTANTE!
  url: https://urfxniitfbbvsaskicfo.supabase.co
}
```

Se aparecer `hasValidCredentials: false`, verifique se o `.env.local` foi criado corretamente.

---

## 📚 Próximos Passos

Consulte `SUPABASE_MIGRATION_GUIDE.md` para:
- Aplicar migrations
- Criar usuários
- Popular dados
- Desabilitar modo mock

---

**Credenciais fornecidas em**: 12/10/2025  
**Status**: Pronto para configuração manual

