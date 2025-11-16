import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Calendar, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type {
  MandatoryAssessment,
  AssessmentTemplate,
  ClinicalCaseCategory
} from '../../types';
import {
  getCategories,
  getTemplatesByCategory
} from '../../services/clinicalCategoriesService';
import {
  configureMandatoryAssessment,
  getMandatoryAssessments,
  updateMandatoryAssessment,
  deactivateMandatoryAssessment
} from '../../services/patientTrackingService';

interface MandatoryTestsConfigProps {
  patientId: string;
}

export const MandatoryTestsConfig: React.FC<MandatoryTestsConfigProps> = ({ patientId }) => {
  const [categories, setCategories] = useState<ClinicalCaseCategory[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [mandatoryTests, setMandatoryTests] = useState<MandatoryAssessment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    templateId: '',
    frequencyType: 'every_session' as MandatoryAssessment['frequencyType'],
    frequencyValue: 1,
    milestoneSessions: '',
    assessmentTiming: ['pre_session'] as ('pre_session' | 'post_session' | 'mid_session')[],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, [patientId]);

  useEffect(() => {
    if (formData.categoryId) {
      loadTemplates(formData.categoryId);
    }
  }, [formData.categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, testsData] = await Promise.all([
        getCategories(),
        getMandatoryAssessments(patientId, true)
      ]);
      setCategories(categoriesData);
      setMandatoryTests(testsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (categoryId: string) => {
    try {
      const data = await getTemplatesByCategory(categoryId);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.templateId) {
      alert('Selecione um teste');
      return;
    }

    try {
      setLoading(true);

      const config = {
        categoryId: formData.categoryId || undefined,
        templateId: formData.templateId,
        frequencyType: formData.frequencyType,
        frequencyValue: formData.frequencyType === 'every_n_sessions' ? formData.frequencyValue : undefined,
        milestoneSessions: formData.frequencyType === 'milestones' 
          ? formData.milestoneSessions.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
          : undefined,
        assessmentTiming: formData.assessmentTiming,
        isActive: true,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      await configureMandatoryAssessment(patientId, config);
      
      // Resetar form
      setFormData({
        categoryId: '',
        templateId: '',
        frequencyType: 'every_session',
        frequencyValue: 1,
        milestoneSessions: '',
        assessmentTiming: ['pre_session'],
        startDate: '',
        endDate: ''
      });
      setShowForm(false);
      
      // Recarregar lista
      await loadData();
      
      alert('Teste obrigatório configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao configurar teste:', error);
      alert('Erro ao configurar teste obrigatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deseja desativar este teste obrigatório?')) return;
    
    try {
      setLoading(true);
      await deactivateMandatoryAssessment(id);
      await loadData();
      alert('Teste desativado com sucesso!');
    } catch (error) {
      console.error('Erro ao desativar teste:', error);
      alert('Erro ao desativar teste');
    } finally {
      setLoading(false);
    }
  };

  const toggleTiming = (timing: 'pre_session' | 'post_session' | 'mid_session') => {
    if (formData.assessmentTiming.includes(timing)) {
      setFormData({
        ...formData,
        assessmentTiming: formData.assessmentTiming.filter(t => t !== timing)
      });
    } else {
      setFormData({
        ...formData,
        assessmentTiming: [...formData.assessmentTiming, timing]
      });
    }
  };

  const getFrequencyLabel = (test: MandatoryAssessment) => {
    switch (test.frequencyType) {
      case 'every_session':
        return 'Toda sessão';
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Quinzenal';
      case 'monthly':
        return 'Mensal';
      case 'every_n_sessions':
        return `A cada ${test.frequencyValue} sessões`;
      case 'milestones':
        return `Sessões: ${test.milestoneSessions?.join(', ')}`;
      default:
        return test.frequencyType;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Testes Obrigatórios
              <Badge variant="secondary">{mandatoryTests.length}</Badge>
            </CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Teste
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoria Clínica (opcional)
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, templateId: '' })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teste/Avaliação *
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um teste...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} {template.unit && `(${template.unit})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequência */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequência *
                </label>
                <select
                  value={formData.frequencyType}
                  onChange={(e) => setFormData({ ...formData, frequencyType: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="every_session">Toda sessão</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="every_n_sessions">A cada N sessões</option>
                  <option value="milestones">Sessões específicas (milestones)</option>
                </select>
              </div>

              {/* Valor de Frequência */}
              {formData.frequencyType === 'every_n_sessions' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    A cada quantas sessões?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frequencyValue}
                    onChange={(e) => setFormData({ ...formData, frequencyValue: parseInt(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Milestones */}
              {formData.frequencyType === 'milestones' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Números das sessões (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formData.milestoneSessions}
                    onChange={(e) => setFormData({ ...formData, milestoneSessions: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1, 5, 10, 20, 30"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Exemplo: 1, 5, 10, 20 (aplica teste nas sessões 1, 5, 10 e 20)
                  </p>
                </div>
              )}

              {/* Timing */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Momento de Aplicação *
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assessmentTiming.includes('pre_session')}
                      onChange={() => toggleTiming('pre_session')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Pré-Sessão</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assessmentTiming.includes('post_session')}
                      onChange={() => toggleTiming('post_session')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Pós-Sessão</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assessmentTiming.includes('mid_session')}
                      onChange={() => toggleTiming('mid_session')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Durante Sessão</span>
                  </label>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Lista de Testes Configurados */}
      <div className="space-y-3">
        {mandatoryTests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Nenhum teste obrigatório configurado</p>
                <p className="text-sm text-slate-500 mb-4">
                  Configure testes para serem aplicados automaticamente nas sessões
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Teste
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          mandatoryTests.map(test => (
            <Card key={test.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {templates.find(t => t.id === test.templateId)?.name || test.templateId}
                      </h4>
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Ativo
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Frequência</p>
                        <p className="font-medium text-slate-900">{getFrequencyLabel(test)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Momento</p>
                        <div className="flex flex-wrap gap-1">
                          {test.assessmentTiming.map(timing => (
                            <Badge key={timing} variant="outline" className="text-xs">
                              {timing === 'pre_session' && 'Pré'}
                              {timing === 'post_session' && 'Pós'}
                              {timing === 'mid_session' && 'Durante'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {test.startDate && (
                        <div>
                          <p className="text-slate-500 mb-1">Início</p>
                          <p className="font-medium text-slate-900">
                            {new Date(test.startDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                      {test.endDate && (
                        <div>
                          <p className="text-slate-500 mb-1">Fim</p>
                          <p className="font-medium text-slate-900">
                            {new Date(test.endDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivate(test.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MandatoryTestsConfig;

