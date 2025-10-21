import { SoapNote } from '../types';
import { db } from './mockDb';
import { eventService } from './eventService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock data com métricas para desenvolvimento
const MOCK_SOAP_NOTES_WITH_METRICS: SoapNote[] = [
    {
        id: 'note_001',
        patientId: 'patient_001',
        therapist: 'Dr. Roberto',
        date: '15/01/2025',
        subjective: 'Paciente relata dor lombar intensa (8/10) que irradia para perna direita. Dificuldade para sentar por mais de 30 minutos.',
        objective: 'Avaliação inicial: Dor lombar com irradiação ciática. Amplitude de movimento limitada. Força muscular reduzida.',
        assessment: 'Lombalgia com ciatalgia. Necessita tratamento fisioterapêutico para alívio da dor e melhora da funcionalidade.',
        plan: 'Iniciar protocolo de tratamento com 12 sessões. Exercícios de fortalecimento e alongamento. Orientações posturais.',
        painScale: 8,
        bodyParts: ['Lombar', 'Perna Direita'],
        metricResults: [
            { metricId: 'metric_001', value: 8 }, // EVA
            { metricId: 'metric_002', value: 45 }, // ROM
            { metricId: 'metric_003', value: 8 }   // Força
        ]
    },
    {
        id: 'note_002',
        patientId: 'patient_001',
        therapist: 'Dr. Roberto',
        date: '20/01/2025',
        subjective: 'Melhora significativa da dor. Paciente relata dor reduzida para 5/10. Consegue sentar por 1 hora sem desconforto.',
        objective: 'Boa evolução. Amplitude de movimento melhorada. Força muscular em progressão.',
        assessment: 'Resposta positiva ao tratamento. Dor em regressão. Funcionalidade em melhora.',
        plan: 'Continuar protocolo. Intensificar exercícios de fortalecimento. Manter orientações posturais.',
        painScale: 5,
        bodyParts: ['Lombar'],
        metricResults: [
            { metricId: 'metric_001', value: 5 }, // EVA
            { metricId: 'metric_002', value: 65 }, // ROM
            { metricId: 'metric_003', value: 12 }  // Força
        ]
    },
    {
        id: 'note_003',
        patientId: 'patient_001',
        therapist: 'Dr. Roberto',
        date: '25/01/2025',
        subjective: 'Dor mínima (2/10). Paciente relata grande melhora funcional. Consegue realizar atividades diárias sem limitação.',
        objective: 'Excelente evolução. Amplitude de movimento quase normal. Força muscular adequada.',
        assessment: 'Tratamento bem-sucedido. Dor controlada. Funcionalidade restaurada.',
        plan: 'Finalizar protocolo. Exercícios de manutenção. Alta em breve.',
        painScale: 2,
        bodyParts: [],
        metricResults: [
            { metricId: 'metric_001', value: 2 }, // EVA
            { metricId: 'metric_002', value: 88 }, // ROM
            { metricId: 'metric_003', value: 16 }  // Força
        ]
    }
];

export const getNotesByPatientId = async (patientId: string): Promise<SoapNote[]> => {
    await delay(300);
    
    // Se for o paciente mock, retornar dados mock
    if (patientId === 'patient_001') {
        return [...MOCK_SOAP_NOTES_WITH_METRICS];
    }
    
    return [...db.getSoapNotes()]
        .filter(n => n.patientId === patientId)
        .sort((a,b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
};

export const addNote = async (patientId: string, noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>): Promise<SoapNote> => {
    await delay(400);
    const newNote: SoapNote = {
        id: `note_${Date.now()}`,
        patientId,
        therapist: 'Dr. Roberto', // Assuming logged in user
        ...noteData
    };
    db.saveSoapNote(newNote);
    eventService.emit('notes:changed');
    return newNote;
};

export const getSoapNoteById = async (id: string): Promise<SoapNote | undefined> => {
    await delay(300);
    return db.getSoapNotes().find(note => note.id === id);
};

export const saveNote = async (noteData: Partial<SoapNote> & { patientId: string }): Promise<SoapNote> => {
    await delay(300);
    let noteToSave: SoapNote;
    if (noteData.id) {
        const existingNote = db.getSoapNotes().find(n => n.id === noteData.id);
        noteToSave = { ...existingNote, ...noteData } as SoapNote;
    } else {
        noteToSave = {
            id: `note_${Date.now()}`,
            therapist: 'Dr. Roberto',
            date: new Date().toLocaleDateString('pt-BR'),
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
            ...noteData,
        };
    }
    db.saveSoapNote(noteToSave);
    eventService.emit('notes:changed');
    return noteToSave;
};