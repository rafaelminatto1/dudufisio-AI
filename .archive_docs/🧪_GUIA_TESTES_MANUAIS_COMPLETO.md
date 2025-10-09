# 🧪 GUIA DE TESTES MANUAIS - FASE 1.1

**Data:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 📋 PRONTO PARA EXECUÇÃO

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Módulo 1: Risk Stratification](#módulo-1-risk-stratification)
3. [Módulo 2: Sports Rehabilitation](#módulo-2-sports-rehabilitation)
4. [Módulo 3: Population Health](#módulo-3-population-health)
5. [Módulo 4: Family Portal](#módulo-4-family-portal)
6. [Módulo 5: Predictive Analytics](#módulo-5-predictive-analytics)
7. [Módulo 6: Quality Assurance](#módulo-6-quality-assurance)
8. [Checklist Final](#checklist-final)

---

## PRÉ-REQUISITOS

### ✅ Antes de Começar

1. **Migrations aplicadas:**
   ```bash
   # Verificar no Supabase Dashboard > Database > Tables
   # Deve haver 47 novas tabelas
   ```

2. **Seed data executado:**
   ```bash
   npx ts-node scripts/seed-new-modules.ts
   ```

3. **Servidor rodando:**
   ```bash
   npm run dev
   # Deve estar em http://localhost:5173
   ```

4. **Usuário autenticado:**
   - Login feito no sistema
   - Perfil: Admin ou Fisioterapeuta

5. **IDs dos pacientes de teste:**
   ```sql
   SELECT id, name, cpf FROM patients 
   WHERE cpf IN (
     '123.456.789-00',
     '987.654.321-00',
     '456.789.123-00'
   );
   ```
   Anotar os UUIDs para uso nos testes.

---

## MÓDULO 1: RISK STRATIFICATION

### 🎯 Objetivo
Validar sistema de estratificação de risco de pacientes

### 📍 Rota
`/risk-stratification/:patientId`

### 🧪 CASOS DE TESTE

#### Teste 1.1: Carregar Página
**Passos:**
1. Acessar: `http://localhost:5173/risk-stratification/[UUID_PACIENTE]`
2. Aguardar carregamento

**Resultado Esperado:**
- [ ] ✅ Página carrega sem erros (< 3s)
- [ ] ✅ Nome do paciente aparece no topo
- [ ] ✅ Dashboard de risco é exibido
- [ ] ✅ Nenhum erro no console do navegador

**Critério de Falha:**
- ❌ Erro 404
- ❌ Tela branca
- ❌ Erro no console

---

#### Teste 1.2: Visualizar Avaliações Anteriores
**Passos:**
1. Na página, localizar seção "Avaliações Anteriores"
2. Verificar lista de avaliações

**Resultado Esperado:**
- [ ] ✅ Lista de avaliações aparece
- [ ] ✅ Cada avaliação mostra:
  - Data da avaliação
  - Tipo de risco
  - Nível de risco (low/moderate/high)
  - Score (0-100)
- [ ] ✅ Cards coloridos por nível de risco

**Critério de Falha:**
- ❌ Lista vazia quando deveria ter dados
- ❌ Dados incompletos

---

#### Teste 1.3: Criar Nova Avaliação
**Passos:**
1. Clicar em "Nova Avaliação"
2. Preencher formulário:
   - Tipo de risco: "Cardiovascular"
   - Fatores de risco (selecionar alguns)
   - Observações
3. Clicar em "Calcular e Salvar"

**Resultado Esperado:**
- [ ] ✅ Modal/Form abre corretamente
- [ ] ✅ Campos de input funcionam
- [ ] ✅ Score é calculado automaticamente
- [ ] ✅ Toast de sucesso aparece
- [ ] ✅ Nova avaliação aparece na lista
- [ ] ✅ Dados salvos no Supabase

**Verificar no Supabase:**
```sql
SELECT * FROM risk_assessments 
WHERE patient_id = '[UUID_PACIENTE]'
ORDER BY created_at DESC LIMIT 1;
```

**Critério de Falha:**
- ❌ Formulário não abre
- ❌ Erro ao salvar
- ❌ Dados não aparecem

---

#### Teste 1.4: Visualizar Gráficos de Tendência
**Passos:**
1. Scroll até seção de gráficos
2. Observar gráficos de tendência

**Resultado Esperado:**
- [ ] ✅ Gráficos renderizam corretamente
- [ ] ✅ Eixos com labels corretos
- [ ] ✅ Dados plotados fazem sentido
- [ ] ✅ Responsive (testar em mobile)

**Critério de Falha:**
- ❌ Gráficos não renderizam
- ❌ Dados incorretos

---

#### Teste 1.5: Alertas de Risco
**Passos:**
1. Criar avaliação com risco "High" ou "Critical"
2. Verificar se alerta é gerado

**Resultado Esperado:**
- [ ] ✅ Alerta aparece no dashboard
- [ ] ✅ Alerta tem cor de destaque
- [ ] ✅ Recomendações são exibidas
- [ ] ✅ Alerta salvo no Supabase

**Verificar no Supabase:**
```sql
SELECT * FROM risk_alerts 
WHERE patient_id = '[UUID_PACIENTE]'
AND resolved = false;
```

**Critério de Falha:**
- ❌ Alerta não criado
- ❌ Alerta não visível

---

#### Teste 1.6: Editar Avaliação
**Passos:**
1. Clicar em avaliação existente
2. Editar campos
3. Salvar

**Resultado Esperado:**
- [ ] ✅ Modal de edição abre
- [ ] ✅ Campos pré-preenchidos
- [ ] ✅ Edição salva com sucesso
- [ ] ✅ Dados atualizados na lista

**Critério de Falha:**
- ❌ Não abre modal
- ❌ Dados não atualizam

---

#### Teste 1.7: Deletar Avaliação
**Passos:**
1. Clicar em ícone de delete
2. Confirmar exclusão

**Resultado Esperado:**
- [ ] ✅ Confirmação pedida
- [ ] ✅ Avaliação removida da lista
- [ ] ✅ Deletada do Supabase

**Critério de Falha:**
- ❌ Não deleta
- ❌ Erro ao deletar

---

#### Teste 1.8: Exportar Relatório
**Passos:**
1. Clicar em "Exportar PDF"
2. Aguardar download

**Resultado Esperado:**
- [ ] ✅ PDF gerado
- [ ] ✅ Dados corretos no PDF
- [ ] ✅ Formatação adequada

**Critério de Falha:**
- ❌ Não gera PDF
- ❌ PDF vazio

---

#### Teste 1.9: Responsividade Mobile
**Passos:**
1. Redimensionar navegador para 375px largura
2. Navegar pela página

**Resultado Esperado:**
- [ ] ✅ Layout se adapta
- [ ] ✅ Todos os elementos visíveis
- [ ] ✅ Botões clicáveis
- [ ] ✅ Sem scroll horizontal

**Critério de Falha:**
- ❌ Layout quebrado
- ❌ Elementos cortados

---

#### Teste 1.10: Performance
**Passos:**
1. Abrir DevTools > Network
2. Recarregar página
3. Observar tempo de carregamento

**Resultado Esperado:**
- [ ] ✅ Carregamento < 2s
- [ ] ✅ Zero erros de rede
- [ ] ✅ Smooth scrolling
- [ ] ✅ Sem lag em interações

**Critério de Falha:**
- ❌ Carregamento > 5s
- ❌ Erros 500

---

### 📊 SCORE DO MÓDULO 1

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## MÓDULO 2: SPORTS REHABILITATION

### 🎯 Objetivo
Validar módulo de reabilitação esportiva

### 📍 Rota
`/sports-rehab/:patientId`

### 🧪 CASOS DE TESTE

#### Teste 2.1: Criar Perfil de Atleta
**Passos:**
1. Acessar página com paciente sem perfil de atleta
2. Clicar em "Criar Perfil de Atleta"
3. Preencher:
   - Esporte: Futebol
   - Posição: Atacante
   - Nível: Semi-profissional
   - Frequência de treino: 5x/semana
4. Salvar

**Resultado Esperado:**
- [ ] ✅ Formulário abre
- [ ] ✅ Todos os campos funcionam
- [ ] ✅ Perfil criado com sucesso
- [ ] ✅ Dashboard do atleta aparece

**Verificar no Supabase:**
```sql
SELECT * FROM athlete_profiles 
WHERE patient_id = '[UUID_PACIENTE]';
```

**Critério de Falha:**
- ❌ Não cria perfil
- ❌ Erro ao salvar

---

#### Teste 2.2: Registrar Lesão
**Passos:**
1. Na página do atleta, clicar em "Registrar Lesão"
2. Preencher:
   - Tipo: Muscular
   - Parte do corpo: Coxa
   - Data: Hoje
   - Severidade: Moderada
   - Mecanismo: Sobrecarga
3. Salvar

**Resultado Esperado:**
- [ ] ✅ Lesão registrada
- [ ] ✅ Aparece no histórico
- [ ] ✅ Card de lesão ativa exibido

**Verificar no Supabase:**
```sql
SELECT * FROM athlete_injuries 
WHERE athlete_profile_id = '[UUID_PERFIL_ATLETA]';
```

**Critério de Falha:**
- ❌ Não registra
- ❌ Dados incorretos

---

#### Teste 2.3: Adicionar Teste Funcional
**Passos:**
1. Clicar em "Novo Teste Funcional"
2. Selecionar teste: "Single Leg Hop"
3. Inserir resultados:
   - Lado afetado: 85%
   - Lado não afetado: 100%
4. Salvar

**Resultado Esperado:**
- [ ] ✅ Teste registrado
- [ ] ✅ Simetria calculada automaticamente
- [ ] ✅ Status (passou/não passou) exibido
- [ ] ✅ Gráfico de progresso atualizado

**Verificar no Supabase:**
```sql
SELECT * FROM functional_tests 
WHERE athlete_profile_id = '[UUID_PERFIL]';
```

**Critério de Falha:**
- ❌ Não salva
- ❌ Cálculo errado

---

#### Teste 2.4: Visualizar Progressão por Fases
**Passos:**
1. Localizar seção "Progressão de Reabilitação"
2. Verificar fases e progresso

**Resultado Esperado:**
- [ ] ✅ Fases exibidas (1-5)
- [ ] ✅ Fase atual destacada
- [ ] ✅ Porcentagem de progresso mostrada
- [ ] ✅ Critérios de progressão listados

**Critério de Falha:**
- ❌ Não exibe fases
- ❌ Dados incorretos

---

#### Teste 2.5: Dashboard de Métricas
**Passos:**
1. Scroll até seção de métricas
2. Observar cards de métricas

**Resultado Esperado:**
- [ ] ✅ Métricas de força exibidas
- [ ] ✅ Métricas de agilidade exibidas
- [ ] ✅ Comparação com normas
- [ ] ✅ Gráficos de tendência

**Critério de Falha:**
- ❌ Métricas não aparecem
- ❌ Gráficos quebrados

---

#### Teste 2.6: Calcular ACWR
**Passos:**
1. Adicionar sessões de treino (últimas 4 semanas)
2. Verificar cálculo de ACWR

**Resultado Esperado:**
- [ ] ✅ ACWR calculado corretamente
- [ ] ✅ Nível de risco indicado (low/moderate/high)
- [ ] ✅ Recomendações baseadas no ACWR

**Fórmula:**
```
ACWR = Carga Aguda (7 dias) / Carga Crônica (28 dias)
```

**Critério de Falha:**
- ❌ Cálculo incorreto
- ❌ Não exibe ACWR

---

#### Teste 2.7: Critérios de Retorno ao Esporte
**Passos:**
1. Clicar em "Avaliar RTS (Return to Sport)"
2. Preencher critérios
3. Salvar avaliação

**Resultado Esperado:**
- [ ] ✅ Formulário de RTS abre
- [ ] ✅ Todos os critérios listados
- [ ] ✅ Score geral calculado
- [ ] ✅ Status de clearance atualizado

**Verificar no Supabase:**
```sql
SELECT * FROM return_to_sport_criteria 
WHERE athlete_profile_id = '[UUID_PERFIL]';
```

**Critério de Falha:**
- ❌ Não salva avaliação
- ❌ Score errado

---

#### Teste 2.8: Histórico de Lesões
**Passos:**
1. Clicar em "Histórico de Lesões"
2. Verificar lista

**Resultado Esperado:**
- [ ] ✅ Todas as lesões listadas
- [ ] ✅ Ordenadas por data (mais recente primeiro)
- [ ] ✅ Detalhes de cada lesão visíveis
- [ ] ✅ Status de recuperação indicado

**Critério de Falha:**
- ❌ Lista vazia
- ❌ Dados incompletos

---

#### Teste 2.9: Gráficos de Desempenho
**Passos:**
1. Localizar seção de gráficos
2. Verificar gráficos de performance

**Resultado Esperado:**
- [ ] ✅ Gráfico de força ao longo do tempo
- [ ] ✅ Gráfico de ROM (amplitude de movimento)
- [ ] ✅ Gráfico de carga de treino
- [ ] ✅ Todos renderizando corretamente

**Critério de Falha:**
- ❌ Gráficos não renderizam
- ❌ Dados incorretos

---

#### Teste 2.10: Export de Relatórios
**Passos:**
1. Clicar em "Exportar Relatório de Reabilitação"
2. Verificar PDF gerado

**Resultado Esperado:**
- [ ] ✅ PDF completo gerado
- [ ] ✅ Inclui todas as seções:
  - Perfil do atleta
  - Lesões
  - Testes funcionais
  - Progressão
  - Critérios RTS
- [ ] ✅ Formatação profissional

**Critério de Falha:**
- ❌ Não gera PDF
- ❌ Seções faltando

---

### 📊 SCORE DO MÓDULO 2

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## MÓDULO 3: POPULATION HEALTH

### 🎯 Objetivo
Validar dashboard de saúde populacional

### 📍 Rota
`/population-health`

### 🧪 CASOS DE TESTE

#### Teste 3.1: Carregar Dashboard
**Passos:**
1. Acessar: `http://localhost:5173/population-health`
2. Aguardar carregamento

**Resultado Esperado:**
- [ ] ✅ Dashboard carrega sem erros
- [ ] ✅ KPIs principais exibidos no topo
- [ ] ✅ Gráficos principais visíveis
- [ ] ✅ Performance adequada

**Critério de Falha:**
- ❌ Tela branca
- ❌ Erro ao carregar

---

#### Teste 3.2: Dados Agregados
**Passos:**
1. Verificar cards de métricas no topo
2. Comparar com dados do Supabase

**Resultado Esperado:**
- [ ] ✅ Total de pacientes correto
- [ ] ✅ Idade média correta
- [ ] ✅ Taxa de completamento correta
- [ ] ✅ Distribuição por gênero correta

**Verificar no Supabase:**
```sql
SELECT 
  COUNT(*) as total_patients,
  AVG(EXTRACT(YEAR FROM AGE(birth_date))) as avg_age
FROM patients 
WHERE is_active = true;
```

**Critério de Falha:**
- ❌ Números incorretos
- ❌ Dados não batem

---

#### Teste 3.3: Filtros por Período
**Passos:**
1. Selecionar filtro: "Últimos 30 dias"
2. Observar mudança nos dados
3. Testar outros períodos

**Resultado Esperado:**
- [ ] ✅ Filtros funcionam
- [ ] ✅ Dados atualizam dinamicamente
- [ ] ✅ Gráficos se ajustam
- [ ] ✅ Sem erros

**Critério de Falha:**
- ❌ Filtro não funciona
- ❌ Dados não mudam

---

#### Teste 3.4: Gráficos Demográficos
**Passos:**
1. Localizar seção de gráficos demográficos
2. Verificar gráficos de:
   - Distribuição por idade
   - Distribuição por gênero
   - Distribuição geográfica

**Resultado Esperado:**
- [ ] ✅ Todos os gráficos renderizam
- [ ] ✅ Dados corretos
- [ ] ✅ Legends visíveis
- [ ] ✅ Tooltips funcionam

**Critério de Falha:**
- ❌ Gráficos não renderizam
- ❌ Dados incorretos

---

#### Teste 3.5: Análise de Tendências
**Passos:**
1. Scroll até seção "Tendências"
2. Verificar gráfico de linha temporal

**Resultado Esperado:**
- [ ] ✅ Gráfico de linha exibido
- [ ] ✅ Múltiplas séries de dados
- [ ] ✅ Tendências claramente visíveis
- [ ] ✅ Pode selecionar métricas diferentes

**Critério de Falha:**
- ❌ Gráfico não renderiza
- ❌ Tendências incorretas

---

#### Teste 3.6: Insights da IA
**Passos:**
1. Localizar seção "Insights da IA"
2. Verificar insights gerados

**Resultado Esperado:**
- [ ] ✅ Insights aparecem
- [ ] ✅ Textos em português
- [ ] ✅ Recomendações acionáveis
- [ ] ✅ Nível de confiança indicado

**Critério de Falha:**
- ❌ Sem insights
- ❌ Textos genéricos

---

#### Teste 3.7: Export para PDF/Excel
**Passos:**
1. Clicar em "Exportar Relatório"
2. Selecionar formato (PDF ou Excel)
3. Verificar arquivo gerado

**Resultado Esperado:**
- [ ] ✅ Arquivo gerado
- [ ] ✅ Dados completos
- [ ] ✅ Formatação adequada
- [ ] ✅ Gráficos incluídos (PDF)

**Critério de Falha:**
- ❌ Não gera arquivo
- ❌ Arquivo corrompido

---

#### Teste 3.8: Performance com 1000+ Registros
**Passos:**
1. Verificar performance com dataset completo
2. Observar tempo de carregamento

**Resultado Esperado:**
- [ ] ✅ Carregamento < 5s
- [ ] ✅ Scroll suave
- [ ] ✅ Gráficos responsivos
- [ ] ✅ Sem travamentos

**Critério de Falha:**
- ❌ Carregamento > 10s
- ❌ Lag severo

---

#### Teste 3.9: Refresh Automático
**Passos:**
1. Deixar dashboard aberto
2. Aguardar 5 minutos
3. Verificar se dados atualizam

**Resultado Esperado:**
- [ ] ✅ Dados atualizam automaticamente
- [ ] ✅ Indicador de "última atualização"
- [ ] ✅ Pode forçar refresh manual

**Critério de Falha:**
- ❌ Não atualiza
- ❌ Erro ao atualizar

---

#### Teste 3.10: Drill-down em Gráficos
**Passos:**
1. Clicar em barra/segmento de gráfico
2. Verificar detalhes

**Resultado Esperado:**
- [ ] ✅ Modal/Panel com detalhes abre
- [ ] ✅ Dados detalhados corretos
- [ ] ✅ Pode voltar ao dashboard

**Critério de Falha:**
- ❌ Click não funciona
- ❌ Detalhes incorretos

---

### 📊 SCORE DO MÓDULO 3

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## MÓDULO 4: FAMILY PORTAL

### 🎯 Objetivo
Validar portal da família

### 📍 Rota
`/family-portal/:patientId`

### 🧪 CASOS DE TESTE

#### Teste 4.1: Adicionar Membro da Família
**Passos:**
1. Acessar: `http://localhost:5173/family-portal/[UUID_PACIENTE]`
2. Clicar em "Adicionar Membro"
3. Preencher:
   - Nome: Maria Silva
   - Email: maria@example.com
   - Relacionamento: Cônjuge
   - Telefone: (11) 98765-4321
4. Marcar permissões desejadas
5. Salvar

**Resultado Esperado:**
- [ ] ✅ Formulário abre
- [ ] ✅ Todos os campos funcionam
- [ ] ✅ Membro adicionado
- [ ] ✅ Aparece na lista

**Verificar no Supabase:**
```sql
SELECT * FROM family_members 
WHERE patient_id = '[UUID_PACIENTE]';
```

**Critério de Falha:**
- ❌ Não adiciona
- ❌ Erro ao salvar

---

#### Teste 4.2: Configurar Permissões
**Passos:**
1. Clicar em membro da família
2. Editar permissões
3. Salvar

**Resultado Esperado:**
- [ ] ✅ Modal de permissões abre
- [ ] ✅ Checkboxes funcionam
- [ ] ✅ Permissões salvas
- [ ] ✅ Atualiza no banco

**Tipos de permissões:**
- View Progress
- View Reports
- View Schedule
- Send Messages
- Schedule Appointments

**Critério de Falha:**
- ❌ Não salva permissões
- ❌ Permissões não funcionam

---

#### Teste 4.3: Visualizar Relatórios (Read-only)
**Passos:**
1. Login como membro da família
2. Acessar relatórios
3. Tentar editar

**Resultado Esperado:**
- [ ] ✅ Relatórios visíveis
- [ ] ✅ Modo read-only
- [ ] ✅ Não pode editar
- [ ] ✅ Pode baixar PDF

**Critério de Falha:**
- ❌ Pode editar (deveria ser read-only)
- ❌ Não vê relatórios

---

#### Teste 4.4: Enviar Mensagem para Terapeuta
**Passos:**
1. Como membro da família, clicar em "Mensagens"
2. Clicar em "Nova Mensagem"
3. Escrever mensagem
4. Enviar

**Resultado Esperado:**
- [ ] ✅ Mensagem enviada
- [ ] ✅ Aparece na lista de mensagens
- [ ] ✅ Terapeuta recebe notificação
- [ ] ✅ Salva no Supabase

**Verificar no Supabase:**
```sql
SELECT * FROM family_messages 
WHERE patient_id = '[UUID_PACIENTE]'
ORDER BY created_at DESC LIMIT 1;
```

**Critério de Falha:**
- ❌ Não envia
- ❌ Terapeuta não recebe

---

#### Teste 4.5: Histórico de Acesso (LGPD)
**Passos:**
1. Realizar várias ações como membro da família
2. Admin/Terapeuta verifica logs

**Resultado Esperado:**
- [ ] ✅ Todos os acessos logados
- [ ] ✅ Timestamp correto
- [ ] ✅ Tipo de ação registrado
- [ ] ✅ IP address capturado

**Verificar no Supabase:**
```sql
SELECT * FROM family_access_logs 
WHERE family_member_id = '[UUID_MEMBRO]'
ORDER BY accessed_at DESC;
```

**Critério de Falha:**
- ❌ Logs não criados
- ❌ Informações faltando

---

#### Teste 4.6: Revogar Acesso
**Passos:**
1. Admin/Terapeuta acessa lista de membros
2. Clica em "Revogar Acesso"
3. Confirma

**Resultado Esperado:**
- [ ] ✅ Confirmação pedida
- [ ] ✅ Acesso revogado
- [ ] ✅ Membro não consegue mais logar
- [ ] ✅ Status atualizado no banco

**Critério de Falha:**
- ❌ Ainda consegue acessar
- ❌ Erro ao revogar

---

#### Teste 4.7: Consentimento do Paciente
**Passos:**
1. Verificar fluxo de consentimento
2. Paciente deve aprovar acesso

**Resultado Esperado:**
- [ ] ✅ Paciente recebe notificação
- [ ] ✅ Pode aprovar ou negar
- [ ] ✅ Consentimento registrado
- [ ] ✅ Comply com LGPD

**Verificar no Supabase:**
```sql
SELECT consent_given, consent_date 
FROM family_members 
WHERE id = '[UUID_MEMBRO]';
```

**Critério de Falha:**
- ❌ Sem fluxo de consentimento
- ❌ Não registra consentimento

---

#### Teste 4.8: Notificações para Família
**Passos:**
1. Criar evento que gera notificação
2. Verificar se membro recebe

**Eventos que geram notificações:**
- Nova consulta agendada
- Cancelamento de consulta
- Nova evolução adicionada
- Meta alcançada

**Resultado Esperado:**
- [ ] ✅ Notificação criada
- [ ] ✅ Aparece no portal
- [ ] ✅ Email enviado (se habilitado)
- [ ] ✅ Marca como lida funciona

**Critério de Falha:**
- ❌ Não recebe notificações
- ❌ Erro ao enviar

---

#### Teste 4.9: Multi-idioma (PT/EN/ES)
**Passos:**
1. Trocar idioma no portal
2. Verificar tradução

**Resultado Esperado:**
- [ ] ✅ Selector de idioma funciona
- [ ] ✅ Textos traduzidos
- [ ] ✅ Formatação de data/hora ajustada
- [ ] ✅ Preferência salva

**Critério de Falha:**
- ❌ Selector não funciona
- ❌ Textos não traduzidos

---

#### Teste 4.10: Acessibilidade (WCAG)
**Passos:**
1. Testar navegação por teclado (Tab)
2. Testar com leitor de tela
3. Verificar contraste de cores

**Resultado Esperado:**
- [ ] ✅ Totalmente navegável por teclado
- [ ] ✅ ARIA labels corretos
- [ ] ✅ Contraste WCAG AA
- [ ] ✅ Focus indicators visíveis

**Ferramentas:**
- Lighthouse Accessibility Score
- WAVE Browser Extension

**Critério de Falha:**
- ❌ Score < 90
- ❌ Não navegável por teclado

---

### 📊 SCORE DO MÓDULO 4

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## MÓDULO 5: PREDICTIVE ANALYTICS

### 🎯 Objetivo
Validar análise preditiva com IA

### 📍 Rota
`/predictive-analytics/:patientId`

### 🧪 CASOS DE TESTE

#### Teste 5.1: Gerar Predição de Outcome
**Passos:**
1. Acessar: `http://localhost:5173/predictive-analytics/[UUID_PACIENTE]`
2. Clicar em "Gerar Nova Predição"
3. Selecionar tipo: "Treatment Outcome"
4. Aguardar processamento

**Resultado Esperado:**
- [ ] ✅ Predição gerada (< 10s)
- [ ] ✅ Confidence score exibido
- [ ] ✅ Resultado da predição claro
- [ ] ✅ Sem erros

**Verificar no Supabase:**
```sql
SELECT * FROM ai_predictions 
WHERE patient_id = '[UUID_PACIENTE]'
ORDER BY created_at DESC LIMIT 1;
```

**Critério de Falha:**
- ❌ Não gera predição
- ❌ Erro de API

---

#### Teste 5.2: Análise de Fatores de Risco
**Passos:**
1. Na predição gerada, scroll até "Fatores Analisados"
2. Verificar lista de fatores

**Resultado Esperado:**
- [ ] ✅ Fatores de risco listados
- [ ] ✅ Fatores protetores listados
- [ ] ✅ Importância de cada fator indicada
- [ ] ✅ Gráfico de importância exibido

**Critério de Falha:**
- ❌ Lista vazia
- ❌ Dados genéricos

---

#### Teste 5.3: Cenários Alternativos
**Passos:**
1. Localizar seção "Cenários"
2. Verificar 3 cenários:
   - Best case
   - Most likely
   - Worst case

**Resultado Esperado:**
- [ ] ✅ 3 cenários exibidos
- [ ] ✅ Descrição de cada cenário
- [ ] ✅ Probabilidades indicadas
- [ ] ✅ Timelines estimados

**Critério de Falha:**
- ❌ Cenários não aparecem
- ❌ Dados ilógicos

---

#### Teste 5.4: Nível de Confiança
**Passos:**
1. Verificar indicador de confiança
2. Comparar com dados do banco

**Resultado Esperado:**
- [ ] ✅ Confidence score exibido (0-100%)
- [ ] ✅ Nível visual (Low/Medium/High)
- [ ] ✅ Explicação do nível
- [ ] ✅ Consistente com dados

**Critério de Falha:**
- ❌ Sem indicador
- ❌ Valor incorreto

---

#### Teste 5.5: Recomendações da IA
**Passos:**
1. Scroll até seção "Recomendações"
2. Verificar lista de ações sugeridas

**Resultado Esperado:**
- [ ] ✅ 3-5 recomendações listadas
- [ ] ✅ Recomendações específicas e acionáveis
- [ ] ✅ Prioridade indicada
- [ ] ✅ Racional explicado

**Critério de Falha:**
- ❌ Recomendações genéricas
- ❌ Sem racional

---

#### Teste 5.6: Validação com Dados Reais
**Passos:**
1. Após tratamento concluído, voltar à predição
2. Marcar outcome real
3. Verificar acurácia

**Resultado Esperado:**
- [ ] ✅ Pode marcar outcome real
- [ ] ✅ Sistema calcula acurácia
- [ ] ✅ Feedback salvo
- [ ] ✅ Usado para retreinar modelo

**Verificar no Supabase:**
```sql
UPDATE ai_predictions 
SET validated = true,
    actual_outcome = 'positive',
    was_accurate = true
WHERE id = '[UUID_PREDICAO]';
```

**Critério de Falha:**
- ❌ Não pode validar
- ❌ Feedback não salva

---

#### Teste 5.7: Histórico de Predições
**Passos:**
1. Verificar lista de predições anteriores
2. Comparar predições vs outcomes reais

**Resultado Esperado:**
- [ ] ✅ Todas as predições listadas
- [ ] ✅ Status de validação indicado
- [ ] ✅ Taxa de acerto geral calculada
- [ ] ✅ Pode filtrar por tipo

**Critério de Falha:**
- ❌ Lista incompleta
- ❌ Sem taxa de acerto

---

#### Teste 5.8: Acurácia das Predições
**Passos:**
1. Verificar dashboard de acurácia
2. Ver métricas por tipo de predição

**Resultado Esperado:**
- [ ] ✅ Métricas de acurácia exibidas
- [ ] ✅ Precisão, Recall, F1-Score
- [ ] ✅ Gráfico de evolução
- [ ] ✅ Comparação com baseline

**Critério de Falha:**
- ❌ Métricas incorretas
- ❌ Sem dados históricos

---

#### Teste 5.9: Explicabilidade da IA
**Passos:**
1. Clicar em "Como foi calculado?"
2. Verificar explicação detalhada

**Resultado Esperado:**
- [ ] ✅ Explicação clara e compreensível
- [ ] ✅ Features mais importantes destacadas
- [ ] ✅ Lógica do modelo explicada
- [ ] ✅ Não usa jargão técnico excessivo

**Critério de Falha:**
- ❌ Sem explicação
- ❌ Muito técnico

---

#### Teste 5.10: Integração com Gemini API
**Passos:**
1. Verificar se API key está configurada
2. Testar geração de insights

**Resultado Esperado:**
- [ ] ✅ API key configurada corretamente
- [ ] ✅ Chamadas à API funcionam
- [ ] ✅ Respostas processadas corretamente
- [ ] ✅ Tratamento de erros adequado

**Verificar .env.local:**
```env
GEMINI_API_KEY=sua_chave_aqui
```

**Critério de Falha:**
- ❌ API key inválida
- ❌ Erro 401/403

---

### 📊 SCORE DO MÓDULO 5

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## MÓDULO 6: QUALITY ASSURANCE

### 🎯 Objetivo
Validar sistema de garantia de qualidade e compliance

### 📍 Rota
`/quality-assurance`

### 🧪 CASOS DE TESTE

#### Teste 6.1: Dashboard de Compliance
**Passos:**
1. Acessar: `http://localhost:5173/quality-assurance`
2. Verificar dashboard principal

**Resultado Esperado:**
- [ ] ✅ Dashboard carrega sem erros
- [ ] ✅ Score de compliance exibido (0-100)
- [ ] ✅ Status geral indicado
- [ ] ✅ Cards de métricas principais

**Critério de Falha:**
- ❌ Não carrega
- ❌ Dados faltando

---

#### Teste 6.2: Métricas de Qualidade
**Passos:**
1. Scroll até seção "Métricas de Qualidade"
2. Verificar KPIs

**KPIs a verificar:**
- Taxa de documentação
- Satisfação do paciente
- Taxa de aderência
- Taxa de alcance de metas
- Taxa de readmissão

**Resultado Esperado:**
- [ ] ✅ Todas as métricas exibidas
- [ ] ✅ Valores numéricos corretos
- [ ] ✅ Trends indicados (↑↓→)
- [ ] ✅ Comparação com metas

**Critério de Falha:**
- ❌ Métricas faltando
- ❌ Valores incorretos

---

#### Teste 6.3: Audit Trail Completo
**Passos:**
1. Clicar em "Audit Trail"
2. Verificar logs de auditoria

**Resultado Esperado:**
- [ ] ✅ Lista de auditorias
- [ ] ✅ Filtros funcionam
- [ ] ✅ Pode buscar por data
- [ ] ✅ Detalhes de cada auditoria

**Verificar no Supabase:**
```sql
SELECT * FROM compliance_audits 
ORDER BY audit_date DESC 
LIMIT 10;
```

**Critério de Falha:**
- ❌ Lista vazia
- ❌ Filtros não funcionam

---

#### Teste 6.4: Relatórios Executivos
**Passos:**
1. Clicar em "Gerar Relatório Executivo"
2. Selecionar período
3. Gerar relatório

**Resultado Esperado:**
- [ ] ✅ Relatório gerado
- [ ] ✅ Formato profissional
- [ ] ✅ Gráficos incluídos
- [ ] ✅ Sumário executivo presente
- [ ] ✅ Recomendações incluídas

**Critério de Falha:**
- ❌ Não gera
- ❌ Relatório incompleto

---

#### Teste 6.5: Alertas de Não Conformidade
**Passos:**
1. Verificar seção de alertas
2. Clicar em alerta crítico

**Resultado Esperado:**
- [ ] ✅ Alertas exibidos por severidade
- [ ] ✅ Detalhes do alerta disponíveis
- [ ] ✅ Ação recomendada clara
- [ ] ✅ Pode marcar como resolvido

**Verificar no Supabase:**
```sql
SELECT * FROM compliance_issues 
WHERE status = 'open' 
AND severity IN ('high', 'critical');
```

**Critério de Falha:**
- ❌ Alertas não aparecem
- ❌ Não pode resolver

---

#### Teste 6.6: Verificação COFFITO
**Passos:**
1. Verificar seção "Compliance COFFITO"
2. Ver checklist de requisitos

**Requisitos COFFITO:**
- Documentação adequada
- Assinatura digital
- Tempo de atendimento
- Protocolos seguidos
- Etc.

**Resultado Esperado:**
- [ ] ✅ Checklist completo
- [ ] ✅ Status de cada item
- [ ] ✅ % de conformidade
- [ ] ✅ Itens não conformes destacados

**Critério de Falha:**
- ❌ Checklist incompleto
- ❌ Status incorreto

---

#### Teste 6.7: Verificação LGPD
**Passos:**
1. Verificar seção "Compliance LGPD"
2. Ver status de conformidade

**Requisitos LGPD:**
- Consentimento registrado
- Dados minimizados
- Logs de acesso
- Direito ao esquecimento
- DPO designado

**Resultado Esperado:**
- [ ] ✅ Todos os requisitos listados
- [ ] ✅ Status de conformidade
- [ ] ✅ Evidências documentadas
- [ ] ✅ Gaps identificados

**Critério de Falha:**
- ❌ Requisitos faltando
- ❌ Sem evidências

---

#### Teste 6.8: Export de Relatórios
**Passos:**
1. Clicar em "Exportar Relatório de Compliance"
2. Selecionar formato (PDF/Excel)
3. Baixar

**Resultado Esperado:**
- [ ] ✅ Arquivo gerado
- [ ] ✅ Contém todas as seções
- [ ] ✅ Formatação profissional
- [ ] ✅ Assinatura digital (PDF)

**Critério de Falha:**
- ❌ Não gera
- ❌ Arquivo corrompido

---

#### Teste 6.9: Drill-down em Métricas
**Passos:**
1. Clicar em métrica específica
2. Ver detalhes e breakdown

**Resultado Esperado:**
- [ ] ✅ Modal/Page de detalhes abre
- [ ] ✅ Breakdown por categoria
- [ ] ✅ Tendência ao longo do tempo
- [ ] ✅ Pode exportar dados

**Critério de Falha:**
- ❌ Não abre detalhes
- ❌ Dados genéricos

---

#### Teste 6.10: Filtros Avançados
**Passos:**
1. Usar filtros no topo do dashboard
2. Filtrar por:
   - Período
   - Tipo de auditoria
   - Status
   - Severidade

**Resultado Esperado:**
- [ ] ✅ Todos os filtros funcionam
- [ ] ✅ Resultados atualizam dinamicamente
- [ ] ✅ Pode combinar múltiplos filtros
- [ ] ✅ Pode limpar filtros

**Critério de Falha:**
- ❌ Filtros não funcionam
- ❌ Resultados incorretos

---

### 📊 SCORE DO MÓDULO 6

**Total de testes:** 10  
**Testes passados:** ___  
**Taxa de sucesso:** ___% 

**Meta:** ≥ 90% (9/10 testes)

---

## 📊 CHECKLIST FINAL

### Resumo Geral

| Módulo | Total Testes | Passaram | Taxa | Status |
|--------|--------------|----------|------|--------|
| 1. Risk Stratification | 10 | ___ | ___% | ⬜ |
| 2. Sports Rehabilitation | 10 | ___ | ___% | ⬜ |
| 3. Population Health | 10 | ___ | ___% | ⬜ |
| 4. Family Portal | 10 | ___ | ___% | ⬜ |
| 5. Predictive Analytics | 10 | ___ | ___% | ⬜ |
| 6. Quality Assurance | 10 | ___ | ___% | ⬜ |
| **TOTAL** | **60** | **___** | **___%** | **⬜** |

### Critérios de Aprovação

- ✅ **APROVADO:** Taxa geral ≥ 90% (54/60 testes)
- ⚠️ **APROVADO COM RESSALVAS:** Taxa geral 80-89% (48-53 testes)
- ❌ **REPROVADO:** Taxa geral < 80% (< 48 testes)

### Próximos Passos

**Se APROVADO (≥90%):**
- [x] Marcar TODO 1.1 como completo
- [ ] Iniciar TODO 1.3 (Validar fluxos completos)
- [ ] Documentar issues menores encontrados

**Se APROVADO COM RESSALVAS (80-89%):**
- [ ] Documentar todos os testes que falharam
- [ ] Criar tickets para correção
- [ ] Refazer testes após correções
- [ ] Depois iniciar TODO 1.3

**Se REPROVADO (<80%):**
- [ ] Documentar todos os problemas
- [ ] Priorizar correções críticas
- [ ] Iniciar TODO 1.4 (Ajustes)
- [ ] Refazer todos os testes
- [ ] Não avançar para TODO 1.3

---

## 📝 REPORT DE BUGS

### Template de Bug Report

Para cada teste que falhar, preencher:

```markdown
### BUG-001: [Título descritivo]

**Módulo:** [Nome do módulo]
**Teste:** [Número e nome do teste]
**Severidade:** Critical / High / Medium / Low

**Descrição:**
[Descrever o problema encontrado]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:**
[O que deveria acontecer]

**Resultado Atual:**
[O que está acontecendo]

**Screenshots/Logs:**
[Anexar se possível]

**Ambiente:**
- Browser: [Chrome/Firefox/Safari]
- Versão: [xx.x]
- OS: [Windows/Mac/Linux]
- Data: [dd/mm/yyyy]

**Status:** Open / In Progress / Fixed / Closed
```

---

## 🎯 CONCLUSÃO

Este guia fornece um framework completo para testar todos os 6 módulos implementados. Cada módulo tem 10 testes específicos, totalizando 60 casos de teste.

**Tempo estimado:** 8-12 horas para execução completa

**Recomendações:**
1. Executar testes em ordem (Módulo 1 → 6)
2. Documentar todos os problemas imediatamente
3. Tirar screenshots de bugs
4. Testar em múltiplos browsers
5. Testar em diferentes resoluções

---

**Criado em:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ PRONTO PARA USO

**Boa sorte nos testes! 🚀**



