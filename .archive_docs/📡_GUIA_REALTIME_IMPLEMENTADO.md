# 📡 GUIA - Supabase Realtime Implementado

**Data:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ COMPLETO

---

## 🎯 O QUE FOI IMPLEMENTADO

### ✅ Sistema Completo de Real-time

1. **Hooks Genéricos**:
   - `useRealtimeSubscription` - Subscription genérica com React Query
   - `usePresence` - Status online/offline de usuários
   - `useBroadcast` - Mensagens broadcast em tempo real

2. **Hooks Especializados**:
   - `useRealtimeNotifications` - Notificações do sistema
   - `useFamilyRealtimeNotifications` - Notificações da família
   - `useRealtimeRiskAlerts` - Alertas de risco em tempo real
   - `useRealtimeFamilyMessages` - Mensagens da família
   - `useRealtimeSafetyEvents` - Eventos de segurança

3. **Componentes UI**:
   - `RealtimeChat` - Chat completo em tempo real
   - `OnlineIndicator` - Indicador de usuários online
   - `OnlineStatus` - Status simples online/offline

4. **Migration SQL**:
   - Habilita realtime em 20 tabelas
   - RLS policies para broadcast e presence

---

## 🚀 COMO USAR

### 1. Habilitar Realtime no Supabase

```sql
-- Aplicar migration:
-- supabase/migrations/20251008_enable_realtime.sql

-- Verificar se foi habilitado:
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

### 2. Subscription Básica com Invalidação Automática

```typescript
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { riskKeys } from '@/hooks/useRiskAssessments';

function RiskDashboard({ patientId }) {
  const { data: assessments } = useRiskAssessments(patientId);
  
  // Real-time subscription - atualiza cache automaticamente
  useRealtimeSubscription({
    table: 'risk_assessments',
    filter: `patient_id=eq.${patientId}`,
    queryKey: riskKeys.list(patientId),
  });
  
  // UI atualiza automaticamente quando dados mudam no Supabase!
  return (
    <div>
      {assessments?.map(assessment => (
        <Card key={assessment.id} data={assessment} />
      ))}
    </div>
  );
}
```

---

### 3. Subscription com Callbacks Customizados

```typescript
useRealtimeSubscription({
  table: 'family_messages',
  filter: `patient_id=eq.${patientId}`,
  queryKey: familyKeys.messages(patientId),
  
  onInsert: (payload) => {
    const message = payload.new;
    toast.info(`Nova mensagem de ${message.sender_name}`);
    playNotificationSound();
  },
  
  onUpdate: (payload) => {
    console.log('Mensagem atualizada:', payload.new);
  },
  
  onDelete: (payload) => {
    toast.warning('Mensagem deletada');
  },
});
```

---

### 4. Notificações Real-time

```typescript
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

function App() {
  const { user } = useAuth();
  
  // Habilitar notificações real-time para o usuário
  useRealtimeNotifications(user?.id);
  
  return <YourApp />;
}
```

**Resultado:**
- ✅ Toasts automáticos quando receber notificação
- ✅ Cache invalidado automaticamente
- ✅ Pode clicar para ver detalhes

---

### 5. Chat em Tempo Real

```typescript
import { RealtimeChat } from '@/components/realtime/RealtimeChat';

function FamilyPortal({ patientId }) {
  const { user } = useAuth();
  
  return (
    <div className="h-96">
      <RealtimeChat 
        roomId={`patient-${patientId}`}
        userId={user.id}
        userName={user.name}
      />
    </div>
  );
}
```

**Features:**
- ✅ Mensagens instantâneas
- ✅ Scroll automático
- ✅ Indicador de "digitando"
- ✅ Timestamps
- ✅ UI moderna

---

### 6. Indicador de Presença

```typescript
import { OnlineIndicator } from '@/components/realtime/OnlineIndicator';

function Navbar() {
  const { user } = useAuth();
  
  return (
    <nav>
      <OnlineIndicator 
        roomName="therapists-room"
        userId={user.id}
        userName={user.name}
      />
    </nav>
  );
}
```

**Mostra:**
- ✅ Número de usuários online
- ✅ Avatares dos usuários
- ✅ Nomes no hover

---

### 7. Alertas de Risco em Tempo Real

```typescript
import { useRealtimeRiskAlerts } from '@/hooks/useRealtimeNotifications';

function Dashboard({ patientId }) {
  // Monitorar alertas de risco em tempo real
  useRealtimeRiskAlerts(patientId);
  
  // Toast vermelho automático quando risco crítico detectado
  return <YourDashboard />;
}
```

---

### 8. Eventos de Segurança em Tempo Real

```typescript
import { useRealtimeSafetyEvents } from '@/hooks/useRealtimeNotifications';

function QualityDashboard() {
  // Monitorar eventos de segurança
  useRealtimeSafetyEvents();
  
  // Notificação urgente automática para eventos críticos
  return <SafetyDashboard />;
}
```

---

## 🎨 PADRÕES E BOAS PRÁTICAS

### 1. Integração com React Query

```typescript
// Real-time invalida cache automaticamente
useRealtimeSubscription({
  table: 'athletes',
  queryKey: sportsKeys.profile(patientId),
  // Quando dados mudam:
  // 1. Query é invalidada
  // 2. React Query refetch automaticamente
  // 3. UI atualiza
});
```

---

### 2. Cleanup Automático

```typescript
// Subscription é removida automaticamente ao desmontar
useEffect(() => {
  const channel = supabase.channel('my-channel')
    .on('postgres_changes', ...)
    .subscribe();
  
  return () => {
    channel.unsubscribe(); // ✅ Cleanup automático
  };
}, []);
```

---

### 3. Filtering no Servidor

```typescript
// ✅ Bom: Filtrar no servidor
useRealtimeSubscription({
  table: 'messages',
  filter: `room_id=eq.${roomId}`, // Filtra no Postgres
});

// ❌ Ruim: Filtrar no cliente
useRealtimeSubscription({
  table: 'messages', // Recebe TODAS as mensagens
  onInsert: (payload) => {
    if (payload.new.room_id === roomId) { // Filtra aqui
      // ...
    }
  }
});
```

---

### 4. Múltiplas Subscriptions

```typescript
function PatientView({ patientId }) {
  // Múltiplas subscriptions - cada uma cleanup automaticamente
  useRealtimeSubscription({
    table: 'risk_assessments',
    filter: `patient_id=eq.${patientId}`,
    queryKey: riskKeys.list(patientId),
  });
  
  useRealtimeSubscription({
    table: 'athlete_profiles',
    filter: `patient_id=eq.${patientId}`,
    queryKey: sportsKeys.profile(patientId),
  });
  
  // Cada uma invalida seu próprio cache
}
```

---

## 📊 TABELAS COM REALTIME HABILITADO

### Risk Stratification (3)
- ✅ `risk_assessments` - Avaliações de risco
- ✅ `risk_alerts` - Alertas de risco
- ✅ `risk_profiles` - Perfis de risco

### Sports Rehabilitation (5)
- ✅ `athlete_profiles` - Perfis de atletas
- ✅ `performance_metrics` - Métricas de performance
- ✅ `load_monitoring` - Monitoramento de carga
- ✅ `rehab_progressions` - Progressões
- ✅ `sport_training_sessions` - Sessões de treino

### Family Portal (4)
- ✅ `family_members` - Membros da família
- ✅ `family_messages` - Mensagens
- ✅ `family_notifications` - Notificações
- ✅ `family_access_logs` - Logs de acesso

### Predictive Analytics (3)
- ✅ `ai_predictions` - Predições
- ✅ `ml_models` - Modelos de ML
- ✅ `ai_insights` - Insights

### Quality Assurance (4)
- ✅ `compliance_audits` - Auditorias
- ✅ `compliance_issues` - Issues
- ✅ `quality_metrics` - Métricas
- ✅ `patient_safety_events` - Eventos de segurança

**Total:** 20 tabelas com realtime

---

## 🎯 CASOS DE USO

### Caso 1: Dashboard Colaborativo

```typescript
function CollaborativeDashboard() {
  const { user } = useAuth();
  
  // Mostrar quem está vendo o dashboard
  const { getOnlineUsers } = usePresence('dashboard', user.id);
  
  // Atualizar métricas em tempo real
  useRealtimeSubscription({
    table: 'quality_metrics',
    queryKey: qualityKeys.metrics(),
  });
  
  return (
    <div>
      <OnlineIndicator roomName="dashboard" userId={user.id} userName={user.name} />
      <Metrics /> {/* Atualiza automaticamente */}
    </div>
  );
}
```

---

### Caso 2: Mensagens Instantâneas

```typescript
function FamilyMessages({ patientId }) {
  // Mensagens atualizam em tempo real
  const { data: messages } = useFamilyMessages(patientId);
  
  useRealtimeSubscription({
    table: 'family_messages',
    filter: `patient_id=eq.${patientId}`,
    queryKey: familyKeys.messages(patientId),
    onInsert: (payload) => {
      playSound('new-message.mp3');
    },
  });
  
  return <MessageList messages={messages} />;
}
```

---

### Caso 3: Alertas Críticos

```typescript
function GlobalAlertMonitor() {
  // Monitorar alertas de TODOS os pacientes (admin)
  useRealtimeSubscription({
    table: 'risk_alerts',
    event: 'INSERT',
    queryKey: ['all-alerts'],
    onInsert: (payload) => {
      const alert = payload.new;
      if (alert.risk_level === 'critical') {
        // Notificação desktop
        new Notification('🚨 Alerta Crítico', {
          body: `Paciente: ${alert.patient_name}`,
          icon: '/alert-icon.png',
        });
      }
    },
  });
}
```

---

### Caso 4: Sincronização Multi-Usuário

```typescript
function SessionNotes({ sessionId }) {
  const updateMutation = useUpdateSessionNotes();
  
  // Ver updates de outros terapeutas em tempo real
  useRealtimeSubscription({
    table: 'session_notes',
    filter: `session_id=eq.${sessionId}`,
    queryKey: ['session-notes', sessionId],
    onUpdate: (payload) => {
      toast.info(`Atualizado por ${payload.new.updated_by}`);
    },
  });
  
  return <NotesEditor />;
}
```

---

## 🔧 CONFIGURAÇÃO

### Passo 1: Aplicar Migration

```bash
# Copiar e colar no Supabase SQL Editor:
# supabase/migrations/20251008_enable_realtime.sql
```

---

### Passo 2: Verificar RLS Policies

```sql
-- Verificar policies para realtime.messages
SELECT * FROM pg_policies 
WHERE schemaname = 'realtime' 
AND tablename = 'messages';
```

---

### Passo 3: Usar nos Componentes

```typescript
// Importar e usar
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

// Adicionar no componente
useRealtimeSubscription({
  table: 'your_table',
  queryKey: ['your-query-key'],
});
```

---

## 🎯 BENEFÍCIOS ALCANÇADOS

### Para Usuários

- 🔴 **Dados sempre atualizados**
  - Sem necessidade de refresh manual
  - Updates instantâneos

- 👥 **Colaboração em tempo real**
  - Ver quem está online
  - Ver mudanças de outros usuários

- 🔔 **Notificações instantâneas**
  - Alertas críticos imediatos
  - Mensagens em tempo real

### Para Desenvolvedores

- 🎨 **API simples e limpa**
  - Um hook para tudo
  - Integrado com React Query

- 🐛 **Menos bugs**
  - Cleanup automático
  - Type-safe

- ⚡ **Performance otimizada**
  - Filtering no servidor
  - Apenas dados necessários

---

## 📊 TIPOS DE REALTIME

### 1. Postgres Changes

```typescript
// Receber mudanças do banco de dados
useRealtimeSubscription({
  table: 'risk_assessments',
  event: '*', // ou 'INSERT', 'UPDATE', 'DELETE'
});
```

**Usa:** WebSocket + Postgres WAL (Write-Ahead Log)

---

### 2. Broadcast

```typescript
// Mensagens efêmeras entre clientes
const { sendMessage } = useBroadcast('room-1', (msg) => {
  console.log('Received:', msg);
});

sendMessage({ type: 'ping', data: 'hello' });
```

**Usa:** WebSocket (não persiste no DB)

---

### 3. Presence

```typescript
// Status online/offline
const { getOnlineUsers } = usePresence('lobby', userId);

// Ver quem está online
const users = getOnlineUsers();
```

**Usa:** WebSocket + ephemeral state

---

## 🧪 COMO TESTAR

### Teste 1: Realtime Básico

```bash
# Terminal 1
npm run dev

# Terminal 2 (outra aba do navegador)
# Abrir mesma página

# Terminal 1: Criar avaliação
# Terminal 2: Ver atualização automática (sem refresh!)
```

---

### Teste 2: Chat Real-time

```tsx
// Página de teste
function TestChat() {
  const { user } = useAuth();
  
  return (
    <RealtimeChat 
      roomId="test-room"
      userId={user.id}
      userName={user.name}
    />
  );
}

// Abrir em 2+ navegadores diferentes
// Enviar mensagens
// Ver aparecer instantaneamente em todos
```

---

### Teste 3: Presença

```tsx
function TestPresence() {
  const { user } = useAuth();
  
  return (
    <OnlineIndicator 
      roomName="test-presence"
      userId={user.id}
      userName={user.name}
    />
  );
}

// Abrir em múltiplos navegadores
// Ver contador aumentar
// Fechar navegador
// Ver contador diminuir
```

---

### Teste 4: Notificações

```sql
-- No Supabase SQL Editor, inserir notificação:
INSERT INTO notifications (user_id, type, title, message)
VALUES (
  '[UUID_DO_USUARIO]',
  'info',
  'Teste de Notificação',
  'Esta é uma notificação em tempo real!'
);

-- Toast deve aparecer INSTANTANEAMENTE no navegador!
```

---

## 🚨 TROUBLESHOOTING

### Realtime não funciona

```typescript
// 1. Verificar se migration foi aplicada
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

// 2. Verificar se tabela está listada
// Se não: ALTER PUBLICATION supabase_realtime ADD TABLE sua_tabela;

// 3. Verificar RLS policies
// Policies bloqueando podem impedir realtime
```

---

### "Channel error" no console

```typescript
// Verificar filtro
useRealtimeSubscription({
  filter: `patient_id=eq.${patientId}`, // ✅ Correto
  // não: filter: `patient_id=${patientId}` // ❌ Errado
});
```

---

### Múltiplas subscriptions da mesma tabela

```typescript
// Dar nomes únicos aos channels
const channel1 = supabase.channel('patients-list');
const channel2 = supabase.channel('patients-detail');
// Evita conflitos
```

---

### Memory leak

```typescript
// Sempre fazer cleanup
useEffect(() => {
  const channel = supabase.channel('x').subscribe();
  
  return () => {
    channel.unsubscribe(); // ✅ IMPORTANTE!
  };
}, []);
```

---

## 📚 EXEMPLOS PRÁTICOS

### Exemplo 1: Dashboard de Risco com Real-time

```typescript
function RiskStratificationPage({ patientId }) {
  // Query com cache
  const { data: assessments, isLoading } = useRiskAssessments(patientId);
  
  // Real-time updates
  useRealtimeSubscription({
    table: 'risk_assessments',
    filter: `patient_id=eq.${patientId}`,
    queryKey: riskKeys.list(patientId),
  });
  
  // Alertas em tempo real
  useRealtimeRiskAlerts(patientId);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>Avaliações de Risco</h1>
      {assessments.map(a => (
        <AssessmentCard key={a.id} data={a} />
      ))}
    </div>
  );
}
```

**Resultado:**
- ✅ Carrega do cache (instantâneo)
- ✅ Atualiza em tempo real quando novos dados
- ✅ Notificações automáticas para alertas críticos

---

### Exemplo 2: Portal da Família com Chat

```typescript
function FamilyPortalPage({ patientId }) {
  const { user } = useAuth();
  const { data: messages } = useFamilyMessages(patientId);
  
  // Real-time para mensagens
  useRealtimeSubscription({
    table: 'family_messages',
    filter: `patient_id=eq.${patientId}`,
    queryKey: familyKeys.messages(patientId),
  });
  
  // Real-time para notificações
  useFamilyRealtimeNotifications(user.id);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h2>Relatórios</h2>
        {/* ... */}
      </div>
      <div>
        <h2>Chat com Terapeuta</h2>
        <RealtimeChat 
          roomId={`family-${patientId}`}
          userId={user.id}
          userName={user.name}
        />
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Chat instantâneo
- ✅ Notificações de novas mensagens
- ✅ Ver quando terapeuta responde
- ✅ Indicador de "online"

---

### Exemplo 3: Quality Dashboard com Eventos ao Vivo

```typescript
function QualityDashboard() {
  const { data: metrics } = useQualityMetrics();
  const { data: safetyEvents } = useSafetyEvents();
  
  // Updates em tempo real
  useRealtimeSubscription({
    table: 'quality_metrics',
    queryKey: qualityKeys.metrics(),
  });
  
  // Alertas de segurança
  useRealtimeSafetyEvents();
  
  // Indicador de presença
  const { user } = useAuth();
  
  return (
    <div>
      <header>
        <h1>Quality Assurance</h1>
        <OnlineIndicator 
          roomName="quality-team"
          userId={user.id}
          userName={user.name}
        />
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        <MetricsPanel data={metrics} />
        <SafetyEventsPanel data={safetyEvents} />
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] ✅ Hook genérico de subscription criado
- [x] ✅ Hook de Presence criado
- [x] ✅ Hook de Broadcast criado
- [x] ✅ Hooks especializados para notificações
- [x] ✅ Componente de Chat criado
- [x] ✅ Componente de Online Indicator criado
- [x] ✅ Migration SQL para habilitar realtime
- [x] ✅ RLS policies configuradas
- [x] ✅ Integração com React Query
- [x] ✅ Cleanup automático
- [x] ✅ Type-safe
- [x] ✅ Documentação completa

---

## 🎉 CONCLUSÃO

Sistema de Realtime implementado com sucesso!

**Features implementadas:**
- ✅ Subscriptions automáticas
- ✅ Notificações instantâneas
- ✅ Chat em tempo real
- ✅ Indicadores de presença
- ✅ Broadcast de mensagens
- ✅ Integração perfeita com React Query

**Benefícios:**
- ⚡ Dados sempre atualizados
- 👥 Colaboração real-time
- 🔔 Notificações instantâneas
- 💬 Chat integrado
- 👀 Status de presença

---

**Criado em:** 08 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ IMPLEMENTADO

🚀 **Fase 2.2 COMPLETA!**


