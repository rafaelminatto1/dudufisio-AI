/**
 * Script para Integrar Conteúdo Clínico ao Mock Database
 * Adiciona os conteúdos gerados ao mockDb.ts
 */
import { CLINICAL_PROTOCOLS, EXERCISES_LIBRARY, SPECIALIZED_ASSESSMENTS, CLINICAL_MATERIALS, CLINICAL_LIBRARY, EDUCATIONAL_CONTENT } from './populate-clinical-content';
// Este script pode ser usado para integrar os dados ao sistema
// Por enquanto, vamos criar funções que podem ser importadas
export function getClinicalProtocols() {
    return CLINICAL_PROTOCOLS;
}
export function getExercises() {
    return EXERCISES_LIBRARY;
}
export function getAssessments() {
    return SPECIALIZED_ASSESSMENTS;
}
export function getClinicalMaterials() {
    return CLINICAL_MATERIALS;
}
export function getClinicalLibrary() {
    return CLINICAL_LIBRARY;
}
export function getEducationalContent() {
    return EDUCATIONAL_CONTENT;
}
export function getAllClinicalContent() {
    return {
        protocols: CLINICAL_PROTOCOLS,
        exercises: EXERCISES_LIBRARY,
        assessments: SPECIALIZED_ASSESSMENTS,
        materials: CLINICAL_MATERIALS,
        library: CLINICAL_LIBRARY,
        educational: EDUCATIONAL_CONTENT
    };
}
// Função para filtrar por especialidade
export function getContentBySpecialty(specialty) {
    return {
        protocols: CLINICAL_PROTOCOLS.filter(p => p.specialty === specialty),
        exercises: EXERCISES_LIBRARY.filter(e => e.specialty.includes(specialty)),
        assessments: SPECIALIZED_ASSESSMENTS.filter(a => a.specialty === specialty),
        materials: CLINICAL_MATERIALS.filter(m => m.specialty === specialty),
        library: CLINICAL_LIBRARY.filter(l => l.specialty === specialty),
        educational: EDUCATIONAL_CONTENT.filter(e => e.specialty === specialty)
    };
}
// Função para buscar por tags
export function searchByTags(tags) {
    const results = {
        protocols: [],
        exercises: [],
        assessments: [],
        materials: [],
        library: [],
        educational: []
    };
    results.protocols = CLINICAL_PROTOCOLS.filter(p => tags.some(tag => p.tags.includes(tag)));
    results.exercises = EXERCISES_LIBRARY.filter(e => tags.some(tag => e.tags.includes(tag)));
    results.assessments = SPECIALIZED_ASSESSMENTS.filter(a => tags.some(tag => a.tags.includes(tag)));
    results.materials = CLINICAL_MATERIALS.filter(m => tags.some(tag => m.tags.includes(tag)));
    results.library = CLINICAL_LIBRARY.filter(l => tags.some(tag => l.keywords.includes(tag)));
    results.educational = EDUCATIONAL_CONTENT.filter(e => tags.some(tag => e.tags.includes(tag)));
    return results;
}
// Estatísticas
export function getStatistics() {
    return {
        totalProtocols: CLINICAL_PROTOCOLS.length,
        totalExercises: EXERCISES_LIBRARY.length,
        totalAssessments: SPECIALIZED_ASSESSMENTS.length,
        totalMaterials: CLINICAL_MATERIALS.length,
        totalLibraryItems: CLINICAL_LIBRARY.length,
        totalEducational: EDUCATIONAL_CONTENT.length,
        bySpecialty: {
            esportiva: {
                protocols: CLINICAL_PROTOCOLS.filter(p => p.specialty === 'esportiva').length,
                exercises: EXERCISES_LIBRARY.filter(e => e.specialty.includes('esportiva')).length
            },
            posOperatoria: {
                protocols: CLINICAL_PROTOCOLS.filter(p => p.specialty === 'pos-operatoria').length,
                exercises: EXERCISES_LIBRARY.filter(e => e.specialty.includes('pos-operatoria')).length
            },
            geriatrica: {
                protocols: CLINICAL_PROTOCOLS.filter(p => p.specialty === 'geriatrica').length,
                exercises: EXERCISES_LIBRARY.filter(e => e.specialty.includes('geriatrica')).length
            }
        },
        totalImages: CLINICAL_PROTOCOLS.reduce((sum, p) => sum + p.images.length, 0) +
            EXERCISES_LIBRARY.reduce((sum, e) => sum + e.images.length, 0) +
            SPECIALIZED_ASSESSMENTS.reduce((sum, a) => sum + a.images.length, 0)
    };
}
console.log('✅ Funções de integração de conteúdo clínico carregadas!');
console.log('📊 Estatísticas:', getStatistics());
