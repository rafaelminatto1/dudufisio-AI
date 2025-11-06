import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BodyMapProfessional,
  BodyMapComparison,
  type PainData,
  type PainModalData
} from '../components/body-map-pro';

/**
 * Página de Demonstração do Novo Body Map
 *
 * Para testar: http://localhost:5173/body-map-demo
 */
const BodyMapDemoPage: React.FC = () => {
  const navigate = useNavigate();

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
      type: 'pressao',
      notes: 'Piora ao sentar por muito tempo'
    },
    {
      regionId: 'knee_right',
      intensity: 3,
      type: 'pontada',
      notes: 'Leve desconforto ao subir escadas'
    }
  ]);

  const [showComparison, setShowComparison] = useState(false);

  // Dados de sessão anterior (mock)
  const previousSession = {
    date: '15/10/2025',
    painData: [
      { regionId: 'shoulder_left', intensity: 9, type: 'aguda', notes: '' },
      { regionId: 'lumbar_spine', intensity: 6, type: 'pressao', notes: '' },
      { regionId: 'elbow_left', intensity: 4, type: 'formigamento', notes: '' }
    ]
  };

  const currentSession = {
    date: '28/10/2025',
    painData: painData
  };

  // Handlers
  const handleSavePainData = (data: PainModalData) => {
    console.log('💾 Salvando dados de dor:', data);

    setPainData(prev => {
      const existingIndex = prev.findIndex(p => p.regionId === data.regionId);

      if (existingIndex >= 0) {
        // Atualizar existente
        const updated = [...prev];
        updated[existingIndex] = {
          regionId: data.regionId,
          intensity: data.intensity,
          type: data.type,
          notes: data.notes
        };
        return updated;
      } else {
        // Adicionar novo
        return [
          ...prev,
          {
            regionId: data.regionId,
            intensity: data.intensity,
            type: data.type,
            notes: data.notes
          }
        ];
      }
    });

    alert(`✅ Dor registrada com sucesso!\n\nRegião: ${data.regionId}\nIntensidade: ${data.intensity}/10\nTipo: ${data.type}`);
  };

  const handleDeletePainData = (regionId: string) => {
    console.log('🗑️ Deletando região:', regionId);

    setPainData(prev => prev.filter(p => p.regionId !== regionId));

    alert(`✅ Registro de dor removido!`);
  };

  const handleViewHistory = () => {
    alert('📚 Ver Histórico - Em breve!\n\nAqui você verá o histórico completo de todas as sessões.');
  };

  const handleViewCharts = () => {
    alert('📊 Ver Gráficos - Em breve!\n\nAqui você verá gráficos de evolução da dor ao longo do tempo.');
  };

  const handleGenerateReport = () => {
    alert('📄 Gerar Relatório PDF - Em breve!\n\nAqui você poderá gerar um relatório em PDF com os dados de evolução.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-lg">
      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-sm px-md py-sm bg-white hover:bg-neutral-bgDark rounded-lg shadow-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-text">
              🎨 Novo Body Map Profissional
            </h1>
            <p className="text-neutral-textSecondary mt-xs">
              Página de Demonstração e Teste
            </p>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-md py-sm rounded-lg shadow-card transition-colors font-medium ${
              showComparison
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white hover:bg-neutral-bgDark text-neutral-text'
            }`}
          >
            {showComparison ? '📍 Ver Mapa Atual' : '🔄 Ver Comparação'}
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-primary text-white rounded-card px-lg py-md">
          <h2 className="font-bold text-lg mb-sm">👋 Bem-vindo ao Novo Body Map!</h2>
          <ul className="text-sm space-y-1 text-blue-100">
            <li>✅ Clique nas regiões do corpo para registrar dor</li>
            <li>✅ Use o slider com emojis para definir intensidade (0-10)</li>
            <li>✅ Selecione o tipo de dor (latejante, aguda, queimação, etc)</li>
            <li>✅ Adicione observações detalhadas</li>
            <li>✅ Visualize estatísticas em tempo real</li>
            <li>✅ Compare com sessões anteriores</li>
          </ul>
        </div>

        {/* Conteúdo Principal */}
        {!showComparison ? (
          <>
            {/* Body Map Principal */}
            <BodyMapProfessional
              patientId="demo-patient-1"
              patientName="João Silva (DEMO)"
              painData={painData}
              onSavePainData={handleSavePainData}
              onDeletePainData={handleDeletePainData}
              onViewHistory={handleViewHistory}
              onViewCharts={handleViewCharts}
              onGenerateReport={handleGenerateReport}
              readOnly={false}
            />

            {/* Informações Técnicas */}
            <div className="bg-white border border-neutral-border rounded-card p-lg">
              <h3 className="font-bold text-neutral-text mb-md">
                🔧 Informações Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <h4 className="font-semibold text-neutral-text mb-sm">
                    Componentes Criados:
                  </h4>
                  <ul className="text-sm text-neutral-textSecondary space-y-1 list-disc list-inside">
                    <li><code className="bg-neutral-bgDark px-1 rounded">BodyMapProfessional.tsx</code> - Componente principal</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">BodyMapSVG.tsx</code> - SVG anatômico</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">BodyRegionPolygon.tsx</code> - Região clicável</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">PainIntensityModal.tsx</code> - Modal de registro</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">PainIntensitySlider.tsx</code> - Slider com emojis</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">BodyMapComparison.tsx</code> - Comparação</li>
                    <li><code className="bg-neutral-bgDark px-1 rounded">body-regions-data.ts</code> - 50+ regiões SVG</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-text mb-sm">
                    Features Implementadas:
                  </h4>
                  <ul className="text-sm text-neutral-textSecondary space-y-1 list-disc list-inside">
                    <li>✅ SVG anatômico com 50+ regiões</li>
                    <li>✅ Polígonos grandes e clicáveis</li>
                    <li>✅ Hover effects e animações (Framer Motion)</li>
                    <li>✅ Slider de dor 0-10 com emojis (😊→😭)</li>
                    <li>✅ 8 tipos de dor selecionáveis</li>
                    <li>✅ Estatísticas em tempo real</li>
                    <li>✅ Vista frontal e posterior</li>
                    <li>✅ Comparação entre sessões</li>
                    <li>✅ Labels informativos</li>
                    <li>✅ Cores baseadas em intensidade</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dados Atuais (Debug) */}
            <details className="bg-neutral-bgDark border border-neutral-border rounded-lg p-md">
              <summary className="font-semibold text-neutral-text cursor-pointer">
                🔍 Ver Dados Brutos (JSON)
              </summary>
              <pre className="mt-3 text-xs bg-white p-md rounded-lg overflow-auto border border-neutral-border">
                {JSON.stringify(painData, null, 2)}
              </pre>
            </details>
          </>
        ) : (
          /* Comparação */
          <BodyMapComparison
            patientName="João Silva (DEMO)"
            previousSession={previousSession}
            currentSession={currentSession}
            view="front"
          />
        )}
      </div>
    </div>
  );
};

export default BodyMapDemoPage;
