# 🎯 Como Usar o CRUD de Conteúdo Clínico

## 🚀 Acesso Rápido

1. **Inicie o servidor**: `npm run dev`
2. **Acesse**: http://localhost:5175/clinical-content
3. **Comece a gerenciar!**

## ✨ Funcionalidades

### ➕ ADICIONAR NOVO CONTEÚDO

1. Clique no botão grande de adicionar no topo da página:
   - **"➕ Adicionar Protocolo"** (azul)
   - **"➕ Adicionar Exercício"** (verde)
   - **"➕ Adicionar Avaliação"** (roxo)
   - **"➕ Adicionar Material"** (amarelo)

2. Preencha o formulário que aparecer
3. Clique em **"Salvar"**

### ✏️ EDITAR CONTEÚDO

1. Encontre o card do item que deseja editar
2. Clique no botão **"✏️ Editar"** (amarelo) no canto superior direito do card
3. Modifique os campos desejados
4. Clique em **"Salvar"**

### 🗑️ DELETAR CONTEÚDO

1. Encontre o card do item que deseja deletar
2. Clique no botão **"🗑️ Deletar"** (vermelho) no canto superior direito do card
3. Confirme a exclusão na janela que aparecer

### 🔍 FILTRAR CONTEÚDO

**Por Especialidade:**
- Clique em: **Todas**, **Esportiva**, **Pós-Operatória** ou **Gerontológica**

**Por Tipo:**
- Clique em: **Protocolos**, **Exercícios**, **Avaliações** ou **Materiais**

## 📋 Tipos de Conteúdo

### 🔵 Protocolos Clínicos
- Programas completos de tratamento
- Incluem fases, objetivos e duração
- Baseados em evidências científicas

**Campos principais:**
- Título
- Especialidade
- Duração e frequência
- Nível de evidência (A, B, C, D)
- Objetivos
- Tags

### 🟢 Exercícios
- Exercícios terapêuticos individuais
- Com instruções passo a passo
- Classificados por dificuldade

**Campos principais:**
- Nome do exercício
- Especialidades (pode ter várias)
- Categoria (fortalecimento, mobilidade, etc.)
- Partes do corpo trabalhadas
- Séries e repetições
- Instruções detalhadas

### 🟣 Avaliações
- Protocolos de avaliação especializados
- Procedimentos padronizados
- Para diagnóstico e acompanhamento

**Campos principais:**
- Título
- Especialidade
- População alvo
- Duração
- Materiais necessários
- Procedimentos passo a passo

### 🟡 Materiais Clínicos
- Manuais, formulários, checklists
- Conteúdo educacional
- Recursos para impressão/download

**Campos principais:**
- Título
- Tipo (manual, formulário, checklist, etc.)
- Categoria (educação, uso profissional, etc.)
- Conteúdo completo
- Opções de download/impressão

## 💾 Armazenamento

### Onde os dados são salvos?
- **LocalStorage do navegador**: Todos os dados ficam salvos localmente
- **Persistência**: Os dados permanecem mesmo após fechar o navegador
- **Por usuário**: Cada navegador/computador tem seus próprios dados

### Como fazer backup?
```javascript
// Cole no console do navegador (F12 → Console)
const backup = {
  protocols: clinicalContentService.protocols.getAll(),
  exercises: clinicalContentService.exercises.getAll(),
  assessments: clinicalContentService.assessments.getAll(),
  materials: clinicalContentService.materials.getAll()
};
console.log(JSON.stringify(backup, null, 2));
// Copie o resultado e salve em um arquivo .json
```

### Como resetar para os dados originais?
```javascript
// Cole no console do navegador (F12 → Console)
clinicalContentService.resetToDefaults();
location.reload();
```

## 🎨 Interface

### Cores dos Cards
- **Azul** 🔵 - Protocolos
- **Verde** 🟢 - Exercícios  
- **Roxo** 🟣 - Avaliações
- **Amarelo** 🟡 - Materiais

### Botões
- **➕ Adicionar** - Botão grande no topo (cor varia por tipo)
- **✏️ Editar** - Botão amarelo pequeno
- **🗑️ Deletar** - Botão vermelho pequeno

## ❓ Dúvidas Frequentes

### Posso adicionar campos personalizados?
Sim! Você pode modificar os formulários em:
- `components/clinical-content/ProtocolForm.tsx`
- `components/clinical-content/ExerciseForm.tsx`
- `components/clinical-content/AssessmentForm.tsx`
- `components/clinical-content/MaterialForm.tsx`

### Os dados são compartilhados com outros usuários?
Não. Atualmente os dados ficam apenas no seu navegador.

### Como adicionar imagens aos conteúdos?
Por enquanto, use URLs de imagens externas nos campos apropriados.

### Posso exportar em PDF?
Ainda não implementado, mas você pode:
1. Abrir o item desejado
2. Usar Ctrl+P (imprimir)
3. Salvar como PDF

### Perdi meus dados, como recuperar?
Se você deletou algo por engano:
1. Abra o console (F12)
2. Digite: `clinicalContentService.resetToDefaults()`
3. Isso restaura os dados originais (mas perde personalizações)

## 🛠️ Troubleshooting

### O botão "Adicionar" não aparece
- Verifique se está logado no sistema
- Recarregue a página (F5)

### O formulário não abre
- Verifique o console (F12) por erros
- Tente limpar o cache do navegador

### Os dados não são salvos
- Verifique se o localStorage está habilitado
- Alguns navegadores em modo anônimo não salvam dados

### A página está lenta
- Muitos itens carregados pode deixar lento
- Considere usar os filtros para reduzir a quantidade exibida

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este guia
2. Consulte o `CLINICAL_CONTENT_CRUD_README.md` (documentação técnica)
3. Abra o console do navegador (F12) para ver erros

## 🎉 Pronto!

Agora você está pronto para gerenciar todo o conteúdo clínico do sistema!

**Lembre-se:**
- ✅ Todos os dados são salvos automaticamente
- ✅ Use os filtros para encontrar o que precisa
- ✅ Cada tipo de conteúdo tem sua cor
- ✅ Sempre confirme antes de deletar

**Bom trabalho! 💪**

