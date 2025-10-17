import React, { useState, useMemo } from 'react';
import { Users, Calendar, Clock, AlertCircle, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { WaitlistEntry, Patient, Therapist } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface WaitlistManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entries: WaitlistEntry[];
  patients: Patient[];
  therapists: Therapist[];
  onSchedule: (entry: WaitlistEntry) => void;
  onEdit: (entry: WaitlistEntry) => void;
  onDelete: (entryId: string) => void;
}

const WaitlistManagerDialog: React.FC<WaitlistManagerDialogProps> = ({
  isOpen,
  onClose,
  entries,
  patients,
  therapists,
  onSchedule,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<number | null>(null);
  const [therapistFilter, setTherapistFilter] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const patient = patients.find(p => p.id === entry.patientId);
      const matchesSearch = !searchTerm || 
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.cpf?.includes(searchTerm);
      
      const matchesUrgency = urgencyFilter === null || entry.urgency === urgencyFilter;
      const matchesTherapist = therapistFilter === null || entry.therapistId === therapistFilter;

      return matchesSearch && matchesUrgency && matchesTherapist;
    });
  }, [entries, patients, searchTerm, urgencyFilter, therapistFilter]);

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 5) return 'bg-red-100 text-red-700 border-red-200';
    if (urgency >= 4) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (urgency >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getUrgencyLabel = (urgency: number) => {
    if (urgency >= 5) return 'Crítica';
    if (urgency >= 4) return 'Alta';
    if (urgency >= 3) return 'Média';
    return 'Baixa';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciador de Lista de Espera
          </DialogTitle>
          <DialogDescription>
            Gerencie todos os pacientes aguardando por agendamento
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-3 pb-4 border-b">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={urgencyFilter || ''}
              onChange={(e) => setUrgencyFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todas urgências</option>
              <option value="5">Crítica (5)</option>
              <option value="4">Alta (4)</option>
              <option value="3">Média (3)</option>
              <option value="2">Baixa (2-1)</option>
            </select>
            <select
              value={therapistFilter || ''}
              onChange={(e) => setTherapistFilter(e.target.value || null)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todos terapeutas</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhum paciente encontrado na lista de espera</p>
            </div>
          ) : (
            filteredEntries.map(entry => {
              const patient = patients.find(p => p.id === entry.patientId);
              const therapist = entry.therapistId 
                ? therapists.find(t => t.id === entry.therapistId)
                : null;

              return (
                <div
                  key={entry.id}
                  className="p-4 bg-white rounded-lg border border-slate-200 hover:border-sky-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">
                          {patient?.name || `Paciente #${entry.patientId.slice(-4)}`}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getUrgencyColor(entry.urgency))}
                        >
                          {getUrgencyLabel(entry.urgency)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-slate-600">
                        {entry.preferredStartFrom && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {format(new Date(entry.preferredStartFrom), 'dd/MM/yyyy', { locale: ptBR })}
                              {entry.preferredStartTo && 
                                ` - ${format(new Date(entry.preferredStartTo), 'dd/MM/yyyy', { locale: ptBR })}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {therapist && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{therapist.name}</span>
                          </div>
                        )}

                        {entry.notes && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span className="text-xs italic">{entry.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSchedule(entry)}
                        className="text-xs"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(entry)}
                        className="text-xs"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(entry.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            Total: {filteredEntries.length} de {entries.length} paciente(s)
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistManagerDialog;

