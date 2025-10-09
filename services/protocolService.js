import { mockProtocols } from '../data/mockExerciseLibrary';
import { generateClinicalMaterialContent } from './geminiService';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getProtocolSuggestions = async (diagnosis) => {
    await delay(300);
    const lowerDiagnosis = diagnosis.toLowerCase();
    // Simple mock search logic
    return mockProtocols.filter(p => p.name.toLowerCase().includes(lowerDiagnosis) ||
        p.description.toLowerCase().includes(lowerDiagnosis) ||
        (lowerDiagnosis.includes('lca') && p.id.includes('lca')) ||
        (lowerDiagnosis.includes('ombro') && p.id.includes('ombro')) ||
        (lowerDiagnosis.includes('lombalgia') && p.id.includes('lombalgia')));
};
export const generateProtocolContent = async (protocol) => {
    // Re-using existing Gemini service function
    return generateClinicalMaterialContent({
        nome_material: protocol.name,
        tipo_material: 'Protocolo Clínico',
    });
};
