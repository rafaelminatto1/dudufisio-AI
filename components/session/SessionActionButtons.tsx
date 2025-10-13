/**
 * Session Action Buttons Component
 * Componente para ações de sessão (Repetir e Ver histórico)
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Repeat, Eye, Loader } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { sessionHistoryService, SessionHistory } from '../../services/sessionHistoryService';
import { useNavigate } from 'react-router-dom';
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

interface SessionActionButtonsProps {
  sessionId: string;
  patientId: string;
  sessionNumber: number;
  onSessionRepeated?: (newSessionId: string) => void;
}

const SessionActionButtons: React.FC<SessionActionButtonsProps> = ({
  sessionId,
  patientId,
  sessionNumber,
  onSessionRepeated
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isRepeating, setIsRepeating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [repeatNotes, setRepeatNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sessionDetails, setSessionDetails] = useState<SessionHistory | null>(null);

  const handleRepeatSession = async () => {
    if (!selectedDate) {
      showToast('Selecione uma data para a nova sessão', 'warning');
      return;
    }

    setIsRepeating(true);
    try {
      // Criar dados do novo agendamento
      const newAppointmentData = {
        id: `appointment-${Date.now()}`,
        patientId,
        startTime: new Date(selectedDate).toISOString(),
        endTime: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000).toISOString(), // +1 hora
        type: 'session' as const,
        status: 'scheduled' as const,
        notes: repeatNotes || `Sessão repetida baseada na sessão #${sessionNumber}`
      };

      const newSession = await sessionHistoryService.repeatSession(sessionId, newAppointmentData);
      
      showToast('Sessão repetida com sucesso!', 'success');
      setRepeatDialogOpen(false);
      setRepeatNotes('');
      setSelectedDate('');
      
      if (onSessionRepeated) {
        onSessionRepeated(newSession.id);
      }
    } catch (error) {
      console.error('Erro ao repetir sessão:', error);
      showToast('Erro ao repetir sessão', 'error');
    } finally {
      setIsRepeating(false);
    }
  };

  const handleViewSession = async () => {
    setIsViewing(true);
    try {
      const details = await sessionHistoryService.getSessionDetails(sessionId);
      setSessionDetails(details.session);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
      showToast('Erro ao carregar detalhes da sessão', 'error');
    } finally {
      setIsViewing(false);
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <>
      {/* Botões de Ação */}
      <div className="flex items-center space-x-2">
        {/* Botão Repetir */}
        <Dialog open={repeatDialogOpen} onOpenChange={setRepeatDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-200 hover:bg-green-50"
              disabled={isRepeating}
            >
              {isRepeating ? (
                <Loader className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Repeat className="h-4 w-4 mr-1" />
              )}
              Repetir
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Repetir Sessão #{sessionNumber}</DialogTitle>
              <DialogDescription>
                Crie uma nova sessão baseada nesta sessão anterior.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-date">Data da Nova Sessão</Label>
                <input
                  id="session-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeat-notes">Observações (opcional)</Label>
                <Textarea
                  id="repeat-notes"
                  value={repeatNotes}
                  onChange={(e) => setRepeatNotes(e.target.value)}
                  placeholder="Adicione observações sobre a repetição da sessão..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setRepeatDialogOpen(false)}
                  disabled={isRepeating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRepeatSession}
                  disabled={isRepeating || !selectedDate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRepeating ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Repetindo...
                    </>
                  ) : (
                    <>
                      <Repeat className="h-4 w-4 mr-2" />
                      Repetir Sessão
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Botão Ver */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              disabled={isViewing}
              onClick={handleViewSession}
            >
              {isViewing ? (
                <Loader className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              Ver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Sessão #{sessionNumber}</DialogTitle>
              <DialogDescription>
                Informações completas sobre esta sessão.
              </DialogDescription>
            </DialogHeader>
            {sessionDetails && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Data</Label>
                    <p className="text-sm">{formatDate(sessionDetails.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Duração</Label>
                    <p className="text-sm">{sessionDetails.duration} minutos</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Status</Label>
                    <p className="text-sm capitalize">{sessionDetails.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Fisioterapeuta</Label>
                    <p className="text-sm">{sessionDetails.therapistId}</p>
                  </div>
                </div>

                {/* Notas */}
                {sessionDetails.notes && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Notas</Label>
                    <p className="text-sm bg-slate-50 p-3 rounded-md">{sessionDetails.notes}</p>
                  </div>
                )}

                {/* Anexos */}
                {sessionDetails.attachments && sessionDetails.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Anexos</Label>
                    <div className="space-y-2">
                      {sessionDetails.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{attachment.name}</span>
                            <span className="text-xs text-slate-500">({attachment.type})</span>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Visualizar
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default SessionActionButtons;
