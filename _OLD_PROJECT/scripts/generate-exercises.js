/**
 * Biblioteca de Exercícios para Fisioterapia
 * Exercícios organizados por especialidade
 */
export const EXERCISES_LIBRARY = [
    // ===== EXERCÍCIOS ESPORTIVOS =====
    {
        id: 'ex-esp-001',
        name: 'Agachamento Unipodal',
        alias: ['Single Leg Squat', 'Agachamento em Uma Perna'],
        specialty: ['esportiva', 'pos-operatoria', 'ortopedica'],
        category: 'fortalecimento',
        bodyParts: ['quadril', 'joelho', 'tornozelo', 'core'],
        description: 'Exercício funcional de fortalecimento que trabalha estabilidade e controle neuromuscular do membro inferior.',
        objectives: [
            'Fortalecer quadríceps, glúteos e estabilizadores do quadril',
            'Melhorar controle neuromuscular',
            'Desenvolver estabilidade dinâmica',
            'Prevenir lesões de joelho'
        ],
        instructions: [
            { order: 1, text: 'Fique em pé em uma perna, com a outra perna ligeiramente flexionada para trás ou à frente' },
            { order: 2, text: 'Mantenha o tronco ereto e os braços estendidos à frente para equilíbrio' },
            { order: 3, text: 'Flexione lentamente o joelho de apoio, descendo o quadril como se fosse sentar' },
            { order: 4, text: 'Mantenha o joelho alinhado com o segundo dedo do pé (evite valgo)' },
            { order: 5, text: 'Desça até 60-90° de flexão de joelho ou conforme tolerado' },
            { order: 6, text: 'Retorne à posição inicial de forma controlada' },
            { order: 7, text: 'Repita o movimento pelo número prescrito de repetições' }
        ],
        difficulty: 'avancado',
        duration: '10-15 repetições',
        sets: 3,
        repetitions: '10-15 cada perna',
        restPeriod: '60-90 segundos entre séries',
        equipment: ['nenhum', 'espelho para feedback visual'],
        variations: [
            {
                id: 'var-1',
                name: 'Agachamento Unipodal com Apoio',
                description: 'Segurar em barra ou parede para assistência',
                difficultyModifier: 'easier',
                modifications: ['Usar apoio leve para equilíbrio', 'Reduzir amplitude de movimento']
            },
            {
                id: 'var-2',
                name: 'Agachamento Unipodal com Superfície Instável',
                description: 'Realizar sobre disco proprioceptivo ou bosu',
                difficultyModifier: 'harder',
                modifications: ['Adicionar superfície instável', 'Aumentar desafio proprioceptivo']
            },
            {
                id: 'var-3',
                name: 'Agachamento Unipodal com Sobrecarga',
                description: 'Segurar peso ou kettlebell',
                difficultyModifier: 'harder',
                modifications: ['Adicionar carga externa', 'Progredir apenas com técnica perfeita']
            }
        ],
        contraindications: [
            'Lesão aguda de joelho não reabilitada',
            'Instabilidade articular significativa',
            'Dor aguda no joelho durante execução'
        ],
        precautions: [
            'Garantir boa estabilidade unipodal antes de progredir',
            'Monitorar alinhamento do joelho rigorosamente',
            'Evitar em fases precoces de reabilitação de LCA'
        ],
        benefits: [
            'Fortalecimento funcional do membro inferior',
            'Melhora de equilíbrio e propriocepção',
            'Prevenção de lesões de joelho',
            'Preparação para atividades esportivas'
        ],
        commonMistakes: [
            'Valgo dinâmico de joelho (joelho cai para dentro)',
            'Inclinação excessiva do tronco à frente',
            'Perda de controle do quadril contralateral',
            'Rotação do tronco',
            'Velocidade excessiva de execução'
        ],
        images: [],
        videos: [],
        tags: ['joelho', 'quadril', 'equilíbrio', 'funcional', 'prevenção'],
        musclesWorked: ['Quadríceps', 'Glúteo Máximo', 'Glúteo Médio', 'Isquiotibiais', 'Core'],
        movementPattern: 'Agachamento unilateral',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'ex-esp-002',
        name: 'Nordic Hamstring',
        alias: ['Nordic Curl', 'Exercício Nórdico de Isquiotibiais'],
        specialty: ['esportiva'],
        category: 'fortalecimento',
        bodyParts: ['joelho'],
        description: 'Exercício excêntrico de alta intensidade para fortalecimento dos isquiotibiais, altamente eficaz na prevenção de lesões.',
        objectives: [
            'Fortalecer isquiotibiais de forma excêntrica',
            'Prevenir lesões de isquiotibiais',
            'Melhorar capacidade de desaceleração',
            'Aumentar torque excêntrico'
        ],
        instructions: [
            { order: 1, text: 'Ajoelhe-se no solo com um parceiro ou fixação segurando seus tornozelos' },
            { order: 2, text: 'Mantenha o corpo reto dos joelhos aos ombros (evite flexão de quadril)' },
            { order: 3, text: 'Cruze os braços sobre o peito ou mantenha-os ao lado do corpo' },
            { order: 4, text: 'Lentamente, deixe seu corpo cair para frente de forma controlada' },
            { order: 5, text: 'Resista à queda usando a força dos isquiotibiais' },
            { order: 6, text: 'Quando não conseguir mais resistir, apoie as mãos no chão suavemente' },
            { order: 7, text: 'Use os braços para impulsionar de volta à posição inicial' },
            { order: 8, text: 'Use os isquiotibiais para completar o movimento de volta' }
        ],
        difficulty: 'avancado',
        duration: '6-12 repetições',
        sets: 3,
        repetitions: '6-12 repetições',
        restPeriod: '2-3 minutos entre séries',
        equipment: ['colchonete', 'parceiro ou fixação de tornozelos'],
        variations: [
            {
                id: 'var-1',
                name: 'Nordic Assistido com Elástico',
                description: 'Usar elástico fixado à frente para assistência',
                difficultyModifier: 'easier',
                modifications: ['Banda elástica para assistência', 'Reduzir amplitude inicialmente']
            },
            {
                id: 'var-2',
                name: 'Nordic em Rampa Inclinada',
                description: 'Realizar com tronco apoiado em rampa para reduzir dificuldade',
                difficultyModifier: 'easier',
                modifications: ['Usar rampa ou banco inclinado', 'Progressão gradual para plano']
            },
            {
                id: 'var-3',
                name: 'Nordic com Pausa Excêntrica',
                description: 'Adicionar pausas durante a fase excêntrica',
                difficultyModifier: 'harder',
                modifications: ['Pausas de 2-3 segundos em diferentes ângulos', 'Maior tempo sob tensão']
            }
        ],
        contraindications: [
            'Lesão aguda de isquiotibiais',
            'Tendinopatia proximal dos isquiotibiais não tratada',
            'Dor lombar aguda',
            'Lesão de ligamento cruzado posterior'
        ],
        precautions: [
            'Progressão gradual essencial (começar com assistência)',
            'Esperar dor muscular intensa (DMIT) após sessões iniciais',
            'Não realizar antes de jogos/competições na fase inicial',
            'Aquecimento adequado obrigatório'
        ],
        benefits: [
            'Redução de até 51% no risco de lesão de isquiotibiais',
            'Aumento significativo de força excêntrica',
            'Melhora da relação isquio:quadríceps',
            'Adaptação neural e hipertrofia muscular'
        ],
        commonMistakes: [
            'Flexionar quadril durante o exercício',
            'Cair muito rapidamente (perder controle excêntrico)',
            'Não usar os isquiotibiais para retornar',
            'Amplitude muito grande antes de estar preparado',
            'Frequência excessiva (overtraining)'
        ],
        images: [],
        videos: [],
        tags: ['isquiotibiais', 'excêntrico', 'prevenção', 'performance', 'atletas'],
        musclesWorked: ['Isquiotibiais (Bíceps Femoral, Semitendinoso, Semimembranoso)', 'Glúteo Máximo', 'Gastrocnêmio'],
        movementPattern: 'Extensão de joelho excêntrica',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // ===== EXERCÍCIOS PÓS-OPERATÓRIOS =====
    {
        id: 'ex-pos-001',
        name: 'Deslizamento de Calcanhar',
        alias: ['Heel Slide', 'Mobilização Ativa de Joelho'],
        specialty: ['pos-operatoria', 'ortopedica'],
        category: 'mobilidade',
        bodyParts: ['joelho'],
        description: 'Exercício suave para recuperação de amplitude de movimento de flexão do joelho no pós-operatório.',
        objectives: [
            'Recuperar flexão do joelho',
            'Prevenir rigidez articular',
            'Mobilizar cicatriz cirúrgica',
            'Manter função articular'
        ],
        instructions: [
            { order: 1, text: 'Deite-se de costas com as pernas estendidas' },
            { order: 2, text: 'Deslize lentamente o calcanhar em direção ao glúteo' },
            { order: 3, text: 'Flexione o joelho o máximo possível sem dor excessiva' },
            { order: 4, text: 'Mantenha o calcanhar em contato com a superfície' },
            { order: 5, text: 'Segure por 2-5 segundos no final da amplitude' },
            { order: 6, text: 'Retorne lentamente à posição inicial' },
            { order: 7, text: 'Repita de forma suave e controlada' }
        ],
        difficulty: 'iniciante',
        duration: '10-15 repetições',
        sets: 3,
        repetitions: '10-15 repetições',
        restPeriod: '30-60 segundos',
        equipment: ['colchonete ou maca', 'opcionalmente uma toalha sob o calcanhar para facilitar'],
        variations: [
            {
                id: 'var-1',
                name: 'Deslizamento Assistido com Mãos',
                description: 'Usar as mãos para assistir e puxar suavemente a coxa',
                difficultyModifier: 'easier',
                modifications: ['Assistência manual', 'Maior controle do movimento']
            },
            {
                id: 'var-2',
                name: 'Deslizamento com Toalha',
                description: 'Colocar toalha ou lençol sob o calcanhar para facilitar o deslize',
                difficultyModifier: 'easier',
                modifications: ['Superfície de deslize facilitada', 'Menor atrito']
            },
            {
                id: 'var-3',
                name: 'Deslizamento com Sustentação',
                description: 'Segurar por períodos mais longos no fim da amplitude',
                difficultyModifier: 'harder',
                modifications: ['Sustentação de 5-10 segundos', 'Componente de alongamento']
            }
        ],
        contraindications: [
            'Dor intensa durante o movimento',
            'Derrame articular significativo',
            'Instabilidade articular aguda',
            'Contraindicação médica específica'
        ],
        precautions: [
            'Não forçar além da dor tolerável',
            'Progressão gradual de amplitude',
            'Observar sinais de derrame articular',
            'Comunicar qualquer aumento significativo de dor'
        ],
        benefits: [
            'Recuperação precoce de mobilidade',
            'Prevenção de aderências e rigidez',
            'Exercício seguro para fase aguda',
            'Fácil realização domiciliar'
        ],
        commonMistakes: [
            'Forçar amplitude excessivamente',
            'Movimento muito rápido',
            'Levantar o calcanhar da superfície',
            'Tensionar musculatura desnecessariamente'
        ],
        images: [],
        videos: [],
        tags: ['joelho', 'mobilidade', 'pós-operatório', 'ADM', 'precoce'],
        musclesWorked: ['Isquiotibiais (contração concêntrica leve)', 'Mobilização articular'],
        movementPattern: 'Flexão de joelho ativa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'ex-pos-002',
        name: 'Elevação do Braço com Bastão',
        alias: ['Wand Exercise', 'Elevação Assistida com Bastão'],
        specialty: ['pos-operatoria', 'ortopedica'],
        category: 'mobilidade',
        bodyParts: ['ombro'],
        description: 'Exercício para recuperação de amplitude de movimento de elevação do ombro usando assistência do braço não operado.',
        objectives: [
            'Recuperar elevação do ombro',
            'Mobilizar articulação glenoumeral e escapulotorácica',
            'Prevenir capsulite adesiva',
            'Progressão de mobilidade passiva para ativa-assistida'
        ],
        instructions: [
            { order: 1, text: 'Sente-se ou fique em pé segurando um bastão com ambas as mãos' },
            { order: 2, text: 'Posicione as mãos com largura aproximada dos ombros' },
            { order: 3, text: 'Mantenha os cotovelos estendidos' },
            { order: 4, text: 'Use o braço saudável para empurrar o bastão para cima' },
            { order: 5, text: 'Eleve o bastão acima da cabeça conforme tolerado' },
            { order: 6, text: 'Mantenha por 2-5 segundos na amplitude máxima' },
            { order: 7, text: 'Retorne lentamente à posição inicial' }
        ],
        difficulty: 'iniciante',
        duration: '10-15 repetições',
        sets: 3,
        repetitions: '10-15 repetições',
        restPeriod: '30-60 segundos',
        equipment: ['bastão, cabo de vassoura ou toalha enrolada'],
        variations: [
            {
                id: 'var-1',
                name: 'Elevação Supina com Bastão',
                description: 'Realizar deitado de costas para facilitar o movimento',
                difficultyModifier: 'easier',
                modifications: ['Posição supina', 'Assistência da gravidade']
            },
            {
                id: 'var-2',
                name: 'Elevação em Pé com Sustentação',
                description: 'Segurar por períodos mais longos na amplitude máxima',
                difficultyModifier: 'harder',
                modifications: ['Sustentação prolongada', 'Componente de alongamento']
            },
            {
                id: 'var-3',
                name: 'Rotação Externa com Bastão',
                description: 'Usar bastão para trabalhar rotação externa',
                difficultyModifier: 'harder',
                modifications: ['Movimento de rotação', 'Diferentes planos de movimento']
            }
        ],
        contraindications: [
            'Dor intensa durante movimento',
            'Fase de proteção máxima (primeiras semanas pós-cirurgia)',
            'Instabilidade não controlada',
            'Infecção ativa'
        ],
        precautions: [
            'Respeitar fases de cicatrização',
            'Não forçar amplitude contra dor significativa',
            'Manter controle do braço operado',
            'Evitar movimentos bruscos'
        ],
        benefits: [
            'Recuperação gradual de mobilidade',
            'Controle da assistência facilmente ajustável',
            'Seguro para fases precoces',
            'Fácil execução domiciliar'
        ],
        commonMistakes: [
            'Forçar elevação precocemente',
            'Usar força excessiva do braço saudável',
            'Elevar ombros (enccolhimento)',
            'Compensação com inclinação lateral do tronco'
        ],
        images: [],
        videos: [],
        tags: ['ombro', 'mobilidade', 'pós-operatório', 'assistido', 'ADM'],
        musclesWorked: ['Mobilização articular', 'Ativação suave dos elevadores do ombro'],
        movementPattern: 'Elevação de ombro ativa-assistida',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    // ===== EXERCÍCIOS GERONTOLÓGICOS =====
    {
        id: 'ex-gero-001',
        name: 'Sentar e Levantar de Cadeira',
        alias: ['Sit to Stand', 'Levantar da Cadeira'],
        specialty: ['geriatrica', 'ortopedica'],
        category: 'fortalecimento',
        bodyParts: ['quadril', 'joelho', 'tornozelo'],
        description: 'Exercício funcional fundamental para manutenção de independência, fortalece membros inferiores e treina transferência.',
        objectives: [
            'Fortalecer quadríceps e glúteos',
            'Melhorar capacidade funcional',
            'Prevenir dependência para transferências',
            'Avaliar força dos membros inferiores'
        ],
        instructions: [
            { order: 1, text: 'Sente-se em uma cadeira firme com os pés apoiados no chão' },
            { order: 2, text: 'Posicione os pés na largura dos ombros' },
            { order: 3, text: 'Cruze os braços sobre o peito ou mantenha-os estendidos à frente' },
            { order: 4, text: 'Incline o tronco ligeiramente à frente' },
            { order: 5, text: 'Levante-se usando a força das pernas' },
            { order: 6, text: 'Estenda completamente joelhos e quadris' },
            { order: 7, text: 'Sente-se novamente de forma controlada' },
            { order: 8, text: 'Toque suavemente o assento e repita' }
        ],
        difficulty: 'iniciante',
        duration: '30 segundos (teste) ou 10-15 repetições',
        sets: 3,
        repetitions: '10-15 repetições ou máximo em 30 segundos',
        restPeriod: '60 segundos',
        equipment: ['cadeira firme sem braços'],
        variations: [
            {
                id: 'var-1',
                name: 'Sentar e Levantar com Apoio de Braços',
                description: 'Usar os braços da cadeira para assistência',
                difficultyModifier: 'easier',
                modifications: ['Usar apoio dos braços', 'Cadeira mais alta']
            },
            {
                id: 'var-2',
                name: 'Sentar e Levantar de Cadeira Alta',
                description: 'Usar cadeira mais alta ou com almofada',
                difficultyModifier: 'easier',
                modifications: ['Aumentar altura do assento', 'Menor amplitude de movimento']
            },
            {
                id: 'var-3',
                name: 'Sentar e Levantar com Peso',
                description: 'Segurar peso ou colete com carga',
                difficultyModifier: 'harder',
                modifications: ['Adicionar carga externa', 'Maior resistência']
            },
            {
                id: 'var-4',
                name: 'Sentar e Levantar Unipodal',
                description: 'Realizar com apoio principal em uma perna',
                difficultyModifier: 'harder',
                modifications: ['Apoio assimétrico', 'Maior desafio de força']
            }
        ],
        contraindications: [
            'Instabilidade articular severa de joelho ou quadril',
            'Dor intensa ao realizar o movimento',
            'Período pós-operatório imediato com restrição de carga',
            'Risco alto de queda sem supervisão'
        ],
        precautions: [
            'Supervisão próxima em pacientes de alto risco',
            'Garantir que a cadeira seja firme e segura',
            'Ambiente sem obstáculos',
            'Progressão gradual'
        ],
        benefits: [
            'Melhora da independência funcional',
            'Prevenção de quedas',
            'Fortalecimento funcional',
            'Fácil realização em casa',
            'Teste funcional validado (teste de 30 segundos)'
        ],
        commonMistakes: [
            'Usar impulso excessivo com o tronco',
            'Não estender completamente joelhos e quadris',
            'Deixar-se cair no assento',
            'Posicionamento inadequado dos pés',
            'Velocidade excessiva comprometendo controle'
        ],
        images: [],
        videos: [],
        tags: ['funcional', 'idosos', 'força', 'independência', 'AVD'],
        musclesWorked: ['Quadríceps', 'Glúteo Máximo', 'Isquiotibiais', 'Core'],
        movementPattern: 'Agachamento funcional',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'ex-gero-002',
        name: 'Marcha Tandem',
        alias: ['Tandem Walking', 'Caminhada em Linha'],
        specialty: ['geriatrica', 'neurologica'],
        category: 'equilibrio',
        bodyParts: ['corpo-inteiro'],
        description: 'Exercício de equilíbrio dinâmico onde o idoso caminha colocando um pé diretamente na frente do outro.',
        objectives: [
            'Melhorar equilíbrio dinâmico',
            'Aprimorar controle postural',
            'Desenvolver confiança na marcha',
            'Prevenir quedas'
        ],
        instructions: [
            { order: 1, text: 'Posicione-se próximo a uma parede ou barra para segurança' },
            { order: 2, text: 'Coloque um pé diretamente na frente do outro, tocando calcanhar com dedos' },
            { order: 3, text: 'Olhe para frente (não para os pés)' },
            { order: 4, text: 'Dê um passo colocando o pé traseiro na frente, novamente tocando calcanhar com dedos' },
            { order: 5, text: 'Continue por 3-5 metros ou 10-15 passos' },
            { order: 6, text: 'Mantenha controle e equilíbrio durante toda a caminhada' },
            { order: 7, text: 'Vire e retorne ou caminhe de volta normalmente' }
        ],
        difficulty: 'intermediario',
        duration: '3-5 metros ou 10-15 passos',
        sets: 3,
        repetitions: '3-5 passagens',
        restPeriod: '30-60 segundos',
        equipment: ['espaço para caminhada', 'barra ou parede para segurança'],
        variations: [
            {
                id: 'var-1',
                name: 'Tandem com Apoio Leve',
                description: 'Caminhar ao lado de barra com apoio leve de uma mão',
                difficultyModifier: 'easier',
                modifications: ['Apoio contínuo disponível', 'Maior segurança']
            },
            {
                id: 'var-2',
                name: 'Semi-Tandem',
                description: 'Pés parcialmente alinhados (não totalmente tandem)',
                difficultyModifier: 'easier',
                modifications: ['Base de suporte levemente maior', 'Progressão para tandem completo']
            },
            {
                id: 'var-3',
                name: 'Tandem com Obstáculos',
                description: 'Adicionar pequenos obstáculos para ultrapassar',
                difficultyModifier: 'harder',
                modifications: ['Desafio adicional', 'Maior complexidade']
            },
            {
                id: 'var-4',
                name: 'Tandem com Olhos Fechados',
                description: 'Realizar com olhos fechados (apenas com supervisão)',
                difficultyModifier: 'harder',
                modifications: ['Eliminação de input visual', 'Apenas para avançados']
            }
        ],
        contraindications: [
            'Vertigem severa não controlada',
            'Déficit visual significativo',
            'Risco muito alto de queda sem supervisão adequada',
            'Déficits cognitivos que impeçam compreensão'
        ],
        precautions: [
            'Supervisão próxima essencial',
            'Garantir apoio disponível',
            'Ambiente seguro sem obstáculos',
            'Progredir gradualmente'
        ],
        benefits: [
            'Melhora significativa de equilíbrio',
            'Redução do risco de quedas',
            'Aumento da confiança na marcha',
            'Desafio progressivo apropriado'
        ],
        commonMistakes: [
            'Olhar para os pés (perder referência visual frontal)',
            'Caminhar muito rápido perdendo controle',
            'Base muito larga (não tandem real)',
            'Tensão excessiva comprometendo fluidez'
        ],
        images: [],
        videos: [],
        tags: ['equilíbrio', 'marcha', 'idosos', 'prevenção quedas', 'dinâmico'],
        musclesWorked: ['Estabilizadores de tornozelo', 'Core', 'Glúteo Médio'],
        movementPattern: 'Marcha com base reduzida',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'ex-gero-003',
        name: 'Elevação de Panturrilha',
        alias: ['Calf Raise', 'Elevação dos Calcanhares'],
        specialty: ['geriatrica', 'ortopedica', 'esportiva'],
        category: 'fortalecimento',
        bodyParts: ['tornozelo'],
        description: 'Exercício para fortalecimento da musculatura da panturrilha, importante para marcha e prevenção de quedas.',
        objectives: [
            'Fortalecer tríceps sural (gastrocnêmio e sóleo)',
            'Melhorar propulsão na marcha',
            'Prevenir quedas melhorando força de tornozelo',
            'Melhorar circulação dos membros inferiores'
        ],
        instructions: [
            { order: 1, text: 'Fique em pé próximo a uma parede ou barra para apoio' },
            { order: 2, text: 'Posicione os pés na largura dos ombros' },
            { order: 3, text: 'Apoie levemente as mãos para equilíbrio' },
            { order: 4, text: 'Eleve os calcanhares subindo na ponta dos pés' },
            { order: 5, text: 'Suba o máximo possível mantendo o controle' },
            { order: 6, text: 'Segure por 1-2 segundos no topo' },
            { order: 7, text: 'Abaixe lentamente até os calcanhares tocarem o chão' },
            { order: 8, text: 'Repita de forma controlada' }
        ],
        difficulty: 'iniciante',
        duration: '10-20 repetições',
        sets: 3,
        repetitions: '10-20 repetições',
        restPeriod: '30-60 segundos',
        equipment: ['parede ou barra para apoio', 'opcionalmente step ou degrau'],
        variations: [
            {
                id: 'var-1',
                name: 'Elevação Sentado (Sóleo)',
                description: 'Realizar sentado com peso sobre os joelhos para focar no sóleo',
                difficultyModifier: 'easier',
                modifications: ['Posição sentada', 'Isolamento do sóleo']
            },
            {
                id: 'var-2',
                name: 'Elevação Unipodal',
                description: 'Realizar com apoio em apenas uma perna',
                difficultyModifier: 'harder',
                modifications: ['Suporte unilateral', 'Dobrar força necessária']
            },
            {
                id: 'var-3',
                name: 'Elevação em Step',
                description: 'Realizar com antepé em degrau para maior amplitude',
                difficultyModifier: 'harder',
                modifications: ['Maior amplitude de movimento', 'Alongamento adicional']
            },
            {
                id: 'var-4',
                name: 'Elevação com Peso',
                description: 'Segurar peso ou usar colete com carga',
                difficultyModifier: 'harder',
                modifications: ['Adicionar carga externa', 'Progressão de resistência']
            }
        ],
        contraindications: [
            'Lesão aguda de tornozelo',
            'Tendinopatia aguda de Aquiles',
            'Dor intensa na panturrilha',
            'Trombose venosa profunda'
        ],
        precautions: [
            'Apoio adequado para equilíbrio',
            'Progressão gradual de dificuldade',
            'Atenção a cãibras',
            'Aquecimento adequado'
        ],
        benefits: [
            'Fortalecimento essencial para marcha',
            'Melhora da propulsão',
            'Prevenção de quedas',
            'Melhora circulatória',
            'Fácil realização domiciliar'
        ],
        commonMistakes: [
            'Usar braços para impulsionar',
            'Não elevar completamente',
            'Descer muito rápido (perder controle excêntrico)',
            'Inclinar o tronco à frente',
            'Não manter joelhos estendidos (para gastrocnêmio)'
        ],
        images: [],
        videos: [],
        tags: ['panturrilha', 'tornozelo', 'força', 'marcha', 'funcional'],
        musclesWorked: ['Gastrocnêmio', 'Sóleo', 'Tibial Posterior'],
        movementPattern: 'Flexão plantar de tornozelo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
console.log(`✅ Gerados ${EXERCISES_LIBRARY.length} exercícios`);
export default EXERCISES_LIBRARY;
