import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BodyMapInteractive, PainComparisonPanel, PAIN_TYPE_OPTIONS, type PainTypeValue } from '@/src/components/BodyMap';
import { usePainMap } from '@/src/hooks/usePainMap';
import { useToast } from '@/components/ui/use-toast';
import type { PainData } from '../components/body-map-pro';
import { exportPainMapToPDF } from '@/src/utils/exportPainMap';
import { Button } from '@/components/ui/button';

/**
 * Página de Demonstração do Novo Body Map
 *
 * Para testar: http://localhost:5173/body-map-demo
 */
const BodyMapDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientId = 'PAT-001';
  const professionalId = 'demo-physio';

  // State - Dados de exemplo
  const [painData, setPainData] = useState<PainData[]>([
    {
      regionId: 'shoulder_left',
      intensity: 7,
      type: 'latejante',
      notes: 'Dor ao movimento acima de 90°'
    },
    {
      regionId: 'lumbar_spine',
      intensity: 5,
      type: 'rigidez',
      notes: 'Piora ao sentar por muito tempo'
    },
    {
      regionId: 'knee_right',
      intensity: 3,
      type: 'aguda',
      notes: 'Leve desconforto ao subir escadas'
    }
  ]);

  const [showComparison, setShowComparison] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const painTypeSet = useMemo(
    () => new Set<PainTypeValue>(PAIN_TYPE_OPTIONS.map((option) => option.value)),
    [],
  );

  const {
    data: snapshot,
    regions: remoteRegions,
    isLoading: isPainMapLoading,
    isSaving: isSavingPainMap,
    save: savePainMap,
  } = usePainMap({ patientId, professionalId });

  const remotePainData = useMemo<PainData[]>(
    () =>
      remoteRegions.map((region) => ({
        regionId: region.regionId,
        intensity: region.intensity,
        type: region.type,
        notes: region.notes,
      })),
    [remoteRegions],
  );

  useEffect(() => {
    if (snapshot) {
      setPainData(remotePainData);
    }
  }, [snapshot, remotePainData]);

  const painTypeLabels = useMemo(() => {
    const map = new Map<string, string>();
    PAIN_TYPE_OPTIONS.forEach(option => {
      map.set(option.value, option.label);
    });
    return map;
  }, []);

  const stats = useMemo(() => {
    const total = painData.length;
    const average = total > 0
      ? painData.reduce((sum, region) => sum + region.intensity, 0) / total
      : 0;
    const max = total > 0 ? Math.max(...painData.map(region => region.intensity)) : 0;
    const highPain = painData.filter(region => region.intensity >= 8).length;
    const distribution = painData.reduce<Record<string, number>>((acc, region) => {
      const key = region.type || 'aguda';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const topTypes = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, average, max, highPain, topTypes };
  }, [painData]);

  const buildRegionEntries = useCallback(
    (regions: PainData[]) =>
      regions.map((region) => ({
        regionId: region.regionId,
        intensity: region.intensity,
        type: painTypeSet.has(region.type as PainTypeValue)
          ? (region.type as PainTypeValue)
          : 'aguda',
        notes: region.notes,
      })),
    [painTypeSet],
  );

  const handlePainDataChange = useCallback(
    async (regions: PainData[]) => {
      setPainData(regions);

      try {
        await savePainMap({
          regions: buildRegionEntries(regions),
          sessionDate: new Date(),
        });

        toast({
          title: 'Mapa de dor atualizado',
          description: 'Os registros foram salvos com sucesso.',
        });
      } catch (error) {
        console.error('Erro ao salvar mapa de dor', error);
        toast({
          title: 'Erro ao salvar mapa',
          description: 'Não foi possível salvar as alterações. Tente novamente.',
        });
      }
    },
    [buildRegionEntries, savePainMap, toast],
  );

  const handleExportPDF = useCallback(async () => {
    try {
      setIsExporting(true);
      const upToDateSnapshot = await savePainMap({
        regions: buildRegionEntries(painData),
        sessionDate: new Date(),
      });

      await exportPainMapToPDF({
        elementId: 'pain-map-capture',
        snapshot: upToDateSnapshot,
        patientName: 'João Silva (DEMO)',
        professionalName: professionalId,
      });

      toast({
        title: 'PDF gerado',
        description: 'O mapa corporal foi exportado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar mapa de dor', error);
      toast({
        title: 'Erro ao exportar PDF',
        description: 'Não foi possível gerar o relatório. Tente novamente.',
      });
    } finally {
      setIsExporting(false);
    }
  }, [buildRegionEntries, painData, professionalId, savePainMap, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-lg">
      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2 bg-white shadow-card hover:bg-neutral-bgDark"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-text">
              🎨 Novo Body Map Profissional
            </h1>
            <p className="text-neutral-textSecondary mt-xs">
              Página de Demonstração e Teste
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-md py-sm rounded-lg shadow-card transition-colors font-medium ${
                showComparison
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-white hover:bg-neutral-bgDark text-neutral-text'
              }`}
              aria-pressed={showComparison}
            >
              {showComparison ? '📍 Ver Mapa Atual' : '🔄 Ver Comparação'}
            </button>

            <Button
              onClick={handleExportPDF}
              disabled={isExporting || isSavingPainMap}
              aria-busy={isExporting}
              className="bg-blue-600 text-white shadow-card hover:bg-blue-700"
            >
              {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary text-white rounded-card px-lg py-md">
          <h2 className="font-bold text-lg mb-sm">👋 Bem-vindo ao Novo Body Map!</h2>
          <ul className="text-sm space-y-1 text-blue-100">
            <li>✅ Clique em qualquer região anatômica (frente e costas)</li>
            <li>✅ Defina a intensidade (0-10) com feedback cromático</li>
            <li>✅ Escolha o tipo de dor predominante</li>
            <li>✅ Adicione observações clínicas detalhadas</li>
            <li>✅ Visualize indicadores de dor em tempo real</li>
            <li>✅ Compare sessões anteriores em um clique</li>
          </ul>
        </div>

        {/* Conteúdo Principal */}
        {!showComparison ? (
          <>
            {/* Body Map Principal */}
            <BodyMapInteractive
              initialData={painData}
              onChange={handlePainDataChange}
              mapElementId="pain-map-capture"
            />

            {isPainMapLoading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2 text-sm text-blue-700">
                Carregando dados clínicos do paciente...
              </div>
            )}

            {isSavingPainMap && !isPainMapLoading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2 text-sm text-blue-700">
                Salvando alterações no mapa corporal...
              </div>
            )}

            {/* Indicadores da Sessão */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg">
                <span className="text-xs uppercase tracking-wide text-blue-600">Regiões registradas</span>
                <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.total}</p>
                <p className="text-sm text-blue-700/80">Total de áreas com dor ativa nesta sessão.</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg">
                <span className="text-xs uppercase tracking-wide text-blue-600">Dor média</span>
                <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.average.toFixed(1)}</p>
                <p className="text-sm text-blue-700/80">Intensidade média considerando todas as regiões.</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg">
                <span className="text-xs uppercase tracking-wide text-blue-600">Pico de dor</span>
                <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.max}</p>
                <p className="text-sm text-blue-700/80">Maior intensidade individual registrada.</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg">
                <span className="text-xs uppercase tracking-wide text-blue-600">Dor intensa (≥8)</span>
                <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.highPain}</p>
                <p className="text-sm text-blue-700/80">Regiões críticas que merecem atenção prioritária.</p>
              </div>
            </div>

            {/* Distribuição de Tipos de Dor */}
            <div className="rounded-2xl border border-blue-100 bg-white/95 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Tipos de dor mais frequentes</h3>
              {stats.topTypes.length > 0 ? (
                <div className="space-y-3">
                  {stats.topTypes.map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {painTypeLabels.get(type) ?? type}
                        </p>
                        <p className="text-xs text-blue-700/75">Registros nesta sessão</p>
                      </div>
                      <span className="text-lg font-semibold text-blue-900">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-700/80">Nenhum tipo de dor registrado até o momento.</p>
              )}
            </div>

            {/* Informações Técnicas */}
            <div className="rounded-2xl border border-blue-100 bg-white/95 p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">🔧 Informações Técnicas</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Componentes criados
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700/80 list-disc list-inside">
                    <li><code className="bg-blue-50 px-1 rounded">src/components/BodyMap/BodyMap.tsx</code> – Visualização anatômica dupla</li>
                    <li><code className="bg-blue-50 px-1 rounded">src/components/BodyMap/BodyMapInteractive.tsx</code> – Gestão de estado e UI</li>
                    <li><code className="bg-blue-50 px-1 rounded">src/components/BodyMap/PainRegionModal.tsx</code> – Modal clínico completo</li>
                    <li><code className="bg-blue-50 px-1 rounded">components/body-map-pro/BodyRegionPolygon.tsx</code> – Polígonos com gradiente</li>
                    <li><code className="bg-blue-50 px-1 rounded">components/body-map-pro/body-regions-data.ts</code> – 60 regiões anatômicas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Destaques de UX
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700/80 list-disc list-inside">
                    <li>🌈 Gradiente de intensidade calibrado para a escala 0-10</li>
                    <li>🧭 Vista frontal e posterior simultânea para avaliação rápida</li>
                    <li>🗂️ Lista interativa de regiões com resumo automático</li>
                    <li>📝 Modal com tipos de dor, notas e limpeza em um clique</li>
                    <li>📊 Indicadores consolidados em tempo real</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dados Atuais (Debug) */}
            <details className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-blue-900">
              <summary className="font-semibold cursor-pointer">
                🔍 Ver Dados Brutos (JSON)
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-white/90 p-4 text-xs text-blue-900 shadow-inner">
                {JSON.stringify(painData, null, 2)}
              </pre>
            </details>
          </>
        ) : (
          <PainComparisonPanel
            patientId={patientId}
            patientName="João Silva (DEMO)"
          />
        )}
      </div>
    </div>
  );
};

export default BodyMapDemoPage;
