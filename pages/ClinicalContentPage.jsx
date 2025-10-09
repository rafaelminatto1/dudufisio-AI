/**
 * Página de Demonstração de Conteúdo Clínico
 * Mostra os protocolos, exercícios e materiais gerados
 * Com funcionalidade CRUD completa
 */
import React, { useState } from 'react';
import { clinicalContentService } from '../services/clinicalContentService';
import ProtocolForm from '../components/clinical-content/ProtocolForm';
import ExerciseForm from '../components/clinical-content/ExerciseForm';
import AssessmentForm from '../components/clinical-content/AssessmentForm';
import MaterialForm from '../components/clinical-content/MaterialForm';
import PatientSearchModal from '../components/clinical-content/PatientSearchModal';
export default function ClinicalContentPage() {
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedType, setSelectedType] = useState('protocols');
    // Estados para CRUD
    const [showProtocolForm, setShowProtocolForm] = useState(false);
    const [showExerciseForm, setShowExerciseForm] = useState(false);
    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    // Estados para atribuição de protocolos
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [selectedProtocolForAssignment, setSelectedProtocolForAssignment] = useState(null);
    // Obter estatísticas
    const stats = clinicalContentService.getStatistics();
    // Obter conteúdos com base no filtro
    const getFilteredProtocols = () => {
        const all = clinicalContentService.protocols.getAll();
        return selectedTab === 'all' ? all : all.filter(p => p.specialty === selectedTab);
    };
    const getFilteredExercises = () => {
        const all = clinicalContentService.exercises.getAll();
        return selectedTab === 'all' ? all : all.filter(e => e.specialty.includes(selectedTab));
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
    const handleEditProtocol = (protocol) => {
        setEditingItem(protocol);
        setShowProtocolForm(true);
    };
    const handleDeleteProtocol = (id) => {
        if (confirm('Tem certeza que deseja deletar este protocolo?')) {
            clinicalContentService.protocols.delete(id);
            setRefreshKey(prev => prev + 1);
        }
    };
    const handleSaveProtocol = (data) => {
        if (editingItem) {
            clinicalContentService.protocols.update(editingItem.id, data);
        }
        else {
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
    const handleEditExercise = (exercise) => {
        setEditingItem(exercise);
        setShowExerciseForm(true);
    };
    const handleDeleteExercise = (id) => {
        if (confirm('Tem certeza que deseja deletar este exercício?')) {
            clinicalContentService.exercises.delete(id);
            setRefreshKey(prev => prev + 1);
        }
    };
    const handleSaveExercise = (data) => {
        if (editingItem) {
            clinicalContentService.exercises.update(editingItem.id, data);
        }
        else {
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
    const handleEditAssessment = (assessment) => {
        setEditingItem(assessment);
        setShowAssessmentForm(true);
    };
    const handleDeleteAssessment = (id) => {
        if (confirm('Tem certeza que deseja deletar esta avaliação?')) {
            clinicalContentService.assessments.delete(id);
            setRefreshKey(prev => prev + 1);
        }
    };
    const handleSaveAssessment = (data) => {
        if (editingItem) {
            clinicalContentService.assessments.update(editingItem.id, data);
        }
        else {
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
    const handleEditMaterial = (material) => {
        setEditingItem(material);
        setShowMaterialForm(true);
    };
    const handleDeleteMaterial = (id) => {
        if (confirm('Tem certeza que deseja deletar este material?')) {
            clinicalContentService.materials.delete(id);
            setRefreshKey(prev => prev + 1);
        }
    };
    const handleSaveMaterial = (data) => {
        if (editingItem) {
            clinicalContentService.materials.update(editingItem.id, data);
        }
        else {
            clinicalContentService.materials.create(data);
        }
        setShowMaterialForm(false);
        setEditingItem(null);
        setRefreshKey(prev => prev + 1);
    };
    // Handlers para atribuição de protocolos
    const handleAssignProtocol = (protocol) => {
        setSelectedProtocolForAssignment(protocol);
        setShowPatientSearch(true);
    };
    const handlePatientAssign = (patientId) => {
        if (selectedProtocolForAssignment) {
            clinicalContentService.protocols.assignToPatient(selectedProtocolForAssignment.id, patientId);
            setRefreshKey(prev => prev + 1);
        }
    };
    const handleClosePatientSearch = () => {
        setShowPatientSearch(false);
        setSelectedProtocolForAssignment(null);
    };
    const renderProtocols = () => (<div className="space-y-6">
      {protocols.map(protocol => (<div key={protocol.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{protocol.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleAssignProtocol(protocol)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                    👥 Atrelar a Paciente
                  </button>
                  <button onClick={() => handleEditProtocol(protocol)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDeleteProtocol(protocol.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    🗑️ Deletar
                  </button>
                </div>
              </div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                {protocol.specialty}
              </span>
              <p className="text-gray-700 mb-4">{protocol.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Duração</span>
                  <p className="font-semibold text-gray-900">{protocol.duration}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Frequência</span>
                  <p className="font-semibold text-gray-900">{protocol.frequency}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Nível de Evidência</span>
                  <p className="font-semibold text-gray-900">{protocol.evidenceLevel}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Objetivos:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {protocol.objectives.map((obj, idx) => (<li key={idx} className="text-gray-700">{obj}</li>))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Fases ({protocol.phases.length}):</h4>
                <div className="space-y-2">
                  {protocol.phases.map(phase => (<div key={phase.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-gray-900">
                        {phase.order}. {phase.name} <span className="text-sm text-gray-600">({phase.duration})</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {phase.goals.slice(0, 2).join('; ')}
                      </p>
                    </div>))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {protocol.tags.map(tag => (<span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {tag}
                  </span>))}
              </div>
            </div>
            
            {protocol.images.length > 0 && (<div className="ml-4">
                <img src={protocol.images[0].url} alt={protocol.images[0].caption} className="w-32 h-32 object-cover rounded"/>
              </div>)}
          </div>
        </div>))}
    </div>);
    const renderExercises = () => (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {exercises.map(exercise => (<div key={exercise.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{exercise.name}</h3>
            <div className="flex gap-2">
              <button onClick={() => handleEditExercise(exercise)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">
                ✏️
              </button>
              <button onClick={() => handleDeleteExercise(exercise.id)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">
                🗑️
              </button>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {exercise.specialty.map(spec => (<span key={spec} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {spec}
              </span>))}
          </div>
          
          <p className="text-gray-700 mb-3">{exercise.description}</p>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-600">Categoria:</span>
              <p className="font-medium">{exercise.category}</p>
            </div>
            <div>
              <span className="text-gray-600">Dificuldade:</span>
              <p className="font-medium">{exercise.difficulty}</p>
            </div>
            <div>
              <span className="text-gray-600">Séries:</span>
              <p className="font-medium">{exercise.sets} x {exercise.repetitions}</p>
            </div>
            <div>
              <span className="text-gray-600">Descanso:</span>
              <p className="font-medium">{exercise.restPeriod}</p>
            </div>
          </div>
          
          {exercise.images.length > 0 && (<div className="flex gap-2 mb-3">
              {exercise.images.slice(0, 3).map((img, idx) => (<img key={idx} src={img.url} alt={img.caption} className="w-20 h-20 object-cover rounded"/>))}
            </div>)}
          
          <div className="mt-3">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Ver instruções completas
              </summary>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                {exercise.instructions.map(inst => (<li key={inst.order}>{inst.text}</li>))}
              </ol>
            </details>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-3">
            {exercise.tags.map(tag => (<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                #{tag}
              </span>))}
          </div>
        </div>))}
    </div>);
    const renderAssessments = () => (<div className="space-y-6">
      {assessments.map(assessment => (<div key={assessment.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{assessment.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => handleEditAssessment(assessment)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                ✏️ Editar
              </button>
              <button onClick={() => handleDeleteAssessment(assessment.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                🗑️ Deletar
              </button>
            </div>
          </div>
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-3">
            {assessment.specialty}
          </span>
          <p className="text-gray-700 mb-4">{assessment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm text-gray-600">Duração</span>
              <p className="font-semibold text-gray-900">{assessment.duration}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm text-gray-600">População Alvo</span>
              <p className="font-semibold text-gray-900">{assessment.targetPopulation}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Procedimentos ({assessment.procedures.length}):</h4>
            <div className="space-y-2">
              {assessment.procedures.map(proc => (<div key={proc.id} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-900">{proc.order}. {proc.step}</p>
                  <p className="text-sm text-gray-600 mt-1">{proc.instruction}</p>
                </div>))}
            </div>
          </div>
        </div>))}
    </div>);
    const renderMaterials = () => (<div className="space-y-6">
      {materials.map(material => (<div key={material.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{material.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEditMaterial(material)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDeleteMaterial(material.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    🗑️ Deletar
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  {material.type}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {material.specialty}
                </span>
              </div>
              {material.downloadable && (<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2">
                  📥 Download
                </button>)}
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{material.description}</p>
          
          <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {material.content.slice(0, 500)}...
            </pre>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
            <span>Versão: {material.version}</span>
            <span>Revisado: {new Date(material.lastReviewed).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>))}
    </div>);
    return (<div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Biblioteca de Conteúdo Clínico
          </h1>
          <p className="text-gray-600">
            Protocolos, exercícios e materiais baseados em evidências científicas
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProtocols}</div>
            <div className="text-sm text-gray-600">Protocolos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.totalExercises}</div>
            <div className="text-sm text-gray-600">Exercícios</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.totalAssessments}</div>
            <div className="text-sm text-gray-600">Avaliações</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalMaterials}</div>
            <div className="text-sm text-gray-600">Materiais</div>
          </div>
        </div>

        {/* Botão de Adicionar */}
        <div className="flex justify-end mb-4">
          {selectedType === 'protocols' && (<button onClick={handleCreateProtocol} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md">
              ➕ Adicionar Protocolo
            </button>)}
          {selectedType === 'exercises' && (<button onClick={handleCreateExercise} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md">
              ➕ Adicionar Exercício
            </button>)}
          {selectedType === 'assessments' && (<button onClick={handleCreateAssessment} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md">
              ➕ Adicionar Avaliação
            </button>)}
          {selectedType === 'materials' && (<button onClick={handleCreateMaterial} className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow-md">
              ➕ Adicionar Material
            </button>)}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Especialidade:</label>
              <div className="flex gap-2">
                <button onClick={() => setSelectedTab('all')} className={`px-4 py-2 rounded ${selectedTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Todas
                </button>
                <button onClick={() => setSelectedTab('esportiva')} className={`px-4 py-2 rounded ${selectedTab === 'esportiva' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Esportiva
                </button>
                <button onClick={() => setSelectedTab('pos-operatoria')} className={`px-4 py-2 rounded ${selectedTab === 'pos-operatoria' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Pós-Operatória
                </button>
                <button onClick={() => setSelectedTab('geriatrica')} className={`px-4 py-2 rounded ${selectedTab === 'geriatrica' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Gerontológica
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Conteúdo:</label>
              <div className="flex gap-2">
                <button onClick={() => setSelectedType('protocols')} className={`px-4 py-2 rounded ${selectedType === 'protocols' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Protocolos
                </button>
                <button onClick={() => setSelectedType('exercises')} className={`px-4 py-2 rounded ${selectedType === 'exercises' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Exercícios
                </button>
                <button onClick={() => setSelectedType('assessments')} className={`px-4 py-2 rounded ${selectedType === 'assessments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  Avaliações
                </button>
                <button onClick={() => setSelectedType('materials')} className={`px-4 py-2 rounded ${selectedType === 'materials' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
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
      {showProtocolForm && (<ProtocolForm protocol={editingItem} onSave={handleSaveProtocol} onCancel={() => {
                setShowProtocolForm(false);
                setEditingItem(null);
            }}/>)}

      {showExerciseForm && (<ExerciseForm exercise={editingItem} onSave={handleSaveExercise} onCancel={() => {
                setShowExerciseForm(false);
                setEditingItem(null);
            }}/>)}

      {showAssessmentForm && (<AssessmentForm assessment={editingItem} onSave={handleSaveAssessment} onCancel={() => {
                setShowAssessmentForm(false);
                setEditingItem(null);
            }}/>)}

      {showMaterialForm && (<MaterialForm material={editingItem} onSave={handleSaveMaterial} onCancel={() => {
                setShowMaterialForm(false);
                setEditingItem(null);
            }}/>)}

      {showPatientSearch && selectedProtocolForAssignment && (<PatientSearchModal protocolId={selectedProtocolForAssignment.id} protocolTitle={selectedProtocolForAssignment.title} onClose={handleClosePatientSearch} onAssign={handlePatientAssign}/>)}
    </div>);
}
