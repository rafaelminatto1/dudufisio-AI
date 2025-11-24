# 🧪 Teste Completo do Sistema - DuduFisio-AI

## ✅ Checklist de Testes

### 1. ✅ Iniciar Servidor

```bash
npm run dev
```

**Resultado esperado:**
- ✅ Servidor inicia na porta 3000
- ✅ Sem erros de conexão com Supabase
- ✅ Mensagem: "Ready" no console
- ✅ Acesse: http://localhost:3000

---

### 2. ✅ Teste de Autenticação

**URL**: http://localhost:3000/auth/login

**O que testar:**
- [ ] Login funciona
- [ ] Redireciona para dashboard após login
- [ ] Sessão persiste após reload
- [ ] Logout funciona

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para `/dashboard/agenda`

---

### 3. ✅ Teste: Cadastro de Paciente

**URL**: http://localhost:3000/dashboard/pacientes/novo

**O que testar:**
- [ ] Formulário carrega corretamente
- [ ] Validação de CPF funciona
- [ ] Campos obrigatórios são validados
- [ ] Salvar paciente funciona
- [ ] Redireciona para perfil após salvar

**Dados de teste:**
```
Nome: João Silva
CPF: 123.456.789-00
Email: joao@teste.com
Telefone: (11) 99999-9999
Data Nascimento: 01/01/1990
```

**Resultado esperado:**
- ✅ Validação funciona
- ✅ Paciente salvo no banco
- ✅ Redireciona para `/dashboard/pacientes/[id]`

---

### 4. ✅ Teste: Visualização de Paciente

**URL**: http://localhost:3000/dashboard/pacientes/[id]

**O que testar:**
- [ ] Página carrega sem erros
- [ ] Informações do paciente são exibidas
- [ ] Dashboard 360° carrega
- [ ] Tabs funcionam (Prontuário, Anamnese, etc.)

**Resultado esperado:**
- ✅ Todas as informações exibidas
- ✅ Componentes carregam corretamente
- ✅ Sem erros no console

---

### 5. ✅ Teste: Agenda

**URL**: http://localhost:3000/dashboard/agenda

**O que testar:**
- [ ] Visualização carrega (Dia/Semana/Mês)
- [ ] Filtros funcionam (profissional/recurso)
- [ ] Criar agendamento funciona
- [ ] Drag and drop funciona (se implementado)
- [ ] Auto-complete de pacientes funciona

**Resultado esperado:**
- ✅ Agenda carrega sem erros
- ✅ Filtros aplicam corretamente
- ✅ Agendamento criado com sucesso

---

### 6. ✅ Teste: Financeiro

**URL**: http://localhost:3000/dashboard/financeiro/pagamentos

**O que testar:**
- [ ] Formulário de pagamento carrega
- [ ] Criar receita funciona
- [ ] Criar despesa funciona
- [ ] Validação de valores funciona

**Dados de teste:**
```
Tipo: Receita
Paciente: [Selecione um paciente]
Valor: R$ 100,00
Categoria: Consulta
Forma de Pagamento: PIX
```

**Resultado esperado:**
- ✅ Transação criada com sucesso
- ✅ Aparece na lista de transações

---

### 7. ✅ Teste: Relatórios Financeiros

**URL**: http://localhost:3000/dashboard/financeiro/relatorios

**O que testar:**
- [ ] Página carrega
- [ ] Seleção de período funciona
- [ ] Gerar relatório funciona
- [ ] Valores calculados corretamente

**Resultado esperado:**
- ✅ Relatório gerado
- ✅ Receitas, despesas e saldo calculados

---

### 8. ✅ Teste: Biblioteca de Exercícios

**URL**: http://localhost:3000/dashboard/biblioteca/exercicios

**O que testar:**
- [ ] Lista de exercícios carrega
- [ ] Criar exercício funciona
- [ ] Busca funciona
- [ ] Filtros por categoria funcionam

**Resultado esperado:**
- ✅ CRUD de exercícios funciona
- ✅ Busca e filtros funcionam

---

## 🐛 Problemas Comuns e Soluções

### Erro: "Cannot connect to Supabase"

**Solução:**
1. Verifique `.env.local` está preenchido
2. Verifique credenciais estão corretas
3. Reinicie o servidor: `Ctrl+C` e `npm run dev` novamente

### Erro: "Table does not exist"

**Solução:**
```bash
# Verificar migrations aplicadas
supabase migration list

# Se necessário, aplicar manualmente via MCP ou SQL Editor
```

### Erro: "Unauthorized" ou "Permission denied"

**Solução:**
1. Verifique se está logado
2. Verifique RLS policies no Supabase
3. Verifique role do usuário

### Erro: "Module not found"

**Solução:**
```bash
npm install
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Ou use outra porta
npm run dev -- -p 3001
```

---

## 📊 Resultado dos Testes

Após executar todos os testes, preencha:

- [ ] Servidor inicia sem erros
- [ ] Autenticação funciona
- [ ] Cadastro de paciente funciona
- [ ] Visualização de paciente funciona
- [ ] Agenda funciona
- [ ] Financeiro funciona
- [ ] Relatórios funcionam
- [ ] Biblioteca funciona

**Status Geral**: ⬜ Funcionando | ⬜ Com erros

**Erros encontrados:**
```
[Liste os erros aqui]
```

---

## 🚀 Próximos Passos Após Testes

1. ✅ Corrigir erros encontrados
2. ✅ Configurar webhook do WhatsApp
3. ✅ Testar integrações (WhatsApp/Email)
4. ✅ Deploy em produção

---

**💡 Dica**: Mantenha este arquivo atualizado com os resultados dos testes!

