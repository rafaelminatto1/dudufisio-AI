# Planejamento UX/UI - Repaginação da Página de Atendimento

## Análise da Situação Atual

### Problemas Identificados na Interface Atual

#### 1. Sobrecarga Visual e Cognitiva
- **Problema**: Muitas informações competindo por atenção simultaneamente
- **Impacto**: Fisioterapeuta se perde e demora mais para preencher o formulário
- **Evidências**:
  - 6 cards colapsáveis na tela ao mesmo tempo
  - Header com múltiplos botões e informações
  - Formulário SOAP em grid 2x2 ocupa muito espaço
  - Métricas, escala de dor e controles misturados

#### 2. Hierarquia Visual Confusa
- **Problema**: Não há clara distinção entre "essencial" e "secundário"
- **Impacto**: Usuário não sabe por onde começar
- **Evidências**:
  - Todos os campos SOAP têm o mesmo peso visual
  - Cards têm a mesma importância aparente
  - Botão "Finalizar" compete com outros controles

#### 3. Fluxo de Trabalho Fragmentado
- **Problema**: Muitas ações dispersas pela interface
- **Impacto**: Interrupções constantes no raciocínio clínico
- **Evidências**:
  - Escala de dor no topo, longe do campo Subjetivo
  - Botão de IA entre S/O e A/P quebra o fluxo
  - Métricas separadas do formulário principal
  - Controles de sessão no header, longe do conteúdo

#### 4. Navegação por Tabs Ausente
- **Problema**: Tudo em uma única tela rolável
- **Impacto**: Difícil focar em uma tarefa por vez
- **Evidências**:
  - Scroll infinito com cards + formulário
  - Não há separação clara entre "contexto" e "registro"

#### 5. Falta de Affordance (Indicações Visuais)
- **Problema**: Usuário não entende o que é clicável ou interativo
- **Impacto**: Descoberta de funcionalidades por acidente
- **Evidências**:
  - Cards colapsáveis não parecem clicáveis
  - Atalhos de teclado escondidos em `<details>`
  - Auto-save silencioso, sem feedback claro

---

## Solução Proposta: Design Centrado no Workflow

### Princípios de Design

1. **Progressão Guiada**: Interface guia naturalmente o fisioterapeuta pelo processo
2. **Foco Contextual**: Uma coisa por vez, sem distrações
3. **Feedback Contínuo**: Sistema sempre informa o que está acontecendo
4. **Acesso Rápido**: Informações importantes a um clique de distância
5. **Eficiência**: Atalhos e automações para usuários experientes

---

## Nova Arquitetura de Informação

### Layout em 3 Painéis

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER FIXO (sempre visível)                                           │
│  - Avatar e nome do paciente                                            │
│  - Timer da sessão + controles (play/pause)                            │
│  - Status de salvamento                                                 │
│  - Botão "Finalizar" (destaque)                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────┬──────────────────────────────────────────────┬────────────────┐
│         │                                              │                │
│ PAINEL  │   ÁREA PRINCIPAL DE TRABALHO                │   PAINEL       │
│ ESQUERDO│   (Formulário SOAP + Ferramentas)           │   DIREITO      │
│         │                                              │   (Contexto)   │
│ 240px   │   Central, foco total                        │   280px        │
│         │                                              │                │
│ - Ações │   Tabs:                                      │ - Histórico    │
│   Rápi- │   1. 📝 Registro SOAP (padrão)              │ - Plano        │
│   das   │   2. 📊 Métricas & Dor                      │ - Exercícios   │
│         │   3. 🧠 Assistente IA                        │ - Dados        │
│ - Nave- │   4. 📎 Anexos                               │                │
│   gação │                                              │ Toggle para    │
│         │                                              │ mostrar/       │
│ - Infor-│                                              │ esconder       │
│   mações│                                              │                │
│         │                                              │                │
└─────────┴──────────────────────────────────────────────┴────────────────┘
```

---

## Estrutura Detalhada dos Componentes

### 1. Header Fixo (Sticky)

**Objetivos**:
- Sempre acessível independente do scroll
- Informações críticas sempre visíveis
- Ações principais em destaque

**Conteúdo**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [<] Voltar  |  👤 RAFAEL MINATTO | 28/10 às 08:00             │
│                                                                  │
│ ⏱ 00:45:23 [▶] [⏸] [⏹]  |  💾 Salvo  |  [✅ Finalizar Sessão] │
└─────────────────────────────────────────────────────────────────┘
```

**Elementos**:
- **Botão Voltar**: Retorna à agenda ou lista de pacientes
- **Info Paciente**: Avatar + Nome + Data/Hora do agendamento
- **Timer**: Duração da sessão com controles inline
- **Status Save**: Badge colorido (verde=salvo, amarelo=salvando, vermelho=erro)
- **Finalizar**: Botão primário, sempre visível e acessível

**Estados**:
- Timer pausado: Fundo amarelo suave
- Salvando: Spinner animado no badge
- Pronto para finalizar: Botão "Finalizar" pulsa suavemente

---

### 2. Painel Esquerdo (Sidebar de Navegação)

**Objetivos**:
- Acesso rápido a ações e informações importantes
- Navegação entre seções sem perder contexto
- Atalhos visuais para funcionalidades

**Seções**:

#### A. Ações Rápidas (Topo)
```
┌─────────────────────┐
│ AÇÕES RÁPIDAS       │
├─────────────────────┤
│ 🔄 Repetir Conduta  │
│ 🧠 Sugestão IA      │
│ 📸 Tirar Foto       │
│ 📎 Adicionar Anexo  │
└─────────────────────┘
```

#### B. Navegação por Sessões
```
┌─────────────────────┐
│ SESSÕES             │
├─────────────────────┤
│ ▶ #1 - Hoje         │
│   #0 - 21/10        │
│   Anterior...       │
└─────────────────────┘
```

#### C. Informações Rápidas
```
┌─────────────────────┐
│ RESUMO              │
├─────────────────────┤
│ 📞 (11) 99999-9999  │
│ 🎂 28 anos          │
│ 💪 5 sessões        │
│ 📅 5 dias trat.     │
└─────────────────────┘
```

**Interações**:
- Hover: Destaque suave
- Click: Animação de feedback
- Tooltip: Informações adicionais

---

### 3. Área Principal (Central) - Sistema de Tabs

**Objetivos**:
- Foco total em uma tarefa por vez
- Organização lógica do conteúdo
- Acesso rápido via teclado

#### Tab 1: 📝 Registro SOAP (Padrão)

**Layout Vertical Progressivo** (não grid):

```
┌────────────────────────────────────────────────────────────┐
│ 📝 Registro SOAP da Sessão #1                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Progresso: ████████░░░░░░ 60%  | 4/5 campos completos│  │
│ └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 🗣 S - SUBJETIVO *                          [742/5000]    │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Paciente relata dor no joelho direito...           │    │
│ │                                                     │    │
│ │                                                     │    │
│ └────────────────────────────────────────────────────┘    │
│                                                            │
│ 🔍 O - OBJETIVO *                           [531/5000]    │
│ ┌────────────────────────────────────────────────────┐    │
│ │ ROM joelho: 0-110°, edema leve...                  │    │
│ │                                                     │    │
│ │                                                     │    │
│ └────────────────────────────────────────────────────┘    │
│                                                            │
│ [🧠 Gerar Avaliação e Plano com IA]                       │
│                                                            │
│ 📋 A - AVALIAÇÃO *                          [423/5000]    │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Evolução positiva, redução de dor...               │    │
│ │                                                     │    │
│ └────────────────────────────────────────────────────┘    │
│                                                            │
│ 📝 P - PLANO *                              [612/5000]    │
│ ┌────────────────────────────────────────────────────┐    │
│ │ Mobilização patelar, fortalecimento...             │    │
│ │                                                     │    │
│ └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Características**:
- **Layout Vertical**: Leitura natural de cima para baixo (fluxo S→O→A→P)
- **Campos Expansíveis**: Textarea cresce automaticamente com o conteúdo
- **Contador de Caracteres**: Indicação visual de progresso
- **Validação em Tempo Real**: Borda vermelha se campo obrigatório vazio
- **Auto-save Inteligente**: Debounce de 2s, indicador discreto

#### Tab 2: 📊 Métricas & Dor

```
┌────────────────────────────────────────────────────────────┐
│ 📊 Avaliações e Métricas                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 😣 ESCALA DE DOR (EVA)                                     │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  0   1   2   3   4   5   6   7   8   9   10         │  │
│ │  😊  🙂  😐  😕  😟  😣  😖  😫  😩  😭  💀         │  │
│ │              [======●=================]               │  │
│ │                      5/10                             │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ 🗺 MAPA CORPORAL                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │      [Figura humana interativa]                      │  │
│ │                                                       │  │
│ │  Regiões marcadas:                                   │  │
│ │  • Joelho Direito: "Dor ao subir escadas"            │  │
│ │  • Lombar: "Rigidez matinal"                         │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ 📏 MÉTRICAS DE ACOMPANHAMENTO                             │
│ ┌───────────────┬──────────┬──────────┬──────────┐       │
│ │ Métrica       │ Anterior │ Atual    │ Variação │       │
│ ├───────────────┼──────────┼──────────┼──────────┤       │
│ │ ROM Joelho    │ 100°     │ [110°]   │ +10° ↗   │       │
│ │ Força Quad.   │ 4/5      │ [4/5]    │ = →      │       │
│ │ Edema         │ 2cm      │ [1.5cm]  │ -0.5 ↘   │       │
│ └───────────────┴──────────┴──────────┴──────────┘       │
└────────────────────────────────────────────────────────────┘
```

**Características**:
- **Escala Visual**: Emojis tornam a seleção mais intuitiva
- **Mapa Interativo**: Click para marcar região + modal para detalhes
- **Comparação Automática**: Sistema mostra valores anteriores e tendência
- **Validação Contextual**: Alerta se métrica está fora do esperado

#### Tab 3: 🧠 Assistente IA

```
┌────────────────────────────────────────────────────────────┐
│ 🧠 Assistente IA - Suporte à Decisão Clínica              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ✨ SUGESTÕES BASEADAS EM S/O                              │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 💡 Avaliação Sugerida:                               │  │
│ │                                                       │  │
│ │ Paciente apresenta evolução positiva com redução     │  │
│ │ significativa de dor (de 8/10 para 5/10). Ganho de  │  │
│ │ amplitude articular de 10° indica boa resposta ao    │  │
│ │ protocolo proposto...                                │  │
│ │                                                       │  │
│ │ [✓ Aplicar]  [✎ Editar e Aplicar]  [✗ Descartar]   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 💡 Plano Sugerido:                                   │  │
│ │                                                       │  │
│ │ 1. Mobilização patelar (graus I-III)                │  │
│ │ 2. Fortalecimento de quadríceps (3x15 repetições)   │  │
│ │ 3. Alongamento de isquiotibiais (30s, 3x)           │  │
│ │ 4. Crioterapia 15 minutos                           │  │
│ │                                                       │  │
│ │ [✓ Aplicar]  [✎ Editar e Aplicar]  [✗ Descartar]   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ 🔮 ANÁLISE DE RISCO                                       │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ⚠️ Alertas:                                          │  │
│ │ • Teste de Lachman não realizado há 3 sessões        │  │
│ │ • Considerar avaliação de força com dinamômetro      │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Características**:
- **Sugestões Editáveis**: IA sugere, profissional decide e ajusta
- **Aplicação com 1 Click**: Botões de ação direta
- **Histórico de Sugestões**: Ver o que foi sugerido/aplicado anteriormente
- **Transparência**: IA explica o raciocínio por trás da sugestão

#### Tab 4: 📎 Anexos & Mídia

```
┌────────────────────────────────────────────────────────────┐
│ 📎 Anexos e Documentação                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [+ Adicionar Arquivo]  [📸 Tirar Foto]  [🎙 Gravar Áudio]│
│                                                            │
│ 🖼 FOTOS DA SESSÃO (3)                                     │
│ ┌──────┬──────┬──────┐                                    │
│ │[IMG] │[IMG] │[IMG] │                                    │
│ │ ROM  │Edema │Postur│                                    │
│ └──────┴──────┴──────┘                                    │
│                                                            │
│ 📄 DOCUMENTOS (2)                                          │
│ • Exame_Raio-X_21-10.pdf  [Ver] [⬇]                       │
│ • Laudo_Ressonancia.pdf   [Ver] [⬇]                       │
│                                                            │
│ 🎙 ÁUDIOS (1)                                              │
│ • Observacoes_paciente.mp3  [▶]  [02:34]                  │
└────────────────────────────────────────────────────────────┘
```

**Características**:
- **Upload Drag & Drop**: Arrasta arquivo para adicionar
- **Captura Direta**: Foto via webcam/celular
- **Preview Inline**: Visualização rápida sem sair da página
- **Organização Automática**: Categoriza por tipo de arquivo

---

### 4. Painel Direito (Contexto Colapsável)

**Objetivos**:
- Informações de contexto sempre acessíveis
- Não atrapalha o fluxo principal
- Expansível/colapsável para controle do usuário

**Estrutura**:

```
┌──────────────────────────┐
│ [◀ Ocultar] CONTEXTO     │
├──────────────────────────┤
│                          │
│ 📋 HISTÓRICO (últimas 3) │
│ ┌────────────────────┐   │
│ │ #4 - 21/10/2025    │   │
│ │ Dor: 6/10          │   │
│ │ [Ver] [🔄 Repetir] │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ #3 - 18/10/2025    │   │
│ │ Dor: 7/10          │   │
│ │ [Ver] [🔄 Repetir] │   │
│ └────────────────────┘   │
│                          │
├──────────────────────────┤
│ 🎯 PLANO DE TRATAMENTO   │
│                          │
│ Objetivo: Reabilitação   │
│ joelho pós-lesão LCA     │
│                          │
│ Progresso: ███░░ 60%     │
│ 12/20 sessões            │
│                          │
│ [Ver Detalhes]           │
├──────────────────────────┤
│ 💪 EXERCÍCIOS PRESCRITOS │
│                          │
│ • Leg Press (3x15)       │
│ • Cadeira Extensora      │
│ • Prancha (30s, 3x)      │
│                          │
│ [Ver Todos]              │
├──────────────────────────┤
│ 👤 DADOS DO PACIENTE     │
│                          │
│ Nome: Rafael Minatto     │
│ Idade: 28 anos           │
│ Tel: (11) 99999-9999     │
│                          │
│ [Ver Ficha Completa]     │
└──────────────────────────┘
```

**Características**:
- **Sempre Visível**: Mas não intrusivo
- **Colapsável**: Botão "Ocultar" dá mais espaço à área central
- **Quick Actions**: Ações diretas (Repetir conduta, Ver detalhes)
- **Scroll Independente**: Não afeta área principal

---

## Sistema de Navegação e Atalhos

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + S` | Salvar manualmente |
| `Ctrl + Enter` | Finalizar sessão |
| `Ctrl + 1-4` | Alternar entre tabs (1=SOAP, 2=Métricas, 3=IA, 4=Anexos) |
| `Ctrl + G` | Gerar sugestão IA |
| `Ctrl + R` | Repetir conduta anterior |
| `Ctrl + H` | Toggle painel direito (Histórico) |
| `Tab` | Navegar entre campos |
| `Shift + Tab` | Navegar para trás |

### Navegação por Breadcrumb

```
Agenda > Rafael Minatto > Sessão #1 (28/10/2025 às 08:00)
```

---

## Feedback e Estados do Sistema

### 1. Salvamento

**Estados**:
- 💾 **Salvo**: Badge verde com ícone check
- ⏳ **Salvando...**: Badge amarelo com spinner
- ❌ **Erro ao salvar**: Badge vermelho com tooltip explicativo
- ⚠️ **Não salvo**: Badge laranja (quando há mudanças)

**Posição**: Header fixo, sempre visível

### 2. Validação de Formulário

**Campos Obrigatórios**:
- Borda vermelha sutil se vazio
- Mensagem de erro abaixo do campo
- Contador de campos pendentes no progresso

**Validação em Tempo Real**:
- ✓ Verde: Campo válido
- ⚠️ Amarelo: Atenção (ex: muito curto)
- ✗ Vermelho: Erro (ex: vazio)

### 3. Progresso da Sessão

**Barra de Progresso**:
```
Progresso: ████████░░░░░░ 60% | 4/5 campos completos
```

**Indicadores**:
- S: ✓ Completo
- O: ✓ Completo
- A: ✓ Completo
- P: ✓ Completo
- Dor: ⚠️ Pendente

### 4. Timer de Sessão

**Estados**:
- ▶️ **Em andamento**: Timer contando, fundo neutro
- ⏸ **Pausado**: Timer parado, fundo amarelo suave
- ⏹ **Finalizado**: Timer parado, sessão completa

**Alertas**:
- 30 min: Notificação discreta "Sessão em andamento há 30 minutos"
- 60 min: Notificação "Sessão longa, deseja fazer uma pausa?"

---

## Responsividade

### Desktop (> 1280px)
- Layout 3 painéis completo
- Todos os controles visíveis

### Tablet (768px - 1280px)
- Painel direito colapsado por padrão
- Tabs em linha única

### Mobile (< 768px)
- Layout vertical único
- Painel esquerdo vira menu hambúrguer
- Painel direito vira modal bottom sheet
- Tabs com scroll horizontal
- Controles otimizados para toque

---

## Animações e Transições

### Micro-interações

1. **Click em botão**: Scale 0.95 + feedback tátil (mobile)
2. **Hover em card**: Elevação suave (shadow)
3. **Tabs**: Slide horizontal suave
4. **Collapse/Expand**: Height transition 300ms ease
5. **Auto-save**: Fade in/out no badge de status
6. **Validação**: Shake animation se erro

### Tempos

- Transições rápidas: 150ms
- Transições médias: 300ms
- Transições longas: 500ms
- Debounce auto-save: 2000ms

---

## Paleta de Cores e Tipografia

### Cores Principais

```css
/* Cores Primárias */
--primary-blue: #3B82F6;      /* Botões principais */
--primary-blue-dark: #2563EB; /* Hover */

/* Cores de Status */
--success-green: #10B981;     /* Salvo, completo */
--warning-yellow: #F59E0B;    /* Atenção */
--error-red: #EF4444;         /* Erro */
--info-cyan: #06B6D4;         /* Informativo */

/* Neutros */
--slate-50: #F8FAFC;          /* Background */
--slate-100: #F1F5F9;         /* Cards */
--slate-200: #E2E8F0;         /* Borders */
--slate-600: #475569;         /* Text secondary */
--slate-900: #0F172A;         /* Text primary */

/* Destaques SOAP */
--soap-s: #3B82F6;  /* Azul - Subjetivo */
--soap-o: #10B981;  /* Verde - Objetivo */
--soap-a: #8B5CF6;  /* Roxo - Avaliação */
--soap-p: #F97316;  /* Laranja - Plano */
```

### Tipografia

```css
/* Fontes */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace; /* Timer */

/* Tamanhos */
--text-xs: 0.75rem;   /* 12px - Labels, meta */
--text-sm: 0.875rem;  /* 14px - Corpo */
--text-base: 1rem;    /* 16px - Padrão */
--text-lg: 1.125rem;  /* 18px - Subtítulos */
--text-xl: 1.25rem;   /* 20px - Títulos */
--text-2xl: 1.5rem;   /* 24px - Heading */

/* Pesos */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Acessibilidade (a11y)

### WCAG 2.1 AA Compliance

1. **Contraste**: Mínimo 4.5:1 para texto normal
2. **Navegação por Teclado**: Todos os elementos interativos acessíveis via Tab
3. **ARIA Labels**: Buttons, inputs e regiões semânticas
4. **Focus Visible**: Outline claro em elementos focados
5. **Textos Alternativos**: Todas as imagens e ícones
6. **Heading Hierarchy**: H1 → H2 → H3 lógica

### Screen Reader Support

```html
<!-- Exemplo de markup acessível -->
<button
  aria-label="Salvar sessão"
  aria-describedby="save-status"
  aria-keyshortcuts="Control+S"
>
  Salvar
</button>

<div id="save-status" role="status" aria-live="polite">
  Salvo automaticamente há 5 segundos
</div>
```

---

## Performance

### Otimizações

1. **Code Splitting**: Lazy load de tabs não ativas
2. **Virtual Scrolling**: Lista de histórico longa
3. **Debounce**: Auto-save, validação
4. **Memoization**: Componentes complexos (React.memo)
5. **Imagens**: Lazy loading + compressão

### Métricas Alvo

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## Testes de Usabilidade

### Cenários de Teste

1. **Novo Usuário**: Consegue preencher primeira sessão sem ajuda?
2. **Usuário Experiente**: Consegue completar sessão em < 3 minutos?
3. **Interrupção**: O que acontece se navegador fechar durante registro?
4. **Repetição de Conduta**: Fluxo é intuitivo e rápido?
5. **Uso de IA**: Usuário entende e confia nas sugestões?

### Métricas de Sucesso

- **Taxa de Conclusão**: > 95%
- **Tempo Médio de Preenchimento**: < 5 minutos
- **Taxa de Erro**: < 5%
- **Satisfação (NPS)**: > 8/10
- **Taxa de Adoção de IA**: > 60%

---

## Roadmap de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] Criar novo componente de layout (3 painéis)
- [ ] Implementar header fixo
- [ ] Sistema de tabs básico
- [ ] Migrar formulário SOAP para novo layout

### Fase 2: Funcionalidades Core (Semana 3-4)
- [ ] Painel esquerdo com ações rápidas
- [ ] Painel direito com contexto
- [ ] Sistema de salvamento otimizado
- [ ] Validações e feedback visual

### Fase 3: Inteligência (Semana 5-6)
- [ ] Tab de IA com sugestões
- [ ] Tab de métricas avançadas
- [ ] Sistema de alertas inteligentes
- [ ] Repetição de conduta melhorada

### Fase 4: Polimento (Semana 7-8)
- [ ] Animações e transições
- [ ] Atalhos de teclado
- [ ] Responsividade completa
- [ ] Testes de usabilidade
- [ ] Ajustes finais

---

## Referências de Design

### Inspirações

1. **Linear.app**: Sistema de tabs e atalhos de teclado
2. **Notion**: Layout flexível e responsivo
3. **Figma**: Painéis colapsáveis e hierarquia visual
4. **VS Code**: Sistema de abas e sidebar
5. **Gmail**: Composição de email com auto-save

### Bibliotecas Recomendadas

- **Radix UI**: Componentes acessíveis headless
- **Framer Motion**: Animações declarativas
- **React Hook Form**: Formulários performáticos
- **Zod**: Validação de schemas
- **Tailwind CSS**: Estilização utilitária

---

## Conclusão

Esta repaginação transforma a página de atendimento de uma **interface sobrecarregada** em um **sistema focado e eficiente**. Os principais ganhos são:

✅ **Foco**: Uma tarefa por vez, sem distrações
✅ **Eficiência**: Atalhos e automações para usuários experientes
✅ **Clareza**: Hierarquia visual clara e progressão guiada
✅ **Contexto**: Informações importantes sempre acessíveis
✅ **Inteligência**: IA como assistente, não substituto

O resultado é uma experiência que **respeita o tempo do profissional** e **potencializa a qualidade do atendimento**.
