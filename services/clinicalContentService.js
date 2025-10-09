/**
 * Serviço de CRUD para Conteúdo Clínico
 * Gerencia protocolos, exercícios, avaliações e materiais
 */
import { CLINICAL_PROTOCOLS, EXERCISES_LIBRARY, SPECIALIZED_ASSESSMENTS, CLINICAL_MATERIALS, } from '../data/clinicalData';
// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    PROTOCOLS: 'clinicalContent_protocols',
    EXERCISES: 'clinicalContent_exercises',
    ASSESSMENTS: 'clinicalContent_assessments',
    MATERIALS: 'clinicalContent_materials',
};
// ===== HELPER FUNCTIONS =====
function loadFromStorage(key, defaultData) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    }
    catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
    }
    return defaultData;
}
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// ===== PROTOCOLS CRUD =====
export class ProtocolsService {
    constructor() {
        this.protocolAssignments = new Map(); // protocolId -> patientIds[]
        this.protocols = loadFromStorage(STORAGE_KEYS.PROTOCOLS, CLINICAL_PROTOCOLS);
        this.loadAssignments();
    }
    loadAssignments() {
        try {
            const stored = localStorage.getItem('protocol_assignments');
            if (stored) {
                const data = JSON.parse(stored);
                this.protocolAssignments = new Map(data);
            }
        }
        catch (error) {
            console.error('Error loading protocol assignments:', error);
        }
    }
    saveAssignments() {
        try {
            const data = Array.from(this.protocolAssignments.entries());
            localStorage.setItem('protocol_assignments', JSON.stringify(data));
        }
        catch (error) {
            console.error('Error saving protocol assignments:', error);
        }
    }
    getAll() {
        return [...this.protocols];
    }
    getById(id) {
        return this.protocols.find(p => p.id === id);
    }
    getBySpecialty(specialty) {
        return this.protocols.filter(p => p.specialty === specialty);
    }
    create(protocol) {
        const newProtocol = {
            ...protocol,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.protocols.push(newProtocol);
        saveToStorage(STORAGE_KEYS.PROTOCOLS, this.protocols);
        return newProtocol;
    }
    update(id, updates) {
        const index = this.protocols.findIndex(p => p.id === id);
        if (index === -1)
            return null;
        this.protocols[index] = {
            ...this.protocols[index],
            ...updates,
            id, // Preserve ID
            updatedAt: new Date().toISOString(),
        };
        saveToStorage(STORAGE_KEYS.PROTOCOLS, this.protocols);
        return this.protocols[index];
    }
    delete(id) {
        const index = this.protocols.findIndex(p => p.id === id);
        if (index === -1)
            return false;
        this.protocols.splice(index, 1);
        saveToStorage(STORAGE_KEYS.PROTOCOLS, this.protocols);
        return true;
    }
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.protocols.filter(p => p.title.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
    // ===== MÉTODOS DE ATRIBUIÇÃO DE PROTOCOLOS =====
    assignToPatient(protocolId, patientId) {
        const protocol = this.getById(protocolId);
        if (!protocol)
            return false;
        const currentAssignments = this.protocolAssignments.get(protocolId) || [];
        if (!currentAssignments.includes(patientId)) {
            currentAssignments.push(patientId);
            this.protocolAssignments.set(protocolId, currentAssignments);
            this.saveAssignments();
        }
        return true;
    }
    unassignFromPatient(protocolId, patientId) {
        const currentAssignments = this.protocolAssignments.get(protocolId) || [];
        const updatedAssignments = currentAssignments.filter(id => id !== patientId);
        this.protocolAssignments.set(protocolId, updatedAssignments);
        this.saveAssignments();
        return true;
    }
    getAssignedPatients(protocolId) {
        return this.protocolAssignments.get(protocolId) || [];
    }
    getProtocolsForPatient(patientId) {
        const assignedProtocolIds = [];
        for (const [protocolId, patientIds] of this.protocolAssignments.entries()) {
            if (patientIds.includes(patientId)) {
                assignedProtocolIds.push(protocolId);
            }
        }
        return assignedProtocolIds
            .map(id => this.getById(id))
            .filter(protocol => protocol !== undefined);
    }
    isAssignedToPatient(protocolId, patientId) {
        const assignedPatients = this.protocolAssignments.get(protocolId) || [];
        return assignedPatients.includes(patientId);
    }
    getAssignmentStats() {
        const totalAssignments = Array.from(this.protocolAssignments.values())
            .reduce((sum, patientIds) => sum + patientIds.length, 0);
        const protocolsWithAssignments = Array.from(this.protocolAssignments.keys()).length;
        return {
            totalAssignments,
            protocolsWithAssignments,
            totalProtocols: this.protocols.length,
        };
    }
}
// ===== EXERCISES CRUD =====
export class ExercisesService {
    constructor() {
        this.exercises = loadFromStorage(STORAGE_KEYS.EXERCISES, EXERCISES_LIBRARY);
    }
    getAll() {
        return [...this.exercises];
    }
    getById(id) {
        return this.exercises.find(e => e.id === id);
    }
    getBySpecialty(specialty) {
        return this.exercises.filter(e => e.specialty.includes(specialty));
    }
    getByCategory(category) {
        return this.exercises.filter(e => e.category === category);
    }
    create(exercise) {
        const newExercise = {
            ...exercise,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.exercises.push(newExercise);
        saveToStorage(STORAGE_KEYS.EXERCISES, this.exercises);
        return newExercise;
    }
    update(id, updates) {
        const index = this.exercises.findIndex(e => e.id === id);
        if (index === -1)
            return null;
        this.exercises[index] = {
            ...this.exercises[index],
            ...updates,
            id,
            updatedAt: new Date().toISOString(),
        };
        saveToStorage(STORAGE_KEYS.EXERCISES, this.exercises);
        return this.exercises[index];
    }
    delete(id) {
        const index = this.exercises.findIndex(e => e.id === id);
        if (index === -1)
            return false;
        this.exercises.splice(index, 1);
        saveToStorage(STORAGE_KEYS.EXERCISES, this.exercises);
        return true;
    }
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.exercises.filter(e => e.name.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery) ||
            e.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
}
// ===== ASSESSMENTS CRUD =====
export class AssessmentsService {
    constructor() {
        this.assessments = loadFromStorage(STORAGE_KEYS.ASSESSMENTS, SPECIALIZED_ASSESSMENTS);
    }
    getAll() {
        return [...this.assessments];
    }
    getById(id) {
        return this.assessments.find(a => a.id === id);
    }
    getBySpecialty(specialty) {
        return this.assessments.filter(a => a.specialty === specialty);
    }
    create(assessment) {
        const newAssessment = {
            ...assessment,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.assessments.push(newAssessment);
        saveToStorage(STORAGE_KEYS.ASSESSMENTS, this.assessments);
        return newAssessment;
    }
    update(id, updates) {
        const index = this.assessments.findIndex(a => a.id === id);
        if (index === -1)
            return null;
        this.assessments[index] = {
            ...this.assessments[index],
            ...updates,
            id,
            updatedAt: new Date().toISOString(),
        };
        saveToStorage(STORAGE_KEYS.ASSESSMENTS, this.assessments);
        return this.assessments[index];
    }
    delete(id) {
        const index = this.assessments.findIndex(a => a.id === id);
        if (index === -1)
            return false;
        this.assessments.splice(index, 1);
        saveToStorage(STORAGE_KEYS.ASSESSMENTS, this.assessments);
        return true;
    }
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.assessments.filter(a => a.title.toLowerCase().includes(lowerQuery) ||
            a.description.toLowerCase().includes(lowerQuery) ||
            a.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
}
// ===== MATERIALS CRUD =====
export class MaterialsService {
    constructor() {
        this.materials = loadFromStorage(STORAGE_KEYS.MATERIALS, CLINICAL_MATERIALS);
    }
    getAll() {
        return [...this.materials];
    }
    getById(id) {
        return this.materials.find(m => m.id === id);
    }
    getBySpecialty(specialty) {
        return this.materials.filter(m => m.specialty === specialty);
    }
    getByType(type) {
        return this.materials.filter(m => m.type === type);
    }
    create(material) {
        const newMaterial = {
            ...material,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.materials.push(newMaterial);
        saveToStorage(STORAGE_KEYS.MATERIALS, this.materials);
        return newMaterial;
    }
    update(id, updates) {
        const index = this.materials.findIndex(m => m.id === id);
        if (index === -1)
            return null;
        this.materials[index] = {
            ...this.materials[index],
            ...updates,
            id,
            updatedAt: new Date().toISOString(),
        };
        saveToStorage(STORAGE_KEYS.MATERIALS, this.materials);
        return this.materials[index];
    }
    delete(id) {
        const index = this.materials.findIndex(m => m.id === id);
        if (index === -1)
            return false;
        this.materials.splice(index, 1);
        saveToStorage(STORAGE_KEYS.MATERIALS, this.materials);
        return true;
    }
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.materials.filter(m => m.title.toLowerCase().includes(lowerQuery) ||
            m.description.toLowerCase().includes(lowerQuery) ||
            m.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
}
// ===== UNIFIED SERVICE =====
export class ClinicalContentService {
    constructor() {
        this.protocols = new ProtocolsService();
        this.exercises = new ExercisesService();
        this.assessments = new AssessmentsService();
        this.materials = new MaterialsService();
    }
    getStatistics() {
        const protocols = this.protocols.getAll();
        const exercises = this.exercises.getAll();
        const assessments = this.assessments.getAll();
        const materials = this.materials.getAll();
        return {
            totalProtocols: protocols.length,
            totalExercises: exercises.length,
            totalAssessments: assessments.length,
            totalMaterials: materials.length,
            bySpecialty: {
                esportiva: {
                    protocols: protocols.filter(p => p.specialty === 'esportiva').length,
                    exercises: exercises.filter(e => e.specialty.includes('esportiva')).length,
                    assessments: assessments.filter(a => a.specialty === 'esportiva').length,
                    materials: materials.filter(m => m.specialty === 'esportiva').length,
                },
                posOperatoria: {
                    protocols: protocols.filter(p => p.specialty === 'pos-operatoria').length,
                    exercises: exercises.filter(e => e.specialty.includes('pos-operatoria')).length,
                    assessments: assessments.filter(a => a.specialty === 'pos-operatoria').length,
                    materials: materials.filter(m => m.specialty === 'pos-operatoria').length,
                },
                geriatrica: {
                    protocols: protocols.filter(p => p.specialty === 'geriatrica').length,
                    exercises: exercises.filter(e => e.specialty.includes('geriatrica')).length,
                    assessments: assessments.filter(a => a.specialty === 'geriatrica').length,
                    materials: materials.filter(m => m.specialty === 'geriatrica').length,
                },
            },
            totalImages: protocols.reduce((sum, p) => sum + p.images.length, 0) +
                exercises.reduce((sum, e) => sum + e.images.length, 0) +
                assessments.reduce((sum, a) => sum + a.images.length, 0) +
                materials.reduce((sum, m) => sum + m.images.length, 0),
        };
    }
    searchAll(query) {
        return {
            protocols: this.protocols.search(query),
            exercises: this.exercises.search(query),
            assessments: this.assessments.search(query),
            materials: this.materials.search(query),
        };
    }
    resetToDefaults() {
        localStorage.removeItem(STORAGE_KEYS.PROTOCOLS);
        localStorage.removeItem(STORAGE_KEYS.EXERCISES);
        localStorage.removeItem(STORAGE_KEYS.ASSESSMENTS);
        localStorage.removeItem(STORAGE_KEYS.MATERIALS);
        this.protocols = new ProtocolsService();
        this.exercises = new ExercisesService();
        this.assessments = new AssessmentsService();
        this.materials = new MaterialsService();
    }
}
// Export singleton instance
export const clinicalContentService = new ClinicalContentService();
export default clinicalContentService;
