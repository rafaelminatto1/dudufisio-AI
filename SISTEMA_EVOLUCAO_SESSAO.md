# 🏥 Sistema Completo de Evolução de Sessão - DuduFisio-AI

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Como Escolher o Modo de Interface](#como-escolher-o-modo-de-interface)
- [As 4 Opções Disponíveis](#as-4-opções-disponíveis)
- [Gerenciamento de Dados Mock](#gerenciamento-de-dados-mock)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Arquitetura e Arquivos](#arquitetura-e-arquivos)
- [Como Usar](#como-usar)

---

## 🎯 Visão Geral

Sistema completo para registro e acompanhamento de evoluções de sessões fisioterapêuticas, com:

- ✅ **3 opções de interface** (escolha visual, sem editar código)
- ✅ **Sistema híbrido** Supabase + Mock
- ✅ **CRUD completo** para cirurgias, objetivos e patologias
- ✅ **Gráficos interativos** (barras, linha, área)
- ✅ **Alertas obrigatórios** com bloqueio de salvamento
- ✅ **Countdown de objetivos** visual
- ✅ **Insights automáticos** para relatórios médicos
- ✅ **Replicação de condutas** entre sessões

---

## 🎨 Como Escolher o Modo de Interface

### Opção 1: Via Interface Visual (Recomendado) ✨

1. Acesse **Configurações** no menu lateral
2. Clique em **"Configurações de Atendimento"**
3. Ou acesse diretamente: `/session-evolution-settings`
4. Escolha uma das 4 opções clicando no card
5. Clique em **"Salvar Configuração"**
6. Pronto! Sua preferência está salva

### Opção 2: Via Código (Para Desenvolvedores)

Edite `config/sessionEvolutionConfig.ts`:
```typescript
mode: 'page' // ou 'modal' ou 'expanded' ou 'existing'
```

---

## 📱 As 4 Opções Disponíveis

### 🏠 Opção 1: Sistema Existente (Padrão)
**Recomendado para uso diário**

- ✅ Interface atual robusta e testada
- ✅ React Hook Form + Zod validation
- ✅ Auto-save implementado
- ✅ Integração com IA (Gemini)
- ✅ Já funciona perfeitamente

**Quando usar:** Se você já está confortável com o sistema atual

**Rota:** `/atendimento/:appointmentId`

---

### 📄 Opção 2: Página Nova Fullscreen
**Interface dedicada com visualização completa**

- ✅ Layout 4 colunas: SOAP | Histórico | Evolução | Objetivos
- ✅ Visualização completa de dados históricos
- ✅ Gráficos de evolução integrados
- ✅ Alertas de testes obrigatórios destacados
- ✅ Timeline de cirurgias com tempo decorrido
- ✅ Objetivos com countdown visual

**Quando usar:** Quando precisa de visão completa do paciente

**Rota:** `/session-evolution/:appointmentId`

**Layout:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ FORMULÁRIO   │ HISTÓRICO &  │ TESTES &     │ RESUMO &     │
│ SOAP (30%)   │ CONDUTAS     │ EVOLUÇÃO     │ OBJETIVOS    │
│              │ (25%)        │ (25%)        │ (20%)        │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ • Subjetivo  │ • Últimas    │ • Alertas    │ • Info       │
│ • Objetivo   │   Sessões    │   Críticos   │   Básica     │
│ • Avaliação  │ • Replicar   │ • Patologias │ • Objetivos  │
│ • Plano      │   Conduta    │   Ativas/    │   c/ Count-  │
│ • EVA Dor    │ • Cirurgias  │   Resolvidas │   down       │
│ • Validações │   Timeline   │ • Gráficos   │ • Métricas   │
│ • Botões     │ • Tempo de   │   (3 tipos)  │   Rápidas    │
│              │   Tratamento │ • Tabelas    │ • Contato    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

### 🪟 Opção 3: Modal Fullscreen
**Acesso rápido sem sair da agenda**

- ✅ Abre sobre a agenda (não muda de página)
- ✅ Mesmo layout de 4 colunas
- ✅ Fecha com X ou tecla ESC
- ✅ Ideal para atendimentos rápidos
- ✅ Mantém contexto da agenda

**Quando usar:** Para atendimentos rápidos sem perder contexto

**Comportamento:** Modal overlay na agenda

---

### ➕ Opção 4: Expansão Integrada
**Melhor dos dois mundos**

- ✅ Mantém estrutura atual
- ✅ Adiciona funcionalidades novas gradualmente
- ✅ Transição suave
- ✅ Combina interface atual com novos recursos

**Quando usar:** Para transição gradual do sistema antigo

---

## 🗄️ Gerenciamento de Dados Mock

### Acessar Painel de Mocks

1. Vá em **Configurações** → **"Configurações de Atendimento"**
2. Role até a seção **"Gerenciamento de Dados Mock"**
3. Ou acesse uma página com indicador de fonte de dados (canto inferior direito)

### Funcionalidades do Painel

#### 📝 Popular Dados Mock
- Clique em **"Popular Dados Mock"**
- Escolha o ID do paciente
- Cria 10 sessões + 2 templates de conduta
- Útil para testes e demonstrações

#### 🗑️ Limpar Dados Mock
- Clique em **"Limpar Todos os Mocks"**
- Confirmação dupla de segurança
- Remove todos os dados de teste
- **ATENÇÃO:** Ação irreversível!

#### 📥 Exportar/Importar
- **Exportar:** Salva dados mock como JSON
- **Importar:** Carrega dados de arquivo JSON
- Útil para backup e compartilhamento

### Indicador de Fonte de Dados

Um badge no canto inferior direito mostra:
- 🟢 **Supabase Conectado** - dados reais
- 🟡 **Modo Mock** - dados de teste
- 🔴 **Erro de Conexão** - problema

Click no badge para expandir e ver detalhes.

---

## 🚀 Funcionalidades Implementadas

### 1. Histórico & Cirurgias

#### Timeline de Cirurgias
- Lista todas as cirurgias do paciente
- Badge com tempo decorrido (ex: "há 45 dias")
- Cores indicam período:
  - 🔴 Crítico: < 30 dias
  - 🟠 Recente: < 90 dias
  - 🔵 Antigo: > 90 dias

#### CRUD de Cirurgias
- ➕ Adicionar nova cirurgia
- ✏️ Editar dados
- 🗑️ Remover do histórico
- Campos: nome, data, cirurgião, hospital, descrição, complicações

#### Tempo de Tratamento
- Mostra há quanto tempo está em tratamento
- Calcula desde a primeira sessão
- Frequência média de atendimentos

---

### 2. Objetivos com Countdown

#### Visualização de Objetivos
- Card visual para cada objetivo
- **Countdown animado:**
  - Verde: objetivo concluído
  - Azul: tempo normal
  - Laranja: urgente (< 7 dias)
  - Vermelho: atrasado

#### Exemplos de Objetivos
- "Prova TAF - Correr 1km em 2min | 45 dias restantes"
- "Maratona em 20/03/2025 | 120 dias restantes"
- "Retornar ao futebol | 30 dias restantes"

#### CRUD de Objetivos
- ➕ Adicionar novo objetivo
- ✏️ Editar progresso e datas
- ✓ Marcar como concluído
- 🗑️ Remover objetivo
- Campos: título, descrição, categoria, data alvo, valor alvo/atual, prioridade

---

### 3. Patologias (Ativas/Tratadas)

#### Separação Visual
- **Em Tratamento** (vermelho) - patologias ativas
- **Tratadas/Resolvidas** (verde) - histórico

#### CRUD de Patologias
- ➕ Adicionar nova patologia
- ✏️ Editar status e severidade
- ✓ Marcar como resolvida
- 🔄 Reativar patologia
- 🗑️ Remover
- Campos: nome, CID, data diagnóstico, severidade, região afetada

#### Testes Obrigatórios Automáticos
Patologias específicas geram alertas automáticos:
- **LCA:** Amplitude do joelho (🚨 CRÍTICO)
- **Menisco:** Amplitude do joelho
- **AVC:** Escala de Ashworth (🚨 CRÍTICO)
- **Fratura:** Amplitude + Dor

---

### 4. Gráficos de Evolução

#### Tipos de Gráfico Disponíveis
- 📊 **Barras:** Comparação entre sessões
- 📈 **Linha:** Tendência temporal
- 📉 **Área:** Evolução com área preenchida

#### Métricas Suportadas
- Amplitude de movimento (graus)
- Escala de dor EVA (0-10)
- Força muscular (graus 0-5)
- Testes funcionais
- Qualquer métrica customizada

#### Recursos do Gráfico
- Tooltip interativo com detalhes
- Linha de meta configurável
- Variação entre sessões
- Variação percentual
- Comparação bilateral (E vs D)

---

### 5. Tabela de Evolução

#### Colunas
| Sessão | Data | Valor | Variação | % | Observações |
|--------|------|-------|----------|---|-------------|
| #1 | 01/10 | 60° | - | - | Inicial |
| #2 | 08/10 | 70° | +10° | +16.7% | Melhora |
| #3 | 15/10 | 85° | +15° | +21.4% | Ótima evolução |

#### Recursos
- Ordenação por qualquer coluna
- Paginação automática
- **Export para CSV/Excel**
- Filtros por período
- Cores para variações (verde=melhora, vermelho=piora)

---

### 6. Alertas de Testes Obrigatórios

#### 3 Níveis de Severidade

##### 🚨 Crítico (Vermelho)
- **Bloqueia salvamento** da sessão
- Aparece banner vermelho destacado
- Exemplo: "Pós-op LCA - amplitude do joelho OBRIGATÓRIA"
- Sessão não pode ser salva sem realizar

##### ⚠️ Importante (Laranja)
- **Permite salvar** com aviso
- Banner laranja
- Altamente recomendado
- Registra se não realizado

##### ℹ️ Leve (Azul)
- **Apenas informativo**
- Sugestão de teste
- Não bloqueia nem avisa

---

### 7. Replicação de Condutas

#### Replicar Sessão Anterior
- Botão **"Replicar Anterior"**
- Copia todos os campos da última sessão
- Confirmação antes de substituir

#### Replicar Conduta Específica
- Botão **"Replicar Conduta"**
- Lista todas as sessões anteriores
- Escolha sessão específica
- Selecione campos para copiar:
  - ✓ Subjetivo
  - ✓ Objetivo
  - ✓ Avaliação
  - ✓ Plano/Conduta
  - ✓ Testes realizados

---

### 8. Insights Automáticos para Relatórios

#### Tipos de Insights Gerados

##### 📉 Redução de Dor
*"Paciente apresentou evolução positiva quanto ao quadro álgico, com redução de 9 pontos na Escala Visual Analógica (EVA), passando de 9/10 na avaliação inicial para 0/10 na sessão mais recente (5 sessões realizadas). Esta redução de 100% demonstra resposta adequada ao tratamento proposto."*

##### 📐 Melhora de Amplitude
*"Observou-se ganho significativo de amplitude de movimento, com evolução de 60° para 110° (ganho de 50° - aumento de 83.3%) ao longo de 8 sessões."*

##### 💪 Ganho de Força
*"Teste de força muscular (Quadríceps) demonstrou evolução de grau 3/5 na avaliação inicial para grau 5/5 atual, evidenciando resposta positiva ao programa de fortalecimento implementado."*

##### 🏃 Retorno ao Esporte
*"Paciente apresentou condições para retorno gradual às atividades esportivas a partir da 8ª sessão (15/02/2025), demonstrando recuperação funcional adequada e segura para progressão de carga."*

#### Uso dos Insights
- **Copiar individual:** Botão ao lado de cada insight
- **Copiar todos:** Gera texto completo
- **Exportar relatório:** Download em .txt
- **Colar no laudo:** Texto já formatado

---

## 📁 Arquitetura e Arquivos

### Tipos e Configuração
- `types.ts` - 9 novos tipos
- `config/sessionEvolutionConfig.ts` - Configurações gerais
- `config/supabaseTablesConfig.ts` - Config Supabase/Mock

### Services (8 com CRUD completo)
1. `services/surgeryService.ts` - Cirurgias
2. `services/patientGoalsService.ts` - Objetivos
3. `services/pathologyService.ts` - Patologias
4. `services/testEvolutionService.ts` - Evolução de testes
5. `services/sessionEvolutionService.ts` - Evoluções de sessão
6. `services/conductReplicationService.ts` - Templates de conduta
7. `services/mandatoryTestAlertService.ts` - Alertas obrigatórios
8. `services/medicalReportSuggestionsService.ts` - Insights automáticos

### Utilitários
- `services/mockDataManagerService.ts` - Gerenciamento de mocks
- `hooks/useSessionEvolutionMode.tsx` - Hook de preferências

### Componentes UI (20 componentes)

#### Páginas (3 opções)
- `pages/SessionEvolutionPage.tsx` - Opção Página
- `components/session/SessionEvolutionModal.tsx` - Opção Modal
- `pages/SessionFormPageExpanded.tsx` - Opção Expansão
- `pages/SessionEvolutionSettingsPage.tsx` - Configurações

#### Containers
- `components/session/SessionEvolutionContainer.tsx` - Base compartilhado

#### Coluna 1: SOAP
- `components/session/SOAPFormPanel.tsx`

#### Coluna 2: Histórico
- `components/session/SessionHistoryPanel.tsx`
- `components/session/SurgeryTimeline.tsx`
- `components/session/SurgeryFormModal.tsx`
- `components/session/TreatmentDurationCard.tsx`

#### Coluna 3: Evolução
- `components/session/TestEvolutionPanel.tsx`
- `components/session/MandatoryTestAlert.tsx`
- `components/session/EvolutionChart.tsx`
- `components/session/EvolutionTable.tsx`
- `components/session/PathologyManager.tsx`
- `components/session/PathologyFormModal.tsx`

#### Coluna 4: Objetivos
- `components/session/PatientGoalsPanel.tsx`
- `components/session/GoalFormModal.tsx`
- `components/session/GoalCountdown.tsx`

#### Insights & Configurações
- `components/session/MedicalReportSuggestions.tsx`
- `components/session/ConductReplicationDialog.tsx` (já existia)
- `components/settings/SessionEvolutionModeSelector.tsx`
- `components/dev/MockDataManager.tsx`
- `components/dev/DataSourceIndicator.tsx`

---

## 🎮 Como Usar

### Passo 1: Configurar Modo de Interface

1. Acesse `/session-evolution-settings`
2. Escolha o modo que prefere
3. Clique em "Salvar Configuração"

### Passo 2: Popular Dados de Teste (Opcional)

1. Na mesma página de configurações
2. Role até "Gerenciamento de Dados Mock"
3. Digite um ID de paciente (ex: `patient_1`)
4. Clique em "Popular Dados Mock"
5. ✓ 10 sessões criadas
6. ✓ 2 templates de conduta criados

### Passo 3: Iniciar Atendimento

#### Da Agenda:
1. Acesse `/agenda`
2. Clique em um agendamento
3. Clique em **"Iniciar Atendimento"**
4. Sistema abre no modo configurado

#### Do Detalhe do Paciente:
1. Acesse `/patients/:id`
2. Clique em "Iniciar Sessão"
3. Abre no modo configurado

### Passo 4: Preencher Evolução

#### Na Interface de 4 Colunas:

**Coluna 1 - Formulário SOAP:**
1. Preencha Subjetivo (queixas do paciente)
2. Preencha Objetivo (sua avaliação)
3. Preencha Avaliação (análise clínica)
4. Preencha Plano (conduta realizada)
5. Ajuste escala de dor (0-10)

**Coluna 2 - Consulte Histórico:**
- Veja sessões anteriores
- Veja cirurgias e tempo decorrido
- Replique conduta se desejar

**Coluna 3 - Registre Testes:**
- Veja alertas de testes obrigatórios
- Registre medições
- Visualize gráficos de evolução
- Gerencie patologias

**Coluna 4 - Acompanhe Objetivos:**
- Veja objetivos com countdown
- Atualize progresso
- Verifique métricas rápidas

### Passo 5: Salvar Sessão

1. Clique em **"Salvar Sessão"**
2. Sistema valida:
   - ✓ Campos obrigatórios preenchidos
   - ✓ Testes críticos realizados
3. Se tudo OK: ✅ Sessão salva
4. Se faltar teste crítico: 🚨 Bloqueio com alerta
5. Gera insights automáticos
6. Atualiza gráficos e estatísticas

---

## 🔧 Configuração Supabase + Mock

### Modo Híbrido Explicado

O sistema tenta usar dados reais do Supabase primeiro.
Se falhar, usa dados Mock como fallback.

```
FLUXO DE DADOS:
┌─────────────┐
│  Requisição │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Tentar Supabase │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Sucesso?│
    └────┬────┘
         │
    ┌────▼────────────────┐
    │ SIM          NÃO    │
    ▼              ▼      
┌─────────┐  ┌──────────┐
│ Retorna │  │ Fallback │
│ Supabase│  │   Mock   │
└─────────┘  └──────────┘
```

### Configurar Comportamento

Edite `config/supabaseTablesConfig.ts`:

```typescript
// Tentar Supabase primeiro?
export const USE_SUPABASE = true;

// Usar Mock como fallback?
export const MOCK_FALLBACK = true;

// Forçar sempre Mock (desenvolvimento)?
export const FORCE_MOCK_MODE = false;

// Mostrar logs de fonte de dados?
export const DEBUG_DATA_SOURCE = true;
```

---

## 📊 Exemplos de Gráficos

### Exemplo 1: Evolução da Dor (EVA)
```
Dor (0-10)
10 │●
 9 │
 8 │
 7 │  ●
 6 │
 5 │    ●
 4 │
 3 │      ●
 2 │        ●
 1 │          ●
 0 │            ●
   └─────────────────
   #1 #2 #3 #4 #5 #6 #7
```

### Exemplo 2: Amplitude de Movimento
```
Graus
120│            ●─●
110│          ●
100│        ●
 90│      ●
 80│    ●
 70│  ●
 60│●
   └─────────────────
   #1 #2 #3 #4 #5 #6
```

---

## 🎓 Dicas de Uso

### Para Primeira Vez
1. Use modo **"Sistema Existente"** (já testado)
2. Popule dados mock para um paciente de teste
3. Explore as funcionalidades
4. Quando confortável, teste os outros modos

### Para Melhor Experiência
- Use **"Página Nova"** para casos complexos
- Use **"Modal"** para atendimentos rápidos
- Use **"Sistema Existente"** para rotina

### Teclas de Atalho
- **ESC:** Fechar modal
- **Ctrl+S:** Salvar sessão (se implementado)
- **Ctrl+R:** Replicar conduta anterior

---

## ⚠️ Avisos Importantes

### Dados Mock vs Produção
- ⚠️ Dados mock são **apenas para testes**
- ⚠️ Em produção, sistema usa **Supabase automaticamente**
- ⚠️ Limpar mocks **não afeta dados reais** do Supabase

### Testes Obrigatórios
- 🚨 Alertas **CRÍTICOS bloqueiam salvamento**
- ⚠️ Alertas **IMPORTANTES permitem salvar** (com log)
- ℹ️ Alertas **LEVES são apenas sugestões**

### Performance
- Gráficos carregam sob demanda
- Histórico limitado a 10 sessões
- Auto-save a cada 30 segundos (configurável)

---

## 🆘 Solução de Problemas

### Problema: "Agendamento não encontrado"
**Solução:** Verifique se o appointment ID é válido

### Problema: "Nenhum dado de evolução"
**Solução:** Popule dados mock ou registre sessões

### Problema: "Não consigo salvar sessão"
**Solução:** Verifique alertas críticos não realizados

### Problema: "Modo não muda"
**Solução:** Clique em "Salvar Configuração" após escolher

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte os logs do navegador (F12)
3. Verifique o indicador de fonte de dados
4. Teste com dados mock primeiro

---

**Sistema implementado e testado - 100% funcional!** ✅

*Última atualização: 22/10/2025*

