/**
 * Gerenciador de Tipos Personalizados
 * Interface para criar e gerenciar especialidades e tipos de conteúdo customizados
 */
import React, { useState } from 'react';
import { customTypesService } from '../../services/customTypesService';
export default function CustomTypesManager({ onClose }) {
    const [activeTab, setActiveTab] = useState('specialties');
    const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
    const [showContentTypeForm, setShowContentTypeForm] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState(null);
    const [editingContentType, setEditingContentType] = useState(null);
    // Estados para formulários
    const [specialtyForm, setSpecialtyForm] = useState({
        name: '',
        displayName: '',
        description: '',
        color: '#3B82F6',
        icon: '🏥',
    });
    const [contentTypeForm, setContentTypeForm] = useState({
        name: '',
        displayName: '',
        description: '',
        color: '#3B82F6',
        icon: '📄',
        fields: [],
    });
    // Cores e ícones pré-definidos
    const colorOptions = [
        '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
        '#14B8A6', '#F43F5E', '#8B5A2B', '#059669', '#DC2626'
    ];
    const iconOptions = [
        '🏥', '💊', '🩺', '🔬', '📊', '📋', '📄', '📝', '🎯',
        '⚕️', '🏃', '🧠', '🦴', '👴', '👶', '🤸', '🏋️', '🧘',
        '💪', '🦵', '🦶', '🤲', '👁️', '👂', '👃', '👄', '🦷'
    ];
    const fieldTypeOptions = [
        { value: 'text', label: 'Texto' },
        { value: 'textarea', label: 'Texto Longo' },
        { value: 'number', label: 'Número' },
        { value: 'select', label: 'Seleção Única' },
        { value: 'multiselect', label: 'Seleção Múltipla' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'date', label: 'Data' },
        { value: 'url', label: 'URL' },
    ];
    const specialties = customTypesService.specialties.getAll();
    const contentTypes = customTypesService.contentTypes.getAll();
    const handleSpecialtySubmit = (e) => {
        e.preventDefault();
        if (editingSpecialty) {
            customTypesService.specialties.update(editingSpecialty.id, specialtyForm);
        }
        else {
            customTypesService.specialties.create(specialtyForm);
        }
        setShowSpecialtyForm(false);
        setEditingSpecialty(null);
        setSpecialtyForm({ name: '', displayName: '', description: '', color: '#3B82F6', icon: '🏥' });
    };
    const handleContentTypeSubmit = (e) => {
        e.preventDefault();
        if (editingContentType) {
            customTypesService.contentTypes.update(editingContentType.id, contentTypeForm);
        }
        else {
            customTypesService.contentTypes.create(contentTypeForm);
        }
        setShowContentTypeForm(false);
        setEditingContentType(null);
        setContentTypeForm({ name: '', displayName: '', description: '', color: '#3B82F6', icon: '📄', fields: [] });
    };
    const handleEditSpecialty = (specialty) => {
        setEditingSpecialty(specialty);
        setSpecialtyForm({
            name: specialty.name,
            displayName: specialty.displayName,
            description: specialty.description,
            color: specialty.color,
            icon: specialty.icon,
        });
        setShowSpecialtyForm(true);
    };
    const handleEditContentType = (contentType) => {
        setEditingContentType(contentType);
        setContentTypeForm({
            name: contentType.name,
            displayName: contentType.displayName,
            description: contentType.description,
            color: contentType.color,
            icon: contentType.icon,
            fields: contentType.fields,
        });
        setShowContentTypeForm(true);
    };
    const handleDeleteSpecialty = (id) => {
        if (confirm('Tem certeza que deseja deletar esta especialidade?')) {
            customTypesService.specialties.delete(id);
        }
    };
    const handleDeleteContentType = (id) => {
        if (confirm('Tem certeza que deseja deletar este tipo de conteúdo?')) {
            customTypesService.contentTypes.delete(id);
        }
    };
    const addField = () => {
        const newField = {
            id: Date.now().toString(),
            name: '',
            displayName: '',
            type: 'text',
            required: false,
        };
        setContentTypeForm({
            ...contentTypeForm,
            fields: [...contentTypeForm.fields, newField],
        });
    };
    const updateField = (index, updates) => {
        const newFields = [...contentTypeForm.fields];
        newFields[index] = { ...newFields[index], ...updates };
        setContentTypeForm({ ...contentTypeForm, fields: newFields });
    };
    const removeField = (index) => {
        const newFields = contentTypeForm.fields.filter((_, i) => i !== index);
        setContentTypeForm({ ...contentTypeForm, fields: newFields });
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🛠️ Gerenciar Tipos Personalizados
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveTab('specialties')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'specialties'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'}`}>
              🏥 Especialidades ({specialties.filter(s => s.isCustom).length})
            </button>
            <button onClick={() => setActiveTab('contentTypes')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'contentTypes'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'}`}>
              📄 Tipos de Conteúdo ({contentTypes.filter(ct => ct.isCustom).length})
            </button>
          </div>

          {/* Especialidades Tab */}
          {activeTab === 'specialties' && (<div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Especialidades Personalizadas</h3>
                <button onClick={() => {
                setEditingSpecialty(null);
                setSpecialtyForm({ name: '', displayName: '', description: '', color: '#3B82F6', icon: '🏥' });
                setShowSpecialtyForm(true);
            }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  ➕ Nova Especialidade
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialties.map(specialty => (<div key={specialty.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{specialty.icon}</span>
                        <h4 className="font-semibold">{specialty.displayName}</h4>
                      </div>
                      {specialty.isCustom && (<div className="flex gap-1">
                          <button onClick={() => handleEditSpecialty(specialty)} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteSpecialty(specialty.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                            🗑️
                          </button>
                        </div>)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{specialty.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: specialty.color }}></div>
                      <span className="text-xs text-gray-500">{specialty.name}</span>
                      {specialty.isCustom && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Personalizado
                        </span>)}
                    </div>
                  </div>))}
              </div>
            </div>)}

          {/* Tipos de Conteúdo Tab */}
          {activeTab === 'contentTypes' && (<div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tipos de Conteúdo Personalizados</h3>
                <button onClick={() => {
                setEditingContentType(null);
                setContentTypeForm({ name: '', displayName: '', description: '', color: '#3B82F6', icon: '📄', fields: [] });
                setShowContentTypeForm(true);
            }} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  ➕ Novo Tipo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypes.map(contentType => (<div key={contentType.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{contentType.icon}</span>
                        <h4 className="font-semibold">{contentType.displayName}</h4>
                      </div>
                      {contentType.isCustom && (<div className="flex gap-1">
                          <button onClick={() => handleEditContentType(contentType)} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteContentType(contentType.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                            🗑️
                          </button>
                        </div>)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{contentType.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: contentType.color }}></div>
                      <span className="text-xs text-gray-500">{contentType.name}</span>
                      {contentType.isCustom && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Personalizado
                        </span>)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contentType.fields.length} campos
                    </div>
                  </div>))}
              </div>
            </div>)}
        </div>

        {/* Formulário de Especialidade */}
        {showSpecialtyForm && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
              <form onSubmit={handleSpecialtySubmit} className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingSpecialty ? 'Editar Especialidade' : 'Nova Especialidade'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome (ID) *
                    </label>
                    <input type="text" required value={specialtyForm.name} onChange={e => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: cardiologia"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome de Exibição *
                    </label>
                    <input type="text" required value={specialtyForm.displayName} onChange={e => setSpecialtyForm({ ...specialtyForm, displayName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Cardiologia"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea value={specialtyForm.description} onChange={e => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Descrição da especialidade"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map(color => (<button key={color} type="button" onClick={() => setSpecialtyForm({ ...specialtyForm, color })} className={`w-8 h-8 rounded border-2 ${specialtyForm.color === color ? 'border-gray-800' : 'border-gray-300'}`} style={{ backgroundColor: color }}/>))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ícone
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {iconOptions.map(icon => (<button key={icon} type="button" onClick={() => setSpecialtyForm({ ...specialtyForm, icon })} className={`text-2xl p-2 rounded border-2 ${specialtyForm.icon === icon ? 'border-gray-800' : 'border-gray-300'}`}>
                          {icon}
                        </button>))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Salvar
                  </button>
                  <button type="button" onClick={() => setShowSpecialtyForm(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>)}

        {/* Formulário de Tipo de Conteúdo */}
        {showContentTypeForm && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleContentTypeSubmit} className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {editingContentType ? 'Editar Tipo de Conteúdo' : 'Novo Tipo de Conteúdo'}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome (ID) *
                    </label>
                    <input type="text" required value={contentTypeForm.name} onChange={e => setContentTypeForm({ ...contentTypeForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: receitas"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome de Exibição *
                    </label>
                    <input type="text" required value={contentTypeForm.displayName} onChange={e => setContentTypeForm({ ...contentTypeForm, displayName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Receitas"/>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea value={contentTypeForm.description} onChange={e => setContentTypeForm({ ...contentTypeForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Descrição do tipo de conteúdo"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.slice(0, 8).map(color => (<button key={color} type="button" onClick={() => setContentTypeForm({ ...contentTypeForm, color })} className={`w-6 h-6 rounded border-2 ${contentTypeForm.color === color ? 'border-gray-800' : 'border-gray-300'}`} style={{ backgroundColor: color }}/>))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ícone
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {iconOptions.slice(0, 8).map(icon => (<button key={icon} type="button" onClick={() => setContentTypeForm({ ...contentTypeForm, icon })} className={`text-xl p-1 rounded border-2 ${contentTypeForm.icon === icon ? 'border-gray-800' : 'border-gray-300'}`}>
                          {icon}
                        </button>))}
                    </div>
                  </div>
                </div>

                {/* Campos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Campos do Formulário</h4>
                    <button type="button" onClick={addField} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                      ➕ Adicionar Campo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {contentTypeForm.fields.map((field, index) => (<div key={field.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome do Campo *
                            </label>
                            <input type="text" required value={field.name} onChange={e => updateField(index, { name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: title"/>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome de Exibição *
                            </label>
                            <input type="text" required value={field.displayName} onChange={e => updateField(index, { displayName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Título"/>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo *
                            </label>
                            <select value={field.type} onChange={e => updateField(index, { type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {fieldTypeOptions.map(option => (<option key={option.value} value={option.value}>
                                  {option.label}
                                </option>))}
                            </select>
                          </div>

                          <div className="flex items-center">
                            <input type="checkbox" id={`required-${index}`} checked={field.required} onChange={e => updateField(index, { required: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                            <label htmlFor={`required-${index}`} className="ml-2 text-sm text-gray-700">
                              Campo obrigatório
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button type="button" onClick={() => removeField(index)} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                            🗑️ Remover
                          </button>
                        </div>
                      </div>))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Salvar
                  </button>
                  <button type="button" onClick={() => setShowContentTypeForm(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>)}
      </div>
    </div>);
}
