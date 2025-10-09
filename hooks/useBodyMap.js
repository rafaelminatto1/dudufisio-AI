import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import * as bodyMapService from '../services/bodyMapService';
export const useBodyMap = (patientId) => {
    const [bodyPoints, setBodyPoints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    // Função para carregar pontos do corpo
    const loadBodyPoints = useCallback(async () => {
        if (!patientId)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const points = await bodyMapService.getBodyPointsByPatientId(patientId);
            setBodyPoints(points);
        }
        catch (err) {
            console.error('Erro ao carregar pontos do mapa corporal:', err);
            setError('Erro ao carregar mapa corporal');
            showToast('Erro ao carregar mapa corporal', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [patientId, showToast]);
    // Carregar pontos quando o componente monta ou patientId muda
    useEffect(() => {
        loadBodyPoints();
    }, [loadBodyPoints]);
    // Adicionar novo ponto
    const addBodyPoint = useCallback(async (point) => {
        try {
            setError(null);
            const newPoint = await bodyMapService.addBodyPoint(point);
            setBodyPoints(prev => [newPoint, ...prev]);
            showToast('Ponto de dor adicionado com sucesso', 'success');
        }
        catch (err) {
            console.error('Erro ao adicionar ponto:', err);
            setError('Erro ao adicionar ponto');
            showToast('Erro ao adicionar ponto de dor', 'error');
            throw err;
        }
    }, [showToast]);
    // Atualizar ponto existente
    const updateBodyPoint = useCallback(async (id, pointData) => {
        try {
            setError(null);
            const updatedPoint = await bodyMapService.updateBodyPoint(id, pointData);
            setBodyPoints(prev => prev.map(p => p.id === id ? updatedPoint : p));
            showToast('Ponto de dor atualizado com sucesso', 'success');
        }
        catch (err) {
            console.error('Erro ao atualizar ponto:', err);
            setError('Erro ao atualizar ponto');
            showToast('Erro ao atualizar ponto de dor', 'error');
            throw err;
        }
    }, [showToast]);
    // Deletar ponto
    const deleteBodyPoint = useCallback(async (id) => {
        try {
            setError(null);
            await bodyMapService.deleteBodyPoint(id);
            setBodyPoints(prev => prev.filter(p => p.id !== id));
            showToast('Ponto de dor removido com sucesso', 'success');
        }
        catch (err) {
            console.error('Erro ao deletar ponto:', err);
            setError('Erro ao deletar ponto');
            showToast('Erro ao remover ponto de dor', 'error');
            throw err;
        }
    }, [showToast]);
    // Obter pontos por data
    const getPointsByDate = useCallback((date) => {
        return bodyPoints.filter(point => {
            const pointDate = new Date(point.createdAt).toLocaleDateString('pt-BR');
            return pointDate === date;
        });
    }, [bodyPoints]);
    // Obter pontos por lado (frente/costas)
    const getPointsBySide = useCallback((side) => {
        return bodyPoints.filter(point => point.bodySide === side);
    }, [bodyPoints]);
    // Calcular nível médio de dor
    const getAverageePainLevel = useCallback(() => {
        if (bodyPoints.length === 0)
            return 0;
        const total = bodyPoints.reduce((sum, point) => sum + point.painLevel, 0);
        return Math.round((total / bodyPoints.length) * 10) / 10;
    }, [bodyPoints]);
    // Atualizar pontos manualmente
    const refreshBodyPoints = useCallback(async () => {
        await loadBodyPoints();
    }, [loadBodyPoints]);
    // Limpar erro
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    return {
        bodyPoints,
        isLoading,
        error,
        addBodyPoint,
        updateBodyPoint,
        deleteBodyPoint,
        getPointsByDate,
        getPointsBySide,
        getAverageePainLevel,
        refreshBodyPoints,
        clearError
    };
};
