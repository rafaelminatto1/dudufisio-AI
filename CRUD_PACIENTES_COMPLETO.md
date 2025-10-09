# 🏥 Sistema CRUD Completo de Pacientes - DuduFisio-AI

## 📋 Visão Geral

Sistema completo de gerenciamento de pacientes com informações clínicas detalhadas, tracking de sessões, métricas de tratamento e gestão financeira.

## 🎯 Funcionalidades Implementadas

###  1. **Tipos e Interfaces** (`types/patient.ts`)

#### Dados Completos do Paciente:
- **Identificação**: Nome, CPF, RG, código único, data de nascimento, idade, gênero
- **Contato**: Email, telefones (2), endereço completo
- **Emergência**: Contato de emergência completo
- **Saúde**: Tipo sanguíneo, altura, peso, IMC, histórico médico completo
- **Alergias e Medicamentos**: Lista de alergias, doenças crônicas, medicações atuais
- **Diagnóstico**: Condições atuais com severidade e status
- **Hábitos**: Tabagismo, consumo de álcool, nível de atividade física

#### Tracking de Sessões:
```typescript
sessionProgress: {
  currentSession: 6,           // Sessão atual
  totalPlannedSessions: 20,    // Total planejado
  completedSessions: 6,        // Concluídas
  canceledSessions: 1,         // Canceladas
  noShowSessions: 0,           // Faltas
  firstSessionDate: string,    // Primeira sessão
  lastSessionDate: string,     // Última sessão
  weeksInTreatment: 5,         // Semanas em tratamento
  daysInTreatment: 36,         // Dias em tratamento
  averageSessionsPerWeek: 1.2, // Média de sessões/semana
  adherenceRate: 85.7,         // Taxa de aderência %
  nextScheduledSession: string // Próxima sessão agendada
}
```

#### Métricas de Tratamento:
```typescript
treatmentMetrics: {
  painLevel: {
    initial: 8,        // Dor inicial (0-10)
    current: 4,        // Dor atual (0-10)
    improvement: 50    // Melhora em %
  },
  mobility: {
    initial: 50,       // Mobilidade inicial %
    current: 75,       // Mobilidade atual %
    improvement: 50    // Melhora em %
  },
  functionality: {
    initial: 40,       // Funcionalidade inicial %
    current: 70,       // Funcionalidade atual %
    improvement: 75    // Melhora em %
  },
  satisfaction: 8,     // Satisfação (0-10)
  goals: string[],     // Objetivos do tratamento
  goalsAchieved: 2     // Objetivos alcançados
}
```

#### Informações Financeiras:
```typescript
financialInfo: {
  totalSpent: 1200,           // Total gasto
  totalPending: 400,          // Total pendente
  totalPaid: 800,             // Total pago
  averageSessionCost: 200,    // Custo médio por sessão
  lastPaymentDate: string,    // Última data de pagamento
  paymentMethod: string,      // Forma de pagamento
  hasOutstandingBalance: true,// Tem saldo devedor
  outstandingBalance: 400     // Saldo devedor
}
```

### 2. **Página de Lista** (`pages/PatientListPage.tsx`)

#### Cards de Estatísticas:
- **Total de Pacientes**
- **Pacientes Ativos** (verde)
- **Pacientes Inativos** (amarelo)
- **Pacientes com Alta** (roxo)

#### DataTable Avançado:
- ✅ Busca em tempo real por nome
- ✅ Ordenação por colunas (nome, sessões)
- ✅ Paginação automática
- ✅ Avatares dos pacientes
- ✅ Badges de status coloridos
- ✅ Menu de ações (Ver, Editar, Excluir)
- ✅ Informações de sessões e progresso
- ✅ Indicador de inadimplência

#### Colunas da Tabela:
1. **Paciente**: Avatar + Nome + CPF
2. **Email**: Email de contato
3. **Telefone**: Telefone principal
4. **Status**: Badge colorido (Ativo/Inativo/Alta)
5. **Condições**: Tags das condições (máx 2 + contador)
6. **Sessões**: Número total de sessões
7. **Ações**: Menu dropdown com opções

### 3. **Página de Edição/Detalhes** (`pages/PatientEditPage.tsx`)

#### Header com Informações Rápidas:
- Nome do paciente e código
- Data de cadastro
- Badge de status
- Botão de salvar

#### Cards de Progress (4 cards no topo):

**1. Sessões:**
- Contador: "6/20"
- Barra de progresso
- "5 semanas de tratamento"

**2. Dor:**
- Nível atual: "4/10"
- Melhora: "-50% desde o início"
- Gráfico de tendência

**3. Aderência:**
- Porcentagem: "85.7%"
- Barra de progresso
- "6 sessões realizadas"

**4. Financeiro:**
- Total pago: "R$ 800,00"
- Alerta se houver pendência
- "Pendente: R$ 400,00"

#### Abas do Formulário:

**Aba 1 - Dados Pessoais** 📋
- Nome completo, CPF, RG
- Data de nascimento (calcula idade automaticamente)
- Sexo, Estado civil, Profissão
- Telefones (2), Email
- Altura, Peso, Tipo sanguíneo
- Calcula IMC automaticamente

**Aba 2 - Endereço** 🏠
- CEP (com busca automática via API)
- Rua, Número, Complemento
- Bairro, Cidade, Estado
- País (padrão: Brasil)

**Aba 3 - Contato de Emergência** 🚨
- Nome completo
- Grau de parentesco
- Telefones (2)
- Email

**Aba 4 - Informações de Saúde** ❤️

*Histórico Médico:*
- Alergias (lista separada por vírgulas)
- Doenças crônicas
- Cirurgias anteriores
- Medicações atuais
- Histórico familiar

*Hábitos de Vida:*
- Status de tabagismo: Nunca/Ex-fumante/Fumante
- Consumo de álcool: Nunca/Ocasional/Moderado/Pesado
- Nível de atividade física: Sedentário/Leve/Moderado/Intenso
- Observações sobre hábitos

**Aba 5 - Tratamento** 🏥

*Diagnóstico:*
- Diagnóstico principal
- Condições secundárias (lista)
- Médico encaminhador + CRM
- Data do diagnóstico

*Plano de Tratamento:*
- Número de sessões planejadas
- Frequência semanal desejada
- Dias preferidos (checkboxes: Seg, Ter, Qua, Qui, Sex, Sáb)
- Horários preferidos (Manhã, Tarde, Noite)
- Fisioterapeuta preferido

*Convênio:*
- Tipo: Nenhum/Particular/Público/Ambos
- Nome da operadora
- Nome do plano
- Número da carteirinha
- Validade
- Percentual de cobertura

*Objetivos do Tratamento:*
- Lista de objetivos (adicionar/remover)
- Marcar objetivos alcançados
- Data prevista para alta

**Aba 6 - Observações** 📝
- Observações gerais (visível para o paciente)
- Notas internas (apenas equipe)
- Tags para categorização
- Arquivos anexados (PDFs, imagens)

*Consentimentos:*
- ☑ Termo de consentimento assinado
- ☑ Autorização LGPD assinada
- Data das assinaturas

### 4. **Componentes de Formulário**

#### `PersonalDataForm.tsx`
- Dados pessoais completos
- Validação em tempo real
- Máscaras para CPF, telefone, CEP
- Cálculo automático de idade e IMC

#### `AddressForm.tsx`
- Busca de CEP automática (ViaCEP API)
- Preenchimento automático de endereço
- Validação de campos obrigatórios

#### `EmergencyContactForm.tsx`
- Dados do contato de emergência
- Validação de telefone e email

#### `MedicalHistoryForm.tsx`
- Histórico médico completo
- Alergias com autocomplete
- Medicações com busca

#### `TreatmentForm.tsx`
- Plano de tratamento
- Seleção de dias e horários
- Gestão de objetivos

### 5. **Colunas da DataTable** (`components/patients/PatientColumns.tsx`)

```typescript
export const columns: ColumnDef<PatientListItem>[] = [
  {
    accessorKey: "name",
    header: "Paciente",
    cell: Avatar + Nome + CPF
  },
  {
    accessorKey: "age",
    header: "Idade"
  },
  {
    accessorKey: "conditions",
    header: "Condições",
    cell: Badges das condições
  },
  {
    accessorKey: "sessionProgress",
    header: "Sessões",
    cell: "6/20 (5 semanas)"
  },
  {
    accessorKey: "adherenceRate",
    header: "Aderência",
    cell: "85.7%"
  },
  {
    accessorKey: "painImprovement",
    header: "Melhora",
    cell: "+50%" com cor
  },
  {
    accessorKey: "nextSession",
    header: "Próxima Sessão"
  },
  {
    accessorKey: "financial",
    header: "Financeiro",
    cell: Ícone se inadimplente
  },
  {
    id: "actions",
    cell: Menu dropdown
  }
];
```

### 6. **Rotas** (`AppRoutes.tsx`)

```typescript
<Route path="/patients" element={<PatientListPage />} />
<Route path="/patients/new" element={<PatientEditPage />} />
<Route path="/patients/:id" element={<PatientEditPage />} />
<Route path="/patients/:id/view" element={<PatientViewPage />} />
```

## 📊 Dados para Gráficos e Relatórios

### Métricas Disponíveis:

**1. Evolução Clínica:**
- Gráfico de evolução da dor (linha do tempo)
- Gráfico de melhora da mobilidade
- Gráfico de funcionalidade
- Taxa de satisfação

**2. Estatísticas de Sessões:**
- Total de sessões por paciente
- Taxa de aderência média
- Taxa de faltas/cancelamentos
- Distribuição de sessões por semana
- Tempo médio de tratamento

**3. Análise Demográfica:**
- Distribuição por idade
- Distribuição por gênero
- Distribuição por condição
- Distribuição geográfica (cidade/estado)
- Distribuição por ocupação

**4. Análise Financeira:**
- Receita total por paciente
- Receita média por sessão
- Taxa de inadimplência
- Distribuição por forma de pagamento
- Análise por convênio

**5. Análise de Tratamento:**
- Condições mais tratadas
- Taxa de sucesso por condição
- Tempo médio de tratamento por condição
- Objetivos mais comuns
- Taxa de alcance de objetivos

**6. Efetividade:**
- Melhora média de dor por condição
- Melhora média de mobilidade
- Taxa de alta x abandono
- Satisfação média por terapeuta

### Exemplos de Relatórios:

**Relatório de Pacientes Ativos:**
- Lista de todos pacientes ativos
- Próximas sessões agendadas
- Sessões faltantes
- Inadimplentes

**Relatório de Evolução:**
- Paciente X - Evolução últimas 4 semanas
- Gráficos de dor, mobilidade, funcionalidade
- Comparação com objetivos
- Recomendações

**Relatório Financeiro:**
- Receita por período
- Receita por terapeuta
- Receita por condição
- Pendências financeiras

**Relatório de Aderência:**
- Taxa de comparecimento
- Pacientes com baixa aderência
- Motivos de cancelamento
- Ações recomendadas

## 🚀 Como Usar

### Criar Novo Paciente:
1. Acessar `/patients`
2. Clicar em "Novo Paciente"
3. Preencher abas do formulário
4. Salvar

### Editar Paciente Existente:
1. Na lista, clicar no menu de ações (⋮)
2. Selecionar "Editar"
3. Ou clicar na linha do paciente
4. Editar informações desejadas
5. Salvar

### Visualizar Progresso:
1. Abrir página de edição do paciente
2. Ver cards de progresso no topo
3. Aba "Tratamento" mostra gráficos detalhados

## 📈 Próximos Passos

- [ ] Integração com backend real
- [ ] Upload de documentos
- [ ] Gráficos interativos de evolução
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Sistema de notificações
- [ ] Agendamento direto da página do paciente
- [ ] Timeline de evolução
- [ ] Comparação entre pacientes
- [ ] IA para predição de alta

## 🎨 Design System

- **Cores de Status:**
  - Verde: Ativo, Melhor, Positivo
  - Amarelo: Atenção, Moderado
  - Vermelho: Crítico, Inadimplente
  - Roxo: Alta, Concluído
  
- **Ícones:**
  - User: Dados pessoais
  - MapPin: Endereço
  - Phone: Emergência
  - Heart: Saúde
  - Activity: Tratamento
  - FileText: Observações
  - TrendingUp: Melhora
  - AlertCircle: Alerta


