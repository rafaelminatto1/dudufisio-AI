import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Building,
  BookOpen
} from 'lucide-react';

import { 
  ResearchProject,
  ResearchType,
  Project,
  ProjectType,
  ProjectPriority,
  ProjectStatus
} from '../../types';

interface ResearchProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
}

const ResearchProjectForm: React.FC<ResearchProjectFormProps> = ({
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
    researchData: {
      researchType: project?.researchData?.researchType || ResearchType.Effectiveness,
      hypothesis: project?.researchData?.hypothesis || '',
      methodology: project?.researchData?.methodology || '',
      inclusionCriteria: project?.researchData?.inclusionCriteria || [''],
      exclusionCriteria: project?.researchData?.exclusionCriteria || [''],
      sampleSize: project?.researchData?.sampleSize || 0,
      currentSampleSize: project?.researchData?.currentSampleSize || 0,
      dataCollectionPeriod: {
        start: project?.researchData?.dataCollectionPeriod?.start || '',
        end: project?.researchData?.dataCollectionPeriod?.end || ''
      },
      statisticalMethods: project?.researchData?.statisticalMethods || [''],
      expectedOutcomes: project?.researchData?.expectedOutcomes || [''],
      publications: project?.researchData?.publications || [],
      collaboratingInstitutions: project?.researchData?.collaboratingInstitutions || [''],
      ethicsApproval: project?.researchData?.ethicsApproval || {
        approved: false,
        approvalNumber: '',
        approvalDate: '',
        institution: ''
      }
    }
  });

  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleResearchDataChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        researchData: {
          ...prev.researchData,
          [parent]: {
            ...prev.researchData[parent as keyof typeof prev.researchData],
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        researchData: {
          ...prev.researchData,
          [field]: value
        }
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const currentArray = formData.researchData[field as keyof typeof formData.researchData] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleResearchDataChange(field, newArray);
  };

  const addArrayItem = (field: string) => {
    const currentArray = formData.researchData[field as keyof typeof formData.researchData] as string[];
    handleResearchDataChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData.researchData[field as keyof typeof formData.researchData] as string[];
    handleResearchDataChange(field, currentArray.filter((_, i) => i !== index));
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
      type: ProjectType.Research,
      priority: formData.priority,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      tags: formData.tags,
      researchData: formData.researchData,
      status: project?.status || ProjectStatus.Planning
    };

    onSave(projectData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {project ? 'Editar Projeto de Pesquisa' : 'Novo Projeto de Pesquisa'}
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Efetividade da TENS na Dor Lombar Crônica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Pesquisa
                    </label>
                    <select
                      value={formData.researchData.researchType}
                      onChange={(e) => handleResearchDataChange('researchType', e.target.value as ResearchType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={ResearchType.Effectiveness}>Efetividade</option>
                      <option value={ResearchType.Innovation}>Inovação</option>
                      <option value={ResearchType.Academic}>Acadêmica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva os objetivos e contexto da pesquisa..."
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Research Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Detalhes da Pesquisa</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hipótese *
                  </label>
                  <textarea
                    required
                    value={formData.researchData.hypothesis}
                    onChange={(e) => handleResearchDataChange('hypothesis', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Formule a hipótese principal da pesquisa..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Metodologia *
                  </label>
                  <textarea
                    required
                    value={formData.researchData.methodology}
                    onChange={(e) => handleResearchDataChange('methodology', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva a metodologia do estudo..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tamanho da Amostra
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.researchData.sampleSize}
                      onChange={(e) => handleResearchDataChange('sampleSize', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Participantes Atuais
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.researchData.currentSampleSize}
                      onChange={(e) => handleResearchDataChange('currentSampleSize', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 45"
                    />
                  </div>
                </div>

                {/* Data Collection Period */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Período de Coleta de Dados
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Início</label>
                      <input
                        type="date"
                        value={formData.researchData.dataCollectionPeriod.start}
                        onChange={(e) => handleResearchDataChange('dataCollectionPeriod.start', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Fim</label>
                      <input
                        type="date"
                        value={formData.researchData.dataCollectionPeriod.end}
                        onChange={(e) => handleResearchDataChange('dataCollectionPeriod.end', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusion Criteria */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Critérios de Inclusão
                  </label>
                  <div className="space-y-2">
                    {formData.researchData.inclusionCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={criterion}
                          onChange={(e) => handleArrayChange('inclusionCriteria', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Idade entre 18-65 anos"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('inclusionCriteria', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('inclusionCriteria')}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar critério</span>
                    </button>
                  </div>
                </div>

                {/* Exclusion Criteria */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Critérios de Exclusão
                  </label>
                  <div className="space-y-2">
                    {formData.researchData.exclusionCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={criterion}
                          onChange={(e) => handleArrayChange('exclusionCriteria', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Gravidez"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('exclusionCriteria', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('exclusionCriteria')}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar critério</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistical Methods and Expected Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statistical Methods */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Métodos Estatísticos
                  </label>
                  <div className="space-y-2">
                    {formData.researchData.statisticalMethods.map((method, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={method}
                          onChange={(e) => handleArrayChange('statisticalMethods', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: ANOVA"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('statisticalMethods', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('statisticalMethods')}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar método</span>
                    </button>
                  </div>
                </div>

                {/* Expected Outcomes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Desfechos Esperados
                  </label>
                  <div className="space-y-2">
                    {formData.researchData.expectedOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => handleArrayChange('expectedOutcomes', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Redução da dor (EVA)"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('expectedOutcomes', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('expectedOutcomes')}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar desfecho</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collaborating Institutions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Instituições Colaboradoras
                </label>
                <div className="space-y-2">
                  {formData.researchData.collaboratingInstitutions.map((institution, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => handleArrayChange('collaboratingInstitutions', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: UNIFESP"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('collaboratingInstitutions', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('collaboratingInstitutions')}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar instituição</span>
                  </button>
                </div>
              </div>

              {/* Ethics Approval */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Aprovação Ética</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ethicsApproved"
                    checked={formData.researchData.ethicsApproval?.approved || false}
                    onChange={(e) => handleResearchDataChange('ethicsApproval.approved', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ethicsApproved" className="text-sm font-medium text-slate-700">
                    Projeto aprovado pelo Comitê de Ética
                  </label>
                </div>

                {formData.researchData.ethicsApproval?.approved && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Número do Parecer
                      </label>
                      <input
                        type="text"
                        value={formData.researchData.ethicsApproval?.approvalNumber || ''}
                        onChange={(e) => handleResearchDataChange('ethicsApproval.approvalNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: CEP/UNIFESP-2024-0856"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Data de Aprovação
                      </label>
                      <input
                        type="date"
                        value={formData.researchData.ethicsApproval?.approvalDate || ''}
                        onChange={(e) => handleResearchDataChange('ethicsApproval.approvalDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Instituição
                      </label>
                      <input
                        type="text"
                        value={formData.researchData.ethicsApproval?.institution || ''}
                        onChange={(e) => handleResearchDataChange('ethicsApproval.institution', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Comitê de Ética UNIFESP"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
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
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adicionar tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default ResearchProjectForm;