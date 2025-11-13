import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PAIN_TYPE_OPTIONS, type PainTypeValue } from './constants';
import { getPainColor, PAIN_INTENSITY_LABELS } from '@/components/body-map-pro/body-regions-data';
import clsx from 'clsx';

interface PainRegionModalProps {
  open: boolean;
  regionId?: string | null;
  regionName?: string;
  initialIntensity?: number;
  initialType?: PainTypeValue;
  initialNotes?: string;
  onClose: () => void;
  onSave: (payload: {
    regionId: string;
    intensity: number;
    type: PainTypeValue;
    notes: string;
  }) => void;
  onClear?: (regionId: string) => void;
}

const DEFAULT_INTENSITY = 0;
const DEFAULT_TYPE: PainTypeValue = 'aguda';

const PainRegionModal: React.FC<PainRegionModalProps> = ({
  open,
  regionId,
  regionName,
  initialIntensity = DEFAULT_INTENSITY,
  initialType = DEFAULT_TYPE,
  initialNotes = '',
  onClose,
  onSave,
  onClear,
}) => {
  const [intensity, setIntensity] = useState<number>(initialIntensity);
  const [painType, setPainType] = useState<PainTypeValue>(initialType);
  const [notes, setNotes] = useState<string>(initialNotes);

  useEffect(() => {
    if (open) {
      setIntensity(initialIntensity);
      setPainType(initialType);
      setNotes(initialNotes);
    }
  }, [open, initialIntensity, initialType, initialNotes]);

  const previewColor = useMemo(() => getPainColor(intensity), [intensity]);
  const intensityLabel = PAIN_INTENSITY_LABELS[Math.round(intensity)] ?? `${intensity}/10`;

  const handleSave = () => {
    if (!regionId) return;

    // Intensidade 0 remove o registro
    if (intensity <= 0) {
      onClear?.(regionId);
      onClose();
      return;
    }

    onSave({
      regionId,
      intensity,
      type: painType,
      notes: notes.trim(),
    });
  };

  const handleClear = () => {
    if (!regionId) return;
    onClear?.(regionId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-50/95 backdrop-blur border border-blue-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-900">
            {regionName ?? 'Região selecionada'}
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-700/80">
            Informe a intensidade da dor, o tipo predominante e registre observações clínicas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-inner">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wide text-blue-600">Intensidade</span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-blue-900">{intensity}</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {intensityLabel}
                  </span>
                </div>
              </div>

              <div
                className={clsx(
                  'flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-blue-200 text-xs font-semibold uppercase tracking-wide text-blue-900 shadow-sm',
                  intensity > 0 ? 'bg-white/80' : 'bg-slate-50',
                )}
                style={{
                  background: intensity > 0 ? previewColor : undefined,
                  color: intensity > 7 ? '#fff' : undefined,
                  borderColor: intensity > 0 ? previewColor : undefined,
                }}
              >
                {intensity > 0 ? `${intensity}/10` : 'Sem dor'}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Slider
                value={[intensity]}
                onValueChange={([value]) => setIntensity(value)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs font-semibold text-blue-700/80">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-inner">
            <span className="text-xs uppercase tracking-wide text-blue-600">Tipo de dor</span>
            <RadioGroup
              value={painType}
              onValueChange={(value: PainTypeValue) => setPainType(value)}
              className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              {PAIN_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={clsx(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-all',
                    option.value === painType
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-blue-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/60',
                  )}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-inner">
            <Label htmlFor="pain-notes" className="text-xs uppercase tracking-wide text-blue-600">
              Observações clínicas
            </Label>
            <Textarea
              id="pain-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex.: Dor piora ao levantar o braço, sensação de latejamento constante..."
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border-blue-200 bg-white focus:border-blue-400 focus:ring-blue-500"
            />
          </section>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleClear}
            disabled={!regionId}
          >
            Limpar
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-blue-700 hover:bg-blue-100"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSave}
              disabled={!regionId}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PainRegionModal;

