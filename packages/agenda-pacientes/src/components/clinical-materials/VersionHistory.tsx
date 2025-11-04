import React, { useState, useEffect } from 'react';
import { Clock, User, RotateCcw, Eye, GitCompare, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { MaterialVersion } from '../../types';
import materialVersionService from '../../services/materialVersionService';

interface VersionHistoryProps {
  materialId: string;
  onRestoreVersion?: (version: number) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ materialId, onRestoreVersion }) => {
  const [versions, setVersions] = useState<MaterialVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<MaterialVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<MaterialVersion | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadVersions();
    loadStatistics();
  }, [materialId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await materialVersionService.getVersionsByMaterialId(materialId);
      setVersions(data);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await materialVersionService.getVersionStatistics(materialId);
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleCompare = async (v1: MaterialVersion, v2: MaterialVersion) => {
    try {
      const result = await materialVersionService.compareVersions(materialId, v1.version, v2.version);
      setDiffResult(result);
      setCompareVersion(v1);
      setSelectedVersion(v2);
      setShowDiff(true);
    } catch (error) {
      console.error('Erro ao comparar versões:', error);
    }
  };

  const handleRestore = async (version: number) => {
    if (!confirm(`Tem certeza que deseja restaurar para a versão ${version}? Isso criará uma nova versão com o conteúdo restaurado.`)) {
      return;
    }

    try {
      await materialVersionService.restoreVersion(materialId, version);
      await loadVersions();
      if (onRestoreVersion) {
        onRestoreVersion(version);
      }
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header com estatísticas */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-600" />
          Histórico de Versões
        </h3>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{statistics.totalVersions}</div>
              <div className="text-sm text-blue-600">Total de Versões</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-700">{statistics.totalEditors}</div>
              <div className="text-sm text-emerald-600">Editores</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(statistics.averageTimeBetweenEdits)}
              </div>
              <div className="text-sm text-purple-600">Min. entre edições</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="text-sm text-orange-700 font-medium">
                {statistics.lastEditDate 
                  ? new Date(statistics.lastEditDate).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </div>
              <div className="text-sm text-orange-600">Última edição</div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de versões */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma versão disponível</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              version={version}
              isLatest={index === 0}
              onView={() => setSelectedVersion(version)}
              onRestore={() => handleRestore(version.version)}
              onCompare={(v) => {
                if (index < versions.length - 1) {
                  handleCompare(v, versions[index + 1]);
                }
              }}
              canCompare={index < versions.length - 1}
            />
          ))}
        </div>
      )}

      {/* Modal de visualização */}
      {selectedVersion && !showDiff && (
        <VersionModal
          version={selectedVersion}
          onClose={() => setSelectedVersion(null)}
          onRestore={() => handleRestore(selectedVersion.version)}
        />
      )}

      {/* Modal de diff */}
      {showDiff && diffResult && selectedVersion && compareVersion && (
        <DiffModal
          version1={compareVersion}
          version2={selectedVersion}
          diffResult={diffResult}
          onClose={() => {
            setShowDiff(false);
            setDiffResult(null);
            setCompareVersion(null);
            setSelectedVersion(null);
          }}
        />
      )}
    </div>
  );
};

interface VersionItemProps {
  version: MaterialVersion;
  isLatest: boolean;
  onView: () => void;
  onRestore: () => void;
  onCompare: (v: MaterialVersion) => void;
  canCompare: boolean;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isLatest,
  onView,
  onRestore,
  onCompare,
  canCompare,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${
      isLatest ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Badge da versão */}
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isLatest 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            v{version.version}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{version.createdBy}</span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {new Date(version.createdAt).toLocaleString('pt-BR')}
              </span>
              {isLatest && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded font-medium">
                  ATUAL
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{version.changes}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Visualizar"
          >
            <Eye className="w-5 h-5" />
          </button>

          {canCompare && (
            <button
              onClick={() => onCompare(version)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Comparar"
            >
              <GitCompare className="w-5 h-5" />
            </button>
          )}

          {!isLatest && (
            <button
              onClick={onRestore}
              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
              title="Restaurar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: version.content }} />
          </div>
        </div>
      )}
    </div>
  );
};

interface VersionModalProps {
  version: MaterialVersion;
  onClose: () => void;
  onRestore: () => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ version, onClose, onRestore }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Versão {version.version}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div>Por: {version.createdBy}</div>
            <div>Em: {new Date(version.createdAt).toLocaleString('pt-BR')}</div>
            <div>Mudanças: {version.changes}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: version.content }} />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onRestore();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar esta Versão
          </button>
        </div>
      </div>
    </div>
  );
};

interface DiffModalProps {
  version1: MaterialVersion;
  version2: MaterialVersion;
  diffResult: any;
  onClose: () => void;
}

const DiffModal: React.FC<DiffModalProps> = ({ version1, version2, diffResult, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-emerald-600" />
              Comparação de Versões
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded">
              v{version1.version}
            </span>
            <span>→</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
              v{version2.version}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Adicionado */}
            {diffResult.added.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Adicionado ({diffResult.added.length} linhas)
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  {diffResult.added.map((line: string, i: number) => (
                    <div key={i} className="text-sm font-mono text-green-800">
                      + {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removido */}
            {diffResult.removed.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Removido ({diffResult.removed.length} linhas)
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  {diffResult.removed.map((line: string, i: number) => (
                    <div key={i} className="text-sm font-mono text-red-800">
                      - {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modificado */}
            {diffResult.modified.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Modificado ({diffResult.modified.length} linhas)
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  {diffResult.modified.map((line: string, i: number) => (
                    <div key={i} className="text-sm font-mono text-yellow-800">
                      ~ {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Resumo das Mudanças</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{diffResult.added.length}</div>
                  <div className="text-sm text-gray-600">Adicionadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{diffResult.removed.length}</div>
                  <div className="text-sm text-gray-600">Removidas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{diffResult.modified.length}</div>
                  <div className="text-sm text-gray-600">Modificadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;

