// data/exercisesLibraryData.ts
// Biblioteca Completa de Exercícios - 55+ exercícios profissionais

export const EXERCISES_LIBRARY = [
  // ============================================
  // FISIOTERAPIA ESPORTIVA (20 exercícios)
  // ============================================
  {
    id: 'ex-sport-001',
    name: 'Agachamento Unilateral (Pistol Squat)',
    description: 'Exercício avançado de força e estabilidade para membros inferiores, focando em controle neuromuscular e potência.',
    specialty: 'esportiva',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais', 'Core'],
    difficulty: 'advanced',
    equipment: ['Corpo livre', 'TRX (opcional)'],
    duration: 180,
    instructions: [
      'Posicione-se em pé com os pés afastados na largura dos ombros',
      'Estenda uma perna à frente mantendo-a elevada',
      'Desça lentamente flexionando o joelho da perna de apoio',
      'Mantenha o tronco ereto e core ativado',
      'Retorne à posição inicial usando a força da perna de apoio',
      'Complete as repetições e troque de lado'
    ],
    benefits: [
      'Desenvolvimento de força unilateral',
      'Melhora do equilíbrio e propriocepção',
      'Prevenção de assimetrias musculares',
      'Fortalecimento funcional para esportes'
    ],
    contraindications: [
      'Lesões agudas de joelho',
      'Instabilidade de tornozelo não tratada',
      'Dor na articulação patelofemoral',
      'Pós-operatório recente de membros inferiores'
    ],
    variations: [
      { type: 'easier', description: 'Use TRX para suporte ou desça apenas parcialmente' },
      { type: 'harder', description: 'Adicione peso com halteres ou coloque pé elevado em caixa' }
    ],
    videoUrl: 'https://example.com/pistol-squat',
    imageUrl: '/images/exercises/ex-sport-001.svg',
    tags: ['força', 'unilateral', 'membros inferiores', 'funcional', 'avançado']
  },
  {
    id: 'ex-sport-002',
    name: 'Box Jump (Salto em Caixa)',
    description: 'Exercício pliométrico para desenvolvimento de potência explosiva e força reativa dos membros inferiores.',
    specialty: 'esportiva',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilha', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Caixa pliométrica', 'Step ajustável'],
    duration: 120,
    instructions: [
      'Posicione-se em pé de frente para a caixa a uma distância confortável',
      'Realize um movimento preparatório flexionando joelhos e quadris',
      'Execute um salto explosivo balançando os braços para cima',
      'Aterrisse suavemente sobre a caixa com ambos os pés simultaneamente',
      'Estenda completamente quadris e joelhos no topo',
      'Desça com controle e repita o movimento'
    ],
    benefits: [
      'Aumento da potência muscular',
      'Melhora da performance atlética',
      'Desenvolvimento da força explosiva',
      'Treino de aterrissagem segura'
    ],
    contraindications: [
      'Tendinite patelar',
      'Lesões de ligamento cruzado anterior',
      'Condromalácia patelar avançada',
      'Fascite plantar aguda'
    ],
    variations: [
      { type: 'easier', description: 'Use caixa mais baixa ou faça step-up ao invés de salto' },
      { type: 'harder', description: 'Aumente altura da caixa, adicione peso ou faça saltos contínuos' }
    ],
    videoUrl: 'https://example.com/box-jump',
    imageUrl: '/images/exercises/ex-sport-002.svg',
    tags: ['pliometria', 'potência', 'explosivo', 'salto', 'performance']
  },
  {
    id: 'ex-sport-003',
    name: 'Nordic Hamstring Curl',
    description: 'Exercício excêntrico específico para prevenção de lesões dos isquiotibiais, muito usado em protocolos de retorno ao esporte.',
    specialty: 'esportiva',
    targetMuscles: ['Isquiotibiais', 'Glúteos', 'Lombar'],
    difficulty: 'advanced',
    equipment: ['Parceiro', 'Barra fixa baixa', 'Colchonete'],
    duration: 150,
    instructions: [
      'Ajoelhe-se no colchonete com tornozelos fixos (parceiro segura ou sob barra)',
      'Mantenha tronco, quadris e joelhos alinhados',
      'Contraia glúteos e core para manter posição neutra',
      'Desça lentamente para frente controlando a descida com isquiotibiais',
      'Use as mãos para amortecer quando necessário',
      'Retorne à posição inicial com impulso dos braços ou contração concêntrica'
    ],
    benefits: [
      'Prevenção de lesões de isquiotibiais',
      'Fortalecimento excêntrico específico',
      'Redução de risco de distensões musculares',
      'Melhora da estabilidade posterior do joelho'
    ],
    contraindications: [
      'Lesão aguda de isquiotibiais',
      'Tendinite proximal dos isquiotibiais',
      'Dor anterior no joelho',
      'Bursite pré-patelar'
    ],
    variations: [
      { type: 'easier', description: 'Use faixa elástica para assistência ou reduza amplitude' },
      { type: 'harder', description: 'Aumente velocidade excêntrica ou adicione peso no tronco' }
    ],
    videoUrl: 'https://example.com/nordic-curl',
    imageUrl: '/images/exercises/ex-sport-003.svg',
    tags: ['prevenção', 'isquiotibiais', 'excêntrico', 'lesão', 'futebol']
  },
  {
    id: 'ex-sport-004',
    name: 'Agilidade em Escada (Ladder Drills)',
    description: 'Treinamento de agilidade e coordenação com escada de velocidade para melhora de footwork e rapidez de movimentos.',
    specialty: 'esportiva',
    targetMuscles: ['Panturrilha', 'Tibial anterior', 'Quadríceps', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Escada de agilidade', 'Marcadores de cone'],
    duration: 240,
    instructions: [
      'Posicione a escada de agilidade em superfície plana',
      'Execute diferentes padrões de movimentos dos pés',
      'Mantenha altura baixa e peso na ponta dos pés',
      'Realize movimentos rápidos e precisos',
      'Mantenha olhar para frente, não para baixo',
      'Varie padrões: um pé, dois pés, lateral, cruzado'
    ],
    benefits: [
      'Melhora da coordenação motora',
      'Aumento da velocidade de reação',
      'Desenvolvimento de agilidade',
      'Aprimoramento do controle neuromuscular'
    ],
    contraindications: [
      'Entorse aguda de tornozelo',
      'Fascite plantar severa',
      'Fratura de estresse em membros inferiores',
      'Vertigem ou tontura'
    ],
    variations: [
      { type: 'easier', description: 'Reduza velocidade e use padrões simples (dois pés por quadrado)' },
      { type: 'harder', description: 'Aumente velocidade, combine com mudanças de direção ou adicione reação visual' }
    ],
    videoUrl: 'https://example.com/ladder-drills',
    imageUrl: '/images/exercises/ex-sport-004.svg',
    tags: ['agilidade', 'coordenação', 'velocidade', 'footwork', 'esporte']
  },
  {
    id: 'ex-sport-005',
    name: 'Rotação de Tronco com Medicine Ball',
    description: 'Exercício de potência rotacional para desenvolvimento de força do core e transferência de energia entre membros.',
    specialty: 'esportiva',
    targetMuscles: ['Oblíquos', 'Reto abdominal', 'Transverso', 'Multífidos'],
    difficulty: 'intermediate',
    equipment: ['Medicine ball (3-8kg)', 'Parede sólida'],
    duration: 120,
    instructions: [
      'Posicione-se lateralmente a uma parede a aproximadamente 1 metro',
      'Segure medicine ball na altura do peito',
      'Gire tronco afastando-se da parede',
      'Execute rotação explosiva arremessando a bola contra a parede',
      'Receba a bola de volta e absorva o impacto',
      'Repita movimento de forma contínua'
    ],
    benefits: [
      'Desenvolvimento de potência rotacional',
      'Fortalecimento funcional do core',
      'Melhora da transferência de força',
      'Aplicável a diversos esportes (tênis, golfe, artes marciais)'
    ],
    contraindications: [
      'Hérnia de disco lombar',
      'Dor lombar aguda',
      'Lesão dos músculos oblíquos',
      'Instabilidade lombar severa'
    ],
    variations: [
      { type: 'easier', description: 'Use bola mais leve ou faça rotações sem arremesso' },
      { type: 'harder', description: 'Aumente peso da bola, velocidade ou realize de joelhos' }
    ],
    videoUrl: 'https://example.com/medicine-ball-rotation',
    imageUrl: '/images/exercises/ex-sport-005.svg',
    tags: ['core', 'rotação', 'potência', 'funcional', 'medicine ball']
  },
  // Continuando com mais 15 exercícios esportivos...
  {
    id: 'ex-sport-006',
    name: 'Single Leg Romanian Deadlift',
    description: 'Exercício unilateral para cadeia posterior, equilíbrio e estabilidade do quadril.',
    specialty: 'esportiva',
    targetMuscles: ['Isquiotibiais', 'Glúteos', 'Lombar', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Halteres', 'Kettlebell', 'Corpo livre'],
    duration: 150,
    instructions: [
      'Fique em pé com pés unidos, segurando peso em uma ou ambas as mãos',
      'Transfira peso para uma perna, levante a outra ligeiramente',
      'Incline tronco para frente com joelho levemente flexionado',
      'Estenda perna livre para trás mantendo alinhamento corpo-perna',
      'Desça até sentir alongamento nos isquiotibiais',
      'Retorne à posição inicial contraindo glúteos e isquiotibiais'
    ],
    benefits: [
      'Fortalecimento da cadeia posterior',
      'Melhora do equilíbrio dinâmico',
      'Correção de assimetrias',
      'Estabilização do quadril e lombar'
    ],
    contraindications: [
      'Lesão aguda de isquiotibiais',
      'Lombalgia aguda',
      'Vertigem postural',
      'Instabilidade grave de tornozelo'
    ],
    variations: [
      { type: 'easier', description: 'Apoie dedos do pé livre no chão ou use suporte para equilíbrio' },
      { type: 'harder', description: 'Aumente carga, feche olhos ou realize sobre superfície instável' }
    ],
    videoUrl: 'https://example.com/sl-rdl',
    imageUrl: '/images/exercises/ex-sport-006.svg',
    tags: ['unilateral', 'cadeia posterior', 'equilíbrio', 'funcional']
  },
  {
    id: 'ex-sport-007',
    name: 'Burpees com Salto',
    description: 'Exercício de corpo inteiro combinando força e condicionamento cardiovascular.',
    specialty: 'esportiva',
    targetMuscles: ['Corpo inteiro', 'Core', 'Peitorais', 'Quadríceps'],
    difficulty: 'advanced',
    equipment: ['Corpo livre', 'Espaço aberto'],
    duration: 180,
    instructions: [
      'Inicie em pé com pés na largura dos ombros',
      'Abaixe-se colocando mãos no chão',
      'Salte ou desloque pés para posição de prancha',
      'Execute uma flexão de braço completa',
      'Retorne pés para perto das mãos',
      'Salte verticalmente com braços estendidos acima da cabeça'
    ],
    benefits: [
      'Condicionamento metabólico intenso',
      'Trabalho de corpo inteiro',
      'Melhora cardiovascular',
      'Eficiência temporal no treino'
    ],
    contraindications: [
      'Problemas cardiovasculares não controlados',
      'Lesões agudas de punho ou ombro',
      'Lombalgia aguda',
      'Hipertensão não controlada'
    ],
    variations: [
      { type: 'easier', description: 'Elimine flexão ou salto, caminhe pés ao invés de saltar' },
      { type: 'harder', description: 'Adicione salto sobre obstáculo ou faça flexão com palmas' }
    ],
    videoUrl: 'https://example.com/burpees',
    imageUrl: '/images/exercises/ex-sport-007.svg',
    tags: ['HIIT', 'condicionamento', 'corpo inteiro', 'metabólico']
  },
  {
    id: 'ex-sport-008',
    name: 'Y-T-W com Halteres',
    description: 'Série de exercícios para fortalecimento escapular e manguito rotador.',
    specialty: 'esportiva',
    targetMuscles: ['Trapézio inferior', 'Romboides', 'Manguito rotador', 'Deltoides'],
    difficulty: 'beginner',
    equipment: ['Halteres leves (1-3kg)', 'Banco inclinado'],
    duration: 180,
    instructions: [
      'Deite-se em banco inclinado a 45° com peito apoiado',
      'Segure halteres com braços pendentes',
      'Y: Eleve braços diagonalmente formando Y',
      'T: Eleve braços lateralmente formando T',
      'W: Puxe cotovelos para trás como remada alta',
      'Execute cada letra de forma lenta e controlada'
    ],
    benefits: [
      'Fortalecimento da estabilidade escapular',
      'Prevenção de lesões de ombro',
      'Melhora da postura',
      'Ativação adequada do manguito rotador'
    ],
    contraindications: [
      'Lesão aguda de manguito rotador',
      'Bursite subacromial severa',
      'Capsulite adesiva fase aguda',
      'Fratura recente de clavícula ou escápula'
    ],
    variations: [
      { type: 'easier', description: 'Realize sem peso ou com peso muito leve' },
      { type: 'harder', description: 'Aumente carga, velocidade ou faça com prancha frontal' }
    ],
    videoUrl: 'https://example.com/ytw-exercise',
    imageUrl: '/images/exercises/ex-sport-008.svg',
    tags: ['ombro', 'escapular', 'prevenção', 'manguito rotador']
  },
  // Adicionando mais exercícios esportivos (continuação até 20)
  {
    id: 'ex-sport-009',
    name: 'Sprint em Inclinação',
    description: 'Corrida de velocidade em subida para desenvolvimento de potência e técnica de corrida.',
    specialty: 'esportiva',
    targetMuscles: ['Glúteos', 'Isquiotibiais', 'Quadríceps', 'Panturrilha'],
    difficulty: 'intermediate',
    equipment: ['Rampa ou escada', 'Espaço externo'],
    duration: 300,
    instructions: [
      'Identifique uma inclinação de 10-20 graus',
      'Aqueça adequadamente antes de iniciar',
      'Execute sprints de 20-30 metros em máxima intensidade',
      'Mantenha inclinação anterior do tronco',
      'Enfatize empurrar o solo para trás',
      'Descanse 2-3 minutos entre repetições'
    ],
    benefits: [
      'Desenvolvimento de potência específica para corrida',
      'Sobrecarga reduzida comparado a sprint plano',
      'Melhora da técnica de aceleração',
      'Fortalecimento de cadeia posterior'
    ],
    contraindications: [
      'Lesões agudas de membros inferiores',
      'Tendinite de Aquiles',
      'Condromalácia patelar severa',
      'Problemas cardiovasculares'
    ],
    variations: [
      { type: 'easier', description: 'Reduza inclinação, distância ou intensidade do sprint' },
      { type: 'harder', description: 'Aumente inclinação, distância ou adicione colete de peso' }
    ],
    videoUrl: 'https://example.com/hill-sprint',
    imageUrl: '/images/exercises/ex-sport-009.svg',
    tags: ['sprint', 'velocidade', 'corrida', 'potência', 'outdoor']
  },
  {
    id: 'ex-sport-010',
    name: 'Farmer\'s Walk (Caminhada do Fazendeiro)',
    description: 'Exercício de força e resistência de pegada com carry pesado.',
    specialty: 'esportiva',
    targetMuscles: ['Antebraços', 'Trapézio', 'Core', 'Quadríceps'],
    difficulty: 'intermediate',
    equipment: ['Halteres pesados', 'Kettlebells', 'Barras trap'],
    duration: 180,
    instructions: [
      'Pegue pesos pesados em cada mão',
      'Mantenha postura ereta com ombros retraídos',
      'Caminhe em linha reta com passos controlados',
      'Mantenha core ativado durante todo movimento',
      'Evite inclinação lateral ou rotação do tronco',
      'Caminhe por distância ou tempo determinado'
    ],
    benefits: [
      'Fortalecimento da pegada',
      'Estabilização do core',
      'Desenvolvimento de força funcional',
      'Melhora da resistência muscular'
    ],
    contraindications: [
      'Hérnia inguinal',
      'Lesões graves de ombro',
      'Lombalgia aguda',
      'Hipertensão não controlada'
    ],
    variations: [
      { type: 'easier', description: 'Reduza carga ou distância' },
      { type: 'harder', description: 'Aumente carga, caminhe em superfície instável ou unilateral' }
    ],
    videoUrl: 'https://example.com/farmers-walk',
    imageUrl: '/images/exercises/ex-sport-010.svg',
    tags: ['força', 'pegada', 'core', 'funcional', 'carry']
  },

  // ============================================
  // FISIOTERAPIA PÓS-OPERATÓRIA (20 exercícios)
  // ============================================
  {
    id: 'ex-postop-001',
    name: 'Mobilização Patelar',
    description: 'Técnica de mobilização manual da patela para ganho de mobilidade pós-cirurgia de joelho.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Patela', 'Retináculo patelar', 'Quadríceps'],
    difficulty: 'beginner',
    equipment: ['Maca', 'Almofada'],
    duration: 300,
    instructions: [
      'Paciente em decúbito dorsal com joelho estendido e relaxado',
      'Posicione dedos nas bordas da patela',
      'Realize deslizamentos suaves: superior, inferior, medial e lateral',
      'Execute mobilizações em todas direções por 30-60 segundos cada',
      'Mantenha quadríceps completamente relaxado',
      'Progresso gradual conforme tolerância do paciente'
    ],
    benefits: [
      'Prevenção de aderências patelares',
      'Melhora da mobilidade articular',
      'Redução de rigidez pós-operatória',
      'Facilitação do deslizamento patelar'
    ],
    contraindications: [
      'Pós-operatório imediato (primeiras 48h)',
      'Fratura de patela não consolidada',
      'Infecção articular',
      'Dor intensa à palpação'
    ],
    variations: [
      { type: 'easier', description: 'Mobilizações mais suaves com menor amplitude' },
      { type: 'harder', description: 'Adicione mobilizações com joelho flexionado' }
    ],
    videoUrl: 'https://example.com/patellar-mob',
    imageUrl: '/images/exercises/patellar-mob.jpg',
    tags: ['mobilização', 'joelho', 'pós-op', 'patela', 'ADM']
  },
  {
    id: 'ex-postop-002',
    name: 'Flexão Ativa-Assistida de Joelho',
    description: 'Exercício para ganho gradual de flexão de joelho no pós-operatório.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Isquiotibiais', 'Gastrocnêmio', 'Cápsula articular'],
    difficulty: 'beginner',
    equipment: ['Toalha', 'Faixa elástica', 'Cadeira'],
    duration: 240,
    instructions: [
      'Sente-se em cadeira com pé operado no chão',
      'Coloque toalha sob o pé para deslizamento',
      'Deslize pé para trás aumentando flexão do joelho',
      'Use mão ou perna não operada para assistir movimento',
      'Mantenha posição de máxima flexão por 5-10 segundos',
      'Retorne suavemente à posição inicial'
    ],
    benefits: [
      'Ganho progressivo de amplitude de movimento',
      'Prevenção de rigidez articular',
      'Restauração da função',
      'Controle do processo cicatricial'
    ],
    contraindications: [
      'Ordem médica de restrição de ADM',
      'Derrame articular significativo',
      'Dor intensa durante movimento',
      'Sinais de complicação cirúrgica'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, mais assistência manual' },
      { type: 'harder', description: 'Progresso para flexão ativa sem assistência' }
    ],
    videoUrl: 'https://example.com/knee-flexion-aa',
    imageUrl: '/images/exercises/knee-flexion-aa.jpg',
    tags: ['ADM', 'joelho', 'flexão', 'pós-op', 'assistido']
  },
  {
    id: 'ex-postop-003',
    name: 'Isométrico de Quadríceps (Quad Set)',
    description: 'Contração isométrica do quadríceps para manutenção de força e redução de atrofia pós-operatória.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Vasto medial oblíquo'],
    difficulty: 'beginner',
    equipment: ['Rolo/toalha', 'Maca'],
    duration: 180,
    instructions: [
      'Deite-se com perna estendida e rolo sob o joelho',
      'Contraia quadríceps empurrando joelho contra o rolo',
      'Mantenha contração máxima por 5-10 segundos',
      'Observe patela subir durante contração',
      'Relaxe completamente entre repetições',
      'Repita 10-15 vezes, múltiplas séries ao dia'
    ],
    benefits: [
      'Ativação precoce do quadríceps',
      'Prevenção de atrofia muscular',
      'Redução de inibição artrogênica',
      'Melhora do controle neuromuscular'
    ],
    contraindications: [
      'Dor intensa à contração',
      'Ordem médica de repouso absoluto',
      'Lesão completa não reparada do quadríceps',
      'Instabilidade articular grave'
    ],
    variations: [
      { type: 'easier', description: 'Contrações submáximas de menor duração' },
      { type: 'harder', description: 'Adicione elevação da perna estendida (SLR)' }
    ],
    videoUrl: 'https://example.com/quad-set',
    imageUrl: '/images/exercises/quad-set.jpg',
    tags: ['isométrico', 'quadríceps', 'pós-op', 'ativação', 'precoce']
  },
  {
    id: 'ex-postop-004',
    name: 'Elevação da Perna Estendida (SLR)',
    description: 'Exercício fundamental pós-operatório para fortalecimento de quadríceps e flexores de quadril.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Iliopsoas', 'Reto femoral'],
    difficulty: 'beginner',
    equipment: ['Maca', 'Caneleira (opcional)'],
    duration: 180,
    instructions: [
      'Deite-se em decúbito dorsal com joelho operado estendido',
      'Flexione joelho contralateral com pé apoiado',
      'Contraia quadríceps da perna operada',
      'Eleve perna estendida até altura do joelho contralateral',
      'Mantenha 2-3 segundos no topo',
      'Desça controladamente sem relaxar quadríceps'
    ],
    benefits: [
      'Fortalecimento do quadríceps sem carga articular',
      'Progressão segura no pós-operatório',
      'Melhora do controle motor',
      'Preparação para marcha'
    ],
    contraindications: [
      'Incapacidade de manter joelho estendido',
      'Dor lombar durante movimento',
      'Lag extensor significativo',
      'Fase muito precoce pós-operatória (conforme protocolo)'
    ],
    variations: [
      { type: 'easier', description: 'Realize com joelho levemente flexionado ou menor amplitude' },
      { type: 'harder', description: 'Adicione caneleira ou mantenha posição isométrica no topo' }
    ],
    videoUrl: 'https://example.com/slr',
    imageUrl: '/images/exercises/slr.jpg',
    tags: ['SLR', 'quadríceps', 'pós-op', 'fundamental', 'joelho']
  },
  {
    id: 'ex-postop-005',
    name: 'Pêndulo de Codman',
    description: 'Exercício passivo para mobilização suave de ombro no pós-operatório inicial.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Cápsula glenoumeral', 'Deltoides', 'Manguito rotador'],
    difficulty: 'beginner',
    equipment: ['Mesa/cadeira para apoio', 'Peso leve (opcional)'],
    duration: 180,
    instructions: [
      'Incline-se para frente apoiando mão sadia em mesa',
      'Deixe braço operado pendente relaxado',
      'Inicie movimentos suaves do tronco',
      'Permita que braço balance passivamente',
      'Execute círculos pequenos, depois maiores',
      'Alterne direção dos círculos'
    ],
    benefits: [
      'Mobilização suave sem carga muscular',
      'Redução de rigidez capsular',
      'Melhora do movimento sinovial',
      'Relaxamento muscular'
    ],
    contraindications: [
      'Fratura não consolidada',
      'Reparo de manguito rotador muito tenso',
      'Dor intensa ao movimento pendular',
      'Instabilidade glenoumeral severa'
    ],
    variations: [
      { type: 'easier', description: 'Movimentos menores, sem peso adicional' },
      { type: 'harder', description: 'Adicione peso leve (0.5-1kg) ou aumente amplitude' }
    ],
    videoUrl: 'https://example.com/codman-pendulum',
    imageUrl: '/images/exercises/codman.jpg',
    tags: ['codman', 'ombro', 'pós-op', 'passivo', 'mobilização']
  },
  // Continuando com 15 exercícios pós-operatórios restantes...
  {
    id: 'ex-postop-006',
    name: 'Flexão Ativa-Assistida de Ombro com Bastão',
    description: 'Mobilização assistida para ganho de elevação anterior do ombro.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Deltoides anterior', 'Manguito rotador', 'Cápsula anterior'],
    difficulty: 'beginner',
    equipment: ['Bastão/cabo de vassoura'],
    duration: 240,
    instructions: [
      'Deite-se em decúbito dorsal ou sente-se',
      'Segure bastão com ambas as mãos, pegada na largura dos ombros',
      'Use braço não operado para empurrar bastão para cima',
      'Eleve braços acima da cabeça dentro da amplitude tolerável',
      'Mantenha 5-10 segundos na posição máxima',
      'Retorne controladamente'
    ],
    benefits: [
      'Ganho progressivo de flexão de ombro',
      'Assistência controlada pelo próprio paciente',
      'Prevenção de capsulite adesiva',
      'Restauração da ADM funcional'
    ],
    contraindications: [
      'Restrições de ADM prescritas pelo cirurgião',
      'Dor severa durante movimento',
      'Reparo tendinoso sob tensão',
      'Sinais de re-ruptura'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, mais assistência do braço sadio' },
      { type: 'harder', description: 'Progresso para ativo-livre sem bastão' }
    ],
    videoUrl: 'https://example.com/shoulder-wand',
    imageUrl: '/images/exercises/shoulder-wand.jpg',
    tags: ['ombro', 'ADM', 'assistido', 'bastão', 'flexão']
  },
  {
    id: 'ex-postop-007',
    name: 'Mini Agachamento Isométrico na Parede (Wall Sit)',
    description: 'Fortalecimento isométrico de membros inferiores com carga controlada.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    difficulty: 'intermediate',
    equipment: ['Parede', 'Bola suíça (opcional)'],
    duration: 120,
    instructions: [
      'Posicione-se com costas apoiadas na parede',
      'Deslize para baixo até ângulo de 45-60 graus no joelho',
      'Mantenha pés afastados na largura dos quadris',
      'Distribua peso igualmente entre ambas as pernas',
      'Mantenha posição por 10-30 segundos',
      'Progrida gradualmente tempo e ângulo'
    ],
    benefits: [
      'Fortalecimento sem cisalhamento patelar excessivo',
      'Carga controlada e progressiva',
      'Ativação bilateral ou unilateral',
      'Melhora da resistência muscular'
    ],
    contraindications: [
      'Condromalácia patelar severa',
      'Dor patelofemoral significativa',
      'Fase muito precoce pós-LCA',
      'Instabilidade de joelho não controlada'
    ],
    variations: [
      { type: 'easier', description: 'Ângulo menor (mais alto), menor tempo de sustentação' },
      { type: 'harder', description: 'Maior flexão (60-90°), unilateral ou adicione peso' }
    ],
    videoUrl: 'https://example.com/wall-sit',
    imageUrl: '/images/exercises/wall-sit.jpg',
    tags: ['isométrico', 'quadríceps', 'parede', 'bilateral', 'pós-op']
  },

  // ============================================
  // FISIOTERAPIA GERONTOLÓGICA (15 exercícios)
  // ============================================
  {
    id: 'ex-geria-001',
    name: 'Marcha Tandem (Calcanhar-Dedos)',
    description: 'Exercício de equilíbrio dinâmico e propriocepção para prevenção de quedas.',
    specialty: 'geriatrica',
    targetMuscles: ['Tibial anterior', 'Gastrocnêmio', 'Core', 'Glúteo médio'],
    difficulty: 'intermediate',
    equipment: ['Barras paralelas', 'Linha no chão', 'Corredor'],
    duration: 240,
    instructions: [
      'Posicione-se próximo a suporte (parede ou barra) se necessário',
      'Coloque um pé diretamente à frente do outro',
      'Calcanhar do pé da frente encosta nos dedos do pé de trás',
      'Caminhe em linha reta mantendo este padrão',
      'Mantenha olhar para frente, não para os pés',
      'Use braços abertos para auxiliar equilíbrio'
    ],
    benefits: [
      'Melhora do equilíbrio dinâmico',
      'Treino de base de suporte estreita',
      'Redução de risco de quedas',
      'Aumento da confiança na marcha'
    ],
    contraindications: [
      'Vertigem ou tontura aguda',
      'Neuropatia periférica severa',
      'Hipotensão postural não controlada',
      'Instabilidade postural muito grave'
    ],
    variations: [
      { type: 'easier', description: 'Caminhe com pés em linha mas com pequeno espaço entre eles' },
      { type: 'harder', description: 'Feche olhos, caminhe para trás ou sobre superfície macia' }
    ],
    videoUrl: 'https://example.com/tandem-walk',
    imageUrl: '/images/exercises/tandem-walk.jpg',
    tags: ['equilíbrio', 'marcha', 'quedas', 'prevenção', 'idoso']
  },
  {
    id: 'ex-geria-002',
    name: 'Sentar e Levantar da Cadeira',
    description: 'Exercício funcional essencial para força de membros inferiores e independência.',
    specialty: 'geriatrica',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
    difficulty: 'beginner',
    equipment: ['Cadeira resistente', 'Almofada (opcional)'],
    duration: 180,
    instructions: [
      'Sente-se em cadeira firme de altura adequada',
      'Pés apoiados completamente no chão',
      'Incline tronco ligeiramente para frente',
      'Transfira peso para os pés',
      'Levante-se usando força das pernas',
      'Sente-se controladamente sem se jogar'
    ],
    benefits: [
      'Fortalecimento funcional de MMII',
      'Manutenção da independência',
      'Melhora da transferência',
      'Prevenção de sarcopenia'
    ],
    contraindications: [
      'Instabilidade postural severa sem supervisão',
      'Artrose de joelho com dor intensa',
      'Hipotensão postural significativa',
      'Lesões agudas de membros inferiores'
    ],
    variations: [
      { type: 'easier', description: 'Use cadeira mais alta, apoio de braços ou assistência manual' },
      { type: 'harder', description: 'Cadeira mais baixa, sem apoio de mãos, unilateral' }
    ],
    videoUrl: 'https://example.com/sit-to-stand',
    imageUrl: '/images/exercises/sit-to-stand.jpg',
    tags: ['funcional', 'força', 'transferência', 'AVD', 'cadeira']
  },
  {
    id: 'ex-geria-003',
    name: 'Apoio Unipodal com Suporte',
    description: 'Treino de equilíbrio estático em uma perna com segurança.',
    specialty: 'geriatrica',
    targetMuscles: ['Glúteo médio', 'Tibial anterior', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Barra/cadeira para apoio', 'Superfície estável'],
    duration: 180,
    instructions: [
      'Posicione-se próximo a suporte (cadeira, barra, parede)',
      'Apoie levemente uma mão no suporte',
      'Eleve uma perna do chão (flexão joelho ou quadril)',
      'Mantenha posição por 10-30 segundos',
      'Mantenha postura ereta e olhar para frente',
      'Troque de perna e repita'
    ],
    benefits: [
      'Fortalecimento de estabilizadores de tornozelo e quadril',
      'Treino de propriocepção',
      'Prevenção de quedas',
      'Melhora da fase de apoio da marcha'
    ],
    contraindications: [
      'Vertigem posicional',
      'Neuropatia periférica severa',
      'Fratura recente de membros inferiores',
      'Instabilidade grave sem supervisão'
    ],
    variations: [
      { type: 'easier', description: 'Maior apoio no suporte, olhos abertos, tempo menor' },
      { type: 'harder', description: 'Sem suporte, olhos fechados, sobre almofada' }
    ],
    videoUrl: 'https://example.com/single-leg-stance',
    imageUrl: '/images/exercises/single-leg-stance.jpg',
    tags: ['equilíbrio', 'unipodal', 'propriocepção', 'estabilidade']
  },
  {
    id: 'ex-geria-004',
    name: 'Fortalecimento de Dorsiflexores (Elevação de Pé)',
    description: 'Exercício para prevenção de pé caído e melhora da fase de balanço da marcha.',
    specialty: 'geriatrica',
    targetMuscles: ['Tibial anterior', 'Extensor longo dos dedos'],
    difficulty: 'beginner',
    equipment: ['Cadeira', 'Faixa elástica (opcional)'],
    duration: 180,
    instructions: [
      'Sente-se em cadeira com pés apoiados no chão',
      'Mantenha calcanhar no chão',
      'Eleve ponta dos pés o máximo possível',
      'Mantenha 2-3 segundos no topo',
      'Desça controladamente',
      'Repita 15-20 vezes'
    ],
    benefits: [
      'Prevenção de tropeços',
      'Melhora da fase de balanço da marcha',
      'Fortalecimento de dorsiflexores',
      'Redução de risco de quedas'
    ],
    contraindications: [
      'Fraturas não consolidadas de tornozelo/pé',
      'Cãibras frequentes em anterior da perna',
      'Dor significativa no compartimento anterior',
      'Flebite ou trombose em MMII'
    ],
    variations: [
      { type: 'easier', description: 'Movimento lento, menor amplitude' },
      { type: 'harder', description: 'Adicione faixa elástica, realize em pé ou unilateral' }
    ],
    videoUrl: 'https://example.com/dorsiflexion',
    imageUrl: '/images/exercises/dorsiflexion.jpg',
    tags: ['dorsiflexão', 'marcha', 'tibial anterior', 'prevenção', 'quedas']
  },
  {
    id: 'ex-geria-005',
    name: 'Alongamento de Cadeia Posterior em Pé',
    description: 'Exercício de flexibilidade para isquiotibiais e panturrilha.',
    specialty: 'geriatrica',
    targetMuscles: ['Isquiotibiais', 'Gastrocnêmio', 'Sóleo'],
    difficulty: 'beginner',
    equipment: ['Cadeira', 'Step baixo'],
    duration: 240,
    instructions: [
      'Posicione-se próximo a cadeira para apoio',
      'Coloque calcanhar de uma perna sobre step baixo ou cadeira',
      'Mantenha joelho estendido mas não hiperestendido',
      'Incline tronco suavemente para frente mantendo coluna reta',
      'Mantenha alongamento por 20-30 segundos',
      'Respire normalmente durante alongamento'
    ],
    benefits: [
      'Melhora da flexibilidade de cadeia posterior',
      'Facilitação da amplitude de movimento',
      'Redução de rigidez muscular',
      'Melhora da postura'
    ],
    contraindications: [
      'Hérnia de disco lombar aguda',
      'Ciatalgia intensa',
      'Osteoporose severa',
      'Hipermobilidade articular'
    ],
    variations: [
      { type: 'easier', description: 'Menor elevação da perna, menor inclinação do tronco' },
      { type: 'harder', description: 'Maior elevação, maior inclinação ou dorsiflexão ativa' }
    ],
    videoUrl: 'https://example.com/hamstring-stretch',
    imageUrl: '/images/exercises/hamstring-stretch.jpg',
    tags: ['alongamento', 'flexibilidade', 'cadeia posterior', 'isquiotibiais']
  }
  ,{
    id: 'ex-geria-006',
    name: 'Exercício de Alcance Multidirecional',
    description: 'Treino de equilíbrio dinâmico com alcances em diferentes direções.',
    specialty: 'geriatrica',
    targetMuscles: ['Glúteo médio', 'Core', 'Deltoides'],
    difficulty: 'intermediate',
    equipment: ['Objetos leves', 'Prateleira/mesa'],
    duration: 300,
    instructions: [
      'Posicione-se em pé com pés afastados',
      'Coloque objetos em diferentes alturas e direções',
      'Alcance objetos movendo tronco e braços',
      'Mantenha equilíbrio durante todo movimento',
      'Varie: para cima, lados, frente, diagonais',
      'Retorne à posição inicial controladamente'
    ],
    benefits: [
      'Treino de equilíbrio funcional',
      'Simulação de AVDs',
      'Melhora da coordenação',
      'Treino de deslocamento de peso'
    ],
    contraindications: [
      'Vertigem severa',
      'Instabilidade postural sem supervisão',
      'Lesões de ombro limitantes',
      'Hipotensão postural'
    ],
    variations: [
      { type: 'easier', description: 'Alcances menores, objetos mais próximos, com suporte' },
      { type: 'harder', description: 'Alcances maiores, base de suporte reduzida, olhos fechados' }
    ],
    videoUrl: 'https://example.com/multidirectional-reach',
    imageUrl: '/images/exercises/multidirectional-reach.jpg',
    tags: ['equilíbrio', 'funcional', 'AVD', 'alcance', 'dinâmico']
  },
  {
    id: 'ex-geria-007',
    name: 'Step Lateral com Apoio',
    description: 'Exercício de marcha lateral para fortalecimento de abdutores e equilíbrio.',
    specialty: 'geriatrica',
    targetMuscles: ['Glúteo médio', 'Tensor da fáscia lata', 'Adutores'],
    difficulty: 'beginner',
    equipment: ['Barra paralela', 'Corredor largo'],
    duration: 180,
    instructions: [
      'Posicione-se entre barras paralelas ou próximo a suporte',
      'Dê passo lateral com uma perna',
      'Aproxime outra perna sem cruzar',
      'Continue caminhando lateralmente',
      'Mantenha tronco ereto e quadril nivelado',
      'Retorne na direção oposta'
    ],
    benefits: [
      'Fortalecimento de abdutores de quadril',
      'Melhora do equilíbrio lateral',
      'Prevenção de quedas laterais',
      'Treino de marcha funcional'
    ],
    contraindications: [
      'Bursite trocantérica aguda',
      'Artrose de quadril severa',
      'Instabilidade lateral severa',
      'Dor intensa ao movimento lateral'
    ],
    variations: [
      { type: 'easier', description: 'Passos menores, mais apoio nas barras' },
      { type: 'harder', description: 'Passos maiores, menos apoio, adicione faixa elástica' }
    ],
    videoUrl: 'https://example.com/lateral-step',
    imageUrl: '/images/exercises/lateral-step.jpg',
    tags: ['marcha', 'lateral', 'abdutores', 'equilíbrio', 'quadril']
  },
  {
    id: 'ex-geria-008',
    name: 'Rotação de Tronco Sentado',
    description: 'Mobilização de coluna torácica e melhora da rotação funcional.',
    specialty: 'geriatrica',
    targetMuscles: ['Oblíquos', 'Multífidos', 'Rotadores'],
    difficulty: 'beginner',
    equipment: ['Cadeira', 'Bastão'],
    duration: 180,
    instructions: [
      'Sente-se em cadeira com postura ereta',
      'Cruze braços sobre peito ou segure bastão',
      'Gire tronco para um lado mantendo quadril estável',
      'Retorne ao centro',
      'Gire para o outro lado',
      'Execute movimentos suaves e controlados'
    ],
    benefits: [
      'Melhora da mobilidade torácica',
      'Facilitação de AVDs (olhar para trás)',
      'Manutenção da flexibilidade da coluna',
      'Melhora da postura'
    ],
    contraindications: [
      'Hérnia de disco com compressão radicular',
      'Espondilolistese severa',
      'Fratura vertebral recente',
      'Dor intensa à rotação'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, sem bastão' },
      { type: 'harder', description: 'Maior amplitude, adicione resistência ou realize em pé' }
    ],
    videoUrl: 'https://example.com/trunk-rotation',
    imageUrl: '/images/exercises/trunk-rotation.jpg',
    tags: ['mobilidade', 'torácica', 'rotação', 'coluna', 'sentado']
  },
  {
    id: 'ex-geria-009',
    name: 'Treino de Transição Sentado para De Pé',
    description: 'Prática específica de transferência fundamental para independência.',
    specialty: 'geriatrica',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Core', 'Tríceps'],
    difficulty: 'beginner',
    equipment: ['Cadeira com braços', 'Andador (opcional)'],
    duration: 240,
    instructions: [
      'Sente-se na borda da cadeira',
      'Posicione pés recuados sob joelhos',
      'Incline tronco para frente',
      'Use mãos nos braços da cadeira se necessário',
      'Empurre com pernas e braços simultaneamente',
      'Estabilize-se completamente antes de iniciar marcha'
    ],
    benefits: [
      'Treino de transferência funcional',
      'Fortalecimento integrado',
      'Prevenção de quedas durante transições',
      'Aumento da independência'
    ],
    contraindications: [
      'Hipotensão ortostática severa não controlada',
      'Instabilidade extrema sem supervisão',
      'Lesões agudas que impeçam transferência',
      'Déficit cognitivo severo sem supervisão'
    ],
    variations: [
      { type: 'easier', description: 'Use cadeira mais alta, maior apoio de braços' },
      { type: 'harder', description: 'Cadeira mais baixa, sem apoio de mãos, transição mais rápida' }
    ],
    videoUrl: 'https://example.com/sit-stand-transition',
    imageUrl: '/images/exercises/sit-stand-transition.jpg',
    tags: ['transferência', 'funcional', 'AVD', 'independência', 'transição']
  },
  {
    id: 'ex-geria-010',
    name: 'Flexão Plantar Sentado',
    description: 'Fortalecimento de panturrilha em posição segura.',
    specialty: 'geriatrica',
    targetMuscles: ['Gastrocnêmio', 'Sóleo'],
    difficulty: 'beginner',
    equipment: ['Cadeira', 'Faixa elástica'],
    duration: 180,
    instructions: [
      'Sente-se com postura ereta',
      'Coloque faixa elástica sob antepé',
      'Empurre pé para baixo contra resistência',
      'Mantenha calcanhar apoiado ou levemente elevado',
      'Contraia panturrilha no final do movimento',
      'Retorne controladamente'
    ],
    benefits: [
      'Fortalecimento de flexores plantares',
      'Melhora da fase de propulsão da marcha',
      'Prevenção de fraqueza de panturrilha',
      'Melhora da circulação periférica'
    ],
    contraindications: [
      'Trombose venosa profunda',
      'Ruptura de tendão de Aquiles',
      'Cãibras frequentes severas',
      'Flebite ativa'
    ],
    variations: [
      { type: 'easier', description: 'Sem resistência, movimento menor' },
      { type: 'harder', description: 'Maior resistência, realizar em pé bilateral ou unilateral' }
    ],
    videoUrl: 'https://example.com/plantarflexion',
    imageUrl: '/images/exercises/plantarflexion.jpg',
    tags: ['panturrilha', 'flexão plantar', 'marcha', 'sentado', 'circulação']
  },
  {
    id: 'ex-geria-011',
    name: 'Circundução de Ombro',
    description: 'Mobilização global de ombro para manutenção de amplitude.',
    specialty: 'geriatrica',
    targetMuscles: ['Deltoides', 'Manguito rotador', 'Cápsula glenoumeral'],
    difficulty: 'beginner',
    equipment: ['Nenhum', 'Bastão (opcional)'],
    duration: 180,
    instructions: [
      'Posicione-se em pé ou sentado com boa postura',
      'Realize círculos com ombros para frente',
      'Execute movimentos amplos e controlados',
      'Repita na direção oposta (para trás)',
      'Mantenha cotovelos estendidos ou levemente flexionados',
      'Respire normalmente durante exercício'
    ],
    benefits: [
      'Manutenção da mobilidade de ombro',
      'Prevenção de rigidez',
      'Facilitação de AVDs (vestir, pentear)',
      'Aquecimento articular'
    ],
    contraindications: [
      'Lesão aguda de manguito rotador',
      'Luxação ou subluxação de ombro',
      'Dor severa ao movimento',
      'Capsulite adesiva fase álgica'
    ],
    variations: [
      { type: 'easier', description: 'Círculos menores, movimentos mais lentos' },
      { type: 'harder', description: 'Círculos maiores, adicione peso leve ou bastão' }
    ],
    videoUrl: 'https://example.com/shoulder-circles',
    imageUrl: '/images/exercises/shoulder-circles.jpg',
    tags: ['ombro', 'mobilidade', 'circundução', 'ADM', 'AVD']
  },
  {
    id: 'ex-geria-012',
    name: 'Ponte (Bridge) com Apoio',
    description: 'Fortalecimento de glúteos e estabilizadores de lombar.',
    specialty: 'geriatrica',
    targetMuscles: ['Glúteos', 'Isquiotibiais', 'Paravertebrais', 'Core'],
    difficulty: 'beginner',
    equipment: ['Colchonete', 'Apoio para braços'],
    duration: 180,
    instructions: [
      'Deite-se em decúbito dorsal com joelhos flexionados',
      'Pés apoiados na largura dos quadris',
      'Braços ao lado do corpo ou apoiados para auxílio',
      'Eleve quadril contraindo glúteos',
      'Mantenha alinhamento joelhos-quadris-ombros',
      'Desça controladamente'
    ],
    benefits: [
      'Fortalecimento de cadeia posterior',
      'Estabilização lombar',
      'Melhora da postura',
      'Preparação para transferências'
    ],
    contraindications: [
      'Estenose espinhal severa',
      'Lesões agudas lombares',
      'Hiperlordose com dor',
      'Dificuldade de deitar/levantar do chão'
    ],
    variations: [
      { type: 'easier', description: 'Menor elevação, segurar menos tempo, usar maca mais alta' },
      { type: 'harder', description: 'Sustentar mais tempo, unilateral, adicionar faixa elástica' }
    ],
    videoUrl: 'https://example.com/bridge',
    imageUrl: '/images/exercises/bridge.jpg',
    tags: ['glúteos', 'ponte', 'cadeia posterior', 'lombar', 'core']
  },
  {
    id: 'ex-geria-013',
    name: 'Marcha com Obstáculos',
    description: 'Treino de marcha funcional com superação de obstáculos para prevenção de tropeços.',
    specialty: 'geriatrica',
    targetMuscles: ['Iliopsoas', 'Quadríceps', 'Dorsiflexores', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Obstáculos baixos', 'Cones', 'Barras paralelas'],
    duration: 300,
    instructions: [
      'Posicione obstáculos baixos (5-15cm) em linha',
      'Caminhe levantando bem os pés para passar sobre obstáculos',
      'Mantenha olhar para frente, não para baixo',
      'Use suporte lateral se necessário',
      'Inicie com obstáculos mais baixos',
      'Progrida altura e quantidade conforme evolução'
    ],
    benefits: [
      'Treino de clearance de pé',
      'Prevenção de tropeços e quedas',
      'Melhora da propriocepção',
      'Simulação de ambiente real'
    ],
    contraindications: [
      'Risco de queda muito elevado',
      'Neuropatia periférica severa',
      'Déficit visual significativo',
      'Instabilidade sem supervisão adequada'
    ],
    variations: [
      { type: 'easier', description: 'Obstáculos mais baixos, maior espaçamento, com suporte' },
      { type: 'harder', description: 'Obstáculos mais altos, menor espaçamento, menos suporte' }
    ],
    videoUrl: 'https://example.com/obstacle-walk',
    imageUrl: '/images/exercises/obstacle-walk.jpg',
    tags: ['marcha', 'obstáculos', 'prevenção', 'quedas', 'funcional']
  },
  {
    id: 'ex-geria-014',
    name: 'Extensão de Joelho Sentado',
    description: 'Fortalecimento isolado de quadríceps em posição segura.',
    specialty: 'geriatrica',
    targetMuscles: ['Quadríceps', 'Vasto medial oblíquo'],
    difficulty: 'beginner',
    equipment: ['Cadeira', 'Caneleira', 'Faixa elástica'],
    duration: 180,
    instructions: [
      'Sente-se com costas apoiadas',
      'Adicione caneleira ou faixa elástica se disponível',
      'Estenda joelho até posição horizontal',
      'Contraia quadríceps no final do movimento',
      'Mantenha 2-3 segundos',
      'Desça controladamente'
    ],
    benefits: [
      'Fortalecimento específico de quadríceps',
      'Melhora da extensão de joelho para marcha',
      'Prevenção de fraqueza',
      'Exercício seguro e controlado'
    ],
    contraindications: [
      'Artrose femoropatelar severa',
      'Dor patelar intensa',
      'Derrame articular significativo',
      'Limitação importante de ADM'
    ],
    variations: [
      { type: 'easier', description: 'Sem peso, menor amplitude, bilateral' },
      { type: 'harder', description: 'Maior resistência, extensão completa, unilateral com pausa' }
    ],
    videoUrl: 'https://example.com/knee-extension',
    imageUrl: '/images/exercises/knee-extension.jpg',
    tags: ['quadríceps', 'joelho', 'extensão', 'sentado', 'isolado']
  },
  {
    id: 'ex-geria-015',
    name: 'Respiração Diafragmática',
    description: 'Exercício respiratório para melhora da função pulmonar e relaxamento.',
    specialty: 'geriatrica',
    targetMuscles: ['Diafragma', 'Intercostais'],
    difficulty: 'beginner',
    equipment: ['Cadeira confortável', 'Almofada'],
    duration: 300,
    instructions: [
      'Sente-se confortavelmente ou deite-se',
      'Coloque uma mão no peito e outra no abdômen',
      'Inspire lentamente pelo nariz expandindo abdômen',
      'Peito deve mover-se minimamente',
      'Expire lentamente pela boca',
      'Repita por 5-10 minutos'
    ],
    benefits: [
      'Melhora da função respiratória',
      'Redução de ansiedade e estresse',
      'Fortalecimento do diafragma',
      'Melhora da oxigenação'
    ],
    contraindications: [
      'Dispneia severa não controlada',
      'Pneumotórax recente',
      'Confusão ou incapacidade de seguir instruções',
      'Dor torácica de origem cardíaca'
    ],
    variations: [
      { type: 'easier', description: 'Respirações mais curtas, menor duração' },
      { type: 'harder', description: 'Adicione resistência com peso leve sobre abdômen' }
    ],
    videoUrl: 'https://example.com/diaphragmatic-breathing',
    imageUrl: '/images/exercises/diaphragmatic-breathing.jpg',
    tags: ['respiração', 'diafragma', 'relaxamento', 'pulmonar', 'bem-estar']
  },
  // Adicionando mais 10 exercícios esportivos para completar os 20
  {
    id: 'ex-sport-011',
    name: 'Lunge com Rotação de Tronco',
    description: 'Exercício funcional combinando força de MMII com mobilidade torácica.',
    specialty: 'esportiva',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Oblíquos', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Medicine ball', 'Corpo livre'],
    duration: 180,
    instructions: [
      'Posicione-se em pé com pés unidos',
      'Segure medicine ball ou peso na frente do peito',
      'Dê passo à frente entrando em lunge',
      'Simultaneamente, gire tronco em direção à perna da frente',
      'Retorne ao centro e à posição inicial',
      'Alterne pernas'
    ],
    benefits: [
      'Integração de movimento multiplanar',
      'Fortalecimento funcional',
      'Melhora da mobilidade torácica',
      'Treino de padrões esportivos'
    ],
    contraindications: [
      'Instabilidade de joelho',
      'Hérnia de disco com dor à rotação',
      'Déficit de equilíbrio severo',
      'Lesões agudas de MMII'
    ],
    variations: [
      { type: 'easier', description: 'Lunge estático com rotação, sem peso' },
      { type: 'harder', description: 'Lunge reverso com rotação, maior peso, superfície instável' }
    ],
    videoUrl: 'https://example.com/lunge-rotation',
    imageUrl: '/images/exercises/ex-sport-011.svg',
    tags: ['lunge', 'rotação', 'funcional', 'multiplanar', 'core']
  },
  {
    id: 'ex-sport-012',
    name: 'Dead Bug',
    description: 'Exercício de estabilização de core com dissociação de membros.',
    specialty: 'esportiva',
    targetMuscles: ['Reto abdominal', 'Transverso', 'Multífidos', 'Oblíquos'],
    difficulty: 'intermediate',
    equipment: ['Colchonete'],
    duration: 180,
    instructions: [
      'Deite-se em decúbito dorsal',
      'Eleve pernas com joelhos a 90° e braços estendidos para cima',
      'Mantenha lombar pressionada contra o solo',
      'Estenda um braço atrás da cabeça e perna oposta para frente',
      'Retorne e alterne lados',
      'Mantenha lombar estável durante todo movimento'
    ],
    benefits: [
      'Estabilização do core',
      'Treino de anti-extensão lombar',
      'Coordenação cruzada',
      'Prevenção de lesões lombares'
    ],
    contraindications: [
      'Hérnia de disco lombar com compressão',
      'Diastase abdominal severa não tratada',
      'Gravidez avançada',
      'Dor lombar aguda'
    ],
    variations: [
      { type: 'easier', description: 'Mova apenas braços ou apenas pernas' },
      { type: 'harder', description: 'Adicione resistência, aumente velocidade ou sustente posição' }
    ],
    videoUrl: 'https://example.com/dead-bug',
    imageUrl: '/images/exercises/ex-sport-012.svg',
    tags: ['core', 'estabilização', 'anti-extensão', 'coordenação']
  },
  {
    id: 'ex-sport-013',
    name: 'Skater Jumps (Saltos Laterais)',
    description: 'Exercício pliométrico lateral para potência e estabilidade lateral.',
    specialty: 'esportiva',
    targetMuscles: ['Glúteo médio', 'Quadríceps', 'Panturrilha', 'Core'],
    difficulty: 'advanced',
    equipment: ['Espaço aberto'],
    duration: 120,
    instructions: [
      'Inicie em pé com leve flexão de joelhos',
      'Salte lateralmente aterrissando em uma perna',
      'Balanceie perna livre atrás da perna de apoio',
      'Estabilize antes de saltar para o outro lado',
      'Mantenha controle e equilíbrio em cada aterrissagem',
      'Execute movimento de forma contínua mas controlada'
    ],
    benefits: [
      'Desenvolvimento de potência lateral',
      'Fortalecimento de abdutores',
      'Treino de aterrissagem unilateral',
      'Melhora do controle neuromuscular'
    ],
    contraindications: [
      'Instabilidade de tornozelo ou joelho',
      'Lesões de ligamento cruzado',
      'Tendinite patelar',
      'Problemas de equilíbrio significativos'
    ],
    variations: [
      { type: 'easier', description: 'Step lateral sem salto ou saltos menores' },
      { type: 'harder', description: 'Saltos mais amplos, mais rápidos ou sobre obstáculos' }
    ],
    videoUrl: 'https://example.com/skater-jumps',
    imageUrl: '/images/exercises/ex-sport-013.svg',
    tags: ['pliometria', 'lateral', 'potência', 'unilateral', 'salto']
  },
  {
    id: 'ex-sport-014',
    name: 'Turkish Get-Up',
    description: 'Exercício complexo de corpo inteiro para força, estabilidade e mobilidade.',
    specialty: 'esportiva',
    targetMuscles: ['Corpo inteiro', 'Core', 'Ombro', 'Quadril'],
    difficulty: 'advanced',
    equipment: ['Kettlebell', 'Halter'],
    duration: 300,
    instructions: [
      'Deite-se com kettlebell estendida acima do ombro',
      'Siga sequência: rolar para cotovelo, sentar, ponte, joelho, ficar em pé',
      'Mantenha olhos no kettlebell durante todo movimento',
      'Inverta sequência para retornar ao solo',
      'Execute cada fase de forma controlada',
      'Complete repetições antes de trocar de lado'
    ],
    benefits: [
      'Desenvolvimento de força integrada',
      'Melhora da estabilidade de ombro',
      'Treino de padrões motores complexos',
      'Aumento da consciência corporal'
    ],
    contraindications: [
      'Instabilidade de ombro',
      'Lesões agudas de qualquer articulação envolvida',
      'Dificuldade com movimentos complexos',
      'Limitação importante de mobilidade'
    ],
    variations: [
      { type: 'easier', description: 'Execute sem peso ou apenas parte do movimento' },
      { type: 'harder', description: 'Aumente carga ou velocidade' }
    ],
    videoUrl: 'https://example.com/turkish-getup',
    imageUrl: '/images/exercises/ex-sport-014.svg',
    tags: ['kettlebell', 'complexo', 'corpo inteiro', 'funcional', 'força']
  },
  {
    id: 'ex-sport-015',
    name: 'Prancha com Toque no Ombro',
    description: 'Variação de prancha com desafio anti-rotacional.',
    specialty: 'esportiva',
    targetMuscles: ['Core', 'Reto abdominal', 'Oblíquos', 'Serrátil anterior'],
    difficulty: 'intermediate',
    equipment: ['Colchonete'],
    duration: 180,
    instructions: [
      'Posicione-se em prancha alta (apoio nas mãos)',
      'Mantenha corpo em linha reta',
      'Eleve uma mão e toque ombro oposto',
      'Retorne mão ao solo',
      'Alterne lados mantendo quadris estáveis',
      'Evite rotação do tronco e quadril'
    ],
    benefits: [
      'Estabilização anti-rotacional do core',
      'Fortalecimento de serrátil anterior',
      'Treino unilateral de apoio',
      'Melhora do controle escapular'
    ],
    contraindications: [
      'Lesões de punho',
      'Lesões agudas de ombro',
      'Lombalgia que piora em extensão',
      'Síndrome do túnel do carpo'
    ],
    variations: [
      { type: 'easier', description: 'Prancha sobre joelhos ou movimentos mais lentos' },
      { type: 'harder', description: 'Pés elevados, adicionar peso ou aumentar velocidade' }
    ],
    videoUrl: 'https://example.com/plank-shoulder-tap',
    imageUrl: '/images/exercises/ex-sport-015.svg',
    tags: ['prancha', 'core', 'anti-rotação', 'estabilidade', 'ombro']
  },
  {
    id: 'ex-sport-016',
    name: 'Pallof Press',
    description: 'Exercício de anti-rotação do core com resistência lateral.',
    specialty: 'esportiva',
    targetMuscles: ['Oblíquos', 'Transverso do abdômen', 'Multífidos'],
    difficulty: 'intermediate',
    equipment: ['Faixa elástica', 'Cabo de polia'],
    duration: 180,
    instructions: [
      'Fixe faixa elástica a altura do peito',
      'Posicione-se lateralmente à fixação',
      'Segure faixa com ambas as mãos junto ao peito',
      'Estenda braços para frente resistindo à rotação',
      'Mantenha corpo estável sem girar',
      'Retorne e repita'
    ],
    benefits: [
      'Fortalecimento anti-rotacional específico',
      'Proteção da coluna',
      'Transferência para movimentos esportivos',
      'Melhora da estabilidade do core'
    ],
    contraindications: [
      'Lesões agudas de ombro',
      'Hérnia de disco com dor',
      'Instabilidade lombar severa',
      'Diastase abdominal não tratada'
    ],
    variations: [
      { type: 'easier', description: 'Menor resistência, pés mais afastados' },
      { type: 'harder', description: 'Maior resistência, base mais estreita, realizar ajoelhado' }
    ],
    videoUrl: 'https://example.com/pallof-press',
    imageUrl: '/images/exercises/ex-sport-016.svg',
    tags: ['anti-rotação', 'core', 'estabilidade', 'funcional', 'elástico']
  },
  {
    id: 'ex-sport-017',
    name: 'Copenhagen Plank (Prancha de Copenhague)',
    description: 'Exercício específico para fortalecimento de adutores.',
    specialty: 'esportiva',
    targetMuscles: ['Adutores', 'Core', 'Oblíquos'],
    difficulty: 'advanced',
    equipment: ['Banco', 'Caixa'],
    duration: 120,
    instructions: [
      'Posicione-se em prancha lateral com perna superior sobre banco',
      'Eleve quadris mantendo corpo alinhado',
      'Perna inferior pode estar estendida ou flexionada',
      'Mantenha adutores contraídos',
      'Sustente posição por tempo determinado',
      'Troque de lado'
    ],
    benefits: [
      'Fortalecimento específico de adutores',
      'Prevenção de lesões inguinais',
      'Estabilização lateral',
      'Essencial para esportes com mudança de direção'
    ],
    contraindications: [
      'Pubalgia aguda',
      'Lesões de adutores não cicatrizadas',
      'Dor inguinal severa',
      'Hérnia inguinal'
    ],
    variations: [
      { type: 'easier', description: 'Joelho inferior apoiado, banco mais baixo' },
      { type: 'harder', description: 'Adicione abdução/adução dinâmica da perna inferior' }
    ],
    videoUrl: 'https://example.com/copenhagen-plank',
    imageUrl: '/images/exercises/ex-sport-017.svg',
    tags: ['adutores', 'prevenção', 'prancha', 'lateral', 'pubalgia']
  },
  {
    id: 'ex-sport-018',
    name: 'Swing com Kettlebell',
    description: 'Exercício balístico para potência de cadeia posterior e condicionamento.',
    specialty: 'esportiva',
    targetMuscles: ['Glúteos', 'Isquiotibiais', 'Core', 'Trapézio'],
    difficulty: 'intermediate',
    equipment: ['Kettlebell (8-24kg)'],
    duration: 180,
    instructions: [
      'Posicione-se com pés afastados, kettlebell à frente',
      'Agache e segure kettlebell com ambas as mãos',
      'Execute movimento de dobradiça do quadril',
      'Impulsione kettlebell para frente com extensão explosiva de quadril',
      'Deixe kettlebell subir até altura dos ombros',
      'Controle descida e repita movimento rítmico'
    ],
    benefits: [
      'Desenvolvimento de potência de cadeia posterior',
      'Condicionamento metabólico',
      'Fortalecimento da mecânica de dobradiça do quadril',
      'Transferência para movimentos esportivos'
    ],
    contraindications: [
      'Lombalgia aguda',
      'Hérnia de disco com radiculopatia',
      'Lesões agudas de ombro',
      'Hipertensão não controlada'
    ],
    variations: [
      { type: 'easier', description: 'Kettlebell mais leve, menor amplitude' },
      { type: 'harder', description: 'Kettlebell mais pesada, swing a uma mão, swing overhead' }
    ],
    videoUrl: 'https://example.com/kettlebell-swing',
    imageUrl: '/images/exercises/ex-sport-018.svg',
    tags: ['kettlebell', 'potência', 'cadeia posterior', 'balístico', 'condicionamento']
  },
  {
    id: 'ex-sport-019',
    name: 'Tiros Curtos de Velocidade (Sprint Starts)',
    description: 'Treino de aceleração inicial para desenvolvimento de potência e velocidade.',
    specialty: 'esportiva',
    targetMuscles: ['Glúteos', 'Quadríceps', 'Isquiotibiais', 'Panturrilha'],
    difficulty: 'advanced',
    equipment: ['Espaço aberto', 'Cones/marcadores'],
    duration: 240,
    instructions: [
      'Posicione-se em postura de largada (3 apoios ou 4 apoios)',
      'Execute sprint máximo por 10-20 metros',
      'Enfatize aceleração e primeiros passos',
      'Desacelere gradualmente após marca',
      'Descanse completamente entre repetições (2-3 min)',
      'Execute 6-10 repetições'
    ],
    benefits: [
      'Desenvolvimento de aceleração',
      'Melhora da velocidade inicial',
      'Treino de sistema ATP-CP',
      'Aplicável a múltiplos esportes'
    ],
    contraindications: [
      'Lesões agudas de membros inferiores',
      'Tendinite de Aquiles',
      'Problemas cardiovasculares',
      'Lesão de isquiotibiais recente'
    ],
    variations: [
      { type: 'easier', description: 'Distância menor, aceleração submáxima' },
      { type: 'harder', description: 'Arrancadas resistidas (paraquedas, sled), maior distância' }
    ],
    videoUrl: 'https://example.com/sprint-starts',
    imageUrl: '/images/exercises/ex-sport-019.svg',
    tags: ['sprint', 'velocidade', 'aceleração', 'potência', 'explosivo']
  },
  {
    id: 'ex-sport-020',
    name: 'Rotação Externa de Ombro com Abdução 90°',
    description: 'Fortalecimento específico de manguito rotador em posição funcional.',
    specialty: 'esportiva',
    targetMuscles: ['Infraespinhal', 'Redondo menor', 'Deltóide posterior'],
    difficulty: 'intermediate',
    equipment: ['Halter leve (1-3kg)', 'Faixa elástica'],
    duration: 150,
    instructions: [
      'Posicione-se com ombro abduzido a 90° e cotovelo a 90°',
      'Segure peso leve ou faixa elástica',
      'Execute rotação externa elevando antebraço',
      'Mantenha cotovelo na altura do ombro',
      'Controle retorno à posição inicial',
      'Evite elevação excessiva ou compensação'
    ],
    benefits: [
      'Fortalecimento de rotadores externos em posição funcional',
      'Prevenção de lesões de ombro em esportes overhead',
      'Melhora da estabilidade glenoumeral',
      'Essencial para arremessadores e nadadores'
    ],
    contraindications: [
      'Lesão aguda de manguito rotador',
      'Impacto subacromial severo',
      'Dor significativa em abdução',
      'Instabilidade anterior de ombro'
    ],
    variations: [
      { type: 'easier', description: 'Menor carga, realizar sentado com apoio' },
      { type: 'harder', description: 'Maior carga, adicionar sustentação isométrica' }
    ],
    videoUrl: 'https://example.com/er-90-90',
    imageUrl: '/images/exercises/ex-sport-020.svg',
    tags: ['manguito rotador', 'rotação externa', 'ombro', 'prevenção', 'overhead']
  },
  // Adicionando mais 13 exercícios pós-operatórios para completar os 20
  {
    id: 'ex-postop-008',
    name: 'Deslizamento na Parede (Wall Slide)',
    description: 'Exercício ativo-assistido para ganho de flexão de ombro.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Deltóide', 'Serrátil anterior', 'Trapézio superior'],
    difficulty: 'beginner',
    equipment: ['Parede lisa'],
    duration: 180,
    instructions: [
      'Posicione-se de costas para parede',
      'Apoie cotovelos e antebraços na parede',
      'Deslize braços para cima mantendo contato com parede',
      'Suba até amplitude confortável',
      'Mantenha lombar próxima à parede',
      'Desça controladamente'
    ],
    benefits: [
      'Ganho de ADM de flexão e rotação superior',
      'Ativação do serrátil anterior',
      'Exercício assistido por gravidade',
      'Controle escapular'
    ],
    contraindications: [
      'Dor severa ao movimento',
      'Reparo de manguito muito tenso',
      'Instabilidade de ombro',
      'Capsulite fase álgica'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, usar bola entre costas e parede' },
      { type: 'harder', description: 'Maior amplitude, adicionar leve resistência com theraband' }
    ],
    videoUrl: 'https://example.com/wall-slide',
    imageUrl: '/images/exercises/wall-slide.jpg',
    tags: ['ombro', 'wall slide', 'ADM', 'serrátil', 'escapular']
  },
  {
    id: 'ex-postop-009',
    name: 'Rotação Interna/Externa de Ombro Passiva',
    description: 'Mobilização passiva para ganho de rotações de ombro no pós-operatório precoce.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Manguito rotador', 'Cápsula posterior', 'Cápsula anterior'],
    difficulty: 'beginner',
    equipment: ['Bastão', 'Toalha'],
    duration: 240,
    instructions: [
      'Deite-se com ombro abduzido a 45-90° e cotovelo a 90°',
      'Use bastão ou mão contralateral para assistir',
      'Execute rotação externa empurrando antebraço para fora',
      'Execute rotação interna puxando antebraço para dentro',
      'Mantenha alongamento final por 10-15 segundos',
      'Progrida amplitude gradualmente'
    ],
    benefits: [
      'Ganho de rotações de ombro',
      'Prevenção de rigidez capsular',
      'Mobilização suave e controlada',
      'Essencial pós-cirurgia de manguito rotador'
    ],
    contraindications: [
      'Restrições de ADM por protocolo cirúrgico',
      'Reparo sob tensão',
      'Dor intensa ao movimento',
      'Instabilidade glenoumeral'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, posição mais confortável' },
      { type: 'harder', description: 'Progresso para rotações ativas' }
    ],
    videoUrl: 'https://example.com/shoulder-ir-er-passive',
    imageUrl: '/images/exercises/shoulder-ir-er-passive.jpg',
    tags: ['ombro', 'rotação', 'passivo', 'ADM', 'manguito']
  },
  {
    id: 'ex-postop-010',
    name: 'Deslizamento de Calcanhar (Heel Slide)',
    description: 'Exercício para ganho de flexão de joelho no pós-operatório.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Isquiotibiais', 'Cápsula posterior do joelho'],
    difficulty: 'beginner',
    equipment: ['Superfície lisa', 'Toalha/plástico', 'Faixa elástica'],
    duration: 180,
    instructions: [
      'Deite-se com perna estendida',
      'Coloque toalha ou plástico sob o calcanhar',
      'Deslize calcanhar em direção aos glúteos',
      'Flexione joelho o máximo possível sem dor excessiva',
      'Pode usar faixa elástica ou mão para assistir',
      'Mantenha posição máxima por 5 segundos e retorne'
    ],
    benefits: [
      'Ganho progressivo de flexão de joelho',
      'Exercício de baixa carga',
      'Pode ser realizado na cama',
      'Prevenção de rigidez pós-operatória'
    ],
    contraindications: [
      'Ordem médica de limitação de flexão',
      'Derrame articular significativo',
      'Dor intensa durante movimento',
      'Complicações pós-cirúrgicas'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, mais assistência' },
      { type: 'harder', description: 'Sem assistência, adicione resistência leve' }
    ],
    videoUrl: 'https://example.com/heel-slide',
    imageUrl: '/images/exercises/heel-slide.jpg',
    tags: ['joelho', 'flexão', 'ADM', 'pós-op', 'deslizamento']
  },
  {
    id: 'ex-postop-011',
    name: 'Mini Squat (Agachamento Parcial)',
    description: 'Agachamento de pequena amplitude para fortalecimento funcional pós-operatório.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    difficulty: 'intermediate',
    equipment: ['Parede (opcional)', 'Bola suíça (opcional)'],
    duration: 180,
    instructions: [
      'Posicione-se em pé com pés afastados na largura dos quadris',
      'Mantenha postura ereta e core ativado',
      'Desça apenas 30-45 graus de flexão de joelho',
      'Mantenha joelhos alinhados com pés',
      'Retorne à posição inicial contraindo glúteos',
      'Execute movimento lento e controlado'
    ],
    benefits: [
      'Fortalecimento funcional de MMII',
      'Progressão segura de carga',
      'Treino de padrão de movimento',
      'Preparação para agachamento completo'
    ],
    contraindications: [
      'Fase muito precoce pós-operatória',
      'Dor patelofemoral significativa',
      'Instabilidade de joelho não controlada',
      'Déficit de controle motor importante'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, apoio em superfície estável' },
      { type: 'harder', description: 'Maior amplitude (até 60°), unilateral ou adicione peso' }
    ],
    videoUrl: 'https://example.com/mini-squat',
    imageUrl: '/images/exercises/mini-squat.jpg',
    tags: ['agachamento', 'funcional', 'joelho', 'fortalecimento', 'MMII']
  },
  {
    id: 'ex-postop-012',
    name: 'Step Up Baixo',
    description: 'Subida de degrau baixo para fortalecimento e treino funcional.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilha'],
    difficulty: 'intermediate',
    equipment: ['Step baixo (10-15cm)', 'Apoio lateral'],
    duration: 180,
    instructions: [
      'Posicione-se de frente para step baixo',
      'Coloque pé operado sobre o step',
      'Empurre com perna de cima para subir',
      'Estenda completamente quadril e joelho no topo',
      'Desça controladamente',
      'Evite impulso excessivo da perna de baixo'
    ],
    benefits: [
      'Fortalecimento funcional',
      'Treino de atividade de vida diária',
      'Progressão controlada de carga',
      'Melhora da confiança funcional'
    ],
    contraindications: [
      'Instabilidade significativa',
      'Fase muito precoce pós-operatória',
      'Dor intensa ao subir degrau',
      'Déficit de força importante'
    ],
    variations: [
      { type: 'easier', description: 'Step mais baixo, mais apoio lateral' },
      { type: 'harder', description: 'Step mais alto, sem apoio, adicione peso' }
    ],
    videoUrl: 'https://example.com/step-up',
    imageUrl: '/images/exercises/step-up.jpg',
    tags: ['step up', 'funcional', 'degrau', 'MMII', 'AVD']
  },
  {
    id: 'ex-postop-013',
    name: 'Abdução de Ombro Ativa-Assistida em Decúbito Lateral',
    description: 'Ganho de abdução de ombro em posição facilitada por gravidade.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Deltóide médio', 'Supraespinhal', 'Trapézio superior'],
    difficulty: 'beginner',
    equipment: ['Maca', 'Travesseiro', 'Bastão opcional'],
    duration: 180,
    instructions: [
      'Deite-se sobre o lado não operado',
      'Braço operado apoiado sobre corpo ou travesseiro',
      'Use mão contralateral para assistir se necessário',
      'Eleve braço lateralmente (abdução)',
      'Suba até amplitude tolerável sem dor',
      'Mantenha 3-5 segundos e desça controladamente'
    ],
    benefits: [
      'Ganho de abdução com gravidade reduzida',
      'Progressão para abdução ativa',
      'Ativação gradual do deltóide',
      'Seguro para pós-operatório de manguito'
    ],
    contraindications: [
      'Restrições de abdução por protocolo',
      'Reparo do supraespinhal sob tensão',
      'Dor intensa durante abdução',
      'Fase muito precoce pós-cirúrgica'
    ],
    variations: [
      { type: 'easier', description: 'Maior assistência, menor amplitude' },
      { type: 'harder', description: 'Progressão para abdução ativa em pé' }
    ],
    videoUrl: 'https://example.com/sidelying-abduction',
    imageUrl: '/images/exercises/sidelying-abduction.jpg',
    tags: ['ombro', 'abdução', 'decúbito lateral', 'assistido', 'deltóide']
  },
  {
    id: 'ex-postop-014',
    name: 'Alongamento de Isquiotibiais em Decúbito',
    description: 'Alongamento suave de cadeia posterior no pós-operatório.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Isquiotibiais', 'Gastrocnêmio'],
    difficulty: 'beginner',
    equipment: ['Faixa elástica', 'Toalha', 'Maca'],
    duration: 240,
    instructions: [
      'Deite-se em decúbito dorsal',
      'Coloque faixa sob o pé da perna a ser alongada',
      'Mantenha joelho estendido',
      'Puxe perna em direção ao peito',
      'Mantenha alongamento por 20-30 segundos',
      'Respire normalmente e relaxe'
    ],
    benefits: [
      'Manutenção da flexibilidade',
      'Prevenção de rigidez muscular',
      'Facilitação da ADM de quadril',
      'Redução de tensão muscular'
    ],
    contraindications: [
      'Lesão aguda de isquiotibiais',
      'Ciatalgia intensa',
      'Hérnia de disco lombar aguda',
      'Dor intensa durante alongamento'
    ],
    variations: [
      { type: 'easier', description: 'Joelho levemente flexionado, menor amplitude' },
      { type: 'harder', description: 'Adicione dorsiflexão do tornozelo' }
    ],
    videoUrl: 'https://example.com/hamstring-stretch-supine',
    imageUrl: '/images/exercises/hamstring-stretch-supine.jpg',
    tags: ['alongamento', 'isquiotibiais', 'decúbito', 'flexibilidade', 'cadeia posterior']
  },
  {
    id: 'ex-postop-015',
    name: 'Bomba Muscular de Tornozelo',
    description: 'Exercício circulatório para prevenção de edema e trombose.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Gastrocnêmio', 'Sóleo', 'Tibial anterior'],
    difficulty: 'beginner',
    equipment: ['Nenhum'],
    duration: 300,
    instructions: [
      'Deite-se ou sente-se confortavelmente',
      'Execute flexão plantar (aponte dedos para baixo)',
      'Execute dorsiflexão (puxe dedos para cima)',
      'Realize movimentos rítmicos e contínuos',
      'Execute 20-30 repetições',
      'Repita múltiplas vezes ao dia'
    ],
    benefits: [
      'Prevenção de trombose venosa profunda',
      'Redução de edema',
      'Manutenção da circulação',
      'Prevenção de rigidez de tornozelo'
    ],
    contraindications: [
      'Fratura não consolidada de tornozelo/pé',
      'Ruptura de tendão de Aquiles',
      'Trombose venosa profunda ativa',
      'Dor intensa ao movimento'
    ],
    variations: [
      { type: 'easier', description: 'Movimentos mais lentos e suaves' },
      { type: 'harder', description: 'Adicione círculos de tornozelo ou resistência leve' }
    ],
    videoUrl: 'https://example.com/ankle-pumps',
    imageUrl: '/images/exercises/ankle-pumps.jpg',
    tags: ['tornozelo', 'circulação', 'edema', 'prevenção', 'TVP']
  },
  {
    id: 'ex-postop-016',
    name: 'Fortalecimento de Abdutores de Quadril em Decúbito',
    description: 'Exercício para fortalecimento de glúteo médio no pós-operatório.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Glúteo médio', 'Glúteo mínimo', 'Tensor da fáscia lata'],
    difficulty: 'beginner',
    equipment: ['Colchonete', 'Faixa elástica opcional'],
    duration: 180,
    instructions: [
      'Deite-se em decúbito lateral sobre o lado não operado',
      'Mantenha corpo alinhado',
      'Eleve perna superior lateralmente (abdução)',
      'Mantenha joelho estendido e pé neutro',
      'Controle descida sem deixar perna cair',
      'Evite rotação do tronco'
    ],
    benefits: [
      'Fortalecimento de abdutores de quadril',
      'Melhora da estabilidade pélvica',
      'Preparação para marcha',
      'Prevenção de marcha de Trendelenburg'
    ],
    contraindications: [
      'Bursite trocantérica aguda',
      'Lesão aguda de glúteo médio',
      'Dor intensa à abdução',
      'Fase muito precoce pós-artroplastia de quadril'
    ],
    variations: [
      { type: 'easier', description: 'Menor amplitude, sem resistência' },
      { type: 'harder', description: 'Adicione faixa elástica ou caneleira' }
    ],
    videoUrl: 'https://example.com/hip-abduction-sidelying',
    imageUrl: '/images/exercises/hip-abduction-sidelying.jpg',
    tags: ['quadril', 'abdução', 'glúteo médio', 'decúbito', 'estabilidade']
  },
  {
    id: 'ex-postop-017',
    name: 'Extensão de Joelho com Peso',
    description: 'Fortalecimento progressivo de quadríceps com carga controlada.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Vasto medial oblíquo', 'Reto femoral'],
    difficulty: 'intermediate',
    equipment: ['Cadeira', 'Caneleira (0.5-5kg)'],
    duration: 180,
    instructions: [
      'Sente-se em cadeira com caneleira no tornozelo',
      'Estenda joelho até posição horizontal',
      'Contraia quadríceps no final da extensão',
      'Mantenha 2-3 segundos no topo',
      'Desça controladamente',
      'Progrida peso gradualmente'
    ],
    benefits: [
      'Fortalecimento progressivo de quadríceps',
      'Carga controlada e mensurável',
      'Preparação para atividades funcionais',
      'Melhora da extensão terminal'
    ],
    contraindications: [
      'Condromalácia patelar severa',
      'Dor femoropatelar intensa',
      'Fase muito precoce pós-LCA',
      'Derrame articular significativo'
    ],
    variations: [
      { type: 'easier', description: 'Sem peso ou peso mínimo' },
      { type: 'harder', description: 'Maior peso, adicionar pausa isométrica' }
    ],
    videoUrl: 'https://example.com/knee-extension-weight',
    imageUrl: '/images/exercises/knee-extension-weight.jpg',
    tags: ['quadríceps', 'extensão', 'peso', 'caneleira', 'progressivo']
  },
  {
    id: 'ex-postop-018',
    name: 'Caminhada de Marcha Ré',
    description: 'Marcha reversa para fortalecimento e coordenação.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Quadríceps', 'Glúteos', 'Gastrocnêmio'],
    difficulty: 'intermediate',
    equipment: ['Barras paralelas', 'Corredor livre'],
    duration: 240,
    instructions: [
      'Posicione-se em corredor seguro ou barras paralelas',
      'Caminhe para trás com passos controlados',
      'Mantenha postura ereta',
      'Sinta solo com pé antes de transferir peso',
      'Use visão periférica ou espelho',
      'Progrida distância gradualmente'
    ],
    benefits: [
      'Fortalecimento de quadríceps com baixo estresse patelar',
      'Melhora da propriocepção',
      'Treino de coordenação',
      'Variação de padrão de marcha'
    ],
    contraindications: [
      'Déficit visual significativo',
      'Instabilidade postural severa',
      'Vertigem ou tontura',
      'Risco de queda elevado'
    ],
    variations: [
      { type: 'easier', description: 'Maior apoio lateral, distância menor' },
      { type: 'harder', description: 'Sem apoio, maior velocidade, inclinação' }
    ],
    videoUrl: 'https://example.com/backward-walking',
    imageUrl: '/images/exercises/backward-walking.jpg',
    tags: ['marcha', 'reversa', 'coordenação', 'quadríceps', 'propriocepção']
  },
  {
    id: 'ex-postop-019',
    name: 'Flexão de Joelho em Prono',
    description: 'Fortalecimento de isquiotibiais em posição segura.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Isquiotibiais', 'Gastrocnêmio'],
    difficulty: 'beginner',
    equipment: ['Maca', 'Caneleira opcional'],
    duration: 180,
    instructions: [
      'Deite-se em decúbito ventral (prono)',
      'Mantenha quadris apoiados na maca',
      'Flexione joelho levando calcanhar em direção aos glúteos',
      'Contraia isquiotibiais no final do movimento',
      'Desça controladamente',
      'Evite elevar quadril'
    ],
    benefits: [
      'Fortalecimento isolado de isquiotibiais',
      'Baixa carga na articulação',
      'Progressão controlada',
      'Prepara para atividades funcionais'
    ],
    contraindications: [
      'Lesão aguda de isquiotibiais',
      'Tendinite proximal de isquiotibiais',
      'Dificuldade em posição prona',
      'Dor lombar em extensão'
    ],
    variations: [
      { type: 'easier', description: 'Sem peso, menor amplitude' },
      { type: 'harder', description: 'Adicione caneleira, aumente velocidade ou sustente no topo' }
    ],
    videoUrl: 'https://example.com/prone-knee-flexion',
    imageUrl: '/images/exercises/prone-knee-flexion.jpg',
    tags: ['isquiotibiais', 'flexão', 'prono', 'joelho', 'isolado']
  },
  {
    id: 'ex-postop-020',
    name: 'Rotação de Escápula (Scapular Clock)',
    description: 'Exercício de controle escapular para estabilização de ombro.',
    specialty: 'pos-operatoria',
    targetMuscles: ['Serrátil anterior', 'Trapézio', 'Romboides'],
    difficulty: 'beginner',
    equipment: ['Parede', 'Bola'],
    duration: 180,
    instructions: [
      'Posicione-se de costas para parede com braços elevados',
      'Realize movimentos circulares com escápulas',
      'Elevação (12h), retração (3h), depressão (6h), protração (9h)',
      'Mantenha cada posição 3-5 segundos',
      'Execute movimento lento e controlado',
      'Mantenha braços na parede durante exercício'
    ],
    benefits: [
      'Controle neuromuscular escapular',
      'Preparação para movimentos de ombro',
      'Melhora da estabilidade escapulotorácica',
      'Essencial pós-cirurgia de ombro'
    ],
    contraindications: [
      'Dor severa ao movimento escapular',
      'Fase muito precoce pós-operatória',
      'Fratura de escápula ou clavícula',
      'Lesões neurológicas que afetem escápula'
    ],
    variations: [
      { type: 'easier', description: 'Movimentos menores, sem parede' },
      { type: 'harder', description: 'Adicione bola entre costas e parede, maior amplitude' }
    ],
    videoUrl: 'https://example.com/scapular-clock',
    imageUrl: '/images/exercises/scapular-clock.jpg',
    tags: ['escapular', 'controle', 'estabilidade', 'ombro', 'serrátil']
  }
];

