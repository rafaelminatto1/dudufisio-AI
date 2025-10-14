# Sistema de Mapa Corporal de Dor

## 📍 Visão Geral

Sistema completo para registro, acompanhamento e análise da evolução da dor dos pacientes através de mapas corporais interativos.

## 🎯 Componentes Principais

### Visualizações (4 tipos)

#### SVGSimpleBodyMap
Visualização simplificada estilo "boneco"
- Leve e performático
- Ideal para registro rápido
- Paths SVG otimizados

#### SVGDetailedBodyMap
Visualização anatômica detalhada
- Regiões clicáveis
- Animações para queixa principal
- Visual profissional

#### CanvasInteractiveMap
Canvas com desenho livre
- Alta performance
- Responsivo
- Interativo

#### ImageAnatomicalMap
Overlay em imagem anatômica real
- Visual realista
- Fallback para SVG
- Profissional

### Interface

#### BodyMapManager
Gerenciador principal que orquestra todo o sistema
- Seleção de visualização
- Toggle front/back
- Lista de pontos
- Modal de formulário

#### PainRegionForm
Formulário completo de registro de dor
- Escala EVA 0-10
- 8 tipos de dor
- Validações
- Botão resolver

#### PainHistoryTimeline
Timeline com gráficos de evolução
- Gráfico de linha
- Estatísticas
- Tendências
- Timeline visual

#### BodyMapDashboard
Dashboard analítico completo
- 6 gráficos
- Métricas resumidas
- Heatmap
- Cards de progresso

#### ComparisonView
Comparação visual entre sessões
- Lado a lado
- Listas de mudanças
- Percentuais
- Indicadores visuais

#### BodyMapSummaryCard
Card resumido para acompanhamento
- Últimas atualizações
- Lista de pacientes
- Indicadores de tendência

## 📦 Uso

### Importação

```tsx
import BodyMapManager from '@/components/body-map/BodyMapManager';
import PainHistoryTimeline from '@/components/body-map/PainHistoryTimeline';
import BodyMapDashboard from '@/components/body-map/BodyMapDashboard';
```

### Exemplo Básico

```tsx
import { BodyMapManager } from '@/components/body-map/BodyMapManager';

function PatientPage({ patient }) {
  return (
    <BodyMapManager
      patient={patient}
      onSessionSaved={(session) => {
        console.log('Sessão salva!', session);
      }}
    />
  );
}
```

### Exemplo Avançado

```tsx
import { useState, useEffect } from 'react';
import * as bodyMapService from '@/services/bodyMapService';
import BodyMapDashboard from '@/components/body-map/BodyMapDashboard';

function AnalyticsPage({ patientId }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    bodyMapService.getBodyMapAnalytics(patientId)
      .then(setAnalytics);
  }, [patientId]);

  if (!analytics) return <div>Carregando...</div>;

  return (
    <BodyMapDashboard
      analytics={analytics}
      showMainComplaint={true}
    />
  );
}
```

## 🎨 Props dos Componentes

### BodyMapManager

```typescript
interface BodyMapManagerProps {
  patient: Patient;
  sessionId?: string;
  appointmentId?: string;
  readOnly?: boolean;
  onSessionSaved?: (session: BodyMapSession) => void;
}
```

### PainHistoryTimeline

```typescript
interface PainHistoryTimelineProps {
  sessions: BodyMapSession[];
  selectedRegion?: string;
  showTrend?: boolean;
}
```

### BodyMapDashboard

```typescript
interface BodyMapDashboardProps {
  analytics: BodyMapAnalytics;
  showMainComplaint?: boolean;
}
```

## 🔧 Dependências

```json
{
  "react": "^19.0.0",
  "recharts": "^2.x",
  "lucide-react": "latest",
  "@supabase/supabase-js": "latest"
}
```

## 📝 Notas Técnicas

- Coordenadas normalizadas (0-100%) para responsividade
- Soft delete em todas as tabelas
- Analytics calculados em cache
- RLS habilitado
- TypeScript strict mode

## 🐛 Troubleshooting

### Componente não renderiza
```tsx
// Verificar se patient tem os campos corretos
console.log(patient.id, patient.name);
```

### Erro ao salvar
```typescript
// Verificar conexão Supabase
import { supabase } from '@/lib/supabaseClient';
const { data, error } = await supabase.from('body_map_sessions').select('*').limit(1);
```

## 📖 Mais Informações

Ver documentação completa em:
- `📚_INDICE_MAPA_CORPORAL.md`
- `🚀_GUIA_RAPIDO_MAPA_CORPORAL.md`

