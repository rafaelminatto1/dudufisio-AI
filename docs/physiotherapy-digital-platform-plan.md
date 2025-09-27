# Planejamento Plataforma Digital de Fisioterapia

## 1. Tecnologias Específicas para Fisioterapia

### 1.1 Implementação FHIR R4
- **Recursos-chave**: `Patient`, `Practitioner`, `Encounter`, `Observation`, `Condition`, `Procedure`, `ServiceRequest`, `CarePlan`, `Goal`, `MedicationRequest`, `DocumentReference`, `QuestionnaireResponse` para capturar sinais vitais, avaliações funcionais, prescrições e documentação de sessões.
- **Workflow clínico**: uso de `PlanDefinition` e `ActivityDefinition` para protocolos terapêuticos; `Appointment` + `Schedule` + `Slot` para agenda multi-profissional; `Consent` para gestão de autorizações e teleatendimento.
- **Perfis e guias**:
  - *HL7 FHIR R4 Core* (2024-06) para regras base de validação e serialização.
  - *International Patient Summary (IPS) IG* (v1.0.0) para intercâmbio de dados clínicos transversais, com extensões para fisioterapia via `Procedure`/`Observation`.
  - *US Core R4 v6.1.0* como referência para perfis de avaliação funcional (ex.: LOINC 41950-7 para Escala de Dor) e verificações de conformidade.
  - *Open mHealth – Physical Activity & Mobility schemas* para interoperabilidade de dados de wearables integrados ao FHIR via `Observation.component`.
- **Ferramentas**: HAPI FHIR (servidor Java) com módulo de validação; Firely Server (suporte PlanDefinition/Workflow); Smile CDR (gestão de consentimento); Aidbox (hooks customizados para alerts clínicos).
- **Melhores práticas**: validações de binding terminológico (LOINC, SNOMED CT, ICD-10-BR), perfis locais para SOAP notes (`Composition` seções S/O/A/P), versionamento de `PlanDefinition` para evolução de protocolos.

### 1.2 Codificação ICD-10 para Condições Musculoesqueléticas
- Faixa `M00-M99` cobre sistema osteomuscular e tecido conjuntivo. Subconjuntos relevantes:
  - `M05-M14`: artropatias inflamatórias (ex.: `M75.1` tendinite do supraespinhoso).
  - `M40-M54`: dorsopatias (`M54.5` lombalgia crônica) – base para triagem e priorização.
  - `M60-M79`: transtornos de tecidos moles (`M70.6` bursite trocantérica, `M77.1` epicondilite lateral).
  - `S16-S99`: lesões agudas complementares, usar em conjunto quando aplicável.
- **Estratégia**: dicionário interno com descrições em português usando `CID-10-BR 2024` (DATASUS); validação automática na entrada; mapeamento cruzado para SNOMED CT quando disponível; alertas para códigos não específicos (`M79.1`) para incentivar granularidade.

### 1.3 Instrumentos de Desfecho (DASH, ODI, NPRS)
- **DASH (Disabilities of Arm, Shoulder and Hand)**
  - 30 itens Likert (1-5). Score = ((soma itens - 30) / 1.2). Implementar como `Questionnaire` + `QuestionnaireResponse`; autocalcular score e percentis.
  - Versionamento do questionário (original, QuickDASH 11 itens). Registrar idioma (`questionnaire.language = pt-BR`).
- **ODI (Oswestry Disability Index)**
  - 10 seções (0-5). Score percentual = (soma / 50) × 100 (ou /45 se uma seção omitida). Representar em `Observation` categoria `survey` com `Observation.component` para seções.
  - Utilizar LOINC 71802-3 (ODI total score) para interoperabilidade.
- **NPRS (Numeric Pain Rating Scale)**
  - Escala 0-10. Registrar em `Observation.valueQuantity` (LOINC 38208-5). Capturar contexto (repouso, movimento) em `Observation.component`.
- **Ferramentas digitais**: librarias de formulários acessíveis (React Hook Form + Zod), validação offline via PWA, exportação CSV e FHIR Bundle, dashboards com série temporal (Chart.js ou ECharts) aplicando bandas de confiança.

### 1.4 Regulamentações de Teleatendimento no Brasil
- **Lei nº 14.510/2022**: regulamenta telessaúde de forma permanente, exige consentimento informado e registro nos conselhos profissionais.
- **Resolução COFFITO nº 539/2021**: define modalidades (teleconsulta, telemonitoramento, teleconsulta interprofissional), necessidade de prontuário eletrônico, armazenamento seguro (mín. 20 anos) e registro das sessões com geolocalização opcional.
- **Resolução COFFITO nº 516/2020** (vigente como base histórica): autorizou práticas durante pandemia, mantém exigência de registro em ata.
- **LGPD (Lei nº 13.709/2018)**: dados sensíveis, necessidade de DPO, avaliações de impacto (DPIA) para teleatendimento.
- **Requisitos práticos**: gravação opcional com autorização, assinatura eletrônica ICP-Brasil (e-CPF A3) para laudos, carimbo temporal (Anexo II COFFITO 539).

### 1.5 Padrões de Prescrição Digital de Exercícios
- **Modelagem**: uso de `PlanDefinition` + `ActivityDefinition` FHIR com `timingTiming`, `dosageInstruction` adaptado para repetições/séries, anexos multimídia via `Binary`/`Media` e `CarePlan.activity` para plano individual.
- **Bibliotecas de referência**: ExerScience, Physitrack API, Physiotec (integração via REST); usar importadores para interoperar dados proprietários.
- **Padrões internacionais**: ISO/IEC 82304-1 (qualidade de software de saúde), IEEE 1752.1 (representação de dados de atividade), Open mHealth `exercise-prescription` schema.
- **Boas práticas**: prescrição multimodal (vídeo + texto + imagens), personalização com tags ICD-10 e metas `Goal`, lembretes e monitoramento de adesão com `Task` FHIR; motor de regras para contraindicações baseado em diagnósticos.

## 2. Fluxos de Experiência do Usuário

### 2.1 Fluxo do Fisioterapeuta
| Etapa | Objetivo | Entradas | Saídas | Tecnologias/Notas |
| --- | --- | --- | --- | --- |
| 1. Acesso seguro | Autenticar com MFA e seleção de clínica | e-CPF/e-mail, token MFA | Sessão iniciada, contexto LGPD | OIDC + RBAC; auditoria (`AuditEvent`) |
| 2. Triagem inicial | Capturar dados cadastrais e anamnese | Documentos, histórico, encaminhamento | `Patient`, `ServiceRequest`, `Condition` | Wizard com validação; integração CNES |
| 3. Avaliação clínica | Registrar exame físico, escalas (DASH/ODI/NPRS) | Formulários, anexos mídia | `Observation`, `QuestionnaireResponse` | Layout tipo SOAP; suporte offline |
| 4. Planejamento terapêutico | Selecionar protocolo, metas, exercícios | Biblioteca PlanDefinition, histórico | `CarePlan`, `Goal`, `PlanDefinition` vinculado | Assistente IA sugere protocolos; verificação de contraindicações |
| 5. Sessão e SOAP notes | Documentar progresso e conduta | Evolução, sinais, carga | `Procedure`, `Composition` (SOAP) | Notas rápidas com templates; detecção de inconsistência |
| 6. Monitoramento | Revisar adesão e métricas | Logs exercícios, auto-relatos, wearables | Dashboards, alertas de risco | `Observation` série temporal; KPI com limites |
| 7. Relatórios & compartilhamento | Gerar laudos, enviar para médico/paciente | Dados consolidados, configurações | PDF assinado, `DocumentReference` | Assinatura digital, carimbo COFFITO |

### 2.2 Fluxo do Paciente
| Etapa | Objetivo | Entradas | Saídas | Considerações |
| --- | --- | --- | --- | --- |
| 1. Login & segurança | Acesso fácil com recuperação | CPF/e-mail, 2FA opcional | Sessão autenticada | UX amigável, permitir login com biometria (PWA + WebAuthn) |
| 2. Painel geral | Visão de agenda, metas e alertas | Dados cuidado ativo | Cards com status (cores semafóricas) | Mostrar indicadores de dor/adesão; badge de urgência |
| 3. Programa de exercícios | Visualizar módulos com mídia | Prescrição `CarePlan` | Lista ordenada, modo offline | Download prévio vídeos, feedback rápido |
| 4. Auto-relato e adesão | Registrar dor, dificuldades, uploads | Form NPRS, check-ins | Dados enviados ao profissional | Input com sliders, voice-to-text opcional |
| 5. Comunicação | Mensagens e teleconsulta | Chat seguro, videochamada | Histórico criptografado | Integração WebRTC, alertas de privacidade |
| 6. Resultados | Acompanhar progresso | Gráficos, metas | Relatórios legíveis, exportação | Uso de linguagem simples, contexto clínico |

## 3. Prevenção de Erros e Validações
- Máscara de dados (CPF, CNS), auto-complete com validação com base em DENATRAN/CNES.
- Alertas campo a campo com mensagens clínicas (ex.: incompatibilidade de protocolo com diagnóstico).
- Validação cruzada: pontuação DASH fora de range, escalas com itens não respondidos.
- Regras de consistência temporal (sessão futura não pode ter `Procedure.performedDateTime` passada).
- Logs auditáveis (`AuditEvent`) e trilhas de revisão para edição de SOAP notes.

## 4. Considerações para Uso em Tablets e Mobile
- Layout responsivo com breakpoints `md`, `lg` focando orientação paisagem para fisioterapeuta; componentes +40px de altura mínima.
- Toques amigáveis: hit target ≥ 48px, feedback háptico (quando disponível) e estados visuais.
- Operação com uma mão: bottom nav para paciente, gestos swipe para mudar exercícios, botões de ação no alcance do polegar.
- Indicadores de conectividade/offline: banner persistente quando em modo PWA offline, state machine para reenvio de dados.
- Navegação por gestos: swipe entre abas, arrastar e soltar para reorganizar protocolos.
- Padrões de emergência: acesso rápido ao botão “Contato Emergencial” no dashboard; CTA fixo com cor de alerta.

## 5. Requisitos de Acessibilidade
- Conformidade WCAG 2.2 AA: contraste mínimo 4.5:1 (`--primary-blue` revisado com variação 600 para high-contrast mode).
- Compatibilidade com leitores de tela (NVDA, VoiceOver). Usar landmarks ARIA (`main`, `nav`) e labels descritivos para escala de dor.
- Navegação por teclado completa (tab order lógico, focus visible ≥ 2px). Atalhos configuráveis para profissionais (ex.: `Alt+S` salvar SOAP).
- Suporte a escalonamento de texto 200%, layout fluido, verificação com `prefers-reduced-motion`.
- Integração de entrada por voz: Web Speech API fallback + campos com atributo `x-webkit-speech`; botões grandes para gravação.

## 6. Considerações Específicas de Saúde
- Codificação por cor para urgência: `--error-red` (crítico), `--warning-amber` (atenção), `--success-green` (estável), `--primary-blue` (ação padrão).
- Indicadores visuais de status do paciente (chips com ícones, timeline com checkpoints).
- Padrões de privacidade: banners explicando uso de dados sensíveis, timers para logout automático, visualização mascarada em ambientes compartilhados.
- Aparência profissional: tipografia sem serifa (`Inter`), espaçamento amplo, uso moderado de animações (≤ 150ms) para reduzir fadiga.
- Elementos anti-estresse: áreas em branco, mensagens positivas pós-sessão, modo “focus” sem notificações invasivas durante SOAP.

## 7. Documentação do Sistema de Design

```css
/* Color Palette */
:root {
  --primary-blue: #0066cc;
  --success-green: #00aa44;
  --warning-amber: #ff8800;
  --error-red: #cc0000;
  --neutral-gray: #666666;
}

/* Typography Scale */
.text-h1 { font-size: 2.5rem; font-weight: 600; }
.text-h2 { font-size: 2rem; font-weight: 600; }
.text-body { font-size: 1rem; line-height: 1.5; }
.text-caption { font-size: 0.875rem; color: var(--neutral-gray); }
```

- Ajustar tokens existentes (`design-system/tokens.ts`) para refletir as variáveis CSS acima em modo high-contrast (usar `--primary-blue` como fallback, `color-scheme: light`).
- Componentes touch-friendly: botões com padding ≥ 16px, bordas `border-radius: 8px`, sombras suaves (`box-shadow: var(--shadow-md)`).
- Ícones semiotim (Lucide) com cores semânticas; garantir uso de `aria-hidden` e `aria-label` apropriados.

## 8. Referências
- HL7 International. *FHIR R4 Specification* (2024-06). Disponível em: https://hl7.org/fhir/R4/
- HL7 International. *International Patient Summary (IPS) Implementation Guide v1.0.0*. Disponível em: https://build.fhir.org/ig/HL7/ips/
- HL7 International. *US Core Implementation Guide v6.1.0*. Disponível em: https://hl7.org/fhir/us/core/
- Open mHealth. *Schema Library*. Disponível em: https://www.openmhealth.org/documentation/
- DATASUS. *CID-10-BR 2024 – Lista Tabular*. Disponível em: https://datasus.saude.gov.br/cid-10/
- COFFITO. *Resolução nº 539/2021*. Disponível em: https://www.coffito.gov.br
- Brasil. *Lei nº 14.510, de 27 de dezembro de 2022*. Disponível em: https://www.planalto.gov.br
- APTA. *Clinical Practice Guidelines & Outcome Measures*. Disponível em: https://www.apta.org/patient-care/evidence-based-practice-resources/outcome-measures


