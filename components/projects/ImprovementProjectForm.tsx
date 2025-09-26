import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Users,
  Zap,
  BarChart3,
  Settings,
  CheckCircle2
} from 'lucide-react';

import { 
  ImprovementProject,
  ImprovementType,
  Project,
  ProjectType,
  ProjectPriority,
  ProjectStatus
} from '../../types';

interface ImprovementProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
}

const ImprovementProjectForm: React.FC<ImprovementProjectFormProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    priority: project?.priority || ProjectPriority.Medium,
    startDate: project?.startDate || '',
    estimatedEndDate: project?.estimatedEndDate || '',
    tags: project?.tags || [],
    improvementData: {
      improvementType: project?.improvementData?.improvementType || ImprovementType.Process,
      problemStatement: project?.improvementData?.problemStatement || '',
      currentState: project?.improvementData?.currentState || '',
      targetState: project?.improvementData?.targetState || '',
      rootCauseAnalysis: project?.improvementData?.rootCauseAnalysis || [''],
      proposedSolutions: project?.improvementData?.proposedSolutions || [{
        solution: '',
        impact: 'Medium' as 'Low' | 'Medium' | 'High',
        effort: 'Medium' as 'Low' | 'Medium' | 'High',
        priority: 1
      }],
      kpis: project?.improvementData?.kpis || [{
        metric: '',
        baseline: 0,
        target: 0,
        current: 0,
        unit: ''
      }],
      implementationPlan: project?.improvementData?.implementationPlan || [{
        phase: '',
        description: '',
        startDate: '',
        endDate: '',
        responsible: '',
        deliverables: ['']
      }],
      riskAssessment: project?.improvementData?.riskAssessment || [{
        risk: '',
        probability: 'Medium' as 'Low' | 'Medium' | 'High',
        impact: 'Medium' as 'Low' | 'Medium' | 'High',
        mitigation: ''
      }],
      changeManagement: {
        stakeholders: project?.improvementData?.changeManagement?.stakeholders || [''],
        communicationPlan: project?.improvementData?.changeManagement?.communicationPlan || '',
        trainingRequired: project?.improvementData?.changeManagement?.trainingRequired || false,
        trainingPlan: project?.improvementData?.changeManagement?.trainingPlan || ''
      }
    }
  });

  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImprovementDataChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        improvementData: {
          ...prev.improvementData,
          [parent]: {
            ...prev.improvementData[parent as keyof typeof prev.improvementData],
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        improvementData: {
          ...prev.improvementData,
          [field]: value
        }
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const currentArray = formData.improvementData[field as keyof typeof formData.improvementData] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleImprovementDataChange(field, newArray);
  };

  const addArrayItem = (field: string) => {
    const currentArray = formData.improvementData[field as keyof typeof formData.improvementData] as string[];
    handleImprovementDataChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData.improvementData[field as keyof typeof formData.improvementData] as string[];
    handleImprovementDataChange(field, currentArray.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: Partial<Project> = {
      title: formData.title,
      description: formData.description,
      type: ProjectType.Operational,
      priority: formData.priority,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      tags: formData.tags,
      improvementData: formData.improvementData,
      status: project?.status || ProjectStatus.Planning
    };

    onSave(projectData);
  };

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getEffortColor = (effort: 'Low' | 'Medium' | 'High') => {
    switch (effort) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {project ? 'Editar Projeto de Melhoria' : 'Novo Projeto de Melhoria'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Título do Projeto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Redução do Tempo de Espera dos Pacientes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Melhoria
                    </label>
                    <select
                      value={formData.improvementData.improvementType}
                      onChange={(e) => handleImprovementDataChange('improvementType', e.target.value as ImprovementType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value={ImprovementType.Quality}>Qualidade</option>
                      <option value={ImprovementType.Training}>Capacitação</option>
                      <option value={ImprovementType.Expansion}>Expansão</option>
                      <option value={ImprovementType.Process}>Processo</option>
                      <option value={ImprovementType.Technology}>Tecnologia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição do Projeto *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Descreva o objetivo e escopo do projeto de melhoria..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value as ProjectPriority)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value={ProjectPriority.Low}>Baixa</option>
                      <option value={ProjectPriority.Medium}>Média</option>
                      <option value={ProjectPriority.High}>Alta</option>
                      <option value={ProjectPriority.Critical}>Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data Prevista de Conclusão
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedEndDate}
                      onChange={(e) => handleInputChange('estimatedEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Problem Definition */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Definição do Problema</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Declaração do Problema *
                  </label>
                  <textarea
                    required
                    value={formData.improvementData.problemStatement}
                    onChange={(e) => handleImprovementDataChange('problemStatement', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Descreva claramente o problema que será abordado..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado Atual *
                    </label>
                    <textarea
                      required
                      value={formData.improvementData.currentState}
                      onChange={(e) => handleImprovementDataChange('currentState', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Descreva a situação atual..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado Desejado *
                    </label>
                    <textarea
                      required
                      value={formData.improvementData.targetState}
                      onChange={(e) => handleImprovementDataChange('targetState', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Descreva o resultado esperado..."
                    />
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Análise de Causa Raiz
                  </label>
                  <div className="space-y-2">
                    {formData.improvementData.rootCauseAnalysis.map((cause, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <input
                          type="text"
                          value={cause}
                          onChange={(e) => handleArrayChange('rootCauseAnalysis', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: Falta de sistema automatizado"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('rootCauseAnalysis', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('rootCauseAnalysis')}
                      className="flex items-center space-x-2 px-3 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar causa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Proposed Solutions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Soluções Propostas</h3>
                
                <div className="space-y-4">
                  {formData.improvementData.proposedSolutions.map((solution, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Solução
                          </label>
                          <input
                            type="text"
                            value={solution.solution}
                            onChange={(e) => {
                              const newSolutions = [...formData.improvementData.proposedSolutions];
                              newSolutions[index] = { ...newSolutions[index], solution: e.target.value };
                              handleImprovementDataChange('proposedSolutions', newSolutions);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Descreva a solução proposta..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Impacto
                          </label>
                          <select
                            value={solution.impact}
                            onChange={(e) => {
                              const newSolutions = [...formData.improvementData.proposedSolutions];
                              newSolutions[index] = { ...newSolutions[index], impact: e.target.value as 'Low' | 'Medium' | 'High' };
                              handleImprovementDataChange('proposedSolutions', newSolutions);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="Low">Baixo</option>
                            <option value="Medium">Médio</option>
                            <option value="High">Alto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Esforço
                          </label>
                          <select
                            value={solution.effort}
                            onChange={(e) => {
                              const newSolutions = [...formData.improvementData.proposedSolutions];
                              newSolutions[index] = { ...newSolutions[index], effort: e.target.value as 'Low' | 'Medium' | 'High' };
                              handleImprovementDataChange('proposedSolutions', newSolutions);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="Low">Baixo</option>
                            <option value="Medium">Médio</option>
                            <option value="High">Alto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Prioridade
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={solution.priority}
                            onChange={(e) => {
                              const newSolutions = [...formData.improvementData.proposedSolutions];
                              newSolutions[index] = { ...newSolutions[index], priority: parseInt(e.target.value) || 1 };
                              handleImprovementDataChange('proposedSolutions', newSolutions);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(solution.impact)}`}>
                            Impacto {solution.impact === 'Low' ? 'Baixo' : solution.impact === 'Medium' ? 'Médio' : 'Alto'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEffortColor(solution.effort)}`}>
                            Esforço {solution.effort === 'Low' ? 'Baixo' : solution.effort === 'Medium' ? 'Médio' : 'Alto'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newSolutions = formData.improvementData.proposedSolutions.filter((_, i) => i !== index);
                            handleImprovementDataChange('proposedSolutions', newSolutions);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover solução</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newSolutions = [...formData.improvementData.proposedSolutions, {
                        solution: '',
                        impact: 'Medium' as 'Low' | 'Medium' | 'High',
                        effort: 'Medium' as 'Low' | 'Medium' | 'High',
                        priority: formData.improvementData.proposedSolutions.length + 1
                      }];
                      handleImprovementDataChange('proposedSolutions', newSolutions);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar solução</span>
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Indicadores de Performance (KPIs)</h3>
                
                <div className="space-y-4">
                  {formData.improvementData.kpis.map((kpi, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Métrica
                          </label>
                          <input
                            type="text"
                            value={kpi.metric}
                            onChange={(e) => {
                              const newKpis = [...formData.improvementData.kpis];
                              newKpis[index] = { ...newKpis[index], metric: e.target.value };
                              handleImprovementDataChange('kpis', newKpis);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ex: Tempo de Espera"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Baseline
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={kpi.baseline}
                            onChange={(e) => {
                              const newKpis = [...formData.improvementData.kpis];
                              newKpis[index] = { ...newKpis[index], baseline: parseFloat(e.target.value) || 0 };
                              handleImprovementDataChange('kpis', newKpis);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Meta
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={kpi.target}
                            onChange={(e) => {
                              const newKpis = [...formData.improvementData.kpis];
                              newKpis[index] = { ...newKpis[index], target: parseFloat(e.target.value) || 0 };
                              handleImprovementDataChange('kpis', newKpis);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Atual
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={kpi.current}
                            onChange={(e) => {
                              const newKpis = [...formData.improvementData.kpis];
                              newKpis[index] = { ...newKpis[index], current: parseFloat(e.target.value) || 0 };
                              handleImprovementDataChange('kpis', newKpis);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Unidade
                          </label>
                          <input
                            type="text"
                            value={kpi.unit}
                            onChange={(e) => {
                              const newKpis = [...formData.improvementData.kpis];
                              newKpis[index] = { ...newKpis[index], unit: e.target.value };
                              handleImprovementDataChange('kpis', newKpis);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ex: minutos"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newKpis = formData.improvementData.kpis.filter((_, i) => i !== index);
                            handleImprovementDataChange('kpis', newKpis);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover KPI</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newKpis = [...formData.improvementData.kpis, {
                        metric: '',
                        baseline: 0,
                        target: 0,
                        current: 0,
                        unit: ''
                      }];
                      handleImprovementDataChange('kpis', newKpis);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar KPI</span>
                  </button>
                </div>
              </div>

              {/* Change Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Gestão da Mudança</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stakeholders
                  </label>
                  <div className="space-y-2">
                    {formData.improvementData.changeManagement.stakeholders.map((stakeholder, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={stakeholder}
                          onChange={(e) => {
                            const newStakeholders = [...formData.improvementData.changeManagement.stakeholders];
                            newStakeholders[index] = e.target.value;
                            handleImprovementDataChange('changeManagement.stakeholders', newStakeholders);
                          }}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: Recepcionistas"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newStakeholders = formData.improvementData.changeManagement.stakeholders.filter((_, i) => i !== index);
                            handleImprovementDataChange('changeManagement.stakeholders', newStakeholders);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newStakeholders = [...formData.improvementData.changeManagement.stakeholders, ''];
                        handleImprovementDataChange('changeManagement.stakeholders', newStakeholders);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar stakeholder</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plano de Comunicação
                  </label>
                  <textarea
                    value={formData.improvementData.changeManagement.communicationPlan}
                    onChange={(e) => handleImprovementDataChange('changeManagement.communicationPlan', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Descreva como a mudança será comunicada..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="trainingRequired"
                      checked={formData.improvementData.changeManagement.trainingRequired}
                      onChange={(e) => handleImprovementDataChange('changeManagement.trainingRequired', e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="trainingRequired" className="text-sm font-medium text-slate-700">
                      Treinamento necessário
                    </label>
                  </div>

                  {formData.improvementData.changeManagement.trainingRequired && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Plano de Treinamento
                      </label>
                      <textarea
                        value={formData.improvementData.changeManagement.trainingPlan || ''}
                        onChange={(e) => handleImprovementDataChange('changeManagement.trainingPlan', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Descreva o plano de treinamento..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Adicionar tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                {project ? 'Atualizar Projeto' : 'Criar Projeto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImprovementProjectForm;