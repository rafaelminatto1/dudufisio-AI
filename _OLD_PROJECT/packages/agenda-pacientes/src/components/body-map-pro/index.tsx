/**
 * Body Map Professional - Exports
 *
 * Novo sistema de mapa de dor anatômico profissional
 */

// Componente principal
export { default as BodyMapProfessional } from './BodyMapProfessional';

// Componentes individuais
export { default as BodyMapSVG } from './BodyMapSVG';
export { default as BodyRegionPolygon } from './BodyRegionPolygon';
export { default as PainIntensityModal } from './PainIntensityModal';
export { default as PainIntensitySlider } from './PainIntensitySlider';
export { default as BodyMapComparison } from './BodyMapComparison';
export { BodyMapComparisonModal } from './BodyMapComparisonModal';

// Dados e tipos
export * from './body-regions-data';
export type { PainData } from './BodyMapSVG';
export type { PainModalData } from './PainIntensityModal';
