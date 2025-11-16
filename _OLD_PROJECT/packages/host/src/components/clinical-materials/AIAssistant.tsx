import React, { useState } from 'react';
import { Sparkles, Wand2, FileText, Languages, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import materialAIService from '../../services/materialAIService';

interface AIAssistantProps {
  onInsertContent: (content: string) => void;
  currentContent?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onInsertContent, currentContent }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'translate'>('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Generate tab state
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Protocolo Clínico');
  const [tone, setTone] = useState<'formal' | 'informal' | 'técnico' | 'didático'>('técnico');
  const [length, setLength] = useState<'curto' | 'médio' | 'longo'>('médio');

  // Improve tab state
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Translate tab state
  const [targetLanguage, setTargetLanguage] = useState('en');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Por favor, insira um tópico');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await materialAIService.generateMaterialContent(topic, category, {
        tone,
        length,
        includeReferences: true,
        targetAudience: 'profissionais',
      });

      if (response.success && response.content) {
        setResult(response.content);
      } else {
        setError(response.error || 'Erro ao gerar conteúdo');
      }
    } catch (err) {
      setError('Erro ao gerar conteúdo. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent) {
      setError('Não há conteúdo para melhorar');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await materialAIService.suggestImprovements(currentContent);

      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
        setResult(response.content || '');
      } else {
        setError(response.error || 'Erro ao gerar sugestões');
      }
    } catch (err) {
      setError('Erro ao gerar sugestões. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentContent) {
      setError('Não há conteúdo para traduzir');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await materialAIService.translateContent(currentContent, targetLanguage);

      if (response.success && response.content) {
        setResult(response.content);
      } else {
        setError(response.error || 'Erro ao traduzir conteúdo');
      }
    } catch (err) {
      setError('Erro ao traduzir conteúdo. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandSection = async (sectionTitle: string) => {
    if (!currentContent) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await materialAIService.expandSection(
        sectionTitle,
        currentContent,
        'Contexto geral do material'
      );

      if (response.success && response.content) {
        setResult(response.content);
      } else {
        setError(response.error || 'Erro ao expandir seção');
      }
    } catch (err) {
      setError('Erro ao expandir seção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Assistente de IA
        </h2>
        <p className="text-emerald-100 mt-2">
          Gere conteúdo, melhore textos e traduza materiais com inteligência artificial
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5 inline mr-2" />
          Gerar Conteúdo
        </button>
        <button
          onClick={() => setActiveTab('improve')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'improve'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Wand2 className="w-5 h-5 inline mr-2" />
          Melhorar
        </button>
        <button
          onClick={() => setActiveTab('translate')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'translate'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Languages className="w-5 h-5 inline mr-2" />
          Traduzir
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tópico *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Reabilitação pós-operatória de LCA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option>Protocolo Clínico</option>
                  <option>Escala de Avaliação</option>
                  <option>Material de Orientação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tom
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="técnico">Técnico</option>
                  <option value="formal">Formal</option>
                  <option value="didático">Didático</option>
                  <option value="informal">Informal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho do Conteúdo
              </label>
              <div className="flex gap-2">
                {(['curto', 'médio', 'longo'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setLength(size)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      length === size
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Conteúdo
                </>
              )}
            </button>
          </div>
        )}

        {/* Improve Tab */}
        {activeTab === 'improve' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                A IA analisará o conteúdo atual do material e sugerirá melhorias específicas.
              </p>
            </div>

            <button
              onClick={handleImprove}
              disabled={loading || !currentContent}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Analisar e Sugerir Melhorias
                </>
              )}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Sugestões de Melhoria:</h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Translate Tab */}
        {activeTab === 'translate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma de Destino
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
                <option value="de">Alemão</option>
                <option value="it">Italiano</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                O conteúdo atual do material será traduzido mantendo a formatação e terminologia técnica apropriada.
              </p>
            </div>

            <button
              onClick={handleTranslate}
              disabled={loading || !currentContent}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Traduzindo...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  Traduzir Conteúdo
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Resultado:</h4>
              <button
                onClick={() => onInsertContent(result)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                Inserir no Editor
              </button>
            </div>
            <div className="prose max-w-none p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;

