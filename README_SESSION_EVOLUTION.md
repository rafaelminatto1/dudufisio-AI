# Sistema de Evolução de Sessão - DuduFisio-AI

## Visão Geral

O Sistema de Evolução de Sessão é uma solução completa para gestão de atendimentos fisioterapêuticos, oferecendo 3 modos de interface configuráveis e funcionalidades avançadas de acompanhamento de pacientes.

## 🚀 Como Usar

### Iniciando uma Sessão

Na página da agenda, clique em **"Iniciar Atendimento"** em qualquer agendamento. O sistema irá:

1. Carregar automaticamente todos os dados do paciente
2. Exibir histórico de sessões anteriores
3. Mostrar cirurgias com tempo decorrido
4. Apresentar objetivos com countdown
5. Listar patologias ativas e tratadas
6. Gerar alertas de testes obrigatórios
7. Criar gráficos de evolução

### 3 Modos de Interface

O sistema oferece 3 modos configuráveis:

#### 1. **Modo Página** (page) 
- Página nova dedicada em `/atendimento/:appointmentId/evolucao`
- Layout de 4 colunas fullscreen
- Navegação por tabs em mobile/tablet
- Ideal para workflows completos

#### 2. **Modo Modal** (modal) - *PADRÃO*
- Modal fullscreen que abre sobre a agenda
- z-index: 50 (cobre toda interface)
- Animações suaves de entrada/saída
- Ideal para consultas rápidas

#### 3. **Modo Expansão** (expansion)
- Expande a SessionFormPage existente
- Integra-se com fluxo atual
- Ideal para usuários acostumados com interface antiga

### Configurando o Modo

#### Via Variável de Ambiente

Crie/edite `.env.local`:

```env
VITE_SESSION_MODE=modal  # page | modal | expansion
```

#### Via Hook Programático

```typescript
import { useSessionEvolutionMode } from './hooks/useSessionEvolutionMode';

function MyComponent() {
  const { mode, setMode } = useSessionEvolutionMode();
  
  // Alterar modo
  setMode('page'); // ou 'modal' ou 'expansion'
}
```

#### Via Configuração Direta

Edite `config/sessionEvolutionConfig.ts`:

```typescript
export const SESSION_EVOLUTION_MODE: SessionEvolutionMode = 'modal';
```

## 📋 Estrutura de 4 Colunas

### Coluna 1 (30%): Formulário SOAP
- ✍️ Campo Subjetivo (queixas do paciente)
- 🔍 Campo Objetivo (avaliação do profissional)
- 📊 Campo Avaliação (diagnóstico cinesiofuncional)
- 📝 Campo Plano/Conduta (próximos passos)
- 🔄 Botão "Replicar Conduta Anterior"
- 💾 Auto-save a cada 2.5 segundos
- ✅ Validações inline

### Coluna 2 (25%): Histórico & Cirurgias
- 📜 **Últimas Sessões**: 10 sessões mais recentes
  - Botão "Replicar Esta Conduta"
  - Preview do SOAP
  - Data e número da sessão
  
- 🏥 **Timeline de Cirurgias**
  - Badge com tempo decorrido (ex: "há 45 dias")
  - Fase pós-operatória (aguda, subaguda, crônica)
  - CRUD completo (adicionar, editar, deletar)
  
- ⏱️ **Tempo de Tratamento**
  - Primeira sessão
  - Dias em tratamento
  - Total de sessões

### Coluna 3 (25%): Testes & Evolução
- 🚨 **Alertas de Testes Obrigatórios**
  - **Crítico**: Bloqueia salvamento (ex: pós-op LCA)
  - **Importante**: Aviso destacado, permite salvar
  - **Leve**: Apenas notificação
  
- 🏥 **Gerenciador de Patologias**
  - Seção "Em Tratamento" (active, chronic, monitoring)
  - Seção "Tratadas/Resolvidas" (resolved)
  - CRUD completo com validações
  - Sugestões de testes obrigatórios
  
- 📈 **Gráficos de Evolução**
  - Tipos: Barras, Linha, Área, Radar
  - Métricas sugeridas:
    - Amplitude de movimento
    - Nível de dor (EVA 0-10)
    - Força muscular
    - Equilíbrio
    - Testes funcionais
  - Export PNG/SVG/CSV
  
- 📊 **Tabela de Evolução**
  - Ordenável por coluna
  - Filtros por período
  - Export para CSV

### Coluna 4 (20%): Resumo & Objetivos
- 👤 **Visão Geral do Paciente**
  - Nome, idade, foto
  - Contato rápido (WhatsApp)
  - Status do paciente
  
- 🎯 **Objetivos com Countdown**
  - Barra de progresso visual
  - Countdown animado (dias restantes)
  - Exemplos:
    - "Prova TAF - Correr 1km em 2min | 45 dias"
    - "Maratona em 20/03/2025 | 120 dias"
  - Badge de prioridade (baixa/média/alta/crítica)
  - CRUD completo
  
- 📊 **Métricas Rápidas**
  - Número de sessões realizadas
  - Taxa de presença
  - Próxima sessão agendada
  - Nível médio de dor

## ⚠️ Sistema de Alertas

### 3 Níveis de Severidade

#### 🚨 Crítico (BLOQUEIA Salvamento)
- Pós-op LCA sem medição de amplitude
- AVC sem Escala de Ashworth
- Testes obrigatórios por protocolo clínico
- **Comportamento**: Modal de bloqueio com opção "Registrar Exceção"

#### ⚠️ Importante (AVISA mas permite salvar)
- Testes recomendados não realizados
- Métricas faltando
- **Comportamento**: Banner laranja destacado

#### ℹ️ Leve (Apenas notificação)
- Sugestões de testes adicionais
- **Comportamento**: Badge azul informativo

### Registro de Não Conformidade

Quando um teste crítico é pulado:
1. Modal pede justificativa obrigatória
2. Sistema registra no log de auditoria
3. Salvamento é permitido com ressalva
4. Relatório de compliance é atualizado

## 🤖 Insights Automáticos para Laudos

O sistema gera automaticamente sugestões de texto para laudos médicos:

### Exemplos de Insights Gerados

```text
✓ Redução de Dor: "Paciente reduziu dor de 9/10 para 0/10 em 5 sessões"

✓ Melhora de Amplitude: "Amplitude de movimento aumentou 40% desde avaliação inicial (80° → 112°)"

✓ Ganho de Força: "Teste de força muscular evoluiu de grau 3 para grau 5"

✓ Marco Importante: "Retornou ao esporte de forma gradual na semana 8"

✓ Progresso Funcional: "Teste de marcha melhorou 35% em 4 semanas"
```

### Como Usar

1. Navegue até a Coluna 4 (Resumo)
2. Seção "Insights para Laudo"
3. Clique em "Copiar para Relatório"
4. Texto formatado é copiado para área de transferência

## 🔄 Replicação de Condutas

### Opção 1: Replicar Sessão Anterior (Rápido)
- Botão "Replicar Conduta Anterior" na Coluna 1
- Copia SOAP completo da última sessão
- Confirmação antes de substituir

### Opção 2: Replicar Sessão Específica
- Botão "Replicar" em cada card de sessão na Coluna 2
- Escolhe sessão específica do histórico
- Preview antes de aplicar

### Opção 3: Selecionar Campos
- Botão "Replicar Conduta" (avançado)
- Dialog com checkboxes:
  - [ ] Subjetivo
  - [ ] Objetivo
  - [ ] Avaliação
  - [ ] Plano
  - [ ] Testes realizados
- Aplica apenas campos selecionados

### Opção 4: Templates Salvos
- Salvar condutas frequentes como templates
- Nomear e categorizar
- Reutilizar em qualquer paciente

## 📊 Gráficos de Evolução

### Tipos Disponíveis

1. **Gráfico de Linha** (padrão)
   - Ideal para: Amplitude, Dor, Força
   - Mostra tendência temporal

2. **Gráfico de Barras**
   - Ideal para: Comparações discretas
   - Bom para visualizar progressão

3. **Gráfico de Área**
   - Ideal para: Volume de dados
   - Destaca mudanças acumuladas

4. **Gráfico Radar**
   - Ideal para: Múltiplas métricas simultâneas
   - Ex: Força de 5 grupos musculares

### Configuração de Gráficos

```typescript
// Alterar tipo de gráfico
import { FEATURES_CONFIG } from './config/sessionEvolutionConfig';

FEATURES_CONFIG.evolutionCharts.defaultChartType = 'line'; // 'bar' | 'area' | 'radar'
```

### Export de Gráficos

- **PNG**: Alta resolução para relatórios
- **SVG**: Vetorizado para escalabilidade
- **CSV**: Dados brutos para análise externa

## 🎯 Gerenciamento de Objetivos

### Estrutura de um Objetivo

```typescript
{
  title: "Corrida de 1km em 2min",
  targetDate: "2025-03-15",
  targetValue: "2:00",
  currentValue: "2:30",
  currentProgress: 75, // 0-100%
  priority: "high", // low | medium | high | critical
  category: "performance", // recovery | fitness | lifestyle | medical
}
```

### Countdown Visual

- Exibe dias/semanas/meses restantes
- Animação quando próximo da data
- Badge de status:
  - 🟢 Verde: >30 dias
  - 🟡 Amarelo: 15-30 dias
  - 🔴 Vermelho: <15 dias
  - ⚫ Cinza: Vencido

### Cálculo Automático de Progresso

O sistema calcula automaticamente com base em:
- Testes funcionais
- Métricas de dor
- Amplitude de movimento
- Força muscular

## 🏥 Gerenciamento de Cirurgias

### Informações Rastreadas

- Nome da cirurgia
- Data realizada
- Cirurgião
- Hospital
- Complicações
- Tempo de recuperação esperado
- Notas adicionais

### Cálculo de Tempo Decorrido

```typescript
// Exemplo de output
"há 45 dias" // < 60 dias
"há 3 meses" // 60-365 dias
"há 1 ano e 2 meses" // > 365 dias
```

### Fases Pós-Operatórias

1. **Aguda** (0-2 semanas): Badge vermelho
2. **Subaguda** (2-6 semanas): Badge laranja
3. **Crônica** (6+ semanas): Badge azul

## 🔍 Gerenciamento de Patologias

### Status Disponíveis

- **Active**: Em tratamento ativo
- **Chronic**: Condição crônica em monitoramento
- **Monitoring**: Sob observação
- **Resolved**: Tratada/resolvida

### Severidade

- **Mild**: Leve (verde)
- **Moderate**: Moderada (amarelo)
- **Severe**: Grave (laranja)
- **Critical**: Crítica (vermelho)

### Sugestões Automáticas de Testes

O sistema sugere testes obrigatórios baseado na patologia:

| Patologia | Testes Sugeridos |
|-----------|------------------|
| LCA | Amplitude joelho, Teste de Lachman, Força quadríceps |
| Menisco | Amplitude joelho, Teste de McMurray |
| AVC | Escala Ashworth, Força muscular, Equilíbrio, Marcha |
| Artrose | Amplitude, Dor (EVA), Teste funcional de marcha |
| Fratura | Amplitude, Dor (EVA), Edema |

## 💾 Auto-Save

### Comportamento

- ⏱️ Debounce de 2.5 segundos
- 🔄 Salva automaticamente enquanto digita
- 💾 Indicador visual de status:
  - "Alterações não salvas" (vermelho)
  - "Salvando..." (amarelo com spinner)
  - "Salvo" (verde com ✓)

### Desabilitar Auto-Save

```typescript
// config/sessionEvolutionConfig.ts
export const FEATURES_CONFIG = {
  autosave: {
    enabled: false, // Desabilita auto-save
    debounceMs: 2500,
  },
};
```

## 🧪 Validações

### Campos SOAP

```typescript
{
  subjective: {
    minLength: 10, // Mínimo 10 caracteres
    maxLength: 5000, // Máximo 5000 caracteres
    required: true,
  },
  objective: {
    minLength: 10,
    maxLength: 5000,
    required: true,
  },
  assessment: {
    minLength: 10,
    maxLength: 5000,
    required: true,
  },
  plan: {
    minLength: 10,
    maxLength: 5000,
    required: true,
  },
}
```

### Validações de Data

- Data de cirurgia não pode ser futura
- Data alvo de objetivo não pode ser passada
- Data de diagnóstico de patologia não pode ser futura

### Validações de Testes

- Valor deve estar em range válido
- Unidade de medida obrigatória
- Testes críticos bloqueiam salvamento se não realizados

## 🎨 Responsividade

### Desktop (>1024px)
- Layout de 4 colunas lado a lado
- Grid: `30% | 25% | 25% | 20%`

### Tablet (768px-1024px)
- Layout de 2 colunas
- Grid: `50% | 50%`
- Navegação por tabs no topo

### Mobile (<768px)
- Layout de 1 coluna
- Width: `100%`
- Tabs para alternar entre seções

## 🔧 Troubleshooting

### Modo não está mudando

1. Limpe o localStorage:
```javascript
localStorage.removeItem('session_evolution_mode_preference');
```

2. Verifique `.env.local`:
```env
VITE_SESSION_MODE=modal
```

3. Reinicie o servidor de desenvolvimento

### Auto-save não está funcionando

1. Verifique a configuração:
```typescript
FEATURES_CONFIG.autosave.enabled === true
```

2. Confira o console do navegador para erros
3. Verifique conexão com backend

### Alertas não aparecem

1. Verifique se paciente tem patologias cadastradas
2. Confira configurações de teste obrigatório
3. Veja se já foram realizados na sessão

### Gráficos não carregam

1. Verifique se há dados de sessões anteriores
2. Confirme que testes foram registrados com valores numéricos
3. Veja console para erros de parsing

## 📚 API Reference

### Services Principais

```typescript
// Surgery Service
import * as surgeryService from './services/surgeryService';

surgeryService.getSurgeriesByPatientId(patientId);
surgeryService.addSurgery(patientId, surgeryData);
surgeryService.calculateTimeSinceSurgery(surgeryDate);

// Patient Goals Service
import * as patientGoalsService from './services/patientGoalsService';

patientGoalsService.getGoalsByPatientId(patientId);
patientGoalsService.addGoal(patientId, goalData);
patientGoalsService.calculateCountdown(targetDate);
patientGoalsService.markGoalCompleted(goalId);

// Pathology Service
import * as pathologyService from './services/pathologyService';

pathologyService.getPathologiesByPatientId(patientId);
pathologyService.getActivePathologies(patientId);
pathologyService.getResolvedPathologies(patientId);
pathologyService.markAsResolved(pathologyId);

// Test Evolution Service
import * as testEvolutionService from './services/testEvolutionService';

testEvolutionService.getTestEvolutionData(patientId, testName);
testEvolutionService.getTestStatistics(patientId, testName);
testEvolutionService.getMandatoryTests(patientId, sessionNumber);

// Conduct Replication Service
import * as conductReplicationService from './services/conductReplicationService';

conductReplicationService.getSavedConducts(patientId);
conductReplicationService.saveConductAsTemplate(patientId, conduct, name);
conductReplicationService.replicateConduct(conductId);

// Medical Insights Service
import * as medicalReportSuggestionsService from './services/medicalReportSuggestionsService';

medicalReportSuggestionsService.generateMedicalInsights(patientId);
medicalReportSuggestionsService.generateFullMedicalReport(patientId);
medicalReportSuggestionsService.generateExecutiveSummary(patientId);
```

## 🔐 Permissões

Por padrão, todas as funcionalidades estão disponíveis para:
- **Admin**: Acesso completo
- **Fisioterapeuta**: Acesso completo
- **Educador Físico**: Acesso de leitura + condutas

Pacientes não têm acesso ao sistema de evolução de sessão.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte este README
2. Veja a documentação técnica em `ARCHITECTURE.md`
3. Consulte exemplos de API em `API.md`
4. Abra uma issue no repositório

## 📝 Changelog

### v1.0.0 (2025-01-24)
- ✅ 3 modos de interface (page, modal, expansion)
- ✅ Sistema de 4 colunas responsivo
- ✅ Alertas de testes obrigatórios (3 níveis)
- ✅ Gerenciamento de cirurgias com tempo decorrido
- ✅ Objetivos com countdown visual
- ✅ Patologias ativas/resolvidas
- ✅ Gráficos de evolução (4 tipos)
- ✅ Insights automáticos para laudos
- ✅ Replicação de condutas (4 modos)
- ✅ Auto-save com debounce
- ✅ CRUD completo de todas entidades
- ✅ Modo híbrido (Supabase + Mock)

## 🎯 Roadmap

### v1.1 (Próxima versão)
- [ ] Integração com IA para sugestões de conduta
- [ ] Export de relatório PDF completo
- [ ] Comparação bilateral de testes com gráfico
- [ ] Timeline visual de evolução
- [ ] Sistema de tags para sessões
- [ ] Busca avançada no histórico

### v1.2 (Futuro)
- [ ] Modo colaborativo (múltiplos terapeutas)
- [ ] Assinatura digital de laudos
- [ ] Integração com wearables
- [ ] Machine Learning para predição de resultados
- [ ] App mobile nativo

---

**Desenvolvido com ❤️ por DuduFisio-AI Team**

