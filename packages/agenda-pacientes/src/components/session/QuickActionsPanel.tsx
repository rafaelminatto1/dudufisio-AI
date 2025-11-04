/**
 * Quick Actions Panel Component
 * Componente para ações rápidas da sessão (Adicionar Foto, Anexar Documento, Ver Relatórios, Histórico Completo)
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  Camera, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Loader,
  Upload,
  Image,
  File,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { quickActionsService, QuickActionPhoto, QuickActionDocument, QuickActionReport, CompleteHistoryEntry } from '../../services/quickActionsService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface QuickActionsPanelProps {
  sessionId: string;
  patientId: string;
  onPhotoAdded?: (photo: QuickActionPhoto) => void;
  onDocumentAttached?: (document: QuickActionDocument) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  sessionId,
  patientId,
  onPhotoAdded,
  onDocumentAttached
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Estados para fotos
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCategory, setPhotoCategory] = useState<QuickActionPhoto['category']>('during');
  const [photoDescription, setPhotoDescription] = useState('');
  
  // Estados para documentos
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<QuickActionDocument['type']>('other');
  const [documentDescription, setDocumentDescription] = useState('');
  
  // Estados para dados
  const [reports, setReports] = useState<QuickActionReport[]>([]);
  const [history, setHistory] = useState<CompleteHistoryEntry[]>([]);
  const [photos, setPhotos] = useState<QuickActionPhoto[]>([]);
  const [documents, setDocuments] = useState<QuickActionDocument[]>([]);

  const handleAddPhoto = async () => {
    if (!photoFile) {
      showToast('Selecione uma foto', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Simular upload - em produção, usar serviço de upload real
      const photoUrl = URL.createObjectURL(photoFile);
      
      const photo = await quickActionsService.addPhoto(
        sessionId,
        patientId,
        {
          name: photoFile.name,
          url: photoUrl,
          description: photoDescription,
          category: photoCategory
        },
        'therapist' // Em produção, pegar do contexto do usuário
      );

      showToast('Foto adicionada com sucesso!', 'success');
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setPhotoDescription('');
      
      if (onPhotoAdded) {
        onPhotoAdded(photo);
      }
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      showToast('Erro ao adicionar foto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachDocument = async () => {
    if (!documentFile) {
      showToast('Selecione um documento', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Simular upload - em produção, usar serviço de upload real
      const documentUrl = URL.createObjectURL(documentFile);
      
      const document = await quickActionsService.attachDocument(
        sessionId,
        patientId,
        {
          name: documentFile.name,
          url: documentUrl,
          size: documentFile.size,
          type: documentType,
          description: documentDescription
        },
        'therapist' // Em produção, pegar do contexto do usuário
      );

      showToast('Documento anexado com sucesso!', 'success');
      setDocumentDialogOpen(false);
      setDocumentFile(null);
      setDocumentDescription('');
      
      if (onDocumentAttached) {
        onDocumentAttached(document);
      }
    } catch (error) {
      console.error('Erro ao anexar documento:', error);
      showToast('Erro ao anexar documento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReports = async () => {
    setIsLoading(true);
    try {
      const sessionReports = await quickActionsService.getSessionReports(sessionId);
      setReports(sessionReports);
      setReportsDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      showToast('Erro ao carregar relatórios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompleteHistory = async () => {
    setIsLoading(true);
    try {
      const completeHistory = await quickActionsService.getCompleteHistory(patientId);
      setHistory(completeHistory);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showToast('Erro ao carregar histórico', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await quickActionsService.deletePhoto(photoId);
      showToast('Foto removida com sucesso!', 'success');
      // Recarregar fotos
      const sessionPhotos = await quickActionsService.getSessionPhotos(sessionId);
      setPhotos(sessionPhotos);
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      showToast('Erro ao remover foto', 'error');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await quickActionsService.deleteDocument(documentId);
      showToast('Documento removido com sucesso!', 'success');
      // Recarregar documentos
      const sessionDocuments = await quickActionsService.getSessionDocuments(sessionId);
      setDocuments(sessionDocuments);
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      showToast('Erro ao remover documento', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session': return '🏥';
      case 'appointment': return '📅';
      case 'note': return '📝';
      case 'assessment': return '📊';
      case 'exercise': return '💪';
      case 'communication': return '💬';
      default: return '📄';
    }
  };

  return (
    <>
      {/* Painel de Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-yellow-600" />
            <span>Ações Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Adicionar Foto */}
          <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Camera className="h-4 w-4 mr-2" />
                Adicionar Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Foto</DialogTitle>
                <DialogDescription>
                  Adicione uma foto à sessão para documentar o progresso.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo-file">Selecionar Foto</Label>
                  <Input
                    id="photo-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo-category">Categoria</Label>
                  <Select value={photoCategory} onValueChange={(value: any) => setPhotoCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Antes da Sessão</SelectItem>
                      <SelectItem value="during">Durante a Sessão</SelectItem>
                      <SelectItem value="after">Após a Sessão</SelectItem>
                      <SelectItem value="exercise">Exercício</SelectItem>
                      <SelectItem value="assessment">Avaliação</SelectItem>
                      <SelectItem value="progress">Progresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo-description">Descrição (opcional)</Label>
                  <Textarea
                    id="photo-description"
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Descreva a foto..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPhotoDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddPhoto}
                    disabled={isLoading || !photoFile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Adicionar Foto
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Anexar Documento */}
          <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Anexar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Anexar Documento</DialogTitle>
                <DialogDescription>
                  Anexe um documento relevante à sessão.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-file">Selecionar Documento</Label>
                  <Input
                    id="document-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-type">Tipo</Label>
                  <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Receita</SelectItem>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="report">Relatório</SelectItem>
                      <SelectItem value="protocol">Protocolo</SelectItem>
                      <SelectItem value="exercise_guide">Guia de Exercício</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-description">Descrição (opcional)</Label>
                  <Textarea
                    id="document-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Descreva o documento..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDocumentDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAttachDocument}
                    disabled={isLoading || !documentFile}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Anexando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Anexar Documento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Ver Relatórios */}
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleViewReports}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Ver Relatórios
          </Button>

          {/* Histórico Completo */}
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleViewCompleteHistory}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            Histórico Completo
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de Relatórios */}
      <Dialog open={reportsDialogOpen} onOpenChange={setReportsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatórios da Sessão</DialogTitle>
            <DialogDescription>
              Relatórios gerados para esta sessão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                Nenhum relatório encontrado para esta sessão.
              </p>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={report.isAutomated ? "secondary" : "default"}>
                          {report.isAutomated ? "Automático" : "Manual"}
                        </Badge>
                        <Badge variant="outline">
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {formatDate(report.generatedAt)} - {report.generatedBy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded-md">
                        {report.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico Completo */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico Completo do Paciente</DialogTitle>
            <DialogDescription>
              Todas as interações e registros do paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                Nenhum histórico encontrado.
              </p>
            ) : (
              history.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getTypeIcon(entry.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-900">{entry.title}</h3>
                          <span className="text-sm text-slate-500">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActionsPanel;
