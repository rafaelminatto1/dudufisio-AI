import React, { useState } from 'react';
import { MessageCircle, Calendar, FileText, Phone, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Patient } from '../../types';

interface QuickActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onWhatsApp?: (patientId: string, message: string) => void;
  onSchedule?: (patientId: string) => void;
  onAddNote?: (patientId: string, note: string) => void;
}

export const QuickActionDialog: React.FC<QuickActionDialogProps> = ({
  isOpen,
  onClose,
  patient,
  onWhatsApp,
  onSchedule,
  onAddNote,
}) => {
  const [activeAction, setActiveAction] = useState<'whatsapp' | 'schedule' | 'note' | null>(null);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');

  const handleClose = () => {
    setActiveAction(null);
    setMessage('');
    setNote('');
    onClose();
  };

  const handleWhatsApp = () => {
    if (patient && onWhatsApp && message.trim()) {
      onWhatsApp(patient.id, message);
      handleClose();
    }
  };

  const handleSchedule = () => {
    if (patient && onSchedule) {
      onSchedule(patient.id);
      handleClose();
    }
  };

  const handleAddNote = () => {
    if (patient && onAddNote && note.trim()) {
      onAddNote(patient.id, note);
      handleClose();
    }
  };

  const whatsappTemplates = [
    {
      label: 'Lembrete de Consulta',
      message: `Olá ${patient?.name.split(' ')[0]}, tudo bem? Estamos com saudades! Gostaria de agendar uma nova sessão de fisioterapia? Estamos à disposição.`,
    },
    {
      label: 'Follow-up',
      message: `Oi ${patient?.name.split(' ')[0]}! Como você está se sentindo? Notamos que faz algum tempo desde sua última sessão. Podemos ajudar?`,
    },
    {
      label: 'Reagendamento',
      message: `Olá ${patient?.name.split(' ')[0]}! Você tem disponibilidade para reagendar sua sessão? Temos alguns horários disponíveis esta semana.`,
    },
  ];

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ações Rápidas - {patient.name}</DialogTitle>
          <DialogDescription>
            Escolha uma ação para realizar com este paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!activeAction ? (
            // Menu de ações
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveAction('whatsapp')}
                className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-slate-900">WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveAction('schedule')}
                className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-slate-900">Agendar</span>
              </button>

              <button
                onClick={() => setActiveAction('note')}
                className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-slate-900">Adicionar Nota</span>
              </button>
            </div>
          ) : activeAction === 'whatsapp' ? (
            // WhatsApp
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Enviar WhatsApp</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveAction(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-900 font-medium">{patient.phone}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Templates Rápidos</Label>
                <div className="grid gap-2 mt-2">
                  {whatsappTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessage(template.message)}
                      className="text-left px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm transition-colors"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp-message" className="text-sm font-medium">
                  Mensagem
                </Label>
                <Textarea
                  id="whatsapp-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Voltar
                </Button>
                <Button onClick={handleWhatsApp} disabled={!message.trim()} className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              </DialogFooter>
            </div>
          ) : activeAction === 'schedule' ? (
            // Agendar
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Agendar Sessão</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveAction(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-slate-700 mb-4">
                  Você será redirecionado para a agenda para agendar uma nova sessão para {patient.name}.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Voltar
                </Button>
                <Button onClick={handleSchedule} className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ir para Agenda
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Adicionar Nota
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Adicionar Observação</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveAction(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="note-content" className="text-sm font-medium">
                  Observação
                </Label>
                <Textarea
                  id="note-content"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Paciente relatou melhora significativa..."
                  className="mt-2 min-h-[150px]"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Esta observação será adicionada ao histórico do paciente
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveAction(null)}>
                  Voltar
                </Button>
                <Button onClick={handleAddNote} disabled={!note.trim()} className="bg-purple-600 hover:bg-purple-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Salvar Observação
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>

        {!activeAction && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

