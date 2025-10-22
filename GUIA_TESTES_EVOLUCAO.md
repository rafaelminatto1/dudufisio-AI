# 🧪 Guia de Testes - Sistema de Evolução de Sessão

## ✅ Checklist Completo de Testes

---

## 1. Teste de Configuração de Interface

### 1.1 Acessar Página de Configurações
- [ ] Abrir `/session-evolution-settings`
- [ ] Página carrega sem erros
- [ ] 4 cards de opções aparecem
- [ ] Card do modo atual está destacado

### 1.2 Alternar Entre Modos
- [ ] Clicar em cada um dos 4 cards
- [ ] Card selecionado fica destacado (check verde)
- [ ] Botão "Salvar Configuração" aparece habilitado
- [ ] Mensagem de "Alterações não salvas" aparece

### 1.3 Salvar Configuração
- [ ] Clicar em "Salvar Configuração"
- [ ] Toast de sucesso aparece
- [ ] Badge "Modo Atual" atualiza
- [ ] Botão "Salvar" fica desabilitado

### 1.4 Persistência
- [ ] Recarregar página (F5)
- [ ] Modo salvo permanece selecionado
- [ ] localStorage contém preferência
- [ ] Abrir em nova aba mantém configuração

---

## 2. Teste dos 4 Modos de Interface

### 2.1 Modo: Sistema Existente (🏠)
**Configurar:**
1. Ir em `/session-evolution-settings`
2. Selecionar "Sistema Existente"
3. Salvar

**Testar:**
- [ ] Ir em `/agenda`
- [ ] Clicar em agendamento
- [ ] Clicar "Iniciar Atendimento"
- [ ] Navega para `/atendimento/:id`
- [ ] Interface atual (AtendimentoPage) abre
- [ ] Formulário funciona normalmente

### 2.2 Modo: Página Nova (📄)
**Configurar:**
1. Ir em `/session-evolution-settings`
2. Selecionar "Página Nova Fullscreen"
3. Salvar

**Testar:**
- [ ] Ir em `/agenda`
- [ ] Clicar em agendamento
- [ ] Clicar "Iniciar Atendimento"
- [ ] Navega para `/session-evolution/:id`
- [ ] Página com 4 colunas aparece
- [ ] Botão "Voltar para Agenda" funciona
- [ ] Layout 4 colunas visível

### 2.3 Modo: Modal Fullscreen (🪟)
**Configurar:**
1. Ir em `/session-evolution-settings`
2. Selecionar "Modal Fullscreen"
3. Salvar

**Testar:**
- [ ] Ir em `/agenda`
- [ ] Clicar em agendamento
- [ ] Clicar "Iniciar Atendimento"
- [ ] Modal abre SOBRE a agenda
- [ ] Layout 4 colunas no modal
- [ ] Clicar X fecha o modal
- [ ] Tecla ESC fecha o modal
- [ ] Agenda permanece visível ao fundo

### 2.4 Modo: Expansão (➕)
**Configurar:**
1. Ir em `/session-evolution-settings`
2. Selecionar "Expansão Integrada"
3. Salvar

**Testar:**
- [ ] Ir em `/agenda`
- [ ] Clicar em agendamento
- [ ] Clicar "Iniciar Atendimento"
- [ ] Abre SessionFormPageExpanded
- [ ] 4 colunas aparecem
- [ ] Integração com sistema atual funciona

---

## 3. Teste de Dados Mock

### 3.1 Popular Dados Mock
- [ ] Ir em `/session-evolution-settings`
- [ ] Rolar até "Gerenciamento de Dados Mock"
- [ ] Digitar ID de paciente (ex: `patient_1`)
- [ ] Clicar "Popular Dados Mock"
- [ ] Toast de sucesso aparece
- [ ] Contadores atualizam (10 sessões + 2 templates)
- [ ] Metadata de "Última população" aparece

### 3.2 Verificar Dados Populados
- [ ] Ir em `/atendimento/:id` com patient_1
- [ ] Histórico mostra 10 sessões
- [ ] Gráficos aparecem com dados
- [ ] Templates de conduta disponíveis

### 3.3 Limpar Dados Mock
- [ ] Ir em `/session-evolution-settings`
- [ ] Clicar "Limpar Todos os Mocks"
- [ ] **CONFIRMAÇÃO:** Banner vermelho aparece
- [ ] Clicar "Cancelar" - nada acontece
- [ ] Clicar "Limpar Todos os Mocks" novamente
- [ ] Clicar "Sim, Limpar Tudo"
- [ ] Toast de sucesso
- [ ] Contadores voltam para 0

### 3.4 Export/Import Mock
- [ ] Popular dados mock
- [ ] Clicar "Exportar"
- [ ] Arquivo JSON baixado
- [ ] Abrir JSON - dados válidos
- [ ] Limpar mocks
- [ ] Clicar "Importar"
- [ ] Selecionar JSON exportado
- [ ] Dados restaurados

---

## 4. Teste de Fonte de Dados (Supabase vs Mock)

### 4.1 Indicador de Fonte
- [ ] Badge aparece no canto da tela
- [ ] Mostra 🟢 Supabase OU 🟡 Mock
- [ ] Clicar no badge expande detalhes
- [ ] Detalhes mostram configuração atual

### 4.2 Forçar Modo Mock
Editar `config/supabaseTablesConfig.ts`:
```typescript
export const FORCE_MOCK_MODE = true;
```

- [ ] Recarregar página
- [ ] Indicador mostra 🟡 Mock
- [ ] Dados mock são usados

### 4.3 Modo Supabase com Fallback
```typescript
export const USE_SUPABASE = true;
export const MOCK_FALLBACK = true;
export const FORCE_MOCK_MODE = false;
```

- [ ] Se Supabase conectado: 🟢 Supabase
- [ ] Se Supabase falhar: 🟡 Mock (fallback)
- [ ] Console mostra logs de fonte

---

## 5. Teste de CRUD Completo

### 5.1 CRUD de Cirurgias
**Criar:**
- [ ] Abrir evolução de sessão
- [ ] Coluna 2 → "Cirurgias" → "Adicionar"
- [ ] Preencher formulário
- [ ] Salvar
- [ ] Cirurgia aparece na timeline

**Editar:**
- [ ] Clicar ícone de editar
- [ ] Modificar dados
- [ ] Salvar
- [ ] Mudanças refletidas

**Deletar:**
- [ ] Clicar ícone de deletar
- [ ] Confirmar
- [ ] Cirurgia removida

**Visualização:**
- [ ] Badge com tempo decorrido aparece
- [ ] Cores corretas (vermelho < 30d, laranja < 90d, azul > 90d)

### 5.2 CRUD de Objetivos
**Criar:**
- [ ] Coluna 4 → "Objetivos" → "Adicionar"
- [ ] Preencher: título, data alvo, prioridade
- [ ] Salvar
- [ ] Card com countdown aparece

**Verificar Countdown:**
- [ ] Countdown mostra dias restantes
- [ ] Barra de progresso funciona
- [ ] Cores corretas:
  - Verde: concluído
  - Azul: normal
  - Laranja: urgente (< 7d)
  - Vermelho: atrasado

**Atualizar Progresso:**
- [ ] Editar objetivo
- [ ] Mudar progresso (slider)
- [ ] Salvar
- [ ] Barra atualiza

**Marcar Concluído:**
- [ ] Clicar ícone de check
- [ ] Objetivo marca como 100%
- [ ] Card fica verde

**Deletar:**
- [ ] Clicar ícone de deletar
- [ ] Confirmar
- [ ] Objetivo removido

### 5.3 CRUD de Patologias
**Criar:**
- [ ] Coluna 3 → "Patologias" → "Adicionar"
- [ ] Preencher nome, CID, data, severidade
- [ ] Salvar
- [ ] Aparece em "Em Tratamento"

**Marcar Resolvida:**
- [ ] Clicar ícone de check
- [ ] Patologia move para "Tratadas/Resolvidas"

**Reativar:**
- [ ] Em "Tratadas", clicar ícone de alerta
- [ ] Patologia volta para "Em Tratamento"

**Verificar Alertas Automáticos:**
- [ ] Criar patologia "Lesão de LCA"
- [ ] Alerta vermelho aparece
- [ ] Mensagem: "Amplitude do joelho OBRIGATÓRIA"

---

## 6. Teste de Gráficos e Tabelas

### 6.1 Gráficos de Evolução
**Pré-requisito:** Popular dados mock ou ter sessões registradas

- [ ] Coluna 3 → Selecionar métrica (ex: "Escala de dor EVA")
- [ ] Gráfico aparece com dados
- [ ] Alternar tipo de gráfico:
  - [ ] Linha
  - [ ] Barras
  - [ ] Área
- [ ] Tooltip aparece ao passar mouse
- [ ] Tooltip mostra: valor, variação, percentual

### 6.2 Tabela de Evolução
- [ ] Clicar botão "Tabela"
- [ ] Tabela aparece com dados
- [ ] Ordenar por coluna (clicar cabeçalho)
- [ ] Variações em verde (melhora) e vermelho (piora)
- [ ] Paginação funciona

### 6.3 Export CSV
- [ ] Clicar "Exportar CSV"
- [ ] Arquivo CSV baixado
- [ ] Abrir CSV - dados corretos
- [ ] Colunas: Sessão, Data, Valor, Variação, %, Observações

---

## 7. Teste de Alertas Obrigatórios

### 7.1 Criar Alerta Crítico
1. Criar patologia "Pós-operatório de LCA"
2. Abrir evolução de sessão
3. Banner vermelho aparece
4. Mensagem: "🚨 OBRIGATÓRIO: Medição de amplitude"

### 7.2 Tentar Salvar Sem Realizar Teste
- [ ] NÃO preencher teste obrigatório
- [ ] Tentar salvar sessão
- [ ] **BLOQUEIO:** Erro aparece
- [ ] Mensagem: "Testes obrigatórios não realizados"
- [ ] Sessão NÃO é salva

### 7.3 Salvar Após Realizar Teste
- [ ] Registrar teste obrigatório
- [ ] Tentar salvar
- [ ] ✅ Sessão salva com sucesso
- [ ] Alerta some ou fica verde

---

## 8. Teste de Replicação de Conduta

### 8.1 Replicar Anterior
- [ ] Ter pelo menos 1 sessão anterior
- [ ] Clicar "Replicar Anterior"
- [ ] Confirmação se campos preenchidos
- [ ] Campos SOAP são preenchidos
- [ ] Dados da sessão anterior aparecem

### 8.2 Replicar Específica
- [ ] Clicar "Replicar Conduta"
- [ ] Dialog abre com lista de sessões
- [ ] Selecionar sessão específica
- [ ] Preview aparece
- [ ] Selecionar campos para copiar
- [ ] Clicar "Aplicar Conduta"
- [ ] Campos escolhidos são preenchidos

---

## 9. Teste de Insights Médicos

### 9.1 Gerar Insights Automáticos
**Pré-requisito:** Ter evolução de dados (dados mock)

- [ ] Abrir qualquer sessão
- [ ] Ver seção de "Insights para Relatório"
- [ ] Insights aparecem automaticamente:
  - [ ] Redução de dor
  - [ ] Ganho de amplitude
  - [ ] Marcos importantes

### 9.2 Copiar Insights
- [ ] Clicar botão "Copiar" em insight
- [ ] Toast: "Texto copiado"
- [ ] Colar (Ctrl+V) - texto aparece
- [ ] Texto formatado para laudo médico

### 9.3 Exportar Relatório
- [ ] Clicar "Exportar Relatório"
- [ ] Arquivo .txt baixado
- [ ] Abrir arquivo - relatório completo
- [ ] Seções: Evolução Clínica, Marcos, Considerações

---

## 10. Teste de Navegação Dinâmica

### 10.1 Alternar Modo Durante Uso
1. **Estado inicial:** Modo "Existente"
2. [ ] Abrir agendamento → vai para `/atendimento`
3. [ ] Voltar
4. [ ] Mudar para modo "Página Nova"
5. [ ] Salvar
6. [ ] Abrir agendamento → vai para `/session-evolution`
7. [ ] ✅ Navegação muda dinamicamente

### 10.2 Botão "Testar Opção"
- [ ] Em configurações, clicar "Testar Esta Opção"
- [ ] Sistema abre preview do modo
- [ ] Pode voltar e escolher outro

---

## 11. Teste de Fallback Supabase → Mock

### 11.1 Simular Falha do Supabase
**No console do navegador (F12):**

```javascript
// Forçar mock
localStorage.setItem('force_mock_mode', 'true');
location.reload();
```

- [ ] Indicador muda para 🟡 Mock
- [ ] Dados mock são usados
- [ ] Sistema continua funcionando

### 11.2 Restaurar Supabase
```javascript
localStorage.removeItem('force_mock_mode');
location.reload();
```

- [ ] Indicador volta para 🟢 Supabase
- [ ] Dados reais são usados

---

## 12. Verificação Final

### 12.1 Linting
```bash
npm run lint
```
- [ ] 0 erros
- [ ] 0 warnings críticos

### 12.2 TypeScript
```bash
npx tsc --noEmit
```
- [ ] 0 erros de tipo
- [ ] Todos os imports resolvem

### 12.3 Build
```bash
npm run build
```
- [ ] Build completa sem erros
- [ ] Todos os chunks gerados
- [ ] Sem warnings críticos

### 12.4 Preview
```bash
npm run start
```
- [ ] Servidor inicia
- [ ] Sistema funciona em produção
- [ ] Todas as rotas acessíveis

---

## 13. Testes de Integração

### 13.1 Fluxo Completo - Caso de Uso Real

**Cenário:** Paciente pós-op LCA, 5ª sessão

1. **Configurar Modo**
   - [ ] Escolher modo preferido
   - [ ] Salvar

2. **Popular Dados (se necessário)**
   - [ ] Popular mocks para patient_1
   - [ ] Verificar dados criados

3. **Iniciar Atendimento**
   - [ ] Agenda → Agendamento → "Iniciar Atendimento"
   - [ ] Interface abre corretamente

4. **Ver Contexto do Paciente**
   - Coluna 2:
     - [ ] Ver histórico de 4 sessões anteriores
     - [ ] Ver cirurgia "Reconstrução LCA há 35 dias"
     - [ ] Ver tempo de tratamento
   
   - Coluna 3:
     - [ ] Alerta vermelho: "Amplitude obrigatória"
     - [ ] Patologia "LCA" listada em "Em Tratamento"
     - [ ] Gráfico de amplitude mostra evolução: 60° → 85°
   
   - Coluna 4:
     - [ ] Objetivo: "Retornar ao futebol em 60 dias"
     - [ ] Countdown mostrando dias restantes
     - [ ] Métricas: 4 sessões realizadas, 100% presença

5. **Preencher Evolução**
   - Coluna 1:
     - [ ] Preencher SOAP
     - [ ] Ajustar dor para 3/10
     - [ ] Registrar amplitude: 90°

6. **Tentar Salvar Sem Teste**
   - [ ] Clicar "Salvar"
   - [ ] BLOQUEIO: Erro aparece
   - [ ] Mensagem: "Amplitude obrigatória não realizada"

7. **Registrar Teste e Salvar**
   - [ ] Registrar amplitude do joelho: 90°
   - [ ] Alerta fica verde
   - [ ] Clicar "Salvar"
   - [ ] ✅ Sessão salva

8. **Verificar Insights Gerados**
   - [ ] Insight: "Ganho de 30° de amplitude (50% melhora)"
   - [ ] Insight: "Redução de dor de 7/10 para 3/10"
   - [ ] Copiar insight
   - [ ] Texto copiado corretamente

---

## 14. Testes de Edge Cases

### 14.1 Paciente Sem Dados
- [ ] Patient sem sessões anteriores
- [ ] Nenhum erro aparece
- [ ] Mensagens: "Nenhuma sessão anterior"
- [ ] Sistema funciona normalmente

### 14.2 Data Inválida
- [ ] Tentar criar cirurgia com data futura
- [ ] Erro de validação
- [ ] Mensagem: "Data não pode ser no futuro"

### 14.3 Objetivo Sem Data
- [ ] Criar objetivo sem data alvo
- [ ] Card simples sem countdown
- [ ] Apenas barra de progresso
- [ ] Funciona normalmente

### 14.4 Gráfico Sem Dados
- [ ] Selecionar métrica sem medições
- [ ] Mensagem: "Nenhum dado registrado"
- [ ] Sugestão de registrar medições

---

## 15. Performance e Responsividade

### 15.1 Performance
- [ ] Página carrega em < 2s
- [ ] Gráficos renderizam em < 1s
- [ ] Transições suaves
- [ ] Sem travamentos

### 15.2 Mobile
- [ ] Abrir em mobile (ou DevTools responsive)
- [ ] Layout adapta para mobile
- [ ] Todas as funcionalidades acessíveis
- [ ] Botões com tamanho adequado

---

## 16. Console e Logs

### 16.1 Verificar Logs
Abrir Console (F12) e verificar:

- [ ] Logs de fonte de dados aparecem:
  - `🟢 [SUPABASE] getSurgeries(patient_1)`
  - `🟡 [MOCK] getGoals(patient_1)`
- [ ] Nenhum erro vermelho crítico
- [ ] Warnings esperados (se houver)

---

## ✅ Resultado Esperado

### Todos os Testes Passando:
- ✅ 4 modos de interface funcionando
- ✅ Alternância entre modos sem bugs
- ✅ Persistência de configuração
- ✅ Dados mock popular/limpar
- ✅ Export/Import funcionando
- ✅ CRUD completo (cirurgias, objetivos, patologias)
- ✅ Gráficos interativos
- ✅ Tabelas com export CSV
- ✅ Alertas obrigatórios bloqueando
- ✅ Countdown de objetivos
- ✅ Insights automáticos
- ✅ Replicação de condutas
- ✅ Navegação dinâmica
- ✅ Fallback Supabase → Mock
- ✅ Indicador de fonte de dados
- ✅ 0 erros de linting
- ✅ 0 erros TypeScript
- ✅ Build funciona
- ✅ Performance adequada

---

## 🐛 Reportar Problemas

Se encontrar algum problema:

1. **Verificar:**
   - Modo selecionado em `/session-evolution-settings`
   - Indicador de fonte de dados (Mock vs Supabase)
   - Console do navegador (F12) para erros

2. **Testar:**
   - Popular dados mock
   - Alternar para modo "Sistema Existente"
   - Limpar cache do navegador (Ctrl+Shift+Delete)

3. **Logs Úteis:**
   - Console do navegador
   - Network tab (verificar requests)
   - localStorage (verificar preferências)

---

## 📊 Métricas de Sucesso

Após completar todos os testes, você deve ter:

- ✅ **32 arquivos** criados sem erros
- ✅ **4 modos** de interface funcionando
- ✅ **Sistema híbrido** Supabase + Mock operacional
- ✅ **CRUD completo** para 3 entidades
- ✅ **Gráficos e tabelas** renderizando
- ✅ **Alertas** bloqueando corretamente
- ✅ **Insights** sendo gerados
- ✅ **0 erros** de linting/TypeScript
- ✅ **100%** funcional

---

**Sistema pronto para produção!** 🚀

*Checklist criado em: 22/10/2025*

