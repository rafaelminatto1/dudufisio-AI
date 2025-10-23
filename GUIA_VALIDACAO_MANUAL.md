# 🧪 Guia de Validação Manual - DuduFisio-AI

Este guia contém instruções passo a passo para validar manualmente as funcionalidades que não foram testadas automaticamente.

---

## 📋 Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- Acesso à aplicação: https://dudufisio-ai-rafael-minattos-projects.vercel.app
- Credenciais de teste (se aplicável)

---

## 🎯 Testes Manuais Pendentes

### 1. ✅ Validar Aplicação em Produção (CONCLUÍDO)
**Status:** ✅ **APROVADO** (testado via Playwright)

---

### 2. ⏰ Validar Cron Job

**Objetivo:** Confirmar que o Cron Job está executando a cada 6 horas

#### Opção A: Via Vercel Dashboard (Recomendado)

1. **Acessar Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Navegar para o Projeto**
   - Clicar em "dudufisio-AI" (ou nome do seu projeto)

3. **Acessar Cron Jobs**
   - Menu lateral: **Settings** > **Cron Jobs**
   - Ou: Menu superior: **Cron Jobs**

4. **Verificar Configuração**
   - Schedule: `0 */6 * * *` (a cada 6 horas)
   - Endpoint: `/api/cron/update-agenda-cache`
   - Status: **Enabled** ✅

5. **Verificar Logs**
   - Clicar em **View Logs**
   - Ver últimas execuções
   - Verificar se há erros

**Resultado Esperado:**
```
✅ Cron Job executou sem erros
✅ Response: { success: true }
✅ Status: 200 OK
```

#### Opção B: Via API (Teste Manual)

⚠️ **ATENÇÃO:** Requer CRON_SECRET configurado no Vercel

```bash
# Windows (PowerShell)
$headers = @{
    "Authorization" = "Bearer SEU_CRON_SECRET_AQUI"
}
Invoke-WebRequest -Uri "https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache" -Headers $headers -Method GET

# Linux/Mac (curl)
curl -X GET \
  "https://dudufisio-ai-rafael-minattos-projects.vercel.app/api/cron/update-agenda-cache" \
  -H "Authorization: Bearer SEU_CRON_SECRET_AQUI"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Edge Config atualizado com sucesso",
  "data": {
    "therapists": [...],
    "recurringBlocks": [...],
    "topPatients": [...]
  }
}
```

---

### 3. 🚀 Validar Edge Config - Performance

**Objetivo:** Medir se o Edge Config está melhorando a performance

#### Antes de Começar
- Abrir DevTools (F12)
- Aba **Network**
- Marcar **Disable cache**

#### Passo a Passo

1. **Acessar a Aplicação**
   ```
   https://dudufisio-ai-rafael-minattos-projects.vercel.app
   ```

2. **Fazer Login**
   - Email: `rafael@sateg.com.br` (ou seu email de teste)
   - Senha: (sua senha)

3. **Navegar para a Agenda**
   - Clicar em **Agenda** no menu lateral

4. **Medir Tempo de Carregamento**
   - Abrir DevTools (F12)
   - Aba **Network**
   - Recarregar a página (Ctrl+R)
   - Observar tempo de carregamento

5. **Verificar Requisições**
   - Filtrar por "agenda" ou "therapists"
   - Verificar tempo de resposta das APIs

**Resultado Esperado:**

| Métrica | Sem Edge Config | Com Edge Config |
|---------|----------------|-----------------|
| Carregamento da página | ~500-1000ms | ~100-300ms |
| API /therapists | ~200ms | ~10ms |
| API /recurringBlocks | ~200ms | ~10ms |

**Como Verificar se Edge Config está Ativo:**
- Resposta rápida (< 50ms) = Edge Config funcionando ✅
- Resposta lenta (> 100ms) = Consultando Supabase diretamente ⚠️

---

### 4. 🔄 Validar Supabase Realtime

**Objetivo:** Confirmar que mudanças sincronizam entre múltiplas abas

#### Passo a Passo

1. **Abrir Duas Abas do Navegador**
   - Aba 1: https://dudufisio-ai-rafael-minattos-projects.vercel.app
   - Aba 2: https://dudufisio-ai-rafael-minattos-projects.vercel.app

2. **Fazer Login em Ambas as Abas**
   - Email: `rafael@sateg.com.br`
   - Senha: (sua senha)

3. **Navegar para Agenda em Ambas**
   - Ambas as abas: Clicar em **Agenda**

4. **Criar Agendamento na Aba 1**
   - Clicar em **Novo Agendamento**
   - Preencher:
     - Paciente: Selecionar um paciente
     - Data: Hoje
     - Hora: Próxima hora disponível
     - Terapeuta: Selecionar um terapeuta
   - Clicar em **Salvar**

5. **Verificar Sincronização na Aba 2**
   - **NÃO** recarregar a página
   - Observar se o agendamento aparece automaticamente
   - Tempo esperado: < 2 segundos

**Resultado Esperado:**
```
✅ Agendamento criado na Aba 1
✅ Agendamento aparece automaticamente na Aba 2 (sem reload)
✅ Tempo de sincronização: < 2s
```

**Se NÃO funcionar:**
- Verificar console do navegador (F12 > Console)
- Procurar por erros relacionados a "realtime" ou "websocket"
- Verificar se Supabase Realtime está habilitado no projeto

---

### 5. 🎨 Validar UI/UX Geral

**Objetivo:** Confirmar que não há problemas visuais ou de usabilidade

#### Páginas para Testar

1. **Dashboard**
   - URL: `/dashboard`
   - Verificar:
     - [ ] Cards de estatísticas carregam
     - [ ] Gráficos renderizam
     - [ ] Sem erros visuais

2. **Pacientes**
   - URL: `/patients`
   - Verificar:
     - [ ] Lista de pacientes carrega
     - [ ] Busca funciona
     - [ ] Filtros funcionam
     - [ ] Paginação funciona

3. **Agenda**
   - URL: `/agenda`
   - Verificar:
     - [ ] Calendário renderiza
     - [ ] Drag & drop funciona
     - [ ] Modal de novo agendamento abre
     - [ ] Cores dos terapeutas aparecem

4. **Acompanhamento**
   - URL: `/acompanhamento`
   - Verificar:
     - [ ] Lista de sessões carrega
     - [ ] Formulário de nova sessão funciona
     - [ ] Notas salvam corretamente

5. **Financeiro**
   - URL: `/financial`
   - Verificar:
     - [ ] Dashboard financeiro carrega
     - [ ] Gráficos de receita aparecem
     - [ ] Lista de pagamentos carrega

#### Checklist de UI/UX

- [ ] Layout responsivo (testar em mobile)
- [ ] Navegação fluida entre páginas
- [ ] Loading states aparecem
- [ ] Mensagens de erro são claras
- [ ] Formulários validam corretamente
- [ ] Botões têm feedback visual
- [ ] Cores e tipografia consistentes

---

## 🐛 Como Reportar Problemas

Se encontrar algum problema durante os testes:

### 1. Capturar Informações
- Screenshot do erro
- Console do navegador (F12 > Console)
- Network tab (F12 > Network)
- URL onde ocorreu

### 2. Documentar
Criar um arquivo `BUG_REPORT_[DATA].md` com:

```markdown
# 🐛 Bug Report - [Descrição Curta]

**Data:** DD/MM/YYYY HH:MM
**Navegador:** Chrome/Firefox/Safari
**URL:** https://...

## Problema
[Descrição detalhada]

## Passos para Reproduzir
1. Acessar...
2. Clicar em...
3. Preencher...
4. Observar erro...

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Screenshots
[Anexar imagens]

## Console Errors
```
[Colar erros do console]
```

## Network Requests
[Requisições que falharam]
```

---

## 📊 Planilha de Testes

Use esta tabela para registrar os resultados dos testes:

| # | Teste | Status | Tempo | Notas |
|---|-------|--------|-------|-------|
| 1 | Aplicação em Produção | ✅ | < 2s | OK |
| 2 | Cron Job (Vercel Dashboard) | ⏳ | - | Aguardando execução |
| 3 | Cron Job (API Manual) | ⏳ | - | Pendente |
| 4 | Edge Config Performance | ⏳ | - | Pendente |
| 5 | Supabase Realtime | ⏳ | - | Pendente |
| 6 | UI Dashboard | ⏳ | - | Pendente |
| 7 | UI Pacientes | ⏳ | - | Pendente |
| 8 | UI Agenda | ⏳ | - | Pendente |
| 9 | UI Acompanhamento | ⏳ | - | Pendente |
| 10 | UI Financeiro | ⏳ | - | Pendente |

**Legenda:**
- ✅ Passou
- ❌ Falhou
- ⏳ Pendente
- ⚠️ Parcial

---

## 🎯 Critérios de Aceitação

Para considerar a validação completa, todos os seguintes itens devem estar ✅:

### Funcionalidades Core
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] CRUD de pacientes funciona
- [ ] Agenda permite criar/editar/deletar agendamentos
- [ ] Acompanhamento permite criar notas

### Performance
- [ ] Carregamento inicial < 3s
- [ ] Navegação entre páginas < 500ms
- [ ] APIs respondem < 1s
- [ ] Edge Config reduz latência (se implementado)

### Integrações
- [ ] Supabase conecta corretamente
- [ ] Supabase Realtime sincroniza
- [ ] Cron Job executa sem erros
- [ ] Edge Config atualiza

### UX
- [ ] Sem erros visuais
- [ ] Responsivo em mobile
- [ ] Mensagens de erro claras
- [ ] Loading states adequados

---

## 🚀 Próximos Passos Após Validação

Se todos os testes passarem:
1. ✅ Marcar deploy como **APROVADO**
2. 📊 Gerar relatório final
3. 📚 Atualizar documentação
4. 🎉 Celebrar! 🍾

Se houver problemas:
1. ⚠️ Documentar bugs encontrados
2. 🔧 Criar issues para correção
3. 🔄 Repetir ciclo de teste após correções

---

**Bons testes! 🧪**  
Qualquer dúvida, consulte `RELATORIO_VALIDACAO_FINAL.md` ou `RESUMO_FINAL_PROJETO.md`.

