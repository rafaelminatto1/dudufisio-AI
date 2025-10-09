// pages/ExerciseLibraryTestPage.tsx
import React, { useEffect, useState } from 'react';
import { integratedExerciseService } from '../services/integratedExerciseService';
import { exerciseProtocolService } from '../services/exerciseProtocolService';

const ExerciseLibraryTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    try {
      setLoading(true);
      
      // Teste 1: Carregar exercícios
      const exercises = integratedExerciseService.getAllExercises();
      
      // Teste 2: Carregar categorias
      const categories = integratedExerciseService.getCategories();
      
      // Teste 3: Carregar partes do corpo
      const bodyParts = integratedExerciseService.getBodyParts();
      
      // Teste 4: Carregar equipamentos
      const equipment = integratedExerciseService.getEquipment();
      
      // Teste 5: Estatísticas
      const statistics = integratedExerciseService.getStatistics();
      
      // Teste 6: Busca
      const searchResults = integratedExerciseService.searchExercises('agachamento');
      
      // Teste 7: Filtros
      const filteredResults = integratedExerciseService.searchExercises('', {
        specialty: 'esportiva'
      });
      
      // Teste 8: Links de protocolos
      const linkStats = exerciseProtocolService.getLinkStatistics();
      
      // Teste 9: Recomendações
      const recommendations = exerciseProtocolService.getRecommendations();

      setTestResults({
        exercises: {
          total: exercises.length,
          system: exercises.filter(e => !e.id.startsWith('clinical-')).length,
          clinical: exercises.filter(e => e.id.startsWith('clinical-')).length,
          sample: exercises.slice(0, 3).map(e => ({
            id: e.id,
            name: e.name,
            category: e.category,
            specialty: (e as any).specialty || 'N/A'
          }))
        },
        categories: categories,
        bodyParts: bodyParts,
        equipment: equipment,
        statistics: statistics,
        searchResults: {
          query: 'agachamento',
          count: searchResults.length,
          results: searchResults.map(e => e.name)
        },
        filteredResults: {
          specialty: 'esportiva',
          count: filteredResults.length,
          results: filteredResults.map(e => e.name)
        },
        protocolLinks: linkStats,
        recommendations: {
          count: recommendations.length,
          sample: recommendations.slice(0, 3).map(r => ({
            exercise: r.exercise.name,
            protocol: r.protocol.title,
            reason: r.reason,
            confidence: r.confidence
          }))
        }
      });
      
    } catch (error) {
      console.error('Erro nos testes:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Executando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Testes da Biblioteca de Exercícios Integrada
          </h1>
          <p className="text-gray-600 mb-6">
            Resultados dos testes de funcionamento do sistema integrado de exercícios e protocolos.
          </p>
          
          <button
            onClick={runTests}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔄 Executar Testes Novamente
          </button>
        </div>

        {testResults.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Erro nos Testes</h2>
            <p className="text-red-600">{testResults.error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exercícios */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Exercícios</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total:</span> {testResults.exercises?.total || 0}</p>
                <p><span className="font-medium">Sistema:</span> {testResults.exercises?.system || 0}</p>
                <p><span className="font-medium">Clínicos:</span> {testResults.exercises?.clinical || 0}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Amostra:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {testResults.exercises?.sample?.map((e: any, i: number) => (
                    <li key={i}>• {e.name} ({e.category}) - {e.specialty}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📂 Categorias</h2>
              <p className="font-medium mb-2">Total: {testResults.categories?.length || 0}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {testResults.categories?.map((cat: string, i: number) => (
                  <li key={i}>• {cat}</li>
                ))}
              </ul>
            </div>

            {/* Partes do Corpo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏃 Partes do Corpo</h2>
              <p className="font-medium mb-2">Total: {testResults.bodyParts?.length || 0}</p>
              <div className="flex flex-wrap gap-2">
                {testResults.bodyParts?.slice(0, 8).map((part: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {part}
                  </span>
                ))}
                {(testResults.bodyParts?.length || 0) > 8 && (
                  <span className="text-xs text-gray-500">
                    +{(testResults.bodyParts?.length || 0) - 8} mais...
                  </span>
                )}
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏋️ Equipamentos</h2>
              <p className="font-medium mb-2">Total: {testResults.equipment?.length || 0}</p>
              <div className="flex flex-wrap gap-2">
                {testResults.equipment?.map((equip: string, i: number) => (
                  <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {equip}
                  </span>
                ))}
              </div>
            </div>

            {/* Busca */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Busca</h2>
              <p className="font-medium mb-2">
                Query: "{testResults.searchResults?.query}"
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Resultados: {testResults.searchResults?.count || 0}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {testResults.searchResults?.results?.map((result: string, i: number) => (
                  <li key={i}>• {result}</li>
                ))}
              </ul>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Filtros</h2>
              <p className="font-medium mb-2">
                Especialidade: {testResults.filteredResults?.specialty}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Resultados: {testResults.filteredResults?.count || 0}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {testResults.filteredResults?.results?.map((result: string, i: number) => (
                  <li key={i}>• {result}</li>
                ))}
              </ul>
            </div>

            {/* Links de Protocolos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔗 Links de Protocolos</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total de Links:</span> {testResults.protocolLinks?.totalLinks || 0}</p>
                <p><span className="font-medium">Protocolos com Exercícios:</span> {testResults.protocolLinks?.protocolsWithExercises || 0}</p>
                <p><span className="font-medium">Exercícios com Protocolos:</span> {testResults.protocolLinks?.exercisesWithProtocols || 0}</p>
                <p><span className="font-medium">Média Exercícios/Protocolo:</span> {testResults.protocolLinks?.averageExercisesPerProtocol?.toFixed(1) || 0}</p>
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Recomendações</h2>
              <p className="font-medium mb-2">
                Total: {testResults.recommendations?.count || 0}
              </p>
              <div className="space-y-3">
                {testResults.recommendations?.sample?.map((rec: any, i: number) => (
                  <div key={i} className="bg-yellow-50 p-3 rounded border">
                    <p className="font-medium text-sm">{rec.exercise} → {rec.protocol}</p>
                    <p className="text-xs text-gray-600">{rec.reason}</p>
                    <p className="text-xs text-blue-600">Confiança: {(rec.confidence * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✅ Status dos Testes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.exercises?.total > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Exercícios</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.categories?.length > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Categorias</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.protocolLinks?.totalLinks > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Links</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.recommendations?.count > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Recomendações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryTestPage;
