import React from 'react';
import clsx from 'clsx';
import BodyMapSVG, { type PainData } from '@/components/body-map-pro/BodyMapSVG';

export interface BodyMapProps {
  id?: string;
  painData?: PainData[];
  onRegionClick?: (regionId: string) => void;
  selectedRegionId?: string | null;
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

const BodyMap: React.FC<BodyMapProps> = ({
  id,
  painData = [],
  onRegionClick,
  selectedRegionId,
  showLabels = true,
  interactive = true,
  className,
}) => {
  const intensityLegend = [
    { label: 'Sem dor', color: '#dbeafe' },
    { label: 'Leve (1-2)', color: '#86efac' },
    { label: 'Moderada (3-4)', color: '#fde68a' },
    { label: 'Intensa (5-7)', color: '#fb923c' },
    { label: 'Muito intensa (8-10)', color: '#f87171' },
  ];

  return (
    <section
      id={id}
      className={clsx(
        'rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100/40 p-6 shadow-xl shadow-blue-100/50',
        'ring-1 ring-inset ring-blue-200/40 backdrop-blur-sm',
        className,
      )}
      aria-label="Mapa corporal anatômico"
    >
      <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Mapa Corporal Anatômico</h2>
          <p className="text-sm text-blue-700/80">
            Visualização realista da anatomia humana para registro preciso de dor.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BodyMapSVG
          view="front"
          painData={painData}
          onRegionClick={(regionId) => onRegionClick?.(regionId)}
          selectedRegionId={selectedRegionId ?? undefined}
          showLabels={showLabels}
          interactive={interactive}
        />

        <BodyMapSVG
          view="back"
          painData={painData}
          onRegionClick={(regionId) => onRegionClick?.(regionId)}
          selectedRegionId={selectedRegionId ?? undefined}
          showLabels={showLabels}
          interactive={interactive}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 p-4 text-sm text-blue-800">
        <span className="font-semibold text-blue-900">Escala de intensidade:</span>
        {intensityLegend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-blue-200"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default BodyMap;

