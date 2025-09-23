// Body Map Service - Mock implementation for development
import { BodyPoint } from '../types';

// Mock data storage (in real app, this would be Supabase)
let mockBodyPoints: BodyPoint[] = [
    {
        id: 'bp_1',
        patient_id: 'patient_1',
        x_position: 45,
        y_position: 25,
        body_side: 'front',
        pain_level: 7,
        pain_type: 'Dor muscular',
        description: 'Dor no ombro direito que piora com movimento',
        created_at: '2024-01-15T10:30:00Z',
        created_by: 'user_1'
    },
    {
        id: 'bp_2',
        patient_id: 'patient_1',
        x_position: 55,
        y_position: 45,
        body_side: 'front',
        pain_level: 5,
        pain_type: 'Dor articular',
        description: 'Rigidez articular no cotovelo',
        created_at: '2024-01-14T09:15:00Z',
        created_by: 'user_1'
    },
    {
        id: 'bp_3',
        patient_id: 'patient_1',
        x_position: 50,
        y_position: 35,
        body_side: 'back',
        pain_level: 8,
        pain_type: 'Dor crônica',
        description: 'Dor lombar constante, irradia para pernas',
        created_at: '2024-01-13T14:20:00Z',
        created_by: 'user_1'
    }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Buscar pontos do mapa corporal por ID do paciente
 */
export const getBodyPointsByPatientId = async (patientId: string): Promise<BodyPoint[]> => {
    await delay(300);

    return mockBodyPoints
        .filter(point => point.patient_id === patientId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Buscar ponto específico por ID
 */
export const getBodyPointById = async (id: string): Promise<BodyPoint | null> => {
    await delay(200);

    const point = mockBodyPoints.find(p => p.id === id);
    return point || null;
};

/**
 * Adicionar novo ponto no mapa corporal
 */
export const addBodyPoint = async (pointData: Omit<BodyPoint, 'id' | 'created_at'>): Promise<BodyPoint> => {
    await delay(400);

    const newPoint: BodyPoint = {
        ...pointData,
        id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
    };

    mockBodyPoints.unshift(newPoint);
    return newPoint;
};

/**
 * Atualizar ponto existente
 */
export const updateBodyPoint = async (id: string, pointData: Partial<BodyPoint>): Promise<BodyPoint> => {
    await delay(400);

    const index = mockBodyPoints.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error('Ponto não encontrado');
    }

    const updatedPoint = {
        ...mockBodyPoints[index],
        ...pointData,
        id, // Garantir que o ID não mude
        created_at: mockBodyPoints[index].created_at // Manter data original
    };

    mockBodyPoints[index] = updatedPoint;
    return updatedPoint;
};

/**
 * Deletar ponto do mapa corporal
 */
export const deleteBodyPoint = async (id: string): Promise<void> => {
    await delay(300);

    const index = mockBodyPoints.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error('Ponto não encontrado');
    }

    mockBodyPoints.splice(index, 1);
};

/**
 * Buscar pontos por faixa de datas
 */
export const getBodyPointsByDateRange = async (
    patientId: string,
    startDate: string,
    endDate: string
): Promise<BodyPoint[]> => {
    await delay(350);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return mockBodyPoints
        .filter(point => {
            if (point.patient_id !== patientId) return false;
            const pointDate = new Date(point.created_at);
            return pointDate >= start && pointDate <= end;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Buscar pontos por lado do corpo
 */
export const getBodyPointsBySide = async (
    patientId: string,
    side: 'front' | 'back'
): Promise<BodyPoint[]> => {
    await delay(250);

    return mockBodyPoints
        .filter(point => point.patient_id === patientId && point.body_side === side)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Buscar pontos por nível de dor
 */
export const getBodyPointsByPainLevel = async (
    patientId: string,
    minLevel: number,
    maxLevel: number
): Promise<BodyPoint[]> => {
    await delay(300);

    return mockBodyPoints
        .filter(point =>
            point.patient_id === patientId &&
            point.pain_level >= minLevel &&
            point.pain_level <= maxLevel
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Obter estatísticas dos pontos de dor
 */
export const getBodyMapStatistics = async (patientId: string): Promise<{
    totalPoints: number;
    averagePainLevel: number;
    pointsByPainLevel: Record<string, number>;
    pointsBySide: Record<'front' | 'back', number>;
    recentPoints: BodyPoint[];
}> => {
    await delay(400);

    const patientPoints = mockBodyPoints.filter(point => point.patient_id === patientId);

    const totalPoints = patientPoints.length;
    const averagePainLevel = totalPoints > 0
        ? Math.round((patientPoints.reduce((sum, p) => sum + p.pain_level, 0) / totalPoints) * 10) / 10
        : 0;

    const pointsByPainLevel = {
        'leve': patientPoints.filter(p => p.pain_level <= 3).length,
        'moderada': patientPoints.filter(p => p.pain_level > 3 && p.pain_level <= 6).length,
        'intensa': patientPoints.filter(p => p.pain_level > 6 && p.pain_level <= 8).length,
        'severa': patientPoints.filter(p => p.pain_level > 8).length
    };

    const pointsBySide = {
        'front': patientPoints.filter(p => p.body_side === 'front').length,
        'back': patientPoints.filter(p => p.body_side === 'back').length
    };

    const recentPoints = patientPoints
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    return {
        totalPoints,
        averagePainLevel,
        pointsByPainLevel,
        pointsBySide,
        recentPoints
    };
};

/**
 * Exportar dados dos pontos para relatório
 */
export const exportBodyMapData = async (patientId: string): Promise<{
    patientId: string;
    exportDate: string;
    totalPoints: number;
    points: BodyPoint[];
}> => {
    await delay(500);

    const points = await getBodyPointsByPatientId(patientId);

    return {
        patientId,
        exportDate: new Date().toISOString(),
        totalPoints: points.length,
        points
    };
};

/**
 * Buscar evolução da dor ao longo do tempo
 */
export const getPainEvolution = async (patientId: string): Promise<{
    date: string;
    averagePainLevel: number;
    pointCount: number;
}[]> => {
    await delay(350);

    const patientPoints = mockBodyPoints.filter(point => point.patient_id === patientId);

    // Agrupar por data
    const pointsByDate = patientPoints.reduce((acc, point) => {
        const date = new Date(point.created_at).toLocaleDateString('pt-BR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(point);
        return acc;
    }, {} as Record<string, BodyPoint[]>);

    // Calcular evolução
    return Object.entries(pointsByDate)
        .map(([date, points]) => ({
            date,
            averagePainLevel: Math.round((points.reduce((sum, p) => sum + p.pain_level, 0) / points.length) * 10) / 10,
            pointCount: points.length
        }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());
};

/*
TODO: Implementar com Supabase real

import { supabase } from '../lib/supabase';

export const getBodyPointsByPatientId = async (patientId: string): Promise<BodyPoint[]> => {
    const { data, error } = await supabase
        .from('body_points')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const addBodyPoint = async (pointData: Omit<BodyPoint, 'id' | 'created_at'>): Promise<BodyPoint> => {
    const { data, error } = await supabase
        .from('body_points')
        .insert(pointData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// ... outras funções similares
*/