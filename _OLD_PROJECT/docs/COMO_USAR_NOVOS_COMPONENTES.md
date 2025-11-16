# 🎨 Como Usar os Novos Componentes de Layout

## ✅ O que foi criado

### 1. ModernDashboard Component
**Arquivo:** `components/dashboard/ModernDashboard.tsx`

Dashboard completamente redesenhado com:
- ✨ Hero section com gradiente animado
- 📊 Cards de estatísticas com animações
- ⚡ Ações rápidas com hover effects
- 📅 Feed de atividades recentes
- 🎯 Próximas consultas

### 2. GradientCard Component
**Arquivo:** `components/ui/GradientCard.tsx`

Card com header gradiente:
- 🌈 Gradientes customizáveis
- ✨ Animação ao hover
- 🎨 Ícone opcional no header
- 📦 Flexível para qualquer conteúdo

### 3. StatisticCard Component
**Arquivo:** `components/ui/StatisticCard.tsx`

Card de estatística animado:
- 📈 Valor grande e destacado
- 🎯 Ícone animado (rotação no hover)
- 📊 Indicador de tendência (↑ ou ↓)
- 🎨 Gradiente customizável
- ✨ Animações suaves

---

## 🚀 Como Usar

### 1. Substituir Dashboard Atual

**Opção A: Substituir completamente**

Abra `pages/CompleteDashboard.tsx` e substitua o componente `DashboardContent`:

```typescript
// ADICIONAR NO IMPORT
import ModernDashboard from '../components/dashboard/ModernDashboard';

// SUBSTITUIR função DashboardContent
const DashboardContent = () => {
  const { user } = useSupabaseAuth();

  return (
    <ModernDashboard user={{
      name: user?.name || 'Profissional',
      role: user?.role || 'Admin'
    }} />
  );
};
```

**Opção B: Adicionar como nova rota**

```typescript
// Em CompleteDashboard.tsx
const ModernDashboardLazy = createLazyComponent(() =>
  import('../components/dashboard/ModernDashboard')
);

// Adicionar rota
<Route path="/modern-dashboard" element={LazyElement(ModernDashboardLazy, 'Dashboard Moderno')} />
```

### 2. Usar GradientCard em qualquer página

```typescript
import { GradientCard } from '@/components/ui/GradientCard';
import { Users } from 'lucide-react';

function MinhaPage() {
  return (
    <GradientCard
      title="Meus Pacientes"
      icon={Users}
      gradient="from-blue-500 to-cyan-500" // Opcional, cor padrão
    >
      <div>
        {/* Seu conteúdo aqui */}
      </div>
    </GradientCard>
  );
}
```

**Gradientes disponíveis:**
```typescript
// Azul
gradient="from-blue-500 to-cyan-500"

// Roxo
gradient="from-purple-500 to-pink-500"

// Verde
gradient="from-green-500 to-emerald-500"

// Laranja
gradient="from-yellow-500 to-orange-500"

// Vermelho
gradient="from-red-500 to-rose-500"

// Customizado
gradient="from-[#667eea] to-[#764ba2]"
```

### 3. Usar StatisticCard

```typescript
import { StatisticCard } from '@/components/ui/StatisticCard';
import { Users, Calendar, DollarSign } from 'lucide-react';

function MeusStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatisticCard
        title="Total de Pacientes"
        value="248"
        change="+12%"
        trend="up"
        icon={Users}
        gradient="from-blue-500 to-cyan-500"
      />

      <StatisticCard
        title="Consultas Hoje"
        value={12}
        change="+3"
        trend="up"
        icon={Calendar}
        gradient="from-purple-500 to-pink-500"
      />

      <StatisticCard
        title="Receita Mensal"
        value="R$ 45.2k"
        change="-5%"
        trend="down"
        icon={DollarSign}
        gradient="from-green-500 to-emerald-500"
      />
    </div>
  );
}
```

---

## 🎨 Customização

### Cores e Gradientes

Você pode criar gradientes customizados usando as cores do Tailwind:

```typescript
// Gradientes predefinidos no Tailwind
"from-slate-500 to-slate-700"
"from-gray-500 to-gray-700"
"from-zinc-500 to-zinc-700"
"from-neutral-500 to-neutral-700"
"from-stone-500 to-stone-700"

// Cores customizadas
"from-[#667eea] to-[#764ba2]"  // Gradient roxo/violeta
"from-[#f093fb] to-[#f5576c]"  // Gradient rosa
"from-[#4facfe] to-[#00f2fe]"  // Gradient azul claro
"from-[#43e97b] to-[#38f9d7]"  // Gradient verde água
"from-[#fa709a] to-[#fee140]"  // Gradient sunset
```

### Animações

Todas as animações usam Framer Motion. Você pode customizar:

```typescript
// Velocidade
<motion.div
  transition={{ duration: 0.3 }} // Mais rápido
  transition={{ duration: 1 }}   // Mais lento
>

// Easing (suavização)
<motion.div
  transition={{
    ease: [0.4, 0, 0.2, 1] // Material Design
  }}
>

// Delay
<motion.div
  transition={{ delay: 0.2 }} // Aguarda 200ms
>

// Animação ao hover
<motion.div
  whileHover={{ scale: 1.05 }} // Cresce 5%
  whileTap={{ scale: 0.95 }}   // Diminui 5% ao clicar
>
```

---

## 📱 Responsividade

Todos os componentes são **mobile-first** e responsivos:

```typescript
// Grid adaptativo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
// Mobile: 1 coluna
// Tablet (md): 2 colunas
// Desktop (lg): 4 colunas

// Padding adaptativo
className="p-4 md:p-6 lg:p-8"
// Mobile: 16px
// Tablet: 24px
// Desktop: 32px

// Texto adaptativo
className="text-2xl md:text-3xl lg:text-4xl"
// Mobile: 24px
// Tablet: 30px
// Desktop: 36px
```

---

## 🎯 Próximos Passos

### 1. Instalar Componentes Shadcn Faltantes

Execute os comandos abaixo para adicionar mais componentes:

```bash
# Navegação moderna
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb

# Notificações melhores
npx shadcn@latest add sonner

# Painéis deslizantes
npx shadcn@latest add sheet

# Inputs avançados
npx shadcn@latest add combobox
npx shadcn@latest add date-picker

# Layout flexível
npx shadcn@latest add resizable
npx shadcn@latest add collapsible
```

### 2. Melhorar Sidebar

Criar `EnhancedSidebar.tsx` com:
- ✨ Animações nos ícones
- 🔔 Badges de notificação
- 📂 Submenu animado
- 💡 Tooltips informativos
- 🎨 Active state destacado

### 3. Adicionar Page Transitions

```typescript
// Em AppRoutes.tsx ou CompleteDashboard.tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3 }}
  >
    <Routes>
      {/* suas rotas */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

### 4. Melhorar Loading States

Criar skeleton screens customizados:

```typescript
// DashboardSkeleton.tsx
export const DashboardSkeleton = () => (
  <div className="space-y-8 p-6">
    {/* Hero skeleton */}
    <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl animate-pulse"></div>

    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);
```

### 5. Adicionar Dark Mode

```typescript
// ThemeProvider.tsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/components/...'"

**Solução:** Verificar `tsconfig.json` tem os paths corretos:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

### Erro: "framer-motion not found"

**Solução:**
```bash
npm install framer-motion
```

### Animações não funcionam

**Solução:** Verificar se o Framer Motion está importado:
```typescript
import { motion } from 'framer-motion';
```

### Gradientes não aparecem

**Solução:** Verificar se o Tailwind está processando as classes:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
}
```

---

## 📚 Recursos e Referências

### Documentação
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

### Inspiração
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Linear](https://linear.app/)
- [Stripe Dashboard](https://dashboard.stripe.com/)

### Paletas de Cores
- [Coolors](https://coolors.co/)
- [UI Gradients](https://uigradients.com/)
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)

---

## ✨ Exemplo Completo

Aqui está um exemplo de página usando todos os componentes:

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import ModernDashboard from '@/components/dashboard/ModernDashboard';
import { GradientCard } from '@/components/ui/GradientCard';
import { StatisticCard } from '@/components/ui/StatisticCard';
import { Users, Calendar, Activity } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const MinhaPageModerna = () => {
  const { user } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Dashboard principal */}
      <ModernDashboard user={user} />

      {/* Seção adicional */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GradientCard
          title="Minha Seção Custom"
          icon={Activity}
          gradient="from-indigo-500 to-purple-500"
        >
          <p>Conteúdo personalizado aqui!</p>
        </GradientCard>
      </motion.div>
    </div>
  );
};
```

---

**Pronto para usar!** 🚀

Agora você tem um dashboard moderno e profissional. Experimente, customize e crie sua própria experiência visual!
