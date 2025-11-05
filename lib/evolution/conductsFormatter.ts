/**
 * Formatador de condutas estruturadas para texto
 * Converte o array de condutas em texto formatado para relatórios
 */

import { Conduct, ConductCategory, getCategoryMetadata } from '../../types/conducts';

/**
 * Gera texto formatado a partir de condutas estruturadas
 * @param conducts Array de condutas
 * @param notes Observações gerais do plano
 * @returns Texto formatado para relatórios e impressão
 */
export function generatePlanText(conducts: Conduct[], notes?: string): string {
  if (conducts.length === 0 && !notes) {
    return '';
  }

  // Agrupar condutas por categoria
  const groupedConducts = conducts.reduce((acc, conduct) => {
    if (!acc[conduct.category]) {
      acc[conduct.category] = [];
    }
    acc[conduct.category].push(conduct);
    return acc;
  }, {} as Record<ConductCategory, Conduct[]>);

  let text = '';

  // Processar cada categoria
  Object.entries(groupedConducts).forEach(([category, categoryConducts]) => {
    const metadata = getCategoryMetadata(category as ConductCategory);
    
    // Título da categoria com emoji
    text += `\n${metadata.emoji} ${metadata.label.toUpperCase()}:\n`;
    
    // Listar condutas da categoria
    categoryConducts.forEach(conduct => {
      text += `- ${conduct.name}`;
      
      // Adicionar detalhes inline
      const details: string[] = [];
      
      if (conduct.details) {
        details.push(conduct.details);
      }
      
      if (conduct.duration) {
        details.push(conduct.duration);
      }
      
      if (conduct.equipment) {
        details.push(`Material: ${conduct.equipment}`);
      }
      
      if (details.length > 0) {
        text += ` (${details.join(' | ')})`;
      }
      
      text += '\n';
      
      // Adicionar notas em linha separada se existirem
      if (conduct.notes) {
        text += `  Obs: ${conduct.notes}\n`;
      }
    });
    
    text += '\n';
  });

  // Adicionar observações gerais
  if (notes) {
    text += `\n📋 OBSERVAÇÕES GERAIS:\n${notes}\n`;
  }

  return text.trim();
}

/**
 * Gera resumo curto do plano (para visualização rápida)
 * @param conducts Array de condutas
 * @returns Texto resumido
 */
export function generatePlanSummary(conducts: Conduct[]): string {
  if (conducts.length === 0) {
    return 'Nenhuma conduta registrada';
  }

  // Contar condutas por categoria
  const categoryCounts: Record<string, number> = {};
  
  conducts.forEach(conduct => {
    const metadata = getCategoryMetadata(conduct.category);
    const key = metadata.label;
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  });

  // Formatar resumo
  const summary = Object.entries(categoryCounts)
    .map(([category, count]) => `${category}: ${count}`)
    .join(' | ');

  return `${conducts.length} condutas (${summary})`;
}

/**
 * Valida se uma conduta está completa
 * @param conduct Conduta a validar
 * @returns true se a conduta tem campos obrigatórios preenchidos
 */
export function validateConduct(conduct: Partial<Conduct>): boolean {
  return !!(conduct.category && conduct.name && conduct.name.trim().length > 0);
}

/**
 * Exporta condutas para formato CSV
 * @param conducts Array de condutas
 * @returns String CSV
 */
export function exportConductsToCSV(conducts: Conduct[]): string {
  const headers = ['Categoria', 'Nome', 'Detalhes', 'Duração', 'Equipamento', 'Observações'];
  const rows = conducts.map(conduct => {
    const metadata = getCategoryMetadata(conduct.category);
    return [
      metadata.label,
      conduct.name,
      conduct.details || '',
      conduct.duration || '',
      conduct.equipment || '',
      conduct.notes || ''
    ].map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Importa condutas de formato CSV
 * @param csv String CSV
 * @returns Array de condutas
 */
export function importConductsFromCSV(csv: string): Conduct[] {
  const lines = csv.split('\n').slice(1); // Skip header
  const conducts: Conduct[] = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => 
      v.replace(/^"|"$/g, '').replace(/""/g, '"')
    );

    if (!values || values.length < 2) return;

    // Map category label back to value
    const categoryMap: Record<string, ConductCategory> = {
      'Terapia Manual': 'manual_therapy',
      'Eletroterapia': 'electrotherapy',
      'Exercícios Terapêuticos': 'therapeutic_exercise',
      'Alongamentos': 'stretching',
      'Fortalecimento': 'strengthening',
      'Mobilização': 'mobilization',
      'Outros': 'other'
    };

    const category = categoryMap[values[0]] || 'other';

    conducts.push({
      id: `conduct_${Date.now()}_${index}`,
      category,
      name: values[1],
      details: values[2] || undefined,
      duration: values[3] || undefined,
      equipment: values[4] || undefined,
      notes: values[5] || undefined
    });
  });

  return conducts;
}

