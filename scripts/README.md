# 🚀 Deploy Automático com GitHub Actions

Este projeto agora usa **GitHub Actions** para deploy automático. Toda vez que você fizer push no GitHub, automaticamente será feito deploy no Supabase.

## ✨ Como Funciona

1. **Você faz push** no GitHub
2. **GitHub Actions detecta** as mudanças
3. **Automaticamente sincroniza** com Supabase
4. **Aplica migrations** se necessário
5. **Notifica o resultado** no GitHub

## 🔧 Configuração Necessária

### 1. Configurar Secrets no GitHub

Você precisa configurar 2 secrets no seu repositório GitHub:

#### `SUPABASE_ACCESS_TOKEN`
- Acesse [Supabase Dashboard](https://supabase.com/dashboard)
- Vá em **Settings** → **Access Tokens**
- Clique em **Generate new token**
- Copie o token gerado

#### `SUPABASE_PROJECT_REF`
- No Supabase Dashboard, vá em **Settings** → **General**
- Copie o **Reference ID** do seu projeto

### 2. Adicionar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret:
   - **Name**: `SUPABASE_ACCESS_TOKEN`
   - **Secret**: `seu_token_aqui`
5. Repita para `SUPABASE_PROJECT_REF`

📖 **Instruções detalhadas**: Veja [.github/SETUP_SECRETS.md](../.github/SETUP_SECRETS.md)

## 🎯 Workflow Atual

### Desenvolvimento Local
```bash
# Desenvolva normalmente
npm run dev

# Teste suas mudanças
npm run build
npm run start
```

### Deploy Automático
```bash
# Simplesmente faça push
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main

# 🎉 Deploy automático acontece!
```

## 📊 Monitoramento

### Verificar Status do Deploy
1. Acesse seu repositório no GitHub
2. Vá na aba **Actions**
3. Veja o status do workflow `Sync Supabase`

### Logs Detalhados
- Clique no workflow executado
- Veja os logs de cada etapa
- Identifique problemas se houver

## 🔄 O que Acontece Automaticamente

### ✅ Verificações
- Instala dependências
- Conecta com Supabase
- Verifica migrations pendentes

### ✅ Deploy
- Aplica migrations se necessário
- Executa seed se disponível
- Verifica se deploy foi bem-sucedido

### ✅ Notificações
- Mostra resumo no GitHub Actions
- Indica próximos passos
- Reporta erros se houver

## 🚨 Troubleshooting

### Deploy Falhou?
1. **Verifique os logs** na aba Actions
2. **Confirme os secrets** estão configurados
3. **Teste localmente** antes de fazer push

### Secrets Não Funcionam?
1. **Regenere o token** no Supabase
2. **Verifique o Project Reference ID**
3. **Confirme permissões** do token

### Migrations Não Aplicam?
1. **Verifique sintaxe** das migrations
2. **Teste localmente** com `npx supabase db push`
3. **Confirme estrutura** dos arquivos

## 💡 Dicas

- **Sempre teste localmente** antes de fazer push
- **Use branches** para testar mudanças grandes
- **Monitore as Actions** para acompanhar deploys
- **Mantenha secrets seguros** - nunca os commite

## 🎉 Vantagens

- ✅ **Zero configuração** após setup inicial
- ✅ **Deploy automático** a cada push
- ✅ **Histórico completo** no GitHub
- ✅ **Rollback fácil** se necessário
- ✅ **Notificações automáticas** de status

## 📞 Suporte

Se encontrar problemas:

1. Verifique [.github/SETUP_SECRETS.md](../.github/SETUP_SECRETS.md)
2. Consulte os logs das Actions
3. Teste localmente com Supabase CLI
4. Verifique se os secrets estão corretos