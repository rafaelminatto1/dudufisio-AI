/**
 * Formulário de Avaliação Especializada
 */
import React, { useState } from 'react';
export default function AssessmentForm({ assessment, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: assessment?.title || '',
        specialty: assessment?.specialty || 'esportiva',
        description: assessment?.description || '',
        purpose: assessment?.purpose || '',
        targetPopulation: assessment?.targetPopulation || '',
        duration: assessment?.duration || '',
        materials: assessment?.materials || [''],
        procedures: assessment?.procedures || [{ id: '1', order: 1, step: '', instruction: '', expectedOutcome: '', commonErrors: [] }],
        scoringCriteria: assessment?.scoringCriteria || [],
        interpretationGuide: assessment?.interpretationGuide || [],
        references: assessment?.references || [''],
        images: assessment?.images || [],
        tags: assessment?.tags || [''],
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    const addArrayItem = (field, value = '') => {
        const currentArray = formData[field];
        setFormData({ ...formData, [field]: [...currentArray, value] });
    };
    const removeArrayItem = (field, index) => {
        const currentArray = formData[field];
        setFormData({ ...formData, [field]: currentArray.filter((_, i) => i !== index) });
    };
    const updateArrayItem = (field, index, value) => {
        const currentArray = formData[field];
        const newArray = [...currentArray];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };
    const addProcedure = () => {
        const newProcedure = {
            id: Date.now().toString(),
            order: formData.procedures.length + 1,
            step: '',
            instruction: '',
            expectedOutcome: '',
            commonErrors: [],
        };
        setFormData({ ...formData, procedures: [...formData.procedures, newProcedure] });
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {assessment ? 'Editar Avaliação' : 'Nova Avaliação'}
          </h2>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Especialidade */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidade *
            </label>
            <select required value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="esportiva">Esportiva</option>
              <option value="pos-operatoria">Pós-Operatória</option>
              <option value="geriatrica">Gerontológica</option>
              <option value="ortopedica">Ortopédica</option>
              <option value="neurologica">Neurológica</option>
            </select>
          </div>

          {/* Duração e População Alvo */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração *
              </label>
              <input type="text" required placeholder="ex: 30-45 minutos" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                População Alvo *
              </label>
              <input type="text" required placeholder="ex: Atletas com lesão de LCA" value={formData.targetPopulation} onChange={e => setFormData({ ...formData, targetPopulation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Propósito */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propósito *
            </label>
            <textarea required rows={2} value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Materiais */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materiais Necessários
            </label>
            {formData.materials.map((material, index) => (<div key={index} className="flex gap-2 mb-2">
                <input type="text" value={material} onChange={e => updateArrayItem('materials', index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite um material"/>
                <button type="button" onClick={() => removeArrayItem('materials', index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Remover
                </button>
              </div>))}
            <button type="button" onClick={() => addArrayItem('materials', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              + Adicionar Material
            </button>
          </div>

          {/* Procedimentos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedimentos
            </label>
            {formData.procedures.map((proc, index) => (<div key={proc.id} className="bg-gray-50 p-4 rounded-md mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Passo {proc.order}</span>
                  <button type="button" onClick={() => removeArrayItem('procedures', index)} className="px-2 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">
                    Remover
                  </button>
                </div>
                
                <input type="text" value={proc.step} onChange={e => updateArrayItem('procedures', index, { ...proc, step: e.target.value })} placeholder="Nome do passo" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                
                <textarea value={proc.instruction} onChange={e => updateArrayItem('procedures', index, { ...proc, instruction: e.target.value })} placeholder="Instrução detalhada" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                
                <input type="text" value={proc.expectedOutcome} onChange={e => updateArrayItem('procedures', index, { ...proc, expectedOutcome: e.target.value })} placeholder="Resultado esperado" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>))}
            <button type="button" onClick={addProcedure} className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
              + Adicionar Procedimento
            </button>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            {formData.tags.map((tag, index) => (<div key={index} className="flex gap-2 mb-2">
                <input type="text" value={tag} onChange={e => updateArrayItem('tags', index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite uma tag"/>
                <button type="button" onClick={() => removeArrayItem('tags', index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Remover
                </button>
              </div>))}
            <button type="button" onClick={() => addArrayItem('tags', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              + Adicionar Tag
            </button>
          </div>

          {/* Botões */}
          <div className="flex gap-4 mt-6">
            <button type="submit" className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold">
              Salvar
            </button>
            <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>);
}
