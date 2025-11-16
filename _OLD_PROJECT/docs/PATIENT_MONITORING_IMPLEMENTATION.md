# Implementação - Página de Monitoramento de Pacientes

## Visão Geral

Implementação completa da página de Acompanhamento de Pacientes com foco em métricas de presença, detecção de risco de abandono e integração com dados do Body Map.

## Estrutura Implementada

### 1. Tipos TypeScript (`types.ts`)

Adicionados os seguintes tipos na seção "Patient Monitoring Types":

- `RiskLevel`: 'low' | 'medium' | 'high'
- `PatientWithMonitoringMetrics`: Patient + métricas calculadas
- `MonitoringFilters`: objeto com todos os filtros aplicáveis
- `MonitoringSortConfig`: configuração de ordenação
- `KPIMetrics`: métricas agregadas do dashboard
- `PresenceDataPoint`: ponto de dados para gráfico de presença
- `PainDistributionData`: dados de distribuição de dor
- `QuickActionType`: tipos de ações rápidas

### 2. Serviço de Monitoramento (`services/patientMonitoringService.ts`)

Funções implementadas:

- **`calculatePatientRisk()`**: Calcula nível de risco baseado em:
  - Faltas consecutivas (peso: 1-3 pontos)
  - Tempo sem sessão (peso: 1-3 pontos)
  - Piora de dor (peso: 1-3 pontos)
  - Score total: ≥5 = alto, ≥2 = médio, <2 = baixo

- **`getPatientMonitoringMetrics()`**: Retorna array de pacientes com métricas calculadas
  - Taxa de presença
  - Faltas consecutivas
  - Dias desde última sessão
  - Nível médio de dor
  - Tendência de dor
  - Nível de risco

- **`getKPISummary()`**: Métricas agregadas
  - Total de pacientes ativos
  - Taxa de presença média
  - Pacientes em risco
  - Total de faltas no período

- **`getPresenceEvolutionData()`**: Dados para gráfico de linha (30/60/90 dias)

- **`getPainDistributionData()`**: Distribuição de pacientes por nível de dor

### 3. Componentes de UI

#### `components/monitoring/RiskBadge.tsx`
- Badge colorido com ícone para nível de risco
- Tooltip com critérios detalhados
- Cores: verde (baixo), amarelo (médio), vermelho (alto)

#### `components/monitoring/KPICards.tsx`
- Grid responsivo de 4 cards
- Cards: Pacientes Ativos, Taxa de Presença, Pacientes em Risco, Faltas
- Indicadores de tendência vs. período anterior

#### `components/monitoring/PresenceEvolutionChart.tsx`
- Gráfico de linha usando Recharts
- Seletor de período (7/30/60/90 dias)
- Tooltip customizado com detalhes
- Mostra taxa de presença ao longo do tempo

#### `components/monitoring/PainDistributionChart.tsx`
- Gráfico de barras horizontais
- 4 categorias: Sem dor, Leve, Moderada, Severa
- Cores graduadas: verde → amarelo → laranja → vermelho
- Click na barra filtra tabela

#### `components/monitoring/FilterToolbar.tsx`
- Busca por nome/CPF
- 5 filtros select: Status, Risco, Taxa Presença, Nível Dor, Terapeuta
- Badge mostrando filtros ativos
- Botão para limpar filtros

#### `components/monitoring/PatientMonitoringTable.tsx`
- Tabela completa com 7 colunas
- Ordenação clicável em todos os headers
- Paginação (10/20/50 por página)
- Dropdown de ações por linha:
  - WhatsApp
  - Agendar
  - Adicionar Nota
  - Ver Detalhes

#### `components/monitoring/QuickActionDialog.tsx`
- Dialog unificado para ações rápidas
- 3 modos: WhatsApp, Agendar, Adicionar Nota
- Templates pré-definidos para WhatsApp
- Formulários específicos para cada ação

### 4. Página Principal (`pages/PatientMonitoringPage.tsx`)

**Layout:**
```
┌─────────────────────────────────────────┐
│ PageHeader                              │
├─────────────────────────────────────────┤
│ KPICards (4 cards)                      │
├──────────────────┬──────────────────────┤
│ PresenceChart    │ PainDistributionChart│
├──────────────────┴──────────────────────┤
│ FilterToolbar                           │
│ PatientMonitoringTable                  │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Carregamento assíncrono de dados
- Aplicação de filtros com useMemo
- Ordenação de colunas
- Integração com serviços existentes
- Handlers para ações rápidas

### 5. Roteamento

**Arquivo:** `pages/CompleteDashboard.tsx`

```tsx
const PatientMonitoringPage = createLazyComponent(() => import('./PatientMonitoringPage'));

<Route 
  path="/acompanhamento/monitoramento" 
  element={LazyElement(PatientMonitoringPage, 'Monitoramento de Pacientes')} 
/>
```

**Sidebar:** Atualizado para apontar para `/acompanhamento/monitoramento`

## Critérios de Risco

### Alto Risco (Score ≥ 5)
- 3+ faltas consecutivas OU
- 30+ dias sem sessão OU
- Piora de dor ≥3 pontos

### Médio Risco (Score 2-4)
- 2 faltas consecutivas OU
- 15-29 dias sem sessão OU
- Piora de dor 1-2 pontos

### Baixo Risco (Score < 2)
- 0-1 falta recente E
- <15 dias última sessão E
- Sem piora significativa de dor

## Responsividade

- **Desktop (≥1024px)**: Layout completo com 4 colunas KPI, 2 colunas gráficos
- **Tablet (768-1023px)**: 2 colunas KPI, 1 coluna gráficos, tabela com scroll
- **Mobile (<768px)**: 1 coluna, tabela empilhada

## Integrações

### Body Map Service
- `getBodyMapAnalyticsCache()`: busca nível médio de dor
- `getSessionsByPatient()`: histórico para calcular tendência
- Detecção de pioras: comparação entre últimas 2 sessões

### Appointment Service
- `getAppointments()`: dados de presença e faltas
- Cálculo de taxa de presença: (Completed / (Completed + NoShow)) * 100
- Identificação de faltas consecutivas

### Patient Service
- `addCommunicationLog()`: registro de contatos
- Histórico de comunicação para contexto

### WhatsApp Business Service (futuro)
- Templates de mensagem pré-definidos
- Envio direto via API

## Performance

- **useMemo** para filtros e ordenação (evita recálculos desnecessários)
- **React.lazy** para code splitting
- **Paginação** limita DOM (10/20/50 itens)
- **Skeletons** durante carregamento
- Cálculos de risco em paralelo (Promise.all)

## Como Usar

### Acessar a Página
1. Login no sistema
2. Sidebar → "Acompanhamento"
3. Ou navegar para: `/acompanhamento/monitoramento`

### Filtrar Pacientes
1. Use a barra de busca para nome/CPF
2. Selecione filtros específicos
3. Combine múltiplos filtros
4. Clique em "Limpar Filtros" para resetar

### Ordenar Tabela
1. Clique no header da coluna desejada
2. Primeiro clique: ascendente
3. Segundo clique: descendente

### Ações Rápidas
1. Clique no botão "..." na linha do paciente
2. Escolha a ação desejada
3. Preencha o formulário no dialog
4. Confirme a ação

### Análise de Gráficos
- **Presença**: Altere o período para ver evolução
- **Dor**: Clique nas barras para filtrar por nível

## Próximos Passos

### Melhorias Sugeridas
1. **Integração WhatsApp real**: Conectar com whatsappBusinessService
2. **Histórico de trends**: Comparação com períodos anteriores
3. **Exportação de dados**: Excel/PDF dos pacientes filtrados
4. **Alertas automáticos**: Notificações para pacientes de alto risco
5. **Filtro por terapeuta**: Implementar busca por appointments
6. **Gráficos adicionais**: 
   - Distribuição de risco ao longo do tempo
   - Comparação entre terapeutas
   - Mapa de calor de presença

### Testes Recomendados
1. Testar com diferentes volumes de dados
2. Verificar performance com 100+ pacientes
3. Testar responsividade em dispositivos reais
4. Validar cálculos de risco com casos extremos
5. Testar filtros combinados

## Arquivos Criados/Modificados

### Criados
- `services/patientMonitoringService.ts`
- `components/monitoring/RiskBadge.tsx`
- `components/monitoring/KPICards.tsx`
- `components/monitoring/PresenceEvolutionChart.tsx`
- `components/monitoring/PainDistributionChart.tsx`
- `components/monitoring/FilterToolbar.tsx`
- `components/monitoring/PatientMonitoringTable.tsx`
- `components/monitoring/QuickActionDialog.tsx`
- `components/monitoring/index.ts`
- `pages/PatientMonitoringPage.tsx`

### Modificados
- `types.ts`: Adicionados tipos de monitoramento
- `pages/CompleteDashboard.tsx`: Adicionada rota
- `components/Sidebar.tsx`: Atualizado link

## Dependências

Todas as dependências já existem no projeto:
- React 19
- React Router DOM
- Recharts (gráficos)
- Lucide React (ícones)
- TailwindCSS (estilos)
- Shadcn UI (componentes base)

## Status

✅ **Implementação Completa**

Todos os componentes, serviços e rotas foram implementados conforme especificado no plano. A página está pronta para uso e testes.

