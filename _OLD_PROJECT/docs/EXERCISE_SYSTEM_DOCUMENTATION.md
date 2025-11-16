# 📚 Sistema de Exercícios Fisioterapêuticos - Documentação Completa

## 🎯 Visão Geral

O Sistema de Exercícios é uma solução completa e profissional para gerenciamento de exercícios fisioterapêuticos, desenvolvido com as melhores práticas de mercado e utilizando tecnologias modernas.

### ✨ Características Principais

- ✅ **CRUD Completo** - Criar, Ler, Atualizar e Deletar exercícios
- ✅ **Validação Robusta** - Schemas Zod com validação em português
- ✅ **Context API** - Gerenciamento de estado global otimizado
- ✅ **Persistência Local** - LocalStorage para dados offline
- ✅ **UI Profissional** - Shadcn/ui com design moderno
- ✅ **Busca Avançada** - Filtros por categoria, dificuldade, equipamento
- ✅ **Categorização** - Sistema de categorias coloridas
- ✅ **Formulários Modulares** - Tabs organizadas por seção
- ✅ **Responsivo** - Layout adaptável para mobile e desktop
- ✅ **TypeScript** - Type-safe em toda aplicação
- ✅ **Performance** - Otimizado com React.memo e useMemo

---

## 📁 Estrutura de Arquivos

```
dudufisio-AI/
├── types/
│   └── exercise.ts                      # Tipos TypeScript completos
├── schemas/
│   └── exerciseValidation.ts            # Schemas Zod para validação
├── contexts/
│   └── ExerciseContext.tsx              # Context API com CRUD
├── pages/
│   ├── ExercisesPage.tsx                # Página de lista com tabela
│   └── ExerciseEditPage.tsx             # Página de criação/edição
├── components/
│   └── exercises/
│       └── ExerciseColumns.tsx          # Definição das colunas da tabela
└── docs/
    └── EXERCISE_SYSTEM_DOCUMENTATION.md # Este arquivo
```

---

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca principal
- **TypeScript** - Type safety
- **React Router DOM** - Roteamento
- **Shadcn/ui** - Componentes UI
- **TailwindCSS** - Estilização
- **Lucide React** - Ícones

### Validação e Formulários
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **@hookform/resolvers** - Integração Zod + RHF

### Gerenciamento de Estado
- **React Context API** - Estado global
- **LocalStorage** - Persistência offline

### Tabelas
- **@tanstack/react-table** - DataTable avançada

---

## 📊 Modelo de Dados

### Interface Principal: `Exercise`

```typescript
interface Exercise {
  id: string;
  
  // Informações Básicas
  name: string;
  description: string;
  category: string; // UUID da categoria
  subcategory?: string;
  
  // Características Físicas
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: EquipmentType[];
  difficulty: ExerciseDifficulty;
  
  // Instruções
  instructions: string[];
  tips: string[];
  variations: string[];
  contraindications: string[];
  
  // Parâmetros de Execução
  duration?: number; // minutos
  sets?: number;
  reps?: number;
  weight?: number; // kg
  distance?: number; // metros
  restTime?: number; // segundos
  
  // Mídia
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  
  // Classificação
  tags: string[];
  keywords: string[];
  bodyParts: string[];
  
  // Metadados
  source: ExerciseSource;
  sourceId?: string;
  isCustom: boolean;
  isPublic: boolean;
  isActive: boolean;
  
  // Relacionamentos
  createdBy: string;
  assignedPatients: string[];
  protocols: string[];
  
  // Progressão
  progressionLevel: ProgressionLevel; // 1-5
  prerequisites: string[];
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  
  // Estatísticas
  usageCount: number;
  averageRating?: number;
  totalRatings: number;
}
```

### Enums Disponíveis

```typescript
type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type ExerciseSource = 'system' | 'user' | 'imported' | 'external';
type EquipmentType = 'none' | 'dumbbell' | 'barbell' | 'resistance_band' | 
                     'stability_ball' | 'mat' | 'chair' | 'wall' | 'other';
type ProgressionLevel = 1 | 2 | 3 | 4 | 5;
```

---

## 🎨 Páginas e Componentes

### 1. **ExercisesPage** - Página de Lista

**Localização:** `pages/ExercisesPage.tsx`

**Funcionalidades:**
- ✅ Lista todos os exercícios em tabela paginada
- ✅ Busca por texto (nome, descrição, tags)
- ✅ Filtros por categoria e dificuldade
- ✅ Cards de estatísticas
- ✅ Ações rápidas (editar, visualizar, duplicar, excluir)
- ✅ Botões para importar/exportar
- ✅ Dialog de confirmação de exclusão
- ✅ Loading states e skeletons

**Rotas:**
- `/exercises` - Lista de exercícios

**Exemplo de Uso:**
```typescript
// Navegar para a página
navigate('/exercises');

// Componente é renderizado automaticamente
<ExercisesPage />
```

---

### 2. **ExerciseEditPage** - Página de Criação/Edição

**Localização:** `pages/ExerciseEditPage.tsx`

**Funcionalidades:**
- ✅ Formulário completo com 5 tabs:
  - **Básico:** Nome, descrição, categoria, dificuldade, equipamentos, músculos
  - **Instruções:** Passo a passo, dicas, variações, contraindicações
  - **Parâmetros:** Séries, reps, peso, duração, descanso
  - **Mídia:** URLs de imagem, vídeo, miniatura
  - **Avançado:** Tags, palavras-chave, progressão, configurações
- ✅ Validação em tempo real
- ✅ Mensagens de erro em português
- ✅ Arrays dinâmicos (adicionar/remover itens)
- ✅ Switches para configurações booleanas
- ✅ Navegação por tabs

**Rotas:**
- `/exercises/new` - Criar novo exercício
- `/exercises/:id` - Editar exercício existente
- `/exercises/:id/view` - Visualizar exercício (mesmo componente)

**Exemplo de Uso:**
```typescript
// Criar novo
navigate('/exercises/new');

// Editar existente
navigate(`/exercises/${exerciseId}`);

// Visualizar
navigate(`/exercises/${exerciseId}/view`);
```

---

### 3. **ExerciseColumns** - Definição de Colunas

**Localização:** `components/exercises/ExerciseColumns.tsx`

**Funcionalidades:**
- ✅ Colunas configuradas para TanStack Table
- ✅ Renderização customizada
- ✅ Badges coloridos para dificuldade
- ✅ Dropdown menu com ações
- ✅ Tooltips e truncamento de texto

**Colunas Disponíveis:**
1. Nome do Exercício (com descrição)
2. Categoria
3. Dificuldade (badges coloridos)
4. Músculos Alvo
5. Equipamentos
6. Uso (contador)
7. Status (ativo/inativo)
8. Ações (menu dropdown)

---

## 🔌 Context API

### ExerciseContext

**Localização:** `contexts/ExerciseContext.tsx`

**Funcionalidades Disponíveis:**

#### CRUD Exercícios
```typescript
const {
  exercises,                     // Lista de todos os exercícios
  currentExercise,              // Exercício atual sendo editado
  isLoading,                    // Estado de carregamento
  error,                        // Mensagem de erro
  
  getAllExercises,              // Buscar todos
  getExercise,                  // Buscar por ID
  createExercise,               // Criar novo
  updateExercise,               // Atualizar existente
  deleteExercise,               // Deletar
} = useExercise();
```

#### Busca e Filtros
```typescript
const {
  searchExercises,              // Busca com filtros
  filterByCategory,             // Filtrar por categoria
  filterByDifficulty,           // Filtrar por dificuldade
} = useExercise();
```

#### Categorias
```typescript
const {
  categories,                   // Lista de categorias
  getAllCategories,             // Buscar todas
  createCategory,               // Criar nova
  updateCategory,               // Atualizar existente
  deleteCategory,               // Deletar
} = useExercise();
```

#### Protocolos
```typescript
const {
  protocols,                    // Lista de protocolos
  getAllProtocols,              // Buscar todos
  createProtocol,               // Criar novo
  updateProtocol,               // Atualizar existente
  deleteProtocol,               // Deletar
} = useExercise();
```

#### Atribuições
```typescript
const {
  assignments,                  // Lista de atribuições
  assignExerciseToPatient,      // Atribuir a paciente
  getPatientAssignments,        // Buscar por paciente
  updateAssignment,             // Atualizar atribuição
  completeAssignment,           // Marcar como completo
} = useExercise();
```

#### Utilitários
```typescript
const {
  duplicateExercise,            // Duplicar exercício
  exportExercises,              // Exportar para JSON
  importExercises,              // Importar de JSON
} = useExercise();
```

---

## 📝 Validação com Zod

### Schemas Disponíveis

**Localização:** `schemas/exerciseValidation.ts`

```typescript
// Schema para formulário
ExerciseFormSchema

// Schema para entidade completa
ExerciseSchema

// Schema para categoria
ExerciseCategorySchema

// Schema para protocolo
ExerciseProtocolSchema

// Schema para atribuição
ExerciseAssignmentSchema

// Schema para progresso
ExerciseProgressSchema

// Schema para sessão
ExerciseSessionSchema

// Schema para template
ExerciseTemplateSchema

// Schema para filtros de busca
ExerciseSearchFiltersSchema
```

### Exemplo de Validação

```typescript
import { ExerciseFormSchema } from '../schemas/exerciseValidation';

const form = useForm<ExerciseFormData>({
  resolver: zodResolver(ExerciseFormSchema),
  defaultValues: {
    name: '',
    description: '',
    category: '',
    // ...
  }
});
```

### Mensagens de Erro Personalizadas

Todas as mensagens de erro estão em português:
- "Nome é obrigatório"
- "Descrição deve ter pelo menos 10 caracteres"
- "Categoria é obrigatória"
- "Pelo menos uma instrução deve ser fornecida"
- E muito mais...

---

## 🎯 Fluxos de Uso

### 1. Criar Novo Exercício

```typescript
// 1. Usuário clica em "Novo Exercício"
navigate('/exercises/new');

// 2. Preenche o formulário em tabs
// - Tab Básico: nome, descrição, categoria, etc.
// - Tab Instruções: passo a passo, dicas
// - Tab Parâmetros: séries, reps, etc.
// - Tab Mídia: URLs de imagem/vídeo
// - Tab Avançado: tags, configurações

// 3. Clica em "Salvar Exercício"
const onSubmit = async (data: ExerciseFormData) => {
  await createExercise(data);
  navigate('/exercises');
};

// 4. Exercício é salvo no localStorage
// 5. Usuário é redirecionado para lista
```

### 2. Editar Exercício Existente

```typescript
// 1. Usuário clica em ações > editar
navigate(`/exercises/${exercise.id}`);

// 2. Formulário é preenchido com dados existentes
useEffect(() => {
  if (!isNewExercise && id) {
    getExercise(id);
  }
}, [id]);

// 3. Usuário modifica os campos desejados

// 4. Clica em "Salvar Exercício"
const onSubmit = async (data: ExerciseFormData) => {
  await updateExercise(id, data);
  navigate('/exercises');
};

// 5. Exercício é atualizado no localStorage
```

### 3. Buscar e Filtrar Exercícios

```typescript
// Busca por texto
const [searchQuery, setSearchQuery] = useState('');

useEffect(() => {
  const results = await searchExercises({ query: searchQuery });
  setFilteredExercises(results);
}, [searchQuery]);

// Filtro por categoria
const [selectedCategory, setSelectedCategory] = useState('all');

useEffect(() => {
  if (selectedCategory !== 'all') {
    const results = await filterByCategory(selectedCategory);
    setFilteredExercises(results);
  }
}, [selectedCategory]);

// Filtro por dificuldade
const [selectedDifficulty, setSelectedDifficulty] = useState('all');

useEffect(() => {
  if (selectedDifficulty !== 'all') {
    const results = await filterByDifficulty(selectedDifficulty);
    setFilteredExercises(results);
  }
}, [selectedDifficulty]);
```

### 4. Excluir Exercício

```typescript
// 1. Usuário clica em ações > excluir
const handleDeleteExercise = (exercise: Exercise) => {
  setExerciseToDelete(exercise);
  setShowDeleteDialog(true);
};

// 2. Dialog de confirmação é exibido
<AlertDialog open={showDeleteDialog}>
  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
  <AlertDialogDescription>
    Tem certeza que deseja excluir "{exerciseToDelete?.name}"?
  </AlertDialogDescription>
</AlertDialog>

// 3. Usuário confirma
const confirmDelete = async () => {
  await deleteExercise(exerciseToDelete.id);
  setShowDeleteDialog(false);
};

// 4. Exercício é removido do localStorage
```

### 5. Duplicar Exercício

```typescript
// 1. Usuário clica em ações > duplicar
const handleDuplicateExercise = async (exercise: Exercise) => {
  const duplicated = await duplicateExercise(exercise.id);
  navigate(`/exercises/${duplicated.id}`);
};

// 2. Novo exercício é criado com "(Cópia)" no nome
// 3. Usuário é redirecionado para edição do duplicado
```

---

## 🎨 Componentes UI Utilizados

### Shadcn/ui Components

- **Button** - Botões de ação
- **Input** - Campos de texto
- **Textarea** - Campos de texto multilinhas
- **Select** - Dropdowns de seleção
- **Switch** - Toggle on/off
- **Badge** - Tags e labels
- **Card** - Containers de conteúdo
- **Tabs** - Navegação por abas
- **Dialog** - Modais
- **AlertDialog** - Confirmações
- **Skeleton** - Loading states
- **Form** - Wrapper de formulários
- **Label** - Labels de campos
- **Table** - Tabelas (via DataTable)

### Custom Components

- **DataTable** - Tabela avançada com TanStack Table
- **ExerciseColumns** - Definição de colunas
- **ExercisesPageSkeleton** - Loading da lista
- **ExerciseEditPageSkeleton** - Loading da edição

---

## 🔍 Busca e Filtros

### Filtros Disponíveis

```typescript
interface ExerciseSearchFilters {
  query?: string;              // Busca textual
  category?: string;           // UUID da categoria
  difficulty?: ExerciseDifficulty;
  equipment?: EquipmentType[];
  targetMuscles?: string[];
  bodyParts?: string[];
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
  createdBy?: string;
}
```

### Exemplo de Busca Combinada

```typescript
const filters: ExerciseSearchFilters = {
  query: 'agachamento',
  difficulty: 'beginner',
  equipment: ['none', 'mat'],
  isActive: true
};

const results = await searchExercises(filters);
```

---

## 💾 Persistência de Dados

### LocalStorage Keys

- `exercises` - Array de exercícios
- `exerciseCategories` - Array de categorias
- `exerciseProtocols` - Array de protocolos
- `exerciseAssignments` - Array de atribuições

### Estrutura de Dados Mock

O sistema inicializa com dados mock se o localStorage estiver vazio:

**Categorias Mock:**
1. Mobilidade (Azul)
2. Fortalecimento (Vermelho)
3. Alongamento (Verde)
4. Equilíbrio (Laranja)
5. Respiratório (Roxo)

**Exercícios Mock:**
1. Agachamento Básico
2. Flexão de Braço
3. Prancha Isométrica

---

## 🚀 Performance e Otimizações

### React Optimizations

```typescript
// useMemo para valor do contexto
const value = useMemo(() => ({
  exercises,
  categories,
  createExercise,
  // ...
}), [exercises, categories, createExercise]);

// useCallback para funções
const createExercise = useCallback(async (data) => {
  // ...
}, []);

// Lazy loading de páginas
const ExercisesPage = createLazyComponent(() => import('./ExercisesPage'));
```

### Performance Features

- ✅ Lazy loading de componentes
- ✅ Memoização de valores
- ✅ useCallback para funções
- ✅ Debounce em busca (pode ser adicionado)
- ✅ Paginação na tabela
- ✅ Skeleton loading states

---

## 🎯 Próximos Passos e Expansões

### Funcionalidades Planejadas (Não Implementadas)

1. **Upload de Mídia** - Upload real de imagens/vídeos
2. **Protocolos Completos** - Interface para criar protocolos
3. **Atribuição a Pacientes** - Interface para vincular exercícios
4. **Progresso de Sessões** - Tracking de execução
5. **Templates** - Templates pré-configurados
6. **Analytics** - Relatórios e gráficos
7. **Exportação Avançada** - PDF, Excel, etc.
8. **Importação de APIs** - ExerciseDB, etc.
9. **Vídeos Incorporados** - Player de vídeo integrado
10. **Biblioteca Pública** - Compartilhamento entre profissionais

### Integrações Futuras

- **Supabase** - Substituir localStorage por banco real
- **ExerciseDB API** - Importar exercícios externos
- **Google Drive** - Backup de mídias
- **YouTube** - Incorporar vídeos
- **AI** - Sugestões de exercícios com Gemini

---

## 📚 Referências e Recursos

### Documentação Oficial

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Table](https://tanstack.com/table)
- [TailwindCSS](https://tailwindcss.com/)

### Inspirações (Context7)

- **SparkyFitness** - Sistema de fitness tracking
- **ExerciseDB API** - Database de exercícios
- **MoveHealth** - Reabilitação e progresso

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. "useExercise deve ser usado dentro de um ExerciseProvider"

**Solução:** Verifique se o `ExerciseProvider` está envolvendo sua aplicação no `AppRoutes.tsx`:

```typescript
<ExerciseProvider>
  <YourApp />
</ExerciseProvider>
```

#### 2. Dados não estão persistindo

**Solução:** Verifique o localStorage no DevTools:

```javascript
localStorage.getItem('exercises');
localStorage.getItem('exerciseCategories');
```

#### 3. Validação não está funcionando

**Solução:** Certifique-se de que o `zodResolver` está configurado:

```typescript
const form = useForm({
  resolver: zodResolver(ExerciseFormSchema),
  // ...
});
```

#### 4. Rotas não estão funcionando

**Solução:** Verifique se as rotas estão definidas no `CompleteDashboard.tsx`:

```typescript
<Route path="/exercises" element={LazyElement(ExercisesPage)} />
<Route path="/exercises/new" element={LazyElement(ExerciseEditPage)} />
<Route path="/exercises/:id" element={LazyElement(ExerciseEditPage)} />
```

---

## ✅ Checklist de Implementação

- [x] Tipos TypeScript completos
- [x] Schemas de validação Zod
- [x] ExerciseContext com CRUD
- [x] Página de lista com filtros
- [x] Página de criação/edição
- [x] Componentes de tabela
- [x] Persistência em localStorage
- [x] Rotas configuradas
- [x] Provider adicionado ao App
- [x] Validação em português
- [x] Loading states
- [x] Error handling
- [x] Responsive design
- [x] Documentação completa
- [ ] Upload de mídia
- [ ] Protocolos completos
- [ ] Atribuição a pacientes
- [ ] Templates
- [ ] Analytics
- [ ] Exportação PDF
- [ ] Integração Supabase

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema de exercícios:

1. Consulte esta documentação
2. Verifique os comentários no código
3. Consulte os exemplos de uso
4. Entre em contato com a equipe de desenvolvimento

---

## 📄 Licença

Este sistema faz parte do projeto DuduFisio-AI e segue a mesma licença do projeto principal.

---

**Última atualização:** 2025-01-09  
**Versão:** 1.0.0  
**Status:** ✅ Sistema Base Implementado e Funcional
