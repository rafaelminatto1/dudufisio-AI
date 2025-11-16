/**
 * Session Evolution Layouts
 *
 * 3 diferentes layouts para a página de evolução de sessão:
 * - Layout A: Dashboard com Cards (Recomendado para desktop e tablets)
 * - Layout B: 2 Colunas + Sidebar (Otimizado para desktop e iPad landscape)
 * - Layout C: Accordion Mobile-First (Perfeito para iPhone e dispositivos móveis)
 */

export { SessionLayoutA_Cards } from './SessionLayoutA_Cards';
export { SessionLayoutB_Columns } from './SessionLayoutB_Columns';
export { SessionLayoutC_Accordion } from './SessionLayoutC_Accordion';

export type SessionLayoutType = 'cards' | 'columns' | 'accordion';
