# Configuração Manual dos Secrets do GitHub

Como há problemas de conectividade com o GitHub CLI, você precisa configurar os secrets manualmente no GitHub.

## Passo 1: Obter o SUPABASE_ACCESS_TOKEN

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **Access Tokens**
3. Clique em **Generate new token**
4. Dê um nome para o token (ex: "GitHub Actions")
5. Copie o token gerado

## Passo 2: Configurar os Secrets no GitHub

1. Acesse seu repositório no GitHub: `https://github.com/SEU_USUARIO/dudufisio-AI`
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**

### Secret 1: SUPABASE_ACCESS_TOKEN
- **Name**: `SUPABASE_ACCESS_TOKEN`
- **Value**: Cole o token que você copiou do Supabase Dashboard

### Secret 2: SUPABASE_PROJECT_REF
- **Name**: `SUPABASE_PROJECT_REF`
- **Value**: `urfxniitfbbvsaskicfo`

## Passo 3: Verificar se os Secrets foram Configurados

Após configurar os secrets, você pode verificar se estão funcionando:

1. Faça um pequeno commit e push para a branch `main`
2. Vá em **Actions** no seu repositório GitHub
3. Verifique se o workflow "Deploy to Supabase" foi executado com sucesso

## Workflows Configurados

### 1. Deploy to Supabase (`.github/workflows/supabase-deploy.yml`)
- Executa a cada push na branch `main`
- Faz deploy das funções e migrações para o Supabase

### 2. Sync Supabase (`.github/workflows/supabase-sync.yml`)
- Executa a cada push na branch `main`
- Sincroniza migrações pendentes

## Troubleshooting

Se os workflows falharem:

1. Verifique se os secrets estão configurados corretamente
2. Verifique se o projeto Supabase está ativo
3. Verifique os logs do workflow em **Actions** → **Deploy to Supabase** → **deploy job**

## Próximos Passos

Após configurar os secrets:

1. Faça um commit de teste
2. Verifique se o deploy automático funciona
3. Monitore os logs para garantir que tudo está funcionando

---

**Nota**: Os workflows estão configurados para executar automaticamente a cada push na branch `main`. Não é mais necessário executar scripts manuais!
