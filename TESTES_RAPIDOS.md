# 🧪 Testes Rápidos - DuduFisio-AI

## ✅ Checklist de Testes

### 1. Teste de Conexão com Supabase

**O que testar:**
- Servidor inicia sem erros
- Conexão com banco de dados funciona

**Como testar:**
```bash
npm run dev
```

**Resultado esperado:**
- ✅ Servidor inicia na porta 3000
- ✅ Sem erros de conexão no console
- ✅ Página inicial carrega

---

### 2. Teste de Autenticação

**O que testar:**
- Login funciona
- Sessão persiste
- Logout funciona

**Como testar:**
1. Acesse `/auth/login`
2. Faça login
3. Verifique se redireciona para dashboard
4. Recarregue a página (sessão deve persistir)
5. Faça logout

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento correto
- ✅ Sessão persiste após reload
- ✅ Logout funciona

---

### 3. Teste de Cadastro de Paciente

**O que testar:**
- Formulário valida campos obrigatórios
- CPF é validado corretamente
- Dados são salvos no banco

**Como testar:**
1. Acesse `/dashboard/pacientes/novo`
2. Preencha apenas campos obrigatórios
3. Tente salvar sem CPF válido (deve dar erro)
4. Preencha CPF válido
5. Salve

**Resultado esperado:**
- ✅ Validação de campos obrigatórios
- ✅ Validação de CPF funciona
- ✅ Paciente salvo com sucesso
- ✅ Redireciona para perfil do paciente

---

### 4. Teste de Agenda

**O que testar:**
- Visualizações funcionam
- Filtros funcionam
- Criação de agendamento funciona

**Como testar:**
1. Acesse `/dashboard/agenda`
2. Teste mudar visualização (Dia/Semana/Mês)
3. Aplique filtros (profissional/recurso)
4. Crie um novo agendamento
5. Verifique se aparece na agenda

**Resultado esperado:**
- ✅ Visualizações carregam
- ✅ Filtros funcionam
- ✅ Agendamento criado com sucesso
- ✅ Aparece na visualização correta

---

### 5. Teste de Financeiro

**O que testar:**
- Criação de transação
- Relatórios funcionam
- Filtros de período

**Como testar:**
1. Acesse `/dashboard/financeiro/pagamentos`
2. Crie uma receita
3. Crie uma despesa
4. Acesse `/dashboard/financeiro/relatorios`
5. Gere relatório do mês atual

**Resultado esperado:**
- ✅ Transações criadas com sucesso
- ✅ Relatório gera corretamente
- ✅ Valores calculados corretamente

---

### 6. Teste de WhatsApp (Opcional)

**O que testar:**
- Envio de mensagem funciona
- Webhook recebe confirmações

**Como testar:**
1. Use uma Server Action ou API Route
2. Envie mensagem de teste
3. Verifique logs do WhatsApp
4. Teste webhook (se configurado)

**Resultado esperado:**
- ✅ Mensagem enviada
- ✅ Resposta da API recebida
- ✅ Webhook processa confirmações

---

### 7. Teste de Email (Opcional)

**O que testar:**
- Envio de email funciona

**Como testar:**
1. Use uma Server Action ou API Route
2. Envie email de teste
3. Verifique inbox

**Resultado esperado:**
- ✅ Email enviado
- ✅ Recebido no inbox

---

## 🐛 Problemas Comuns

### Erro: "Cannot connect to Supabase"
- ✅ Verifique `.env.local` está preenchido
- ✅ Verifique credenciais estão corretas
- ✅ Reinicie o servidor

### Erro: "Table does not exist"
- ✅ Execute migrations: `supabase db push`
- ✅ Verifique se migrations foram aplicadas

### Erro: "Unauthorized"
- ✅ Verifique RLS policies
- ✅ Verifique se usuário está autenticado
- ✅ Verifique permissões do usuário

### Erro: "WhatsApp API error"
- ✅ Verifique token ainda é válido
- ✅ Verifique `WHATSAPP_PHONE_NUMBER_ID` está correto
- ✅ Verifique webhook está configurado

---

## 📊 Testes Automatizados

### Executar Todos os Testes
```bash
npm test
```

### Testes E2E
```bash
npx playwright test
```

### Testes com Cobertura
```bash
npm test -- --coverage
```

---

## ✅ Checklist de Testes Completos

- [ ] Conexão com Supabase
- [ ] Autenticação (login/logout)
- [ ] Cadastro de paciente
- [ ] Visualização de paciente
- [ ] Agenda (visualizações e filtros)
- [ ] Criação de agendamento
- [ ] Financeiro (transações)
- [ ] Relatórios financeiros
- [ ] Biblioteca de exercícios
- [ ] WhatsApp (se configurado)
- [ ] Email (se configurado)

---

**💡 Dica**: Execute estes testes após cada deploy para garantir que tudo funciona!

