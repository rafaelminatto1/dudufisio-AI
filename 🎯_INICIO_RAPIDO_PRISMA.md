# 🚀 Início Rápido - Prisma + Supabase

## ⚡ 3 Passos Para Começar

### 1️⃣ Ativar o Projeto no Supabase (2 min)

```
🌐 Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo

✅ Verifique se está ACTIVE (não pausado)
🔓 Settings → Database → Network restrictions → Adicionar: 0.0.0.0/0
```

### 2️⃣ Testar Conexão (30 seg)

```bash
# No terminal, execute:
npm run prisma:pull
```

**✅ Se funcionar, você verá:**
```
✔ Introspected X models and Y enums from the database
```

**❌ Se falhar:**
- Consulte o arquivo `CHECKLIST_SUPABASE.md`
- Verifique se o projeto está ativo
- Confirme que liberou o IP na whitelist

### 3️⃣ Começar a Usar (1 min)

```bash
# Gerar Prisma Client
npm run prisma:generate

# Abrir interface visual
npm run prisma:studio
```

## 🎨 Comandos Essenciais

| Comando | Descrição |
|---------|-----------|
| `npm run prisma:studio` | 🎨 Abrir interface visual do banco |
| `npm run prisma:generate` | 🔄 Gerar Prisma Client |
| `npm run prisma:pull` | ⬇️ Sincronizar schema do banco |
| `npm run prisma:push` | ⬆️ Aplicar mudanças no banco |

## 💻 Usar no Código

```typescript
import { prisma } from '@/lib/prisma';

// Buscar pacientes
const patients = await prisma.patients.findMany();

// Criar paciente
const patient = await prisma.patients.create({
  data: {
    full_name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com'
  }
});
```

## 📄 Documentos Criados

| Arquivo | Conteúdo |
|---------|----------|
| **PRISMA_CONFIGURADO.md** | 📚 Guia completo e exemplos |
| **CHECKLIST_SUPABASE.md** | 🔍 Resolver problemas de conexão |
| **CONFIGURACAO_PRISMA.md** | 🔧 Detalhes técnicos |
| **Este arquivo** | ⚡ Início rápido |

## 🆘 Problemas?

### Erro de Conexão?
→ Abra `CHECKLIST_SUPABASE.md`

### Dúvidas sobre uso?
→ Abra `PRISMA_CONFIGURADO.md`

### Exemplos de código?
→ Seção "Exemplos Avançados" no `PRISMA_CONFIGURADO.md`

---

## 📊 Status da Configuração

✅ Prisma instalado (v6.19.0)  
✅ Schema configurado  
✅ Client configurado (`lib/prisma.ts`)  
✅ Scripts NPM adicionados  
✅ Variáveis de ambiente (.env e .env.local)  
⚠️ **Aguardando**: Você verificar o Supabase

## 🎯 Próximo Passo

**Execute agora:**
```bash
npm run prisma:pull
```

Se funcionar → Você está pronto! 🎉  
Se falhar → Abra `CHECKLIST_SUPABASE.md`

---

**Projeto**: dudufisio-AI  
**Supabase**: urfxniitfbbvsaskicfo  
**Região**: São Paulo (SA-EAST-1)

