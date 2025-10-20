/**
 * Formulário de Material Clínico
 */

import React, { useState } from 'react';
import type { ClinicalMaterial, FisioSpecialty } from '../../types/clinicalContent';

interface MaterialFormProps {
  material?: ClinicalMaterial;
  onSave: (material: Omit<ClinicalMaterial, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const [formData, setFormData] = useState<Omit<ClinicalMaterial, 'id' | 'createdAt' | 'updatedAt'>>({
    type: material?.type || 'manual',
    title: material?.title || '',
    specialty: material?.specialty || 'esportiva',
    description: material?.description || '',
    category: material?.category || 'professional-use',
    content: material?.content || '',
    downloadable: material?.downloadable ?? true,
    printable: material?.printable ?? true,
    fileUrl: material?.fileUrl || '',
    thumbnailUrl: material?.thumbnailUrl || '',
    images: material?.images || [],
    tags: material?.tags || [''],
    language: material?.language || 'pt-BR',
    version: material?.version || '1.0',
    lastReviewed: material?.lastReviewed || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addArrayItem = (field: keyof typeof formData, value: any = '') => {
    const currentArray = formData[field] as any[];
    setFormData({ ...formData, [field]: [...currentArray, value] });
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    const currentArray = formData[field] as any[];
    setFormData({ ...formData, [field]: currentArray.filter((_, i) => i !== index) });
  };

  const updateArrayItem = (field: keyof typeof formData, index: number, value: any) => {
    const currentArray = formData[field] as any[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto border border-slate-200">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            {material ? 'Editar Material' : 'Novo Material'}
          </h2>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo e Especialidade */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo *
              </label>
              <select
                required
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="form">Formulário</option>
                <option value="checklist">Checklist</option>
                <option value="guideline">Guideline</option>
                <option value="template">Template</option>
                <option value="infographic">Infográfico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade *
              </label>
              <select
                required
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value as FisioSpecialty })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="esportiva">Esportiva</option>
                <option value="pos-operatoria">Pós-Operatória</option>
                <option value="geriatrica">Gerontológica</option>
                <option value="ortopedica">Ortopédica</option>
                <option value="neurologica">Neurológica</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient-education">Educação do Paciente</option>
              <option value="professional-use">Uso Profissional</option>
              <option value="evaluation">Avaliação</option>
              <option value="documentation">Documentação</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conteúdo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Digite o conteúdo do material (pode usar Markdown)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* Opções */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="downloadable"
                checked={formData.downloadable}
                onChange={e => setFormData({ ...formData, downloadable: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="downloadable" className="ml-2 text-sm text-gray-700">
                Permitir Download
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="printable"
                checked={formData.printable}
                onChange={e => setFormData({ ...formData, printable: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="printable" className="ml-2 text-sm text-gray-700">
                Permitir Impressão
              </label>
            </div>
          </div>

          {/* Versão e Data de Revisão */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versão *
              </label>
              <input
                type="text"
                required
                placeholder="1.0"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma *
              </label>
              <input
                type="text"
                required
                placeholder="pt-BR"
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Última Revisão *
              </label>
              <input
                type="date"
                required
                value={formData.lastReviewed}
                onChange={e => setFormData({ ...formData, lastReviewed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* URLs opcionais */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Arquivo (opcional)
              </label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Miniatura (opcional)
              </label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tag}
                  onChange={e => updateArrayItem('tags', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite uma tag"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('tags', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags', '')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Adicionar Tag
            </button>
          </div>

          {/* Botões */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-semibold"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

