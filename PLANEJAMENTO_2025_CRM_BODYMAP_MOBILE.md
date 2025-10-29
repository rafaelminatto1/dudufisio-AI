# 📋 PLANEJAMENTO COMPLETO 2025 - CRM + Body Map + Mobile iOS

**Data de Criação:** 28 de Outubro de 2025
**Última Atualização:** 28 de Outubro de 2025
**Status Geral:** 🟡 Em Desenvolvimento Ativo

---

## 🎯 VISÃO GERAL DO PROJETO

**DuduFisio AI** é um sistema completo de gestão de clínica de fisioterapia com foco em:
- ⚡ Pacientes esportistas
- 🏥 Pós-cirúrgicos
- 👴 Idosos (fisioterapia ortopédica)

### Equipe e Escala
- **2 Fisioterapeutas** (acesso total)
- **1 Administrador** (acesso total)
- **4 Estagiários** (acesso limitado)
- **~600 pacientes/mês**
- **Clínica já operacional** (migrando de outro sistema)

### Plataformas
- ✅ **Web App** (React 19 + TypeScript + Vite)
- 📱 **Mobile iOS** (React Native/Expo - em desenvolvimento)
- 🔄 **Sincronização Supabase** (offline-first)

---

## 📊 STATUS ATUAL - ANÁLISE COMPLETA

### ✅ FUNCIONALIDADES COMPLETAS (90-100%)
1. ✅ **Patient Management** - Cadastro, histórico, fichas (95%)
2. ✅ **Appointment Scheduling** - Agenda semanal, recorrência (90%)
3. ✅ **Pain Map Service (Backend)** - Lógica de negócio completa (95%)
4. ✅ **CRM Lead Management** - CRUD, scoring, conversão (80%)
5. ✅ **WhatsApp Integration** - Twilio + Meta API (90%)

### ⚠️ FUNCIONALIDADES PARCIAIS (40-80%)
1. ⚠️ **Body Map Visualization (UI)** - Muito básica e confusa (40%)
2. ⚠️ **CRM Analytics** - Dashboard simples (60%)
3. ⚠️ **Automation Engine** - Motor existe, poucos triggers (70%)
4. ⚠️ **Session Evolution Integration** - Mapa não integrado bem (50%)

### ❌ FUNCIONALIDADES FALTANDO (0-40%)
1. ❌ **WhatsApp Webhook Verification** - Obrigatório para produção (0%)
2. ❌ **3D Body Visualization** - Não existe (0%)
3. ❌ **Patient Pain Diary** - Estrutura existe mas sem UI (20%)
4. ❌ **Advanced CRM Reporting** - Não implementado (0%)
5. ❌ **iOS Mobile App** - Não iniciado (0%)
6. ❌ **Lead Assignment UI** - Campo existe mas sem interface (0%)
7. ❌ **Pain Evolution Charts** - Não existe (0%)

---

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO

### Body Map - UI Confusa e Não Intuitiva

**Problema relatado pelo usuário:**
> "Estava bem feio e não dava para entender que era um corpo para selecionar qual parte seria clicável"

**Análise técnica:**
- SVG muito simplificado (círculos e linhas básicas)
- Não parece um corpo humano anatomicamente
- Pontos clicáveis muito pequenos (r="3")
- Sem labels nas regiões
- Sem feedback visual adequado
- Cores confusas

**Impacto:** 🔴 **CRÍTICO** - É feature central do sistema

---

## 🚀 FASES DE DESENVOLVIMENTO

### ⭐ FASE 1: CORREÇÕES CRÍTICAS (3 semanas)
**Objetivo:** Tornar o sistema 100% funcional para uso imediato

#### 1.1 - Webhook WhatsApp Meta API
**Prioridade:** 🔴 CRÍTICO (sem isso WhatsApp não funciona em produção)

**Tarefas:**
- [ ] Implementar verificação de webhook (GET endpoint)
- [ ] Adicionar autenticação de mensagens recebidas
- [ ] Testar com WhatsApp Business API real
- [ ] Configurar variáveis de ambiente no Vercel

**Arquivos:**
- [api/webhooks/whatsapp.ts](api/webhooks/whatsapp.ts:3) - TODO existente
- `.env.local` - WHATSAPP_VERIFY_TOKEN

**Tempo estimado:** 2-3 dias

---

#### 1.2 - Redesign COMPLETO do Body Map 🎨
**Prioridade:** 🔴 CRÍTICO (feature central + problema reportado)

**PROBLEMA ATUAL:**
```tsx
// BodyMap.tsx - SVG muito simplificado
<circle cx="150" cy="60" r="40" fill="#f1f5f9" /> // Cabeça
<line x1="150" y1="100" x2="150" y2="120" />     // Pescoço
<ellipse cx="150" cy="200" rx="60" ry="80" />    // Torso
```

❌ Não parece um corpo
❌ Difícil de clicar
❌ Sem labels
❌ Sem anatomia clara

**SOLUÇÃO PROPOSTA:**

##### Opção A: SVG Anatômico Profissional (RECOMENDADO)
Usar biblioteca `react-body-highlighter` ou criar SVG custom com:
- Regiões anatômicas definidas por polígonos
- Labels em cada região
- Cores diferentes por grupo muscular
- Hover effects claros
- Click em áreas grandes (não pontos pequenos)

##### Opção B: 3D Interativo
- Usar `@react-three/fiber`
- Modelo 3D do corpo humano
- Mais complexo mas visual impressionante

**DECISÃO:** Fazer PRIMEIRO Opção A (2D profissional), depois avaliar 3D

**Novo Design Proposto:**

```tsx
// BodyMapProfessional.tsx (NOVO)
interface BodyRegion {
  id: string;
  name: string;
  path: string;        // SVG path da região
  color: string;       // Cor base
  group: 'head' | 'torso' | 'upper_limb' | 'lower_limb';
}

const BODY_REGIONS_FRONT: BodyRegion[] = [
  {
    id: 'cervical',
    name: 'Cervical',
    path: 'M 145,90 L 155,90 L 155,110 L 145,110 Z',
    color: '#60a5fa',
    group: 'head'
  },
  {
    id: 'shoulder_left',
    name: 'Ombro Esquerdo',
    path: 'M 110,110 L 140,110 L 135,130 L 105,130 Z',
    color: '#34d399',
    group: 'upper_limb'
  },
  // ... 50+ regiões anatômicas
];

// Features:
// 1. Polígonos grandes e clicáveis
// 2. Hover → região ilumina + mostra nome
// 3. Click → modal com intensidade dor
// 4. Heatmap de intensidade (gradiente de cores)
// 5. Comparação lado a lado (antes/depois)
```

**Componentes a Criar:**
```
components/body-map-pro/
├── BodyMapSVG.tsx              // SVG anatômico realista
├── BodyRegionPolygon.tsx       // Região clicável individual
├── PainIntensityModal.tsx      // Modal ao clicar
├── PainIntensitySlider.tsx     // Slider 0-10 com emojis
├── PainTypeSelector.tsx        // Tipo de dor (aguda, latejante, etc)
├── BodyMapHeatmap.tsx          // Heatmap de intensidade
├── BodyMapComparison.tsx       // Comparação sessões
├── BodyMapLegend.tsx           // Legenda de cores
└── body-regions-data.ts        // Dados das regiões SVG
```

**Mockup Textual:**
```
┌────────────────────────────────────────────────┐
│  Mapa de Dor - Paciente: João Silva           │
│  [Frente] [Costas] [Comparar]  [3D - futuro]  │
├────────────────────────────────────────────────┤
│                                                │
│         ┌─────┐                                │
│         │  🧑  │  ← Cabeça (hover: "Cervical") │
│         └──┬──┘                                │
│      ┌─────┴─────┐                             │
│      │           │  ← Tórax (clique aqui)     │
│      │  TÓRAX    │  ← Verde = sem dor          │
│      └───────────┘                             │
│       /         \                               │
│      /   OMBRO   \  ← Laranja = dor moderada  │
│     │   (HOVER)   │ ← Mostra "Dor 6/10"       │
│      \           /                              │
│                                                │
│  Legenda:                                      │
│  🟢 Sem dor  🟡 Leve  🟠 Moderada  🔴 Intensa  │
└────────────────────────────────────────────────┘
```

**Modal ao Clicar:**
```
┌────────────────────────────────────┐
│  Região: Ombro Esquerdo            │
├────────────────────────────────────┤
│  Intensidade da Dor:               │
│  😊 [━━━━●━━━━━] 😭  (6/10)        │
│                                    │
│  Tipo de Dor:                      │
│  ○ Aguda  ● Latejante  ○ Queimação│
│  ○ Formigamento  ○ Pontada         │
│                                    │
│  Observações:                      │
│  ┌──────────────────────────────┐ │
│  │ Dor ao movimento acima...    │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Cancelar]  [Salvar]             │
└────────────────────────────────────┘
```

**Arquivos a Modificar:**
1. [components/BodyMap.tsx](components/BodyMap.tsx:1-355) → Substituir completamente
2. [components/evolution/cards/PainMapCard.tsx](components/evolution/cards/PainMapCard.tsx:1-150) → Usar novo componente
3. [components/atendimento/metrics/BodyMapInteractive.tsx](components/atendimento/metrics/BodyMapInteractive.tsx:1-373) → Refatorar

**Referências de Design:**
- App Osmosis (medical education)
- App Visible Body
- Gray's Anatomy illustrations
- Physiotec (software de fisioterapia)

**Tempo estimado:** 5-7 dias

---

#### 1.3 - Gráficos de Evolução da Dor
**Prioridade:** 🟡 ALTA (solicitado explicitamente)

**Features:**
1. **Linha do Tempo** - Dor média por sessão
2. **Heatmap Calendar** - Dor por dia (estilo GitHub contributions)
3. **Área Stacked** - Distribuição de dor por região
4. **Radar Chart** - Intensidade por região anatômica
5. **Bar Chart** - Comparação sessão anterior vs atual

**Componentes:**
```
components/body-map-pro/charts/
├── PainTimelineChart.tsx      // Linha do tempo
├── PainHeatmapCalendar.tsx    // Calendar heatmap
├── PainByRegionChart.tsx      // Stacked area
├── PainRadarChart.tsx         // Radar chart
└── SessionComparisonChart.tsx // Comparação barras
```

**Integração:**
- Botão "Ver Gráficos" no Body Map
- Modal ou sidebar com gráficos
- Export para PDF

**Library:** Recharts (já usado no projeto)

**Tempo estimado:** 3-4 dias

---

#### 1.4 - Botão "Gerar Relatório de Evolução"
**Prioridade:** 🟡 ALTA (solicitado explicitamente)

**Features:**
- PDF com logo da clínica
- Dados do paciente
- Mapa de dor (antes/depois)
- Gráficos de evolução
- Notas do fisioterapeuta
- Exercícios prescritos
- Assinatura digital

**Library:** `react-pdf` ou `jsPDF`

**Componente:**
```tsx
// components/reports/PainEvolutionReport.tsx
const PainEvolutionReport = ({ patientId, sessionIds }) => {
  return (
    <PDFDownloadLink document={<ReportPDF />} fileName="evolucao.pdf">
      {({ loading }) => (
        <button>
          {loading ? 'Gerando...' : 'Gerar Relatório PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};
```

**Tempo estimado:** 2-3 dias

---

#### 1.5 - Integração Mapa de Dor nas Sessões
**Prioridade:** 🔴 CRÍTICO (solicitado explicitamente)

**Features solicitadas:**
- [x] **A) Abrir automaticamente** - Popup no início da sessão "Registrar dor?"
- [x] **B) Comparação automática** - Lado a lado com sessão anterior
- [x] **C) Alertas de dor** - Se dor aumentou
- [x] **D) Botão gerar relatório** - PDF com evolução
- [x] **E) Criar gráficos** - Evolução da dor

**Implementação:**
```tsx
// pages/SessionPage.tsx ou similar
useEffect(() => {
  // Ao abrir sessão, mostrar modal
  if (isNewSession && !painMapCompleted) {
    setPainMapModalOpen(true);
  }
}, [isNewSession]);

// Modal com Body Map + Comparação + Alertas
<PainMapSessionModal
  patientId={patientId}
  previousSession={previousSession}
  onSave={handleSavePainMap}
  showComparison={true}
  showAlerts={true}
/>
```

**Alertas Automáticos:**
```tsx
// Verificar se dor aumentou
if (currentPain > previousPain + 2) {
  showAlert('⚠️ Dor aumentou significativamente na região X');
}

// Novas áreas de dor
if (newPainRegions.length > 0) {
  showAlert('🆕 Novas áreas de dor identificadas');
}

// Dor severa
if (painLevel > 8) {
  showAlert('🚨 Dor severa (>8). Considerar reavaliação.');
}
```

**Tempo estimado:** 4-5 dias

---

#### 1.6 - Testes End-to-End
**Prioridade:** 🟡 ALTA

**Fluxo a testar:**
1. Lead WhatsApp → Agendamento
2. Sessão → Registro Body Map
3. Comparação com sessão anterior
4. Gráficos de evolução
5. Gerar relatório PDF

**Tempo estimado:** 2 dias

---

### ⭐ FASE 2: CRM COMPLETO (4 semanas)

#### 2.1 - Dashboard Avançado de Analytics
**Prioridade:** 🟢 MÉDIA

**Features:**
- [ ] ROI por canal (WhatsApp, Instagram, Google)
- [ ] Funil de conversão interativo
- [ ] Cohort analysis (retenção)
- [ ] Previsão de receita (IA Gemini)
- [ ] Heatmap de horários de conversão

**Componentes:**
```
components/crm/analytics/
├── ROIByChannelChart.tsx
├── ConversionFunnelAdvanced.tsx
├── CohortAnalysisTable.tsx
├── RevenueForecastChart.tsx
└── ConversionHeatmap.tsx
```

**Tempo estimado:** 1 semana

---

#### 2.2 - Sistema de Atribuição de Leads
**Prioridade:** 🟡 ALTA

**Features:**
- [ ] UI para atribuir leads à equipe
- [ ] Load balancing automático
- [ ] Dashboard por membro
- [ ] Notificações de atribuição

**Permissões:**
- Admin: atribui livremente
- Fisio: atribui para si ou estagiários
- Estagiário: não pode atribuir

**Componente:**
```tsx
// components/crm/LeadAssignment.tsx
<select onChange={handleAssign}>
  <option>Selecionar fisioterapeuta...</option>
  <option value="fisio1">Dr. João (12 leads)</option>
  <option value="fisio2">Dra. Maria (8 leads)</option>
  <option value="estagiario1">Estagiário Carlos (5 leads)</option>
</select>
```

**Tempo estimado:** 3-4 dias

---

#### 2.3 - Import/Export em Massa
**Prioridade:** 🟢 MÉDIA

**Features:**
- [ ] Upload CSV/Excel de leads
- [ ] Validação com Zod
- [ ] Preview antes de importar
- [ ] Export com filtros
- [ ] Templates de CSV

**Library:** `papaparse` (CSV) + `xlsx` (Excel)

**Tempo estimado:** 3-4 dias

---

#### 2.4 - Filtros Avançados + Busca
**Prioridade:** 🟢 MÉDIA

**Features:**
- [ ] Filtros por múltiplos campos
- [ ] Salvar filtros personalizados
- [ ] Busca full-text (Supabase FTS)
- [ ] Tags customizáveis

**Tempo estimado:** 3-4 dias

---

### ⭐ FASE 3: WHATSAPP AVANÇADO (3 semanas)

#### 3.1 - Envio de Arquivos (Imagens/PDFs)
**Prioridade:** 🟢 MÉDIA

**Meta API Limits:**
- Imagem: 5 MB (JPG, PNG)
- Vídeo: 16 MB (MP4)
- Documento: 100 MB (PDF, DOC)

**Use cases:**
- Enviar protocolos em PDF
- Fotos de exercícios
- Vídeos de demonstração

**Tempo estimado:** 3-4 dias

---

#### 3.2 - Biblioteca de Templates
**Prioridade:** 🟢 MÉDIA

**Features:**
- [ ] CRUD de templates
- [ ] Variáveis: `{nome}`, `{data}`, `{horario}`
- [ ] Categorias (boas-vindas, lembrete, confirmação)
- [ ] Estatísticas de uso
- [ ] Aprovação Meta (templates oficiais)

**Exemplo:**
```
Olá {nome}! Sua consulta está confirmada para {data} às {horario}.
Aguardamos você! 😊
```

**Tempo estimado:** 4-5 dias

---

#### 3.3 - Chatbot IA para FAQ e Triagem
**Prioridade:** 🟡 ALTA (reduz carga de trabalho)

**Capabilities:**
- [ ] Responder FAQ automaticamente
- [ ] Triagem inicial (dor, localização, urgência)
- [ ] Sugerir agendamento
- [ ] Escalar para humano quando necessário
- [ ] Aprendizado com interações

**Gemini Integration:**
```typescript
const chatbotPrompt = `
Você é assistente virtual da Clínica DuduFisio.
Responda de forma educada e profissional.

Se o paciente relatar:
- Dor >7: Sugerir agendamento urgente
- Dúvida sobre exercício: Responder baseado em protocolos
- Cancelamento/reagendamento: Confirmar e processar

Histórico:
${conversationHistory}

Mensagem do paciente: "${userMessage}"
`;
```

**Tempo estimado:** 1 semana

---

#### 3.4 - Integração Chatbot + Agenda
**Prioridade:** 🟡 ALTA

**Features:**
- [ ] Bot consulta agenda em tempo real
- [ ] Oferece horários disponíveis
- [ ] Confirma agendamento automaticamente
- [ ] Envia confirmação + Google Calendar

**Tempo estimado:** 3-4 dias

---

### ⭐ FASE 4: MOBILE iOS APP (8 semanas)

#### 6.1 - Setup React Native / Expo
**Decisão:** Usar **Expo Managed Workflow**

**Vantagens:**
- Setup rápido
- OTA updates
- EAS Build para TestFlight
- Expo Router (file-based)

**Estrutura:**
```
dudufisio-mobile/
├── app/                    (Expo Router)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (patient)/          // App do Paciente
│   │   ├── home.tsx
│   │   ├── pain-diary.tsx
│   │   ├── exercises.tsx
│   │   └── messages.tsx
│   ├── (fisio)/            // App do Fisioterapeuta
│   │   ├── agenda.tsx
│   │   ├── patients.tsx
│   │   ├── session.tsx
│   │   └── body-map.tsx
│   └── _layout.tsx
├── components/
├── services/              // Shared com web (Supabase)
└── package.json
```

**Tempo estimado:** 3-4 dias

---

#### 6.2 - App do Paciente
**Prioridade:** 🟡 ALTA (engagement)

**Features:**
- [ ] Login (SMS OTP)
- [ ] Ver próximas consultas
- [ ] Diário de dor diário
- [ ] Biblioteca de exercícios prescritos
- [ ] Vídeos de demonstração
- [ ] Chat com fisio
- [ ] Notificações push

**Screens:**
1. **Home** - Dashboard com próximas sessões
2. **Diário de Dor** - Registrar dor diária + body map simplificado
3. **Exercícios** - Lista de exercícios prescritos com vídeos
4. **Mensagens** - Chat direto com fisioterapeuta
5. **Perfil** - Dados pessoais

**Tempo estimado:** 3 semanas

---

#### 6.3 - App do Fisioterapeuta
**Prioridade:** 🟡 ALTA

**Features:**
- [ ] Ver agenda do dia
- [ ] Check-in de paciente (QR code)
- [ ] Registro rápido de evolução
- [ ] Body Map mobile (touch-friendly)
- [ ] Prescrição de exercícios
- [ ] Mensagens
- [ ] Notificações de emergência

**Screens:**
1. **Agenda** - Lista do dia + filtros
2. **Paciente** - Ficha rápida
3. **Evolução Rápida** - Form simplificado + voz-para-texto
4. **Body Map Mobile** - Touch-friendly
5. **Prescrição** - Adicionar exercícios

**Tempo estimado:** 3 semanas

---

#### 6.4 - Sincronização Offline-First
**Prioridade:** 🟡 ALTA (essencial para mobile)

**Tech Stack:**
- Supabase Realtime
- AsyncStorage (cache)
- NetInfo (conexão)
- Queue de ações offline

**Strategy:**
```typescript
if (isOnline) {
  await supabase.from('sessions').insert(data);
} else {
  await AsyncStorage.setItem('pending_sessions', JSON.stringify(data));
  // Sincronizar quando voltar online
}
```

**Tempo estimado:** 1 semana

---

#### 6.5 - Notificações Push
**Prioridade:** 🟢 MÉDIA

**Triggers:**
- Lembrete de consulta (1h antes)
- Alerta de dor paciente (>8)
- Nova mensagem
- Novo agendamento
- Lembrete de exercícios

**Tech:** Expo Push Notifications + FCM

**Tempo estimado:** 3-4 dias

---

#### 6.6 - TestFlight
**Prioridade:** 🟡 ALTA

**Steps:**
- [ ] Apple Developer Account ($99/ano)
- [ ] Criar App ID
- [ ] EAS Build
- [ ] Upload TestFlight
- [ ] Convidar equipe (max 100 internal testers)

**Timeline:** 1-2 semanas (aprovação Apple)

**Tempo estimado:** 1 semana

---

### ⭐ FASE 5: FEATURES ESPECÍFICAS (4 semanas)

#### 8.1 - Avaliação Funcional Esportiva
**Prioridade:** 🟢 MÉDIA

**Testes:**
- FMS (Functional Movement Screen)
- Y-Balance Test
- Hop Tests
- Isocinético
- ROM (goniometria)

**Tempo estimado:** 1 semana

---

#### 8.2 - Protocolos Pré/Pós-Cirúrgicos
**Prioridade:** 🟡 ALTA (foco do negócio)

**Cirurgias:**
- LCA (ligamento cruzado anterior)
- Menisco
- Ombro (manguito rotador)
- Prótese joelho/quadril

**Features:**
- [ ] Biblioteca de protocolos por fase
- [ ] Timeline de progressão
- [ ] Alertas de precauções
- [ ] Critérios de progressão

**Tempo estimado:** 1,5 semanas

---

#### 8.3 - Biblioteca de Exercícios com Vídeos
**Prioridade:** 🟡 ALTA

**Conteúdo:**
- 200+ exercícios
- Vídeos (Vimeo/YouTube)
- Categorias
- Prescrição personalizada
- Envio via WhatsApp

**Tempo estimado:** 1,5 semanas

---

### ⭐ FASE 6: DEPLOY + MONITORAMENTO (3 semanas)

#### 9.1 - Setup Produção
- [ ] Vercel deploy automático
- [ ] Supabase production
- [ ] Custom domain
- [ ] HTTPS

**Tempo estimado:** 2-3 dias

---

#### 9.2 - CI/CD GitHub Actions
**Tempo estimado:** 2-3 dias

---

#### 9.3 - Logging (Sentry)
**Tempo estimado:** 2 dias

---

#### 9.4 - Backup Automatizado
**Tempo estimado:** 1 dia

---

#### 9.5 - Documentação
**Tempo estimado:** 1 semana

---

## 📅 CRONOGRAMA RESUMIDO

| Fase | Duração | Início | Fim |
|------|---------|--------|-----|
| **Fase 1** - Correções Críticas | 3 semanas | Semana 1 | Semana 3 |
| **Fase 2** - CRM Completo | 4 semanas | Semana 4 | Semana 7 |
| **Fase 3** - WhatsApp Avançado | 3 semanas | Semana 8 | Semana 10 |
| **Fase 4** - Mobile iOS | 8 semanas | Semana 11 | Semana 18 |
| **Fase 5** - Features Específicas | 4 semanas | Semana 19 | Semana 22 |
| **Fase 6** - Deploy + Docs | 3 semanas | Semana 23 | Semana 25 |

**TOTAL:** ~25 semanas (~6 meses)

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Agora (Próximas Horas):
1. ✅ Análise completa do código - FEITO
2. ✅ Planejamento detalhado - FEITO
3. 🔄 **Começar Fase 1.2** - Redesign Body Map

### Esta Semana:
- Redesign completo Body Map (UI + UX)
- Webhook WhatsApp
- Gráficos de evolução

---

## 🤝 PERGUNTAS PARA O USUÁRIO

1. **Body Map Design:** Aprovar mockup antes de implementar?
2. **Mobile:** Priorizar app paciente ou fisio primeiro?
3. **Biblioteca de Exercícios:** Já tem vídeos ou precisa criar?
4. **Budget:** Tem budget para ferramentas pagas? (BioDigital 3D, Vimeo Pro)
5. **Timeline:** Alguma deadline específica?

---

## 📝 DECISÕES TOMADAS

1. ✅ Fazer Body Map 2D profissional ANTES de 3D
2. ✅ Usar Expo para mobile (não React Native puro)
3. ✅ Usar Recharts para gráficos
4. ✅ Usar react-pdf para relatórios
5. ✅ Focar em iOS primeiro (Android depois)
6. ✅ Trabalhar "sem pressa" conforme solicitado

---

**Criado por:** Claude Code (Anthropic)
**Última revisão:** 28 de Outubro de 2025
