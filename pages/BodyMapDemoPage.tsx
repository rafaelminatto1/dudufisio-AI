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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">
              🎨 Novo Body Map Profissional
            </h1>
            <p className="text-slate-600 mt-1">
              Página de Demonstração e Teste
            </p>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg shadow-sm transition-colors font-medium ${
              showComparison
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white hover:bg-slate-100 text-slate-700'
            }`}
          >
            {showComparison ? '📍 Ver Mapa Atual' : '🔄 Ver Comparação'}
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500 text-white rounded-xl px-6 py-4">
          <h2 className="font-bold text-lg mb-2">👋 Bem-vindo ao Novo Body Map!</h2>
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
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-3">
                🔧 Informações Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Componentes Criados:
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li><code className="bg-slate-100 px-1 rounded">BodyMapProfessional.tsx</code> - Componente principal</li>
                    <li><code className="bg-slate-100 px-1 rounded">BodyMapSVG.tsx</code> - SVG anatômico</li>
                    <li><code className="bg-slate-100 px-1 rounded">BodyRegionPolygon.tsx</code> - Região clicável</li>
                    <li><code className="bg-slate-100 px-1 rounded">PainIntensityModal.tsx</code> - Modal de registro</li>
                    <li><code className="bg-slate-100 px-1 rounded">PainIntensitySlider.tsx</code> - Slider com emojis</li>
                    <li><code className="bg-slate-100 px-1 rounded">BodyMapComparison.tsx</code> - Comparação</li>
                    <li><code className="bg-slate-100 px-1 rounded">body-regions-data.ts</code> - 50+ regiões SVG</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Features Implementadas:
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
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
            <details className="bg-slate-100 border border-slate-300 rounded-lg p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                🔍 Ver Dados Brutos (JSON)
              </summary>
              <pre className="mt-3 text-xs bg-white p-4 rounded-lg overflow-auto border border-slate-200">
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
