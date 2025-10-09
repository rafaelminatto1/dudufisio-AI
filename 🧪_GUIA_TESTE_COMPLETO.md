# 🧪 GUIA DE TESTE COMPLETO

## 🎯 Como Testar Todo o Sistema

Este guia fornece um **roteiro completo de testes** para validar todas as funcionalidades implementadas.

---

## 🚀 PRÉ-REQUISITOS

### 1. Servidor Rodando
```bash
npm run dev
# Deve estar em: http://localhost:5176
```

### 2. Browser Aberto
```
Chrome, Firefox, Safari ou Edge
DevTools aberto (F12)
```

### 3. LocalStorage Limpo (Opcional)
```javascript
// No console:
localStorage.clear()
location.reload()
```

---

## 📋 ROTEIRO DE TESTES

### TESTE 1: Sistema de Exercícios ✅

#### 1.1 Lista de Exercícios
```
URL: http://localhost:5176/exercises

✓ Verificar cards de estatísticas (Total, Categorias, etc)
✓ Ver 3 exercícios mock carregados
✓ Buscar por "agachamento"
✓ Filtrar por categoria "Fortalecimento"
✓ Filtrar por dificuldade "Iniciante"
✓ Limpar filtros
✓ Ver dados na tabela
```

#### 1.2 Criar Exercício
```
1. Clicar "Novo Exercício"
2. URL deve ser: /exercises/new

Tab Básico:
  ✓ Nome: "Agachamento Livre"
  ✓ Descrição: "Exercício fundamental para MI"
  ✓ Categoria: Selecionar "Fortalecimento"
  ✓ Dificuldade: "Iniciante"
  ✓ Equipamentos: Marcar "Nenhum"
  ✓ Músculos Alvo: Adicionar "Quadríceps" e "Glúteos"
  ✓ Músculos Secundários: Adicionar "Isquiotibiais"

Tab Instruções:
  ✓ Adicionar 3 instruções detalhadas
  ✓ Adicionar 2 dicas
  ✓ Adicionar 1 variação
  ✓ Adicionar 1 contraindicação

Tab Parâmetros:
  ✓ Séries: 3
  ✓ Repetições: 15
  ✓ Descanso: 60s

Tab Mídia:
  ✓ Image URL: (deixar vazio ou adicionar)
  ✓ Video URL: (deixar vazio ou adicionar)

Tab Avançado:
  ✓ Adicionar tags: "membros-inferiores", "funcional"
  ✓ Adicionar keywords: "squat", "legs"
  ✓ Adicionar body parts: "Pernas", "Glúteos"
  ✓ Nível de Progressão: 1
  ✓ Marcar "Exercício Ativo": ON

3. Clicar "Salvar Exercício"

Resultado Esperado:
  ✅ Redirecionado para /exercises
  ✅ Toast: "Exercício criado com sucesso" (console)
  ✅ Exercício aparece na lista
  ✅ Auditoria registrada
```

#### 1.3 Editar Exercício
```
1. Na lista, clicar menu (...) > Editar
2. URL deve ser: /exercises/:id

Alterações:
  ✓ Mudar séries para 4
  ✓ Adicionar nova dica
  ✓ Modificar descrição
  
3. Clicar "Salvar"

Resultado Esperado:
  ✅ Toast: "Exercício atualizado"
  ✅ Alterações salvas
  ✅ Auditoria com before/after
```

#### 1.4 Duplicar Exercício
```
1. Menu (...) > Duplicar

Resultado Esperado:
  ✅ Novo exercício criado com "(Cópia)"
  ✅ Redirecionado para edição
  ✅ Toast de duplicação
  ✅ Auditoria registrada
```

#### 1.5 Excluir Exercício
```
1. Menu (...) > Excluir
2. Dialog de confirmação aparece
3. Confirmar exclusão

Resultado Esperado:
  ✅ Dialog exibido
  ✅ Após confirmar: exercício removido
  ✅ Toast de exclusão
  ✅ Auditoria registrada
```

---

### TESTE 2: Sistema de Protocolos ✅

#### 2.1 Lista de Protocolos
```
URL: http://localhost:5176/protocols

✓ Ver cards de estatísticas
✓ Verificar lista (pode estar vazia inicialmente)
✓ Filtrar por intensidade
✓ Buscar por nome
```

#### 2.2 Criar Protocolo
```
1. Clicar "Novo Protocolo"
2. URL: /protocols/new

Tab Básico:
  ✓ Nome: "Protocolo Pós-Op Joelho"
  ✓ Descrição: "Protocolo completo de 8 semanas"
  ✓ Duração: 8 semanas
  ✓ Frequência: 3 sessões/semana
  ✓ Intensidade: "Moderada"

Tab Exercícios:
  1. Clicar "Adicionar Exercícios"
  2. Modal ExerciseSelector abre
  3. Buscar "agachamento"
  4. Selecionar 2-3 exercícios (checkboxes)
  5. Verificar contador: "X exercício(s) selecionado(s)"
  6. Clicar "Adicionar"
  
  7. Exercícios aparecem na lista
  8. Para cada exercício:
     - Clicar ícone de edição
     - Alterar séries: 3
     - Alterar reps: 12
     - Adicionar notas: "Atenção ao joelho"
     - Concluir edição
  
  9. Testar ordenação:
     - Clicar botão ↑ no 2º exercício
     - Verificar mudança de ordem
     - Ordem deve atualizar (#1, #2, #3)

Tab Avançado:
  ✓ Adicionar condições: "LCA", "Menisco"
  ✓ Marcar "Protocolo Ativo": ON
  ✓ Deixar "Público": OFF

Preview (coluna direita):
  ✓ Verificar resumo atualiza em tempo real
  ✓ Ver lista de exercícios
  ✓ Ver parâmetros

3. Clicar "Salvar Protocolo"

Resultado Esperado:
  ✅ Protocolo criado
  ✅ Toast de sucesso
  ✅ Redirecionado para /protocols
  ✅ Aparece na lista
```

---

### TESTE 3: Sistema de Atribuições ✅

#### 3.1 Lista de Atribuições
```
URL: http://localhost:5176/assignments

✓ Ver cards de estatísticas (Total, Atribuídos, etc)
✓ Verificar lista (vazia inicialmente)
```

#### 3.2 Criar Atribuição - Exercício Individual
```
1. Clicar "Nova Atribuição"
2. Modal abre

Tab "Exercício Individual":
  ✓ Selecionar paciente (do dropdown)
  ✓ Selecionar exercício "Agachamento"
  ✓ Data início: hoje
  ✓ Data término: +30 dias
  ✓ Instruções: "Fazer com cuidado"
  ✓ Observações: "Paciente com histórico de dor"

3. Clicar "Atribuir Exercício"

Resultado Esperado:
  ✅ Atribuição criada
  ✅ Aparece na lista
  ✅ Card com informações corretas
  ✅ Status: "Atribuído"
```

#### 3.3 Criar Atribuição - Protocolo Completo
```
1. Nova Atribuição
2. Tab "Protocolo Completo"
3. Selecionar paciente
4. Selecionar protocolo criado antes
5. Ver info do protocolo (badge com X exercícios)
6. Definir datas
7. Atribuir

Resultado Esperado:
  ✅ TODOS exercícios do protocolo atribuídos
  ✅ Múltiplos cards na lista
  ✅ Badge "Protocolo" visível
```

#### 3.4 Timeline
```
✓ Ver timeline cronológica
✓ Cards ordenados por data
✓ Ícones de status coloridos
✓ Linha conectando eventos
```

---

### TESTE 4: Registro de Sessões ✅

#### 4.1 Registrar Sessão
```
URL: http://localhost:5176/session-tracking

1. Selecionar paciente
2. Selecionar data
3. Avaliação geral: 8/10
4. Adicionar exercício (do dropdown de atribuições)

Para cada exercício:
  ✓ Séries: 3
  ✓ Repetições: 12
  ✓ Peso: 5kg
  ✓ Dificuldade: 5/10
  ✓ Dor: 2/10
  ✓ Conclusão: 100%
  ✓ Notas: "Execução perfeita"

5. Notas gerais da sessão
6. Clicar "Salvar Sessão"

Resultado Esperado:
  ✅ Sessão salva
  ✅ Console: "Sessão registrada"
  ✅ Dados estruturados corretos
```

---

### TESTE 5: Dashboard de Progresso ✅

#### 5.1 Visualizar Gráficos
```
URL: http://localhost:5176/progress-dashboard

✓ Ver 4 cards de estatísticas
✓ Selecionar paciente (dropdown)
✓ Selecionar período: 30 dias
✓ Ver 4 gráficos:
  1. Evolução de Volume (linha)
  2. Taxa de Conclusão (barras)
  3. Nível de Dor (linha)
  4. Distribuição Categorias (pizza)
✓ Verificar dados mock exibidos
✓ Hover sobre gráficos → tooltip
```

---

### TESTE 6: Analytics ✅

#### 6.1 Dashboard Analytics
```
URL: http://localhost:5176/exercise-analytics

✓ Ver 4 cards no topo
✓ Gráfico: Top 10 exercícios (barras horizontais)
✓ Gráfico: Distribuição por dificuldade (pizza)
✓ Gráfico: Crescimento temporal (linha dupla)
✓ 3 cards de insights
✓ Filtro de período
```

---

### TESTE 7: Templates ✅

#### 7.1 Biblioteca
```
URL: http://localhost:5176/templates

✓ Ver cards de estatísticas
✓ Filtros de busca
✓ Mensagem "Nenhum template" (normal)
✓ Botão "Criar Primeiro Template"
```

---

### TESTE 8: Upload de Mídia ✅

#### 8.1 Testar Upload
```
1. Abrir ExerciseEditPage em Tab Mídia
   (Ou usar MediaUploader standalone)

2. Arrastar imagem para área de drop
   ✓ Área destaca ao arrastar (borda azul)
   ✓ Soltar arquivo
   ✓ Progress bar aparece (0-100%)
   ✓ Preview da imagem aparece
   ✓ Botão "X" para limpar

3. Ou clicar "Selecionar Arquivo"
   ✓ Dialog de seleção abre
   ✓ Selecionar JPG/PNG
   ✓ Upload inicia
   ✓ Preview aparece

Verificar Console:
  ✅ "Upload concluído"
  ✅ URL em base64
  ✅ Thumbnail gerado

Verificar LocalStorage:
  ✅ Key "exerciseMedia" existe
  ✅ Array com dados do arquivo
```

---

### TESTE 9: Exportação ✅

#### 9.1 Exportar Exercícios
```
1. Em ExercisesPage, clicar "Exportar"
2. Arquivo JSON baixado

Verificar Arquivo:
  ✓ Nome: exercises-export-[timestamp].json
  ✓ Conteúdo estruturado
  ✓ Array de exercícios
  ✓ Data de exportação
  ✓ Versão

Console:
  ✅ Toast: "X exercícios exportados"
  ✅ Auditoria registrada
```

#### 9.2 Exportar para CSV
```javascript
// No console:
import { exportService } from './services/exportService';

const exercises = JSON.parse(localStorage.getItem('exercises'));
exportService.exportToCSV(exercises, 'test-export');

Resultado:
  ✅ Arquivo test-export.csv baixado
  ✅ Abrir no Excel
  ✓ Colunas corretas
  ✓ Dados formatados
  ✓ Acentos preservados
```

---

### TESTE 10: Auditoria ✅

#### 10.1 Ver Logs
```javascript
// No console:
auditService.getStats()

Resultado esperado:
{
  totalLogs: N,
  byAction: {
    create: X,
    update: Y,
    delete: Z,
    export: W,
    ...
  },
  byEntityType: {
    exercise: A,
    protocol: B,
    assignment: C
  },
  recentActivity: [...]
}
```

#### 10.2 Histórico de Exercício
```javascript
// Pegar ID de um exercício
const exercises = JSON.parse(localStorage.getItem('exercises'));
const exerciseId = exercises[0].id;

// Ver histórico
const history = auditService.getEntityHistory('exercise', exerciseId);
console.log(history);

Resultado:
  ✅ Array com logs
  ✅ Cada log com: action, timestamp, user, changes
```

#### 10.3 Exportar Logs
```javascript
const logs = auditService.exportLogs();
console.log(logs);

Resultado:
  ✅ JSON string formatado
  ✅ Todos os logs
```

---

### TESTE 11: Atalhos de Teclado ✅

#### 11.1 Testar Shortcuts
```
Em ExercisesPage:
  ✓ Pressionar Ctrl+N → Deve ir para /exercises/new
  ✓ Pressionar Ctrl+F → Deve focar no campo de busca

Em ExerciseEditPage:
  ✓ Pressionar Ctrl+S → Deve salvar
  ✓ Pressionar Esc → Deve fechar/voltar
```

---

## 🔍 TESTES AVANÇADOS

### TESTE 12: Fluxo Completo End-to-End

```
CENÁRIO: "Criar protocolo completo e atribuir a paciente"

1. Criar 3 exercícios:
   - Agachamento
   - Flexão
   - Prancha

2. Criar protocolo "Programa Força":
   - 4 semanas
   - 3x/semana
   - Adicionar os 3 exercícios
   - Configurar cada um
   - Salvar

3. Atribuir protocolo a paciente:
   - Nova atribuição
   - Tab "Protocolo Completo"
   - Selecionar paciente
   - Selecionar protocolo
   - Atribuir

4. Registrar sessão:
   - Ir para session-tracking
   - Selecionar mesmo paciente
   - Adicionar exercícios atribuídos
   - Registrar métricas
   - Salvar

5. Ver progresso:
   - Ir para progress-dashboard
   - Filtrar por paciente
   - Ver gráficos
   - Analisar evolução

Resultado Esperado:
  ✅ Fluxo completo funciona
  ✅ Dados conectados
  ✅ Gráficos exibem info
  ✅ Timeline mostra histórico
```

---

### TESTE 13: Validações

#### 13.1 Validação de Exercício
```
1. Criar novo exercício
2. Deixar nome vazio
3. Tentar salvar

Resultado:
  ✅ Erro: "Nome é obrigatório"
  ✅ Campo destacado em vermelho

4. Nome com 1 caractere
5. Descrição com 5 caracteres
6. Tentar salvar

Resultado:
  ✅ Erro: "Descrição deve ter pelo menos 10 caracteres"

7. Não adicionar instruções
8. Tentar salvar

Resultado:
  ✅ Erro: "Pelo menos uma instrução deve ser fornecida"
```

#### 13.2 Validação de Protocolo
```
1. Criar novo protocolo
2. Não adicionar exercícios
3. Tentar salvar

Resultado:
  ✅ Alert: "Adicione pelo menos um exercício"

4. Duração: 0
5. Tentar salvar

Resultado:
  ✅ Erro de validação
```

---

### TESTE 14: Performance

#### 14.1 Busca com Debounce
```
1. Em ExercisesPage
2. Digitar lentamente no campo de busca
3. Observar console

Resultado:
  ✅ Busca não acontece a cada letra
  ✅ Espera usuário parar de digitar
  ✅ Debounce funcionando
```

#### 14.2 Lazy Loading
```
1. Abrir DevTools > Network
2. Recarregar página
3. Navegar para /exercises

Resultado:
  ✅ Chunk específico carregado
  ✅ Não carrega tudo de uma vez
  
4. Navegar para /protocols

Resultado:
  ✅ Novo chunk carregado
  ✅ Code splitting funcionando
```

---

### TESTE 15: Responsividade

#### 15.1 Mobile
```
1. DevTools > Toggle device toolbar
2. Selecionar iPhone 12 Pro
3. Navegar páginas:
   - /exercises
   - /protocols
   - /assignments
   - /progress-dashboard

Resultado:
  ✅ Layout adapta
  ✅ Tabelas responsivas
  ✅ Cards empilham
  ✅ Formulários usáveis
```

#### 15.2 Tablet
```
1. Selecionar iPad
2. Testar mesmas páginas

Resultado:
  ✅ Grid de 2 colunas
  ✅ Navegação funciona
  ✅ Gráficos visíveis
```

---

## 📊 CHECKLIST DE TESTES

### Funcionalidades Base
- [ ] Criar exercício
- [ ] Editar exercício
- [ ] Duplicar exercício
- [ ] Excluir exercício
- [ ] Buscar exercícios
- [ ] Filtrar exercícios

### Protocolos
- [ ] Criar protocolo
- [ ] Adicionar exercícios
- [ ] Ordenar exercícios
- [ ] Configurar parâmetros
- [ ] Ver preview
- [ ] Salvar protocolo

### Atribuições
- [ ] Atribuir exercício
- [ ] Atribuir protocolo
- [ ] Ver timeline
- [ ] Filtrar atribuições

### Tracking
- [ ] Registrar sessão
- [ ] Ver dashboard
- [ ] Analisar gráficos
- [ ] Filtrar por paciente

### Analytics
- [ ] Ver dashboard
- [ ] Analisar gráficos
- [ ] Ler insights

### Exportação
- [ ] Exportar JSON
- [ ] Exportar CSV
- [ ] Ver arquivos gerados

### Mídia
- [ ] Upload drag-drop
- [ ] Upload por seleção
- [ ] Ver preview
- [ ] Ver galeria

### Auditoria
- [ ] Ver estatísticas
- [ ] Ver histórico
- [ ] Exportar logs

### Validação
- [ ] Campos obrigatórios
- [ ] Formatos corretos
- [ ] Ranges de números
- [ ] Mensagens em português

### Performance
- [ ] Lazy loading
- [ ] Debounce em busca
- [ ] Loading states
- [ ] Code splitting

### Responsividade
- [ ] Desktop (>1024px)
- [ ] Tablet (768-1024px)
- [ ] Mobile (<768px)

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Para Aprovar o Sistema:

✅ **Funcionalidade:**
- Todos fluxos principais funcionam
- CRUD completo operacional
- Validações corretas
- Dados persistem

✅ **UX:**
- Interface intuitiva
- Feedback visual claro
- Loading states visíveis
- Mensagens compreensíveis

✅ **Performance:**
- Carrega em < 3s
- Interações instantâneas
- Sem travamentos
- Lazy loading funciona

✅ **Qualidade:**
- Zero erros console
- Zero erros linting
- Código limpo
- Documentado

---

## 🐛 PROBLEMAS CONHECIDOS

### Nenhum no momento! ✅

Se encontrar algum:
1. Anote o erro exato
2. Passos para reproduzir
3. Console errors
4. Screenshot se possível
5. Consulte troubleshooting

---

## ✅ RESULTADO ESPERADO DOS TESTES

Após completar todos os testes:

- ✅ Sistema 100% funcional
- ✅ Todas features operacionais
- ✅ Dados persistindo corretamente
- ✅ Auditoria registrando
- ✅ Exports funcionando
- ✅ Upload de mídia OK
- ✅ Gráficos renderizando
- ✅ Zero erros críticos

---

## 📞 SUPORTE

### Se Encontrar Problemas:

1. **Console Errors:**
   - Copie o erro completo
   - Veja stack trace
   - Consulte documentação

2. **Validação:**
   - Leia a mensagem de erro
   - Ajuste o campo
   - Tente novamente

3. **Performance:**
   - Limpe cache do Vite
   - Reinicie servidor
   - Hard refresh (Ctrl+Shift+R)

---

**Data:** 09/01/2025  
**Versão Testada:** 2.0.0  
**Cobertura:** Manual - Todas features principais  
**Status:** ✅ Pronto para Testes  

---

**🧪 BOA SORTE NOS TESTES!** 🚀

**Sistema está PRONTO e AGUARDANDO seus testes!** ✅
