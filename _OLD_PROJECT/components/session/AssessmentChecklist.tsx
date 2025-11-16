import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { AssessmentTemplate } from '../../types';
import { getMandatoryAssessmentsForSession } from '../../services/patientTrackingService';
import { addMultipleAssessments } from '../../services/patientTrackingService';

interface AssessmentChecklistProps {
  patientId: string;
  sessionId?: string;
  sessionNumber: number;
  timing: 'pre_session' | 'post_session' | 'mid_session';
  onAssessmentsComplete?: () => void;
}

interface PendingAssessment {
  mandatory_id: string;
  template_id: string;
  template_name: string;
  field_type: string;
  is_required: boolean;
}

export const AssessmentChecklist: React.FC<AssessmentChecklistProps> = ({
  patientId,
  sessionId,
  sessionNumber,
  timing,
  onAssessmentsComplete
}) => {
  const [pendingTests, setPendingTests] = useState<PendingAssessment[]>([]);
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPendingTests();
  }, [patientId, sessionNumber, timing]);

  const loadPendingTests = async () => {
    try {
      setLoading(true);
      const tests = await getMandatoryAssessmentsForSession(patientId, sessionNumber, timing);
      setPendingTests(tests);
      
      // Inicializar form data
      const initialData: Record<string, any> = {};
      tests.forEach((test: PendingAssessment) => {
        initialData[test.template_id] = '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Erro ao carregar testes pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (test: PendingAssessment, value: any) => {
    try {
      // Salvar valor individualmente
      await addMultipleAssessments(patientId, [{
        sessionId: sessionId,
        templateId: test.template_id,
        fieldName: test.template_name,
        fieldValue: typeof value === 'number' ? value : undefined,
        fieldText: typeof value === 'string' ? value : undefined,
        assessmentTiming: timing
      }]);
      
      // Marcar como completo
      setCompletedTests(new Set([...completedTests, test.template_id]));
      
      // Limpar campo
      setFormData({ ...formData, [test.template_id]: '' });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro ao salvar avaliação');
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Filtrar apenas testes com valores preenchidos
      const assessments = pendingTests
        .filter(test => !completedTests.has(test.template_id))
        .filter(test => formData[test.template_id] !== '' && formData[test.template_id] !== undefined)
        .map(test => ({
          sessionId: sessionId,
          templateId: test.template_id,
          fieldName: test.template_name,
          fieldValue: typeof formData[test.template_id] === 'number' || test.field_type === 'number' || test.field_type === 'angle' || test.field_type === 'scale'
            ? parseFloat(formData[test.template_id])
            : undefined,
          fieldText: test.field_type === 'text' || test.field_type === 'select' || test.field_type === 'boolean'
            ? formData[test.template_id].toString()
            : undefined,
          assessmentTiming: timing
        }));

      if (assessments.length === 0) {
        alert('Preencha pelo menos uma avaliação');
        return;
      }

      await addMultipleAssessments(patientId, assessments);
      
      // Marcar todos como completos
      const newCompleted = new Set(completedTests);
      assessments.forEach(a => {
        if (a.templateId) {
          newCompleted.add(a.templateId);
        }
      });
      setCompletedTests(newCompleted);
      
      // Limpar formulário
      const clearedData: Record<string, any> = {};
      pendingTests.forEach(test => {
        clearedData[test.template_id] = '';
      });
      setFormData(clearedData);
      
      if (onAssessmentsComplete) {
        onAssessmentsComplete();
      }
      
      alert('Avaliações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar avaliações:', error);
      alert('Erro ao salvar avaliações');
    } finally {
      setSaving(false);
    }
  };

  const renderQuickInput = (test: PendingAssessment) => {
    const isCompleted = completedTests.has(test.template_id);
    const value = formData[test.template_id] || '';

    if (isCompleted) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Completo</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type={test.field_type === 'number' || test.field_type === 'angle' || test.field_type === 'scale' ? 'number' : 'text'}
          value={value}
          onChange={(e) => setFormData({ ...formData, [test.template_id]: e.target.value })}
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
          placeholder="Valor..."
          disabled={saving}
        />
        <Button
          size="sm"
          onClick={() => handleQuickAdd(test, formData[test.template_id])}
          disabled={!value || saving}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const progress = pendingTests.length > 0
    ? (completedTests.size / pendingTests.length) * 100
    : 0;

  const timingLabel = timing === 'pre_session' ? 'Pré-Sessão' :
                      timing === 'post_session' ? 'Pós-Sessão' :
                      'Durante Sessão';

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-slate-600">Carregando testes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingTests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-1">
              Nenhum teste obrigatório para {timingLabel.toLowerCase()}
            </p>
            <p className="text-sm text-slate-500">
              Todos os testes obrigatórios estão em dia
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Testes Obrigatórios - {timingLabel}
          </CardTitle>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {completedTests.size} / {pendingTests.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {pendingTests.map((test) => {
          const isCompleted = completedTests.has(test.template_id);
          
          return (
            <div
              key={test.template_id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-900">
                      {test.template_name}
                    </h4>
                    {test.is_required && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tipo: {test.field_type}
                  </p>
                </div>
              </div>

              <div className="ml-4">
                {renderQuickInput(test)}
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            {completedTests.size === pendingTests.length ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Todos os testes completados!
              </span>
            ) : (
              <span>
                {pendingTests.length - completedTests.size} {pendingTests.length - completedTests.size === 1 ? 'teste pendente' : 'testes pendentes'}
              </span>
            )}
          </div>

          {completedTests.size < pendingTests.length && (
            <Button
              onClick={handleSaveAll}
              disabled={saving || Object.values(formData).every(v => !v)}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Todos'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentChecklist;

