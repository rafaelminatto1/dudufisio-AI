import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  FileText,
  Camera,
  Video,
  Users,
  BookOpen,
  Stethoscope,
  Activity
} from 'lucide-react';

import { 
  ClinicalCaseProject,
  ClinicalCaseType,
  Project,
  ProjectType,
  ProjectPriority,
  ProjectStatus
} from '../../types';

interface ClinicalCaseFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
}

const ClinicalCaseForm: React.FC<ClinicalCaseFormProps> = ({
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
    patientId: project?.patientId || '',
    tags: project?.tags || [],
    clinicalCaseData: {
      caseType: project?.clinicalCaseData?.caseType || ClinicalCaseType.Complex,
      patientAge: project?.clinicalCaseData?.patientAge || 0,
      patientGender: project?.clinicalCaseData?.patientGender || 'M' as 'M' | 'F',
      primaryDiagnosis: project?.clinicalCaseData?.primaryDiagnosis || '',
      secondaryDiagnoses: project?.clinicalCaseData?.secondaryDiagnoses || [''],
      comorbidities: project?.clinicalCaseData?.comorbidities || [''],
      treatmentProtocol: project?.clinicalCaseData?.treatmentProtocol || '',
      outcomesMeasured: project?.clinicalCaseData?.outcomesMeasured || [''],
      followUpPeriod: project?.clinicalCaseData?.followUpPeriod || 3,
      initialAssessment: {
        date: project?.clinicalCaseData?.initialAssessment?.date || '',
        findings: project?.clinicalCaseData?.initialAssessment?.findings || '',
        photos: project?.clinicalCaseData?.initialAssessment?.photos || [],
        videos: project?.clinicalCaseData?.initialAssessment?.videos || []
      },
      progressNotes: project?.clinicalCaseData?.progressNotes || [],
      multidisciplinaryTeam: project?.clinicalCaseData?.multidisciplinaryTeam || [{
        role: '',
        name: '',
        contributions: ['']
      }],
      literatureReview: {
        references: project?.clinicalCaseData?.literatureReview?.references || [''],
        keyFindings: project?.clinicalCaseData?.literatureReview?.keyFindings || ['']
      },
      presentationHistory: project?.clinicalCaseData?.presentationHistory || []
    }
  });

  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClinicalDataChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        clinicalCaseData: {
          ...prev.clinicalCaseData,
          [parent]: {
            ...prev.clinicalCaseData[parent as keyof typeof prev.clinicalCaseData],
            [child]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clinicalCaseData: {
          ...prev.clinicalCaseData,
          [field]: value
        }
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const currentArray = formData.clinicalCaseData[field as keyof typeof formData.clinicalCaseData] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleClinicalDataChange(field, newArray);
  };

  const addArrayItem = (field: string) => {
    const currentArray = formData.clinicalCaseData[field as keyof typeof formData.clinicalCaseData] as string[];
    handleClinicalDataChange(field, [...currentArray, '']);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData.clinicalCaseData[field as keyof typeof formData.clinicalCaseData] as string[];
    handleClinicalDataChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = (index: number, field: string, value: any) => {
    const newTeam = [...formData.clinicalCaseData.multidisciplinaryTeam];
    if (field === 'contributions') {
      newTeam[index] = { ...newTeam[index], [field]: value };
    } else {
      newTeam[index] = { ...newTeam[index], [field]: value };
    }
    handleClinicalDataChange('multidisciplinaryTeam', newTeam);
  };

  const addTeamMember = () => {
    const newTeam = [...formData.clinicalCaseData.multidisciplinaryTeam, {
      role: '',
      name: '',
      contributions: ['']
    }];
    handleClinicalDataChange('multidisciplinaryTeam', newTeam);
  };

  const removeTeamMember = (index: number) => {
    const newTeam = formData.clinicalCaseData.multidisciplinaryTeam.filter((_, i) => i !== index);
    handleClinicalDataChange('multidisciplinaryTeam', newTeam);
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
      type: ProjectType.ClinicalCase,
      priority: formData.priority,
      startDate: formData.startDate,
      estimatedEndDate: formData.estimatedEndDate,
      patientId: formData.patientId,
      tags: formData.tags,
      clinicalCaseData: formData.clinicalCaseData,
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {project ? 'Editar Caso Clínico' : 'Novo Caso Clínico'}
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
                      Título do Caso *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Caso Clínico: Sra. Helena - Reabilitação Pós-AVC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Caso
                    </label>
                    <select
                      value={formData.clinicalCaseData.caseType}
                      onChange={(e) => handleClinicalDataChange('caseType', e.target.value as ClinicalCaseType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={ClinicalCaseType.Complex}>Complexo</option>
                      <option value={ClinicalCaseType.Rare}>Raro</option>
                      <option value={ClinicalCaseType.Experimental}>Experimental</option>
                      <option value={ClinicalCaseType.Longitudinal}>Longitudinal</option>
                      <option value={ClinicalCaseType.Multidisciplinary}>Multidisciplinar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição do Caso *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descreva o caso clínico, condições do paciente e relevância..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value as ProjectPriority)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ID do Paciente
                    </label>
                    <input
                      type="text"
                      value={formData.patientId}
                      onChange={(e) => handleInputChange('patientId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: PAC001"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Dados do Paciente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Idade *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      value={formData.clinicalCaseData.patientAge}
                      onChange={(e) => handleClinicalDataChange('patientAge', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sexo *
                    </label>
                    <select
                      required
                      value={formData.clinicalCaseData.patientGender}
                      onChange={(e) => handleClinicalDataChange('patientGender', e.target.value as 'M' | 'F')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Período de Acompanhamento (meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.clinicalCaseData.followUpPeriod}
                      onChange={(e) => handleClinicalDataChange('followUpPeriod', parseInt(e.target.value) || 3)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnóstico Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clinicalCaseData.primaryDiagnosis}
                    onChange={(e) => handleClinicalDataChange('primaryDiagnosis', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Sequelas de AVC isquêmico em território de ACM esquerda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Protocolo de Tratamento *
                  </label>
                  <textarea
                    required
                    value={formData.clinicalCaseData.treatmentProtocol}
                    onChange={(e) => handleClinicalDataChange('treatmentProtocol', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descreva o protocolo de tratamento utilizado..."
                  />
                </div>
              </div>

              {/* Diagnoses and Comorbidities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Secondary Diagnoses */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnósticos Secundários
                  </label>
                  <div className="space-y-2">
                    {formData.clinicalCaseData.secondaryDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={diagnosis}
                          onChange={(e) => handleArrayChange('secondaryDiagnoses', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Hemiparesia à direita"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('secondaryDiagnoses', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('secondaryDiagnoses')}
                      className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar diagnóstico</span>
                    </button>
                  </div>
                </div>

                {/* Comorbidities */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comorbidades
                  </label>
                  <div className="space-y-2">
                    {formData.clinicalCaseData.comorbidities.map((comorbidity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={comorbidity}
                          onChange={(e) => handleArrayChange('comorbidities', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Hipertensão arterial"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('comorbidities', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('comorbidities')}
                      className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar comorbidade</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Outcomes Measured */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Desfechos Avaliados
                </label>
                <div className="space-y-2">
                  {formData.clinicalCaseData.outcomesMeasured.map((outcome, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => handleArrayChange('outcomesMeasured', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Força muscular (MRC)"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('outcomesMeasured', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('outcomesMeasured')}
                    className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar desfecho</span>
                  </button>
                </div>
              </div>

              {/* Initial Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Avaliação Inicial</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data da Avaliação
                  </label>
                  <input
                    type="date"
                    value={formData.clinicalCaseData.initialAssessment.date}
                    onChange={(e) => handleClinicalDataChange('initialAssessment.date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Achados da Avaliação
                  </label>
                  <textarea
                    value={formData.clinicalCaseData.initialAssessment.findings}
                    onChange={(e) => handleClinicalDataChange('initialAssessment.findings', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descreva os achados da avaliação inicial..."
                  />
                </div>
              </div>

              {/* Multidisciplinary Team */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Equipe Multidisciplinar</h3>
                
                <div className="space-y-4">
                  {formData.clinicalCaseData.multidisciplinaryTeam.map((member, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Função/Especialidade
                          </label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ex: Fisioterapeuta"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome do Profissional
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ex: Dra. Maria Santos"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contribuições
                        </label>
                        <div className="space-y-2">
                          {member.contributions.map((contribution, contribIndex) => (
                            <div key={contribIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={contribution}
                                onChange={(e) => {
                                  const newContributions = [...member.contributions];
                                  newContributions[contribIndex] = e.target.value;
                                  handleTeamMemberChange(index, 'contributions', newContributions);
                                }}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ex: Reabilitação motora"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newContributions = member.contributions.filter((_, i) => i !== contribIndex);
                                  handleTeamMemberChange(index, 'contributions', newContributions);
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
                              const newContributions = [...member.contributions, ''];
                              handleTeamMemberChange(index, 'contributions', newContributions);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Adicionar contribuição</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover membro</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar membro da equipe</span>
                  </button>
                </div>
              </div>

              {/* Literature Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Revisão de Literatura</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* References */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Referências
                    </label>
                    <div className="space-y-2">
                      {formData.clinicalCaseData.literatureReview.references.map((reference, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={reference}
                            onChange={(e) => {
                              const newReferences = [...formData.clinicalCaseData.literatureReview.references];
                              newReferences[index] = e.target.value;
                              handleClinicalDataChange('literatureReview.references', newReferences);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ex: Stroke rehabilitation guidelines 2023"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newReferences = formData.clinicalCaseData.literatureReview.references.filter((_, i) => i !== index);
                              handleClinicalDataChange('literatureReview.references', newReferences);
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
                          const newReferences = [...formData.clinicalCaseData.literatureReview.references, ''];
                          handleClinicalDataChange('literatureReview.references', newReferences);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar referência</span>
                      </button>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Achados Principais
                    </label>
                    <div className="space-y-2">
                      {formData.clinicalCaseData.literatureReview.keyFindings.map((finding, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={finding}
                            onChange={(e) => {
                              const newFindings = [...formData.clinicalCaseData.literatureReview.keyFindings];
                              newFindings[index] = e.target.value;
                              handleClinicalDataChange('literatureReview.keyFindings', newFindings);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Ex: Terapia intensiva nas primeiras 6 semanas é crucial"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFindings = formData.clinicalCaseData.literatureReview.keyFindings.filter((_, i) => i !== index);
                              handleClinicalDataChange('literatureReview.keyFindings', newFindings);
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
                          const newFindings = [...formData.clinicalCaseData.literatureReview.keyFindings, ''];
                          handleClinicalDataChange('literatureReview.keyFindings', newFindings);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar achado</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-green-600 hover:text-green-800"
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
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Adicionar tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {project ? 'Atualizar Caso' : 'Criar Caso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClinicalCaseForm;