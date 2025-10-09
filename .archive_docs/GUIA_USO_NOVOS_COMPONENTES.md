# 📖 GUIA DE USO DOS NOVOS COMPONENTES DA AGENDA

## 🎯 COMO USAR OS NOVOS COMPONENTES

Este guia explica como integrar e usar os novos componentes da agenda em sua aplicação.

---

## 🚀 INTEGRAÇÃO RÁPIDA

### **1. Substituir AgendaPage Atual**

Para usar a nova agenda melhorada, substitua o componente atual:

```typescript
// ANTES - components/agenda/AgendaPage.tsx
import AgendaPage from '../pages/AgendaPage';

// DEPOIS - components/agenda/EnhancedAgendaPage.tsx
import EnhancedAgendaPage from '../components/agenda/EnhancedAgendaPage';
```

### **2. Atualizar Imports**

```typescript
// Em seu arquivo de rota ou página principal
import EnhancedAgendaPage from '@/components/agenda/EnhancedAgendaPage';

// Usar o componente
<EnhancedAgendaPage />
```

---

## 🧩 COMPONENTES INDIVIDUAIS

### **EnhancedAppointmentCard**

**Uso**: Substituir o AppointmentCard atual por uma versão mais rica.

```typescript
import EnhancedAppointmentCard from '@/components/agenda/EnhancedAppointmentCard';

<EnhancedAppointmentCard
  appointment={appointment}
  startHour={7}
  pixelsPerMinute={2}
  isBeingDragged={false}
  onClick={() => console.log('Clicked')}
  onDragStart={(e) => console.log('Drag start')}
  onDragEnd={(e) => console.log('Drag end')}
  showDetails={true} // Opcional: mostrar detalhes extras
/>
```

**Props**:
- `appointment`: Dados do agendamento
- `startHour`: Hora inicial da agenda (padrão: 7)
- `pixelsPerMinute`: Densidade visual (padrão: 2)
- `isBeingDragged`: Se está sendo arrastado
- `onClick`: Callback de clique
- `onDragStart/End`: Callbacks de drag & drop
- `showDetails`: Mostrar informações extras (valor, notas)

### **AgendaSkeleton**

**Uso**: Mostrar loading states elegantes.

```typescript
import AgendaSkeleton from '@/components/agenda/AgendaSkeleton';

<AgendaSkeleton 
  viewType="weekly" 
  therapistCount={3} 
/>
```

**Props**:
- `viewType`: Tipo de visualização ('daily' | 'weekly' | 'monthly' | 'list')
- `therapistCount`: Número de terapeutas para o skeleton

### **AgendaEmptyState**

**Uso**: Mostrar estado vazio com ações.

```typescript
import AgendaEmptyState from '@/components/agenda/AgendaEmptyState';

<AgendaEmptyState
  viewType="weekly"
  onAddAppointment={() => console.log('Add appointment')}
  onClearFilters={() => console.log('Clear filters')}
  hasFilters={true}
  date={new Date()}
/>
```

**Props**:
- `viewType`: Tipo de visualização
- `onAddAppointment`: Callback para adicionar agendamento
- `onClearFilters`: Callback para limpar filtros
- `hasFilters`: Se há filtros ativos
- `date`: Data atual

### **EnhancedAgendaHeader**

**Uso**: Header completo com navegação e filtros.

```typescript
import EnhancedAgendaHeader from '@/components/agenda/EnhancedAgendaHeader';

<EnhancedAgendaHeader
  currentDate={new Date()}
  viewType="weekly"
  onDateChange={(date) => setCurrentDate(date)}
  onViewChange={(view) => setCurrentView(view)}
  onAddAppointment={() => console.log('Add')}
  onSearch={(query) => console.log('Search:', query)}
  onFilter={(filters) => console.log('Filter:', filters)}
  appointmentCount={10}
  patientCount={5}
  totalValue={1500}
  therapists={therapists}
/>
```

**Props**:
- `currentDate`: Data atual
- `viewType`: Tipo de visualização atual
- `onDateChange`: Callback para mudança de data
- `onViewChange`: Callback para mudança de visualização
- `onAddAppointment`: Callback para adicionar agendamento
- `onSearch`: Callback para busca
- `onFilter`: Callback para filtros
- `appointmentCount`: Número de agendamentos
- `patientCount`: Número de pacientes
- `totalValue`: Valor total
- `therapists`: Lista de terapeutas

### **AppointmentDetailPopover**

**Uso**: Popover com detalhes completos do agendamento.

```typescript
import AppointmentDetailPopover from '@/components/agenda/AppointmentDetailPopover';

<AppointmentDetailPopover
  appointment={appointment}
  onEdit={(app) => console.log('Edit:', app)}
  onDelete={(app) => console.log('Delete:', app)}
  onStatusChange={(app, status) => console.log('Status:', status)}
>
  <Button>Ver Detalhes</Button>
</AppointmentDetailPopover>
```

**Props**:
- `appointment`: Dados do agendamento
- `children`: Elemento trigger
- `onEdit`: Callback para editar
- `onDelete`: Callback para deletar
- `onStatusChange`: Callback para mudança de status

### **EnhancedTherapistColumn**

**Uso**: Coluna de terapeuta com estatísticas.

```typescript
import EnhancedTherapistColumn from '@/components/agenda/EnhancedTherapistColumn';

<EnhancedTherapistColumn
  therapist={therapist}
  appointments={appointments}
  onSlotClick={(date, time, therapistId) => console.log('Slot clicked')}
  onAddAppointment={(therapistId) => console.log('Add to:', therapistId)}
  selectedDate={new Date()}
  startHour={7}
  endHour={21}
/>
```

**Props**:
- `therapist`: Dados do terapeuta
- `appointments`: Lista de agendamentos
- `onSlotClick`: Callback para clique em slot
- `onAddAppointment`: Callback para adicionar agendamento
- `selectedDate`: Data selecionada
- `startHour/endHour`: Horário de funcionamento

### **AdvancedFilters**

**Uso**: Sistema de filtros avançados.

```typescript
import AdvancedFilters from '@/components/agenda/AdvancedFilters';

<AdvancedFilters
  therapists={therapists}
  onFiltersChange={(filters) => console.log('Filters:', filters)}
  onClearFilters={() => console.log('Clear')}
  savedFilters={savedFilters}
  onSaveFilter={(name, filters) => console.log('Save:', name, filters)}
  onLoadFilter={(filters) => console.log('Load:', filters)}
  onDeleteFilter={(index) => console.log('Delete:', index)}
/>
```

**Props**:
- `therapists`: Lista de terapeutas
- `onFiltersChange`: Callback para mudança de filtros
- `onClearFilters`: Callback para limpar filtros
- `savedFilters`: Filtros salvos
- `onSaveFilter`: Callback para salvar filtro
- `onLoadFilter`: Callback para carregar filtro
- `onDeleteFilter`: Callback para deletar filtro

---

## 🎨 SISTEMA DE DESIGN

### **Usando Cores de Terapeuta**

```typescript
import { getTherapistColor } from '@/design-system/tokens';

const therapistColor = getTherapistColor(therapistId);
// Retorna: { 50: '#...', 100: '#...', ..., 500: '#...', 900: '#...' }

// Usar em componentes
<div style={{ backgroundColor: therapistColor[500] }}>
  Conteúdo
</div>
```

### **Usando Cores de Status**

```typescript
import { getAppointmentStatusColor } from '@/design-system/tokens';

const statusColor = getAppointmentStatusColor('scheduled');
// Retorna objeto com cores do status
```

### **Tokens de Design**

```typescript
import { designTokens, componentTokens } from '@/design-system/tokens';

// Usar tokens
<div style={{ 
  padding: componentTokens.agenda.appointmentCard.padding,
  borderRadius: componentTokens.agenda.appointmentCard.borderRadius 
}}>
  Conteúdo
</div>
```

---

## 📱 RESPONSIVIDADE

### **Breakpoints**

Os componentes são automaticamente responsivos usando os breakpoints do Tailwind:

```css
/* Mobile First */
sm: '640px'   /* Mobile grande */
md: '768px'   /* Tablet */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Desktop grande */
2xl: '1536px' /* Tela grande */
```

### **Classes Responsivas**

```typescript
// Exemplo de uso responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo */}
</div>
```

---

## 🔧 CUSTOMIZAÇÃO

### **Temas Personalizados**

Para personalizar as cores, edite o arquivo `design-system/tokens.ts`:

```typescript
// Adicionar nova cor de terapeuta
therapist: {
  // ... cores existentes
  5: {
    50: '#...',
    500: '#...',
    // ... outras variações
  }
}
```

### **Componentes Customizados**

Para criar variações dos componentes:

```typescript
// Criar componente customizado baseado no existente
import { EnhancedAppointmentCard } from '@/components/agenda/EnhancedAppointmentCard';

const CustomAppointmentCard = ({ appointment, ...props }) => {
  return (
    <EnhancedAppointmentCard
      {...props}
      appointment={appointment}
      showDetails={true}
      // Adicionar props customizadas
    />
  );
};
```

---

## 🚀 MIGRAÇÃO GRADUAL

### **Fase 1: Componentes Base**
1. Instalar componentes shadcn/ui
2. Testar componentes individuais
3. Validar funcionamento

### **Fase 2: Integração**
1. Substituir componentes um por vez
2. Testar funcionalidades
3. Ajustar estilos se necessário

### **Fase 3: Otimização**
1. Implementar todos os novos componentes
2. Otimizar performance
3. Coletar feedback

---

## 🐛 TROUBLESHOOTING

### **Problemas Comuns**

**Erro de import**: Verifique se os componentes shadcn/ui estão instalados
```bash
npx shadcn@latest add [component-name]
```

**Estilos não aplicados**: Verifique se o Tailwind está configurado corretamente
```typescript
// tailwind.config.ts
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  // ... resto da configuração
}
```

**Cores não funcionando**: Verifique se o CSS variables está configurado
```css
/* index.css */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... outras variáveis */
  }
}
```

---

## 📚 RECURSOS ADICIONAIS

### **Documentação shadcn/ui**
- [Componentes disponíveis](https://ui.shadcn.com/docs/components)
- [Guia de instalação](https://ui.shadcn.com/docs/installation)
- [Customização](https://ui.shadcn.com/docs/theming)

### **Design System**
- [Tokens de design](design-system/tokens.ts)
- [Componentes base](components/ui/)
- [Guia de cores](design-system/tokens.ts#colors)

---

## 🎉 CONCLUSÃO

Os novos componentes da agenda estão prontos para uso e oferecem uma experiência muito superior à versão anterior. 

**Próximos passos**:
1. Testar os componentes em desenvolvimento
2. Integrar gradualmente na aplicação
3. Coletar feedback dos usuários
4. Iterar e melhorar

**Suporte**: Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

---

**🚀 A agenda agora está no nível das melhores soluções do mercado!**
