# 📊 DuduFisio AI - Workflows e Wireframes do Sistema

## 📑 Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Fluxos de Trabalho Principais](#fluxos-de-trabalho-principais)
3. [Wireframes por Módulo](#wireframes-por-módulo)
4. [Diagramas de Integração](#diagramas-de-integração)
5. [Fluxos de Dados](#fluxos-de-dados)

---

## 🏗️ Visão Geral da Arquitetura

### Stack Tecnológico
```
┌─────────────────────────────────────────────────┐
│              Frontend (React 18)                │
│  ┌────────────────────────────────────────┐    │
│  │  Next.js 14 + TypeScript + Tailwind    │    │
│  │  shadcn/ui + Radix UI + Framer Motion  │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                    ↕ HTTP/REST
┌─────────────────────────────────────────────────┐
│         Backend Services (Supabase)             │
│  ┌────────────────────────────────────────┐    │
│  │  PostgreSQL + Row Level Security (RLS) │    │
│  │  Realtime Subscriptions + Auth         │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│          Integrações Externas                   │
│  • Google Gemini AI (IA Clínica)              │
│  • Google Calendar (Agendamento)               │
│  • WhatsApp Business (Comunicação)             │
│  • Resend (Email)                              │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Trabalho Principais

### 1. Fluxo de Autenticação e Autorização

```
┌─────────────┐
│   Login     │
│   Page      │
└──────┬──────┘
       │
       ↓
┌──────────────────────────┐
│  Supabase Auth Service   │
│  - Email/Password        │
│  - OAuth (Google)        │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│   Validar Credenciais    │
│   + Verificar Perfil     │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│         Redirecionar por Role            │
├──────────┬──────────┬──────────┬─────────┤
│  Admin   │ Therapist│ Patient  │ Partner │
└────┬─────┴────┬─────┴────┬─────┴────┬────┘
     │          │          │          │
     ↓          ↓          ↓          ↓
┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐
│ Admin   │ │Therapist │ │Patient │ │Partner │
│Dashboard│ │Dashboard │ │Portal  │ │Portal  │
└─────────┘ └──────────┘ └────────┘ └────────┘
```

**Regras de Segurança (RLS):**
- Cada usuário só acessa seus próprios dados
- Terapeutas acessam dados dos pacientes sob seus cuidados
- Admins têm acesso completo (via policies específicas)
- Pacientes veem apenas seus próprios registros

---

### 2. Fluxo de Agendamento Inteligente

```
┌─────────────────────────────────────────────────┐
│         AGENDAMENTO COM IA                      │
└─────────────────────────────────────────────────┘

FASE 1: Criação de Agendamento
┌──────────────┐
│   Usuário    │
│  seleciona   │
│  terapeuta + │
│  data/hora   │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│  Sistema valida      │
│  disponibilidade     │
│  • Horários livres   │
│  • Bloqueios         │
│  • Conflitos         │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────┐
│  IA analisa contexto     │
│  • Histórico do paciente │
│  • Risco de No-Show      │
│  • Otimização de recursos│
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────┐
│  Cria appointment    │
│  • Envia notificação │
│  • Atualiza agenda   │
│  • Sincroniza Google │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────┐
│  Sistema adiciona à      │
│  fila de lembretes       │
│  • 24h antes: WhatsApp   │
│  • 1h antes: Push        │
└──────────────────────────┘

FASE 2: Prevenção de No-Show
┌──────────────────────────┐
│  NoShowPredictor analisa │
│  • Taxa histórica        │
│  • Padrão de cancelamento│
│  • Fatores de risco      │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Se risco ALTO:          │
│  • Confirmação prévia    │
│  • Contato extra         │
│  • Overbooking inteligente│
└──────────────────────────┘

FASE 3: Otimização de Recursos
┌──────────────────────────┐
│  ResourceOptimizer       │
│  • Aloca melhor sala     │
│  • Distribui equipamentos│
│  • Minimiza conflitos    │
└──────────────────────────┘
```

---

### 3. Fluxo de Atendimento Clínico (SOAP)

```
┌─────────────────────────────────────────────────┐
│     JORNADA DO ATENDIMENTO CLÍNICO              │
└─────────────────────────────────────────────────┘

PRÉ-CONSULTA
┌──────────────────┐
│  Check-in QR     │
│  • Paciente chega│
│  • Escaneia QR   │
│  • Confirma dados│
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│  Sistema prepara ficha   │
│  • Última evolução       │
│  • Alertas clínicos      │
│  • Histórico resumido    │
└────────┬─────────────────┘

DURANTE CONSULTA
         │
         ↓
┌──────────────────────────────────────────┐
│        PÁGINA DE ATENDIMENTO             │
│  ┌────────────────────────────────────┐  │
│  │   VISÃO DO PACIENTE (Lateral)      │  │
│  │   • Dados pessoais                 │  │
│  │   • Queixas ativas                 │  │
│  │   • Cirurgias (c/ tempo calculado) │  │
│  │   • Alergias e alertas             │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │   FORMULÁRIO SOAP (Centro)         │  │
│  │                                    │  │
│  │   S - SUBJETIVO                    │  │
│  │   ├─ Queixa do paciente            │  │
│  │   └─ Sugestão IA ►                 │  │
│  │                                    │  │
│  │   O - OBJETIVO                     │  │
│  │   ├─ Exame físico                  │  │
│  │   └─ Sugestão IA ►                 │  │
│  │                                    │  │
│  │   A - AVALIAÇÃO                    │  │
│  │   ├─ Diagnóstico fisioterápico     │  │
│  │   └─ Sugestão IA ►                 │  │
│  │                                    │  │
│  │   P - PLANO                        │  │
│  │   ├─ Conduta/Tratamento            │  │
│  │   └─ Sugestão IA ►                 │  │
│  │                                    │  │
│  │   [🔁 Repetir Conduta Anterior]    │  │
│  │   [💾 Auto-save ativo]             │  │
│  │   [✅ Finalizar e Assinar]         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │   HISTÓRICO DE SESSÕES (Inferior)  │  │
│  │   • Timeline de evoluções          │  │
│  │   • Gráfico de dor                 │  │
│  │   • Progresso do tratamento        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Salva evolução          │
│  • Cria clinical_document│
│  • Vincula a appointment │
│  • Registra audit_trail  │
└────────┬─────────────────┘

PÓS-CONSULTA
         │
         ↓
┌──────────────────────────────┐
│  Gera documentos             │
│  • Laudo se necessário       │
│  • Prescrição de exercícios  │
│  • Orientações para casa     │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Notifica paciente           │
│  • Resumo da sessão          │
│  • Link para exercícios      │
│  • Próxima consulta          │
└──────────────────────────────┘
```

---

### 4. Fluxo de Prontuário Eletrônico (HL7 FHIR)

```
┌─────────────────────────────────────────────────┐
│    SISTEMA DE PRONTUÁRIO ELETRÔNICO             │
│    (Compliance CFM/COFFITO/LGPD)                │
└─────────────────────────────────────────────────┘

CRIAÇÃO DE DOCUMENTO
┌──────────────────┐
│ Terapeuta cria   │
│ novo documento   │
│ • Tipo: Avaliação│
│ • Template: Ortop│
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│  Sistema carrega         │
│  clinical_template       │
│  • Schema JSON           │
│  • Validações            │
│  • Valores padrão        │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Preenche formulário     │
│  • Auto-save (draft)     │
│  • Versionamento auto    │
│  • Status: "draft"       │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Validações de Compliance│
│  ✓ CFM: Campos obrig.    │
│  ✓ COFFITO: Assinatura   │
│  ✓ LGPD: Consentimento   │
│  ✓ FHIR: Estrutura       │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Terapeuta assina        │
│  digitalmente            │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Sistema:                    │
│  1. Cria digital_signature   │
│  2. Hash do documento        │
│  3. Timestamp                │
│  4. is_signed = TRUE         │
│  5. Status = "signed"        │
│  6. Documento IMUTÁVEL       │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Auditoria automática        │
│  • Registra em audit_trail   │
│  • Ação: "sign"              │
│  • IP + User Agent           │
└──────────────────────────────┘

CONSULTA DE DOCUMENTO
┌──────────────────┐
│ Usuário acessa   │
│ prontuário       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│  RLS valida permissão    │
│  • Criador do documento? │
│  • Terapeuta do paciente?│
│  • Admin autorizado?     │
└────────┬─────────────────┘
         │
         ↓ (se autorizado)
┌──────────────────────────┐
│  Exibe documento         │
│  • Registra acesso       │
│  • audit_trail: "read"   │
└──────────────────────────┘

ARQUIVAMENTO
┌──────────────────────────┐
│  Sistema automatizado    │
│  verifica documentos     │
│  antigos (job noturno)   │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Para docs > 5 anos:         │
│  1. Criptografa              │
│  2. Gera checksum            │
│  3. Move para archive        │
│  4. Define retention_policy  │
│  5. Calcula expires_at       │
└──────────────────────────────┘
```

---

### 5. Fluxo de Prescrição de Exercícios

```
┌─────────────────────────────────────────────────┐
│     SISTEMA DE PRESCRIÇÃO DE EXERCÍCIOS         │
└─────────────────────────────────────────────────┘

CRIAÇÃO DE PRESCRIÇÃO
┌──────────────────┐
│ Terapeuta acessa │
│ biblioteca de    │
│ exercícios       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────┐
│ Opção 1: PROTOCOLO           │
│ • Seleciona protocolo pronto │
│ • Ex: "Reab. LCA Fase 1"     │
│ • Inclui múltiplos exercícios│
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Opção 2: EXERCÍCIO INDIVIDUAL│
│ • Busca por categoria        │
│ • Filtra por equipamento     │
│ • Escolhe dificuldade        │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Personaliza prescrição       │
│ • Sets/repetições            │
│ • Duração                    │
│ • Frequência semanal         │
│ • Instruções especiais       │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ IA sugere otimizações        │
│ • Baseado em histórico       │
│ • Progressão adequada        │
│ • Evita sobrecarga           │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Salva prescrição             │
│ • patient_exercise_          │
│   prescriptions              │
│ • Status: "active"           │
│ • Notifica paciente          │
└────────┬─────────────────────┘

EXECUÇÃO PELO PACIENTE
         │
         ↓
┌──────────────────────────────┐
│ Paciente acessa portal       │
│ • Vê exercícios prescritos   │
│ • Assiste vídeos             │
│ • Lê instruções              │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Registra execução            │
│ • Sets completados           │
│ • Dor antes/depois (0-10)    │
│ • Escala de Borg (esforço)   │
│ • Dificuldade (1-5)          │
│ • Notas opcionais            │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Salva em                     │
│ patient_exercise_executions  │
└────────┬─────────────────────┘

MONITORAMENTO
         │
         ↓
┌──────────────────────────────┐
│ Terapeuta analisa            │
│ • Gráfico de adesão          │
│ • Evolução de dor            │
│ • Dificuldades reportadas    │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Ajusta prescrição se necessário
│ • Aumenta/diminui carga      │
│ • Troca exercícios           │
│ • Modifica frequência        │
└──────────────────────────────┘
```

---

## 🎨 Wireframes por Módulo

### 1. Dashboard Administrativo

```
┌─────────────────────────────────────────────────────────────┐
│  [☰ Menu]  DuduFisio AI - Admin Dashboard       [🔔][👤]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────┐│
│  │📊 Receita   │ │👥 Pacientes │ │📅 Consultas │ │💰 Tax.││
│  │             │ │             │ │             │ │Sucesso││
│  │ R$ 45.230   │ │    342      │ │    128      │ │ 92%   ││
│  │ +12% ↗      │ │    +23 ↗    │ │    +8 ↗     │ │ +3% ↗ ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────┘│
│                                                             │
│  ┌──────────────────────────────┐ ┌──────────────────────┐ │
│  │  📈 Receita Mensal           │ │  🎯 Metas do Mês     │ │
│  │  ┌────────────────────────┐  │ │                      │ │
│  │  │        ╱╲              │  │ │  Receita: ████░ 85%  │ │
│  │  │      ╱    ╲    ╱╲      │  │ │  Pacientes: ███░ 73% │ │
│  │  │    ╱        ╲╱    ╲    │  │ │  Consultas: █████ 96%│ │
│  │  │  ╱                  ╲  │  │ │                      │ │
│  │  └────────────────────────┘  │ │  [Ver Detalhes]      │ │
│  │  Jan Feb Mar Abr Mai Jun     │ │                      │ │
│  └──────────────────────────────┘ └──────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🚨 Alertas e Ações Necessárias                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ 🔴 URGENTE: 3 pagamentos vencidos há + 30 dias│  │  │
│  │  │                              [Ver Detalhes >] │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │ 🟡 ATENÇÃO: 5 pacientes sem agendamento há 2  │  │  │
│  │  │            meses              [Contatar >]    │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │ 🟢 INFO: 8 consultas confirmadas para amanhã  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐ ┌─────────────────────────────┐  │
│  │  👨‍⚕️ Top Terapeutas  │ │  📊 Métricas Clínicas      │  │
│  │                     │ │                             │  │
│  │  1. Dr. João Silva  │ │  Taxa de Melhora: 87%       │  │
│  │     128 pacientes   │ │  Redução Média Dor: 4.2pts  │  │
│  │  2. Dra. Maria Lima │ │  Satisfação: 9.3/10         │  │
│  │     98 pacientes    │ │  No-Show Rate: 3.2%         │  │
│  │  3. Dr. Carlos Dias │ │                             │  │
│  │     87 pacientes    │ │  [Ver Relatório Completo]   │  │
│  └─────────────────────┘ └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Página de Agendamento

```
┌─────────────────────────────────────────────────────────────┐
│  [☰]  Agenda Inteligente                 🔍[Buscar...][+]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [📅 Dia] [📆 Semana] [📊 Mês]    🎯 IA: 94% otimização    │
│                                                             │
│  ┌─────────┬───────────────────────────────────────────┐   │
│  │Terapeuta│           Terça, 08/10/2025              │   │
│  ├─────────┼───────────────────────────────────────────┤   │
│  │Dr. João │ 08:00 ┌──────────────────┐                │   │
│  │Silva    │       │ Maria Oliveira   │                │   │
│  │         │       │ Avaliação Inicial│                │   │
│  │         │       │ ✅ Confirmado    │                │   │
│  │         │       └──────────────────┘                │   │
│  │         │ 09:00 [           Livre           ]       │   │
│  │         │ 10:00 ┌──────────────────┐                │   │
│  │         │       │ José Santos      │  🔴 Risco      │   │
│  │         │       │ Sessão Regular   │  No-Show: 78%  │   │
│  │         │       │ ⚠️  Lembrar!     │                │   │
│  │         │       └──────────────────┘                │   │
│  ├─────────┼───────────────────────────────────────────┤   │
│  │Dra.Maria│ 08:00 [    Bloqueio - Reunião    ]        │   │
│  │Lima     │ 09:00 [    Bloqueio - Reunião    ]        │   │
│  │         │ 10:00 ┌──────────────────┐                │   │
│  │         │       │ Ana Paula Costa  │                │   │
│  │         │       │ Fisioterapia     │                │   │
│  │         │       │ ⏰ Pendente      │                │   │
│  │         │       └──────────────────┘                │   │
│  └─────────┴───────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  🤖 Sugestões da IA                               │     │
│  │  • Preencher horário 09:00 - Dr. João             │     │
│  │    Paciente sugerido: Paulo Ferreira (fila)       │     │
│  │    [Agendar Automático]                           │     │
│  │                                                   │     │
│  │  • Risco de no-show detectado às 10:00           │     │
│  │    Enviar confirmação extra?                      │     │
│  │    [Sim, enviar WhatsApp]                         │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  [🔒 Criar Bloqueio]  [👥 Ver Fila de Espera]  [📊 Stats] │
└─────────────────────────────────────────────────────────────┘
```

### 3. Portal do Paciente

```
┌─────────────────────────────────────────────────────────────┐
│  [☰]  Meu Portal - Bem-vindo, João!              [👤][🔔]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🎯 Seu Progresso no Tratamento                       │ │
│  │                                                       │ │
│  │  Dor Inicial: 8/10  →  Dor Atual: 3/10  ✨ -62%     │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │ │
│  │  8 ──╲                                                │ │
│  │      ╲  ╲  ╱╲                                        │ │
│  │         ╲╱    ╲__╱ ──  3                            │ │
│  │  Sessões: 12/20 (60%)  [Ver Detalhes]               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────┐  ┌───────────────────────────────┐ │
│  │  📅 Próxima Consulta│  │  💪 Exercícios de Hoje       │ │
│  │                    │  │                               │ │
│  │  Amanhã, 09/10     │  │  ✅ Alongamento Lombar (3x10)│ │
│  │  10:00             │  │  ✅ Fortalecimento Core (2x15│ │
│  │  Dr. João Silva    │  │  ⬜ Mobilidade Quadril (3x12)│ │
│  │                    │  │  ⬜ Equilíbrio Unipodal (3x30│ │
│  │  [Confirmar]       │  │                               │ │
│  │  [Cancelar]        │  │  [Ver Todos os Exercícios]   │ │
│  │  [Adicionar ao Cal]│  │  [Registrar Execução]        │ │
│  └────────────────────┘  └───────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  📋 Histórico de Sessões                             │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ 01/10/2025 - Sessão 12                          │ │ │
│  │  │ Dor antes: 4/10  →  Dor depois: 2/10            │ │ │
│  │  │ Técnicas: Terapia Manual, Fortalecimento        │ │ │
│  │  │ [Ver Detalhes Completos]                        │ │ │
│  │  ├─────────────────────────────────────────────────┤ │ │
│  │  │ 26/09/2025 - Sessão 11                          │ │ │
│  │  │ Dor antes: 5/10  →  Dor depois: 3/10            │ │ │
│  │  │ [Ver Detalhes Completos]                        │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ 📄 Documentos│  │ 💬 Mensagens │  │ 💳 Pagamentos    │ │
│  │              │  │              │  │                  │ │
│  │ • Laudos (3) │  │ 2 não lidas  │  │ Em dia ✅        │ │
│  │ • Receitas(2)│  │ [Ver Todas]  │  │ [Ver Faturas]    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Diagramas de Integração

### Integrações Externas

```
┌──────────────────────────────────────────────────────────┐
│                  DuduFisio AI Core                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Supabase PostgreSQL                    │    │
│  │         • Dados estruturados                   │    │
│  │         • RLS Security                         │    │
│  │         • Realtime subscriptions               │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                        │
└────────────────┼────────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
     ↓                       ↓
┌──────────┐          ┌──────────────┐
│ Google   │          │ WhatsApp     │
│ Services │          │ Business API │
├──────────┤          ├──────────────┤
│          │          │              │
│ • Gemini │          │ • Messages   │
│   AI     │          │ • Templates  │
│ • Calendar         │ • Webhooks   │
│ • OAuth  │          │ • Media      │
└──────────┘          └──────────────┘
     ↑                       ↑
     │                       │
     ↓                       ↓
┌──────────┐          ┌──────────────┐
│ Resend   │          │ Stripe       │
│ Email API│          │ Payments     │
├──────────┤          ├──────────────┤
│          │          │              │
│ • Emails │          │ • Particular │
│ • Domain │          │   Payments   │
│   Setup  │          │ • PIX        │
│ • Tracking         │ • Boleto     │
└──────────┘          └──────────────┘
```

### Fluxo de Dados em Tempo Real

```
┌─────────────────────────────────────────────────────────┐
│              REALTIME DATA FLOW                         │
└─────────────────────────────────────────────────────────┘

CLIENTE (Frontend)
     │
     │ Subscribe to changes
     ↓
┌──────────────────────┐
│ Supabase Realtime    │
│ WebSocket Connection │
└──────┬───────────────┘
       │
       │ Listen to table changes:
       │ • appointments
       │ • clinical_documents
       │ • messages
       │ • notifications
       ↓
┌──────────────────────────────────┐
│ PostgreSQL Triggers              │
│ • AFTER INSERT                   │
│ • AFTER UPDATE                   │
│ • AFTER DELETE                   │
└──────┬───────────────────────────┘
       │
       │ Emit event
       ↓
┌──────────────────────────────────┐
│ Broadcast to subscribed clients  │
│ (via WebSocket)                  │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────┐
│ Cliente atualiza UI  │
│ automaticamente      │
│ • Toast notification │
│ • Refresh data       │
│ • Update counters    │
└──────────────────────┘

EXEMPLO DE USO:
1. Admin agenda consulta → todos terapeutas veem na agenda
2. Paciente paga → financeiro atualiza automaticamente
3. Nova mensagem → contador incrementa em tempo real
```

---

## 💾 Modelo de Dados Relacional

### Diagrama Entidade-Relacionamento (ER)

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                            │
└─────────────────────────────────────────────────────────────┘

users (user_profiles)
├─ id (PK)
├─ email (UNIQUE)
├─ role (admin|therapist|patient|educador_fisico)
├─ permissions JSONB
└─ is_active

       │
       │ 1:N
       ↓
patients
├─ id (PK)
├─ user_id (FK → users)
├─ created_by (FK → users)
├─ name
├─ email
├─ phone
├─ birth_date
└─ ...

       │
       │ 1:N
       ↓
appointments
├─ id (PK)
├─ patient_id (FK → patients)
├─ therapist_id (FK → users)
├─ scheduled_at
├─ status (scheduled|completed|cancelled)
├─ series_id (para recorrências)
├─ metadata JSONB
└─ ...

       │
       │ 1:N
       ↓
clinical_documents
├─ id (PK)
├─ patient_id (FK → patients)
├─ session_id (FK → appointments)
├─ document_type
├─ content JSONB
├─ is_signed
├─ signature_data JSONB
├─ version
└─ ...

       │
       ├─ 1:1
       ↓
initial_assessments
├─ id (PK)
├─ document_id (FK → clinical_documents)
├─ patient_id (FK → patients)
├─ chief_complaint
├─ medical_history JSONB
├─ physiotherapy_diagnosis
└─ ...

       │
       ├─ 1:1
       ↓
session_evolutions
├─ id (PK)
├─ document_id (FK → clinical_documents)
├─ patient_id (FK → patients)
├─ appointment_id (FK → appointments)
├─ subjective_assessment
├─ objective_findings
├─ techniques_applied JSONB
├─ pain_level_before
├─ pain_level_after
└─ ...

┌─────────────────────────────────────────────────────────────┐
│              EXERCISE & PROTOCOLS                           │
└─────────────────────────────────────────────────────────────┘

exercises
├─ id (PK)
├─ name
├─ category
├─ muscle_groups TEXT[]
├─ equipment TEXT[]
├─ difficulty_level
├─ video_url
└─ ...

       │
       │ N:M (via protocol_exercises)
       ↓
exercise_protocols
├─ id (PK)
├─ name
├─ pathology
├─ phase (acute|subacute|chronic)
├─ duration_weeks
└─ ...

       │
       │ 1:N
       ↓
patient_exercise_prescriptions
├─ id (PK)
├─ patient_id (FK → patients)
├─ therapist_id (FK → users)
├─ protocol_id (FK → exercise_protocols)
├─ exercise_id (FK → exercises)
├─ sets, repetitions
├─ start_date, end_date
├─ status (active|completed)
└─ ...

       │
       │ 1:N
       ↓
patient_exercise_executions
├─ id (PK)
├─ prescription_id (FK → prescriptions)
├─ patient_id (FK → patients)
├─ execution_date
├─ sets_completed
├─ pain_level_before, pain_level_after
├─ perceived_exertion
└─ completed

┌─────────────────────────────────────────────────────────────┐
│           SCHEDULING & AVAILABILITY                         │
└─────────────────────────────────────────────────────────────┘

recurrence_templates
├─ id (PK)
├─ therapist_id (FK → users)
├─ recurrence_rule JSONB
└─ ...

schedule_blocks
├─ id (PK)
├─ therapist_id (FK → users)
├─ start_at, end_at
├─ reason
└─ block_type

waitlist_entries
├─ id (PK)
├─ patient_id (FK → patients)
├─ therapist_id (FK → users)
├─ preferred_time_ranges JSONB
├─ urgency
├─ no_show_risk
└─ status

┌─────────────────────────────────────────────────────────────┐
│             ANALYTICS & INTELLIGENCE                        │
└─────────────────────────────────────────────────────────────┘

ai_predictions
├─ id (PK)
├─ prediction_type (demand|revenue|no_show)
├─ target_date
├─ predicted_value
├─ confidence_score
├─ actual_value
└─ factors JSONB

patient_insights
├─ id (PK)
├─ patient_id (FK → patients)
├─ insight_type (risk_assessment|recommendation)
├─ title, description
├─ confidence_score
├─ priority
└─ recommendations JSONB

treatment_effectiveness
├─ id (PK)
├─ patient_id (FK → patients)
├─ therapist_id (FK → users)
├─ treatment_type
├─ initial_pain_level, final_pain_level
├─ outcome_score
└─ success_rate

clinical_alerts
├─ id (PK)
├─ patient_id (FK → patients)
├─ alert_type
├─ severity
├─ status
└─ ...

┌─────────────────────────────────────────────────────────────┐
│          AUDIT & COMPLIANCE                                 │
└─────────────────────────────────────────────────────────────┘

audit_trail
├─ id (PK)
├─ document_id (FK → clinical_documents)
├─ action (create|read|update|delete|sign)
├─ performed_by (FK → users)
├─ performed_at
├─ ip_address
└─ user_agent

digital_signatures
├─ id (PK)
├─ document_id (FK → clinical_documents)
├─ signed_by (FK → users)
├─ signature_data JSONB
├─ certificate_id
└─ verification_status

compliance_validations
├─ id (PK)
├─ document_id (FK → clinical_documents)
├─ validation_type (cfm|coffito|lgpd|fhir)
├─ is_valid
└─ violations JSONB
```

---

## 🎯 Mapeamento de Funcionalidades por Perfil

### Admin
```
✓ Dashboard completo com métricas
✓ Gestão de usuários e permissões
✓ Relatórios financeiros e analytics
✓ Configurações do sistema
✓ Auditoria de ações
✓ Backup e manutenção
```

### Fisioterapeuta
```
✓ Agenda pessoal
✓ Atendimento de pacientes (SOAP)
✓ Prescrição de exercícios
✓ Criação de documentos clínicos
✓ Assinatura digital
✓ Biblioteca de exercícios e protocolos
✓ Analytics de tratamentos
```

### Paciente
```
✓ Portal pessoal
✓ Visualização de agenda
✓ Exercícios prescritos
✓ Registro de execuções
✓ Histórico de consultas
✓ Documentos (laudos, receitas)
✓ Mensagens com terapeuta
✓ Check-in via QR Code
```

### Parceiro (Educador Físico)
```
✓ Portal de parceria
✓ Pacientes compartilhados
✓ Protocolos de exercícios
✓ Registro de atividades
✓ Comunicação com fisioterapeuta
```

---

## 🔐 Segurança e Compliance

### Row Level Security (RLS) - Resumo

```sql
-- Usuários só veem seus próprios dados
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (id = auth.uid());

-- Pacientes: apenas seus registros
CREATE POLICY "patients_own_records" ON patients
  FOR SELECT USING (user_id = auth.uid());

-- Terapeutas: pacientes sob seus cuidados
CREATE POLICY "therapists_their_patients" ON patients
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM appointments
      WHERE patient_id = patients.id
        AND therapist_id = auth.uid()
    )
  );

-- Documentos clínicos: apenas criador ou terapeuta
CREATE POLICY "clinical_docs_access" ON clinical_documents
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = clinical_documents.patient_id
        AND a.therapist_id = auth.uid()
    )
  );

-- Documentos assinados são IMUTÁVEIS
CREATE POLICY "signed_immutable" ON clinical_documents
  FOR UPDATE USING (
    created_by = auth.uid() AND is_signed = FALSE
  );
```

### Compliance CFM/COFFITO/LGPD

**CFM (Conselho Federal de Medicina):**
- ✅ Campos obrigatórios em documentos clínicos
- ✅ Assinatura digital com timestamp
- ✅ Versionamento de prontuários

**COFFITO (Conselho Federal de Fisioterapia):**
- ✅ Estrutura SOAP adequada
- ✅ Diagnóstico fisioterápico obrigatório
- ✅ Registro de técnicas aplicadas

**LGPD (Lei Geral de Proteção de Dados):**
- ✅ Consentimento do paciente
- ✅ Auditoria de acessos (audit_trail)
- ✅ Anonimização para relatórios
- ✅ Direito ao esquecimento
- ✅ Portabilidade de dados

---

## 📱 Funcionalidades Mobile-First

### Check-in via QR Code

```
┌─────────────────────────────────┐
│  Paciente chega na clínica      │
│         │                       │
│         ↓                       │
│  [QR Code na recepção]          │
│         │                       │
│         ↓                       │
│  Escaneia com celular           │
│         │                       │
│         ↓                       │
│  Sistema valida:                │
│  • Tem consulta hoje?           │
│  • Horário correto?             │
│  • Documentos pendentes?        │
│         │                       │
│         ↓                       │
│  Confirma presença              │
│  • Notifica terapeuta           │
│  • Atualiza fila                │
│  • Prepara prontuário           │
└─────────────────────────────────┘
```

---

## 🚀 Próximas Melhorias Planejadas

### Curto Prazo (1-3 meses)
- [ ] Teleconsulta integrada (vídeo)
- [ ] App mobile nativo (React Native)
- [ ] Integração com Apple Health / Google Fit
- [ ] Relatórios automáticos em PDF

### Médio Prazo (3-6 meses)
- [ ] Mapa corporal interativo 3D
- [ ] IA para análise de movimento (vídeo)
- [ ] Marketplace de protocolos
- [ ] Integração com IoT (sensores)

### Longo Prazo (6-12 meses)
- [ ] Blockchain para certificação de laudos
- [ ] AR/VR para exercícios
- [ ] Assistente de voz para pacientes
- [ ] Plataforma multi-clínica

---

## 📞 Suporte e Documentação

Para mais informações, consulte:
- **Documentação Técnica**: `/docs/ARQUITETURA_TECNICA.md`
- **Guias de Usuário**: `/docs/GUIA_USUARIO_*.md`
- **Setup do Sistema**: `/docs/SUPABASE_SETUP.md`
- **API Reference**: Em desenvolvimento

---

**Última Atualização**: 08/10/2025
**Versão do Sistema**: 1.0.0
**Status**: ✅ Produção
