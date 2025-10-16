# 🧪 Plano de Teste Simplificado - DuduFisio-AI

## ✅ Status Atual

- [x] Servidor rodando em http://localhost:5176 (Status 200)
- [x] Erros de build corrigidos (Next.js imports removidos)
- [x] WhatsApp Web Service desabilitado temporariamente

## 🎯 Objetivo

Testar rapidamente a aplicação em todos os perfis de usuário e identificar:
- Erros no console
- Páginas 404
- Problemas de carregamento
- Funcionalidades quebradas

## 👥 Perfis de Teste

### 1. Admin
- **Email**: admin@dudufisio.com
- **Senha**: demo123456
- **Páginas principais**: Dashboard, Pacientes, Agenda, Configurações

### 2. Fisioterapeuta
- **Email**: therapist@dudufisio.com
- **Senha**: demo123456
- **Páginas principais**: Dashboard, Pacientes, Agenda, Sessões

### 3. Paciente
- **Email**: patient@dudufisio.com
- **Senha**: demo123456
- **Páginas principais**: Dashboard, Meus Agendamentos, Meus Exercícios

### 4. Educador Físico
- **Email**: educator@dudufisio.com
- **Senha**: demo123456
- **Páginas principais**: Dashboard, Clientes, Financeiro

## 📋 Passos de Teste

### Passo 1: Testar Login
1. Abrir http://localhost:5176
2. Verificar se página de login carrega
3. Abrir DevTools (F12) → Console
4. Verificar se há erros vermelhos

### Passo 2: Testar cada Perfil
Para cada perfil:
1. Fazer login
2. Aguardar 5 segundos (detectar erros assíncronos)
3. Navegar pelo menu lateral
4. Clicar em cada página principal
5. Anotar erros no console

### Passo 3: Documentar
- Criar arquivo `ERROS_ENCONTRADOS.md`
- Listar erros por perfil
- Categorizar: Crítico, Médio, Baixo

## 🔧 Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Verificar se está rodando
Invoke-WebRequest http://localhost:5176

# Executar testes automatizados (após criar)
npm run test:e2e:comprehensive
```

## 📝 Template de Relatório

```markdown
# Relatório de Teste - [Perfil]

## Páginas Testadas
- [ ] Dashboard
- [ ] Pacientes
- [ ] Agenda
- ...

## Erros Encontrados

### Críticos (🔴)
- [Descrição do erro]
- [URL/Página]
- [Screenshot]

### Médios (🟡)
- [Descrição do erro]

### Baixos (🟢)
- [Warnings do console]
```

## ⏱️ Estimativa de Tempo

- Login + navegação por perfil: ~5 minutos
- Total para 4 perfis: ~20 minutos
- Documentação: ~10 minutos
- **Total: ~30 minutos**

## 🎯 Próximos Passos

1. ✅ Servidor rodando
2. ⏳ Abrir aplicação no navegador
3. ⏳ Testar login de cada perfil
4. ⏳ Documentar erros
5. ⏳ Corrigir erros críticos
6. ⏳ Re-testar

