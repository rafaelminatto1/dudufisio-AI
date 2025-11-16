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
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-md"></div>
          <p className="text-neutral-textSecondary">Executando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bgAlt py-3xl">
      <div className="max-w-6xl mx-auto px-md">
        <div className="bg-white rounded-lg shadow-card p-lg mb-xl">
          <h1 className="text-2xl font-bold text-neutral-text mb-md">
            🧪 Testes da Biblioteca de Exercícios Integrada
          </h1>
          <p className="text-neutral-textSecondary mb-xl">
            Resultados dos testes de funcionamento do sistema integrado de exercícios e protocolos.
          </p>
          
          <button
            onClick={runTests}
            className="bg-primary text-white px-md py-sm rounded-lg hover:bg-primary-hover"
          >
            🔄 Executar Testes Novamente
          </button>
        </div>

        {testResults.error ? (
          <div className="bg-error-light border border-error rounded-lg p-lg">
            <h2 className="text-lg font-semibold text-error mb-sm">❌ Erro nos Testes</h2>
            <p className="text-error">{testResults.error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Exercícios */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">📊 Exercícios</h2>
              <div className="space-y-sm">
                <p><span className="font-medium">Total:</span> {testResults.exercises?.total || 0}</p>
                <p><span className="font-medium">Sistema:</span> {testResults.exercises?.system || 0}</p>
                <p><span className="font-medium">Clínicos:</span> {testResults.exercises?.clinical || 0}</p>
              </div>
              <div className="mt-md">
                <h3 className="font-medium text-gray-700 mb-sm">Amostra:</h3>
                <ul className="text-sm text-neutral-textSecondary space-y-1">
                  {testResults.exercises?.sample?.map((e: any, i: number) => (
                    <li key={i}>• {e.name} ({e.category}) - {e.specialty}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">📂 Categorias</h2>
              <p className="font-medium mb-sm">Total: {testResults.categories?.length || 0}</p>
              <ul className="text-sm text-neutral-textSecondary space-y-1">
                {testResults.categories?.map((cat: string, i: number) => (
                  <li key={i}>• {cat}</li>
                ))}
              </ul>
            </div>

            {/* Partes do Corpo */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">🏃 Partes do Corpo</h2>
              <p className="font-medium mb-sm">Total: {testResults.bodyParts?.length || 0}</p>
              <div className="flex flex-wrap gap-sm">
                {testResults.bodyParts?.slice(0, 8).map((part: string, i: number) => (
                  <span key={i} className="bg-primary-light text-blue-800 text-xs px-sm py-1 rounded">
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
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">🏋️ Equipamentos</h2>
              <p className="font-medium mb-sm">Total: {testResults.equipment?.length || 0}</p>
              <div className="flex flex-wrap gap-sm">
                {testResults.equipment?.map((equip: string, i: number) => (
                  <span key={i} className="bg-success-light text-success text-xs px-sm py-1 rounded">
                    {equip}
                  </span>
                ))}
              </div>
            </div>

            {/* Busca */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">🔍 Busca</h2>
              <p className="font-medium mb-sm">
                Query: "{testResults.searchResults?.query}"
              </p>
              <p className="text-sm text-neutral-textSecondary mb-sm">
                Resultados: {testResults.searchResults?.count || 0}
              </p>
              <ul className="text-sm text-neutral-textSecondary space-y-1">
                {testResults.searchResults?.results?.map((result: string, i: number) => (
                  <li key={i}>• {result}</li>
                ))}
              </ul>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">🎯 Filtros</h2>
              <p className="font-medium mb-sm">
                Especialidade: {testResults.filteredResults?.specialty}
              </p>
              <p className="text-sm text-neutral-textSecondary mb-sm">
                Resultados: {testResults.filteredResults?.count || 0}
              </p>
              <ul className="text-sm text-neutral-textSecondary space-y-1">
                {testResults.filteredResults?.results?.map((result: string, i: number) => (
                  <li key={i}>• {result}</li>
                ))}
              </ul>
            </div>

            {/* Links de Protocolos */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">🔗 Links de Protocolos</h2>
              <div className="space-y-sm">
                <p><span className="font-medium">Total de Links:</span> {testResults.protocolLinks?.totalLinks || 0}</p>
                <p><span className="font-medium">Protocolos com Exercícios:</span> {testResults.protocolLinks?.protocolsWithExercises || 0}</p>
                <p><span className="font-medium">Exercícios com Protocolos:</span> {testResults.protocolLinks?.exercisesWithProtocols || 0}</p>
                <p><span className="font-medium">Média Exercícios/Protocolo:</span> {testResults.protocolLinks?.averageExercisesPerProtocol?.toFixed(1) || 0}</p>
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-white rounded-lg shadow-card p-lg">
              <h2 className="text-lg font-semibold text-neutral-text mb-md">💡 Recomendações</h2>
              <p className="font-medium mb-sm">
                Total: {testResults.recommendations?.count || 0}
              </p>
              <div className="space-y-sm">
                {testResults.recommendations?.sample?.map((rec: any, i: number) => (
                  <div key={i} className="bg-warning-light p-md rounded border">
                    <p className="font-medium text-sm">{rec.exercise} → {rec.protocol}</p>
                    <p className="text-xs text-neutral-textSecondary">{rec.reason}</p>
                    <p className="text-xs text-primary">Confiança: {(rec.confidence * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3xl bg-white rounded-lg shadow-card p-lg">
          <h2 className="text-lg font-semibold text-neutral-text mb-md">✅ Status dos Testes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {testResults.exercises?.total > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-neutral-textSecondary">Exercícios</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {testResults.categories?.length > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-neutral-textSecondary">Categorias</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {testResults.protocolLinks?.totalLinks > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-neutral-textSecondary">Links</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {testResults.recommendations?.count > 0 ? '✅' : '❌'}
              </div>
              <p className="text-sm text-neutral-textSecondary">Recomendações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryTestPage;
