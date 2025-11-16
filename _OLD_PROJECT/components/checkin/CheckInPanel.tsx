import React, { useState, useEffect, useMemo } from 'react';
import { format, isSameDay, isAfter, isBefore, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { EnrichedAppointment } from '../../types';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  QrCode,
  User,
  Phone,
  Calendar,
  Timer,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInPanelProps {
  appointments: EnrichedAppointment[];
  onCheckIn: (appointmentId: string) => void;
  onGenerateQRCode: (appointmentId: string) => void;
  className?: string;
}

type CheckInStatus = 'waiting' | 'checked-in' | 'late' | 'no-show';

interface EnrichedAppointmentWithCheckIn extends EnrichedAppointment {
  checkInStatus: CheckInStatus;
  expectedArrival: Date;
  minutesUntil: number;
}

const CheckInPanel: React.FC<CheckInPanelProps> = ({
  appointments,
  onCheckIn,
  onGenerateQRCode,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(timer);
  }, []);

  // Filtrar apenas agendamentos de hoje
  const todayAppointments = useMemo(() => {
    const today = new Date();
    return appointments.filter(apt => isSameDay(apt.startTime, today));
  }, [appointments]);

  // Enriquecer com status de check-in
  const enrichedAppointments: EnrichedAppointmentWithCheckIn[] = useMemo(() => {
    return todayAppointments.map(apt => {
      const startTime = new Date(apt.startTime);
      const expectedArrival = addMinutes(startTime, -15); // Espera-se 15min antes
      const now = currentTime;
      const minutesUntil = Math.floor((startTime.getTime() - now.getTime()) / 60000);

      let checkInStatus: CheckInStatus = 'waiting';
      
      if (apt.status === 'completed') {
        checkInStatus = 'checked-in';
      } else if (apt.status === 'no-show') {
        checkInStatus = 'no-show';
      } else if (isAfter(now, startTime)) {
        checkInStatus = 'late';
      } else {
        checkInStatus = 'waiting';
      }

      return {
        ...apt,
        checkInStatus,
        expectedArrival,
        minutesUntil
      };
    });
  }, [todayAppointments, currentTime]);

  // Filtrar por busca
  const filteredAppointments = enrichedAppointments.filter(apt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(query) ||
      apt.therapistName?.toLowerCase().includes(query) ||
      apt.type.toLowerCase().includes(query)
    );
  });

  // Separar por status
  const waitingAppointments = filteredAppointments.filter(a => a.checkInStatus === 'waiting');
  const checkedInAppointments = filteredAppointments.filter(a => a.checkInStatus === 'checked-in');
  const lateAppointments = filteredAppointments.filter(a => a.checkInStatus === 'late');
  const noShowAppointments = filteredAppointments.filter(a => a.checkInStatus === 'no-show');

  // Próximas chegadas (próximas 2 horas)
  const upcomingAppointments = waitingAppointments
    .filter(a => a.minutesUntil <= 120 && a.minutesUntil >= -15)
    .sort((a, b) => a.minutesUntil - b.minutesUntil);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: CheckInStatus) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'waiting':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'late':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'no-show':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusIcon = (status: CheckInStatus) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="w-4 h-4" />;
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'late':
        return <AlertCircle className="w-4 h-4" />;
      case 'no-show':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: CheckInStatus) => {
    switch (status) {
      case 'checked-in':
        return 'Check-in Realizado';
      case 'waiting':
        return 'Aguardando';
      case 'late':
        return 'Atrasado';
      case 'no-show':
        return 'Faltou';
      default:
        return 'Aguardando';
    }
  };

  const renderAppointmentCard = (apt: EnrichedAppointmentWithCheckIn) => (
    <motion.div
      key={apt.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
    >
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="w-12 h-12 border-2 border-white shadow">
            <AvatarImage src={apt.patientAvatarUrl} alt={apt.patientName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
              {getInitials(apt.patientName)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-900">{apt.patientName}</h4>
                <p className="text-sm text-slate-600">{apt.type}</p>
              </div>
              <Badge className={cn("text-xs gap-1", getStatusColor(apt.checkInStatus))}>
                {getStatusIcon(apt.checkInStatus)}
                {getStatusText(apt.checkInStatus)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{format(apt.startTime, 'HH:mm')}</span>
                {apt.minutesUntil > 0 && apt.checkInStatus === 'waiting' && (
                  <span className="text-xs text-blue-600">
                    (em {apt.minutesUntil} min)
                  </span>
                )}
                {apt.minutesUntil < 0 && apt.checkInStatus === 'late' && (
                  <span className="text-xs text-orange-600">
                    ({Math.abs(apt.minutesUntil)} min atraso)
                  </span>
                )}
              </div>
              
              {apt.therapistName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{apt.therapistName}</span>
                </div>
              )}
              
              {apt.patientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{apt.patientPhone}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {apt.checkInStatus === 'waiting' && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => onCheckIn(apt.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Fazer Check-in
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGenerateQRCode(apt.id)}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Painel de Recepção</h2>
          <p className="text-sm text-slate-600 mt-1">
            {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })} • {format(currentTime, 'HH:mm')}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{waitingAppointments.length}</div>
            <div className="text-xs text-slate-600">Aguardando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{checkedInAppointments.length}</div>
            <div className="text-xs text-slate-600">Check-in</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{lateAppointments.length}</div>
            <div className="text-xs text-slate-600">Atrasados</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar paciente, terapeuta ou tipo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Upcoming Arrivals - Destaque */}
      {upcomingAppointments.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Próximas Chegadas</h3>
            <Badge className="bg-blue-600">{upcomingAppointments.length}</Badge>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {upcomingAppointments.slice(0, 3).map(apt => renderAppointmentCard(apt))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Todos ({filteredAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="waiting">
            <Clock className="w-4 h-4 mr-2" />
            Aguardando ({waitingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="checked-in">
            <CheckCircle className="w-4 h-4 mr-2" />
            Check-in ({checkedInAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="late">
            <AlertCircle className="w-4 h-4 mr-2" />
            Atrasados ({lateAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          <AnimatePresence>
            {filteredAppointments.map(apt => renderAppointmentCard(apt))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-3 mt-4">
          <AnimatePresence>
            {waitingAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum paciente aguardando</p>
              </div>
            ) : (
              waitingAppointments.map(apt => renderAppointmentCard(apt))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="checked-in" className="space-y-3 mt-4">
          <AnimatePresence>
            {checkedInAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum check-in realizado ainda</p>
              </div>
            ) : (
              checkedInAppointments.map(apt => renderAppointmentCard(apt))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="late" className="space-y-3 mt-4">
          <AnimatePresence>
            {lateAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento atrasado</p>
              </div>
            ) : (
              lateAppointments.map(apt => renderAppointmentCard(apt))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckInPanel;


