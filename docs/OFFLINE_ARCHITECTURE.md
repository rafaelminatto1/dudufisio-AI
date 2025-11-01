# 🌐 Arquitetura Offline - DuduFisio-AI

> **Documentação Técnica Completa do Sistema Offline**
> 
> Versão: 2.0 (Refatoração Robusta)
> 
> Data: Novembro 2024

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes Principais](#componentes-principais)
4. [Fluxos de Dados](#fluxos-de-dados)
5. [Guia de Uso](#guia-de-uso)
6. [Troubleshooting](#troubleshooting)
7. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

### Objetivo

Fornecer uma experiência confiável e sem interrupções para os usuários, mesmo quando a conexão de internet é instável ou inexistente.

### Princípios de Design

✅ **Robustez**: Sistema nunca quebra a aplicação
✅ **Transparência**: Usuário sempre sabe o que está acontecendo
✅ **Recuperação**: Falhas são tratadas e recuperadas automaticamente
✅ **Performance**: Mínimo impacto no carregamento e uso

### Características

- 🔄 **Sincronização Automática**: Dados são sincronizados quando conexão retorna
- 📦 **Fila de Operações**: Ações offline são enfileiradas e processadas
- 🛡️ **Proteção contra Falhas**: Error boundaries múltiplos
- 📊 **Feedback Visual**: Indicadores claros de status
- 🔍 **Monitoramento**: Logging detalhado para debugging

---

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                     App.tsx                          │
│          (ErrorBoundary + QueryClient)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              ProviderErrorBoundary                   │
│         (Captura erros de providers)                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            SafeOfflineProvider                       │
│    (Provider offline robusto - SEMPRE disponível)   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│             AppErrorBoundary                         │
│        (Captura erros da aplicação)                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│           Outros Providers                           │
│  (Auth, Patient, Exercise, Toast, etc)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│             App Content                              │
│          (Rotas e Componentes)                      │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│        UnifiedOfflineIndicator                       │
│       (UI de status e sincronização)                │
└─────────────────────────────────────────────────────┘
```

### Hierarquia de Providers (CRÍTICA!)

A ordem dos providers é **crucial** para o funcionamento correto:

1. **ProviderErrorBoundary** - Top-level, captura erros de providers
2. **SafeOfflineProvider** - Provider offline FORA do AppErrorBoundary
3. **AppErrorBoundary** - Captura erros da aplicação
4. **Demais providers** - Aninhados normalmente

**⚠️ IMPORTANTE**: O `SafeOfflineProvider` DEVE estar fora do `AppErrorBoundary` para garantir que sempre esteja disponível.

---

## 🧩 Componentes Principais

### 1. SafeOfflineContext

**Arquivo**: `contexts/SafeOfflineContext.tsx`

**Responsabilidade**: Context robusto que nunca falha.

**Features**:
- Try-catch em todas as operações
- Valores fallback seguros
- Logging detalhado
- Recuperação automática

**Exports**:
```typescript
// Hook seguro - nunca lança erro
useSafeOffline()

// Hook estrito - lança erro se fora do provider
useOfflineStrict()
```

**Exemplo de Uso**:
```tsx
import { useSafeOffline } from '@/contexts/SafeOfflineContext';

function MyComponent() {
  const { isOnline, sync, pendingCount } = useSafeOffline();
  
  if (!isOnline) {
    return <OfflineMessage />;
  }
  
  return <div>Pendentes: {pendingCount}</div>;
}
```

---

### 2. UnifiedOfflineIndicator

**Arquivo**: `components/offline/UnifiedOfflineIndicator.tsx`

**Responsabilidade**: UI unificada para status offline.

**Substitui**:
- ❌ `components/OfflineIndicator.tsx`
- ❌ `components/OfflineNotification.tsx`
- ❌ `components/offline/OfflineIndicator.tsx`

**Features**:
- Indicador de offline
- Notificação de conexão restaurada
- Status de sincronização
- Contador de itens pendentes/falhos
- Ações manuais (sincronizar, retentar)

**Props**:
```typescript
interface UnifiedOfflineIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center';
  showSyncDetails?: boolean;
  autoHideOnlineDelay?: number;
  className?: string;
}
```

**Exemplo de Uso**:
```tsx
import UnifiedOfflineIndicator from '@/components/offline/UnifiedOfflineIndicator';

function App() {
  return (
    <>
      <AppContent />
      <UnifiedOfflineIndicator 
        position="bottom-right"
        showSyncDetails 
      />
    </>
  );
}
```

---

### 3. Service Worker Unificado

**Arquivo**: `lib/serviceWorker.ts`

**Responsabilidade**: Gerenciamento unificado de service worker.

**Consolida**:
- ✅ `lib/serviceWorkerRegistration.ts`
- ✅ `lib/registerSW.ts`

**Principais Funções**:
```typescript
// Registrar SW
registerServiceWorker(config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null>

// Desregistrar SW
unregisterServiceWorker(): Promise<boolean>

// Atualizar SW
updateServiceWorker(skipWaiting?: boolean, reload?: boolean): Promise<void>

// Obter status
getServiceWorkerStatus(): Promise<ServiceWorkerStatus>

// Limpar cache
clearServiceWorkerCache(): Promise<boolean>

// Verificar se é PWA
isPWA(): boolean

// Setup de instalação
setupInstallPrompt(onInstallable?, onInstalled?): void
```

**Exemplo de Uso**:
```typescript
import { registerServiceWorker } from '@/lib/serviceWorker';

registerServiceWorker({
  onSuccess: (reg) => console.log('SW registered'),
  onUpdate: (reg) => console.log('Update available'),
  onError: (error) => console.error('SW error', error),
  enablePeriodicUpdates: true,
});
```

---

### 4. Hooks Unificados

**Arquivo**: `hooks/useOnlineStatus.ts`

**Principais Hooks**:

#### `useOnlineStatus()`
Hook principal que integra com SafeOfflineContext.

```typescript
const {
  isOnline,          // boolean
  isOffline,         // boolean
  wasOffline,        // boolean
  isSyncing,         // boolean
  queueSize,         // number
  pendingCount,      // number
  failedCount,       // number
  sync,              // () => Promise<void>
  retryFailed,       // () => Promise<void>
  hasError,          // boolean
} = useOnlineStatus();
```

#### `useServiceWorker()`
Hook para gerenciar service worker.

```typescript
const {
  registered,        // boolean
  active,            // boolean
  waiting,           // boolean
  installing,        // boolean
  updateAvailable,   // boolean
  showUpdatePrompt,  // boolean
  update,            // () => Promise<void>
  dismissUpdate,     // () => void
} = useServiceWorker();
```

#### `usePushNotifications()`
Hook para notificações push.

```typescript
const {
  permission,        // NotificationPermission
  isSubscribed,      // boolean
  isSupported,       // boolean
  requestPermission, // () => Promise<NotificationPermission>
} = usePushNotifications();
```

---

### 5. Error Boundaries

#### ProviderErrorBoundary

**Arquivo**: `components/ProviderErrorBoundary.tsx`

**Responsabilidade**: Capturar erros em providers sem quebrar aplicação.

**Features**:
- UI de fallback informativa
- Recuperação automática (configurável)
- Telemetria para Sentry
- Botões de ação (recarregar, limpar cache)

**Props**:
```typescript
interface ProviderErrorBoundaryProps {
  children: ReactNode;
  providerName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRecoveryAttempts?: number;
  fallback?: ReactNode;
}
```

#### AppErrorBoundary

**Arquivo**: `AppRoutes.tsx`

**Responsabilidade**: Capturar erros gerais da aplicação.

**Mantido** para compatibilidade, mas agora está **dentro** do SafeOfflineProvider.

---

## 🔄 Fluxos de Dados

### Fluxo de Sincronização

```
1. Usuário realiza ação (ex: criar agendamento)
   │
   ▼
2. Verificar se online
   │
   ├─ Online: Enviar para API diretamente
   │
   └─ Offline: Adicionar à fila (syncQueue)
       │
       ▼
3. Ação salva em localStorage
       │
       ▼
4. Atualizar UI otimisticamente
       │
       ▼
5. Quando voltar online:
   │
   ├─ SafeOfflineContext detecta
   │
   ├─ Dispara sync()
   │
   ├─ syncQueue.processQueue()
   │
   ├─ Processa cada item da fila
   │
   └─ Remove itens bem-sucedidos
       │
       ▼
6. Notificar usuário (UnifiedOfflineIndicator)
```

### Fluxo de Erro

```
1. Erro ocorre em componente
   │
   ▼
2. Error Boundary mais próximo captura
   │
   ├─ ProviderErrorBoundary (se em provider)
   │   ├─ Log detalhado
   │   ├─ Enviar para Sentry
   │   ├─ Tentar recuperação automática
   │   └─ Mostrar UI de fallback
   │
   └─ AppErrorBoundary (se em aplicação)
       ├─ Log detalhado
       ├─ Enviar para Sentry
       └─ Mostrar UI de erro
```

---

## 📖 Guia de Uso

### Para Desenvolvedores

#### Adicionar nova ação offline

1. **Defina o tipo da ação em syncQueue**:
```typescript
// lib/offline/syncQueue.ts
type SyncItemType = 
  | 'create-appointment'
  | 'update-appointment'
  | 'sua-nova-acao'; // Adicione aqui
```

2. **Use addToQueue no seu componente**:
```typescript
import { syncQueue } from '@/lib/offline/syncQueue';
import { useSafeOffline } from '@/contexts/SafeOfflineContext';

function MyComponent() {
  const { isOnline } = useSafeOffline();

  const handleAction = async (data) => {
    if (isOnline) {
      // Online: enviar diretamente
      await api.post('/endpoint', data);
    } else {
      // Offline: adicionar à fila
      await syncQueue.addToQueue({
        type: 'sua-nova-acao',
        data,
        endpoint: '/endpoint',
        method: 'POST',
      });
    }
  };

  return <button onClick={handleAction}>Ação</button>;
}
```

3. **Implemente processamento no syncQueue**:
```typescript
// lib/offline/syncQueue.ts
async processItem(item: SyncQueueItem) {
  switch (item.type) {
    case 'sua-nova-acao':
      return await this.processSuaNovaAcao(item);
    // ...
  }
}

private async processSuaNovaAcao(item: SyncQueueItem) {
  // Lógica de processamento
  const response = await fetch(item.endpoint, {
    method: item.method,
    body: JSON.stringify(item.data),
  });
  
  if (!response.ok) {
    throw new Error('Falha ao processar');
  }
  
  return await response.json();
}
```

---

#### Usar indicador customizado

```tsx
import UnifiedOfflineIndicator from '@/components/offline/UnifiedOfflineIndicator';

function CustomLayout() {
  return (
    <div>
      <Header />
      <Content />
      <UnifiedOfflineIndicator 
        position="top-center"
        showSyncDetails={false}
        autoHideOnlineDelay={3000}
      />
    </div>
  );
}
```

---

#### Monitorar status em tempo real

```tsx
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function StatusBadge() {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    failedCount 
  } = useOnlineStatus();

  return (
    <div>
      <Badge color={isOnline ? 'green' : 'red'}>
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      
      {isSyncing && <Spinner />}
      
      {pendingCount > 0 && (
        <Badge>{pendingCount} pendentes</Badge>
      )}
      
      {failedCount > 0 && (
        <Badge color="red">{failedCount} falhos</Badge>
      )}
    </div>
  );
}
```

---

### Para QA/Testes

#### Testar modo offline

1. **Método 1: DevTools**
   - Abrir DevTools (F12)
   - Ir para aba "Network"
   - Selecionar "Offline" no dropdown

2. **Método 2: Sistema Operacional**
   - Desabilitar Wi-Fi/Ethernet
   - Aplicação deve detectar automaticamente

#### Validar comportamento esperado

✅ **Quando ficar offline**:
- Indicador aparece no canto inferior direito
- Mensagem "Você está offline"
- Ações devem adicionar à fila

✅ **Quando voltar online**:
- Notificação "Conexão restaurada"
- Sincronização automática inicia
- Itens da fila são processados
- Indicador mostra progresso

✅ **Se houver falhas**:
- Badge vermelho com número de falhas
- Botão "Retentar" disponível
- Detalhes do erro no console

---

## 🔍 Troubleshooting

### Problema: "useOffline must be used within OfflineProvider"

**Causa**: Componente tentando usar `useOffline` ou `useSafeOffline` antes do provider estar montado.

**Solução**:
1. Verificar hierarquia de providers em `AppRoutes.tsx`
2. Garantir que `SafeOfflineProvider` está envolvendo o componente
3. Usar `useSafeOffline` ao invés de `useOffline` (nunca lança erro)

---

### Problema: Indicador offline não aparece

**Possíveis Causas**:
1. `UnifiedOfflineIndicator` não está renderizado
2. Conflito de z-index
3. Provider offline com erro

**Diagnóstico**:
```javascript
// No console do navegador
console.log(navigator.onLine); // Deve retornar false quando offline

// Verificar se provider está funcionando
window.__offline_context_test = true;
```

**Solução**:
1. Verificar se `<UnifiedOfflineIndicator />` está no JSX
2. Verificar CSS (z-index deve ser 50+)
3. Verificar console por erros

---

### Problema: Sincronização não ocorre

**Diagnóstico**:
```javascript
// Verificar fila
const queue = await syncQueue.getQueue();
console.log('Itens na fila:', queue);

// Tentar sincronização manual
import { syncQueue } from './lib/offline/syncQueue';
await syncQueue.processQueue();
```

**Possíveis Causas**:
1. Erro na API
2. Itens com formato inválido
3. Network ainda offline

---

### Problema: Service Worker não registra

**Diagnóstico**:
```javascript
// Verificar suporte
console.log('SW supported:', 'serviceWorker' in navigator);

// Verificar registro
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Registration:', reg);
});
```

**Soluções**:
1. Verificar que `service-worker.js` existe em `/public`
2. Em dev, SW está desabilitado por padrão
3. Verificar console por erros de registro

---

## 🛠️ Manutenção

### Build e Deploy

```bash
# 1. Build com validação
npm run build

# 2. Validar build manualmente (opcional)
npm run validate

# 3. Preview local
npm run start

# 4. Deploy para Vercel
vercel --prod
```

### Checklist Pré-Deploy

- [ ] `npm run build` passou sem erros
- [ ] `npm run validate` passou sem erros
- [ ] Testado offline em ambiente de preview
- [ ] Service worker registra corretamente
- [ ] Indicador offline aparece quando offline
- [ ] Sincronização funciona ao voltar online
- [ ] Nenhum 404 de assets no console
- [ ] Lints resolvidos

### Monitoramento em Produção

**Logs Importantes**:
```
✅ SafeOfflineContext inicializado
✅ Service Worker registrado
🟢 Voltou online - Sincronizando...
🔴 Ficou offline - Modo offline ativado
```

**Métricas para Acompanhar**:
- Taxa de sincronização bem-sucedida
- Tempo médio de sincronização
- Número de itens falhados
- Erros capturados por error boundaries

---

## 📚 Referências

### Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `contexts/SafeOfflineContext.tsx` | Provider offline robusto |
| `components/offline/UnifiedOfflineIndicator.tsx` | UI de indicador |
| `components/ProviderErrorBoundary.tsx` | Error boundary para providers |
| `lib/serviceWorker.ts` | Service worker unificado |
| `hooks/useOnlineStatus.ts` | Hooks unificados |
| `lib/offline/syncQueue.ts` | Sistema de fila de sincronização |
| `scripts/validate-build.ts` | Validação de build |

### Documentação Externa

- [MDN: Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Workbox (Service Worker Library)](https://developers.google.com/web/tools/workbox)

---

## 🎓 Glossário

**Service Worker**: Script que roda em background, separado da página web, possibilitando funcionalidades offline.

**Sync Queue**: Fila de operações pendentes que aguardam sincronização com o servidor.

**Error Boundary**: Componente React que captura erros JavaScript em sua árvore de componentes filhos.

**Optimistic Update**: Atualizar UI imediatamente assumindo que operação será bem-sucedida, revertendo se falhar.

**PWA (Progressive Web App)**: Aplicação web que pode ser instalada e funcionar offline como app nativo.

---

## 📞 Suporte

Para dúvidas ou problemas relacionados ao sistema offline:

1. **Verificar troubleshooting** neste documento
2. **Consultar logs** no console do navegador
3. **Revisar código** dos componentes principais
4. **Abrir issue** com logs e steps to reproduce

---

**Última Atualização**: Novembro 2024
**Versão**: 2.0 (Refatoração Robusta)
**Mantenedor**: Equipe DuduFisio-AI

