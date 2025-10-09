/**
 * Avaliações Especializadas e Materiais Clínicos
 */

import type { SpecializedAssessment, ClinicalMaterial, ClinicalLibraryItem, EducationalContent } from '../types/clinicalContent';

// ===== AVALIAÇÕES ESPECIALIZADAS =====

const SPECIALIZED_ASSESSMENTS: SpecializedAssessment[] = [
  {
    id: 'aval-esp-001',
    title: 'Avaliação Funcional Esportiva',
    specialty: 'esportiva',
    description: 'Avaliação abrangente da capacidade funcional de atletas incluindo força, potência, agilidade e controle neuromuscular.',
    purpose: 'Identificar déficits funcionais, assimetrias e fatores de risco para lesões em atletas.',
    targetPopulation: 'Atletas de diversas modalidades, amadores e profissionais',
    duration: '45-60 minutos',
    materials: [
      'Dinamômetro portátil',
      'Fita métrica',
      'Cronômetro',
      'Cones de marcação',
      'Superfície plana e segura',
      'Câmera para gravação (opcional)',
      'Formulário de avaliação'
    ],
    procedures: [
      {
        id: 'proc-1',
        order: 1,
        step: 'Anamnese Esportiva',
        instruction: 'Coletar histórico de lesões, modalidade praticada, volume de treino e objetivos.',
        expectedOutcome: 'Compreensão do contexto esportivo e fatores de risco individuais',
        commonErrors: ['Não investigar histórico completo de lesões', 'Não considerar demandas específicas do esporte']
      },
      {
        id: 'proc-2',
        order: 2,
        step: 'Avaliação de Força Muscular',
        instruction: 'Testar força isométrica de grupos musculares chave (quadríceps, isquiotibiais, glúteos, abdutores de quadril).',
        expectedOutcome: 'Valores de força em kg ou N, identificação de assimetrias >10%',
        commonErrors: ['Não padronizar posição de teste', 'Não comparar bilateral mente']
      },
      {
        id: 'proc-3',
        order: 3,
        step: 'Hop Tests',
        instruction: 'Realizar single hop, triple hop, crossover hop e 6-meter timed hop para cada perna.',
        expectedOutcome: 'Distância percorrida e índice de simetria entre membros',
        commonErrors: ['Não garantir técnica adequada', 'Não considerar estratégias compensatórias']
      },
      {
        id: 'proc-4',
        order: 4,
        step: 'Testes de Agilidade',
        instruction: 'Aplicar teste de mudança de direção (Illinois Agility Test ou T-Test).',
        expectedOutcome: 'Tempo de execução, comparação com normativas',
        commonErrors: ['Não familiarizar o atleta previamente', 'Condições de teste não padronizadas']
      },
      {
        id: 'proc-5',
        order: 5,
        step: 'Avaliação de Movimento',
        instruction: 'Observar padrões de movimento em agachamento, aterrissagem e mudança de direção.',
        expectedOutcome: 'Identificação de compensações, valgo dinâmico, assimetrias',
        commonErrors: ['Não observar de múltiplos ângulos', 'Focar apenas em uma articulação']
      }
    ],
    scoringCriteria: [
      { parameter: 'Força Isométrica', unit: 'kg ou N', normalRange: 'Assimetria < 10%', measurement: 'Dinamometria' },
      { parameter: 'Single Hop Distance', unit: 'cm', normalRange: 'LSI > 90%', measurement: 'Fita métrica' },
      { parameter: 'Triple Hop Distance', unit: 'cm', normalRange: 'LSI > 90%', measurement: 'Fita métrica' },
      { parameter: 'Illinois Agility', unit: 'segundos', normalRange: '<15.2s (homens), <17.0s (mulheres)', measurement: 'Cronômetro' }
    ],
    interpretationGuide: [
      {
        range: 'LSI > 90% em todos hop tests',
        interpretation: 'Simetria adequada, baixo risco de lesão',
        recommendations: ['Manter programa preventivo', 'Progressão para atividades esportivas']
      },
      {
        range: 'LSI 80-90% em qualquer hop test',
        interpretation: 'Assimetria leve, risco moderado',
        recommendations: ['Fortalecimento específico do membro deficitário', 'Treino proprioceptivo', 'Reavaliação em 4-6 semanas']
      },
      {
        range: 'LSI < 80% em qualquer hop test',
        interpretation: 'Assimetria significativa, risco elevado de lesão',
        recommendations: ['Programa intensivo de reabilitação', 'Não liberar para retorno ao esporte', 'Investigar causas da assimetria']
      }
    ],
    references: [
      'Gustavsson A, et al. A test battery for evaluating hop performance in patients with an ACL injury. Knee Surg Sports Traumatol Arthrosc. 2006;14(8):778-788.',
      'Raya MA, et al. Comparison of three agility tests with male servicemembers. J Rehabil Res Dev. 2013;50(4):603-612.'
    ],
    images: [],
    tags: ['avaliação', 'esportiva', 'hop test', 'força', 'funcional'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'aval-gero-001',
    title: 'Avaliação Geriátrica de Risco de Quedas',
    specialty: 'geriatrica',
    description: 'Avaliação multifatorial do risco de quedas em idosos incluindo equilíbrio, marcha, força e fatores ambientais.',
    purpose: 'Identificar idosos em risco de quedas e determinar intervenções apropriadas.',
    targetPopulation: 'Idosos comunitários ou institucionalizados com 60 anos ou mais',
    duration: '30-40 minutos',
    materials: [
      'Escala de Equilíbrio de Berg (formulário)',
      'Cronômetro',
      'Cadeira sem braços (altura padrão 43cm)',
      'Fita métrica',
      'Cone ou marcador',
      'Checklist de avaliação ambiental'
    ],
    procedures: [
      {
        id: 'proc-1',
        order: 1,
        step: 'Histórico de Quedas',
        instruction: 'Perguntar sobre quedas nos últimos 12 meses, circunstâncias, consequências e medo de cair.',
        expectedOutcome: 'Número de quedas, contexto, lesões resultantes, nível de medo',
        commonErrors: ['Não investigar "quase-quedas"', 'Não avaliar impacto psicológico']
      },
      {
        id: 'proc-2',
        order: 2,
        step: 'Escala de Equilíbrio de Berg',
        instruction: 'Aplicar os 14 itens da escala, pontuando 0-4 para cada item.',
        expectedOutcome: 'Pontuação total de 0-56 pontos',
        commonErrors: ['Não padronizar instruções', 'Não garantir segurança durante testes']
      },
      {
        id: 'proc-3',
        order: 3,
        step: 'Timed Up and Go (TUG)',
        instruction: 'Paciente levanta de cadeira, caminha 3 metros, retorna e senta. Cronometrar.',
        expectedOutcome: 'Tempo em segundos',
        commonErrors: ['Não permitir familiarização', 'Não observar qualidade do movimento']
      },
      {
        id: 'proc-4',
        order: 4,
        step: 'Teste de Sentar e Levantar 30 Segundos',
        instruction: 'Contar quantas vezes o paciente consegue sentar e levantar completamente em 30 segundos.',
        expectedOutcome: 'Número de repetições',
        commonErrors: ['Não verificar se extensão completa foi alcançada', 'Permitir uso de braços quando não deve']
      },
      {
        id: 'proc-5',
        order: 5,
        step: 'Avaliação Ambiental',
        instruction: 'Usar checklist para avaliar riscos ambientais no domicílio (tapetes, iluminação, banheiro, etc).',
        expectedOutcome: 'Lista de riscos ambientais identificados',
        commonErrors: ['Não visitar domicílio (quando possível)', 'Não considerar rotinas específicas do idoso']
      }
    ],
    scoringCriteria: [
      { parameter: 'Berg Balance Scale', unit: 'pontos', normalRange: '> 45 pontos', measurement: 'Escala de 0-56' },
      { parameter: 'Timed Up and Go', unit: 'segundos', normalRange: '< 12 segundos', measurement: 'Cronômetro' },
      { parameter: 'Sentar e Levantar 30s', unit: 'repetições', normalRange: '> 12 repetições (60-69 anos), > 11 (70-79), > 10 (80-89)', measurement: 'Contagem' }
    ],
    interpretationGuide: [
      {
        range: 'Berg > 45, TUG < 12s, SL30s acima da média',
        interpretation: 'Baixo risco de quedas',
        recommendations: ['Manutenção de atividade física regular', 'Orientações preventivas', 'Reavaliação anual']
      },
      {
        range: 'Berg 40-45, TUG 12-20s, SL30s na média',
        interpretation: 'Risco moderado de quedas',
        recommendations: ['Programa de exercícios para equilíbrio e força', 'Modificações ambientais', 'Reavaliação em 3-6 meses']
      },
      {
        range: 'Berg < 40, TUG > 20s, SL30s abaixo da média',
        interpretation: 'Alto risco de quedas',
        recommendations: ['Intervenção imediata', 'Supervisão aumentada', 'Dispositivo auxiliar se necessário', 'Reavaliação mensal']
      }
    ],
    references: [
      'Berg K, et al. Measuring balance in the elderly. Can J Public Health. 1992;83 Suppl 2:S7-11.',
      'Podsiadlo D, Richardson S. The timed "Up & Go": a test of basic functional mobility. J Am Geriatr Soc. 1991;39(2):142-148.',
      'Rikli RE, Jones CJ. Senior Fitness Test Manual. 2nd ed. Human Kinetics; 2013.'
    ],
    images: [],
    tags: ['avaliação', 'geriatria', 'quedas', 'equilíbrio', 'Berg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ===== MATERIAIS CLÍNICOS =====

const CLINICAL_MATERIALS: ClinicalMaterial[] = [
  {
    id: 'mat-001',
    type: 'guideline',
    title: 'Guideline de Reabilitação Pós-Cirúrgica de LCA',
    specialty: 'esportiva',
    description: 'Guia prático baseado em evidências para reabilitação de atletas após reconstrução de LCA.',
    category: 'professional-use',
    content: `
# Guideline de Reabilitação Pós-Cirúrgica de LCA

## Princípios Fundamentais

1. **Progressão baseada em critérios**, não em tempo
2. **Respeitar cicatrização tecidual**
3. **Controle de carga progressivo**
4. **Avaliação contínua de resposta**

## Fases da Reabilitação

### Fase 1: Aguda (0-2 semanas)
**Objetivos:**
- Controlar dor e edema
- ADM: 0-90° de flexão
- Ativação de quadríceps

**Critérios de Progressão:**
- Extensão completa
- Flexão ≥ 90°
- Contração ativa de quadríceps visível

### Fase 2: Inicial (2-6 semanas)
**Objetivos:**
- ADM completa
- Marcha normalizada
- Força inicial

**Critérios de Progressão:**
- ADM completa
- Marcha sem claudicação
- Subir/descer escadas

### Fase 3: Intermediária (6-12 semanas)
**Objetivos:**
- Força > 70% contralateral
- Início de corrida

**Critérios de Progressão:**
- Força 70%
- Sem derrame articular
- Hop test > 60%

### Fase 4: Avançada (3-6 meses)
**Objetivos:**
- Força > 85%
- Retorno a atividades esportivas

**Critérios de Progressão:**
- Força > 85%
- Hop tests > 85%
- Confiança psicológica

### Fase 5: Retorno ao Esporte (6-12 meses)
**Objetivos:**
- Performance normalizada
- Prevenção de relesão

**Critérios de Liberação:**
- Força > 90%
- Todos hop tests > 90%
- Aprovação do cirurgião
- Prontidão psicológica

## Red Flags

- Derrame articular persistente
- Dor significativa não controlada
- Perda súbita de ADM
- Instabilidade sintomática
- Falha em progredir

## Comunicação com Cirurgião

Comunicar imediatamente:
- Suspeita de re-ruptura
- Infecção
- Rigidez articular severa
- Falha em atingir marcos esperados
`,
    downloadable: true,
    printable: true,
    thumbnailUrl: '',
    images: [],
    tags: ['LCA', 'guideline', 'reabilitação', 'protocolo', 'joelho'],
    language: 'pt-BR',
    version: '1.0',
    lastReviewed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'mat-002',
    type: 'form',
    title: 'Formulário de Avaliação Inicial de Fisioterapia',
    specialty: 'ortopedica',
    description: 'Formulário padronizado para avaliação inicial de pacientes ortopédicos.',
    category: 'evaluation',
    content: `
# FORMULÁRIO DE AVALIAÇÃO INICIAL - FISIOTERAPIA

## Dados do Paciente
- Nome: ____________________
- Data de Nascimento: ____/____/____
- Profissão: ____________________
- Atividades Esportivas: ____________________

## Queixa Principal
Descreva com suas palavras: ____________________

## História da Doença Atual
- Início dos sintomas: ____________________
- Mecanismo de lesão: ____________________
- Tratamentos prévios: ____________________
- Exames realizados: ____________________

## Dor
- Localização: ____________________
- Intensidade (0-10): ____
- Característica: ( ) latejante ( ) aguda ( ) queimação ( ) outra: ____
- Fatores de melhora: ____________________
- Fatores de piora: ____________________

## História Médica
- Cirurgias prévias: ____________________
- Condições de saúde: ____________________
- Medicamentos em uso: ____________________
- Alergias: ____________________

## Exame Físico
### Inspeção
- Postura: ____________________
- Marcha: ____________________
- Alterações visíveis: ____________________

### Palpação
- Pontos dolorosos: ____________________
- Edema: ( ) Sim ( ) Não Local: ____
- Temperatura: ( ) Normal ( ) Aumentada

### Amplitude de Movimento
[Tabela para registro de ADM]

### Força Muscular
[Tabela para registro de força 0-5]

### Testes Especiais
____________________

## Diagnóstico Fisioterapêutico
____________________

## Objetivos do Tratamento
Curto prazo: ____________________
Longo prazo: ____________________

## Plano de Tratamento
Frequência: ____ x/semana
Duração estimada: ____ semanas
Condutas: ____________________

____________________
Assinatura do Fisioterapeuta
CREFITO: ____
`,
    downloadable: true,
    printable: true,
    thumbnailUrl: '',
    images: [],
    tags: ['formulário', 'avaliação', 'documentação', 'prontuário'],
    language: 'pt-BR',
    version: '1.0',
    lastReviewed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'mat-003',
    type: 'infographic',
    title: 'Orientações para Prevenção de Quedas em Idosos',
    specialty: 'geriatrica',
    description: 'Material educativo visual para pacientes e familiares sobre prevenção de quedas.',
    category: 'patient-education',
    content: `
# PREVENÇÃO DE QUEDAS - GUIA PARA IDOSOS E FAMILIARES

## 🏠 NO AMBIENTE DOMÉSTICO

### ILUMINAÇÃO
✓ Mantenha interruptores acessíveis
✓ Use luz noturna no quarto e banheiro
✓ Ilumine bem corredores e escadas

### PISOS
✓ Remova tapetes soltos
✓ Fixe bem tapetes que permanecerem
✓ Limpe imediatamente líquidos derramados
✓ Evite encerar pisos

### BANHEIRO
✓ Instale barras de apoio no box e vaso
✓ Use tapete antiderrapante no box
✓ Prefira bancos para banho se necessário

### ESCADAS
✓ Instale corrimãos dos dois lados
✓ Ilumine adequadamente
✓ Sinalize primeiro e último degrau

### ORGANIZAÇÃO
✓ Mantenha objetos de uso frequente ao alcance
✓ Evite fios soltos no chão
✓ Organize móveis permitindo passagem livre

## 👟 CALÇADOS E VESTUÁRIO
✓ Use sapatos fechados, baixos e antiderrapantes
✓ Evite chinelos e sapatos muito largos
✓ Prefira roupas que não arrastem no chão

## 💊 MEDICAMENTOS
✓ Revise medicações com seu médico regularmente
✓ Atenção a medicamentos que causam tontura
✓ Tome cuidado ao levantar (hipotensão postural)

## 🏋️ EXERCÍCIO E SAÚDE
✓ Pratique exercícios para força e equilíbrio
✓ Realize check-ups regulares
✓ Use óculos conforme prescrição
✓ Mantenha alimentação adequada

## 🚨 QUANDO PROCURAR AJUDA
- Se teve quedas recentemente
- Se sente medo de cair
- Se sente tontura ou desequilíbrio
- Se tem dificuldade para caminhar

## 📞 CONTATOS DE EMERGÊNCIA
Fisioterapia: ____________________
Médico: ____________________
Familiar: ____________________

---
**Lembre-se: A maioria das quedas pode ser prevenida!**
`,
    downloadable: true,
    printable: true,
    thumbnailUrl: '',
    images: [],
    tags: ['educação', 'paciente', 'quedas', 'idosos', 'prevenção'],
    language: 'pt-BR',
    version: '1.0',
    lastReviewed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ===== BIBLIOTECA CLÍNICA =====

const CLINICAL_LIBRARY: ClinicalLibraryItem[] = [
  {
    id: 'lib-001',
    type: 'guideline',
    title: 'Diretrizes para Retorno ao Esporte Após Lesão de LCA',
    specialty: 'esportiva',
    abstract: 'Revisão sistemática das melhores práticas e critérios baseados em evidência para liberação de atletas após reconstrução de LCA.',
    fullContent: `
# Diretrizes para Retorno ao Esporte Após Lesão de LCA

## Introdução
A decisão de retorno ao esporte após reconstrução de LCA é complexa e multifatorial. Este documento compila as evidências científicas mais atualizadas para guiar essa decisão crítica.

## Critérios Baseados em Tempo
Embora o tempo mínimo de 9-12 meses seja frequentemente citado, a literatura atual sugere que:
- Menos de 6 meses: risco significativamente aumentado de re-ruptura
- 9-12 meses: janela mais segura para retorno
- Além de 12 meses: pode indicar dificuldades na reabilitação

## Critérios Funcionais

### Força Muscular
- **Quadríceps:** > 90% do membro contralateral
- **Isquiotibiais:** > 90% do membro contralateral
- **Relação I:Q:** 0.6-1.0 (dependendo da velocidade de teste)

### Testes de Salto (Hop Tests)
Todos devem apresentar Limb Symmetry Index (LSI) > 90%:
- Single hop for distance
- Triple hop for distance
- Crossover hop for distance
- 6-meter timed hop

### Avaliação Qualitativa
- Landing Error Scoring System (LESS)
- Análise de movimento durante aterrissagem
- Ausência de valgo dinâmico excessivo

### Testes de Agilidade e Mudança de Direção
- T-Test ou Illinois Agility Test
- Comparação com valores normativos e pré-lesão

## Critérios Psicológicos
- ACL-Return to Sport after Injury (ACL-RSI) scale
- Pontuação mínima de 56 pontos (de 100) sugerida
- Avaliação de confiança do atleta

## Critérios Clínicos
- Ausência de derrame articular
- Ausência de dor significativa
- Amplitude de movimento completa e simétrica
- Ausência de sinais de instabilidade

## Comunicação Médica
- Aprovação do cirurgião ortopédico
- Consenso da equipe multidisciplinar

## Progressão para Retorno
1. Participação em treinos técnico-táticos (sem contato)
2. Progressão para treinos com contato limitado
3. Treinos completos com a equipe
4. Participação em jogos/competições com tempo limitado
5. Retorno completo

## Monitoramento Pós-Retorno
- Avaliações periódicas nos primeiros 3-6 meses
- Manutenção de programa preventivo
- Atenção a sinais de sobrecarga

## Considerações Especiais

### Esportes de Alto Risco
Esportes com pivoteamento, saltos e contato físico requerem:
- Maior rigor nos critérios
- Preparação psicológica adicional
- Progressão mais gradual

### População Jovem
- Adolescentes: maior taxa de re-ruptura
- Consideração de fatores maturacionais
- Educação de atletas, pais e treinadores

## Conclusão
O retorno ao esporte deve ser baseado em múltiplos critérios objetivos e não apenas no tempo. A decisão deve ser compartilhada entre atleta, fisioterapeuta, médico e comissão técnica.

## Referências
[Lista completa de referências científicas...]
`,
    authors: ['Dr. Eduardo Silva', 'Ft. Mariana Costa'],
    journal: 'Revista Brasileira de Fisioterapia Esportiva',
    year: 2024,
    keywords: ['LCA', 'retorno ao esporte', 'critérios', 'reabilitação', 'atletas'],
    references: [
      'Grindem H, et al. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction. Br J Sports Med. 2016;50(13):804-808.',
      'Kyritsis P, et al. Likelihood of ACL graft rupture: not meeting six clinical discharge criteria. Br J Sports Med. 2016;50(15):946-951.'
    ],
    relatedProtocols: ['proto-esp-002'],
    images: [],
    accessLevel: 'team',
    downloads: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ===== CONTEÚDO EDUCACIONAL =====

const EDUCATIONAL_CONTENT: EducationalContent[] = [
  {
    id: 'edu-001',
    type: 'guide',
    title: 'Guia do Paciente: O que Esperar da Fisioterapia Após Cirurgia de Joelho',
    specialty: 'pos-operatoria',
    description: 'Guia completo para pacientes entenderem o processo de reabilitação pós-cirúrgica de joelho.',
    content: `
# O que Esperar da Fisioterapia Após Cirurgia de Joelho

## Primeiros Dias Após a Cirurgia

Nos primeiros dias, é normal sentir:
- Dor no local da cirurgia
- Inchaço (edema) ao redor do joelho
- Dificuldade para movimentar o joelho
- Necessidade de usar muletas

**O que fazer:**
- Aplicar gelo conforme orientado
- Manter a perna elevada
- Tomar medicação para dor conforme prescrição
- Realizar exercícios leves orientados

## Primeiras Semanas

Nesta fase, você vai:
- Começar a fisioterapia (geralmente 3-5x por semana)
- Trabalhar para recuperar movimento do joelho
- Fortalecer a musculatura levemente
- Aprender a caminhar adequadamente

**Seu papel é fundamental:**
- Comparecer a todas as sessões
- Fazer exercícios em casa conforme orientado
- Comunicar qualquer dor ou problema

## Meses Seguintes

Com o tempo, você vai:
- Recuperar força muscular progressivamente
- Voltar a caminhar normalmente
- Retomar atividades do dia a dia
- Progressivamente retornar a atividades físicas

## Quanto Tempo Vai Levar?

O tempo varia conforme:
- Tipo de cirurgia realizada
- Sua condição física prévia
- Seu empenho na reabilitação
- Possíveis complicações

**Média de tempo:**
- Caminhada normal: 4-8 semanas
- Atividades diárias: 8-12 semanas
- Atividades esportivas leves: 3-6 meses
- Retorno ao esporte: 9-12 meses (ou mais)

## Sinais de Alerta

Procure seu médico/fisioterapeuta se:
- Dor intensa que não melhora
- Inchaço que aumenta significativamente
- Vermelhidão ou calor excessivo
- Febre
- Dificuldade inesperada de movimento

## Dicas para Sucesso

1. **Seja paciente:** Recuperação leva tempo
2. **Seja consistente:** Faça seus exercícios diariamente
3. **Comunique:** Fale sobre dúvidas e preocupações
4. **Confie no processo:** Siga as orientações profissionais
5. **Celebre progresso:** Pequenas vitórias importam

## Perguntas Frequentes

**Quando posso voltar a dirigir?**
Geralmente após 4-6 semanas, com aprovação médica.

**Quando posso voltar a trabalhar?**
Depende do tipo de trabalho. Trabalho sedentário: 2-4 semanas. Trabalho físico: pode levar meses.

**Vou sentir dor para sempre?**
Não. A maioria dos pacientes tem redução significativa ou eliminação da dor.

**Posso voltar a praticar esportes?**
Sim, mas isso leva tempo e requer liberação profissional.

---

**Lembre-se: Você é parte fundamental da sua recuperação!**
`,
    targetAudience: 'patient',
    images: [],
    readTime: '8 min',
    tags: ['educação', 'paciente', 'joelho', 'pós-operatório', 'reabilitação'],
    relatedContent: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

console.log(`✅ Geradas ${SPECIALIZED_ASSESSMENTS.length} avaliações`);
console.log(`✅ Gerados ${CLINICAL_MATERIALS.length} materiais clínicos`);
console.log(`✅ Gerados ${CLINICAL_LIBRARY.length} itens de biblioteca`);
console.log(`✅ Gerados ${EDUCATIONAL_CONTENT.length} conteúdos educacionais`);

export { SPECIALIZED_ASSESSMENTS, CLINICAL_MATERIALS, CLINICAL_LIBRARY, EDUCATIONAL_CONTENT };

