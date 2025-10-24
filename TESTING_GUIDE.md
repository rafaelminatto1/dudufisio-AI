# Guia de Testes - Página de Evoluções Redesenhada

## 🧪 Como Testar a Nova Implementação

### Preparação

1. **Instalar dependências** (se necessário):
```bash
npm install
```

2. **Iniciar o servidor de desenvolvimento**:
```bash
npm run dev
```

3. **Abrir a aplicação**:
   - Acesse `http://localhost:5176` (ou a porta configurada)

### Navegação até a Página

1. Login no sistema
2. Vá para **Agenda** ou **Pacientes**
3. Clique em um agendamento ou sessão
4. Você será direcionado para `/attendance/:appointmentId`

## ✅ Checklist de Testes

### 1. Layout e Cards Colapsáveis

- [ ] A página carrega sem erros
- [ ] Cards aparecem em grid acima do formulário SOAP
- [ ] **Desktop**: 3 colunas de cards
- [ ] **Tablet**: 2 colunas de cards
- [ ] **Mobile**: 1 coluna de cards
- [ ] Clicar no header de um card expande/colapsa o conteúdo
- [ ] Animação de expansão/colapso é suave
- [ ] Estado de expansão persiste ao recarregar a página

### 2. Cards Individuais

#### PersonalDataCard (Card 1)
- [ ] Exibe email do paciente
- [ ] Exibe telefone do paciente
- [ ] Exibe idade e/ou data de nascimento
- [ ] Exibe CPF
- [ ] Exibe localização (cidade, estado)
- [ ] Alertas médicos aparecem destacados em laranja
- [ ] Condições aparecem como tags azuis

#### SessionHistoryCard (Card 2)
- [ ] Mostra até 5 sessões anteriores
- [ ] Cada sessão mostra: número, data, terapeuta
- [ ] Score de dor aparece (ex: "Dor: 5/10")
- [ ] Botão "Ver" abre detalhes da sessão
- [ ] **Botão "Repetir" preenche o formulário SOAP** ✨ (campos S, O, A, P + dor + métricas)
- [ ] Toast de sucesso aparece ao repetir conduta
- [ ] Campos do formulário são preenchidos corretamente
- [ ] Se houver mais de 5 sessões, link "Ver todas" aparece
- [ ] Link "Ver todas" navega para página do paciente

#### MetricsCard (Card 3)
- [ ] Mostra total de sessões realizadas
- [ ] Mostra dias de tratamento
- [ ] Mostra data da primeira sessão
- [ ] Mostra data da última sessão
- [ ] Barra de progresso aparece e está proporcional

#### TreatmentPlanCard (Card 4)
- [ ] Aparece apenas se houver plano de tratamento
- [ ] Exibe objetivos do tratamento
- [ ] Exibe frequência (ex: "3x/semana")
- [ ] Exibe duração (ex: "12 semanas")
- [ ] Modalidades aparecem como tags roxas
- [ ] Medidas de resultado aparecem como tags âmbar
- [ ] Código COFFITO aparece no rodapé

#### ExercisesCard (Card 5)
- [ ] Aparece apenas se houver exercícios prescritos
- [ ] Lista todos os exercícios do plano
- [ ] Cada exercício mostra sets x repetitions
- [ ] Nível de resistência aparece (se houver)
- [ ] Critérios de progressão aparecem (se houver)
- [ ] Botão "Ver Demonstração" aparece (se houver URL)
- [ ] Contador total de exercícios no rodapé

#### PainMapCard (Card 6)
- [ ] Card sempre aparece
- [ ] **Loading state aparece durante carregamento** ✨
- [ ] **Se houver erro, mostra mensagem de erro** ✨
- [ ] Se não houver registros, mostra mensagem vazia
- [ ] **Se houver registros, mostra métricas REAIS** ✨ (pontos ativos, dor média)
- [ ] **Preview dos 3 pontos mais recentes aparece** ✨
- [ ] Botão "Ver Mapa Completo" navega corretamente
- [ ] Navegação inclui query param `?tab=pain-map`

### 3. Atalhos de Teclado

⚠️ **Importante**: Certifique-se de que o foco NÃO está em um input/textarea

- [ ] **Ctrl+1**: Toggle PersonalDataCard
- [ ] **Ctrl+2**: Toggle SessionHistoryCard
- [ ] **Ctrl+3**: Toggle MetricsCard
- [ ] **Ctrl+4**: Toggle TreatmentPlanCard
- [ ] **Ctrl+5**: Toggle ExercisesCard
- [ ] **Ctrl+6**: Toggle PainMapCard
- [ ] **Ctrl+Shift+E**: Expande TODOS os cards
- [ ] **Ctrl+Shift+C**: Colapsa TODOS os cards
- [ ] Atalhos não funcionam quando em input/textarea (comportamento esperado)
- [ ] Dica de atalhos aparece abaixo dos cards

### 4. Formulário SOAP

- [ ] Formulário SOAP aparece abaixo dos cards
- [ ] Formulário está em largura total (não mais em 2/3 da tela)
- [ ] Todos os campos SOAP funcionam normalmente:
  - [ ] Subjetivo (S)
  - [ ] Objetivo (O)
  - [ ] Avaliação (A)
  - [ ] Plano (P)
  - [ ] Escala de dor
  - [ ] Métricas de acompanhamento
- [ ] Auto-save funciona
- [ ] Botão "Finalizar e Salvar" funciona
- [ ] Validações funcionam normalmente

### 5. Persistência

1. **Teste de localStorage**:
   - [ ] Expanda alguns cards, colapsa outros
   - [ ] Recarregue a página (F5)
   - [ ] Estado dos cards deve ser mantido
   
2. **Teste entre sessões**:
   - [ ] Configure cards como preferir
   - [ ] Finalize a sessão
   - [ ] Entre em outra sessão de atendimento
   - [ ] Estado dos cards deve ser o mesmo

### 6. Responsividade

#### Desktop (>1024px)
- [ ] 3 colunas de cards
- [ ] Cards bem espaçados
- [ ] Tudo legível e organizado

#### Tablet (768-1024px)
- [ ] 2 colunas de cards
- [ ] Layout se adapta bem
- [ ] Sem overflow horizontal

#### Mobile (<768px)
- [ ] 1 coluna de cards
- [ ] Cards ocupam largura total
- [ ] Formulário SOAP responsivo
- [ ] Toque funciona para expandir/colapsar
- [ ] Sem problemas de zoom

### 7. Acessibilidade

- [ ] Navegação por Tab funciona
- [ ] Enter/Space expande/colapsa cards quando focados
- [ ] Indicador de foco visível
- [ ] Screen readers conseguem ler os cards (testar se possível)

### 8. Performance

- [ ] Página carrega rapidamente
- [ ] Não há fetches duplicados no Network
- [ ] Animações são suaves (60fps)
- [ ] Sem travamentos ao expandir/colapsar
- [ ] Auto-save não interfere na digitação

## ✅ Melhorias Implementadas (Problemas Resolvidos)

### ✅ Erros de TypeScript/Lint - RESOLVIDO
- **Era**: PatientInfoCards mostrava erros de import
- **Resolvido**: Imports corrigidos usando arquivo `index.ts`
- **Status**: ✅ Sem erros de lint

### ✅ PainMapCard Integrado - RESOLVIDO
- **Era**: Card sempre mostrava "Nenhum registro de dor" (dados mock)
- **Resolvido**: Integrado com `useBodyMap` hook, agora usa dados reais
- **Status**: ✅ Exibe pontos de dor reais do paciente com métricas calculadas

### ✅ Botão "Repetir" Funcional - RESOLVIDO
- **Era**: Botão "Repetir" apenas mostrava toast
- **Resolvido**: Conectado ao formulário SOAP, preenche automaticamente:
  - Subjetivo (S)
  - Objetivo (O)
  - Avaliação (A)
  - Plano (P)
  - Escala de dor
  - Métricas registradas
- **Status**: ✅ Totalmente funcional

## 📊 Métricas de Sucesso

A implementação está correta se:

✅ Todos os 6 cards aparecem corretamente
✅ Expansão/colapso funciona
✅ Estado persiste no localStorage
✅ Layout é responsivo (3/2/1 colunas)
✅ Atalhos de teclado funcionam
✅ Formulário SOAP permanece funcional
✅ Não há erros no console
✅ Performance é boa

## 🔄 Como Reportar Problemas

Se encontrar bugs:

1. **Descreva o problema**: O que esperava vs o que aconteceu
2. **Passos para reproduzir**: Como chegar no erro
3. **Ambiente**: Desktop/Tablet/Mobile, navegador
4. **Console**: Copie erros do console (F12)
5. **Screenshots**: Se aplicável

## 🎉 Conclusão

Após testar todos os pontos acima, a página de evoluções está pronta para uso! 

O novo design facilita muito o dia a dia ao tornar todas as informações do paciente facilmente acessíveis através dos cards colapsáveis organizados.

---

**Dica**: Para a melhor experiência, mantenha os cards que você mais usa expandidos (PersonalDataCard e SessionHistoryCard) e colapsa os demais. Use Ctrl+1-6 para acesso rápido! 🚀
