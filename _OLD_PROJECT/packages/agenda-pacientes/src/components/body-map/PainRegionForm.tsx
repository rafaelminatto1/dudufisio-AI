/**
 * PAIN REGION FORM
 * Formulário para adicionar/editar pontos de dor no mapa corporal
 */

import React, { useState, useEffect } from 'react';
import type { BodyMapPainRegion, BodyRegionReference } from '../../types';
import { PAIN_TYPES, getPainLevelColor, getPainLevelLabel } from '../../services/bodyMapService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PainRegionFormProps {
  region?: BodyMapPainRegion;
  bodySide: 'front' | 'back';
  coordinatesX: number;
  coordinatesY: number;
  bodyRegions: BodyRegionReference[];
  isMainComplaint?: boolean;
  onSave: (data: Partial<BodyMapPainRegion>) => Promise<void>;
  onCancel: () => void;
  onResolve?: (regionId: string) => Promise<void>;
}

const PainRegionForm: React.FC<PainRegionFormProps> = ({
  region,
  bodySide,
  coordinatesX,
  coordinatesY,
  bodyRegions,
  isMainComplaint = false,
  onSave,
  onCancel,
  onResolve,
}) => {
  const [painLevel, setPainLevel] = useState(region?.painLevel || 5);
  const [selectedPainTypes, setSelectedPainTypes] = useState<string[]>(region?.painTypes || []);
  const [symptoms, setSymptoms] = useState(region?.symptoms?.join(', ') || '');
  const [description, setDescription] = useState(region?.description || '');
  const [selectedBodyRegion, setSelectedBodyRegion] = useState(region?.bodyRegion || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar regiões pelo lado do corpo
  const filteredBodyRegions = bodyRegions.filter(
    r => r.bodySide === bodySide || r.bodySide === 'both'
  );

  const handlePainTypeToggle = (type: string) => {
    setSelectedPainTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBodyRegion) {
      alert('Por favor, selecione uma região do corpo');
      return;
    }

    if (selectedPainTypes.length === 0) {
      alert('Por favor, selecione pelo menos um tipo de dor');
      return;
    }

    setIsSubmitting(true);

    try {
      const data: Partial<BodyMapPainRegion> = {
        painLevel,
        painTypes: selectedPainTypes,
        symptoms: symptoms
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0),
        description,
        bodyRegion: selectedBodyRegion,
      };

      // Se está criando novo ponto
      if (!region) {
        data.bodySide = bodySide;
        data.coordinatesX = coordinatesX;
        data.coordinatesY = coordinatesY;
        data.isMainComplaint = isMainComplaint;
        data.isActive = true;
      }

      await onSave(data);
    } catch (error) {
      console.error('Error saving pain region:', error);
      alert('Erro ao salvar região de dor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!region || !onResolve) return;

    if (confirm('Tem certeza que deseja marcar esta dor como resolvida?')) {
      setIsSubmitting(true);
      try {
        await onResolve(region.id);
      } catch (error) {
        console.error('Error resolving pain region:', error);
        alert('Erro ao resolver região de dor');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {region ? 'Editar Ponto de Dor' : 'Adicionar Ponto de Dor'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {bodySide === 'front' ? 'Vista Frontal' : 'Vista Posterior'} • 
            Posição: {coordinatesX.toFixed(1)}%, {coordinatesY.toFixed(1)}%
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Região do Corpo */}
        <div>
          <Label htmlFor="body-region" className="text-sm font-semibold text-slate-700 mb-2">
            Região do Corpo *
          </Label>
          <select
            id="body-region"
            value={selectedBodyRegion}
            onChange={(e) => setSelectedBodyRegion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecione uma região</option>
            {filteredBodyRegions.map(region => (
              <option key={region.id} value={region.regionKey}>
                {region.regionNamePt}
              </option>
            ))}
          </select>
        </div>

        {/* Nível de Dor */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            Nível de Dor (0-10) *
          </Label>
          
          <div className="space-y-4">
            {/* Slider */}
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    ${getPainLevelColor(0)} 0%, 
                    ${getPainLevelColor(5)} 50%, 
                    ${getPainLevelColor(10)} 100%)`
                }}
              />
            </div>

            {/* Display do nível */}
            <div className="flex items-center justify-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: getPainLevelColor(painLevel) }}
              >
                {painLevel}
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-800">
                  {getPainLevelLabel(painLevel)}
                </div>
                <div className="text-sm text-slate-600">
                  Escala EVA de Dor
                </div>
              </div>
            </div>

            {/* Escala visual */}
            <div className="flex gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPainLevel(i)}
                  className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                    painLevel === i
                      ? 'ring-2 ring-blue-500 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: getPainLevelColor(i), color: '#fff' }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tipos de Dor */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            Tipo(s) de Dor *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PAIN_TYPES.map(({ value, label }) => {
              const isSelected = selectedPainTypes.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePainTypeToggle(value)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedPainTypes.length === 0 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Selecione pelo menos um tipo de dor
            </p>
          )}
        </div>

        {/* Sintomas Associados */}
        <div>
          <Label htmlFor="symptoms" className="text-sm font-semibold text-slate-700 mb-2">
            Sintomas Associados (separados por vírgula)
          </Label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Ex: rigidez, dormência, fraqueza muscular"
            className="min-h-[80px]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Liste sintomas adicionais que acompanham a dor
          </p>
        </div>

        {/* Descrição Adicional */}
        <div>
          <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2">
            Descrição / Observações
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva características adicionais da dor, quando começou, o que piora/melhora..."
            className="min-h-[100px]"
          />
        </div>

        {/* Checkbox Queixa Principal (apenas se criando novo) */}
        {!region && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="is-main-complaint"
                checked={isMainComplaint}
                disabled
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="is-main-complaint" className="text-sm font-semibold text-amber-900 cursor-pointer">
                  Esta é a queixa principal do paciente
                </Label>
                <p className="text-xs text-amber-700 mt-1">
                  {isMainComplaint 
                    ? 'Definida no cadastro do paciente e aparecerá destacada'
                    : 'A queixa principal pode ser definida no cadastro do paciente'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Atual (se editando) */}
        {region && (
          <div className={`border-2 rounded-lg p-4 ${
            region.isActive
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {region.isActive ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Dor Ativa</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Dor Resolvida</span>
                </>
              )}
            </div>
            {region.resolvedAt && (
              <p className="text-xs text-slate-600">
                Resolvida em: {new Date(region.resolvedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>

          {region && region.isActive && onResolve && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResolve}
              disabled={isSubmitting}
              className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como Resolvida
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || selectedPainTypes.length === 0 || !selectedBodyRegion}
            className="flex-1"
          >
            {isSubmitting ? 'Salvando...' : region ? 'Atualizar' : 'Adicionar Ponto'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PainRegionForm;

