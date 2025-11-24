'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Clock, Phone, Mail, UserPlus, Trash2 } from 'lucide-react';
import { formatDate, formatTime } from '~/lib/utils';
import { getWaitlist, addToWaitlist, removeFromWaitlist, notifyWaitlist } from '~/lib/actions/waitlist';
import { toast } from 'sonner';

interface WaitlistItem {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  preferred_date?: string;
  preferred_time?: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'active' | 'notified' | 'fulfilled';
  created_at: string;
}

export function WaitlistManager() {
  const [items, setItems] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'notified'>('all');

  const loadWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWaitlist({ status: filter === 'all' ? undefined : filter });
      if (result.data) {
        setItems(result.data as WaitlistItem[]);
      }
    } catch (error) {
      toast.error('Erro ao carregar lista de espera');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadWaitlist();
  }, [loadWaitlist]);

  const handleNotify = async (itemId: string) => {
    try {
      const result = await notifyWaitlist(itemId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Notificação enviada com sucesso!');
      loadWaitlist();
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const result = await removeFromWaitlist(itemId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Item removido da lista de espera');
      loadWaitlist();
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'destructive',
      high: 'default',
      normal: 'secondary',
    };
    return variants[priority as keyof typeof variants] || 'secondary';
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Espera</CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="notified">Notificados</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadWaitlist}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum item na lista de espera
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Data/Hora Preferida</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.patient_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {item.patient_phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadge(item.priority) as any}>
                      {item.priority === 'urgent' ? 'Urgente' : item.priority === 'high' ? 'Alta' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.preferred_date ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDate(item.preferred_date)}
                          {item.preferred_time && ` às ${formatTime(item.preferred_time)}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não especificado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status === 'active' ? 'Ativo' : item.status === 'notified' ? 'Notificado' : 'Atendido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotify(item.id)}
                        >
                          Notificar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

