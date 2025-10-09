/**
 * Formulário de Protocolo Clínico
 */
import React, { useState } from 'react';
export default function ProtocolForm({ protocol, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: protocol?.title || '',
        specialty: protocol?.specialty || 'esportiva',
        description: protocol?.description || '',
        summary: protocol?.summary || '',
        objectives: protocol?.objectives || [''],
        indications: protocol?.indications || [''],
        contraindications: protocol?.contraindications || [''],
        phases: protocol?.phases || [],
        duration: protocol?.duration || '',
        frequency: protocol?.frequency || '',
        evidenceLevel: protocol?.evidenceLevel || 'B',
        references: protocol?.references || [''],
        images: protocol?.images || [],
        tags: protocol?.tags || [''],
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
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {protocol ? 'Editar Protocolo' : 'Novo Protocolo'}
          </h2>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Especialidade e Nível de Evidência */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Evidência *
              </label>
              <select required value={formData.evidenceLevel} onChange={e => setFormData({ ...formData, evidenceLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="A">A - Alta evidência</option>
                <option value="B">B - Boa evidência</option>
                <option value="C">C - Evidência moderada</option>
                <option value="D">D - Baixa evidência</option>
              </select>
            </div>
          </div>

          {/* Duração e Frequência */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração *
              </label>
              <input type="text" required placeholder="ex: 8-12 semanas" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência *
              </label>
              <input type="text" required placeholder="ex: 2-3x por semana" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          {/* Resumo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo *
            </label>
            <textarea required rows={3} value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Completa *
            </label>
            <textarea required rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          {/* Objetivos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivos
            </label>
            {formData.objectives.map((obj, index) => (<div key={index} className="flex gap-2 mb-2">
                <input type="text" value={obj} onChange={e => updateArrayItem('objectives', index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite um objetivo"/>
                <button type="button" onClick={() => removeArrayItem('objectives', index)} className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Remover
                </button>
              </div>))}
            <button type="button" onClick={() => addArrayItem('objectives', '')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              + Adicionar Objetivo
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
            <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">
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
