# 🔧 Correções do Service Worker - DuduFisio-AI

## 📋 Resumo dos Problemas Identificados

### 1. **Erro: `process is not defined`**
**Localização:** `public/sw.js` linhas 344 e 353

**Causa:** O Service Worker estava tentando usar `process.env.NODE_ENV`, mas a variável `process` não está disponível no contexto do Service Worker. Essa variável só funciona no código principal processado pelo Vite.

**Solução:** Removidas todas as referências a `process.env` do Service Worker, pois não são necessárias. Os erros de cache são tratados silenciosamente.

---

### 2. **Erro: `Failed to fetch` para `index.tsx`**
**Localização:** `public/sw.js` linha 144

**Causa:** O Service Worker estava interceptando arquivos de desenvolvimento do Vite (`.tsx`, `.ts`, `.jsx`, `.js`) e tentando fazer fetch deles, causando erros de conexão.

**Solução:** Adicionada verificação para **pular** (skip) todos os arquivos de desenvolvimento:
- Arquivos `.tsx`, `.ts`, `.jsx`, `.js`
- Requisições para `node_modules`
- Requisições do HMR (`@react-refresh`, `@vite`, etc.)

---

### 3. **Erro 500 no `@react-refresh`**
**Localização:** `public/sw.js` - interceptação de requisições HMR

**Causa:** O Service Worker estava tentando interceptar e fazer cache de requisições do Hot Module Replacement (HMR) do Vite, causando erros 500.

**Solução:** Adicionada verificação específica para pular requisições do HMR:
```javascript
url.pathname.includes('/@react-refresh')
```

---

## 🔨 Correções Aplicadas

### 1. Filtro de Requisições Melhorado (linhas 87-101)
```javascript
// Skip Vite HMR and dev server special requests
if (url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@id/') ||
    url.pathname.includes('/@react-refresh') ||  // ✅ NOVO
    url.pathname.includes('/__vite') ||
    url.pathname.includes('node_modules') ||     // ✅ NOVO
    url.pathname.endsWith('.tsx') ||             // ✅ NOVO
    url.pathname.endsWith('.ts') ||              // ✅ NOVO
    url.pathname.endsWith('.jsx') ||             // ✅ NOVO
    url.pathname.endsWith('.js') ||              // ✅ NOVO
    url.search.includes('?v=') ||
    url.search.includes('html-proxy') ||
    url.search.includes('direct')) {
  return; // ✅ Deixa o navegador lidar com essas requisições
}
```

### 2. Remoção de Referências a `process.env` (linhas 339-350)
```javascript
// ANTES:
if (process.env.NODE_ENV === 'development') {
  console.warn('Cache put error:', err.message);
}

// DEPOIS:
.catch(() => {
  // Silently fail cache writes - not critical
  // (process.env não disponível em Service Workers)
});
```

### 3. Simplificação da Estratégia de Fetch (linhas 133-150)
Removida a lógica que tentava interceptar arquivos de módulo, já que agora eles são filtrados antes:
```javascript
// ANTES: tinha lógica específica para .tsx, .ts, .jsx, .js
// DEPOIS: apenas 3 estratégias simples
if (url.pathname.includes('/api/')) {
  event.respondWith(networkFirstStrategy(request));
} else if (ESSENTIAL_RESOURCES.includes(url.pathname)) {
  event.respondWith(cacheFirstStrategy(request));
} else {
  event.respondWith(staleWhileRevalidateStrategy(request));
}
```

### 4. Tratamento de Erros Silencioso (linha 372)
```javascript
} catch (error) {
  // Silently fail - don't log errors that might spam the console
  return new Response('Internal Error', {
    status: 500,
    statusText: 'Internal Server Error',
    headers: { 'Content-Type': 'text/plain' }
  });
}
```

---

## 🚀 Como Aplicar as Correções

### Opção 1: Desregistrar e Recarregar (Recomendado)
1. Abra o DevTools (F12)
2. Vá para a aba **Application** → **Service Workers**
3. Clique em **Unregister** no Service Worker registrado
4. Vá para **Application** → **Storage** → **Clear site data**
5. Recarregue a página (Ctrl+R)

### Opção 2: Usar o Script de Desregistro
1. Abra o console do navegador (F12)
2. Execute:
```javascript
// Copie e cole o conteúdo de public/unregister-sw.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(() => {
        console.log('✅ Service Worker desregistrado');
      });
    });
  });
  
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName).then(() => {
          console.log('✅ Cache limpo:', cacheName);
        });
      });
    });
  }
}
```
3. Recarregue a página (Ctrl+R)

### Opção 3: Hard Refresh
- **Chrome/Edge:** Ctrl+Shift+R ou Ctrl+F5
- **Firefox:** Ctrl+Shift+R
- **Safari:** Cmd+Shift+R

---

## ✅ Resultado Esperado

Após aplicar as correções, você deve ver no console:

```
🚀 Service Worker DuduFisio-AI carregado
```

**SEM** os seguintes erros:
- ❌ `process is not defined`
- ❌ `Failed to fetch` para `index.tsx`
- ❌ `ERR_CONNECTION_REFUSED`
- ❌ `ERR_FAILED`
- ❌ Erro 500 no `@react-refresh`

---

## 🧪 Testando

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:5176`

3. Abra o DevTools (F12) e verifique a aba **Console**

4. Você deve ver apenas:
```
🚀 Service Worker DuduFisio-AI carregado
```

5. Teste a funcionalidade do HMR (Hot Module Replacement):
   - Faça uma alteração em qualquer arquivo `.tsx`
   - O Vite deve recarregar automaticamente sem erros

---

## 📝 Notas Importantes

### Por que o Service Worker não deve interceptar arquivos de desenvolvimento?

1. **Arquivos `.tsx`, `.ts`, `.jsx`, `.js`** são processados pelo Vite em tempo real
2. **HMR (`@react-refresh`)** precisa de conexão direta com o servidor de desenvolvimento
3. **Cache** desses arquivos pode causar problemas de atualização
4. **Service Workers** são ideais para **produção**, não para desenvolvimento

### O Service Worker deve ser usado apenas em produção?

**Não necessariamente!** O Service Worker pode ser útil em desenvolvimento para:
- Testar funcionalidades offline
- Testar push notifications
- Testar background sync

Mas deve ser **configurado corretamente** para não interferir com o servidor de desenvolvimento do Vite.

---

## 🔍 Verificação Adicional

Se os erros persistirem após as correções:

1. **Limpe o cache do navegador completamente:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files

2. **Verifique se há múltiplos Service Workers registrados:**
   - DevTools → Application → Service Workers
   - Desregistre todos

3. **Verifique a versão do Service Worker:**
   - O arquivo `sw.js` deve ter a versão `CACHE_NAME = 'dudufisio-ai-v1.1.0'`

4. **Teste em modo anônimo:**
   - Isso garante que não há cache ou Service Workers antigos

---

## 📚 Referências

- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite - Service Workers](https://vitejs.dev/guide/features.html#service-workers)
- [Workbox - Service Worker Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)

---

**Data da correção:** 2024-12-19  
**Versão do Service Worker:** v1.1.0  
**Status:** ✅ Corrigido


