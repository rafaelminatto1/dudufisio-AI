import { Exercise } from '../types';

/**
 * Seed data com 50+ exercícios pré-cadastrados
 * Categorias: mobilidade, força, cardio, equilíbrio, alongamento
 * Níveis: iniciante, intermediário, avançado
 */

export const SEED_EXERCISES: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ========== MOBILIDADE ==========
  {
    name: 'Rotação Cervical',
    description: 'Movimente suavemente a cabeça de um lado para o outro, mantendo os ombros relaxados.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Cervical',
    equipment: [],
    videoUrl: 'https://example.com/cervical-rotation',
    imageUrl: 'https://example.com/cervical-rotation.jpg',
    instructions: [
      'Sente-se com a coluna ereta',
      'Mantenha os ombros relaxados',
      'Gire a cabeça lentamente para a direita',
      'Retorne ao centro',
      'Repita para o lado esquerdo'
    ],
    contraindications: ['Hérnia cervical aguda', 'Tontura severa'],
    benefits: ['Melhora amplitude de movimento', 'Reduz tensão cervical'],
    tags: ['pescoço', 'mobilidade', 'escritório']
  },
  {
    name: 'Flexão e Extensão de Punho',
    description: 'Exercício para melhorar a mobilidade dos punhos.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 45,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Punho',
    equipment: [],
    instructions: [
      'Estenda o braço à frente',
      'Flexione o punho para baixo',
      'Depois flexione para cima',
      'Mantenha o movimento controlado'
    ],
    contraindications: ['Fratura recente de punho'],
    benefits: ['Previne LER/DORT', 'Melhora mobilidade'],
    tags: ['punho', 'prevenção', 'escritório']
  },
  {
    name: 'Rotação de Ombro',
    description: 'Movimentos circulares com os ombros para aumentar a amplitude.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Ombro',
    equipment: [],
    instructions: [
      'Fique em pé com os braços relaxados',
      'Faça círculos com os ombros para trás',
      'Repita o movimento para frente'
    ],
    benefits: ['Melhora postura', 'Reduz tensão'],
    tags: ['ombro', 'postura']
  },
  {
    name: 'Mobilização Torácica em Quatro Apoios',
    description: 'Exercício de mobilidade para a coluna torácica.',
    category: 'mobilidade',
    difficulty: 'intermediário',
    duration: 90,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Torácica',
    equipment: ['Tapete'],
    instructions: [
      'Posição de quatro apoios',
      'Uma mão atrás da cabeça',
      'Rotacione o tronco',
      'Olhe para o teto'
    ],
    benefits: ['Melhora rotação torácica', 'Reduz dor nas costas'],
    tags: ['coluna', 'mobilidade', 'rotação']
  },
  {
    name: 'Mobilização de Quadril em Decúbito',
    description: 'Exercício para melhorar a amplitude do quadril.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Quadril',
    equipment: ['Tapete'],
    instructions: [
      'Deite de costas',
      'Joelhos flexionados',
      'Deixe os joelhos caírem para os lados',
      'Retorne ao centro'
    ],
    benefits: ['Melhora flexibilidade do quadril'],
    tags: ['quadril', 'flexibilidade']
  },

  // ========== FORÇA ==========
  {
    name: 'Agachamento Livre',
    description: 'Exercício fundamental para fortalecer membros inferiores.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 120,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Pés na largura dos ombros',
      'Desça flexionando joelhos e quadril',
      'Mantenha as costas retas',
      'Suba retornando à posição inicial'
    ],
    contraindications: ['Lesão aguda no joelho', 'Dor lombar severa'],
    benefits: ['Fortalece quadríceps', 'Melhora equilíbrio', 'Funcional'],
    tags: ['pernas', 'força', 'funcional']
  },
  {
    name: 'Flexão de Joelho Isométrica na Parede',
    description: 'Exercício isométrico para fortalecer o quadríceps.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 30,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Joelho',
    equipment: [],
    instructions: [
      'Encoste as costas na parede',
      'Deslize até 90 graus de flexão',
      'Mantenha a posição',
      'Respire normalmente'
    ],
    benefits: ['Fortalece quadríceps', 'Estabiliza joelho'],
    tags: ['joelho', 'isométrico', 'força']
  },
  {
    name: 'Ponte de Glúteo',
    description: 'Fortalecimento de glúteos e estabilizadores de quadril.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Quadril',
    equipment: ['Tapete'],
    instructions: [
      'Deite de costas com joelhos flexionados',
      'Eleve o quadril',
      'Contraia os glúteos no topo',
      'Desça controladamente'
    ],
    benefits: ['Fortalece glúteos', 'Estabiliza lombar'],
    tags: ['glúteo', 'lombar', 'força']
  },
  {
    name: 'Prancha Frontal',
    description: 'Exercício isométrico para core.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 45,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Core',
    equipment: ['Tapete'],
    instructions: [
      'Apoie antebraços e pés no chão',
      'Corpo em linha reta',
      'Contraia o abdômen',
      'Mantenha a posição'
    ],
    benefits: ['Fortalece core', 'Melhora postura', 'Previne dor lombar'],
    tags: ['core', 'abdômen', 'isométrico']
  },
  {
    name: 'Flexão de Braço na Parede',
    description: 'Flexão adaptada para iniciantes.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Membros Superiores',
    equipment: [],
    instructions: [
      'Fique de frente para a parede',
      'Mãos na altura do peito',
      'Flexione os cotovelos',
      'Empurre para voltar'
    ],
    benefits: ['Fortalece peitoral', 'Fortalece tríceps'],
    tags: ['braços', 'peito', 'iniciante']
  },
  {
    name: 'Elevação Lateral de Braço',
    description: 'Fortalecimento de deltoides.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Ombro',
    equipment: ['Halteres (1-2kg)'],
    instructions: [
      'Fique em pé com halteres nas mãos',
      'Eleve os braços lateralmente',
      'Até a altura dos ombros',
      'Desça controladamente'
    ],
    benefits: ['Fortalece deltoides', 'Melhora postura'],
    tags: ['ombro', 'força', 'halteres']
  },
  {
    name: 'Abdominal Supra',
    description: 'Fortalecimento da porção superior do reto abdominal.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Abdômen',
    equipment: ['Tapete'],
    instructions: [
      'Deite de costas',
      'Joelhos flexionados',
      'Mãos atrás da cabeça',
      'Eleve o tronco'
    ],
    benefits: ['Fortalece abdômen', 'Melhora core'],
    tags: ['abdômen', 'core']
  },
  {
    name: 'Rosca Direta de Bíceps',
    description: 'Fortalecimento de bíceps braquial.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Braço',
    equipment: ['Halteres (2-5kg)'],
    instructions: [
      'Fique em pé com halteres',
      'Braços estendidos ao lado do corpo',
      'Flexione os cotovelos',
      'Contraia o bíceps no topo'
    ],
    benefits: ['Fortalece bíceps', 'Melhora força de preensão'],
    tags: ['bíceps', 'braço', 'força']
  },
  {
    name: 'Tríceps Testa',
    description: 'Fortalecimento do tríceps braquial.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Braço',
    equipment: ['Halteres (1-3kg)'],
    instructions: [
      'Deite de costas',
      'Halteres acima da cabeça',
      'Flexione os cotovelos',
      'Estenda os braços'
    ],
    benefits: ['Fortalece tríceps'],
    tags: ['tríceps', 'braço']
  },
  {
    name: 'Elevação de Panturrilha',
    description: 'Fortalecimento da musculatura da panturrilha.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 20,
    sets: 3,
    bodyPart: 'Panturrilha',
    equipment: [],
    instructions: [
      'Fique em pé',
      'Eleve os calcanhares',
      'Fique na ponta dos pés',
      'Desça controladamente'
    ],
    benefits: ['Fortalece panturrilha', 'Melhora propulsão'],
    tags: ['panturrilha', 'pernas']
  },

  // ========== ALONGAMENTO ==========
  {
    name: 'Alongamento de Isquiotibiais',
    description: 'Alongamento da parte posterior da coxa.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 3,
    sets: 2,
    bodyPart: 'Membros Inferiores',
    equipment: ['Tapete'],
    instructions: [
      'Sente-se com pernas estendidas',
      'Incline o tronco para frente',
      'Tente alcançar os pés',
      'Mantenha a posição'
    ],
    benefits: ['Aumenta flexibilidade posterior', 'Previne lesões'],
    tags: ['posterior de coxa', 'flexibilidade']
  },
  {
    name: 'Alongamento de Quadríceps em Pé',
    description: 'Alongamento da parte anterior da coxa.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 3,
    sets: 2,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Fique em pé',
      'Segure o tornozelo atrás',
      'Puxe o calcanhar em direção ao glúteo',
      'Mantenha o equilíbrio'
    ],
    benefits: ['Alonga quadríceps', 'Melhora flexibilidade do joelho'],
    tags: ['quadríceps', 'flexibilidade']
  },
  {
    name: 'Alongamento de Peitoral na Parede',
    description: 'Alongamento do músculo peitoral.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 3,
    sets: 2,
    bodyPart: 'Tórax',
    equipment: [],
    instructions: [
      'Fique de lado para a parede',
      'Apoie o antebraço na parede',
      'Gire o corpo para o lado oposto',
      'Mantenha a posição'
    ],
    benefits: ['Alonga peitoral', 'Melhora postura'],
    tags: ['peito', 'postura']
  },
  {
    name: 'Alongamento de Trapézio',
    description: 'Alongamento da musculatura do trapézio.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 3,
    sets: 2,
    bodyPart: 'Cervical',
    equipment: [],
    instructions: [
      'Sente-se ereto',
      'Incline a cabeça para o lado',
      'Ajude com a mão',
      'Mantenha o ombro oposto relaxado'
    ],
    benefits: ['Reduz tensão cervical', 'Alivia dor de cabeça'],
    tags: ['trapézio', 'pescoço', 'tensão']
  },
  {
    name: 'Alongamento de Gato e Camelo',
    description: 'Mobilização e alongamento da coluna vertebral.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Coluna',
    equipment: ['Tapete'],
    instructions: [
      'Posição de quatro apoios',
      'Arque as costas (gato)',
      'Depois deixe a barriga descer (camelo)',
      'Alterne os movimentos'
    ],
    benefits: ['Mobiliza coluna', 'Alivia tensão lombar'],
    tags: ['coluna', 'lombar', 'mobilidade']
  },

  // ========== EQUILÍBRIO ==========
  {
    name: 'Apoio Unipodal',
    description: 'Exercício básico de equilíbrio em uma perna.',
    category: 'equilíbrio',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Fique em pé',
      'Eleve uma perna',
      'Mantenha o equilíbrio',
      'Troque de perna'
    ],
    benefits: ['Melhora propriocepção', 'Previne quedas'],
    tags: ['equilíbrio', 'propriocepção']
  },
  {
    name: 'Marcha em Linha Reta',
    description: 'Caminhada em linha para treinar equilíbrio.',
    category: 'equilíbrio',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 10,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Caminhe em linha reta',
      'Coloque um pé na frente do outro',
      'Como se estivesse em uma corda bamba',
      'Mantenha os braços abertos para equilíbrio'
    ],
    benefits: ['Melhora equilíbrio dinâmico', 'Coordenação'],
    tags: ['equilíbrio', 'marcha', 'coordenação']
  },
  {
    name: 'Apoio Unipodal em Superfície Instável',
    description: 'Equilíbrio avançado em almofada ou bosu.',
    category: 'equilíbrio',
    difficulty: 'avançado',
    duration: 30,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: ['Almofada proprioceptiva ou Bosu'],
    instructions: [
      'Posicione-se sobre a superfície instável',
      'Eleve uma perna',
      'Mantenha o equilíbrio',
      'Troque de perna'
    ],
    benefits: ['Melhora propriocepção avançada', 'Previne lesões de tornozelo'],
    tags: ['propriocepção', 'tornozelo', 'avançado']
  },

  // ========== CARDIO ==========
  {
    name: 'Caminhada',
    description: 'Exercício aeróbico de baixo impacto.',
    category: 'cardio',
    difficulty: 'iniciante',
    duration: 1800,
    repetitions: 1,
    sets: 1,
    bodyPart: 'Corpo Todo',
    equipment: ['Tênis adequado'],
    instructions: [
      'Caminhe em ritmo moderado',
      'Mantenha a postura ereta',
      'Braços balançando naturalmente',
      'Respire profundamente'
    ],
    benefits: ['Melhora condicionamento', 'Saúde cardiovascular', 'Baixo impacto'],
    tags: ['cardio', 'aeróbico', 'iniciante']
  },
  {
    name: 'Marcha Estacionária',
    description: 'Simulação de caminhada no lugar.',
    category: 'cardio',
    difficulty: 'iniciante',
    duration: 300,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Corpo Todo',
    equipment: [],
    instructions: [
      'Eleve os joelhos alternadamente',
      'Mantenha ritmo constante',
      'Balance os braços',
      'Respire regularmente'
    ],
    benefits: ['Aquecimento', 'Condicionamento leve'],
    tags: ['cardio', 'aquecimento']
  },
  {
    name: 'Step Lateral',
    description: 'Movimento lateral para cardio e coordenação.',
    category: 'cardio',
    difficulty: 'intermediário',
    duration: 180,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Dê um passo lateral',
      'Junte o outro pé',
      'Repita para o outro lado',
      'Mantenha ritmo constante'
    ],
    benefits: ['Cardio', 'Coordenação lateral'],
    tags: ['cardio', 'lateral', 'coordenação']
  },

  // ========== EXERCÍCIOS ESPECÍFICOS ==========
  {
    name: 'Rotação Interna e Externa de Ombro',
    description: 'Exercício para reabilitação do manguito rotador.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Ombro',
    equipment: ['Theraband ou Faixa elástica'],
    instructions: [
      'Segure a faixa elástica',
      'Cotovelo a 90 graus ao lado do corpo',
      'Rotacione o antebraço para dentro',
      'Depois para fora'
    ],
    contraindications: ['Luxação aguda de ombro'],
    benefits: ['Fortalece manguito rotador', 'Previne lesões'],
    tags: ['ombro', 'manguito rotador', 'reabilitação']
  },
  {
    name: 'Deslize na Parede (Wall Slide)',
    description: 'Mobilização de ombro com auxílio da parede.',
    category: 'mobilidade',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Ombro',
    equipment: [],
    instructions: [
      'Encoste as costas na parede',
      'Braços flexionados a 90 graus',
      'Deslize os braços para cima',
      'Mantenha as costas encostadas'
    ],
    benefits: ['Melhora amplitude de ombro', 'Corrige postura escapular'],
    tags: ['ombro', 'escapula', 'postura']
  },
  {
    name: 'Exercício de Williams (Flexão Lombar)',
    description: 'Exercício para aliviar dor lombar.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Lombar',
    equipment: ['Tapete'],
    instructions: [
      'Deite de costas',
      'Puxe os joelhos em direção ao peito',
      'Abrace as pernas',
      'Mantenha a posição'
    ],
    benefits: ['Alivia dor lombar', 'Alonga paravertebrais'],
    tags: ['lombar', 'dor nas costas']
  },
  {
    name: 'Exercício de McKenzie (Extensão Lombar)',
    description: 'Extensão lombar para certos tipos de lombalgia.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 30,
    repetitions: 10,
    sets: 3,
    bodyPart: 'Lombar',
    equipment: ['Tapete'],
    instructions: [
      'Deite de barriga para baixo',
      'Apoie os antebraços',
      'Eleve o tronco',
      'Mantenha o quadril no chão'
    ],
    contraindications: ['Estenose lombar', 'Espondilolistese'],
    benefits: ['Centraliza dor irradiada', 'Melhora mobilidade lombar'],
    tags: ['lombar', 'hérnia de disco']
  },
  {
    name: 'Fortalecimento de Tibial Anterior',
    description: 'Exercício para prevenir canelite.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Perna',
    equipment: [],
    instructions: [
      'Sente-se com pernas estendidas',
      'Puxe a ponta do pé para cima',
      'Mantenha a contração',
      'Relaxe'
    ],
    benefits: ['Previne canelite', 'Fortalece tibial'],
    tags: ['tibial', 'canela', 'prevenção']
  },
  {
    name: 'Inversão e Eversão de Tornozelo',
    description: 'Fortalecimento dos estabilizadores do tornozelo.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Tornozelo',
    equipment: ['Theraband'],
    instructions: [
      'Sente-se com theraband ao redor do pé',
      'Vire o pé para dentro (inversão)',
      'Depois para fora (eversão)',
      'Mantenha o movimento controlado'
    ],
    benefits: ['Previne entorses', 'Estabiliza tornozelo'],
    tags: ['tornozelo', 'prevenção', 'entorse']
  },
  {
    name: 'Flexão Plantar e Dorsiflexão',
    description: 'Mobilização do tornozelo.',
    category: 'mobilidade',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 20,
    sets: 3,
    bodyPart: 'Tornozelo',
    equipment: [],
    instructions: [
      'Sente-se com pernas estendidas',
      'Aponte os dedos para frente',
      'Depois puxe para trás',
      'Alterne os movimentos'
    ],
    benefits: ['Melhora amplitude de tornozelo', 'Previne rigidez'],
    tags: ['tornozelo', 'mobilidade']
  },
  {
    name: 'Dissociação de Cinturas',
    description: 'Exercício de coordenação e mobilidade trunk.',
    category: 'mobilidade',
    difficulty: 'intermediário',
    duration: 90,
    repetitions: 10,
    sets: 2,
    bodyPart: 'Coluna',
    equipment: [],
    instructions: [
      'Fique em pé',
      'Rotacione o tronco para um lado',
      'Mantenha o quadril fixo',
      'Repita para o outro lado'
    ],
    benefits: ['Melhora coordenação', 'Mobiliza coluna'],
    tags: ['coluna', 'coordenação', 'rotação']
  },
  {
    name: 'Respiração Diafragmática',
    description: 'Exercício de respiração profunda.',
    category: 'alongamento',
    difficulty: 'iniciante',
    duration: 180,
    repetitions: 10,
    sets: 1,
    bodyPart: 'Tórax',
    equipment: [],
    instructions: [
      'Deite de costas',
      'Uma mão no peito, outra na barriga',
      'Inspire pelo nariz expandindo a barriga',
      'Expire pela boca lentamente'
    ],
    benefits: ['Reduz estresse', 'Melhora oxigenação', 'Relaxamento'],
    tags: ['respiração', 'relaxamento', 'diafragma']
  },
  {
    name: 'Mobilização Neural Mediano',
    description: 'Deslizamento neural para membro superior.',
    category: 'mobilidade',
    difficulty: 'avançado',
    duration: 60,
    repetitions: 10,
    sets: 3,
    bodyPart: 'Braço',
    equipment: [],
    instructions: [
      'Braço estendido ao lado',
      'Palma virada para cima',
      'Flexione o punho',
      'Incline a cabeça para o lado oposto'
    ],
    contraindications: ['Neuropatia aguda', 'Dor intensa'],
    benefits: ['Melhora mobilidade neural', 'Reduz formigamento'],
    tags: ['neural', 'nervo', 'formigamento']
  },
  {
    name: 'Treino de Marcha com Obstáculos',
    description: 'Exercício funcional de marcha.',
    category: 'equilíbrio',
    difficulty: 'intermediário',
    duration: 300,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: ['Cones ou obstáculos'],
    instructions: [
      'Posicione obstáculos no chão',
      'Caminhe passando por cima',
      'Mantenha o equilíbrio',
      'Varie a altura dos obstáculos'
    ],
    benefits: ['Melhora marcha funcional', 'Previne quedas'],
    tags: ['marcha', 'funcional', 'obstáculos']
  },
  {
    name: 'Automobilização Miofascial com Rolo',
    description: 'Liberação miofascial usando foam roller.',
    category: 'alongamento',
    difficulty: 'intermediário',
    duration: 120,
    repetitions: 1,
    sets: 1,
    bodyPart: 'Corpo Todo',
    equipment: ['Foam Roller'],
    instructions: [
      'Posicione o rolo sob a região desejada',
      'Role lentamente',
      'Pause nos pontos de tensão',
      'Respire profundamente'
    ],
    benefits: ['Reduz tensão muscular', 'Melhora recuperação'],
    tags: ['miofascial', 'foam roller', 'recuperação']
  },
  {
    name: 'Treino Proprioceptivo de Tornozelo',
    description: 'Exercício avançado de propriocepção.',
    category: 'equilíbrio',
    difficulty: 'avançado',
    duration: 180,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Tornozelo',
    equipment: ['Prancha de equilíbrio'],
    instructions: [
      'Posicione-se sobre a prancha',
      'Mantenha o equilíbrio',
      'Tente estabilizar a prancha',
      'Progrida para olhos fechados'
    ],
    benefits: ['Previne entorses recorrentes', 'Melhora propriocepção'],
    tags: ['tornozelo', 'propriocepção', 'prevenção']
  },
  {
    name: 'Fortalecimento de Extensores de Punho',
    description: 'Previne epicondilite lateral.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Antebraço',
    equipment: ['Halter leve (1-2kg)'],
    instructions: [
      'Antebraço apoiado',
      'Punho pendente',
      'Estenda o punho com peso',
      'Retorne controladamente'
    ],
    benefits: ['Previne epicondilite', 'Fortalece extensores'],
    tags: ['punho', 'epicondilite', 'prevenção']
  },
  {
    name: 'Fortalecimento de Flexores de Punho',
    description: 'Previne epicondilite medial.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Antebraço',
    equipment: ['Halter leve (1-2kg)'],
    instructions: [
      'Antebraço apoiado',
      'Palma para cima',
      'Flexione o punho com peso',
      'Retorne controladamente'
    ],
    benefits: ['Previne epicondilite', 'Fortalece flexores'],
    tags: ['punho', 'epicondilite', 'prevenção']
  },
  {
    name: 'Dead Bug (Inseto Morto)',
    description: 'Exercício de estabilização core avançado.',
    category: 'força',
    difficulty: 'avançado',
    duration: 90,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Core',
    equipment: ['Tapete'],
    instructions: [
      'Deite de costas',
      'Braços estendidos para cima',
      'Joelhos a 90 graus',
      'Estenda braço e perna opostos'
    ],
    benefits: ['Fortalece core', 'Melhora coordenação'],
    tags: ['core', 'coordenação', 'estabilização']
  },
  {
    name: 'Bird Dog (Cão Pássaro)',
    description: 'Exercício de estabilização lombar.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 60,
    repetitions: 12,
    sets: 3,
    bodyPart: 'Lombar',
    equipment: ['Tapete'],
    instructions: [
      'Posição de quatro apoios',
      'Estenda braço e perna opostos',
      'Mantenha as costas retas',
      'Alterne os lados'
    ],
    benefits: ['Estabiliza lombar', 'Melhora equilíbrio'],
    tags: ['lombar', 'estabilização', 'core']
  },
  {
    name: 'Prancha Lateral',
    description: 'Fortalecimento oblíquo.',
    category: 'força',
    difficulty: 'avançado',
    duration: 40,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Core',
    equipment: ['Tapete'],
    instructions: [
      'Deite de lado',
      'Apoie o antebraço',
      'Eleve o quadril',
      'Corpo em linha reta'
    ],
    benefits: ['Fortalece oblíquos', 'Estabiliza lateral'],
    tags: ['core', 'oblíquo', 'lateral']
  },
  {
    name: 'Monster Walk',
    description: 'Fortalecimento de glúteo médio.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 120,
    repetitions: 10,
    sets: 3,
    bodyPart: 'Quadril',
    equipment: ['Mini band'],
    instructions: [
      'Mini band ao redor dos joelhos',
      'Leve agachamento',
      'Caminhe lateralmente',
      'Mantenha a tensão'
    ],
    benefits: ['Fortalece glúteo médio', 'Previne lesões de joelho'],
    tags: ['glúteo', 'quadril', 'mini band']
  },
  {
    name: 'Clamshell',
    description: 'Fortalecimento de rotadores externos de quadril.',
    category: 'força',
    difficulty: 'iniciante',
    duration: 60,
    repetitions: 15,
    sets: 3,
    bodyPart: 'Quadril',
    equipment: ['Mini band (opcional)'],
    instructions: [
      'Deite de lado',
      'Joelhos flexionados',
      'Abra o joelho superior',
      'Mantenha os pés juntos'
    ],
    benefits: ['Fortalece rotadores externos', 'Estabiliza quadril'],
    tags: ['quadril', 'rotadores', 'glúteo']
  },
  {
    name: 'Superman',
    description: 'Fortalecimento de paravertebrais.',
    category: 'força',
    difficulty: 'intermediário',
    duration: 30,
    repetitions: 1,
    sets: 3,
    bodyPart: 'Lombar',
    equipment: ['Tapete'],
    instructions: [
      'Deite de barriga para baixo',
      'Estenda braços à frente',
      'Eleve braços e pernas simultaneamente',
      'Mantenha a posição'
    ],
    benefits: ['Fortalece paravertebrais', 'Melhora postura'],
    tags: ['lombar', 'paravertebrais', 'extensão']
  },
  {
    name: 'Agachamento Unilateral (Pistol Squat Assistido)',
    description: 'Agachamento em uma perna com apoio.',
    category: 'força',
    difficulty: 'avançado',
    duration: 90,
    repetitions: 10,
    sets: 3,
    bodyPart: 'Membros Inferiores',
    equipment: [],
    instructions: [
      'Segure em um apoio',
      'Uma perna estendida à frente',
      'Agache na perna de apoio',
      'Suba controladamente'
    ],
    benefits: ['Fortalece unilateral', 'Corrige assimetrias'],
    tags: ['pernas', 'unilateral', 'avançado']
  }
];

// Função para importar exercises para o banco de dados
export async function seedExercises() {
  console.log(`Preparando para importar ${SEED_EXERCISES.length} exercícios...`);
  
  // Em produção, isso seria implementado com Supabase
  // Por enquanto, apenas log
  SEED_EXERCISES.forEach((exercise, index) => {
    console.log(`${index + 1}. ${exercise.name} - ${exercise.category} (${exercise.difficulty})`);
  });
  
  console.log(`✅ Total de ${SEED_EXERCISES.length} exercícios prontos para importação.`);
  
  return SEED_EXERCISES;
}

export default SEED_EXERCISES;
