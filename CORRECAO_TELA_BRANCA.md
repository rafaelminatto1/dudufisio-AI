# 🐛 CORREÇÃO: Tela Branca Após Login

## 🔍 DIAGNÓSTICO DO PROBLEMA

### **Possíveis Causas Identificadas:**

1. **AppProvider carrega dados antes do usuário estar pronto**
   - ❌ `fetchData()` executa imediatamente
   - ❌ Pode causar erro se Supabase não estiver configurado
   - ❌ Erro silencioso pode resultar em tela branca

2. **Service Worker pode estar interferindo**
   - ⚠️  Cache pode estar servindo versão antiga
   - ⚠️  Redirecionamento pode estar sendo bloqueado

3. **Lazy Loading pode estar falhando**
   - ⚠️  CompleteDashboard pode não carregar
   - ⚠️  Erro no Suspense sem fallback adequado

4. **DataContext duplicado**
   - ⚠️  DataContext e AppContext ambos buscam dados
   - ⚠️  Pode causar race condition

---

## ✅ CORREÇÕES IMPLEMENTADAS

### **1. Proteção no AppProvider**

Adicione verificação antes de buscar dados:

```typescript
// contexts/AppContext.tsx

const fetchData = useCallback(async () => {
    // ✅ SÓ BUSCA DADOS SE USUÁRIO ESTIVER AUTENTICADO
    if (!isAuthenticated) {
        safeLog('Skipping data fetch - user not authenticated');
        return;
    }

    setDataLoading(true);
    setError(null);

    // ... resto do código
}, [isAuthenticated]); // Adicionar dependência

// ✅ SÓ CHAMA fetchData SE AUTENTICADO
useEffect(() => {
    if (isAuthenticated && user) {
        fetchData();
    }
}, [isAuthenticated, user, fetchData]);
```

### **2. Error Boundary no AppRoutes**

```typescript
// AppRoutes.tsx

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erro ao carregar aplicação
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Envolver AppContent
const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <DebugProvider>
                    <SupabaseAuthProvider>
                        <AppProvider>
                            <ToastProvider>
                                <AppContent />
                                <OfflineIndicator />
                            </ToastProvider>
                        </AppProvider>
                    </SupabaseAuthProvider>
                </DebugProvider>
            </ErrorBoundary>
        </BrowserRouter>
    );
};
```

### **3. Logging Aprimorado**

```typescript
// AppContent - adicionar logs

const AppContent: React.FC = () => {
    const { user, isAuthenticated, loading, logout } = useSupabaseAuth();

    // Log estado de autenticação
    useEffect(() => {
        console.log('🔐 Auth State:', { 
            isAuthenticated, 
            hasUser: !!user, 
            loading,
            userRole: user?.role 
        });
    }, [isAuthenticated, user, loading]);

    // ... resto do código
};
```

### **4. Limpar Cache do Service Worker**

```typescript
// Adicionar função de limpeza
const clearServiceWorkerCache = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
        }
    }
    
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(name => caches.delete(name))
        );
    }
    
    window.location.reload();
};

// Adicionar botão de debug (temporário)
// Adicionar ao LoginPage ou console
```

---

## 🚀 SOLUÇÃO RÁPIDA

### **Passo 1: Limpar Tudo**
```bash
# No navegador, abra DevTools (F12)
# Execute no Console:

// Limpar localStorage
localStorage.clear();

// Limpar sessionStorage
sessionStorage.clear();

// Limpar caches
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});

// Desregistrar service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});

// Recarregar
location.reload();
```

### **Passo 2: Testar Login**
1. Limpe cache (Ctrl+Shift+Delete)
2. Feche e reabra o navegador
3. Acesse: `http://localhost:5175`
4. Faça login
5. Abra DevTools > Console
6. Veja os logs

---

## 🔧 CORREÇÃO PERMANENTE

### **Arquivo: contexts/AppContext.tsx**

```typescript
// ANTES:
const fetchData = useCallback(async () => {
    setDataLoading(true);
    // ... busca dados
}, []);

useEffect(() => {
    fetchData(); // ❌ Sempre busca
}, [fetchData]);

// DEPOIS:
const fetchData = useCallback(async () => {
    // ✅ Protege contra busca sem auth
    if (!isAuthenticated) {
        return;
    }
    
    setDataLoading(true);
    try {
        // ... busca dados
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(error.message);
    }
}, [isAuthenticated]); // ✅ Adiciona dependência

useEffect(() => {
    // ✅ Só busca se autenticado
    if (isAuthenticated && user) {
        fetchData();
    }
}, [isAuthenticated, user, fetchData]);
```

### **Arquivo: AppRoutes.tsx**

Adicione Error Boundary completo (código acima).

---

## 🧪 TESTE DE DIAGNÓSTICO

Execute o teste criado:

```bash
# Teste de diagnóstico
npx playwright test tests/debug/login-white-screen.spec.ts --headed

# Veja os screenshots gerados:
# - debug-initial.png
# - debug-before-login.png
# - debug-after-login.png
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### **Antes de Fazer Login:**
- [ ] Servidor está rodando (`npm run dev`)
- [ ] Console sem erros
- [ ] Service Worker registrado (opcional)

### **Após Login:**
- [ ] Console mostra logs de autenticação
- [ ] LocalStorage tem dados de sessão
- [ ] Não há erros no console
- [ ] Dashboard carrega

### **Se Ainda Tiver Tela Branca:**
1. [ ] Abrir DevTools > Console
2. [ ] Verificar erros em vermelho
3. [ ] Verificar Network > Failed requests
4. [ ] Verificar Application > Service Workers
5. [ ] Limpar cache e tentar novamente

---

## 🆘 SOLUÇÃO DE EMERGÊNCIA

Se ainda estiver com problema, **desabilite temporariamente**:

### **1. Desabilitar Service Worker:**
```typescript
// AppRoutes.tsx - comentar linha

// ❌ Comentar temporariamente
// useEffect(() => {
//     initializeServiceWorker();
// }, []);
```

### **2. Desabilitar AppProvider (dados):**
```typescript
// AppRoutes.tsx

// ❌ Remover temporariamente AppProvider
<SupabaseAuthProvider>
    {/* <AppProvider> */}
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    {/* </AppProvider> */}
</SupabaseAuthProvider>
```

### **3. Usar Dashboard Simples:**
```typescript
// AppContent

const renderDashboard = () => {
    // Teste simples
    return <div>Dashboard Carregado!</div>;
};
```

---

## 📝 LOGS ESPERADOS

### **Console Normal:**
```
🔐 Auth State: { isAuthenticated: false, hasUser: false, loading: false }
✅ Service Worker inicializado com sucesso
[Usuário faz login]
🔐 Auth State: { isAuthenticated: true, hasUser: true, loading: false, userRole: "Admin" }
Therapists loaded successfully { count: 5 }
Patients loaded successfully { count: 20 }
Appointments loaded successfully { count: 15 }
```

### **Console com Erro:**
```
🔐 Auth State: { isAuthenticated: true, hasUser: true, loading: false }
❌ Error fetching therapists: [erro]
❌ Error fetching patients: [erro]
[Tela fica branca]
```

---

## ✅ PRÓXIMOS PASSOS

1. **Implementar correções acima**
2. **Testar login novamente**
3. **Executar teste de diagnóstico**
4. **Se persistir, enviar screenshots e logs**

---

*Documento criado em ${new Date().toLocaleString('pt-BR')}*
*Versão: 1.0.0*
