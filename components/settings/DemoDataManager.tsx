import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Database, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { populateDemoData, clearDemoData, countDemoData, type DemoDataStats } from '../../services/demoDataService';
import { useToast } from '../../contexts/ToastContext';

const DemoDataManager: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DemoDataStats>({ patients: 0, appointments: 0, therapists: 0 });
  const [hasDemoData, setHasDemoData] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const currentStats = await countDemoData();
      setStats(currentStats);
      setHasDemoData(currentStats.patients > 0);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlePopulate = async () => {
    if (window.confirm('Deseja popular o banco com dados de demonstração? Isso adicionará 10 pacientes de exemplo.')) {
      setLoading(true);
      try {
        const result = await populateDemoData();
        showToast(`✅ Dados populados com sucesso! ${result.patients} pacientes criados.`, 'success');
        await loadStats();
      } catch (error: any) {
        showToast(`❌ Erro ao popular dados: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = async () => {
    if (window.confirm('⚠️ TEM CERTEZA? Isso removerá TODOS os dados de demonstração do banco de dados. Esta ação NÃO pode ser desfeita!')) {
      if (window.confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Você realmente deseja apagar todos os dados de demonstração?')) {
        setLoading(true);
        try {
          const result = await clearDemoData();
          showToast(`✅ Dados removidos com sucesso! ${result.patients} pacientes apagados.`, 'success');
          await loadStats();
        } catch (error: any) {
          showToast(`❌ Erro ao remover dados: ${error.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <Alert className={hasDemoData ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}>
        <div className="flex items-start gap-3">
          {hasDemoData ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-slate-400 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              {hasDemoData ? 'Dados de Demonstração Ativos' : 'Nenhum Dado de Demonstração'}
            </h4>
            <AlertDescription className="text-sm text-slate-600">
              {hasDemoData ? (
                <>
                  Existem <strong className="text-slate-900">{stats.patients} pacientes</strong> de demonstração no sistema.
                  Todos os registros de demonstração possuem o marcador <code className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">[DEMO]</code> no nome.
                </>
              ) : (
                'O sistema está vazio. Popule com dados de exemplo para testar as funcionalidades.'
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Botão Popular Dados */}
        <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Popular Dados</h3>
              <p className="text-xs text-slate-600 mt-1">
                Adiciona 10 pacientes de exemplo ao sistema para teste
              </p>
            </div>
            <Button
              onClick={handlePopulate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Populando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Popular Dados
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Botão Limpar Dados */}
        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50/50 p-4 hover:border-red-300 hover:bg-red-50 transition-all">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Limpar Dados</h3>
              <p className="text-xs text-slate-600 mt-1">
                Remove TODOS os dados de demonstração do banco (irreversível)
              </p>
            </div>
            <Button
              onClick={handleClear}
              disabled={loading || !hasDemoData}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-sm text-amber-800">
          <strong>⚠️ Atenção:</strong> Os dados de demonstração funcionam tanto em desenvolvimento quanto em produção.
          Use o botão "Limpar Tudo" para remover todos os registros de uma só vez quando terminar os testes.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DemoDataManager;
