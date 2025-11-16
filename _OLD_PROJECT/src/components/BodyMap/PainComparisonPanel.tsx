import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RefreshCcw, CalendarClock } from 'lucide-react';
import { BodyMapComparison, type PainData } from '@/components/body-map-pro';
import {
  usePainMapHistory,
} from '@/src/hooks/usePainMapHistory';
import type { PainMapSnapshot } from '@/src/services/painMaps';
import type { PainEvolutionPoint } from '@/src/services/painMaps';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface PainComparisonPanelProps {
  patientId: string;
  patientName: string;
  className?: string;
}

const formatSessionLabel = (snapshot: PainMapSnapshot): string => {
  const date = snapshot.session.sessionDate
    ? new Date(snapshot.session.sessionDate)
    : null;
  const formattedDate = date
    ? date.toLocaleDateString('pt-BR')
    : 'Data indisponível';
  return `${formattedDate} • ${snapshot.regions.length} região(ões)`;
};

const toPainData = (snapshot: PainMapSnapshot | undefined): PainData[] =>
  snapshot
    ? snapshot.regions.map((region) => ({
        regionId: region.regionId,
        intensity: region.intensity,
        type: region.type,
        notes: region.notes,
      }))
    : [];

const PainEvolutionMiniChart: React.FC<{ points: PainEvolutionPoint[] }> = ({ points }) => {
  if (!points.length) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
        Ainda não há histórico suficiente para gerar o gráfico de evolução.
      </div>
    );
  }

  const data = [...points]
    .slice()
    .reverse()
    .map((point, index) => ({
      order: points.length - index,
      date: point.sessionDate.toLocaleDateString('pt-BR'),
      averageIntensity: Number(point.averageIntensity.toFixed(1)),
      maxIntensity: point.maxIntensity,
      activeRegions: point.activeRegions,
    }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#1d4ed8"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#1d4ed8"
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            label={{
              value: 'EVA',
              angle: -90,
              position: 'insideLeft',
              fill: '#1d4ed8',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #bfdbfe',
              borderRadius: 12,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageIntensity"
            name="Média"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="maxIntensity"
            name="Máxima"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: '#ef4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PainComparisonPanel: React.FC<PainComparisonPanelProps> = ({
  patientId,
  patientName,
  className,
}) => {
  const { history, points, isLoading, isError, refetch } = usePainMapHistory(patientId);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [previousSessionId, setPreviousSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (history.length === 0) {
      setCurrentSessionId(null);
      setPreviousSessionId(null);
      return;
    }

    setCurrentSessionId(history[0].session.id);
    setPreviousSessionId(history[1]?.session.id ?? history[0].session.id);
  }, [history]);

  const currentSnapshot = useMemo(
    () => history.find((item) => item.session.id === currentSessionId),
    [history, currentSessionId],
  );
  const previousSnapshot = useMemo(
    () => history.find((item) => item.session.id === previousSessionId),
    [history, previousSessionId],
  );

  const currentPainData = useMemo(() => toPainData(currentSnapshot), [currentSnapshot]);
  const previousPainData = useMemo(() => toPainData(previousSnapshot), [previousSnapshot]);

  return (
    <Card className={clsx('border-blue-100 shadow-lg shadow-blue-100/50', className)}>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-lg text-blue-900">Comparação entre Sessões</CardTitle>
          <p className="text-sm text-blue-700/80">
            Visualize a evolução da dor por região e acompanhe a tendência geral do paciente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value === 'front' || value === 'back') {
                setView(value);
              }
            }}
            className="rounded-xl border border-blue-100 bg-blue-50/60"
          >
            <ToggleGroupItem value="front" className="px-3 py-2 text-sm">
              Vista Frontal
            </ToggleGroupItem>
            <ToggleGroupItem value="back" className="px-3 py-2 text-sm">
              Vista Posterior
            </ToggleGroupItem>
          </ToggleGroup>

  <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6 text-center text-blue-700">
            Carregando histórico clínico...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 text-center text-red-700">
            Não foi possível carregar o histórico. Tente novamente.
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6 text-center text-blue-700">
            Nenhuma sessão de mapa corporal registrada para este paciente.
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  <CalendarClock className="h-4 w-4" />
                  Sessão atual
                </p>
                <Select
                  value={currentSessionId ?? undefined}
                  onValueChange={(value) => setCurrentSessionId(value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione uma sessão" />
                  </SelectTrigger>
                  <SelectContent>
                    {history.map((snapshot) => (
                      <SelectItem key={snapshot.session.id} value={snapshot.session.id}>
                        {formatSessionLabel(snapshot)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  <CalendarClock className="h-4 w-4" />
                  Sessão para comparação
                </p>
                <Select
                  value={previousSessionId ?? undefined}
                  onValueChange={(value) => setPreviousSessionId(value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione uma sessão" />
                  </SelectTrigger>
                  <SelectContent>
                    {history.map((snapshot) => (
                      <SelectItem key={snapshot.session.id} value={snapshot.session.id}>
                        {formatSessionLabel(snapshot)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentSnapshot && previousSnapshot ? (
              <BodyMapComparison
                patientName={patientName}
                previousSession={{
                  date: previousSnapshot.session.sessionDate.toLocaleDateString('pt-BR'),
                  painData: previousPainData,
                }}
                currentSession={{
                  date: currentSnapshot.session.sessionDate.toLocaleDateString('pt-BR'),
                  painData: currentPainData,
                }}
                view={view}
              />
            ) : (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6 text-center text-blue-700">
                Selecione duas sessões para realizar a comparação detalhada.
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Evolução da intensidade média
              </h3>
              <PainEvolutionMiniChart points={points} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PainComparisonPanel;

