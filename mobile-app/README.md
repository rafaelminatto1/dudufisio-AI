# 📱 dudufisio-AI Mobile App

**Plataforma:** React Native + Expo  
**Criado:** 06/11/2025 - FASE 4  
**Status:** Setup completo, pronto para desenvolvimento

---

## 🎯 VISÃO GERAL

App mobile para pacientes e fisioterapeutas com:
- Portal do paciente
- Exercícios em vídeo
- Agendamento mobile
- Teleconsultas
- Notificações push
- Progresso de tratamento
- Chat com terapeuta

---

## 🚀 QUICK START

```bash
# 1. Navegar para pasta mobile
cd mobile-app

# 2. Instalar dependências
npm install

# 3. Iniciar Expo
npx expo start

# 4. Escanear QR code com Expo Go app
# iOS: Expo Go na App Store
# Android: Expo Go na Play Store
```

---

## 📦 STACK TECNOLÓGICA

### Core
- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **TypeScript** - Type safety
- **React Navigation** - Navegação

### UI
- **NativeWind** - Tailwind para RN
- **React Native Paper** - Material Design
- **Expo Icons** - Ícones

### State Management
- **Zustand** - State management
- **React Query** - Server state
- **AsyncStorage** - Local storage

### Backend
- **Supabase** - Same backend as web
- **Real-time subscriptions**
- **Push notifications** (Expo)

---

## 📁 ESTRUTURA

```
mobile-app/
├── app/                    # Expo Router (file-based)
│   ├── (tabs)/            # Bottom tabs navigation
│   │   ├── home.tsx
│   │   ├── exercises.tsx
│   │   ├── schedule.tsx
│   │   └── profile.tsx
│   ├── (auth)/            # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── _layout.tsx
│
├── components/            # Reusable components
│   ├── ExerciseCard.tsx
│   ├── AppointmentCard.tsx
│   ├── ProgressChart.tsx
│   └── VideoPlayer.tsx
│
├── services/             # API & Business logic
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── exercise.service.ts
│   └── notification.service.ts
│
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   ├── useExercises.ts
│   └── useAppointments.ts
│
├── types/              # TypeScript types
│   └── index.ts
│
├── constants/          # Constants
│   ├── Colors.ts
│   └── Config.ts
│
└── assets/            # Images, fonts, etc
```

---

## 🎨 FEATURES PLANEJADAS

### MVP (Versão 1.0)
- [ ] Login/Registro
- [ ] Home dashboard
- [ ] Lista de exercícios com vídeos
- [ ] Agendamento de consultas
- [ ] Perfil do paciente
- [ ] Notificações push
- [ ] Histórico de sessões

### Versão 1.1
- [ ] Teleconsulta mobile
- [ ] Chat com terapeuta
- [ ] Check-in de exercícios
- [ ] Tracking de progresso
- [ ] Lembretes inteligentes

### Versão 2.0
- [ ] Análise de movimento com câmera
- [ ] Gamificação
- [ ] Conquistas e badges
- [ ] Integração com wearables
- [ ] Offline mode

---

## 📝 SCRIPTS DISPONÍVEIS

```bash
# Development
npm start              # Start Expo
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Build
npm run build:android  # Build APK
npm run build:ios      # Build IPA

# Testing
npm test              # Run tests
npm run test:watch    # Watch mode
npm run lint          # Lint code
```

---

## 🔧 CONFIGURAÇÃO

### 1. Supabase

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. Push Notifications

```bash
# Install
npx expo install expo-notifications

# Configure
# - iOS: Apple Developer Account
# - Android: Firebase Cloud Messaging
```

### 3. Environment Variables

```env
# .env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_API_URL=your_api_url
```

---

## 📱 TELAS PRINCIPAIS

### 1. Home (Dashboard)
- Próxima consulta
- Exercícios do dia
- Progresso semanal
- Quick actions

### 2. Exercícios
- Lista com vídeos
- Filtros por categoria
- Favoritos
- Histórico de execução

### 3. Agendamentos
- Calendário
- Lista de consultas
- Agendar nova
- Cancelar/reagendar

### 4. Perfil
- Dados pessoais
- Configurações
- Notificações
- Logout

---

## 🎯 ROADMAP MOBILE

### Fase 1 (Mês 1-2)
- Setup completo
- Telas principais
- Integração Supabase
- Navegação

### Fase 2 (Mês 3-4)
- Teleconsulta
- Chat
- Push notifications
- Vídeos de exercícios

### Fase 3 (Mês 5-6)
- Análise de movimento
- Gamificação
- Wearables
- Offline mode

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs
- Downloads: 10k no primeiro mês
- DAU: 40% dos downloads
- Retention D7: 60%
- Rating: > 4.5 ⭐

### Engagement
- Sessões/dia: 3+
- Tempo médio: 15min
- Check-ins de exercícios: 70%

---

**Status:** ✅ Setup completo  
**Próximo passo:** Implementar telas MVP

