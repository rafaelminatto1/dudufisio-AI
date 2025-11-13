import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import BodyMap from './BodyMap';
import PainRegionModal from './PainRegionModal';
import type { PainData } from '@/components/body-map-pro/BodyMapSVG';
import {
  BODY_REGIONS_FRONT,
  BODY_REGIONS_BACK,
  type BodyRegion,
  getPainColor,
  PAIN_INTENSITY_LABELS,
} from '@/components/body-map-pro/body-regions-data';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface BodyMapInteractiveProps {
  initialData?: PainData[];
  onChange?: (regions: PainData[]) => void;
  readOnly?: boolean;
  className?: string;
  mapElementId?: string;
}

const ALL_REGIONS: BodyRegion[] = [...BODY_REGIONS_FRONT, ...BODY_REGIONS_BACK];

const BodyMapInteractive: React.FC<BodyMapInteractiveProps> = ({
  initialData = [],
  onChange,
  readOnly = false,
  className,
  mapElementId,
}) => {
  const [painRegions, setPainRegions] = useState<PainData[]>(initialData);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const regionMetadata = useMemo(() => {
    const map = new Map<string, BodyRegion>();
    ALL_REGIONS.forEach((region) => {
      map.set(region.id, region);
    });
    return map;
  }, []);

  useEffect(() => {
    setPainRegions(initialData);
  }, [initialData]);

  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (readOnly) return;
      setSelectedRegionId(regionId);
      setIsModalOpen(true);
    },
    [readOnly],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRegionId(null);
  }, []);

  const handleSaveRegion = useCallback(
    (payload: { regionId: string; intensity: number; type: string; notes: string }) => {
      setPainRegions((prev) => {
        const existingIndex = prev.findIndex((region) => region.regionId === payload.regionId);

        if (payload.intensity <= 0) {
          const next = existingIndex >= 0 ? prev.filter((region) => region.regionId !== payload.regionId) : prev;
          onChange?.(next);
          return next;
        }

        const updatedRegion: PainData = {
          regionId: payload.regionId,
          intensity: payload.intensity,
          type: payload.type,
          notes: payload.notes,
        };

        let next: PainData[];
        if (existingIndex >= 0) {
          next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...updatedRegion };
        } else {
          next = [...prev, updatedRegion];
        }

        onChange?.(next);
        return next;
      });

      handleCloseModal();
    },
    [handleCloseModal, onChange],
  );

  const handleClearRegion = useCallback(
    (regionId: string) => {
      setPainRegions((prev) => {
        const next = prev.filter((region) => region.regionId !== regionId);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const currentRegion = selectedRegionId
    ? painRegions.find((region) => region.regionId === selectedRegionId)
    : undefined;

  const currentRegionName = selectedRegionId ? regionMetadata.get(selectedRegionId)?.name : undefined;

  const orderedRegions = useMemo(
    () =>
      [...painRegions].sort((a, b) => {
        if (b.intensity === a.intensity) {
          return a.regionId.localeCompare(b.regionId);
        }
        return b.intensity - a.intensity;
      }),
    [painRegions],
  );

  return (
    <div className={clsx('space-y-8', className)}>
      <BodyMap
        id={mapElementId}
        painData={painRegions}
        onRegionClick={handleRegionClick}
        selectedRegionId={selectedRegionId}
        interactive={!readOnly}
      />

      {orderedRegions.length > 0 ? (
        <Card className="border-blue-100 bg-white/95 shadow-lg shadow-blue-100/50">
          <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-900">
              Regiões registradas
            </h3>
            <p className="text-xs text-blue-700/75">
              Clique em qualquer item para ajustar intensidade, tipo de dor ou observações.
            </p>
          </div>

          <ScrollArea className="max-h-80">
            <div className="space-y-3 p-6">
              {orderedRegions.map((region) => {
                const label = regionMetadata.get(region.regionId)?.name ?? region.regionId;
                const color = getPainColor(region.intensity);
                const intensityLabel = PAIN_INTENSITY_LABELS[Math.round(region.intensity)];

                return (
                  <button
                    key={region.regionId}
                    type="button"
                    onClick={() => handleRegionClick(region.regionId)}
                    className="flex w-full items-start justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-semibold text-blue-900">{label}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          {intensityLabel ?? `${region.intensity}/10`}
                        </Badge>
                        {region.type && (
                          <Badge className="bg-blue-50 text-blue-700" variant="outline">
                            {region.type}
                          </Badge>
                        )}
                      </div>
                      {region.notes && (
                        <p className="text-xs text-blue-700/80">{region.notes}</p>
                      )}
                    </div>

                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-semibold text-blue-900 shadow-sm"
                      style={{
                        background: color || 'rgba(148, 163, 184, 0.2)',
                        color: region.intensity >= 8 ? '#ffffff' : '#1e3a8a',
                        borderColor: color || '#cbd5f5',
                      }}
                    >
                      {region.intensity}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-5 text-sm text-blue-800">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          Nenhuma região registrada ainda. Clique em qualquer área do mapa para adicionar o primeiro registro de dor.
        </div>
      )}

      <PainRegionModal
        open={isModalOpen}
        regionId={selectedRegionId}
        regionName={currentRegionName}
        initialIntensity={currentRegion?.intensity ?? 0}
        initialType={(currentRegion?.type as any) ?? 'aguda'}
        initialNotes={currentRegion?.notes ?? ''}
        onClose={handleCloseModal}
        onSave={handleSaveRegion}
        onClear={handleClearRegion}
      />
    </div>
  );
};

export default BodyMapInteractive;

