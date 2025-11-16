import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Info } from 'lucide-react';
import PainIntensitySlider from './PainIntensitySlider';
import { BODY_REGIONS_FRONT, BODY_REGIONS_BACK } from './body-regions-data';

export interface PainModalData {
  regionId: string;
  intensity: number;
  type: string;
  notes: string;
}

interface PainIntensityModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionId: string | null;
  view: 'front' | 'back';
  initialData?: Partial<PainModalData>;
  onSave: (data: PainModalData) => void;
  onDelete?: (regionId: string) => void;
}

const PAIN_TYPES = [
  { value: 'aguda', label: 'Aguda', emoji: '⚡' },
  { value: 'latejante', label: 'Latejante', emoji: '💓' },
  { value: 'queimacao', label: 'Queimação', emoji: '🔥' },
  { value: 'formigamento', label: 'Formigamento', emoji: '✨' },
  { value: 'cansaco', label: 'Cansaço', emoji: '😴' },
  { value: 'pontada', label: 'Pontada', emoji: '📍' },
  { value: 'pressao', label: 'Pressão', emoji: '💪' },
  { value: 'choque', label: 'Choque', emoji: '⚡' }
];

/**
 * Modal de Registro de Dor
 *
 * Features:
 * - Slider de intensidade com emojis
 * - Seleção de tipo de dor
 * - Campo de observações
 * - Salvar ou deletar
 * - Animações suaves
 */
const PainIntensityModal: React.FC<PainIntensityModalProps> = ({
  isOpen,
  onClose,
  regionId,
  view,
  initialData,
  onSave,
  onDelete
}) => {
  // State
  const [intensity, setIntensity] = useState(initialData?.intensity ?? 5);
  const [painType, setPainType] = useState(initialData?.type ?? 'aguda');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Reset quando regionId mudar
  useEffect(() => {
    if (regionId) {
      setIntensity(initialData?.intensity ?? 5);
      setPainType(initialData?.type ?? 'aguda');
      setNotes(initialData?.notes ?? '');
    }
  }, [regionId, initialData]);

  // Encontrar região
  const regions = view === 'front' ? BODY_REGIONS_FRONT : BODY_REGIONS_BACK;
  const region = regions.find(r => r.id === regionId);

  if (!isOpen || !region) return null;

  // Handlers
  const handleSave = () => {
    if (!regionId) return;

    onSave({
      regionId,
      intensity,
      type: painType,
      notes
    });

    onClose();
  };

  const handleDelete = () => {
    if (!regionId) return;

    if (confirm(`Tem certeza que deseja remover o registro de dor em "${region.name}"?`)) {
      onDelete?.(regionId);
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset
    setIntensity(initialData?.intensity ?? 5);
    setPainType(initialData?.type ?? 'aguda');
    setNotes(initialData?.notes ?? '');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {region.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Registrar dor nesta região
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Intensidade da Dor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Intensidade da Dor
                  </label>
                  <PainIntensitySlider
                    value={intensity}
                    onChange={setIntensity}
                    showEmojis={true}
                    showLabels={true}
                  />
                </div>

                {/* Tipo de Dor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Tipo de Dor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAIN_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPainType(type.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          painType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Dor ao movimento acima de 90°, piora à noite..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Dica Profissional</p>
                    <p className="text-blue-700">
                      Seja específico nas observações. Detalhes sobre movimento, posição e fatores de alívio/piora ajudam no diagnóstico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                {/* Delete Button (se já existe registro) */}
                <div>
                  {initialData && onDelete && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PainIntensityModal;
