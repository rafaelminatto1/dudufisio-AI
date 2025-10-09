/**
 * Formulário de Exercício
 */

import React, { useState } from 'react';
import type { Exercise, FisioSpecialty, ExerciseCategory, BodyPart, ExerciseInstruction } from '../../types/clinicalContent';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ exercise, onSave, onCancel }: ExerciseFormProps) {
  const [formData, setFormData] = useState<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>({
    name: exercise?.name || '',
    alias: exercise?.alias || [],
    specialty: exercise?.specialty || [],
    category: exercise?.category || 'fortalecimento',
    bodyParts: exercise?.bodyParts || [],
    description: exercise?.description || '',
    objectives: exercise?.objectives || [''],
    instructions: exercise?.instructions || [{ order: 1, text: '' }],
    difficulty: exercise?.difficulty || 'iniciante',
    duration: exercise?.duration || '',
    sets: exercise?.sets || 3,
    repetitions: exercise?.repetitions || '10',
    restPeriod: exercise?.restPeriod || '60 segundos',
    equipment: exercise?.equipment || [''],
    variations: exercise?.variations || [],
    contraindications: exercise?.contraindications || [''],
    precautions: exercise?.precautions || [''],
    benefits: exercise?.benefits || [''],
    commonMistakes: exercise?.commonMistakes || [''],
    images: exercise?.images || [],
    videos: exercise?.videos || [],
    tags: exercise?.tags || [''],
    musclesWorked: exercise?.musclesWorked || [''],
    movementPattern: exercise?.movementPattern || '',
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

  const toggleSpecialty = (specialty: FisioSpecialty) => {
    const current = formData.specialty;
    if (current.includes(specialty)) {
      setFormData({ ...formData, specialty: current.filter(s => s !== specialty) });
    } else {
      setFormData({ ...formData, specialty: [...current, specialty] });
    }
  };

  const toggleBodyPart = (part: BodyPart) => {
    const current = formData.bodyParts;
    if (current.includes(part)) {
      setFormData({ ...formData, bodyParts: current.filter(p => p !== part) });
    } else {
      setFormData({ ...formData, bodyParts: [...current, part] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {exercise ? 'Editar Exercício' : 'Novo Exercício'}
          </h2>

          {/* Nome */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Exercício *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Especialidades */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['esportiva', 'pos-operatoria', 'geriatrica', 'ortopedica', 'neurologica'] as FisioSpecialty[]).map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialty(spec)}
                  className={`px-4 py-2 rounded-md ${
                    formData.specialty.includes(spec)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria e Dificuldade */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ExerciseCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mobilidade">Mobilidade</option>
                <option value="fortalecimento">Fortalecimento</option>
                <option value="alongamento">Alongamento</option>
                <option value="equilibrio">Equilíbrio</option>
                <option value="coordenacao">Coordenação</option>
                <option value="propriocepcao">Propriocepção</option>
                <option value="resistencia">Resistência</option>
                <option value="flexibilidade">Flexibilidade</option>
                <option value="funcional">Funcional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificuldade *
              </label>
              <select
                required
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>

          {/* Partes do Corpo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partes do Corpo *
            </label>
            <div className="flex flex-wrap gap-2">
              {(['cervical', 'ombro', 'cotovelo', 'punho', 'toracica', 'lombar', 'quadril', 'joelho', 'tornozelo', 'pe', 'core', 'corpo-inteiro'] as BodyPart[]).map(part => (
                <button
                  key={part}
                  type="button"
                  onClick={() => toggleBodyPart(part)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    formData.bodyParts.includes(part)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parâmetros */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Séries *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.sets}
                onChange={e => setFormData({ ...formData, sets: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repetições *
              </label>
              <input
                type="text"
                required
                placeholder="10-12"
                value={formData.repetitions}
                onChange={e => setFormData({ ...formData, repetitions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração
              </label>
              <input
                type="text"
                placeholder="30 seg"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descanso *
              </label>
              <input
                type="text"
                required
                placeholder="60 seg"
                value={formData.restPeriod}
                onChange={e => setFormData({ ...formData, restPeriod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Instruções */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruções
            </label>
            {formData.instructions.map((inst, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <span className="px-3 py-2 bg-gray-100 rounded-md">{inst.order}.</span>
                <input
                  type="text"
                  value={inst.text}
                  onChange={e => updateArrayItem('instructions', index, { ...inst, text: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a instrução"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('instructions', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('instructions', { order: formData.instructions.length + 1, text: '' })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Adicionar Instrução
            </button>
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
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

