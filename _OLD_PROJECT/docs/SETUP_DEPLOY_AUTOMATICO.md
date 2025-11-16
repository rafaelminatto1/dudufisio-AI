# 🚀 Guia de Configuração: Deploy Automático

## 📋 Visão Geral

Este projeto está configurado para deploy automático no Vercel usando GitHub Actions.

**Benefícios:**
- ✅ Deploy automático ao fazer push na `main`
- ✅ Preview deploys para Pull Requests
- ✅ Validação automática (linting + build)
- ✅ Notificações de falhas
- ✅ Zero configuração manual

---

## ⚙️ Configuração Inicial

### 1. Obter Tokens do Vercel

#### a) Vercel Token
1. Acesse https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Nome: `dudufisio-github-actions`
4. Scope: Todos os projetos
5. Copie o token gerado

#### b) Organization ID
```bash
vercel whoami
# Copie o ID da organização
```

Ou acesse: https://vercel.com/[seu-usuario]/settings

#### c) Project ID
```bash
cd seu-projeto
vercel link
# O ID do projeto será exibido
```

Ou acesse: https://vercel.com/dashboard → Seu Projeto → Settings → General → Project ID

---

### 2. Adicionar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em: **Settings** → **Secrets and variables** → **Actions**
3. Clique em "New repository secret"
4. Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VERCEL_TOKEN` | Token do Vercel | Token de acesso ao Vercel |
| `VERCEL_ORG_ID` | ID da organização | ID da sua org/conta Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto | ID do projeto no Vercel |

**Exemplo:**
```
VERCEL_TOKEN: abc123xyz...
VERCEL_ORG_ID: team_abc123
VERCEL_PROJECT_ID: prj_xyz789
```

---

## 🔄 Workflows Disponíveis

### 1. Deploy de Produção
**Arquivo:** `.github/workflows/deploy-production.yml`

**Trigger:**
- Push na branch `main`
- Manual via GitHub Actions UI

**Processo:**
1. ✅ Checkout do código
2. ✅ Instalação de dependências
3. ✅ Linting (não bloqueia deploy)
4. ✅ Testes (não bloqueia deploy)
5. ✅ Build de produção
6. ✅ Análise de bundle
7. 🚀 Deploy para produção
8. 📧 Notificação em caso de falha

**URL Final:** https://moocafisio.com.br

---

### 2. Deploy de Preview
**Arquivo:** `.github/workflows/deploy-preview.yml`

**Trigger:**
- Push em qualquer branch (exceto `main`)
- Pull Requests para `main`

**Processo:**
1. ✅ Checkout do código
2. ✅ Instalação de dependências
3. ✅ Linting
4. ✅ Build
5. 🔍 Deploy preview
6. 💬 Comentário no PR com URL

**URL Preview:** Gerada automaticamente pelo Vercel

---

## 📜 Script Manual de Deploy

### Uso:

```bash
# Deploy preview
./scripts/deploy.sh

# Deploy produção
./scripts/deploy.sh --production
```

### Recursos:
- ✅ Verificação de branch
- ✅ Verificação de mudanças não commitadas
- ✅ Pull automático do remoto
- ✅ Linting
- ✅ Testes (opcional)
- ✅ Build
- ✅ Deploy via Vercel CLI

---

## 🔧 Troubleshooting

### Erro: "VERCEL_TOKEN not found"
**Solução:** Verifique se o secret foi adicionado corretamente no GitHub.

```bash
# Teste localmente
vercel whoami
```

---

### Erro: "Build failed"
**Solução:** Execute localmente primeiro:

```bash
npm run build
```

Corrija todos os erros antes de fazer push.

---

### Erro: "Project not found"
**Solução:** Verifique o `VERCEL_PROJECT_ID`:

```bash
vercel projects list
```

---

### Deploy não é acionado
**Soluções:**
1. Verifique se os workflows estão ativos em: Settings → Actions
2. Verifique se há erros nos workflows recentes
3. Force um novo trigger:
```bash
git commit --allow-empty -m "trigger deploy"
git push
```

---

## 📊 Monitoramento

### GitHub Actions
- URL: `https://github.com/[usuario]/[repo]/actions`
- Veja logs de cada deploy
- Status de builds em tempo real

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Métricas de performance
- Logs de runtime
- Analytics

---

## 🎯 Fluxo Recomendado

### Development
```bash
# 1. Criar branch de feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 3. Push da branch
git push origin feature/nova-funcionalidade

# 4. Preview deploy é acionado automaticamente
# 5. Verificar preview e abrir PR
```

### Production
```bash
# 1. Merge do PR para main
git checkout main
git pull

# 2. Deploy automático é acionado
# 3. Monitorar em GitHub Actions
# 4. Verificar em https://moocafisio.com.br
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git)

### Comandos Úteis
```bash
# Ver status do projeto Vercel
vercel status

# Ver deployments recentes
vercel ls

# Ver logs de produção
vercel logs

# Rollback para deploy anterior
vercel rollback

# Listar variáveis de ambiente
vercel env ls
```

---

## ✅ Checklist de Configuração

- [ ] Token do Vercel obtido
- [ ] Organization ID copiado
- [ ] Project ID copiado
- [ ] Secrets adicionados no GitHub
- [ ] Workflows ativados
- [ ] Script de deploy tem permissão de execução (`chmod +x scripts/deploy.sh`)
- [ ] Primeiro deploy manual realizado com sucesso
- [ ] Deploy automático testado com push

---

## 🎉 Conclusão

Com essa configuração, você tem:
- ✅ Deploy automático em produção
- ✅ Preview deploys para testes
- ✅ CI/CD completo
- ✅ Notificações automáticas
- ✅ Rollback fácil

**Próximos passos:**
1. Configure os secrets no GitHub
2. Faça um push de teste
3. Verifique o deploy no dashboard
4. Monitore por 24h para garantir estabilidade

---

**Data:** 03 de Novembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso

