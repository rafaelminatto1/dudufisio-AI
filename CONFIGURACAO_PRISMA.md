# 🔧 Configuração do Prisma com Supabase

## ✅ Status Atual

- ✅ Prisma instalado (versão 6.19.0)
- ✅ Prisma Client gerado
- ✅ Schema configurado para PostgreSQL
- ⚠️ String de conexão precisa ser obtida do dashboard

## 📝 Como Obter a String de Conexão

### Passo 1: Acesse o Dashboard do Supabase

Vá para: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/database

### Passo 2: Encontre a Connection String

1. Clique em **"Database"** no menu lateral
2. Role até a seção **"Connection string"**
3. Selecione a aba **"URI"**
4. Copie a string de conexão

### Passo 3: Configure a String de Conexão

A string deve ter este formato:

```
postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres
```

Com suas credenciais:
- **Project Ref**: urfxniitfbbvsaskicfo
- **Password**: cFfS1GEwkj2fOAE2

### Possíveis Formatos:

**Opção 1 - Conexão Direta (recomendado para desenvolvimento):**
```
postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres
```

**Opção 2 - Connection Pooler (para produção):**
```
postgresql://postgres.urfxniitfbbvsaskicfo:cFfS1GEwkj2fOAE2@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Opção 3 - Com SSL (se necessário):**
```
postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres?sslmode=require
```

## 🎯 Arquivos Configurados

### 1. `.env` (para Prisma CLI)
```bash
DATABASE_URL=postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres
```

### 2. `.env.local` (para aplicação)
```bash
# Supabase
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Prisma
DATABASE_URL=postgresql://postgres:cFfS1GEwkj2fOAE2@db.urfxniitfbbvsaskicfo.supabase.co:5432/postgres
```

## 📦 Comandos Prisma Disponíveis

```bash
# Gerar o Prisma Client
npm run prisma:generate
# ou
npx prisma generate

# Sincronizar schema com o banco (pull)
npm run prisma:pull
# ou
npx prisma db pull

# Aplicar mudanças no banco (push)
npm run prisma:push
# ou
npx prisma db push

# Abrir Prisma Studio (interface visual)
npm run prisma:studio
# ou
npx prisma studio

# Criar uma migration
npx prisma migrate dev --name nome_da_migration

# Formatar o schema
npx prisma format
```

## 🔍 Scripts Adicionados ao package.json

Adicione os seguintes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:pull": "prisma db pull",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "prisma:format": "prisma format"
  }
}
```

## 🚀 Próximos Passos

1. **Verificar conexão**: Execute `npx prisma db pull` para verificar se a conexão funciona
2. **Gerar Client**: Execute `npx prisma generate` para gerar o Prisma Client
3. **Explorar banco**: Execute `npx prisma studio` para abrir interface visual

## ❓ Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o IP está na whitelist do Supabase (Settings > Database > Connection pooling)
- Ou libere todas as IPs: `0.0.0.0/0` (desenvolvimento)

### Erro: "Tenant or user not found"
- Verifique o formato do username na string de conexão
- Use o formato: `postgres:senha@host` (não `postgres.project:senha@host`)

### Erro: "Environment variable not found"
- Certifique-se que o arquivo `.env` existe na raiz do projeto
- O Prisma CLI procura automaticamente por `.env`

## 📚 Recursos

- [Documentação Prisma](https://www.prisma.io/docs)
- [Supabase com Prisma](https://supabase.com/docs/guides/integrations/prisma)
- [Dashboard Supabase](https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo)

---

**Desenvolvido para**: dudufisio-AI  
**Data**: 06/11/2025

