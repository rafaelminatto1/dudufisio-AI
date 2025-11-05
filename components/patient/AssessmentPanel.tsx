import React, { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Calendar, LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';
import type { 
  AssessmentTemplate, 
  PatientAssessment,
  AssessmentChartData,
  ClinicalCaseCategory 
} from '../../types';
import {
  getTemplatesByCategory,
  getCategories
} from '../../services/clinicalCategoriesService';
import {
  addAssessment,
  addMultipleAssessments,
  getAssessmentHistory,
  getAssessmentChartData
} from '../../services/patientTrackingService';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale';

interface AssessmentPanelProps {
  patientId: string;
  sessionId?: string;
}

export const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
  patientId,
  sessionId
}) => {
  const [categories, setCategories] = useState<ClinicalCaseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [assessments, setAssessments] = useState<PatientAssessment[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [chartData, setChartData] = useState<Record<string, AssessmentChartData[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timing, setTiming] = useState<'pre_session' | 'post_session' | 'independent'>('pre_session');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadAssessmentHistory();
  }, [patientId, selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadTemplates = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await getTemplatesByCategory(categoryId);
      setTemplates(data);
      
      // Inicializar formData
      const initialData: Record<string, any> = {};
      data.forEach(template => {
        initialData[template.id] = '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentHistory = async () => {
    try {
      const data = await getAssessmentHistory(patientId);
      setAssessments(data);
      
      // Carregar dados de gráfico para cada campo único
      const uniqueFields = [...new Set(data.map(a => a.fieldName))];
      const chartPromises = uniqueFields.map(async (fieldName) => {
        const chartData = await getAssessmentChartData(patientId, fieldName);
        return { fieldName, data: chartData };
      });
      
      const chartResults = await Promise.all(chartPromises);
      const chartDataMap: Record<string, AssessmentChartData[]> = {};
      chartResults.forEach(result => {
        chartDataMap[result.fieldName] = result.data;
      });
      setChartData(chartDataMap);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Preparar avaliações
      const newAssessments = templates
        .filter(template => formData[template.id] !== '' && formData[template.id] !== undefined)
        .map(template => ({
          sessionId: sessionId,
          templateId: template.id,
          fieldName: template.name,
          fieldValue: template.fieldType === 'number' || template.fieldType === 'angle' || template.fieldType === 'scale' || template.fieldType === 'range'
            ? parseFloat(formData[template.id])
            : undefined,
          fieldText: template.fieldType === 'text' || template.fieldType === 'select' || template.fieldType === 'boolean'
            ? formData[template.id].toString()
            : undefined,
          unit: template.unit,
          assessmentTiming: timing,
          notes: undefined
        }));

      if (newAssessments.length === 0) {
        alert('Preencha pelo menos uma avaliação');
        return;
      }

      await addMultipleAssessments(patientId, newAssessments);
      
      // Limpar formulário
      const clearedData: Record<string, any> = {};
      templates.forEach(template => {
        clearedData[template.id] = '';
      });
      setFormData(clearedData);
      
      // Recarregar histórico
      await loadAssessmentHistory();
      
      alert('Avaliações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar avaliações:', error);
      alert('Erro ao salvar avaliações');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (template: AssessmentTemplate) => {
    const value = formData[template.id] || '';
    
    switch (template.fieldType) {
      case 'number':
      case 'angle':
      case 'range':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
            min={template.minValue}
            max={template.maxValue}
            step="0.1"
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${template.minValue || 0} - ${template.maxValue || 100}`}
          />
        );
        
      case 'scale':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value}
              onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
              min={template.minValue || 0}
              max={template.maxValue || 10}
              step="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{template.minValue || 0}</span>
              <span className="font-medium text-blue-600">{value || (template.minValue || 0)}</span>
              <span>{template.maxValue || 10}</span>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={template.name}
          >
            <option value="">Selecione...</option>
            {template.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
        
      case 'boolean':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={template.id}
                value="true"
                checked={value === 'true'}
                onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span>Sim</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={template.id}
                value="false"
                checked={value === 'false'}
                onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span>Não</span>
            </label>
          </div>
        );
        
      case 'text':
      default:
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [template.id]: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            placeholder="Digite o texto..."
          />
        );
    }
  };

  const renderMiniChart = (fieldName: string) => {
    const data = chartData[fieldName] || [];
    if (data.length < 2) return null;

    return (
      <div className="h-16 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getTrendIcon = (fieldName: string) => {
    const data = chartData[fieldName] || [];
    if (data.length < 2) return <Minus className="w-4 h-4 text-slate-400" />;
    
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = ((last - first) / first) * 100;
    
    if (Math.abs(change) < 5) {
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
    
    return change > 0 
      ? <TrendingUp className="w-4 h-4 text-green-600" />
      : <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Painel de Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-6">
                {/* Formulário de Nova Avaliação */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Timing Selector */}
                  <div role="radiogroup" aria-label="Momento da Avaliação">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Momento da Avaliação
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={timing === 'pre_session' ? 'default' : 'outline'}
                        onClick={() => setTiming('pre_session')}
                      >
                        Pré-Sessão
                      </Button>
                      <Button
                        type="button"
                        variant={timing === 'post_session' ? 'default' : 'outline'}
                        onClick={() => setTiming('post_session')}
                      >
                        Pós-Sessão
                      </Button>
                      <Button
                        type="button"
                        variant={timing === 'independent' ? 'default' : 'outline'}
                        onClick={() => setTiming('independent')}
                      >
                        Independente
                      </Button>
                    </div>
                  </div>

                  {/* Campos de Avaliação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map(template => (
                      <div key={template.id} className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          {template.name}
                          {template.isRequired && <span className="text-red-500 ml-1">*</span>}
                          {template.unit && (
                            <span className="text-slate-500 ml-2 font-normal">({template.unit})</span>
                          )}
                        </label>
                        {renderField(template)}
                        {template.helpText && (
                          <p className="text-xs text-slate-500">{template.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Salvar Avaliações
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Histórico de Avaliações */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Histórico Recente</h3>
                  
                  {templates.length > 0 ? (
                    <div className="space-y-4">
                      {templates.map(template => {
                        const templateAssessments = assessments
                          .filter(a => a.templateId === template.id)
                          .slice(0, 5);

                        if (templateAssessments.length === 0) return null;

                        return (
                          <Card key={template.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">{template.name}</CardTitle>
                                  {getTrendIcon(template.name)}
                                </div>
                                {renderMiniChart(template.name)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {templateAssessments.map(assessment => (
                                  <div
                                    key={assessment.id}
                                    className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Calendar className="w-4 h-4 text-slate-400" />
                                      <span className="text-slate-600">
                                        {format(parseISO(assessment.measuredAt), 'dd/MM/yyyy', { locale: ptBR })}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {assessment.assessmentTiming === 'pre_session' && 'Pré'}
                                        {assessment.assessmentTiming === 'post_session' && 'Pós'}
                                        {assessment.assessmentTiming === 'independent' && 'Ind'}
                                      </Badge>
                                    </div>
                                    <span className="font-semibold text-slate-900">
                                      {assessment.fieldValue !== null && assessment.fieldValue !== undefined
                                        ? `${assessment.fieldValue}${assessment.unit ? ` ${assessment.unit}` : ''}`
                                        : assessment.fieldText}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      Nenhuma avaliação registrada ainda
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentPanel;

