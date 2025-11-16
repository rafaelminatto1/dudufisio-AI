# 🧪 Instruções de Teste Completo - DuduFisio-AI

## 📋 Visão Geral

Este documento contém instruções para executar o teste completo da aplicação DuduFisio-AI, testando todos os perfis de usuário e todas as páginas do sistema.

## 🚀 Como Executar os Testes

### Pré-requisitos

1. **Servidor rodando localmente**
   ```bash
   npm run dev
   ```

2. **Variáveis de ambiente configuradas**
   - Verifique se o arquivo `.env.local` existe
   - Certifique-se que `GEMINI_API_KEY` está configurada (para funcionalidades de IA)

3. **Navegadores instalados**
   ```bash
   npx playwright install
   ```

### Executar Teste Completo (Todos os Perfis)

```bash
npm run test:e2e:comprehensive
```

Este comando irá:
- ✅ Fazer login em todos os 4 perfis (Admin, Fisioterapeuta, Paciente, Educador Físico)
- ✅ Navegar por todas as páginas de cada perfil
- ✅ Capturar erros do console
- ✅ Detectar páginas 404
- ✅ Medir performance (FCP, LCP, TTI)
- ✅ Aguardar 3 segundos para detectar erros assíncronos
- ✅ Gerar relatórios completos

### Executar Teste por Perfil Específico

```bash
# Testar apenas Admin
npm run test:e2e:admin

# Testar apenas Fisioterapeuta
npm run test:e2e:therapist

# Testar apenas Paciente
npm run test:e2e:patient

# Testar apenas Educador Físico
npm run test:e2e:educator
```

## 📊 Resultados dos Testes

Após a execução, os resultados serão salvos em:

### 1. Relatório JSON
📁 `test-results/comprehensive-test-results.json`

Contém todos os dados brutos dos testes em formato JSON.

### 2. Relatório CSV
📁 `test-results/ERROS_ENCONTRADOS.csv`

Planilha com todos os erros encontrados, incluindo:
- Perfil testado
- Página testada
- URL
- Status (success/error/404)
- Tempo de carregamento
- Lista de erros
- Lista de avisos
- Métricas de performance

### 3. Relatório Markdown
📁 `test-results/TESTE_RELATORIO.md`

Relatório formatado em Markdown com:
- Estatísticas por perfil
- Páginas com problemas
- Páginas com performance ruim
- Recomendações de correção

### 4. Relatório HTML do Playwright
📁 `playwright-report/index.html`

Relatório interativo do Playwright com:
- Screenshots de falhas
- Vídeos de falhas
- Timeline de execução
- Console logs

Para visualizar:
```bash
npx playwright show-report
```

## 🔍 Interpretando os Resultados

### Status da Página

- **✅ success**: Página carregou sem erros críticos
- **❌ error**: Página tem erros no console ou falhou ao carregar
- **🔍 404**: Página não encontrada (rota quebrada)
- **⏱️ timeout**: Página demorou muito para carregar (>30s)

### Métricas de Performance

- **FCP (First Contentful Paint)**: < 1.8s (Bom)
- **LCP (Largest Contentful Paint)**: < 2.5s (Bom)
- **TTI (Time to Interactive)**: < 3.8s (Bom)

### Severidade dos Erros

- **🔴 Críticos**: Aplicação quebra/não funciona
  - ChunkLoadError
  - Module not found
  - Cannot read property
  - Failed to load

- **🟡 Médios**: Funcionalidade comprometida
  - API errors
  - Data loading errors
  - Validation errors

- **🟢 Baixos**: Warnings, UI/UX
  - Console warnings
  - Deprecated APIs
  - Minor UI issues

## 🎯 Perfis de Usuário

### 1. Admin (admin@dudufisio.com)
**Páginas testadas:**
- Dashboard, Pacientes, Agenda, Sessões
- Exercícios, Protocolos, Materiais
- Relatórios, Analytics, IA
- Configurações, Usuários, Logs
- Backup, Integrações, CRM
- Eventos, Qualidade, População Health
- Notificações, WhatsApp, Inventário
- Mentoria, Assignments, Kanban
- Knowledge Base, Legal, Subscription

### 2. Fisioterapeuta (therapist@dudufisio.com)
**Páginas testadas:**
- Dashboard, Pacientes, Agenda
- Sessões (criar, editar, visualizar)
- Acompanhamento, Exercícios
- Protocolos, Materiais, Avaliações
- Mapa Corporal, Grupos
- Relatórios, Teleconsulta
- WhatsApp, Notificações
- Inventário, Suprimentos, Mentoria

### 3. Paciente (patient@dudufisio.com)
**Páginas testadas:**
- Dashboard Paciente
- Meus Agendamentos
- Meus Exercícios
- Meu Progresso
- Diário de Dor
- Documentos
- Gamificação
- Meus Vouchers
- Loja de Vouchers

### 4. Educador Físico (educator@dudufisio.com)
**Páginas testadas:**
- Dashboard Educador
- Lista de Clientes
- Biblioteca de Exercícios
- Financeiro (Comissões)

## 🔧 Troubleshooting

### Problema: Testes falham no login

**Solução:**
1. Verifique se o servidor está rodando (`npm run dev`)
2. Verifique se as credenciais estão corretas em `tests/e2e/comprehensive-application-test.spec.ts`
3. Tente fazer login manualmente primeiro

### Problema: Timeout ao carregar páginas

**Solução:**
1. Aumente o timeout no arquivo de teste
2. Verifique se há problemas de rede
3. Verifique se o servidor está respondendo

### Problema: Erros de console não são capturados

**Solução:**
1. Verifique se o navegador suporta console API
2. Verifique se há extensões do navegador interferindo
3. Execute em modo headless

## 📝 Próximos Passos

Após executar os testes:

1. **Revisar Relatórios**
   - Abra `TESTE_RELATORIO.md`
   - Abra `ERROS_ENCONTRADOS.csv`
   - Abra `playwright-report/index.html`

2. **Priorizar Correções**
   - Comece pelos erros críticos (🔴)
   - Depois erros médios (🟡)
   - Por último warnings (🟢)

3. **Corrigir Problemas**
   - Use os detalhes do relatório para identificar a causa
   - Implemente as correções
   - Execute os testes novamente para validar

4. **Otimizar Performance**
   - Identifique páginas lentas
   - Implemente code splitting
   - Otimize imagens e assets
   - Implemente cache

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Verifique os logs do Playwright
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento

## 📚 Referências

- [Playwright Documentation](https://playwright.dev/)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

