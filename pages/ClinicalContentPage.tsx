/**
 * Página de Demonstração de Conteúdo Clínico
 * Mostra os protocolos, exercícios e materiais gerados
 * Com funcionalidade CRUD completa
 */

import React, { useState, useEffect } from 'react';
import { clinicalContentService } from '../services/clinicalContentService';
import ProtocolForm from '../components/clinical-content/ProtocolForm';
import ExerciseForm from '../components/clinical-content/ExerciseForm';
import AssessmentForm from '../components/clinical-content/AssessmentForm';
import MaterialForm from '../components/clinical-content/MaterialForm';
import PatientSearchModal from '../components/clinical-content/PatientSearchModal';
import type { 
  FisioSpecialty, 
  ClinicalProtocol, 
  Exercise, 
  SpecializedAssessment, 
  ClinicalMaterial 
} from '../types/clinicalContent';

export default function ClinicalContentPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | FisioSpecialty>('all');
  const [selectedType, setSelectedType] = useState<'protocols' | 'exercises' | 'assessments' | 'materials'>('protocols');
  
  // Estados para CRUD
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para atribuição de protocolos
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedProtocolForAssignment, setSelectedProtocolForAssignment] = useState<ClinicalProtocol | null>(null);

  // Obter estatísticas
  const stats = clinicalContentService.getStatistics();
  
  // Obter conteúdos com base no filtro
  const getFilteredProtocols = () => {
    const all = clinicalContentService.protocols.getAll();
    return selectedTab === 'all' ? all : all.filter(p => p.specialty === selectedTab);
  };

  const getFilteredExercises = () => {
    const all = clinicalContentService.exercises.getAll();
    return selectedTab === 'all' ? all : all.filter(e => e.specialty.includes(selectedTab as any));
  };

  const getFilteredAssessments = () => {
    const all = clinicalContentService.assessments.getAll();
    return selectedTab === 'all' ? all : all.filter(a => a.specialty === selectedTab);
  };

  const getFilteredMaterials = () => {
    const all = clinicalContentService.materials.getAll();
    return selectedTab === 'all' ? all : all.filter(m => m.specialty === selectedTab);
  };

  const protocols = getFilteredProtocols();
  const exercises = getFilteredExercises();
  const assessments = getFilteredAssessments();
  const materials = getFilteredMaterials();

  // Handlers para Protocolos
  const handleCreateProtocol = () => {
    setEditingItem(null);
    setShowProtocolForm(true);
  };

  const handleEditProtocol = (protocol: ClinicalProtocol) => {
    setEditingItem(protocol);
    setShowProtocolForm(true);
  };

  const handleDeleteProtocol = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este protocolo?')) {
      clinicalContentService.protocols.delete(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveProtocol = (data: Omit<ClinicalProtocol, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      clinicalContentService.protocols.update(editingItem.id, data);
    } else {
      clinicalContentService.protocols.create(data);
    }
    setShowProtocolForm(false);
    setEditingItem(null);
    setRefreshKey(prev => prev + 1);
  };

  // Handlers para Exercícios
  const handleCreateExercise = () => {
    setEditingItem(null);
    setShowExerciseForm(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingItem(exercise);
    setShowExerciseForm(true);
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este exercício?')) {
      clinicalContentService.exercises.delete(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveExercise = (data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      clinicalContentService.exercises.update(editingItem.id, data);
    } else {
      clinicalContentService.exercises.create(data);
    }
    setShowExerciseForm(false);
    setEditingItem(null);
    setRefreshKey(prev => prev + 1);
  };

  // Handlers para Avaliações
  const handleCreateAssessment = () => {
    setEditingItem(null);
    setShowAssessmentForm(true);
  };

  const handleEditAssessment = (assessment: SpecializedAssessment) => {
    setEditingItem(assessment);
    setShowAssessmentForm(true);
  };

  const handleDeleteAssessment = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta avaliação?')) {
      clinicalContentService.assessments.delete(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveAssessment = (data: Omit<SpecializedAssessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      clinicalContentService.assessments.update(editingItem.id, data);
    } else {
      clinicalContentService.assessments.create(data);
    }
    setShowAssessmentForm(false);
    setEditingItem(null);
    setRefreshKey(prev => prev + 1);
  };

  // Handlers para Materiais
  const handleCreateMaterial = () => {
    setEditingItem(null);
    setShowMaterialForm(true);
  };

  const handleEditMaterial = (material: ClinicalMaterial) => {
    setEditingItem(material);
    setShowMaterialForm(true);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este material?')) {
      clinicalContentService.materials.delete(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveMaterial = (data: Omit<ClinicalMaterial, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      clinicalContentService.materials.update(editingItem.id, data);
    } else {
      clinicalContentService.materials.create(data);
    }
    setShowMaterialForm(false);
    setEditingItem(null);
    setRefreshKey(prev => prev + 1);
  };

  // Handlers para atribuição de protocolos
  const handleAssignProtocol = (protocol: ClinicalProtocol) => {
    setSelectedProtocolForAssignment(protocol);
    setShowPatientSearch(true);
  };

  const handlePatientAssign = (patientId: string) => {
    if (selectedProtocolForAssignment) {
      clinicalContentService.protocols.assignToPatient(selectedProtocolForAssignment.id, patientId);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleClosePatientSearch = () => {
    setShowPatientSearch(false);
    setSelectedProtocolForAssignment(null);
  };

  const renderProtocols = () => (
    <div className="space-y-xl">
      {protocols.map(protocol => (
        <div key={protocol.id} className="bg-white rounded-lg shadow-cardHover p-lg border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="text-xl font-bold text-neutral-text">{protocol.title}</h3>
                <div className="flex gap-sm">
                  <button
                    onClick={() => handleAssignProtocol(protocol)}
                    className="px-md py-1 bg-success-light0 text-white rounded hover:bg-green-600 text-sm"
                  >
                    👥 Atrelar a Paciente
                  </button>
                  <button
                    onClick={() => handleEditProtocol(protocol)}
                    className="px-md py-1 bg-warning-light0 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProtocol(protocol.id)}
                    className="px-md py-1 bg-error-light0 text-white rounded hover:bg-red-600 text-sm"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
              <span className="inline-block px-md py-1 bg-primary-light text-blue-800 rounded-full text-sm font-medium mb-md">
                {protocol.specialty}
              </span>
              <p className="text-gray-700 mb-md">{protocol.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                <div className="bg-neutral-bgAlt p-md rounded">
                  <span className="text-sm text-neutral-textSecondary">Duração</span>
                  <p className="font-semibold text-neutral-text">{protocol.duration}</p>
                </div>
                <div className="bg-neutral-bgAlt p-md rounded">
                  <span className="text-sm text-neutral-textSecondary">Frequência</span>
                  <p className="font-semibold text-neutral-text">{protocol.frequency}</p>
                </div>
                <div className="bg-neutral-bgAlt p-md rounded">
                  <span className="text-sm text-neutral-textSecondary">Nível de Evidência</span>
                  <p className="font-semibold text-neutral-text">{protocol.evidenceLevel}</p>
                </div>
              </div>
              
              <div className="mb-md">
                <h4 className="font-semibold text-neutral-text mb-sm">Objetivos:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {protocol.objectives.map((obj, idx) => (
                    <li key={idx} className="text-gray-700">{obj}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-md">
                <h4 className="font-semibold text-neutral-text mb-sm">Fases ({protocol.phases.length}):</h4>
                <div className="space-y-sm">
                  {protocol.phases.map(phase => (
                    <div key={phase.id} className="bg-neutral-bgAlt p-md rounded">
                      <p className="font-medium text-neutral-text">
                        {phase.order}. {phase.name} <span className="text-sm text-neutral-textSecondary">({phase.duration})</span>
                      </p>
                      <p className="text-sm text-neutral-textSecondary mt-xs">
                        {phase.goals.slice(0, 2).join('; ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-sm">
                {protocol.tags.map(tag => (
                  <span key={tag} className="px-sm py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {protocol.images.length > 0 && (
              <div className="ml-4">
                <img 
                  src={protocol.images[0].url} 
                  alt={protocol.images[0].caption}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderExercises = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
      {exercises.map(exercise => (
        <div key={exercise.id} className="bg-white rounded-lg shadow-cardHover p-lg border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-sm">
            <h3 className="text-lg font-bold text-neutral-text">{exercise.name}</h3>
            <div className="flex gap-sm">
              <button
                onClick={() => handleEditExercise(exercise)}
                className="px-sm py-1 bg-warning-light0 text-white rounded hover:bg-yellow-600 text-xs"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteExercise(exercise.id)}
                className="px-sm py-1 bg-error-light0 text-white rounded hover:bg-red-600 text-xs"
              >
                🗑️
              </button>
            </div>
          </div>
          <div className="flex gap-sm mb-md">
            {exercise.specialty.map(spec => (
              <span key={spec} className="px-sm py-1 bg-success-light text-success rounded text-xs">
                {spec}
              </span>
            ))}
          </div>
          
          <p className="text-gray-700 mb-md">{exercise.description}</p>
          
          <div className="grid grid-cols-2 gap-sm mb-md text-sm">
            <div>
              <span className="text-neutral-textSecondary">Categoria:</span>
              <p className="font-medium">{exercise.category}</p>
            </div>
            <div>
              <span className="text-neutral-textSecondary">Dificuldade:</span>
              <p className="font-medium">{exercise.difficulty}</p>
            </div>
            <div>
              <span className="text-neutral-textSecondary">Séries:</span>
              <p className="font-medium">{exercise.sets} x {exercise.repetitions}</p>
            </div>
            <div>
              <span className="text-neutral-textSecondary">Descanso:</span>
              <p className="font-medium">{exercise.restPeriod}</p>
            </div>
          </div>
          
          {exercise.images.length > 0 && (
            <div className="flex gap-sm mb-md">
              {exercise.images.slice(0, 3).map((img, idx) => (
                <img 
                  key={idx}
                  src={img.url} 
                  alt={img.caption}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
          
          <div className="mt-3">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-neutral-text">
                Ver instruções completas
              </summary>
              <ol className="list-decimal list-inside mt-sm space-y-1 text-neutral-textSecondary">
                {exercise.instructions.map(inst => (
                  <li key={inst.order}>{inst.text}</li>
                ))}
              </ol>
            </details>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {exercise.tags.map(tag => (
              <span key={tag} className="px-sm py-1 bg-neutral-bgDark text-neutral-textSecondary rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAssessments = () => (
    <div className="space-y-xl">
      {assessments.map(assessment => (
        <div key={assessment.id} className="bg-white rounded-lg shadow-cardHover p-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-sm">
            <h3 className="text-xl font-bold text-neutral-text">{assessment.title}</h3>
            <div className="flex gap-sm">
              <button
                onClick={() => handleEditAssessment(assessment)}
                className="px-md py-1 bg-warning-light0 text-white rounded hover:bg-yellow-600 text-sm"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDeleteAssessment(assessment.id)}
                className="px-md py-1 bg-error-light0 text-white rounded hover:bg-red-600 text-sm"
              >
                🗑️ Deletar
              </button>
            </div>
          </div>
          <span className="inline-block px-md py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-md">
            {assessment.specialty}
          </span>
          <p className="text-gray-700 mb-md">{assessment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
            <div className="bg-neutral-bgAlt p-md rounded">
              <span className="text-sm text-neutral-textSecondary">Duração</span>
              <p className="font-semibold text-neutral-text">{assessment.duration}</p>
            </div>
            <div className="bg-neutral-bgAlt p-md rounded">
              <span className="text-sm text-neutral-textSecondary">População Alvo</span>
              <p className="font-semibold text-neutral-text">{assessment.targetPopulation}</p>
            </div>
          </div>
          
          <div className="mb-md">
            <h4 className="font-semibold text-neutral-text mb-sm">Procedimentos ({assessment.procedures.length}):</h4>
            <div className="space-y-sm">
              {assessment.procedures.map(proc => (
                <div key={proc.id} className="bg-neutral-bgAlt p-md rounded">
                  <p className="font-medium text-neutral-text">{proc.order}. {proc.step}</p>
                  <p className="text-sm text-neutral-textSecondary mt-xs">{proc.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-xl">
      {materials.map(material => (
        <div key={material.id} className="bg-white rounded-lg shadow-cardHover p-lg border-l-4 border-yellow-500">
          <div className="flex items-start justify-between mb-md">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-sm">
              <h3 className="text-xl font-bold text-neutral-text">{material.title}</h3>
                <div className="flex gap-sm">
                  <button
                    onClick={() => handleEditMaterial(material)}
                    className="px-md py-1 bg-warning-light0 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="px-md py-1 bg-error-light0 text-white rounded hover:bg-red-600 text-sm"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
              <div className="flex gap-sm mt-sm">
                <span className="px-sm py-1 bg-warning-light text-yellow-800 rounded text-xs">
                  {material.type}
                </span>
                <span className="px-sm py-1 bg-neutral-bgDark text-gray-700 rounded text-xs">
                  {material.specialty}
                </span>
              </div>
              {material.downloadable && (
                <button className="px-md py-sm bg-primary text-white rounded hover:bg-primary mt-sm">
                  📥 Download
                </button>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-md">{material.description}</p>
          
          <div className="bg-neutral-bgAlt p-md rounded max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {material.content.slice(0, 500)}...
            </pre>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-sm text-neutral-textSecondary">
            <span>Versão: {material.version}</span>
            <span>Revisado: {new Date(material.lastReviewed).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      <div className="max-w-7xl mx-auto px-md py-3xl">
        {/* Header */}
        <div className="mb-mdxl">
          <h1 className="text-3xl font-bold text-neutral-text mb-sm">
            🏥 Biblioteca de Conteúdo Clínico
          </h1>
          <p className="text-neutral-textSecondary">
            Protocolos, exercícios e materiais baseados em evidências científicas
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-mdxl">
          <div className="bg-white p-md rounded-lg shadow">
            <div className="text-2xl font-bold text-primary">{stats.totalProtocols}</div>
            <div className="text-sm text-neutral-textSecondary">Protocolos</div>
          </div>
          <div className="bg-white p-md rounded-lg shadow">
            <div className="text-2xl font-bold text-success">{stats.totalExercises}</div>
            <div className="text-sm text-neutral-textSecondary">Exercícios</div>
          </div>
          <div className="bg-white p-md rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.totalAssessments}</div>
            <div className="text-sm text-neutral-textSecondary">Avaliações</div>
          </div>
          <div className="bg-white p-md rounded-lg shadow">
            <div className="text-2xl font-bold text-warning">{stats.totalMaterials}</div>
            <div className="text-sm text-neutral-textSecondary">Materiais</div>
          </div>
        </div>

        {/* Botão de Adicionar */}
        <div className="flex justify-end mb-md">
          {selectedType === 'protocols' && (
            <button
              onClick={handleCreateProtocol}
              className="px-lg py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold shadow-cardHover"
            >
              ➕ Adicionar Protocolo
            </button>
          )}
          {selectedType === 'exercises' && (
            <button
              onClick={handleCreateExercise}
              className="px-lg py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-cardHover"
            >
              ➕ Adicionar Exercício
            </button>
          )}
          {selectedType === 'assessments' && (
            <button
              onClick={handleCreateAssessment}
              className="px-lg py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-cardHover"
            >
              ➕ Adicionar Avaliação
            </button>
          )}
          {selectedType === 'materials' && (
            <button
              onClick={handleCreateMaterial}
              className="px-lg py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow-cardHover"
            >
              ➕ Adicionar Material
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-cardHover p-md mb-xl">
          <div className="flex flex-wrap gap-md">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-sm block">Especialidade:</label>
              <div className="flex gap-sm">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-md py-sm rounded ${selectedTab === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSelectedTab('esportiva')}
                  className={`px-md py-sm rounded ${selectedTab === 'esportiva' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Esportiva
                </button>
                <button
                  onClick={() => setSelectedTab('pos-operatoria')}
                  className={`px-md py-sm rounded ${selectedTab === 'pos-operatoria' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Pós-Operatória
                </button>
                <button
                  onClick={() => setSelectedTab('geriatrica')}
                  className={`px-md py-sm rounded ${selectedTab === 'geriatrica' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Gerontológica
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-sm block">Tipo de Conteúdo:</label>
              <div className="flex gap-sm">
                <button
                  onClick={() => setSelectedType('protocols')}
                  className={`px-md py-sm rounded ${selectedType === 'protocols' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Protocolos
                </button>
                <button
                  onClick={() => setSelectedType('exercises')}
                  className={`px-md py-sm rounded ${selectedType === 'exercises' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Exercícios
                </button>
                <button
                  onClick={() => setSelectedType('assessments')}
                  className={`px-md py-sm rounded ${selectedType === 'assessments' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Avaliações
                </button>
                <button
                  onClick={() => setSelectedType('materials')}
                  className={`px-md py-sm rounded ${selectedType === 'materials' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                >
                  Materiais
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          {selectedType === 'protocols' && renderProtocols()}
          {selectedType === 'exercises' && renderExercises()}
          {selectedType === 'assessments' && renderAssessments()}
          {selectedType === 'materials' && renderMaterials()}
        </div>
      </div>

      {/* Formulários Modais */}
      {showProtocolForm && (
        <ProtocolForm
          protocol={editingItem}
          onSave={handleSaveProtocol}
          onCancel={() => {
            setShowProtocolForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showExerciseForm && (
        <ExerciseForm
          exercise={editingItem}
          onSave={handleSaveExercise}
          onCancel={() => {
            setShowExerciseForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showAssessmentForm && (
        <AssessmentForm
          assessment={editingItem}
          onSave={handleSaveAssessment}
          onCancel={() => {
            setShowAssessmentForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showMaterialForm && (
        <MaterialForm
          material={editingItem}
          onSave={handleSaveMaterial}
          onCancel={() => {
            setShowMaterialForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {showPatientSearch && selectedProtocolForAssignment && (
        <PatientSearchModal
          protocolId={selectedProtocolForAssignment.id}
          protocolTitle={selectedProtocolForAssignment.title}
          onClose={handleClosePatientSearch}
          onAssign={handlePatientAssign}
        />
      )}
    </div>
  );
}

