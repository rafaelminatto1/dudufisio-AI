/**
 * Dados das Regiões Anatômicas do Corpo Humano
 *
 * Cada região possui:
 * - id: identificador único
 * - name: nome em português
 * - path: caminho SVG (polígono clicável)
 * - x, y: centro da região (para posicionar labels)
 * - color: cor base da região
 * - group: grupo anatômico
 */

export type BodyGroup = 'head' | 'neck' | 'torso' | 'upper_limb' | 'lower_limb' | 'spine';

export interface BodyRegion {
  id: string;
  name: string;
  path: string;           // SVG path (polígono)
  x: number;              // Centro X (%)
  y: number;              // Centro Y (%)
  color: string;          // Cor base
  group: BodyGroup;       // Grupo anatômico
  side?: 'left' | 'right' | 'center'; // Lado do corpo
}

/**
 * Regiões Anatômicas - Vista FRONTAL
 *
 * ViewBox: 0 0 300 600 (largura 300, altura 600)
 * Centro: x=150
 */
export const BODY_REGIONS_FRONT: BodyRegion[] = [
  // ========== CABEÇA E PESCOÇO ==========
  {
    id: 'head_front',
    name: 'Cabeça',
    path: 'M 130,20 L 170,20 L 175,35 L 170,50 L 130,50 L 125,35 Z',
    x: 150,
    y: 35,
    color: '#fef3c7', // Amarelo claro
    group: 'head',
    side: 'center'
  },
  {
    id: 'face',
    name: 'Face',
    path: 'M 135,40 L 165,40 L 165,60 L 150,65 L 135,60 Z',
    x: 150,
    y: 50,
    color: '#fde68a',
    group: 'head',
    side: 'center'
  },
  {
    id: 'neck_front',
    name: 'Pescoço (Anterior)',
    path: 'M 140,65 L 160,65 L 160,85 L 140,85 Z',
    x: 150,
    y: 75,
    color: '#fcd34d',
    group: 'neck',
    side: 'center'
  },

  // ========== OMBROS ==========
  {
    id: 'shoulder_left',
    name: 'Ombro Esquerdo',
    path: 'M 95,95 L 125,95 L 130,110 L 125,125 L 95,120 L 90,105 Z',
    x: 110,
    y: 110,
    color: '#bfdbfe', // Azul claro
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'shoulder_right',
    name: 'Ombro Direito',
    path: 'M 175,95 L 205,95 L 210,105 L 205,120 L 175,125 L 170,110 Z',
    x: 190,
    y: 110,
    color: '#bfdbfe',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== TÓRAX ==========
  {
    id: 'chest_upper',
    name: 'Tórax Superior',
    path: 'M 125,95 L 175,95 L 180,130 L 120,130 Z',
    x: 150,
    y: 110,
    color: '#ddd6fe', // Roxo claro
    group: 'torso',
    side: 'center'
  },
  {
    id: 'chest_left',
    name: 'Peitoral Esquerdo',
    path: 'M 120,100 L 145,100 L 145,130 L 120,130 Z',
    x: 132,
    y: 115,
    color: '#c4b5fd',
    group: 'torso',
    side: 'left'
  },
  {
    id: 'chest_right',
    name: 'Peitoral Direito',
    path: 'M 155,100 L 180,100 L 180,130 L 155,130 Z',
    x: 168,
    y: 115,
    color: '#c4b5fd',
    group: 'torso',
    side: 'right'
  },

  // ========== ABDÔMEN ==========
  {
    id: 'abdomen_upper',
    name: 'Abdômen Superior',
    path: 'M 125,135 L 175,135 L 175,165 L 125,165 Z',
    x: 150,
    y: 150,
    color: '#fed7aa', // Laranja claro
    group: 'torso',
    side: 'center'
  },
  {
    id: 'abdomen_lower',
    name: 'Abdômen Inferior',
    path: 'M 125,170 L 175,170 L 175,200 L 125,200 Z',
    x: 150,
    y: 185,
    color: '#fdba74',
    group: 'torso',
    side: 'center'
  },

  // ========== MEMBROS SUPERIORES - BRAÇOS ==========
  {
    id: 'arm_left_upper',
    name: 'Braço Esquerdo (Superior)',
    path: 'M 85,125 L 105,125 L 105,165 L 85,165 Z',
    x: 95,
    y: 145,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'arm_right_upper',
    name: 'Braço Direito (Superior)',
    path: 'M 195,125 L 215,125 L 215,165 L 195,165 Z',
    x: 205,
    y: 145,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== COTOVELOS ==========
  {
    id: 'elbow_left',
    name: 'Cotovelo Esquerdo',
    path: 'M 80,168 L 100,168 L 100,188 L 80,188 Z',
    x: 90,
    y: 178,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'elbow_right',
    name: 'Cotovelo Direito',
    path: 'M 200,168 L 220,168 L 220,188 L 200,188 Z',
    x: 210,
    y: 178,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== ANTEBRAÇOS ==========
  {
    id: 'forearm_left',
    name: 'Antebraço Esquerdo',
    path: 'M 75,192 L 95,192 L 95,240 L 75,240 Z',
    x: 85,
    y: 216,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'forearm_right',
    name: 'Antebraço Direito',
    path: 'M 205,192 L 225,192 L 225,240 L 205,240 Z',
    x: 215,
    y: 216,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== PUNHOS ==========
  {
    id: 'wrist_left',
    name: 'Punho Esquerdo',
    path: 'M 72,243 L 92,243 L 92,253 L 72,253 Z',
    x: 82,
    y: 248,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'wrist_right',
    name: 'Punho Direito',
    path: 'M 208,243 L 228,243 L 228,253 L 208,253 Z',
    x: 218,
    y: 248,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== MÃOS ==========
  {
    id: 'hand_left',
    name: 'Mão Esquerda',
    path: 'M 68,256 L 88,256 L 88,280 L 68,280 Z',
    x: 78,
    y: 268,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'hand_right',
    name: 'Mão Direita',
    path: 'M 212,256 L 232,256 L 232,280 L 212,280 Z',
    x: 222,
    y: 268,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== REGIÃO PÉLVICA ==========
  {
    id: 'pelvis',
    name: 'Região Pélvica',
    path: 'M 125,205 L 175,205 L 180,235 L 120,235 Z',
    x: 150,
    y: 220,
    color: '#fde047',
    group: 'torso',
    side: 'center'
  },
  {
    id: 'hip_left',
    name: 'Quadril Esquerdo',
    path: 'M 115,220 L 145,220 L 145,250 L 115,250 Z',
    x: 130,
    y: 235,
    color: '#fbbf24',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'hip_right',
    name: 'Quadril Direito',
    path: 'M 155,220 L 185,220 L 185,250 L 155,250 Z',
    x: 170,
    y: 235,
    color: '#fbbf24',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== COXAS ==========
  {
    id: 'thigh_left',
    name: 'Coxa Esquerda',
    path: 'M 115,255 L 145,255 L 145,330 L 115,330 Z',
    x: 130,
    y: 292,
    color: '#a7f3d0', // Verde claro
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'thigh_right',
    name: 'Coxa Direita',
    path: 'M 155,255 L 185,255 L 185,330 L 155,330 Z',
    x: 170,
    y: 292,
    color: '#a7f3d0',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== JOELHOS ==========
  {
    id: 'knee_left',
    name: 'Joelho Esquerdo',
    path: 'M 112,333 L 142,333 L 142,353 L 112,353 Z',
    x: 127,
    y: 343,
    color: '#34d399',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'knee_right',
    name: 'Joelho Direito',
    path: 'M 158,333 L 188,333 L 188,353 L 158,353 Z',
    x: 173,
    y: 343,
    color: '#34d399',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== PERNAS ==========
  {
    id: 'leg_left',
    name: 'Perna Esquerda',
    path: 'M 112,358 L 142,358 L 142,460 L 112,460 Z',
    x: 127,
    y: 409,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'leg_right',
    name: 'Perna Direita',
    path: 'M 158,358 L 188,358 L 188,460 L 158,460 Z',
    x: 173,
    y: 409,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== TORNOZELOS ==========
  {
    id: 'ankle_left',
    name: 'Tornozelo Esquerdo',
    path: 'M 110,463 L 140,463 L 140,478 L 110,478 Z',
    x: 125,
    y: 470,
    color: '#34d399',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'ankle_right',
    name: 'Tornozelo Direito',
    path: 'M 160,463 L 190,463 L 190,478 L 160,478 Z',
    x: 175,
    y: 470,
    color: '#34d399',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== PÉS ==========
  {
    id: 'foot_left',
    name: 'Pé Esquerdo',
    path: 'M 105,481 L 135,481 L 140,500 L 135,515 L 105,515 L 100,500 Z',
    x: 120,
    y: 498,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'foot_right',
    name: 'Pé Direito',
    path: 'M 165,481 L 195,481 L 200,500 L 195,515 L 165,515 L 160,500 Z',
    x: 180,
    y: 498,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'right'
  }
];

/**
 * Regiões Anatômicas - Vista POSTERIOR (Costas)
 */
export const BODY_REGIONS_BACK: BodyRegion[] = [
  // ========== CABEÇA E PESCOÇO (POSTERIOR) ==========
  {
    id: 'head_back',
    name: 'Cabeça (Posterior)',
    path: 'M 130,20 L 170,20 L 175,35 L 170,50 L 130,50 L 125,35 Z',
    x: 150,
    y: 35,
    color: '#fef3c7',
    group: 'head',
    side: 'center'
  },
  {
    id: 'neck_back',
    name: 'Pescoço (Posterior)',
    path: 'M 140,55 L 160,55 L 160,75 L 140,75 Z',
    x: 150,
    y: 65,
    color: '#fcd34d',
    group: 'neck',
    side: 'center'
  },

  // ========== COLUNA VERTEBRAL ==========
  {
    id: 'cervical_spine',
    name: 'Coluna Cervical',
    path: 'M 145,60 L 155,60 L 155,85 L 145,85 Z',
    x: 150,
    y: 72,
    color: '#fca5a5', // Vermelho claro
    group: 'spine',
    side: 'center'
  },
  {
    id: 'thoracic_spine',
    name: 'Coluna Torácica',
    path: 'M 145,90 L 155,90 L 155,160 L 145,160 Z',
    x: 150,
    y: 125,
    color: '#fb923c', // Laranja
    group: 'spine',
    side: 'center'
  },
  {
    id: 'lumbar_spine',
    name: 'Coluna Lombar',
    path: 'M 145,165 L 155,165 L 155,210 L 145,210 Z',
    x: 150,
    y: 187,
    color: '#f97316', // Laranja escuro
    group: 'spine',
    side: 'center'
  },
  {
    id: 'sacrum',
    name: 'Sacro/Cóccix',
    path: 'M 140,215 L 160,215 L 160,235 L 140,235 Z',
    x: 150,
    y: 225,
    color: '#ea580c',
    group: 'spine',
    side: 'center'
  },

  // ========== OMBROS E ESCÁPULAS ==========
  {
    id: 'shoulder_left_back',
    name: 'Ombro Esquerdo (Posterior)',
    path: 'M 95,85 L 125,85 L 130,110 L 95,110 Z',
    x: 110,
    y: 97,
    color: '#bfdbfe',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'shoulder_right_back',
    name: 'Ombro Direito (Posterior)',
    path: 'M 175,85 L 205,85 L 205,110 L 170,110 Z',
    x: 190,
    y: 97,
    color: '#bfdbfe',
    group: 'upper_limb',
    side: 'right'
  },
  {
    id: 'scapula_left',
    name: 'Escápula Esquerda',
    path: 'M 115,95 L 140,95 L 140,135 L 115,135 Z',
    x: 127,
    y: 115,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'scapula_right',
    name: 'Escápula Direita',
    path: 'M 160,95 L 185,95 L 185,135 L 160,135 Z',
    x: 172,
    y: 115,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== DORSO ==========
  {
    id: 'upper_back_left',
    name: 'Parte Superior das Costas (Esquerda)',
    path: 'M 110,90 L 145,90 L 145,160 L 110,160 Z',
    x: 127,
    y: 125,
    color: '#e9d5ff',
    group: 'torso',
    side: 'left'
  },
  {
    id: 'upper_back_right',
    name: 'Parte Superior das Costas (Direita)',
    path: 'M 155,90 L 190,90 L 190,160 L 155,160 Z',
    x: 172,
    y: 125,
    color: '#e9d5ff',
    group: 'torso',
    side: 'right'
  },

  // ========== REGIÃO LOMBAR ==========
  {
    id: 'lower_back_left',
    name: 'Lombar Esquerda',
    path: 'M 110,165 L 145,165 L 145,210 L 110,210 Z',
    x: 127,
    y: 187,
    color: '#fed7aa',
    group: 'torso',
    side: 'left'
  },
  {
    id: 'lower_back_right',
    name: 'Lombar Direita',
    path: 'M 155,165 L 190,165 L 190,210 L 155,210 Z',
    x: 172,
    y: 187,
    color: '#fed7aa',
    group: 'torso',
    side: 'right'
  },

  // ========== MEMBROS SUPERIORES (POSTERIOR) ==========
  {
    id: 'triceps_left',
    name: 'Tríceps Esquerdo',
    path: 'M 85,115 L 105,115 L 105,165 L 85,165 Z',
    x: 95,
    y: 140,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'triceps_right',
    name: 'Tríceps Direito',
    path: 'M 195,115 L 215,115 L 215,165 L 195,165 Z',
    x: 205,
    y: 140,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },
  {
    id: 'elbow_left_back',
    name: 'Cotovelo Esquerdo (Posterior)',
    path: 'M 80,168 L 100,168 L 100,188 L 80,188 Z',
    x: 90,
    y: 178,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'elbow_right_back',
    name: 'Cotovelo Direito (Posterior)',
    path: 'M 200,168 L 220,168 L 220,188 L 200,188 Z',
    x: 210,
    y: 178,
    color: '#60a5fa',
    group: 'upper_limb',
    side: 'right'
  },
  {
    id: 'forearm_left_back',
    name: 'Antebraço Esquerdo (Posterior)',
    path: 'M 75,192 L 95,192 L 95,240 L 75,240 Z',
    x: 85,
    y: 216,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'left'
  },
  {
    id: 'forearm_right_back',
    name: 'Antebraço Direito (Posterior)',
    path: 'M 205,192 L 225,192 L 225,240 L 205,240 Z',
    x: 215,
    y: 216,
    color: '#93c5fd',
    group: 'upper_limb',
    side: 'right'
  },

  // ========== REGIÃO GLÚTEA ==========
  {
    id: 'gluteal_left',
    name: 'Glúteo Esquerdo',
    path: 'M 115,220 L 145,220 L 145,260 L 115,260 Z',
    x: 130,
    y: 240,
    color: '#fbbf24',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'gluteal_right',
    name: 'Glúteo Direito',
    path: 'M 155,220 L 185,220 L 185,260 L 155,260 Z',
    x: 170,
    y: 240,
    color: '#fbbf24',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== POSTERIORES DE COXA ==========
  {
    id: 'hamstring_left',
    name: 'Posterior da Coxa Esquerda',
    path: 'M 115,265 L 145,265 L 145,340 L 115,340 Z',
    x: 130,
    y: 302,
    color: '#a7f3d0',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'hamstring_right',
    name: 'Posterior da Coxa Direita',
    path: 'M 155,265 L 185,265 L 185,340 L 155,340 Z',
    x: 170,
    y: 302,
    color: '#a7f3d0',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== JOELHOS (POSTERIOR) ==========
  {
    id: 'knee_left_back',
    name: 'Joelho Esquerdo (Posterior)',
    path: 'M 112,343 L 142,343 L 142,363 L 112,363 Z',
    x: 127,
    y: 353,
    color: '#34d399',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'knee_right_back',
    name: 'Joelho Direito (Posterior)',
    path: 'M 158,343 L 188,343 L 188,363 L 158,363 Z',
    x: 173,
    y: 353,
    color: '#34d399',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== PANTURRILHAS ==========
  {
    id: 'calf_left',
    name: 'Panturrilha Esquerda',
    path: 'M 112,368 L 142,368 L 142,460 L 112,460 Z',
    x: 127,
    y: 414,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'calf_right',
    name: 'Panturrilha Direita',
    path: 'M 158,368 L 188,368 L 188,460 L 158,460 Z',
    x: 173,
    y: 414,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== TORNOZELOS (POSTERIOR) ==========
  {
    id: 'ankle_left_back',
    name: 'Tornozelo Esquerdo (Posterior)',
    path: 'M 110,463 L 140,463 L 140,478 L 110,478 Z',
    x: 125,
    y: 470,
    color: '#34d399',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'ankle_right_back',
    name: 'Tornozelo Direito (Posterior)',
    path: 'M 160,463 L 190,463 L 190,478 L 160,478 Z',
    x: 175,
    y: 470,
    color: '#34d399',
    group: 'lower_limb',
    side: 'right'
  },

  // ========== PÉS (POSTERIOR) ==========
  {
    id: 'foot_left_back',
    name: 'Pé Esquerdo (Posterior)',
    path: 'M 105,481 L 135,481 L 140,500 L 135,515 L 105,515 L 100,500 Z',
    x: 120,
    y: 498,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'left'
  },
  {
    id: 'foot_right_back',
    name: 'Pé Direito (Posterior)',
    path: 'M 165,481 L 195,481 L 200,500 L 195,515 L 165,515 L 160,500 Z',
    x: 180,
    y: 498,
    color: '#6ee7b7',
    group: 'lower_limb',
    side: 'right'
  }
];

/**
 * Cores por Grupo Anatômico
 */
export const GROUP_COLORS: Record<BodyGroup, string> = {
  head: '#fef3c7',        // Amarelo claro
  neck: '#fcd34d',        // Amarelo
  torso: '#e9d5ff',       // Roxo claro
  upper_limb: '#93c5fd',  // Azul claro
  lower_limb: '#a7f3d0',  // Verde claro
  spine: '#fca5a5'        // Vermelho claro
};

/**
 * Função para obter cor baseada em intensidade de dor (0-10)
 */
export function getPainColor(intensity: number): string {
  if (intensity === 0) return '#f1f5f9'; // Sem dor - cinza claro
  if (intensity <= 3) return '#22c55e';  // Leve - verde
  if (intensity <= 6) return '#eab308';  // Moderada - amarelo
  if (intensity <= 8) return '#f97316';  // Intensa - laranja
  return '#ef4444';                       // Severa - vermelho
}

/**
 * Labels de intensidade de dor
 */
export const PAIN_INTENSITY_LABELS: Record<number, string> = {
  0: 'Sem dor',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Leve/Moderada',
  4: 'Moderada',
  5: 'Moderada',
  6: 'Moderada/Forte',
  7: 'Forte',
  8: 'Muito forte',
  9: 'Quase insuportável',
  10: 'Insuportável'
};

/**
 * Emojis de intensidade de dor
 */
export const PAIN_INTENSITY_EMOJIS: Record<number, string> = {
  0: '😊',
  1: '😌',
  2: '🙂',
  3: '😐',
  4: '😕',
  5: '😟',
  6: '😣',
  7: '😖',
  8: '😫',
  9: '😭',
  10: '😱'
};
