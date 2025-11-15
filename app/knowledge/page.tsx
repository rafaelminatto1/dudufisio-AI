/**
 * Página da Base de Conhecimento com RAG
 * Interface para chat e upload de documentos
 */

import { KnowledgeChat } from '@/components/KnowledgeChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, FileSearch, Zap } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Brain className="h-10 w-10 text-blue-500" />
          Base de Conhecimento
        </h1>
        <p className="text-lg text-muted-foreground">
          Assistente de IA treinado com literatura científica de fisioterapia
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSearch className="h-5 w-5 text-blue-500" />
              Busca Semântica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Encontre informações relevantes em toda a base de artigos e protocolos
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-500" />
              RAG com GPT-4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Respostas contextualizadas baseadas em evidências científicas
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-amber-500" />
              Fontes Citadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Todas as respostas incluem referências aos artigos originais
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <KnowledgeChat />
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Base de Conhecimento Atual
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                A base contém artigos científicos revisados por pares, protocolos clínicos,
                e guidelines de prática baseada em evidências. Todas as respostas são geradas
                exclusivamente a partir deste conteúdo verificado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

