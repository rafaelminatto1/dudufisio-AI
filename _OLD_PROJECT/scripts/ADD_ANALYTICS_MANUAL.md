# 📊 Como Adicionar Analytics Manualmente

Se o script automático não funcionar, siga estas instruções:

## 1. Instalar Pacotes

```bash
npm install @vercel/analytics @vercel/speed-insights
```

## 2. Modificar App.tsx

### Adicionar Imports

Adicione no topo do arquivo `App.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
```

### Adicionar Componentes

Antes do fechamento do JSX principal, adicione:

```typescript
export default function App() {
  return (
    <>
      {/* Seu conteúdo existente */}
      <Router>
        {/* ... */}
      </Router>
      
      {/* Adicionar aqui ⬇️ */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

## Exemplo Completo

```typescript
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <>
      <Router>
        <YourAppContent />
      </Router>
      
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

## 3. Testar Localmente

```bash
npm run dev
```

Verifique no console se não há erros.

## 4. Deploy

```bash
vercel --prod
```

## 5. Verificar no Dashboard

Após deploy, acesse:
- **Analytics:** https://vercel.com/rafael-minattos-projects/dudufisio-ai/analytics
- **Speed Insights:** https://vercel.com/rafael-minattos-projects/dudufisio-ai/speed-insights

Dados começarão a aparecer após alguns usuários visitarem o site.

---

## Troubleshooting

### Erro: Module not found

```bash
# Reinstalar pacotes
npm install @vercel/analytics @vercel/speed-insights --save

# Limpar cache
rm -rf node_modules/.vite
npm run dev
```

### Analytics não aparecem no dashboard

- Aguarde 5-10 minutos após primeiro acesso
- Verifique se está na versão de produção
- Confirme que os componentes estão renderizando (use React DevTools)

---

✅ Pronto! Seu app agora tem Analytics e Speed Insights configurados.

