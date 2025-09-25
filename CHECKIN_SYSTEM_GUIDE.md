# 🏥 FisioFlow - Sistema de Check-in Inteligente e Portal do Paciente

## 📋 Visão Geral

Este é um sistema completo de check-in inteligente com reconhecimento facial, portal do paciente e funcionalidades offline-first para clínicas de fisioterapia.

### ✨ Principais Funcionalidades

- 🔮 **Check-in Inteligente com Reconhecimento Facial**
- 📱 **Portal do Paciente Mobile-First**
- 🏃‍♀️ **Sistema de Fila com Priorização**
- 📊 **Analytics e Métricas em Tempo Real**
- 🔔 **Notificações Push Inteligentes**
- 💾 **Funcionalidade Offline-First**
- 🖥️ **Interface Tablet para Kiosk**
- 🏥 **Triagem de Saúde Automatizada**

## 🚀 Instalação e Setup

### 1. Instalar Dependências

```bash
# Instalar dependências principais
npm install

# Instalar dependências específicas para o sistema de check-in
npm install @supabase/supabase-js
npm install lucide-react
npm install framer-motion
npm install recharts
```

### 2. Configuração do Banco de Dados

Execute a migration do Supabase:

```bash
# Aplicar schema do sistema de check-in
supabase migration up --file 20250924000000_create_checkin_system_schema.sql
```

### 3. Configuração Inicial

Crie um arquivo `.env.local` com as configurações:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Reconhecimento Facial (opcional)
FACE_RECOGNITION_API_KEY=your_api_key

# Notificações Push
FCM_SERVER_KEY=your_fcm_server_key
FCM_PROJECT_ID=your_project_id
VAPID_KEY=your_vapid_key

# APNS (iOS)
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_BUNDLE_ID=your_bundle_id
```

## 🎯 Como Usar

### 1. Inicialização do Sistema

```typescript
import { CheckInSystem, defaultCheckInConfig } from './lib/checkin/CheckInSystem';

// Configuração personalizada
const customConfig = {
  ...defaultCheckInConfig,
  faceRecognition: {
    apiKey: process.env.FACE_RECOGNITION_API_KEY || 'mock-key',
    confidenceThreshold: 0.85,
    maxFaces: 1
  },
  notifications: {
    fcm: {
      serverKey: process.env.FCM_SERVER_KEY || '',
      projectId: process.env.FCM_PROJECT_ID || '',
      vapidKey: process.env.VAPID_KEY || ''
    }
  }
};

// Inicializar o sistema
const checkInSystem = new CheckInSystem(customConfig);
await checkInSystem.initialize();
```

### 2. Processamento de Check-in

```typescript
import { CheckInData, DeviceId } from './types/checkin';

// Dados do check-in
const checkInData: CheckInData = {
  deviceId: 'tablet-recepcao-01' as DeviceId,
  photo: capturedImageData, // Opcional - para reconhecimento facial
  searchCriteria: {
    name: 'João Silva',
    phoneNumber: '+5511999999999'
  },
  healthAnswers: {
    hasSymptoms: false,
    symptoms: [],
    temperature: 36.5,
    hasBeenExposed: false,
    isVaccinated: true
  },
  printReceipt: true
};

// Processar check-in
const result = await checkInSystem.processCheckIn(checkInData);

if (result.success) {
  console.log('✅ Check-in realizado:', result.checkIn);
  // Paciente foi adicionado à fila
} else {
  console.error('❌ Erro no check-in:', result.error);
}
```

### 3. Portal do Paciente

```typescript
// Obter dashboard do paciente
const dashboard = await checkInSystem.getPatientDashboard('patient-123');

// Obter linha do tempo do tratamento
const timeline = await checkInSystem.getTreatmentTimeline('patient-123');

// Obter métricas de aderência aos exercícios
const adherence = await checkInSystem.getExerciseAdherence('patient-123', 30);
```

### 4. Sistema de Notificações

```typescript
// Registrar dispositivo para notificações
await checkInSystem.registerDeviceForNotifications(
  'patient-123',
  'device-token-here',
  'android'
);

// Enviar notificação personalizada
await checkInSystem.sendCustomNotification(
  'patient-123',
  'Lembrete de Exercício',
  'Não se esqueça de fazer seus exercícios hoje!',
  { deepLink: '/exercises' }
);
```

### 5. Gerenciamento de Fila

```typescript
// Obter status da fila
const queueStatus = await checkInSystem.getQueueStatus();

// Processar próximo paciente
const nextPatient = await checkInSystem.processNextPatient();

if (nextPatient) {
  console.log('Próximo paciente:', nextPatient.patientId);
}
```

### 6. Analytics e Métricas

```typescript
// Métricas de check-in
const metrics = await checkInSystem.getCheckInMetrics(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

// Métricas de performance
const performance = await checkInSystem.getPerformanceMetrics(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

// Estatísticas em tempo real
const realTimeStats = checkInSystem.getRealTimeStats();
console.log('Check-ins ativos:', realTimeStats.activeCheckIns);
```

## 🎨 Componentes React

### 1. Dashboard do Paciente

```tsx
import { PatientDashboard } from './components/patient-portal/PatientDashboard';

function PatientPortalPage() {
  return (
    <div>
      <h1>Meu Portal</h1>
      <PatientDashboard patientId="patient-123" />
    </div>
  );
}
```

### 2. Interface de Check-in para Tablet

```typescript
import { TabletInterface } from './lib/checkin/devices/TabletInterface';

// Configuração do tablet
const tabletConfig = {
  deviceId: 'tablet-01' as DeviceId,
  camera: {
    resolution: { width: 1280, height: 720 },
    facingMode: 'user' as const,
    autoFocus: true
  },
  printer: {
    type: 'thermal' as const,
    connectionType: 'usb' as const
  },
  checkIn: {
    faceRecognitionEnabled: true,
    healthScreeningRequired: true,
    queueManagementEnabled: true
  }
};

const tablet = new TabletInterface(tabletConfig, checkInEngine);
await tablet.initializeKiosk();
```

## 🔧 Configurações Avançadas

### 1. Reconhecimento Facial

```typescript
// Cadastrar rosto do paciente
const enrollmentResult = await checkInSystem.enrollPatientFace(
  'patient-123',
  imageData
);

if (enrollmentResult.success) {
  console.log('Rosto cadastrado com qualidade:', enrollmentResult.qualityScore);
}
```

### 2. Sistema Offline

```typescript
// Forçar sincronização
await checkInSystem.forceSync();

// Verificar status de sincronização
const syncStatus = checkInSystem.getSyncStatus();
console.log('Itens pendentes:', syncStatus.pendingItems);
```

### 3. Health Check do Sistema

```typescript
// Verificar saúde do sistema
const healthCheck = await checkInSystem.performHealthCheck();

if (healthCheck.status === 'healthy') {
  console.log('✅ Sistema funcionando perfeitamente');
} else {
  console.warn('⚠️ Sistema com problemas:', healthCheck.checks);
}
```

## 📊 Monitoramento e Métricas

### Dashboard de Analytics

O sistema coleta automaticamente:

- **Check-ins por método** (facial, manual, QR code)
- **Tempos de processamento**
- **Taxa de sucesso do reconhecimento facial**
- **Padrões de uso por horário/dia**
- **Eficiência da fila**
- **Métricas de notificação**

### Exportação de Dados

```typescript
// Exportar dados para análise externa
const analyticsData = await checkInSystem.getCheckInMetrics(startDate, endDate);

// Em formato CSV
const csvData = await analytics.exportData(
  { start: startDate, end: endDate },
  'csv'
);
```

## 🔐 Segurança e Privacidade

### Criptografia de Dados Biométricos

- **Encodings faciais** são criptografados antes do armazenamento
- **Chaves de criptografia** rotacionadas periodicamente
- **Checksums** para verificação de integridade
- **Logs de auditoria** para todas as operações sensíveis

### RLS (Row Level Security)

- Pacientes só podem acessar seus próprios dados
- Staff tem acesso baseado em função
- Dados biométricos restritos a administradores
- Logs de analytics anonimizados

## 🐛 Troubleshooting

### Problemas Comuns

1. **Reconhecimento facial não funciona**
   ```bash
   # Verificar se a câmera está funcionando
   # Verificar qualidade da imagem (> 0.7)
   # Verificar iluminação adequada
   ```

2. **Sistema offline não sincroniza**
   ```typescript
   // Verificar conexão
   const syncStatus = checkInSystem.getSyncStatus();

   // Limpar fila offline se necessário
   await offlineManager.clearOfflineQueue();
   ```

3. **Notificações não chegam**
   ```typescript
   // Verificar tokens de dispositivo
   const notifStats = notificationService.getStats();
   console.log('Tokens ativos:', notifStats.activeTokens);
   ```

### Logs de Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem('DEBUG_CHECKIN', 'true');

// Verificar status geral
const systemStatus = checkInSystem.getSystemStatus();
console.log('Status do sistema:', systemStatus);
```

## 📝 Próximos Passos

### Para Implementar em Produção:

1. **Configure APIs reais**:
   - Substitua os mocks por APIs de reconhecimento facial reais
   - Configure FCM/APNS para notificações
   - Integre com sistema de agendamentos existente

2. **Customize a UI**:
   - Adapte cores e branding da clínica
   - Personalize fluxo de check-in conforme necessário
   - Configure tablets em modo kiosk

3. **Setup de Monitoramento**:
   - Configure alertas para falhas críticas
   - Setup de backup automático
   - Monitoramento de performance

4. **Treinamento da Equipe**:
   - Treine recepcionistas no novo sistema
   - Configure procedimentos de emergência
   - Documente workflows específicos

### Recursos Adicionais:

- **Integração com calendários** (Google Calendar, Outlook)
- **Sistema de pagamentos** integrado
- **Telemedicina** para consultas remotas
- **IA avançada** para previsão de tempos de espera
- **Integração com wearables** para monitoramento contínuo

---

## 💡 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do sistema
2. Execute o health check
3. Consulte a documentação de troubleshooting
4. Entre em contato com a equipe de suporte técnico

**Sistema desenvolvido com ❤️ para revolucionar a experiência do paciente em clínicas de fisioterapia.**