/**
 * Biblioteca de condutas comuns por categoria
 * Usada para autocomplete no formulário de condutas
 */

import { ConductCategory } from '../types/conducts';

interface ConductOption {
  name: string;
  variations?: string[];
  regions?: string[];
  parameters?: string[];
  equipment?: string[];
}

type CommonConductsLibrary = Record<ConductCategory, ConductOption[]>;

export const commonConducts: CommonConductsLibrary = {
  manual_therapy: [
    { 
      name: 'Liberação miofascial', 
      regions: ['Lombar', 'Cervical', 'Trapézio', 'Quadríceps', 'Isquiotibiais', 'Gastrocnêmio', 'Antebraço']
    },
    { 
      name: 'Massagem terapêutica', 
      regions: ['Lombar', 'Cervical', 'Membros inferiores', 'Membros superiores']
    },
    { 
      name: 'Drenagem linfática', 
      regions: ['Membros inferiores', 'Membros superiores', 'Face']
    },
    { 
      name: 'Mobilização articular', 
      regions: ['Glenoumeral', 'Coxofemoral', 'Patelar', 'Lombar', 'Cervical', 'Torácica']
    },
    {
      name: 'Mobilização neural',
      regions: ['Ciático', 'Mediano', 'Ulnar', 'Radial', 'Femoral']
    },
    {
      name: 'Pompagem',
      regions: ['Lombar', 'Cervical', 'Membros inferiores']
    },
  ],
  
  electrotherapy: [
    { 
      name: 'TENS', 
      parameters: ['Convencional', 'Acupuntura', 'Burst', 'Alta frequência', 'Baixa frequência']
    },
    { 
      name: 'Laser', 
      parameters: ['Baixa potência', 'Alta potência', 'Puntual', 'Varredura']
    },
    { 
      name: 'Ultrassom', 
      parameters: ['Contínuo', 'Pulsado', '1 MHz', '3 MHz']
    },
    { 
      name: 'EENM (Eletroestimulação)', 
      parameters: ['Fortalecimento', 'Recrutamento', 'FES']
    },
    { 
      name: 'Terapia combinada',
      parameters: ['US + TENS', 'US + FES']
    },
    { 
      name: 'Corrente interferencial',
      parameters: ['4 polos', 'Bipolar']
    },
    {
      name: 'Corrente russa',
      parameters: ['Fortalecimento', '2500 Hz']
    },
    {
      name: 'Crioterapia',
      parameters: ['Gelo', 'Cryo chamber']
    },
  ],
  
  therapeutic_exercise: [
    { 
      name: 'Série de Williams', 
      variations: ['Flexão', 'Rotação', 'Inclinação lateral']
    },
    { 
      name: 'Perdigueiro (Bird dog)', 
      variations: ['Alternado', 'Unilateral', 'Com faixa elástica']
    },
    { 
      name: 'Ponte (Bridge)', 
      variations: ['Bilateral', 'Unilateral', 'Com thera band', 'Com elevação']
    },
    { 
      name: 'Prancha (Plank)', 
      variations: ['Frontal', 'Lateral', 'Com elevação', 'Dinâmica']
    },
    { 
      name: 'Agachamento', 
      variations: ['Livre', 'Com apoio', 'Unilateral', 'Búlgaro', 'Pistol']
    },
    { 
      name: 'Mobilização torácica', 
      variations: ['Pull over', 'Rotação', 'Extensão']
    },
    {
      name: 'Treino de marcha',
      variations: ['Com obstáculos', 'Dupla tarefa', 'Lateral']
    },
    {
      name: 'PQD (Postura quadrúpede)',
      variations: ['Com dissociação', 'Com peso']
    },
  ],
  
  stretching: [
    { 
      name: 'Alongamento de isquiotibiais',
      variations: ['Em pé', 'Deitado', 'Sentado']
    },
    { 
      name: 'Alongamento de quadríceps',
      variations: ['Em pé', 'Deitado lateral', 'Sentado']
    },
    { 
      name: 'Alongamento de peitoral',
      variations: ['Na parede', 'Com bastão', 'Deitado']
    },
    { 
      name: 'Alongamento de trapézio',
      variations: ['Superior', 'Médio', 'Inferior']
    },
    { 
      name: 'Alongamento de iliopsoas',
      variations: ['Cavaleiro', 'Em pé', 'Com apoio']
    },
    {
      name: 'Alongamento de gastrocnêmio',
      variations: ['Na parede', 'No degrau', 'Com faixa']
    },
    {
      name: 'Alongamento cervical',
      variations: ['Flexão', 'Extensão', 'Rotação', 'Inclinação']
    },
  ],
  
  strengthening: [
    { 
      name: 'Fortalecimento de quadríceps', 
      equipment: ['Caneleira', 'Thera band', 'Peso livre', 'Leg press']
    },
    { 
      name: 'Fortalecimento de manguito rotador', 
      equipment: ['Thera band', 'Halteres', 'Cabo']
    },
    { 
      name: 'Fortalecimento de core', 
      equipment: ['Bola suíça', 'Thera band', 'Prancha']
    },
    { 
      name: 'Shoulder flex/abd', 
      equipment: ['Thera band', 'Halteres', 'Peso livre']
    },
    { 
      name: 'Power ball',
      equipment: ['Power ball']
    },
    {
      name: 'Fortalecimento de glúteos',
      equipment: ['Thera band', 'Caneleira', 'Peso livre']
    },
    {
      name: 'Fortalecimento de posteriores de coxa',
      equipment: ['Thera band', 'Bola suíça', 'Peso livre']
    },
    {
      name: 'Siri (crab walk)',
      equipment: ['Thera band', 'Mini band']
    },
  ],

  mobilization: [
    {
      name: 'Mobilização glenoumeral',
      variations: ['Rotação interna', 'Rotação externa', 'Abdução', 'Flexão']
    },
    {
      name: 'Mobilização coxofemoral',
      variations: ['Flexão', 'Extensão', 'Rotação', 'Abdução']
    },
    {
      name: 'Mobilização de coluna',
      variations: ['Lombar', 'Torácica', 'Cervical']
    },
    {
      name: 'Mobilização patelar',
      variations: ['Superior-inferior', 'Medial-lateral', 'Rotação']
    },
    {
      name: 'Pull over sentado',
      equipment: ['Bola', 'Bastão', 'Caixote']
    },
  ],

  other: [
    {
      name: 'Orientações posturais',
      variations: ['Ergonomia', 'AVDs', 'Sono']
    },
    {
      name: 'Educação em dor',
      variations: ['Neurociência da dor', 'Autogerenciamento']
    },
    {
      name: 'Treino respiratório',
      variations: ['Diafragmático', 'Expansão torácica']
    },
    {
      name: 'Reeducação proprioceptiva',
      equipment: ['Disco', 'Bosu', 'Cama elástica']
    },
  ],
};

/**
 * Retorna lista de nomes de condutas para uma categoria
 */
export function getConductNamesByCategory(category: ConductCategory): string[] {
  return commonConducts[category].map(conduct => conduct.name);
}

/**
 * Retorna detalhes de uma conduta específica
 */
export function getConductDetails(category: ConductCategory, name: string): ConductOption | undefined {
  return commonConducts[category].find(conduct => conduct.name === name);
}

/**
 * Busca condutas por texto (fuzzy search)
 */
export function searchConducts(query: string): Array<{ category: ConductCategory; conduct: ConductOption }> {
  const results: Array<{ category: ConductCategory; conduct: ConductOption }> = [];
  const lowerQuery = query.toLowerCase();

  Object.entries(commonConducts).forEach(([category, conducts]) => {
    conducts.forEach(conduct => {
      if (conduct.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          category: category as ConductCategory,
          conduct
        });
      }
    });
  });

  return results;
}

