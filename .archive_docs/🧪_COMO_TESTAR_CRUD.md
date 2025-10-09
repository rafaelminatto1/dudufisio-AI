# 🧪 Como Testar o CRUD de Conteúdo Clínico

## ✅ Pré-requisitos

- [x] Servidor rodando: `npm run dev` (já iniciado)
- [x] Navegador aberto
- [x] Login realizado no sistema

---

## 🎯 Testes Básicos

### 1. Acessar a Página ✅

1. Abra: http://localhost:5175/clinical-content
2. Você deve ver:
   - Título: "🏥 Biblioteca de Conteúdo Clínico"
   - 4 cards de estatísticas (Protocolos, Exercícios, Avaliações, Materiais)
   - Botão de adicionar no topo
   - Filtros de especialidade e tipo
   - Cards de conteúdo listados

### 2. Testar Filtros ✅

**Filtro por Tipo:**
1. Clique em "Protocolos" - deve mostrar apenas protocolos (cards azuis)
2. Clique em "Exercícios" - deve mostrar apenas exercícios (cards verdes)
3. Clique em "Avaliações" - deve mostrar apenas avaliações (cards roxos)
4. Clique em "Materiais" - deve mostrar apenas materiais (cards amarelos)

**Filtro por Especialidade:**
1. Clique em "Esportiva" - deve filtrar conteúdo esportivo
2. Clique em "Pós-Operatória" - deve filtrar conteúdo pós-operatório
3. Clique em "Gerontológica" - deve filtrar conteúdo geriátrico
4. Clique em "Todas" - deve mostrar tudo

### 3. Testar CREATE (Criar) ✅

**Criar um Protocolo:**
1. Certifique-se que está em "Protocolos"
2. Clique em "➕ Adicionar Protocolo"
3. Modal de formulário deve abrir
4. Preencha:
   - Título: "Protocolo de Teste"
   - Especialidade: Esportiva
   - Duração: "4 semanas"
   - Frequência: "3x por semana"
   - Resumo: "Este é um protocolo de teste"
   - Descrição: "Descrição completa do protocolo"
   - Adicione pelo menos 1 objetivo
   - Adicione pelo menos 1 tag
5. Clique em "Salvar"
6. O modal deve fechar
7. Você deve ver o novo protocolo na lista

**Criar um Exercício:**
1. Mude para "Exercícios"
2. Clique em "➕ Adicionar Exercício"
3. Preencha:
   - Nome: "Exercício de Teste"
   - Selecione pelo menos uma especialidade
   - Categoria: Fortalecimento
   - Selecione pelo menos uma parte do corpo
   - Descrição: "Descrição do exercício"
   - Séries: 3
   - Repetições: "10-12"
   - Descanso: "60 segundos"
   - Adicione pelo menos 1 instrução
4. Clique em "Salvar"
5. Verifique se aparece na lista

### 4. Testar UPDATE (Editar) ✅

**Editar o Protocolo criado:**
1. Encontre o "Protocolo de Teste" na lista
2. Clique no botão "✏️ Editar" (amarelo)
3. Modal deve abrir com os dados preenchidos
4. Modifique:
   - Título: "Protocolo de Teste - Editado"
   - Adicione um novo objetivo
5. Clique em "Salvar"
6. Verifique se as mudanças aparecem no card

**Editar o Exercício criado:**
1. Mude para "Exercícios"
2. Encontre o "Exercício de Teste"
3. Clique em "✏️ Editar"
4. Modifique:
   - Nome: "Exercício de Teste - Editado"
   - Séries: 4
5. Clique em "Salvar"
6. Verifique as alterações

### 5. Testar DELETE (Deletar) ✅

**Deletar o Protocolo:**
1. Encontre o "Protocolo de Teste - Editado"
2. Clique no botão "🗑️ Deletar" (vermelho)
3. Deve aparecer uma confirmação: "Tem certeza que deseja deletar este protocolo?"
4. Clique em "OK"
5. O protocolo deve desaparecer da lista

**Deletar o Exercício:**
1. Mude para "Exercícios"
2. Encontre o "Exercício de Teste - Editado"
3. Clique em "🗑️ Deletar"
4. Confirme
5. O exercício deve desaparecer

---

## 🔍 Testes Avançados

### 6. Testar Persistência ✅

1. Crie um novo protocolo
2. **Recarregue a página** (F5)
3. O protocolo deve ainda estar lá
4. Delete o protocolo
5. Recarregue novamente
6. O protocolo NÃO deve estar mais lá

### 7. Testar Validação ✅

**Campos Obrigatórios:**
1. Clique em "➕ Adicionar Protocolo"
2. Deixe campos vazios
3. Tente clicar em "Salvar"
4. O formulário **não deve submeter**
5. Navegador deve mostrar validação nativa

**Arrays Dinâmicos:**
1. No formulário de protocolo
2. Clique em "+ Adicionar Objetivo" várias vezes
3. Adicione vários objetivos
4. Clique em "Remover" em um deles
5. Objetivo deve ser removido

### 8. Testar Estatísticas ✅

1. Anote os números nos cards de estatísticas
2. Adicione um novo protocolo
3. O número de protocolos deve **aumentar em 1**
4. Delete o protocolo
5. O número deve **voltar ao original**

### 9. Testar Tipos Diferentes ✅

**Teste todos os tipos:**

**Protocolo:**
- ✅ Criar
- ✅ Editar
- ✅ Deletar

**Exercício:**
- ✅ Criar
- ✅ Editar
- ✅ Deletar

**Avaliação:**
- ✅ Criar (clique em "➕ Adicionar Avaliação")
- ✅ Editar
- ✅ Deletar

**Material:**
- ✅ Criar (clique em "➕ Adicionar Material")
- ✅ Editar
- ✅ Deletar

---

## 🧰 Testes de Console

### 10. Testar API Programaticamente

Abra o console do navegador (F12 → Console) e teste:

```javascript
// 1. Ver todos os protocolos
const protocols = clinicalContentService.protocols.getAll();
console.log('Protocolos:', protocols);

// 2. Ver estatísticas
const stats = clinicalContentService.getStatistics();
console.log('Estatísticas:', stats);

// 3. Criar um protocolo via código
const newProtocol = clinicalContentService.protocols.create({
  title: "Protocolo Via Console",
  specialty: "esportiva",
  description: "Criado programaticamente",
  summary: "Teste",
  objectives: ["Objetivo 1"],
  indications: [],
  contraindications: [],
  phases: [],
  duration: "4 semanas",
  frequency: "3x",
  evidenceLevel: "B",
  references: [],
  images: [],
  tags: ["teste"]
});
console.log('Novo protocolo:', newProtocol);

// 4. Buscar por especialidade
const esportivos = clinicalContentService.protocols.getBySpecialty('esportiva');
console.log('Protocolos esportivos:', esportivos);

// 5. Buscar por texto
const resultados = clinicalContentService.protocols.search('console');
console.log('Resultados da busca:', resultados);

// 6. Deletar o protocolo de teste
clinicalContentService.protocols.delete(newProtocol.id);
console.log('Protocolo deletado');

// 7. Verificar localStorage
console.log('Dados no localStorage:');
console.log('Protocolos:', localStorage.getItem('clinicalContent_protocols'));
console.log('Exercícios:', localStorage.getItem('clinicalContent_exercises'));
console.log('Avaliações:', localStorage.getItem('clinicalContent_assessments'));
console.log('Materiais:', localStorage.getItem('clinicalContent_materials'));
```

---

## 🐛 Testes de Edge Cases

### 11. Testes de Limite

**Campos vazios:**
- Tente criar com apenas campos obrigatórios
- Deve funcionar

**Muitos itens:**
- Adicione 10+ objetivos a um protocolo
- Adicione 10+ instruções a um exercício
- Deve funcionar normalmente

**Caracteres especiais:**
- Use título: "Protocolo #1 (teste) - versão 2.0"
- Use descrição com quebras de linha
- Deve salvar corretamente

### 12. Teste de Cancelamento

1. Clique em "➕ Adicionar Protocolo"
2. Preencha alguns campos
3. Clique em "Cancelar"
4. Modal deve fechar
5. Nada deve ser salvo

### 13. Teste de Edição e Cancelamento

1. Clique em "✏️ Editar" em um protocolo
2. Modifique alguns campos
3. Clique em "Cancelar"
4. Modal deve fechar
5. Mudanças **não devem** ser salvas

---

## ✅ Checklist de Testes

Marque cada teste conforme for realizando:

### Básicos
- [ ] Página carrega corretamente
- [ ] Estatísticas aparecem
- [ ] Filtros de tipo funcionam
- [ ] Filtros de especialidade funcionam
- [ ] Cards são exibidos corretamente

### CREATE
- [ ] Criar protocolo
- [ ] Criar exercício
- [ ] Criar avaliação
- [ ] Criar material
- [ ] Novo item aparece na lista

### READ
- [ ] Ver detalhes nos cards
- [ ] Filtrar por tipo
- [ ] Filtrar por especialidade
- [ ] Estatísticas corretas

### UPDATE
- [ ] Editar protocolo
- [ ] Editar exercício
- [ ] Editar avaliação
- [ ] Editar material
- [ ] Mudanças aparecem no card

### DELETE
- [ ] Deletar protocolo (com confirmação)
- [ ] Deletar exercício (com confirmação)
- [ ] Deletar avaliação (com confirmação)
- [ ] Deletar material (com confirmação)
- [ ] Item removido da lista

### Persistência
- [ ] Dados salvos após reload
- [ ] Dados deletados não voltam após reload

### Validação
- [ ] Campos obrigatórios validados
- [ ] Arrays dinâmicos funcionam
- [ ] Botão cancelar funciona

### UI/UX
- [ ] Botões visíveis e clicáveis
- [ ] Cores distintas por tipo
- [ ] Modais abrem e fecham corretamente
- [ ] Feedback visual apropriado
- [ ] Interface responsiva

---

## 🎯 Resultado Esperado

Após completar todos os testes:

✅ **Tudo deve funcionar perfeitamente!**

Se encontrar algum problema:
1. Verifique o console (F12) por erros
2. Verifique se o servidor está rodando
3. Tente limpar o cache: `Ctrl + Shift + R`
4. Tente limpar o localStorage: `localStorage.clear()`

---

## 📊 Relatório de Testes

Após testar, você pode verificar:

```javascript
// No console
console.log('=== RELATÓRIO DE TESTES ===');
console.log('Total de protocolos:', clinicalContentService.protocols.getAll().length);
console.log('Total de exercícios:', clinicalContentService.exercises.getAll().length);
console.log('Total de avaliações:', clinicalContentService.assessments.getAll().length);
console.log('Total de materiais:', clinicalContentService.materials.getAll().length);
console.log('Estatísticas:', clinicalContentService.getStatistics());
```

---

## 🎉 Pronto para Produção!

Se todos os testes passarem, o sistema está **pronto para uso em produção!**

**Bons testes! 🚀**

