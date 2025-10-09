/**
 * Custom Hook for Sports Rehabilitation
 * Hook personalizado para gerenciar reabilitação esportiva
 */
import { useState, useEffect, useCallback } from 'react';
import { sportsRehabServiceSupabase } from '../services/sports/sportsRehabServiceSupabase';
import { toast } from 'react-toastify';
export const useSportsRehab = ({ patientId, autoLoad = true }) => {
    const [loading, setLoading] = useState(false);
    const [athleteProfile, setAthleteProfile] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [loads, setLoads] = useState([]);
    const [progression, setProgression] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState(null);
    // Carregar dados
    const loadData = useCallback(async () => {
        if (!patientId)
            return;
        try {
            setLoading(true);
            setError(null);
            // Buscar perfil
            const profile = await sportsRehabServiceSupabase.getAthleteProfile(patientId);
            setAthleteProfile(profile);
            if (profile) {
                // Buscar dados relacionados
                const [performanceMetrics, loadData, prog, trainingSessions] = await Promise.all([
                    sportsRehabServiceSupabase.getPerformanceMetrics(profile.id),
                    sportsRehabServiceSupabase.getLoadMonitoring(profile.id, 12),
                    sportsRehabServiceSupabase.getRehabProgression(profile.id),
                    sportsRehabServiceSupabase.getTrainingSessions(profile.id, 20),
                ]);
                setMetrics(performanceMetrics);
                setLoads(loadData);
                setProgression(prog);
                setSessions(trainingSessions);
            }
        }
        catch (err) {
            setError(err);
            console.error('Erro ao carregar dados de reabilitação:', err);
            toast.error('Erro ao carregar dados');
        }
        finally {
            setLoading(false);
        }
    }, [patientId]);
    // Salvar perfil de atleta
    const saveProfile = useCallback(async (profile) => {
        try {
            setLoading(true);
            const saved = await sportsRehabServiceSupabase.upsertAthleteProfile(profile);
            setAthleteProfile(saved);
            toast.success('Perfil de atleta salvo!');
            return saved;
        }
        catch (err) {
            setError(err);
            console.error('Erro ao salvar perfil:', err);
            toast.error('Erro ao salvar perfil');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Salvar métrica
    const saveMetric = useCallback(async (metric) => {
        try {
            const saved = await sportsRehabServiceSupabase.savePerformanceMetric(metric);
            toast.success('Métrica registrada!');
            await loadData();
            return saved;
        }
        catch (err) {
            console.error('Erro ao salvar métrica:', err);
            toast.error('Erro ao salvar métrica');
            throw err;
        }
    }, [loadData]);
    // Salvar sessão de treinamento
    const saveSession = useCallback(async (session) => {
        try {
            const saved = await sportsRehabServiceSupabase.saveTrainingSession(session);
            toast.success('Sessão registrada!');
            await loadData();
            return saved;
        }
        catch (err) {
            console.error('Erro ao salvar sessão:', err);
            toast.error('Erro ao salvar sessão');
            throw err;
        }
    }, [loadData]);
    // Calcular estatísticas
    const getStatistics = useCallback(() => {
        if (!athleteProfile)
            return null;
        return {
            totalSessions: sessions.length,
            averagePainLevel: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + (s.painLevel || 0), 0) / sessions.length
                : 0,
            averageExertion: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + (s.perceivedExertion || 0), 0) / sessions.length
                : 0,
            currentPhase: progression?.currentPhase,
            overallProgress: progression?.overallProgress || 0,
            latestACWR: loads[0]?.acwr || 0,
            recentMetrics: metrics.slice(0, 5),
        };
    }, [athleteProfile, sessions, progression, loads, metrics]);
    // Auto-load
    useEffect(() => {
        if (autoLoad) {
            loadData();
        }
    }, [autoLoad, loadData]);
    return {
        loading,
        athleteProfile,
        metrics,
        loads,
        progression,
        sessions,
        error,
        loadData,
        saveProfile,
        saveMetric,
        saveSession,
        getStatistics,
    };
};
export default useSportsRehab;
