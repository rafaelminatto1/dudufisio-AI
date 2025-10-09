// services/integratedExerciseService.ts
import React from 'react';
import { exerciseService } from './exerciseService';
import { getExercises } from '../scripts/integrate-clinical-content-to-db';
import { exerciseProtocolService } from './exerciseProtocolService';
// Função para converter exercícios do sistema clínico para o formato do sistema
function convertClinicalExerciseToSystemFormat(clinicalExercise) {
    return {
        id: `clinical-${clinicalExercise.id}`,
        name: clinicalExercise.name,
        description: clinicalExercise.description,
        category: mapClinicalCategoryToSystemCategory(clinicalExercise.specialty),
        bodyParts: clinicalExercise.targetMuscles || [],
        difficulty: mapDifficultyLevel(clinicalExercise.difficulty),
        equipment: clinicalExercise.equipment || ['Corpo'],
        instructions: clinicalExercise.instructions || [],
        media: {
            videoUrl: clinicalExercise.videoUrl || '',
            thumbnailUrl: clinicalExercise.imageUrl || '',
            duration: clinicalExercise.duration || 300
        },
        contraindications: clinicalExercise.contraindications || [],
        indications: clinicalExercise.benefits || [],
        modifications: clinicalExercise.variations ? {
            easier: clinicalExercise.variations.find((v) => v.type === 'easier')?.description || '',
            harder: clinicalExercise.variations.find((v) => v.type === 'harder')?.description || ''
        } : {},
        // Campos adicionais para integração
        tags: clinicalExercise.tags || [],
        clinicalId: clinicalExercise.id,
        specialty: clinicalExercise.specialty,
        linkedProtocols: exerciseProtocolService.getProtocolsForExercise(clinicalExercise.id)
    };
}
// Mapear especialidades clínicas para categorias do sistema
function mapClinicalCategoryToSystemCategory(specialty) {
    const categoryMap = {
        'esportiva': 'Fisioterapia Esportiva',
        'pos-operatoria': 'Fisioterapia Pós-Operatória',
        'geriatrica': 'Fisioterapia Gerontológica'
    };
    return categoryMap[specialty] || 'Geral';
}
// Mapear níveis de dificuldade
function mapDifficultyLevel(difficulty) {
    const difficultyMap = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3,
        'expert': 4,
        'professional': 5
    };
    return difficultyMap[difficulty] || 1;
}
// Serviço integrado que combina exercícios do sistema e conteúdo clínico
export class IntegratedExerciseService {
    constructor() {
        this.clinicalExercises = [];
        this.systemExercises = [];
        this.loadClinicalExercises();
        this.loadSystemExercises();
    }
    async loadClinicalExercises() {
        try {
            const clinicalData = getExercises();
            this.clinicalExercises = clinicalData.map(convertClinicalExerciseToSystemFormat);
            console.log('✅ Exercícios clínicos carregados:', this.clinicalExercises.length);
        }
        catch (error) {
            console.error('❌ Erro ao carregar exercícios clínicos:', error);
            this.clinicalExercises = [];
        }
    }
    async loadSystemExercises() {
        try {
            this.systemExercises = exerciseService.getMockExercises();
            console.log('✅ Exercícios do sistema carregados:', this.systemExercises.length);
        }
        catch (error) {
            console.error('❌ Erro ao carregar exercícios do sistema:', error);
            this.systemExercises = [];
        }
    }
    // Obter todos os exercícios (sistema + clínico)
    getAllExercises() {
        return [...this.systemExercises, ...this.clinicalExercises];
    }
    // Obter exercícios por categoria
    getExercisesByCategory(category) {
        return this.getAllExercises().filter(ex => ex.category === category);
    }
    // Obter categorias únicas
    getCategories() {
        const allExercises = this.getAllExercises();
        const categories = [...new Set(allExercises.map(ex => ex.category))];
        return categories.sort();
    }
    // Obter partes do corpo únicas
    getBodyParts() {
        const allExercises = this.getAllExercises();
        const bodyParts = [...new Set(allExercises.flatMap(ex => ex.bodyParts))];
        return bodyParts.sort();
    }
    // Obter equipamentos únicos
    getEquipment() {
        const allExercises = this.getAllExercises();
        const equipment = [...new Set(allExercises.flatMap(ex => ex.equipment))];
        return equipment.sort();
    }
    // Buscar exercícios
    searchExercises(query, filters) {
        let exercises = this.getAllExercises();
        // Busca por texto
        if (query) {
            const searchQuery = query.toLowerCase();
            exercises = exercises.filter(exercise => exercise.name.toLowerCase().includes(searchQuery) ||
                exercise.description.toLowerCase().includes(searchQuery) ||
                exercise.tags?.some(tag => tag.toLowerCase().includes(searchQuery)));
        }
        // Filtros
        if (filters?.category) {
            exercises = exercises.filter(exercise => exercise.category === filters.category);
        }
        if (filters?.difficulty) {
            exercises = exercises.filter(exercise => exercise.difficulty <= filters.difficulty);
        }
        if (filters?.bodyParts && filters.bodyParts.length > 0) {
            exercises = exercises.filter(exercise => filters.bodyParts.some(part => exercise.bodyParts.includes(part)));
        }
        if (filters?.equipment && filters.equipment.length > 0) {
            exercises = exercises.filter(exercise => filters.equipment.some(equip => exercise.equipment.includes(equip)));
        }
        if (filters?.specialty) {
            exercises = exercises.filter(exercise => exercise.specialty === filters.specialty);
        }
        return exercises;
    }
    // Obter exercícios vinculados a protocolos
    getExercisesLinkedToProtocols() {
        return this.getAllExercises().filter(ex => ex.linkedProtocols && ex.linkedProtocols.length > 0);
    }
    // Obter exercícios por especialidade
    getExercisesBySpecialty(specialty) {
        return this.getAllExercises().filter(ex => ex.specialty === specialty);
    }
    // Obter estatísticas
    getStatistics() {
        const allExercises = this.getAllExercises();
        const categories = this.getCategories();
        const bodyParts = this.getBodyParts();
        const equipment = this.getEquipment();
        return {
            totalExercises: allExercises.length,
            systemExercises: this.systemExercises.length,
            clinicalExercises: this.clinicalExercises.length,
            totalCategories: categories.length,
            totalBodyParts: bodyParts.length,
            totalEquipment: equipment.length,
            exercisesWithProtocols: this.getExercisesLinkedToProtocols().length,
            specialties: {
                esportiva: this.getExercisesBySpecialty('esportiva').length,
                'pos-operatoria': this.getExercisesBySpecialty('pos-operatoria').length,
                geriatrica: this.getExercisesBySpecialty('geriatrica').length
            }
        };
    }
    // Refresh dados
    async refresh() {
        await this.loadClinicalExercises();
        await this.loadSystemExercises();
    }
}
// Instância singleton
export const integratedExerciseService = new IntegratedExerciseService();
// Hook personalizado para usar o serviço integrado
export function useIntegratedExercises() {
    const [exercises, setExercises] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        loadExercises();
    }, []);
    const loadExercises = async () => {
        try {
            setLoading(true);
            setError(null);
            await integratedExerciseService.refresh();
            setExercises(integratedExerciseService.getAllExercises());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar exercícios');
        }
        finally {
            setLoading(false);
        }
    };
    return {
        exercises,
        categories: integratedExerciseService.getCategories(),
        bodyParts: integratedExerciseService.getBodyParts(),
        equipment: integratedExerciseService.getEquipment(),
        statistics: integratedExerciseService.getStatistics(),
        loading,
        error,
        refresh: loadExercises,
        searchExercises: integratedExerciseService.searchExercises.bind(integratedExerciseService),
        getExercisesByCategory: integratedExerciseService.getExercisesByCategory.bind(integratedExerciseService),
        getExercisesBySpecialty: integratedExerciseService.getExercisesBySpecialty.bind(integratedExerciseService),
        getExercisesLinkedToProtocols: integratedExerciseService.getExercisesLinkedToProtocols.bind(integratedExerciseService)
    };
}
