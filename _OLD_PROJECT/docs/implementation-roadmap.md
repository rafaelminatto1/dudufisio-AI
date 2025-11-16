# Roadmap de Implementação – Plataforma Digital de Fisioterapia

## Visão Geral
Objetivo: entregar plataforma integrada para fisioterapeutas e pacientes com interoperabilidade FHIR, prescrição digital, teleatendimento regulamentado e experiência acessível multiplataforma.

### Fases e Marcos
1. **Planejamento & Alinhamento (Sprint 0)**
   - Validar requisitos clínicos com especialistas (revisão de protocolos, instrumentos DASH/ODI/NPRS).
   - Definir backlog priorizado de jornadas (profissional/paciente) e artefatos de UX (personas, jornadas, wireframes).
   - Mapear infraestrutura necessária: servidor FHIR (HAPI/Firely), banco de dados, pipelines CI/CD, ferramentas de monitoramento.

2. **Fundação Técnica (Sprints 1-2)**
   - Provisionar ambiente FHIR R4 (HAPI FHIR) com perfis customizados e mapeamento terminológico (CID-10-BR, LOINC, SNOMED CT).
   - Implementar autenticação OIDC + RBAC, MFA, auditoria (`AuditEvent`).
   - Atualizar design tokens (cores, tipografia, high contrast) e componentes básicos acessíveis.

3. **Fluxo do Fisioterapeuta – MVP (Sprints 3-6)**
   - Cadastro de pacientes (`Patient`), intake inicial (`Condition`, `ServiceRequest`).
   - Registro de avaliações clínicas (formularios SOAP, escalas via `QuestionnaireResponse`).
   - Planejamento terapêutico (`CarePlan`, `PlanDefinition`); biblioteca de protocolos e exercícios.
   - Dashboard de monitoramento e alertas; geração de relatórios (PDF assinado, `DocumentReference`).

4. **Fluxo do Paciente – MVP (Sprints 5-7)**
   - Portal web/PWA com login seguro, dashboard com agenda e status.
   - Visualização e confirmação de exercícios (modo offline, download de mídia).
    - Auto-relato de dor/adesão (NPRS) com feedback imediato.
   - Canal de comunicação seguro (chat e teleconsulta básica).

5. **Teleatendimento & Compliance (Sprints 7-9)**
   - Implementar teleconsulta (WebRTC) com gravação opcional e consentimento documentado.
   - Assinatura eletrônica ICP-Brasil (integração com certificado A3) e carimbo temporal.
   - Auditorias LGPD: DPIA, controle de acesso granular, logs e retenção.

6. **Optimizações e Lançamento (Sprints 9-11)**
   - Testes de usabilidade e acessibilidade (axe, leitores de tela, teclado, dispositivos móveis).
   - Integração com wearables/IoT (dados de atividade via `Observation`).
   - Preparar materiais de treinamento, documentação clínica, manual do paciente.
   - Pilotagem com clínica parceira; coletar métricas de adesão e satisfação.

7. **Evolução Contínua (Pós-lançamento)**
   - Iterar com base em feedback; expandir biblioteca de protocolos inteligentes.
   - Integrar IA para recomendações de exercícios e análise de progresso.
   - Explorar integrações externas (EHRs, planos de saúde) via bundles FHIR.

## Entregáveis por Fase
| Fase | Entregáveis Principais | Critérios de Aceite |
| --- | --- | --- |
| Planejamento & Alinhamento | Documento de requisitos clínicos assinado, backlog priorizado, protótipos de baixa fidelidade | Aprovação dos especialistas, definição de OKRs, mapeamento de riscos |
| Fundação Técnica | Ambiente FHIR configurado, políticas de segurança (RBAC, auditoria), biblioteca de componentes acessíveis | Validação automatizada Touchstone/HAPI, testes de segurança básicos, revisão de design |
| Fluxo Fisioterapeuta MVP | Módulos de cadastro, avaliação, planejamento, relatórios; templates SOAP; dashboards | Testes de usabilidade com ≥5 fisioterapeutas, cobertura de testes automatizados >70%, conformidade LGPD |
| Fluxo Paciente MVP | PWA responsiva, suporte offline, auto-relatos, comunicação segura | Testes cross-device (Android/iOS, desktop), conformidade WCAG 2.2 AA, métricas de adesão em piloto |
| Teleatendimento & Compliance | Módulo de videochamada, consentimento eletrônico, assinatura ICP-Brasil | Auditoria jurídica e COFFITO, testes de carga video, armazenamento seguro (20 anos) |
| Otimizações & Lançamento | Testes finais, integrações wearables, materiais de treinamento, piloto clínico | Relatório de testes sem blockers, NPS piloto ≥ 60, checklist de acessibilidade completo |
| Evolução Contínua | Roadmap de features IA, integrações externas, plano de observabilidade | OKRs revisados, métricas de uso mensais, backlog de melhorias priorizado |

## Equipe e Responsabilidades
- **Produto**: priorização do backlog, definição de OKRs, alinhamento com stakeholders.
- **Design UX/UI**: jornadas detalhadas, protótipos interativos, testes de usabilidade e acessibilidade.
- **Engenharia Backend**: implementação FHIR, segurança, integrações com serviços externos.
- **Engenharia Frontend**: PWA responsiva, componentes acessíveis, offline-first.
- **Equipe Clínica**: validação de protocolos, testes de campo, treinamento interno.
- **Compliance/Jurídico**: adequação LGPD/COFFITO, política de consentimento, auditorias.
- **Dados & IA**: instrumentação de métricas, dashboards, modelagem preditiva futura.

## Cronograma Indicativo
- **Sprint 0** (2 semanas): alinhamento clínico/produto, arquitetura, plano de pesquisa UX.
- **Sprints 1-2**: fundação técnica, setup CI/CD, componentes base, testes automatizados iniciais.
- **Sprints 3-6**: entrega incremental do fluxo do fisioterapeuta, com revisões quinzenais.
- **Sprints 5-7**: desenvolvimento paralelo do fluxo do paciente, foco em mobile/tablet.
- **Sprints 7-9**: teleatendimento, compliance e governança de dados.
- **Sprints 9-11**: otimizações, piloto controlado, preparação de go-live.
- **Pós-lançamento**: ciclos mensais de melhoria contínua, revisão de KPIs.

## Plano de Comunicação
- **Ritos Semanais**: daily squads, sync clínica-produto, atualização de riscos.
- **Ritos Quinzenais**: review com stakeholders, demonstração de incrementos, coleta de feedback.
- **Relatórios Mensais**: status executivo (tecnologia, clínica, compliance, UX), métricas dos pilotos.
- **Base de Conhecimento**: documentação centralizada (Confluence/GitBook) com decisões, checklists, testes e materiais de treinamento.

## Dependências Críticas
- Acesso a especialistas em fisioterapia para validação de protocolos.
- Contratos/parcerias para infraestrutura FHIR e assinatura digital.
- Aprovação do conselho clínico/compliance antes de teleatendimento.
- Recursos de design para prototipar fluxos responsivos.

## Riscos & Mitigações
- **Complexidade regulatória**: Mitigar com consultoria jurídica, documentação de consentimento e auditorias periódicas.
- **Adoção do usuário**: realizar testes de usabilidade com fisioterapeutas/pacientes reais; iterar conteúdo educativo.
- **Integração FHIR**: priorizar perfis essenciais, automatizar validação com test suites (Touchstone/HAPI validator).
- **Offline limitado**: definir escopo (acesso a exercícios, coleta de dados) e sincronização robusta.

## Métricas de Sucesso
- Taxa de adesão ao programa (>75% dos exercícios concluídos).
- Tempo médio para documentar SOAP (<5 minutos por sessão).
- Pontuação média de usabilidade (SUS) ≥ 80.
- Conformidade 100% com testes WCAG 2.2 AA nas jornadas críticas.
- Zero incidentes críticos de segurança ou quebra de sigilo durante pilotagem.


