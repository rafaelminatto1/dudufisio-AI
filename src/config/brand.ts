/**
 * Configuração oficial da marca MoocaFisio
 * 
 * Este arquivo centraliza todas as constantes relacionadas à identidade
 * visual e informações da marca do sistema.
 * 
 * ⚠️ IMPORTANTE: NUNCA use "DuduFisio" ou "FisioFlow" - sempre use MoocaFisio
 */

export const BRAND = {
  /** Nome completo da marca */
  name: 'MoocaFisio',
  
  /** Nome completo com descrição */
  fullName: 'MoocaFisio - Gestão de Clínicas de Fisioterapia',
  
  /** Slogan/tagline da marca */
  tagline: 'Gestão inteligente para fisioterapeutas',
  
  /** URL do site oficial */
  url: 'https://moocafisio.com.br',
  
  /** Domínio base */
  domain: 'moocafisio.com.br',
  
  /** Informações de suporte */
  support: {
    email: 'suporte@moocafisio.com.br',
    noreply: 'noreply@moocafisio.com.br',
    whatsapp: '+55 (11) 99999-9999', // Atualizar com número real
  },
  
  /** Cores da marca */
  colors: {
    primary: '#3b82f6',      // Azul principal
    secondary: '#818cf8',    // Azul claro
    accent: '#06b6d4',       // Ciano
  },
  
  /** Meta informações para SEO */
  meta: {
    description: 'Sistema completo de gestão para clínicas de fisioterapia com inteligência artificial integrada',
    keywords: ['fisioterapia', 'gestão clínica', 'prontuário eletrônico', 'agenda médica', 'IA'],
  },
  
  /** Redes sociais */
  social: {
    facebook: '',  // Adicionar quando disponível
    instagram: '', // Adicionar quando disponível
    linkedin: '',  // Adicionar quando disponível
  }
} as const;

/** Tipo TypeScript derivado das constantes da marca */
export type Brand = typeof BRAND;

