/**
 * PainPointModal.tsx
 * Professional-grade pain point modal with comprehensive form validation
 * Implements accessibility standards and UX best practices
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, AlertCircle, Plus, Minus } from 'lucide-react';
import { BodyPoint } from '../../../types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PainScaleSelector from './PainScaleSelector';

/**
 * Validation schema for pain point form
 */
const painPointSchema = z.object({
  painLevel: z.number().min(0).max(10),
  painType: z.enum(['acute', 'chronic', 'intermittent', 'constant']),
  bodyRegion: z.enum(['cervical', 'thoracic', 'lumbar', 'sacral', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'head', 'other']),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  symptoms: z.array(z.string()).min(1, 'Pelo menos um sintoma deve ser selecionado'),
});

type PainPointFormData = z.infer<typeof painPointSchema>;

/**
 * Props interface
 */
interface PainPointModalProps {
  /** Point being edited (null for new point) */
  point: BodyPoint | null;
  /** Modal open state */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Save callback */
  onSave: (data: Partial<BodyPoint>) => Promise<void>;
  /** Delete callback */
  onDelete?: () => Promise<void>;
  /** New point coordinates */
  coordinates?: { x: number; y: number } | null;
  /** Auto-detected body region */
  bodyRegion: string;
}

/**
 * Available symptoms list
 */
const AVAILABLE_SYMPTOMS = [
  'Dor aguda',
  'Dor latejante',
  'Queimação',
  'Formigamento',
  'Dormência',
  'Rigidez',
  'Inchaço',
  'Sensibilidade ao toque',
  'Dor irradiada',
  'Espasmo muscular',
  'Fraqueza',
  'Limitação de movimento'
];

/**
 * Pain type labels
 */
const PAIN_TYPE_LABELS = {
  acute: 'Aguda',
  chronic: 'Crônica',
  intermittent: 'Intermitente',
  constant: 'Constante'
};

/**
 * Body region labels
 */
const BODY_REGION_LABELS = {
  cervical: 'Cervical',
  thoracic: 'Torácica',
  lumbar: 'Lombar',
  sacral: 'Sacral',
  shoulder: 'Ombro',
  elbow: 'Cotovelo',
  wrist: 'Punho',
  hip: 'Quadril',
  knee: 'Joelho',
  ankle: 'Tornozelo',
  head: 'Cabeça',
  other: 'Outro'
};

/**
 * Professional pain point modal component
 */
const PainPointModal: React.FC<PainPointModalProps> = ({
  point,
  isOpen,
  onClose,
  onSave,
  onDelete,
  coordinates,
  bodyRegion
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');

  const isEditing = !!point;

  /**
   * Form setup with validation
   */
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<PainPointFormData>({
    resolver: zodResolver(painPointSchema),
    defaultValues: {
      painLevel: 5,
      painType: 'acute',
      bodyRegion: 'other',
      description: '',
      symptoms: []
    },
    mode: 'onChange'
  });

  const watchedSymptoms = watch('symptoms');
  const watchedPainLevel = watch('painLevel');

  /**
   * Reset form when point changes
   */
  useEffect(() => {
    if (point) {
      reset({
        painLevel: point.painLevel,
        painType: point.painType,
        bodyRegion: point.bodyRegion,
        description: point.description,
        symptoms: point.symptoms || []
      });
    } else {
      reset({
        painLevel: 5,
        painType: 'acute',
        bodyRegion: bodyRegion as any || 'other',
        description: '',
        symptoms: []
      });
    }
  }, [point, bodyRegion, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = useCallback(async (data: PainPointFormData) => {
    setIsSubmitting(true);

    try {
      await onSave({
        ...data,
        coordinates: coordinates || point?.coordinates || { x: 0.5, y: 0.5 },
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving point:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSave, coordinates, point]);

  /**
   * Handle symptom toggle
   */
  const toggleSymptom = useCallback((symptom: string) => {
    const currentSymptoms = watchedSymptoms || [];
    const newSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];

    setValue('symptoms', newSymptoms, { shouldValidate: true });
  }, [watchedSymptoms, setValue]);

  /**
   * Add custom symptom
   */
  const addCustomSymptom = useCallback(() => {
    if (customSymptom.trim() && !watchedSymptoms.includes(customSymptom.trim())) {
      setValue('symptoms', [...watchedSymptoms, customSymptom.trim()], { shouldValidate: true });
      setCustomSymptom('');
    }
  }, [customSymptom, watchedSymptoms, setValue]);

  /**
   * Handle delete with confirmation
   */
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    if (window.confirm('Tem certeza que deseja remover este ponto de dor?')) {
      try {
        setIsSubmitting(true);
        await onDelete();
      } catch (error) {
        console.error('Error deleting point:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [onDelete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Ponto de Dor' : 'Adicionar Ponto de Dor'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Pain Level */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Nível de Dor (0-10) *
              </label>
              <Controller
                name="painLevel"
                control={control}
                render={({ field }) => (
                  <PainScaleSelector
                    value={field.value}
                    onChange={field.onChange}
                    showValue={true}
                  />
                )}
              />
              {errors.painLevel && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.painLevel.message}
                </p>
              )}
            </div>

            {/* Pain Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Tipo de Dor *
              </label>
              <Controller
                name="painType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PAIN_TYPE_LABELS).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          field.value === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={value}
                          checked={field.value === value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Body Region */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Região do Corpo *
              </label>
              <Controller
                name="bodyRegion"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {Object.entries(BODY_REGION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Sintomas *
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {AVAILABLE_SYMPTOMS.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                      watchedSymptoms.includes(symptom)
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={watchedSymptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="mr-2 text-blue-500 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>

              {/* Custom symptom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Adicionar sintoma personalizado"
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
                />
                <button
                  type="button"
                  onClick={addCustomSymptom}
                  disabled={!customSymptom.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {errors.symptoms && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.symptoms.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Descrição Detalhada *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Descreva a dor, quando começou, o que a piora ou melhora, etc."
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
              >
                <Save size={20} />
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>

              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={20} />
                  Remover
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PainPointModal;