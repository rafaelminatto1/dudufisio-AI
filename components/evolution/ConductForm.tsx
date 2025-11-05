/**
 * Componente: Formulário de Adição de Conduta
 * Permite adicionar condutas estruturadas ao plano de tratamento
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Conduct, ConductCategory, CONDUCT_CATEGORIES } from '../../types/conducts';
import { commonConducts, getConductDetails } from '../../data/commonConducts';
import { validateConduct } from '../../lib/evolution/conductsFormatter';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface ConductFormProps {
  onAdd: (conduct: Conduct) => void;
  onCancel?: () => void;
}

export function ConductForm({ onAdd, onCancel }: ConductFormProps) {
  const [category, setCategory] = useState<ConductCategory>('manual_therapy');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [duration, setDuration] = useState('');
  const [equipment, setEquipment] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Auto-preencher detalhes quando uma conduta comum é selecionada
  useEffect(() => {
    if (name) {
      const conductDetails = getConductDetails(category, name);
      if (conductDetails) {
        // Sugerir primeiro item das regiões/parâmetros/equipamentos se disponível
        if (conductDetails.regions && conductDetails.regions.length > 0 && !details) {
          setDetails(conductDetails.regions[0]);
        }
        if (conductDetails.equipment && conductDetails.equipment.length > 0 && !equipment) {
          setEquipment(conductDetails.equipment[0]);
        }
      }
    }
  }, [name, category]);

  const handleAdd = () => {
    setError('');

    const conduct: Partial<Conduct> = {
      category,
      name: name.trim(),
      details: details.trim() || undefined,
      duration: duration.trim() || undefined,
      equipment: equipment.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (!validateConduct(conduct)) {
      setError('Preencha o nome da conduta');
      return;
    }

    const newConduct: Conduct = {
      id: `conduct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: conduct.category!,
      name: conduct.name!,
      details: conduct.details,
      duration: conduct.duration,
      equipment: conduct.equipment,
      notes: conduct.notes,
    };

    onAdd(newConduct);

    // Limpar formulário
    setName('');
    setDetails('');
    setDuration('');
    setEquipment('');
    setNotes('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAdd();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
      {/* Seletor de Categoria */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Categoria da Conduta
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {CONDUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`p-3 rounded-lg border-2 text-xs font-medium transition-all hover:scale-105 ${
                category === cat.value
                  ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700 shadow-md`
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              style={{
                borderColor: category === cat.value ? `var(--${cat.color}-500)` : undefined,
                backgroundColor: category === cat.value ? `var(--${cat.color}-50)` : undefined,
              }}
            >
              <div className="text-lg mb-1">{cat.emoji}</div>
              <div className="leading-tight">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Nome da Conduta com Autocomplete */}
      <div>
        <Label htmlFor="conduct_name" className="text-sm font-medium text-gray-700">
          Nome da Conduta *
        </Label>
        <input
          id="conduct_name"
          type="text"
          list="common-conducts"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex: Liberação miofascial, TENS, Série de Williams..."
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <datalist id="common-conducts">
          {commonConducts[category]?.map((conduct, index) => (
            <option key={index} value={conduct.name} />
          ))}
        </datalist>
      </div>

      {/* Detalhes e Duração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="details" className="text-sm font-medium text-gray-700">
            Região / Parâmetros
          </Label>
          <Input
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Lombar, Trapézio D, Joelho E..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duração / Séries
          </Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: 20min, 3x10rep, 3x30seg..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Equipamento */}
      <div>
        <Label htmlFor="equipment" className="text-sm font-medium text-gray-700">
          Equipamento / Material
        </Label>
        <Input
          id="equipment"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex: Thera band azul, Bola suíça, Caneleira 2kg..."
          className="mt-1"
        />
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Observações
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações adicionais sobre a conduta..."
          rows={2}
          className="mt-1"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={handleAdd}
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Adicionar Conduta
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Dica de atalho */}
      <p className="text-xs text-gray-500 text-center">
        Dica: Pressione Ctrl+Enter para adicionar rapidamente
      </p>
    </div>
  );
}

