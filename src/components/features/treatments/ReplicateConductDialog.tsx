'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Badge } from '~/components/ui/badge';
import { formatDate, formatDateTime } from '~/lib/utils';
import { Copy, Calendar } from 'lucide-react';
import { getPreviousSessions } from '~/lib/actions/sessions';

interface PreviousSession {
  id: string;
  session_date: string;
  session_number: number | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  conducts: any;
  created_at: string;
}

interface ReplicateConductDialogProps {
  patientId: string;
  currentSessionId?: string;
  onReplicate: (data: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    conducts?: any;
  }) => void;
  trigger?: React.ReactNode;
}

export function ReplicateConductDialog({
  patientId,
  currentSessionId,
  onReplicate,
  trigger,
}: ReplicateConductDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<PreviousSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<{
    subjective: boolean;
    objective: boolean;
    assessment: boolean;
    plan: boolean;
    conducts: boolean;
  }>({
    subjective: false,
    objective: false,
    assessment: false,
    plan: true, // Plano é o mais comum de replicar
    conducts: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && patientId) {
      loadPreviousSessions();
    }
  }, [open, patientId]);

  const loadPreviousSessions = async () => {
    setLoading(true);
    try {
      const result = await getPreviousSessions(patientId, currentSessionId, 10);

      if (result.error) {
        console.error('Erro ao carregar sessões:', result.error);
        return;
      }

      setSessions((result.data as PreviousSession[]) || []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplicate = () => {
    if (!selectedSession) return;

    const session = sessions.find((s) => s.id === selectedSession);
    if (!session) return;

    const dataToReplicate: any = {};

    if (selectedFields.subjective && session.subjective) {
      dataToReplicate.subjective = session.subjective;
    }
    if (selectedFields.objective && session.objective) {
      dataToReplicate.objective = session.objective;
    }
    if (selectedFields.assessment && session.assessment) {
      dataToReplicate.assessment = session.assessment;
    }
    if (selectedFields.plan && session.plan) {
      dataToReplicate.plan = session.plan;
    }
    if (selectedFields.conducts && session.conducts) {
      dataToReplicate.conducts = session.conducts;
    }

    onReplicate(dataToReplicate);
    setOpen(false);
  };

  const selectedSessionData = sessions.find((s) => s.id === selectedSession);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Replicar Conduta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Replicar Conduta de Sessão Anterior</DialogTitle>
          <DialogDescription>
            Selecione uma sessão anterior e escolha quais campos replicar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de sessões anteriores */}
          <div>
            <Label className="mb-2 block">Sessões Anteriores</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {loading ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Carregando sessões...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma sessão anterior encontrada
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession === session.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(session.session_date)}
                            {session.session_number && ` - Sessão #${session.session_number}`}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {formatDateTime(session.created_at)}
                        </Badge>
                      </div>
                      {session.plan && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {session.plan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Preview da sessão selecionada */}
          {selectedSessionData && (
            <div className="space-y-3 border-t pt-4">
              <Label>Campos para Replicar</Label>
              <div className="space-y-2">
                {selectedSessionData.subjective && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="replicate-subjective"
                      checked={selectedFields.subjective}
                      onCheckedChange={(checked) =>
                        setSelectedFields({
                          ...selectedFields,
                          subjective: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="replicate-subjective"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Subjetivo (S)</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {selectedSessionData.subjective}
                      </div>
                    </Label>
                  </div>
                )}

                {selectedSessionData.objective && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="replicate-objective"
                      checked={selectedFields.objective}
                      onCheckedChange={(checked) =>
                        setSelectedFields({
                          ...selectedFields,
                          objective: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="replicate-objective"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Objetivo (O)</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {selectedSessionData.objective}
                      </div>
                    </Label>
                  </div>
                )}

                {selectedSessionData.assessment && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="replicate-assessment"
                      checked={selectedFields.assessment}
                      onCheckedChange={(checked) =>
                        setSelectedFields({
                          ...selectedFields,
                          assessment: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="replicate-assessment"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Avaliação (A)</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {selectedSessionData.assessment}
                      </div>
                    </Label>
                  </div>
                )}

                {selectedSessionData.plan && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="replicate-plan"
                      checked={selectedFields.plan}
                      onCheckedChange={(checked) =>
                        setSelectedFields({
                          ...selectedFields,
                          plan: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="replicate-plan" className="cursor-pointer flex-1">
                      <div className="font-medium">Plano (P)</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {selectedSessionData.plan}
                      </div>
                    </Label>
                  </div>
                )}

                {selectedSessionData.conducts && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="replicate-conducts"
                      checked={selectedFields.conducts}
                      onCheckedChange={(checked) =>
                        setSelectedFields({
                          ...selectedFields,
                          conducts: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="replicate-conducts"
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">Condutas Estruturadas</div>
                      <div className="text-xs text-muted-foreground">
                        {Array.isArray(selectedSessionData.conducts)
                          ? `${selectedSessionData.conducts.length} procedimento(s)`
                          : 'Condutas aplicadas'}
                      </div>
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleReplicate}
            disabled={!selectedSession}
          >
            <Copy className="mr-2 h-4 w-4" />
            Replicar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

