# 🎯 COMO ATIVAR E USAR O SISTEMA MODERNIZADO

## ✅ TUDO JÁ ESTÁ PRONTO!

A modernização completa foi implementada. Aqui está como usar:

---

## 🚀 PASSO 1: INICIAR O SISTEMA

```bash
npm run dev
```

O sistema iniciará e já estará usando:
- ✅ Nova Sidebar hierárquica (SidebarV2)
- ✅ Novo Layout responsivo (ResponsiveLayoutV2)
- ✅ Páginas modernizadas

---

## 🧭 PASSO 2: EXPLORAR A NOVA NAVEGAÇÃO

### Sidebar Hierárquica

1. **Expanda os menus** clicando nos itens com seta (▼)
2. **Navegue pelos níveis**:
   ```
   Gestão de Pacientes
     └─ Pacientes
         ├─ Todos os Pacientes
         └─ Alertas e Pendências
   ```

3. **Use a busca global**: `Cmd + K` (Mac) ou `Ctrl + K` (Windows)

4. **Pin seus favoritos**: Clique com botão direito (será adicionado em breve)

5. **Veja itens recentes**: Aparecem no topo da sidebar

### Breadcrumb Automático

O breadcrumb aparece automaticamente no topo de cada página mostrando onde você está:
```
Início > Gestão de Pacientes > Pacientes
```

---

## 📋 PASSO 3: USAR AS NOVAS PÁGINAS

### Dashboard Modernizado

**URL:** `/dashboard`

**Recursos:**
1. **Filtros Globais**: Selecione período, terapeuta
2. **Modo Edição**: Clique em "Editar Layout" para reorganizar widgets
3. **Salvar Layout**: Após editar, clique em "Salvar"
4. **Layouts Múltiplos**: Crie diferentes layouts para diferentes usos

### Lista de Pacientes

**URL:** `/patients`

**Recursos:**
1. **Busca**: Digite nome, CPF, telefone ou email
2. **Filtros**: Clique em "Filtros" e selecione:
   - Status (Ativo, Inativo, Alta)
   - Faixa etária
   - Data de cadastro
   - Tags
   - Alertas médicos

3. **Visualizações**:
   - Clique em "Tabela" para ver em lista
   - Clique em "Grid" para ver em cards

4. **Ações Rápidas** (hover sobre linha):
   - 📞 Ligar
   - 💬 WhatsApp
   - 📧 Email
   - 📅 Agendar
   - ✏️ Editar
   - 🗑️ Excluir

5. **Ações em Lote**:
   - Selecione múltiplos pacientes (checkbox)
   - Clique em "Ações em Lote"
   - Escolha: Exportar, Enviar Email, Alterar Status, etc.

6. **Exportar**:
   - Clique em "Exportar" para baixar CSV

### Lista de Agendamentos ⭐ NOVO

**URL:** `/appointments`

**Recursos:**
1. **Cards de Estatísticas**:
   - Total, Agendados, Confirmados, Realizados

2. **Filtros**:
   - Status
   - Tipo de agendamento
   - Terapeuta
   - Período

3. **Ações**:
   - Confirmar agendamento
   - Cancelar agendamento
   - Editar
   - Excluir

### Biblioteca de Exercícios

**URL:** `/exercises`

**Recursos:**
1. **Grid de Exercícios**: Cards com thumbnails de vídeo
2. **Preview**: Hover sobre card e clique em Play
3. **Filtros**:
   - Categoria (Fortalecimento, Flexibilidade, etc)
   - Dificuldade (slider 1-5)
   - Partes do corpo (multi-select)
   - Equipamento necessário

4. **Ações**:
   - Ver detalhes
   - Copiar para biblioteca
   - Compartilhar
   - Editar
   - Excluir

### Protocolos Clínicos

**URL:** `/protocols`

**Recursos:**
1. **Grid de Protocolos**: Cards com informações completas
2. **Badge de Evidência**: 1A a 5 (verde = alta evidência)
3. **Estatísticas**: Vezes usado, taxa de sucesso
4. **Ações**:
   - Visualizar protocolo
   - Aplicar ao paciente
   - Copiar
   - Editar
   - Excluir

---

## ⌨️ PASSO 4: ATALHOS DE TECLADO

Pressione `?` para ver todos os atalhos disponíveis.

### Atalhos Principais:

```
Cmd/Ctrl + K  →  Busca global
G + D         →  Ir para Dashboard
G + P         →  Ir para Pacientes
G + A         →  Ir para Agenda
N             →  Novo registro
?             →  Ajuda (atalhos)
Esc           →  Fechar modal
```

---

## 🎨 PASSO 5: CUSTOMIZAR DASHBOARD

### Como Editar Layout:

1. Na página `/dashboard`, clique em **"Editar Layout"**

2. **Reorganize widgets**:
   - Clique e arraste pelo ícone ⋮⋮
   - Solte na posição desejada

3. **Expandir widget**:
   - Clique em ⚙️ no widget
   - Selecione "Expandir"

4. **Remover widget**:
   - Clique em ⚙️ no widget
   - Selecione "Remover"

5. **Salvar**:
   - Clique em "Salvar Layout"

### Criar Novo Layout:

1. Clique no dropdown "Layout"
2. Selecione "Criar Novo Layout"
3. Dê um nome
4. Customize os widgets
5. Salve

### Restaurar Padrão:

1. Clique em "Resetar"
2. Confirme a ação

---

## 🔍 PASSO 6: BUSCAR E FILTRAR

### Busca Rápida

Em qualquer lista:
1. Digite no campo de busca
2. Resultados aparecem em tempo real
3. Busca em todos os campos relevantes

### Filtros Avançados

1. Clique em "Filtros"
2. Selecione os critérios:
   - Status
   - Data
   - Categorias
   - Tags
   - etc.
3. Clique em "Aplicar Filtros"
4. Para limpar: "Limpar"

---

## 📊 PASSO 7: EXPORTAR DADOS

### Exportação Simples

Em qualquer lista:
1. (Opcional) Aplique filtros
2. (Opcional) Selecione itens específicos
3. Clique em "Exportar"
4. Arquivo CSV será baixado

### Exportação Avançada

```typescript
// No código, você pode usar:
const { exportToCSV, exportToJSON, exportToPrint } = useExportData();

// CSV
exportToCSV(data, {
  filename: 'meus-dados',
  columns: [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
  ],
});

// JSON
exportToJSON(data);

// Imprimir
exportToPrint(data);
```

---

## 🎯 PASSO 8: AÇÕES EM LOTE

### Como Usar:

1. **Selecione itens**:
   - Clique no checkbox de cada linha
   - OU clique no checkbox do header para selecionar todos

2. **Barra de ações aparece**:
   - Mostra quantos itens selecionados
   - Botões de ação disponíveis

3. **Execute ação**:
   - Exportar selecionados
   - Enviar email em massa
   - Enviar WhatsApp em massa
   - Alterar status em lote
   - Adicionar tags
   - Excluir múltiplos

---

## 📱 PASSO 9: USAR NO MOBILE

### Mobile (< 768px)

1. **Menu**: Toque no ☰ para abrir sidebar
2. **Navegação**: Use bottom navigation
3. **Gestures**:
   - Swipe right → Abrir sidebar
   - Swipe left → Fechar sidebar
   - Swipe up → Scroll
   - Pull down → Refresh (se implementado)

4. **Visualizações**: Automaticamente adaptadas
   - Tabelas viram listas
   - Grids viram 1 coluna
   - Modals viram bottom sheets

---

## 🎨 CUSTOMIZAÇÕES COMUNS

### 1. Adicionar Novo Item na Sidebar

Edite `components/navigation/navigationConfig.tsx`:

```typescript
{
  id: 'meu-item',
  to: '/meu-item',
  icon: MyIcon,
  label: 'Meu Item',
}
```

### 2. Criar Nova Página CRUD

1. Copie `pages/PatientListPageV2.tsx`
2. Renomeie para `MyEntityListPage.tsx`
3. Ajuste para sua entidade
4. Adicione rota em `MainDashboard.tsx`

### 3. Adicionar Novo Widget

1. Crie em `components/dashboard/widgets/MyWidget.tsx`
2. Adicione renderização em `DashboardGrid.tsx`
3. Adicione no layout padrão em `useDashboardLayout.ts`

### 4. Personalizar Cores

Edite `tailwind.config.ts` para mudar cores do tema.

---

## 🐛 TROUBLESHOOTING

### Erro de Import

```typescript
// Se encontrar erro de import, ajuste o path:
import { Component } from '@/components/...'
// Para:
import { Component } from '../components/...'
```

### Sidebar Não Aparece

Verifique se `MainDashboard.tsx` está usando `ResponsiveLayoutV2`.

### Filtros Não Funcionam

Certifique-se de que está passando `applyFilters` para os dados:

```typescript
const filteredData = useMemo(() => {
  return applyFilters(rawData);
}, [rawData, applyFilters]);
```

### Busca Global Não Abre

Verifique se não está em um input. A busca só funciona quando não está em campo de texto.

---

## 📚 DOCUMENTAÇÃO

Leia os arquivos criados:

- `🎉_MODERNIZAÇÃO_COMPLETA_DASHBOARD_SIDEBAR.md` - Overview completo
- `📚_GUIA_USO_COMPONENTES_MODERNOS.md` - Guia de cada componente
- `💻_EXEMPLOS_CODIGO_PRONTOS.md` - Exemplos copy-paste
- `✨_RESUMO_VISUAL_IMPLEMENTACAO.md` - Resumo visual

---

## 🎉 APROVEITE!

Você agora tem um sistema moderno e profissional com:

✅ Interface moderna e intuitiva  
✅ Performance otimizada  
✅ Totalmente acessível  
✅ Mobile-first responsive  
✅ CRUD completo para tudo  
✅ Analytics avançados  
✅ Customização total  

**Qualquer dúvida, consulte os guias de documentação! 🚀**

