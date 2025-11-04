# Cards de Evolução - Documentação

Sistema de cards colapsáveis para a página de evoluções do paciente.

## Estrutura de Arquivos

```
components/evolution/
├── CollapsibleCard.tsx          # Componente base reutilizável
├── PatientInfoCards.tsx         # Container principal
├── cards/
│   ├── PersonalDataCard.tsx     # Dados pessoais e contato
│   ├── SessionHistoryCard.tsx   # Histórico de sessões
│   ├── MetricsCard.tsx          # Métricas de acompanhamento
│   ├── TreatmentPlanCard.tsx    # Plano de tratamento
│   ├── ExercisesCard.tsx        # Exercícios prescritos
│   ├── PainMapCard.tsx          # Mapa de dor
│   └── index.ts                 # Exports
└── README.md                    # Esta documentação
```

## Componentes

### CollapsibleCard

Componente base reutilizável para criar cards expansíveis/colapsáveis.

**Props:**
- `id`: string - Identificador único do card
- `title`: string - Título exibido no header
- `icon`: React.ReactNode - Ícone do card
- `defaultExpanded`: boolean - Estado inicial (expandido/colapsado)
- `children`: React.ReactNode - Conteúdo do card
- `onToggle`: (expanded: boolean) => void - Callback ao expandir/colapsar

**Features:**
- Salva estado no localStorage (`evolution-card-{id}`)
- Animações suaves com framer-motion
- Acessibilidade (ARIA labels, navegação por teclado)

### PatientInfoCards

Container principal que organiza os cards em grid responsivo.

**Props:**
- `patient`: Patient - Dados do paciente
- `treatmentPlan`: TreatmentPlan | null - Plano de tratamento
- `exercises`: ExercisePrescription[] - Exercícios prescritos
- `sessionHistory`: SoapNote[] - Histórico de sessões
- `metrics`: object - Métricas de acompanhamento

**Layout:**
- Desktop: 3 colunas
- Tablet: 2 colunas
- Mobile: 1 coluna

### Cards Específicos

#### PersonalDataCard
Exibe dados pessoais e de contato do paciente:
- Email, telefone, idade, CPF
- Endereço
- Alertas médicos (destacado)
- Condições ativas

#### SessionHistoryCard
Mostra histórico das últimas sessões:
- Últimas 5 sessões (configurável)
- Data, terapeuta, score de dor
- Botões: "Ver detalhes" e "Repetir conduta"
- Link para ver todas as sessões

#### MetricsCard
Apresenta métricas de acompanhamento:
- Total de sessões realizadas
- Dias de tratamento
- Primeira e última sessão
- Barra de progresso do tratamento

#### TreatmentPlanCard
Informações do plano de tratamento:
- Objetivos do tratamento
- Frequência e duração
- Modalidades utilizadas
- Medidas de resultado
- Código COFFITO

#### ExercisesCard
Lista exercícios prescritos:
- Nome e parâmetros (sets x repetitions)
- Nível de resistência
- Critérios de progressão
- Link para vídeo demonstrativo

#### PainMapCard
Visualização compacta do mapa de dor:
- Número de regiões ativas
- Nível médio de dor
- Última atualização
- Botão para ver mapa completo

## Hooks

### usePatientEvolutionData
Consolida dados do paciente para os cards.

```typescript
const evolutionData = usePatientEvolutionData(
  patient,
  allPatientNotes,
  treatmentPlan,
  planExercises
);
```

**Retorna:**
- `personalData`: Dados pessoais consolidados
- `sessionHistory`: Array de sessões
- `metrics`: Métricas calculadas
- `treatmentPlan`: Plano de tratamento
- `exercises`: Exercícios prescritos
- `isDataComplete`: Boolean indicando se tem dados

### useEvolutionKeyboardShortcuts
Gerencia atalhos de teclado para os cards.

**Atalhos disponíveis:**
- `Ctrl+1` a `Ctrl+6`: Expande/colapsa card específico
- `Ctrl+Shift+E`: Expande todos os cards
- `Ctrl+Shift+C`: Colapsa todos os cards

## Persistência

### localStorage
Estado de expansão dos cards é salvo automaticamente:

```typescript
// Individual
localStorage.setItem('evolution-card-personal-data', 'true');

// Global
localStorage.setItem('evolution-cards-expanded-v1', JSON.stringify({
  'personal-data': true,
  'session-history': true,
  // ...
}));
```

## Uso no AtendimentoPage

```tsx
import PatientInfoCards from '../components/evolution/PatientInfoCards';
import { usePatientEvolutionData } from '../hooks/usePatientEvolutionData';
import { useEvolutionKeyboardShortcuts } from '../hooks/useEvolutionKeyboardShortcuts';

// No componente:
const evolutionData = usePatientEvolutionData(
  patient,
  allPatientNotes,
  treatmentPlan,
  planExercises
);

useEvolutionKeyboardShortcuts();

// No JSX:
<PatientInfoCards
  patient={patient}
  treatmentPlan={treatmentPlan}
  exercises={planExercises}
  sessionHistory={allPatientNotes}
  metrics={sessionMetrics}
/>
```

## Extensibilidade

### Adicionar Novo Card

1. Criar componente em `components/evolution/cards/`:
```tsx
import CollapsibleCard from '../CollapsibleCard';

const MyNewCard = ({ data, defaultExpanded, onToggle }) => {
  return (
    <CollapsibleCard
      id="my-new-card"
      title="Meu Card"
      icon={<Icon />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      {/* Conteúdo */}
    </CollapsibleCard>
  );
};

export default MyNewCard;
```

2. Adicionar ao `PatientInfoCards.tsx`:
```tsx
import MyNewCard from './cards/MyNewCard';

// No JSX:
<MyNewCard
  data={someData}
  defaultExpanded={expandedCards['my-new-card']}
  onToggle={(expanded) => handleCardToggle('my-new-card', expanded)}
/>
```

3. Adicionar atalho em `useEvolutionKeyboardShortcuts.ts`

## Boas Práticas

1. **Performance**: Cards não fazem fetch adicional, apenas organizam dados já carregados
2. **Responsividade**: Grid se adapta automaticamente ao tamanho da tela
3. **Acessibilidade**: Todos os cards têm ARIA labels apropriados
4. **UX**: Estado persistente entre sessões
5. **Manutenibilidade**: Componentes independentes e reutilizáveis

## Melhorias Futuras

- [ ] Drag & drop para reordenar cards
- [ ] Tema claro/escuro
- [ ] Mais opções de visualização (compacto/detalhado)
- [ ] Exportar configuração de cards
- [ ] Integração com analytics
- [ ] Cards customizáveis por usuário

