# 🗑️ Remover Projetos Antigos dos Microfrontends na Vercel

## 📋 Projetos a Remover

Os seguintes projetos são dos microfrontends antigos e **não são mais necessários**:

1. **host** (`prj_ESlAYrc04l5jcvJ3ASqEBxcXRlzd`)
   - Criado: 16/11/2025
   - Tipo: Microfrontend host (antigo)

2. **agenda-pacientes** (`prj_1x3fDqlofsYj4rxCujGl2An8HJxG`)
   - Criado: 16/11/2025
   - Tipo: Microfrontend agenda (antigo)

3. **tratamentos** (`prj_sGdhXaWFwWCCQ4pfx5N9NpOGVFgY`)
   - Criado: 16/11/2025
   - Tipo: Microfrontend tratamentos (antigo)

4. **financeiro** (`prj_8pHM6TjmZZZksGMrPIzOofpRbbx4`)
   - Criado: 16/11/2025
   - Tipo: Microfrontend financeiro (antigo)

## ✅ Projeto Atual (MANTER)

- ✅ **dudufisio-ai** (`prj_lJT0yis7pFVJASeoHaykO6A1U7kz`)
  - **NÃO REMOVER** - Este é o projeto atual Next.js

## 🚀 Como Remover via Vercel Dashboard

### Método 1: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/rafael-minattos-projects
2. Para cada projeto antigo:
   - Clique no projeto
   - Vá em **Settings** → **General**
   - Role até o final da página
   - Clique em **Delete Project**
   - Confirme a exclusão

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Para cada projeto, remover:
vercel remove host --yes
vercel remove agenda-pacientes --yes
vercel remove tratamentos --yes
vercel remove financeiro --yes
```

**Nota:** O comando `vercel remove` pode não funcionar diretamente. Use o Dashboard se necessário.

## ⚠️ Avisos Importantes

1. **Backup:** Antes de remover, certifique-se de que não há dados importantes nesses projetos
2. **Domínios:** Verifique se há domínios configurados nesses projetos que precisam ser migrados
3. **Variáveis de Ambiente:** Se houver variáveis específicas, anote-as antes de remover

## 📝 Checklist

Antes de remover cada projeto, verifique:

- [ ] Não há deploys ativos sendo usados
- [ ] Não há domínios customizados configurados
- [ ] Não há variáveis de ambiente importantes
- [ ] O projeto `dudufisio-ai` está funcionando corretamente

## ✅ Após Remover

Após remover os projetos antigos:

1. ✅ Verificar que `dudufisio-ai` continua funcionando
2. ✅ Confirmar que não há referências quebradas
3. ✅ Limpar qualquer configuração relacionada

---

**Status:** Aguardando remoção manual via Dashboard ou CLI

