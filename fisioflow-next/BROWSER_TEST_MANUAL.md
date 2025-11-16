# 🌐 Teste Manual no Navegador - FisioFlow

## 📋 Checklist de Teste Manual

### 🔐 Autenticação

#### Página de Login (`/login`)
- [ ] Abrir http://localhost:3000/login
- [ ] Verificar visual do formulário
- [ ] Testar validação de campos vazios
- [ ] Inserir email: `therapist@dudufisio.com`
- [ ] Inserir senha: `Teste@123` (ou a senha correta)
- [ ] Clicar em "Entrar"
- [ ] Verificar redirecionamento para `/dashboard`

#### Criar Conta (`/signup`)
- [ ] Clicar em "Criar conta"
- [ ] Preencher formulário
- [ ] Verificar validação de email
- [ ] Verificar validação de senha forte
- [ ] Testar cadastro

#### Recuperação de Senha (`/recuperar-senha`)
- [ ] Clicar em "Esqueceu sua senha?"
- [ ] Inserir email válido
- [ ] Clicar em "Enviar Link de Recuperação"
- [ ] Verificar mensagem de sucesso

---

### 🏠 Dashboard Principal (`/dashboard`)

**Após fazer login:**

- [ ] Verificar header com nome do usuário
- [ ] Verificar sidebar com módulos
- [ ] Verificar cards de métricas:
  - [ ] Pacientes Ativos
  - [ ] Consultas Hoje
  - [ ] Receita do Mês
  - [ ] Taxa de Ocupação
- [ ] Verificar gráficos (se houver)
- [ ] Testar navegação entre módulos

---

### 👥 Módulo de Pacientes (`/dashboard/pacientes`)

- [ ] Acessar via sidebar
- [ ] Verificar tabela de pacientes
- [ ] Testar busca/filtro
- [ ] Testar ordenação de colunas
- [ ] Clicar em "Novo Paciente"
- [ ] Preencher formulário de paciente:
  - [ ] Nome
  - [ ] Email
  - [ ] Telefone
  - [ ] Data de Nascimento
- [ ] Salvar paciente
- [ ] Verificar paciente na lista
- [ ] Clicar em paciente existente
- [ ] Editar dados
- [ ] Verificar menu de ações (editar/excluir)

---

### 📅 Módulo de Agenda (`/dashboard/agenda`)

- [ ] Acessar via sidebar
- [ ] Verificar visualização de calendário
- [ ] Testar navegação entre semanas
- [ ] Verificar eventos no calendário
- [ ] Testar responsividade do calendário
- [ ] Verificar cores e legendas

---

### 🏥 Módulo de Tratamentos (`/dashboard/tratamentos`)

- [ ] Acessar via sidebar
- [ ] Verificar tabs:
  - [ ] Em Andamento
  - [ ] Pendente
  - [ ] Concluído
- [ ] Verificar cards de tratamento
- [ ] Verificar informações:
  - [ ] Tipo de tratamento
  - [ ] Paciente
  - [ ] Status
  - [ ] Progresso
  - [ ] Última sessão

---

### 💰 Módulo Financeiro (`/dashboard/financeiro`)

- [ ] Acessar via sidebar
- [ ] Verificar cards de métricas:
  - [ ] Receita Total
  - [ ] Inscrições
  - [ ] Vendas
  - [ ] Atividade Ativa
- [ ] Verificar formatação de valores em R$
- [ ] Verificar percentuais de crescimento
- [ ] Verificar ícones dos cards

---

### 🎮 Módulo de Gamificação (`/dashboard/gamificacao`)

- [ ] Acessar via sidebar
- [ ] Verificar card "Seu Progresso":
  - [ ] Nível atual
  - [ ] XP atual / XP para próximo nível
  - [ ] Barra de progresso
  - [ ] Conquistas/badges
  - [ ] Sequência de dias ativos
- [ ] Verificar card "Leaderboard":
  - [ ] Lista de jogadores
  - [ ] Pontuação
  - [ ] Posição do usuário destacada

---

### 🎥 Módulo de Análise de Exercícios (`/dashboard/exercicios/analise`)

- [ ] Acessar via sidebar
- [ ] Verificar área de vídeo/canvas
- [ ] Clicar em "Ativar Webcam"
- [ ] **Permitir acesso à câmera**
- [ ] Verificar se a webcam inicia
- [ ] Verificar sobreposição do canvas com landmarks
- [ ] Movimentar-se e verificar detecção de pose
- [ ] Verificar fps e performance
- [ ] Testar em diferentes posições

---

### 👤 Portal do Paciente (`/portal`)

- [ ] Fazer logout do dashboard
- [ ] Fazer login com usuário paciente: `patient@dudufisio.com`
- [ ] Verificar layout do portal
- [ ] Verificar header diferenciado
- [ ] Verificar conteúdo específico para paciente

---

## 🎨 Testes de UI/UX

### Tema e Cores
- [ ] Verificar tema claro (light mode)
- [ ] Verificar tema escuro (dark mode) - se implementado
- [ ] Verificar consistência de cores
- [ ] Verificar contraste de texto

### Componentes shadcn/ui
- [ ] Botões (primary, secondary, outline, ghost)
- [ ] Cards
- [ ] Inputs
- [ ] Labels
- [ ] Tabelas
- [ ] Dropdowns
- [ ] Dialogs/Modals
- [ ] Tabs
- [ ] Progress bars
- [ ] Badges
- [ ] Avatares

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Testar rotação de tela

### Navegação
- [ ] Sidebar funciona em desktop
- [ ] Menu hamburger funciona em mobile
- [ ] Breadcrumbs (se houver)
- [ ] Links ativos destacados
- [ ] Transições suaves

---

## 🐛 Checklist de Erros no Console

### Console do Navegador
1. Abrir DevTools (F12)
2. Ir para aba "Console"
3. Verificar por:
   - [ ] Erros JavaScript (vermelho)
   - [ ] Warnings (amarelo)
   - [ ] Network errors (falhas de requisição)
   - [ ] CORS errors
   - [ ] 404 errors (assets não encontrados)

### Network Tab
1. Ir para aba "Network"
2. Recarregar página
3. Verificar:
   - [ ] Tempo de carregamento total
   - [ ] Status 200 para todas requisições
   - [ ] Tamanho dos assets
   - [ ] Requisições à API Supabase

### Performance
1. Ir para aba "Performance" ou "Lighthouse"
2. Executar análise
3. Verificar métricas:
   - [ ] FCP (First Contentful Paint)
   - [ ] LCP (Largest Contentful Paint)
   - [ ] TBT (Total Blocking Time)
   - [ ] CLS (Cumulative Layout Shift)

---

## 📊 Resultados Esperados

### ✅ Sucesso
- Todas as páginas carregam sem erros
- Navegação fluida entre módulos
- Formulários validam corretamente
- Dados são salvos no Supabase
- Webcam e MediaPipe funcionam
- Layout responsivo em todos os dispositivos
- Nenhum erro crítico no console

### ⚠️  Atenção
- Warnings de desenvolvimento (aceitáveis)
- Lentidão na primeira carga (normal para dev)
- Cache do navegador pode afetar testes

### ❌ Falhas
- Erros 500 ou 404
- Páginas em branco
- Formulários não submetem
- Webcam não inicia
- Layout quebrado
- Erros JavaScript críticos

---

## 🔧 Comandos para Depuração

```bash
# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar linter
npm run lint

# Build de produção (teste)
npm run build
npm start

# Verificar logs do servidor
# (observar terminal onde npm run dev está rodando)
```

---

## 📝 Notas do Teste

**Data do Teste:** ___/___/_____  
**Testador:** _________________  
**Navegador:** _________________  
**Sistema Operacional:** _________________

**Problemas Encontrados:**
```
(Liste aqui qualquer problema encontrado durante o teste manual)


```

**Sugestões de Melhoria:**
```
(Liste aqui sugestões para melhorar a UX/UI)


```

**Status Final:** 
- [ ] ✅ Aprovado - Pronto para deploy
- [ ] ⚠️  Aprovado com ressalvas - Pequenos ajustes necessários
- [ ] ❌ Reprovado - Problemas críticos encontrados

---

## 🚀 Próximos Passos

Após completar este checklist:

1. [ ] Documentar todos os problemas encontrados
2. [ ] Criar issues no GitHub para bugs
3. [ ] Priorizar correções
4. [ ] Executar testes automatizados
5. [ ] Preparar ambiente de staging
6. [ ] Configurar CI/CD
7. [ ] Deploy para produção

---

**Criado por:** AI Assistant  
**Versão:** 1.0  
**Última Atualização:** 16/11/2025

