/**
 * Custom Hook for Risk Assessment
 * Hook personalizado para gerenciar avaliações de risco
 */

import { useState, useEffect, useCallback } from 'react';
import { riskStratificationServiceSupabase } from '../services/clinical/riskStratificationServiceSupabase';
import { RiskAssessment, RiskProfile, RiskAlert, RiskType } from '../types/riskTypes';
import { toast } from 'react-toastify';

interface UseRiskAssessmentOptions {
  patientId: string;
  autoLoad?: boolean;
}

export const useRiskAssessment = ({ patientId, autoLoad = true }: UseRiskAssessmentOptions) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar perfil
      const riskProfile = await riskStratificationServiceSupabase.getPatientRiskProfile(patientId);
      setProfile(riskProfile);

      // Buscar assessments
      const patientAssessments = await riskStratificationServiceSupabase.getPatientAssessments(patientId);
      setAssessments(patientAssessments);

      // Buscar alertas
      const activeAlerts = await riskStratificationServiceSupabase.getActiveAlerts(patientId);
      setAlerts(activeAlerts);

    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar dados de risco:', err);
      toast.error('Erro ao carregar avaliação de risco');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Salvar nova avaliação
  const saveAssessment = useCallback(async (assessment: Omit<RiskAssessment, 'id'>) => {
    try {
      setLoading(true);
      const saved = await riskStratificationServiceSupabase.saveRiskAssessment(assessment);
      toast.success('Avaliação salva com sucesso!');
      await loadData(); // Recarregar dados
      return saved;
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao salvar avaliação:', err);
      toast.error('Erro ao salvar avaliação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Reconhecer alerta
  const acknowledgeAlert = useCallback(async (alertId: string, userId: string) => {
    try {
      await riskStratificationServiceSupabase.acknowledgeAlert(alertId, userId);
      toast.success('Alerta reconhecido');
      await loadData();
    } catch (err) {
      console.error('Erro ao reconhecer alerta:', err);
      toast.error('Erro ao reconhecer alerta');
    }
  }, [loadData]);

  // Resolver alerta
  const resolveAlert = useCallback(async (alertId: string, userId: string) => {
    try {
      await riskStratificationServiceSupabase.resolveAlert(alertId, userId);
      toast.success('Alerta resolvido');
      await loadData();
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      toast.error('Erro ao resolver alerta');
    }
  }, [loadData]);

  // Buscar assessments por tipo
  const getAssessmentsByType = useCallback((riskType: RiskType) => {
    return assessments.filter(a => a.riskType === riskType);
  }, [assessments]);

  // Auto-load
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    loading,
    profile,
    assessments,
    alerts,
    error,
    loadData,
    saveAssessment,
    acknowledgeAlert,
    resolveAlert,
    getAssessmentsByType,
  };
};

export default useRiskAssessment;

