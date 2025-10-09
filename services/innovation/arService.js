import { randomUUID } from 'crypto';
export class AugmentedRealityService {
    async generateTreatmentOverlay(request) {
        const { patientId, bodyRegion, goals } = request;
        const baseInstructions = goals.map((goal) => `Destacar área relevante para o objetivo: ${goal}.`);
        const frames = Array.from({ length: 3 }).map((_, index) => ({
            id: randomUUID(),
            sequence: index + 1,
            description: `Frame de orientação ${index + 1} focado em ${bodyRegion === 'upper' ? 'tronco e membros superiores' : bodyRegion === 'lower' ? 'quadril e membros inferiores' : 'cadeia completa'}.`,
            keypoints: [
                { joint: 'shoulder_left', x: 0.42, y: 0.18, confidence: 0.94 },
                { joint: 'shoulder_right', x: 0.58, y: 0.18, confidence: 0.92 },
            ],
            instructions: baseInstructions.join(' '),
        }));
        return {
            sessionId: randomUUID(),
            frames,
            summary: `Projeção AR para paciente ${patientId} com foco em ${bodyRegion}.`,
        };
    }
}
export const augmentedRealityService = new AugmentedRealityService();
