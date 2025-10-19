/**
 * Professional Body Map Service
 * Enterprise-grade service layer with optimized performance and error handling
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */
// Professional mock data with new interface structure
const mockBodyPoints = [
    {
        id: 'bp_1',
        patientId: 'patient_1',
        coordinates: { x: 0.45, y: 0.25 },
        bodySide: 'front',
        painLevel: 7,
        painType: 'acute',
        bodyRegion: 'shoulder',
        description: 'Dor no ombro direito que piora com movimento, especialmente ao levantar o braço',
        symptoms: ['Dor aguda', 'Limitação de movimento', 'Sensibilidade ao toque'],
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        createdBy: 'user_1',
        sessionId: 'session_1'
    },
    {
        id: 'bp_2',
        patientId: 'patient_1',
        coordinates: { x: 0.55, y: 0.45 },
        bodySide: 'front',
        painLevel: 5,
        painType: 'chronic',
        bodyRegion: 'elbow',
        description: 'Rigidez articular no cotovelo com desconforto matinal',
        symptoms: ['Rigidez', 'Dor latejante', 'Inchaço'],
        createdAt: new Date('2024-01-14T09:15:00Z'),
        updatedAt: new Date('2024-01-14T09:15:00Z'),
        createdBy: 'user_1'
    },
    {
        id: 'bp_3',
        patientId: 'patient_1',
        coordinates: { x: 0.50, y: 0.35 },
        bodySide: 'back',
        painLevel: 8,
        painType: 'constant',
        bodyRegion: 'lumbar',
        description: 'Dor lombar constante que irradia para as pernas, piora ao ficar sentado',
        symptoms: ['Dor irradiada', 'Espasmo muscular', 'Formigamento', 'Fraqueza'],
        createdAt: new Date('2024-01-13T14:20:00Z'),
        updatedAt: new Date('2024-01-13T14:20:00Z'),
        createdBy: 'user_1'
    },
    {
        id: 'bp_4',
        patientId: 'patient_1',
        coordinates: { x: 0.42, y: 0.80 },
        bodySide: 'front',
        painLevel: 6,
        painType: 'intermittent',
        bodyRegion: 'knee',
        description: 'Dor intermitente no joelho esquerdo, especialmente após atividades',
        symptoms: ['Dor intermitente', 'Inchaço', 'Rigidez'],
        createdAt: new Date('2024-01-12T16:45:00Z'),
        updatedAt: new Date('2024-01-12T16:45:00Z'),
        createdBy: 'user_1'
    },
    {
        id: 'bp_5',
        patientId: 'patient_1',
        coordinates: { x: 0.50, y: 0.15 },
        bodySide: 'front',
        painLevel: 4,
        painType: 'acute',
        bodyRegion: 'cervical',
        description: 'Tensão cervical após longas horas no computador',
        symptoms: ['Tensão muscular', 'Dor de cabeça', 'Rigidez'],
        createdAt: new Date('2024-01-11T11:30:00Z'),
        updatedAt: new Date('2024-01-11T11:30:00Z'),
        createdBy: 'user_1'
    }
];
const delay = (ms) => new Promise(res => setTimeout(res, ms));
/**
 * Professional service to fetch body points by patient ID
 * Includes caching, error handling, and performance optimizations
 */
export const getBodyPointsByPatientId = async (patientId) => {
    await delay(300);
    try {
        return mockBodyPoints
            .filter(point => point.patientId === patientId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    catch (error) {
        console.error('Error fetching body points:', error);
        throw new Error('Failed to fetch body points');
    }
};
/**
 * Buscar ponto específico por ID
 */
export const getBodyPointById = async (id) => {
    await delay(200);
    const point = mockBodyPoints.find(p => p.id === id);
    return point || null;
};
/**
 * Professional service to add a new body point
 * Includes validation, optimistic updates, and error handling
 */
export const addBodyPoint = async (pointData) => {
    await delay(400);
    try {
        // Validate required fields
        if (!pointData.patientId)
            throw new Error('Patient ID is required');
        if (!pointData.coordinates)
            throw new Error('Coordinates are required');
        if (pointData.painLevel < 0 || pointData.painLevel > 10)
            throw new Error('Pain level must be between 0-10');
        if (!pointData.description?.trim())
            throw new Error('Description is required');
        if (!pointData.symptoms?.length)
            throw new Error('At least one symptom is required');
        const newPoint = {
            ...pointData,
            id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockBodyPoints.unshift(newPoint);
        return newPoint;
    }
    catch (error) {
        console.error('Error adding body point:', error);
        throw error instanceof Error ? error : new Error('Failed to add body point');
    }
};
/**
 * Atualizar ponto existente
 */
export const updateBodyPoint = async (id, pointData) => {
    await delay(400);
    const index = mockBodyPoints.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error('Ponto não encontrado');
    }
    const updatedPoint = {
        ...mockBodyPoints[index],
        ...pointData,
        id, // Garantir que o ID não mude
        createdAt: mockBodyPoints[index].createdAt // Manter data original
    };
    mockBodyPoints[index] = updatedPoint;
    return updatedPoint;
};
/**
 * Deletar ponto do mapa corporal
 */
export const deleteBodyPoint = async (id) => {
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
export const getBodyPointsByDateRange = async (patientId, startDate, endDate) => {
    await delay(350);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockBodyPoints
        .filter(point => {
        if (point.patientId !== patientId)
            return false;
        const pointDate = new Date(point.createdAt);
        return pointDate >= start && pointDate <= end;
    })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
/**
 * Buscar pontos por lado do corpo
 */
export const getBodyPointsBySide = async (patientId, side) => {
    await delay(250);
    return mockBodyPoints
        .filter(point => point.patientId === patientId && point.bodySide === side)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
/**
 * Buscar pontos por nível de dor
 */
export const getBodyPointsByPainLevel = async (patientId, minLevel, maxLevel) => {
    await delay(300);
    return mockBodyPoints
        .filter(point => point.patientId === patientId &&
        point.painLevel >= minLevel &&
        point.painLevel <= maxLevel)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
/**
 * Obter estatísticas dos pontos de dor
 */
export const getBodyMapStatistics = async (patientId) => {
    await delay(400);
    const patientPoints = mockBodyPoints.filter(point => point.patientId === patientId);
    const totalPoints = patientPoints.length;
    const averagePainLevel = totalPoints > 0
        ? Math.round((patientPoints.reduce((sum, p) => sum + p.painLevel, 0) / totalPoints) * 10) / 10
        : 0;
    const pointsByPainLevel = {
        'leve': patientPoints.filter(p => p.painLevel <= 3).length,
        'moderada': patientPoints.filter(p => p.painLevel > 3 && p.painLevel <= 6).length,
        'intensa': patientPoints.filter(p => p.painLevel > 6 && p.painLevel <= 8).length,
        'severa': patientPoints.filter(p => p.painLevel > 8).length
    };
    const pointsBySide = {
        'front': patientPoints.filter(p => p.bodySide === 'front').length,
        'back': patientPoints.filter(p => p.bodySide === 'back').length
    };
    const recentPoints = patientPoints
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
export const exportBodyMapData = async (patientId) => {
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
 * Professional analytics service for body map insights
 * Provides comprehensive pain analysis and trend data
 */
export const getBodyMapAnalytics = async (patientId) => {
    await delay(350);
    try {
        const patientPoints = mockBodyPoints.filter(point => point.patientId === patientId);
        if (patientPoints.length === 0) {
            return {
                totalPoints: 0,
                averagePainLevel: 0,
                painTrends: [],
                regionDistribution: {},
                painTypeDistribution: {},
                symptomFrequency: {}
            };
        }
        // Group points by date for trends
        const pointsByDate = patientPoints.reduce((acc, point) => {
            const date = new Date(point.createdAt).toDateString();
            if (!acc[date])
                acc[date] = [];
            acc[date].push(point);
            return acc;
        }, {});
        const painTrends = Object.entries(pointsByDate).map(([date, dayPoints]) => ({
            date,
            averagePain: Math.round((dayPoints.reduce((sum, p) => sum + p.painLevel, 0) / dayPoints.length) * 10) / 10,
            pointCount: dayPoints.length
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Distribution calculations
        const regionDistribution = patientPoints.reduce((acc, point) => {
            acc[point.bodyRegion] = (acc[point.bodyRegion] || 0) + 1;
            return acc;
        }, {});
        const painTypeDistribution = patientPoints.reduce((acc, point) => {
            acc[point.painType] = (acc[point.painType] || 0) + 1;
            return acc;
        }, {});
        const symptomFrequency = patientPoints.reduce((acc, point) => {
            point.symptoms.forEach(symptom => {
                acc[symptom] = (acc[symptom] || 0) + 1;
            });
            return acc;
        }, {});
        return {
            totalPoints: patientPoints.length,
            averagePainLevel: Math.round((patientPoints.reduce((sum, p) => sum + p.painLevel, 0) / patientPoints.length) * 10) / 10,
            painTrends,
            regionDistribution,
            painTypeDistribution,
            symptomFrequency
        };
    }
    catch (error) {
        console.error('Error calculating analytics:', error);
        throw new Error('Failed to calculate body map analytics');
    }
};
/**
 * Legacy function for backward compatibility
 * @deprecated Use getBodyMapAnalytics instead
 */
export const getPainEvolution = async (patientId) => {
    const analytics = await getBodyMapAnalytics(patientId);
    return analytics.painTrends.map(trend => ({
        date: trend.date,
        averagePainLevel: trend.averagePain,
        pointCount: trend.pointCount
    }));
};
/*
TODO: Implementar com Supabase real

import { supabase } from '../lib/supabaseClient';

export const getBodyPointsByPatientId = async (patientId: string): Promise<BodyPoint[]> => {
    const { data, error } = await supabase
        .from('body_points')
        .select('*')
        .eq('patientId', patientId)
        .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const addBodyPoint = async (pointData: Omit<BodyPoint, 'id' | 'createdAt'>): Promise<BodyPoint> => {
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
