# Scripts de Deploy

Este diretório contém scripts para automatizar o processo de deploy do projeto DuduFisio-AI.

## 📋 Scripts Disponíveis

### 🐧 Linux/macOS: `deploy.sh`
```bash
./scripts/deploy.sh "sua mensagem de commit"
```

### 🪟 Windows: `deploy.ps1`
```powershell
.\scripts\deploy.ps1 "sua mensagem de commit"
```

## 🚀 O que os Scripts Fazem

### 1. **Git Operations**
- ✅ Verifica status do repositório
- ✅ Adiciona arquivos modificados ao staging
- ✅ Cria commit com a mensagem fornecida
- ✅ Faz push para o branch `main` no GitHub

### 2. **Supabase Operations**
- ✅ Verifica se o Supabase está rodando
- ✅ Inicia o Supabase se necessário
- ✅ Verifica migrations pendentes
- ✅ Oferece opção de criar novas migrations
- ✅ Oferece opção de aplicar migrations

### 3. **Verificações Adicionais**
- ✅ Verifica se há dados mock para sincronizar
- ✅ Fornece resumo completo do deploy
- ✅ Sugere próximos passos

## 📖 Como Usar

### Exemplo Básico
```bash
# Linux/macOS
./scripts/deploy.sh "fix: Corrigir bug no modal de agendamento"

# Windows
.\scripts\deploy.ps1 "fix: Corrigir bug no modal de agendamento"
```

### Exemplo com Mensagem Detalhada
```bash
# Linux/macOS
./scripts/deploy.sh "feat: Adicionar nova funcionalidade de relatórios

- Implementar geração de relatórios PDF
- Adicionar filtros por data e paciente
- Melhorar interface de visualização"

# Windows
.\scripts\deploy.ps1 "feat: Adicionar nova funcionalidade de relatórios

- Implementar geração de relatórios PDF
- Adicionar filtros por data e paciente
- Melhorar interface de visualização"
```

## 🔧 Pré-requisitos

### Para Linux/macOS:
- Bash
- Git configurado
- Node.js e npm
- Supabase CLI instalado

### Para Windows:
- PowerShell 5.1 ou superior
- Git configurado
- Node.js e npm
- Supabase CLI instalado

## 📝 Convenções de Commit

Use as seguintes convenções para mensagens de commit:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, ponto e vírgula, etc.
- `refactor:` - Refatoração de código
- `test:` - Adição de testes
- `chore:` - Tarefas de manutenção

### Exemplos:
```bash
feat: Adicionar sistema de notificações
fix: Corrigir redirecionamento de pacientes
docs: Atualizar README com novas instruções
refactor: Melhorar performance do carregamento de dados
```

## 🚨 Troubleshooting

### Erro: "Supabase não está rodando"
```bash
# Inicie o Supabase manualmente
npx supabase start
```

### Erro: "Git não configurado"
```bash
# Configure o Git
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### Erro: "Supabase CLI não encontrado"
```bash
# Instale o Supabase CLI
npm install -g supabase
```

## 🔄 Workflow Recomendado

1. **Desenvolvimento Local**
   ```bash
   npm run dev
   ```

2. **Teste das Alterações**
   - Teste todas as funcionalidades
   - Verifique se não há erros no console
   - Teste em diferentes navegadores

3. **Deploy**
   ```bash
   ./scripts/deploy.sh "sua mensagem de commit"
   ```

4. **Verificação Pós-Deploy**
   - Acesse http://localhost:5173
   - Acesse http://127.0.0.1:54323 (Supabase Studio)
   - Verifique se tudo está funcionando

## 📞 Suporte

Se encontrar problemas com os scripts:

1. Verifique se todos os pré-requisitos estão instalados
2. Verifique se o Git está configurado corretamente
3. Verifique se o Supabase CLI está funcionando
4. Consulte os logs de erro para mais detalhes

## 🎯 Próximas Melhorias

- [ ] Adicionar verificação de testes antes do deploy
- [ ] Integração com CI/CD
- [ ] Deploy automático para produção
- [ ] Backup automático do banco de dados
- [ ] Notificações de deploy via Slack/Email