# 🛠️ Scripts de Utilidade - DuduFisio-AI

Scripts úteis para configuração, teste e monitoramento do sistema.

## 📋 Scripts Disponíveis

### 1. `setup-auth.js`
**Descrição:** Assistente de configuração de autenticação

**Uso:**
```bash
node scripts/setup-auth.js
```

**Funcionalidades:**
- ✅ Verifica variáveis de ambiente
- ✅ Exibe checklist de configuração
- ✅ Lista URLs de configuração
- ✅ Gera CRON_SECRET
- ✅ Exibe próximos passos

---

### 2. `test-calendar.js`
**Descrição:** Testa a geração de calendários e Edge Functions

**Uso:**
```bash
node scripts/test-calendar.js
```

**Funcionalidades:**
- ✅ Testa endpoint de geração de .ics
- ✅ Testa Cron Jobs (lembretes, limpeza, sync)
- ✅ Testa página de login
- ✅ Exibe resumo dos testes

---

### 3. `generate-cron-secret.js`
**Descrição:** Gera uma chave aleatória segura para CRON_SECRET

**Uso:**
```bash
node scripts/generate-cron-secret.js
```

**Funcionalidades:**
- ✅ Gera chave aleatória de 32 bytes
- ✅ Exibe instruções de configuração
- ✅ Salva chave em arquivo temporário
- ✅ Exibe avisos de segurança

---

### 4. `check-deployment.js`
**Descrição:** Verifica o status do deployment no Vercel

**Uso:**
```bash
node scripts/check-deployment.js
```

**Funcionalidades:**
- ✅ Verifica se o site está online
- ✅ Testa todas as URLs principais
- ✅ Mede tempo de resposta
- ✅ Exibe resumo do deployment

---

## 🚀 Execução Rápida

### Setup Completo
```bash
# 1. Verificar variáveis de ambiente e gerar CRON_SECRET
node scripts/setup-auth.js

# 2. Verificar deployment
node scripts/check-deployment.js

# 3. Testar funcionalidades
node scripts/test-calendar.js
```

### Setup Individual

#### Gerar CRON_SECRET
```bash
node scripts/generate-cron-secret.js
```

#### Verificar Deployment
```bash
node scripts/check-deployment.js
```

#### Testar Calendários
```bash
node scripts/test-calendar.js
```

---

## 📊 Fluxo de Trabalho Recomendado

### 1. Pós-Deploy
```bash
# Verificar se o deployment está online
node scripts/check-deployment.js
```

### 2. Configuração
```bash
# Executar setup completo
node scripts/setup-auth.js
```

### 3. Testes
```bash
# Testar funcionalidades
node scripts/test-calendar.js
```

---

## 🔧 Requisitos

- Node.js 16+ instalado
- Acesso à internet
- Variáveis de ambiente configuradas

---

## 📝 Notas

- Todos os scripts são executados localmente
- Nenhum script modifica arquivos do projeto
- Scripts são independentes e podem ser executados em qualquer ordem
- Logs coloridos para melhor visualização

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
**Solução:** Execute `npm install` na raiz do projeto

### Erro: "ENOTFOUND"
**Solução:** Verifique sua conexão com a internet

### Erro: "ECONNREFUSED"
**Solução:** O site pode estar offline ou em manutenção

---

## 📚 Documentação Relacionada

- `PROXIMOS_PASSOS.md` - Guia de configuração
- `RESUMO_IMPLEMENTACAO_FINAL.md` - Resumo da implementação
- `RESUMO_EXECUTIVO.md` - Resumo executivo

---

**Desenvolvido com ❤️ para DuduFisio-AI**

